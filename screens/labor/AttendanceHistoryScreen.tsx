// screens/labor/AttendanceHistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, Alert, View } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AttendanceHistoryScreenNavigationProp, AttendanceHistoryScreenRouteProp } from '../../types/navigation';
import { DailyLaborSummary, LaborAttendance, Labor } from '../../types/labor';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { LaborService } from '../../services/LaborService';

interface Props {
  navigation: AttendanceHistoryScreenNavigationProp;
  route: AttendanceHistoryScreenRouteProp;
}

const Header = styled.View`
  background-color: ${colors.white};
  padding: ${spacing.lg}px;
  margin: 0 -${spacing.lg}px ${spacing.md}px -${spacing.lg}px;
  border-bottom-left-radius: ${borderRadius.xl}px;
  border-bottom-right-radius: ${borderRadius.xl}px;
  ${shadows.medium};
`;

const HeaderContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.round}px;
  justify-content: center;
  align-items: center;
`;

const HeaderText = styled.View`
  flex: 1;
  align-items: center;
`;

const Title = styled.Text`
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.gray[900]};
`;

const Subtitle = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  margin-top: ${spacing.xs}px;
`;

const Spacer = styled.View`
  width: 40px;
`;

const FilterSection = styled.View`
  flex-direction: row;
  margin-bottom: ${spacing.lg}px;
  gap: ${spacing.sm}px;
`;

const FilterButton = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  background-color: ${props => props.active ? colors.primary : colors.gray[100]};
  padding: ${spacing.sm}px ${spacing.md}px;
  border-radius: ${borderRadius.lg}px;
  align-items: center;
`;

const FilterText = styled.Text<{ active: boolean }>`
  color: ${props => props.active ? colors.white : colors.gray[700]};
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
`;

const SummaryCard = styled(Card)`
  margin-bottom: ${spacing.sm}px;
`;

const SummaryHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.md}px;
`;

const DateText = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
`;

const TotalCostText = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.primary};
`;

const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${spacing.sm}px;
`;

const StatItem = styled.View`
  align-items: center;
  flex: 1;
`;

const StatValue = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.gray[900]};
`;

const StatLabel = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.gray[500]};
  text-transform: uppercase;
  margin-top: ${spacing.xs}px;
`;

const AttendanceList = styled.View`
  margin-top: ${spacing.sm}px;
`;

const AttendanceItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.sm}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.gray[200]};
`;

const LaborInfo = styled.View`
  flex: 1;
`;

const LaborName = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.gray[900]};
`;

const LaborRole = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
`;

const AttendanceInfo = styled.View`
  align-items: flex-end;
`;

const StatusBadge = styled.View<{ present: boolean }>`
  background-color: ${props => props.present ? colors.success : colors.error};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
  margin-bottom: ${spacing.xs}px;
`;

const StatusText = styled.Text`
  color: ${colors.white};
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
`;

const HoursText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${spacing.xl}px;
`;

const EmptyText = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[500]};
  text-align: center;
  margin-top: ${spacing.md}px;
`;

type FilterPeriod = 'week' | 'month' | 'all';

