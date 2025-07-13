// screens/labor/DailyAttendanceScreen.tsx
import React, { useState, useEffect } from 'react';
import { FlatList, Alert, TextInput } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { DailyAttendanceScreenNavigationProp, DailyAttendanceScreenRouteProp } from '../../types/navigation';
import { Labor, LaborAttendance } from '../../types/labor';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { LaborService } from '../../services/LaborService';

interface Props {
  navigation: DailyAttendanceScreenNavigationProp;
  route: DailyAttendanceScreenRouteProp;
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

const Spacer = styled.View`
  width: 40px;
`;

const DateContainer = styled.View`
  background-color: ${colors.primary};
  padding: ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  margin-bottom: ${spacing.lg}px;
`;

const DateText = styled.Text`
  color: ${colors.white};
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  text-align: center;
`;

const SummaryCard = styled(Card)`
  margin-bottom: ${spacing.lg}px;
`;

const SummaryRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.sm}px;
`;

const SummaryLabel = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
`;

const SummaryValue = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
`;

const AttendanceCard = styled(Card)`
  margin-bottom: ${spacing.sm}px;
`;

const LaborRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const LaborDetails = styled.View`
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

const AttendanceControls = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing.sm}px;
`;

const HoursInputContainer = styled.View`
  align-items: center;
  margin-right: ${spacing.sm}px;
`;

const HoursLabel = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.gray[500]};
  margin-bottom: ${spacing.xs}px;
`;

const HoursInput = styled.TextInput`
  background-color: ${colors.gray[100]};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
  width: 60px;
  text-align: center;
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[900]};
`;

