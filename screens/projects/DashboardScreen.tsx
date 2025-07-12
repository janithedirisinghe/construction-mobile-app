// screens/projects/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreenNavigationProp, DashboardScreenRouteProp } from '../../types/navigation';
import { Project } from '../../types/project';
import { Expense } from '../../types/expense';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface Props {
  navigation: DashboardScreenNavigationProp;
  route: DashboardScreenRouteProp;
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

const ProjectCard = styled(Card)`
  margin-bottom: ${spacing.md}px;
`;

const ProjectHeader = styled.View`
  margin-bottom: ${spacing.md}px;
`;

const ProjectName = styled.Text`
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.gray[900]};
  margin-bottom: ${spacing.xs}px;
`;

const ProjectDates = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
`;

const BudgetSection = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${spacing.md}px;
`;

const BudgetItem = styled.View`
  flex: 1;
  align-items: center;
`;

const BudgetLabel = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.gray[500]};
  text-transform: uppercase;
  margin-bottom: ${spacing.xs}px;
`;

const BudgetValue = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
`;

const ProgressContainer = styled.View`
  margin-bottom: ${spacing.sm}px;
`;

const ProgressLabel = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${spacing.xs}px;
`;

const ProgressText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
`;

const ProgressBar = styled.View`
  height: 8px;
  background-color: ${colors.gray[200]};
  border-radius: ${borderRadius.round}px;
  overflow: hidden;
`;

const ProgressFill = styled.View<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background-color: ${props => props.percentage > 90 ? colors.error : props.percentage > 70 ? colors.warning : colors.success};
  border-radius: ${borderRadius.round}px;
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

const ExpensesSection = styled.View`
  flex: 1;
`;

const SectionTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
  margin-bottom: ${spacing.md}px;
`;

const ExpenseCard = styled(Card)`
  margin-bottom: ${spacing.sm}px;
`;

const ExpenseHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.xs}px;
`;

const ExpenseName = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
  flex: 1;
`;

const ExpenseAmount = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.primary};
`;

const ExpenseDetails = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ExpenseCategory = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  background-color: ${colors.gray[100]};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
  overflow: hidden;