export const AttendanceHistoryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { projectId } = route.params;
  const [attendanceHistory, setAttendanceHistory] = useState<DailyLaborSummary[]>([]);
  const [laborList, setLaborList] = useState<Labor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('week');

  useEffect(() => {
    loadAttendanceHistory();
  }, [projectId, filterPeriod]);

  useFocusEffect(
    React.useCallback(() => {
      loadAttendanceHistory(false);
    }, [projectId, filterPeriod])
  );

  const loadAttendanceHistory = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true);
      }

      // Load labor list for reference
      const laborData = await LaborService.getLaborByProject(projectId);
      setLaborList(laborData);

      // Calculate date range based on filter
      const endDate = new Date();
      const startDate = new Date();
      
      switch (filterPeriod) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case 'all':
          startDate.setFullYear(endDate.getFullYear() - 1); // Last year
          break;
      }

      // Get attendance history for the date range
      const history: DailyLaborSummary[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        const dailySummary = await LaborService.getDailyLaborSummary(projectId, dateString);
        
        if (dailySummary.attendance.length > 0) {
          history.push(dailySummary);
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Sort by date (most recent first)
      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAttendanceHistory(history);

    } catch (error) {
      console.error('Error loading attendance history:', error);
      Alert.alert('Error', 'Failed to load attendance history');
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number): string => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const getLaborById = (laborId: number): Labor | undefined => {
    return laborList.find(labor => labor.id === laborId);
  };

  const renderFilterButton = (period: FilterPeriod, label: string) => (
    <FilterButton
      key={period}
      active={filterPeriod === period}
      onPress={() => setFilterPeriod(period)}
    >
      <FilterText active={filterPeriod === period}>{label}</FilterText>
    </FilterButton>
  );

  const renderSummaryItem = ({ item }: { item: DailyLaborSummary }) => (
    <SummaryCard>
      <SummaryHeader>
        <DateText>{formatDate(item.date)}</DateText>
        <TotalCostText>{formatCurrency(item.totalCost)}</TotalCostText>
      </SummaryHeader>

      <StatsRow>
        <StatItem>
          <StatValue>{item.totalPresent}</StatValue>
          <StatLabel>Present</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{item.totalAbsent}</StatValue>
          <StatLabel>Absent</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{item.totalHours.toFixed(1)}</StatValue>
          <StatLabel>Total Hours</StatLabel>
        </StatItem>
      </StatsRow>

      <AttendanceList>
        {item.attendance.map((attendance) => {
          const labor = getLaborById(attendance.laborId);
          if (!labor) return null;

          return (
            <AttendanceItem key={attendance.id}>
              <LaborInfo>
                <LaborName>{labor.name}</LaborName>
                <LaborRole>{labor.role}</LaborRole>
              </LaborInfo>
              <AttendanceInfo>
                <StatusBadge present={attendance.isPresent}>
                  <StatusText>
                    {attendance.isPresent ? 'Present' : 'Absent'}
                  </StatusText>
                </StatusBadge>
                {attendance.isPresent && (
                  <HoursText>
                    {attendance.hoursWorked}h
                    {attendance.overtime > 0 && ` (+${attendance.overtime}h OT)`}
                  </HoursText>
                )}
              </AttendanceInfo>
            </AttendanceItem>
          );
        })}
      </AttendanceList>
    </SummaryCard>
  );

  const renderEmpty = () => (
    <EmptyContainer>
      <Ionicons name="calendar-outline" size={64} color={colors.gray[400]} />
      <EmptyText>
        No attendance records found for the selected period.
      </EmptyText>
    </EmptyContainer>
  );

  if (loading) {
    return (
      <Screen>
        <Header>
          <HeaderContent>
            <BackButton onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
            </BackButton>
            <HeaderText>
              <Title>Attendance History</Title>
              <Subtitle>Loading...</Subtitle>
            </HeaderText>
            <Spacer />
          </HeaderContent>
        </Header>
        <EmptyContainer>
          <Ionicons name="time-outline" size={64} color={colors.gray[400]} />
          <EmptyText>Loading attendance history...</EmptyText>
        </EmptyContainer>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header>
        <HeaderContent>
          <BackButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
          </BackButton>
          <HeaderText>
            <Title>Attendance History</Title>
            <Subtitle>Track team attendance</Subtitle>
          </HeaderText>
          <Spacer />
        </HeaderContent>
      </Header>

      <FilterSection>
        {renderFilterButton('week', 'Last Week')}
        {renderFilterButton('month', 'Last Month')}
        {renderFilterButton('all', 'All Time')}
      </FilterSection>

      <FlatList
        data={attendanceHistory}
        renderItem={renderSummaryItem}
        keyExtractor={(item) => item.date}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshing={loading}
        onRefresh={() => loadAttendanceHistory()}
      />
    </Screen>
  );
};
