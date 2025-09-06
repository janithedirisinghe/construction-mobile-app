// screens/labor/LaborManagementScreen.tsx
import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, Alert } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../contexts/CurrencyContext';
import { LaborManagementScreenNavigationProp, LaborManagementScreenRouteProp } from '../../types/navigation';
import { Labor, LaborAttendance } from '../../types/labor';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { LaborService } from '../../services/LaborService';

interface Props {
  navigation: LaborManagementScreenNavigationProp;
  route: LaborManagementScreenRouteProp;
}

const Header = styled.View`
  background-color: ${colors.white};
  padding: ${spacing.lg}px;
  margin: 0 -${spacing.lg}px ${spacing.md}px -${spacing.lg}px;
  border-bottom-left-radius: ${borderRadius.xl}px;
  border-bottom-right-radius: ${borderRadius.xl}px;
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

const FilterButton = styled.TouchableOpacity<{ active: boolean }>`
  width: 40px;
  height: 40px;
  background-color: ${props => props.active ? colors.primary : colors.gray[100]};
  border-radius: ${borderRadius.round}px;
  justify-content: center;
  align-items: center;
  margin-right: ${spacing.sm}px;
`;

const HeaderActionRow = styled.View`
  flex-direction: row;
`;

const AddButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  background-color: ${colors.primary};
  border-radius: ${borderRadius.round}px;
  justify-content: center;
  align-items: center;
`;

const TabContainer = styled.View`
  flex-direction: row;
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.md}px;
  margin-bottom: ${spacing.lg}px;
  padding: ${spacing.xs}px;
`;

const Tab = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: ${spacing.sm}px;
  align-items: center;
  background-color: ${props => props.active ? colors.white : 'transparent'};
  border-radius: ${borderRadius.sm}px;
  ${props => props.active ? shadows.small : ''};
`;

const TabText = styled.Text<{ active: boolean }>`
  color: ${props => props.active ? colors.gray[900] : colors.gray[600]};
  font-weight: ${props => props.active ? typography.weights.semibold : typography.weights.medium};
  font-size: ${typography.sizes.sm}px;
`;

const LaborCard = styled(Card)`
  margin-bottom: ${spacing.sm}px;
`;

const LaborHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.sm}px;
`;

const LaborInfo = styled.View`
  flex: 1;
`;

const LaborName = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
`;

const LaborRole = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  margin-top: ${spacing.xs}px;
`;

const LaborRate = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.primary};
`;

const StatusBadge = styled.View<{ isActive: boolean }>`
  background-color: ${props => props.isActive ? colors.success : colors.error};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
  margin-top: ${spacing.xs}px;
`;

const StatusText = styled.Text`
  color: ${colors.white};
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
`;

const AttendanceContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${colors.gray[100]};
  padding: ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
`;

const AttendanceText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[700]};
`;

const AttendanceButton = styled.TouchableOpacity<{ isPresent: boolean }>`
  background-color: ${props => props.isPresent ? colors.success : colors.gray[300]};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
`;

const AttendanceButtonText = styled.Text<{ isPresent: boolean }>`
  color: ${props => props.isPresent ? colors.white : colors.gray[600]};
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
`;

const QuickActionsSection = styled.View`
  margin-bottom: ${spacing.lg}px;
`;

const ActionRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: ${spacing.sm}px;
`;

const ActionButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${colors.white};
  padding: ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  align-items: center;
  ${shadows.small};
`;

const ActionIcon = styled.View`
  width: 48px;
  height: 48px;
  background-color: ${colors.primary}20;
  border-radius: ${borderRadius.round}px;
  justify-content: center;
  align-items: center;
  margin-bottom: ${spacing.sm}px;