`;

const ExpenseDate = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[500]};
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

// Mock data
const mockProject: Project = {
  id: 1,
  title: "Modern Villa Construction",
  startDate: "2024-01-15",
  endDate: "2024-12-15",
  targetBudget: 5000000,
  totalSpent: 3500000,
  userId: 1,
};

const mockExpenses: Expense[] = [
  {
    id: 1,
    title: "Cement and Steel",
    amount: 850000,
    category: "Materials",
    expenseDate: "2024-07-01",
    notes: "High-grade cement and steel bars",
    projectId: 1,
    createdAt: "2024-07-01T10:00:00Z",
  },
  {
    id: 2,
    title: "Construction Workers",
    amount: 1200000,
    category: "Labor",
    expenseDate: "2024-07-05",
    notes: "Monthly wages for construction team",
    projectId: 1,
    createdAt: "2024-07-05T14:30:00Z",
  },
  {
    id: 3,
    title: "Excavator Rental",
    amount: 450000,
    category: "Equipment Rental",
    expenseDate: "2024-07-08",
    notes: "3-day excavator rental for foundation",
    projectId: 1,
    createdAt: "2024-07-08T09:15:00Z",
  },
  {
    id: 4,
    title: "Transportation",
    amount: 125000,
    category: "Transport",
    expenseDate: "2024-07-10",
    notes: "Material delivery and equipment transport",
    projectId: 1,
    createdAt: "2024-07-10T16:45:00Z",
  },
];

export const DashboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const { projectId } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      // TODO: Implement actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProject(mockProject);
      setExpenses(mockExpenses);
    } catch (error) {
      console.error('Error loading project data:', error);
      Alert.alert('Error', 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateProgress = (spent: number, budget: number): number => {
    return Math.min((spent / budget) * 100, 100);
  };

  const handleAddExpense = () => {
    navigation.navigate('AddExpense', { projectId });
  };

  const handleLaborManagement = () => {
    navigation.navigate('LaborManagement', { projectId });
  };

  const handleDailyAttendance = () => {
    navigation.navigate('DailyAttendance', { projectId });
  };

  const handleExpensePress = (expense: Expense) => {
    navigation.navigate('ExpenseDetail', { 
      expenseId: expense.id, 
      projectId: expense.projectId 
    });
  };

  if (loading || !project) {
    return (
      <Screen>
        <EmptyContainer>
          <Ionicons name="time-outline" size={64} color={colors.gray[400]} />
          <EmptyText>Loading project...</EmptyText>
        </EmptyContainer>
      </Screen>
    );
  }

  const progress = calculateProgress(project.totalSpent || 0, project.targetBudget);
  const remaining = project.targetBudget - (project.totalSpent || 0);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header>
          <HeaderContent>
            <BackButton onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
            </BackButton>
            <HeaderText>
              <Title>Project Details</Title>
              <Subtitle>Monitor progress and expenses</Subtitle>
            </HeaderText>
            <Spacer />
          </HeaderContent>
        </Header>

        <ProjectCard>
          <ProjectHeader>
            <ProjectName>{project.title}</ProjectName>
            <ProjectDates>
              {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </ProjectDates>
          </ProjectHeader>

          <BudgetSection>
            <BudgetItem>
              <BudgetLabel>Budget</BudgetLabel>
              <BudgetValue>{formatCurrency(project.targetBudget)}</BudgetValue>
            </BudgetItem>
            <BudgetItem>
              <BudgetLabel>Spent</BudgetLabel>
              <BudgetValue>{formatCurrency(project.totalSpent || 0)}</BudgetValue>
            </BudgetItem>
            <BudgetItem>
              <BudgetLabel>Remaining</BudgetLabel>
              <BudgetValue style={{ color: remaining < 0 ? colors.error : colors.success }}>
                {formatCurrency(remaining)}
              </BudgetValue>
            </BudgetItem>
          </BudgetSection>

          <ProgressContainer>
            <ProgressLabel>
              <ProgressText>Budget Progress</ProgressText>
              <ProgressText>{progress.toFixed(1)}%</ProgressText>
            </ProgressLabel>
            <ProgressBar>
              <ProgressFill percentage={progress} />
            </ProgressBar>
          </ProgressContainer>
        </ProjectCard>

        <QuickActionsSection>
          <SectionTitle>Quick Actions</SectionTitle>
          <ActionRow>
            <ActionButton onPress={handleAddExpense}>
              <ActionIcon>
                <Ionicons name="receipt-outline" size={24} color={colors.primary} />
              </ActionIcon>
              <ActionText>Add{'\n'}Expense</ActionText>
            </ActionButton>
            
            <ActionButton onPress={handleLaborManagement}>
              <ActionIcon>
                <Ionicons name="people-outline" size={24} color={colors.primary} />
              </ActionIcon>
              <ActionText>Manage{'\n'}Labor</ActionText>
            </ActionButton>
            
            <ActionButton onPress={handleDailyAttendance}>
              <ActionIcon>
                <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
              </ActionIcon>
              <ActionText>Mark{'\n'}Attendance</ActionText>
            </ActionButton>
          </ActionRow>
        </QuickActionsSection>

        <ExpensesSection>
          <SectionTitle>Recent Expenses</SectionTitle>
          {expenses.length > 0 ? (
            expenses.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => handleExpensePress(item)}>
                <ExpenseCard>
                  <ExpenseHeader>
                    <ExpenseName>{item.title}</ExpenseName>
                    <ExpenseAmount>{formatCurrency(item.amount)}</ExpenseAmount>
                  </ExpenseHeader>
                  <ExpenseDetails>
                    <ExpenseCategory>{item.category}</ExpenseCategory>
                    <ExpenseDate>{formatDate(item.expenseDate)}</ExpenseDate>
                  </ExpenseDetails>
                </ExpenseCard>
              </TouchableOpacity>
            ))
          ) : (
            <EmptyContainer>
              <Ionicons name="receipt-outline" size={64} color={colors.gray[400]} />
              <EmptyText>No expenses recorded yet.{'\n'}Add your first expense!</EmptyText>
            </EmptyContainer>
          )}
        </ExpensesSection>
      </ScrollView>
    </Screen>
  );
};
