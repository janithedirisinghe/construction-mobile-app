// screens/labor/LaborDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LaborDetailScreenNavigationProp, LaborDetailScreenRouteProp } from '../../types/navigation';
import { Labor, LaborAttendance } from '../../types/labor';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { LaborService } from '../../services/LaborService';
import { useCurrency } from '../../contexts/CurrencyContext';

interface Props {
  navigation: LaborDetailScreenNavigationProp;
  route: LaborDetailScreenRouteProp;
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

const ActionButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.round}px;
  justify-content: center;
  align-items: center;
  margin-left: ${spacing.sm}px;
`;

const ActionRow = styled.View`
  flex-direction: row;
`;

const DetailCard = styled(Card)`
  margin-bottom: ${spacing.md}px;
`;

const SectionTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
  margin-bottom: ${spacing.md}px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.md}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.gray[200]};
`;

const InfoLabel = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  font-weight: ${typography.weights.medium};
`;

const InfoValue = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[900]};
  font-weight: ${typography.weights.medium};
  flex: 1;
  text-align: right;
`;

const HighlightValue = styled.Text`
  font-size: ${typography.sizes.lg}px;
  color: ${colors.primary};
  font-weight: ${typography.weights.bold};
  flex: 1;
  text-align: right;
`;

const StatusBadge = styled.View<{ isActive: boolean }>`
  background-color: ${props => props.isActive ? colors.success : colors.error};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
`;

const StatusText = styled.Text`
  color: ${colors.white};
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
`;

const StatsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${spacing.md}px;
`;

const StatCard = styled.View`
  flex: 1;
  background-color: ${colors.gray[100]};
  padding: ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  align-items: center;
  margin: 0 ${spacing.xs}px;
`;

const StatValue = styled.Text`
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.primary};
`;

const StatLabel = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.gray[600]};
  margin-top: ${spacing.xs}px;
  text-align: center;
`;

const ButtonWrapper = styled.View`
  flex: 1;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  gap: ${spacing.sm}px;
  margin-top: ${spacing.lg}px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${spacing.xl}px;
`;

const LoadingText = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[500]};
  text-align: center;
  margin-top: ${spacing.md}px;