const AttendanceToggle = styled.TouchableOpacity<{ isPresent: boolean }>`
  width: 48px;
  height: 48px;
  background-color: ${props => props.isPresent ? colors.success : colors.gray[300]};
  border-radius: ${borderRadius.round}px;
  justify-content: center;
  align-items: center;
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

export const DailyAttendanceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { projectId } = route.params;
  const [laborers, setLaborers] = useState<Labor[]>([]);
  const [attendanceData, setAttendanceData] = useState<LaborAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayString = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    loadLaborData();
  }, [projectId]);

  const loadLaborData = async () => {
    try {
      setLoading(true);
      const laborData = await LaborService.getLaborByProject(projectId);
      setLaborers(laborData);
      
      // Initialize attendance data
      const todayISO = today.toISOString().split('T')[0];
      
      // Check if attendance already exists for today
      const existingAttendance = await LaborService.getAttendanceByDate(projectId, todayISO);
      
      if (existingAttendance.length > 0) {
        setAttendanceData(existingAttendance);
      } else {
        // Create initial attendance records for today
        const initialAttendance: LaborAttendance[] = laborData.map(laborer => ({
          id: 0, // Will be set by database
          laborId: laborer.id,
          date: todayISO,
          isPresent: false,
          hoursWorked: 8,
          overtime: 0,
          createdAt: new Date().toISOString(),
        }));
        setAttendanceData(initialAttendance);
      }
    } catch (error) {
      console.error('Error loading labor data:', error);
      Alert.alert('Error', 'Failed to load labor data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const toggleAttendance = (laborId: number) => {
    setAttendanceData(prev => 
      prev.map(attendance => 
        attendance.laborId === laborId 
          ? { ...attendance, isPresent: !attendance.isPresent }
          : attendance
      )
    );
  };

  const updateHours = (laborId: number, hours: string) => {
    const hoursNumber = parseFloat(hours) || 0;
    setAttendanceData(prev => 
      prev.map(attendance => 
        attendance.laborId === laborId 
          ? { 
              ...attendance, 
              hoursWorked: Math.min(Math.max(hoursNumber, 0), 24),
              overtime: Math.max(hoursNumber - 8, 0)
            }
          : attendance
      )
    );
  };

  const calculateDayCost = () => {
    return attendanceData
      .filter(a => a.isPresent)
      .reduce((sum, attendance) => {
        const laborer = laborers.find(l => l.id === attendance.laborId);
        if (!laborer) return sum;
        
        const regularHours = Math.min(attendance.hoursWorked, 8);
        const overtimeHours = Math.max(attendance.hoursWorked - 8, 0);
        const hourlyRate = laborer.dailyRate / 8;
        
        return sum + (regularHours * hourlyRate) + (overtimeHours * hourlyRate * 1.5);
      }, 0);
  };

  const saveAttendance = async () => {
    const presentWorkers = attendanceData.filter(a => a.isPresent);
    const totalCost = calculateDayCost();

    Alert.alert(
      'Confirm Attendance',
      `Save attendance for ${presentWorkers.length} workers?\n\nTotal Cost: ${formatCurrency(totalCost)}\n\nThis will create a labor expense entry for today.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: async () => {
            try {
              // Record attendance for each worker
              for (const attendance of attendanceData) {
                await LaborService.recordAttendance({
                  laborId: attendance.laborId,
                  date: attendance.date,
                  isPresent: attendance.isPresent,
                  hoursWorked: attendance.hoursWorked,
                  overtime: attendance.overtime,
                  notes: attendance.notes
                });
              }
              
              Alert.alert('Success', 'Attendance saved successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error saving attendance:', error);
              Alert.alert('Error', 'Failed to save attendance. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderAttendanceItem = ({ item }: { item: Labor }) => {
    const attendance = attendanceData.find(a => a.laborId === item.id);
    if (!attendance) return null;

    return (
      <AttendanceCard>
        <LaborRow>
          <LaborDetails>
            <LaborName>{item.name}</LaborName>
            <LaborRole>{item.role} • {formatCurrency(item.dailyRate)}/day</LaborRole>
          </LaborDetails>
          
          <AttendanceControls>
            <HoursInputContainer>
              <HoursLabel>Hours</HoursLabel>
              <HoursInput
                value={attendance.hoursWorked.toString()}
                onChangeText={(text) => updateHours(item.id, text)}
                keyboardType="numeric"
                placeholder="8"
                editable={attendance.isPresent}
              />
            </HoursInputContainer>
            
            <AttendanceToggle 
              isPresent={attendance.isPresent}
              onPress={() => toggleAttendance(item.id)}
            >
              <Ionicons 
                name={attendance.isPresent ? "checkmark" : "close"} 
                size={24} 
                color={colors.white} 
              />
            </AttendanceToggle>
          </AttendanceControls>
        </LaborRow>
      </AttendanceCard>
    );
  };

  if (loading) {
    return (
      <Screen>
        <EmptyContainer>
          <Ionicons name="time-outline" size={64} color={colors.gray[400]} />
          <EmptyText>Loading attendance...</EmptyText>
        </EmptyContainer>
      </Screen>
    );
  }

  const presentCount = attendanceData.filter(a => a.isPresent).length;
  const totalHours = attendanceData.filter(a => a.isPresent).reduce((sum, a) => sum + a.hoursWorked, 0);
  const totalCost = calculateDayCost();

  return (
    <Screen>
      <Header>
        <HeaderContent>
          <BackButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
          </BackButton>
          <HeaderText>
            <Title>Daily Attendance</Title>
            <Subtitle>Mark today's attendance</Subtitle>
          </HeaderText>
          <Spacer />
        </HeaderContent>
      </Header>

      <DateContainer>
        <DateText>{todayString}</DateText>
      </DateContainer>

      <SummaryCard>
        <SummaryRow>
          <SummaryLabel>Present Workers</SummaryLabel>
          <SummaryValue>{presentCount} of {laborers.length}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>Total Hours</SummaryLabel>
          <SummaryValue>{totalHours.toFixed(1)} hours</SummaryValue>
        </SummaryRow>
        <SummaryRow style={{ marginBottom: 0 }}>
          <SummaryLabel>Estimated Cost</SummaryLabel>
          <SummaryValue style={{ color: colors.primary }}>{formatCurrency(totalCost)}</SummaryValue>
        </SummaryRow>
      </SummaryCard>

      <FlatList
        data={laborers}
        renderItem={renderAttendanceItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      <Button
        title={`Save Attendance (${presentCount} workers)`}
        onPress={saveAttendance}
        disabled={presentCount === 0}
      />
    </Screen>
  );
};