`;

const ActionText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.gray[900]};
  text-align: center;
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

export const LaborManagementScreen: React.FC<Props> = ({ navigation, route }) => {
  const { projectId } = route.params;
  const { t } = useTranslation();
  const { getCurrencySymbol } = useCurrency();
  const [activeTab, setActiveTab] = useState<'laborers' | 'attendance'>('laborers');
  const [laborers, setLaborers] = useState<Labor[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<LaborAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLaborData();
  }, [projectId]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadLaborData(false); // Don't show loading indicator when focusing
    }, [projectId, showInactive]) // Add showInactive as dependency
  );

  const loadLaborData = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true);
      }
      // Load laborers based on active/inactive filter
      const laborData = await LaborService.getLaborByProject(projectId, !showInactive);
      setLaborers(laborData);
      
      // Initialize today's attendance from database
      const today = new Date().toISOString().split('T')[0];
      const existingAttendance = await LaborService.getAttendanceByDate(projectId, today);
      
      if (existingAttendance.length > 0) {
        setTodayAttendance(existingAttendance);
      } else {
        // Create initial attendance records for today
        const initialAttendance: LaborAttendance[] = laborData.map(laborer => ({
          id: 0, // Will be set by database
          laborId: laborer.id,
          date: today,
          isPresent: false,
          hoursWorked: 8,
          overtime: 0,
          createdAt: new Date().toISOString(),
        }));
        setTodayAttendance(initialAttendance);
      }
    } catch (error) {
      console.error('Error loading labor data:', error);
      Alert.alert('Error', 'Failed to load labor data');
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
    }
  };

  const formatCurrency = (amount: number): string => {
    return `${getCurrencySymbol()} ${amount.toLocaleString()}`;
  };

  const toggleAttendance = (laborId: number) => {
    setTodayAttendance(prev => 
      prev.map(attendance => 
        attendance.laborId === laborId 
          ? { ...attendance, isPresent: !attendance.isPresent }
          : attendance
      )
    );
  };

  // Add useEffect to reload data when filter changes
  useEffect(() => {
    loadLaborData();
  }, [showInactive]);

  const handleAddLabor = () => {
    navigation.navigate('AddLabor', { projectId });
  };

  const handleDailyAttendance = () => {
    navigation.navigate('DailyAttendance', { projectId });
  };

  const handleAttendanceHistory = () => {
    navigation.navigate('AttendanceHistory', { projectId });
  };

  const renderLaborCard = ({ item }: { item: Labor }) => {
    const attendance = todayAttendance.find(a => a.laborId === item.id);
    const isPresent = attendance?.isPresent || false;

    return (
      <TouchableOpacity onPress={() => navigation.navigate('LaborDetail', { laborId: item.id, projectId })}>
        <LaborCard>
          <LaborHeader>
            <LaborInfo>
              <LaborName>{item.name}</LaborName>
              <LaborRole>{item.role}</LaborRole>
              {showInactive && (
                <StatusBadge isActive={item.isActive}>
                  <StatusText>{item.isActive ? t('labor.activeProjects') : 'Inactive'}</StatusText>
                </StatusBadge>
              )}
            </LaborInfo>
            <LaborRate>{formatCurrency(item.dailyRate)}/day</LaborRate>
          </LaborHeader>
          
          {activeTab === 'attendance' && item.isActive && (
            <AttendanceContainer>
              <AttendanceText>{t('labor.dailyAttendance')}</AttendanceText>
              <AttendanceButton 
                isPresent={isPresent}
                onPress={() => toggleAttendance(item.id)}
              >
                <AttendanceButtonText isPresent={isPresent}>
                  {isPresent ? t('labor.present') : t('labor.absent')}
                </AttendanceButtonText>
              </AttendanceButton>
            </AttendanceContainer>
          )}
        </LaborCard>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <EmptyContainer>
      <Ionicons name="people-outline" size={64} color={colors.gray[400]} />
      <EmptyText>
        {showInactive 
          ? t('labor.noWorkers')
          : t('labor.noWorkersMessage')
        }
      </EmptyText>
    </EmptyContainer>
  );

  if (loading) {
    return (
      <Screen>
        <EmptyContainer>
          <Ionicons name="time-outline" size={64} color={colors.gray[400]} />
          <EmptyText>{t('labor.loading')}</EmptyText>
        </EmptyContainer>
      </Screen>
    );
  }

  const activeLaborers = laborers.filter(l => l.isActive);
  const inactiveLaborers = laborers.filter(l => !l.isActive);
  const displayCount = showInactive ? inactiveLaborers.length : activeLaborers.length;
  const totalLaborers = showInactive ? inactiveLaborers.length : activeLaborers.length;
  
  const presentCount = todayAttendance.filter(a => a.isPresent).length;
  const totalCost = todayAttendance
    .filter(a => a.isPresent)
    .reduce((sum, a) => {
      const laborer = laborers.find(l => l.id === a.laborId);
      return sum + (laborer?.dailyRate || 0);
    }, 0);

  return (
    <Screen>
      <Header>
        <HeaderContent>
          <BackButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
          </BackButton>
          <HeaderText>
            <Title>{t('labor.title')}</Title>
            <Subtitle>{totalLaborers} {showInactive ? 'inactive' : 'active'} {t('labor.workers').toLowerCase()} • {presentCount} {t('labor.presentToday').toLowerCase()}</Subtitle>
          </HeaderText>
          <HeaderActionRow>
            <FilterButton 
              active={showInactive}
              onPress={() => setShowInactive(!showInactive)}
            >
              <Ionicons 
                name={showInactive ? "eye-off" : "eye"} 
                size={20} 
                color={showInactive ? colors.white : colors.gray[700]} 
              />
            </FilterButton>
            <AddButton onPress={handleAddLabor}>
              <Ionicons name="add" size={24} color={colors.white} />
            </AddButton>
          </HeaderActionRow>
        </HeaderContent>
      </Header>

      <QuickActionsSection>
        <ActionRow>
          <ActionButton onPress={handleDailyAttendance}>
            <ActionIcon>
              <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
            </ActionIcon>
            <ActionText>{t('labor.markAttendance').replace(' ', '\n')}</ActionText>
          </ActionButton>
          
          <ActionButton onPress={handleAttendanceHistory}>
            <ActionIcon>
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            </ActionIcon>
            <ActionText>{t('labor.attendanceHistory').replace(' ', '\n')}</ActionText>
          </ActionButton>
          
          <ActionButton onPress={handleAddLabor}>
            <ActionIcon>
              <Ionicons name="person-add-outline" size={24} color={colors.primary} />
            </ActionIcon>
            <ActionText>{t('labor.addWorker').replace(' ', '\n')}</ActionText>
          </ActionButton>
        </ActionRow>
      </QuickActionsSection>

      <TabContainer>
        <Tab 
          active={activeTab === 'laborers'} 
          onPress={() => setActiveTab('laborers')}
        >
          <TabText active={activeTab === 'laborers'}>{t('labor.workers')} ({laborers.length})</TabText>
        </Tab>
        <Tab 
          active={activeTab === 'attendance'} 
          onPress={() => setActiveTab('attendance')}
        >
          <TabText active={activeTab === 'attendance'}>{t('labor.attendance')}</TabText>
        </Tab>
      </TabContainer>

      <FlatList
        data={laborers}
        renderItem={renderLaborCard}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {activeTab === 'attendance' && presentCount > 0 && (
        <Card style={{ marginTop: spacing.md }}>
          <AttendanceText>{t('labor.totalWorkers')}: {presentCount} {t('labor.workers').toLowerCase()} • {formatCurrency(totalCost)}</AttendanceText>
        </Card>
      )}
    </Screen>
  );
};