`;

export const LaborDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { laborId, projectId } = route.params;
  const { getCurrencySymbol } = useCurrency();
  const [labor, setLabor] = useState<Labor | null>(null);
  const [attendanceStats, setAttendanceStats] = useState({
    totalDays: 0,
    presentDays: 0,
    totalHours: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLaborDetail();
  }, [laborId]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadLaborDetail(false); // Don't show loading indicator when focusing
    }, [laborId])
  );

  const loadLaborDetail = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true);
      }

      // Load labor details
      const laborData = await LaborService.getLaborById(laborId);
      if (!laborData) {
        Alert.alert('Error', 'Labor not found');
        navigation.goBack();
        return;
      }
      setLabor(laborData);

      // Load attendance statistics for the current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const attendance = await LaborService.getAttendanceByLabor(laborId, startOfMonth, endOfMonth);
      
      const stats = {
        totalDays: attendance.length,
        presentDays: attendance.filter(a => a.isPresent).length,
        totalHours: attendance.filter(a => a.isPresent).reduce((sum, a) => sum + a.hoursWorked, 0),
        totalEarnings: attendance.filter(a => a.isPresent).reduce((sum, a) => {
          const dailyEarning = (a.hoursWorked / 8) * laborData.dailyRate;
          const overtimeEarning = a.overtime * (laborData.dailyRate / 8) * 1.5;
          return sum + dailyEarning + overtimeEarning;
        }, 0)
      };
      
      setAttendanceStats(stats);
    } catch (error) {
      console.error('Error loading labor detail:', error);
      Alert.alert('Error', 'Failed to load labor details');
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
    }
  };

  const formatCurrency = (amount: number): string => {
    return `${getCurrencySymbol()} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleEdit = () => {
    navigation.navigate('EditLabor', { laborId, projectId });
  };

  const handleReactivate = async () => {
    if (!labor) return;

    Alert.alert(
      'Reactivate Laborer',
      `Are you sure you want to reactivate ${labor.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reactivate',
          onPress: async () => {
            try {
              await LaborService.reactivateLabor(laborId);
              Alert.alert('Success', 'Laborer reactivated successfully');
              loadLaborDetail(); // Refresh data
            } catch (error) {
              console.error('Error reactivating labor:', error);
              Alert.alert('Error', 'Failed to reactivate laborer');
            }
          }
        }
      ]
    );
  };

  const handleDelete = async () => {
    if (!labor) return;

    try {
      // Check if labor can be deleted
      const { canDelete, reason } = await LaborService.canDeleteLabor(laborId);
      
      if (!canDelete) {
        Alert.alert(
          'Cannot Delete',
          reason || 'This laborer cannot be deleted due to existing records.',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Delete Laborer',
        `Are you sure you want to delete ${labor.name}? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await LaborService.deleteLabor(laborId);
                Alert.alert('Success', 'Laborer deleted successfully');
                navigation.goBack();
              } catch (error) {
                console.error('Error deleting labor:', error);
                Alert.alert('Error', 'Failed to delete laborer');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error checking labor dependencies:', error);
      Alert.alert('Error', 'Failed to check if laborer can be deleted');
    }
  };

  const handleViewAttendance = () => {
    navigation.navigate('AttendanceHistory', { projectId });
  };

  if (loading) {
    return (
      <Screen>
        <LoadingContainer>
          <Ionicons name="person-outline" size={64} color={colors.gray[400]} />
          <LoadingText>Loading laborer details...</LoadingText>
        </LoadingContainer>
      </Screen>
    );
  }

  if (!labor) {
    return (
      <Screen>
        <LoadingContainer>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <LoadingText>Laborer not found</LoadingText>
        </LoadingContainer>
      </Screen>
    );
  }

  const attendancePercentage = attendanceStats.totalDays > 0 
    ? Math.round((attendanceStats.presentDays / attendanceStats.totalDays) * 100)
    : 0;

  return (
    <Screen>
      <Header>
        <HeaderContent>
          <BackButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
          </BackButton>
          <HeaderText>
            <Title>{labor.name}</Title>
            <Subtitle>{labor.role}</Subtitle>
          </HeaderText>
          <ActionRow>
            <ActionButton onPress={handleEdit}>
              <Ionicons name="create-outline" size={20} color={colors.gray[700]} />
            </ActionButton>
            <ActionButton onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </ActionButton>
          </ActionRow>
        </HeaderContent>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <DetailCard>
          <SectionTitle>Basic Information</SectionTitle>
          
          <InfoRow style={{ borderBottomWidth: 0 }}>
            <InfoLabel>Status</InfoLabel>
            <StatusBadge isActive={labor.isActive}>
              <StatusText>{labor.isActive ? 'Active' : 'Inactive'}</StatusText>
            </StatusBadge>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Role</InfoLabel>
            <InfoValue>{labor.role}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Daily Rate</InfoLabel>
            <HighlightValue>{formatCurrency(labor.dailyRate)}</HighlightValue>
          </InfoRow>
          
          {labor.contactNumber && (
            <InfoRow>
              <InfoLabel>Contact</InfoLabel>
              <InfoValue>{labor.contactNumber}</InfoValue>
            </InfoRow>
          )}
          
          <InfoRow style={{ borderBottomWidth: 0 }}>
            <InfoLabel>Joined Date</InfoLabel>
            <InfoValue>{formatDate(labor.createdAt)}</InfoValue>
          </InfoRow>
        </DetailCard>

        {/* Monthly Statistics */}
        <DetailCard>
          <SectionTitle>This Month's Performance</SectionTitle>
          
          <StatsContainer>
            <StatCard>
              <StatValue>{attendanceStats.presentDays}</StatValue>
              <StatLabel>Days{'\n'}Present</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{attendancePercentage}%</StatValue>
              <StatLabel>Attendance{'\n'}Rate</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{attendanceStats.totalHours}</StatValue>
              <StatLabel>Total{'\n'}Hours</StatLabel>
            </StatCard>
          </StatsContainer>
          
          <InfoRow style={{ marginTop: spacing.md, borderBottomWidth: 0 }}>
            <InfoLabel>Monthly Earnings</InfoLabel>
            <HighlightValue>{formatCurrency(attendanceStats.totalEarnings)}</HighlightValue>
          </InfoRow>
        </DetailCard>

        {/* Action Buttons */}
        <ButtonRow>
          <ButtonWrapper>
            <Button
              title="View Attendance"
              onPress={handleViewAttendance}
              variant="outline"
            />
          </ButtonWrapper>
          <ButtonWrapper>
            <Button
              title={labor.isActive ? "Edit Details" : "Reactivate"}
              onPress={labor.isActive ? handleEdit : handleReactivate}
            />
          </ButtonWrapper>
        </ButtonRow>
      </ScrollView>
    </Screen>
  );
};
