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
import { ProjectService } from '../../services/ProjectService';
import { ExpenseService } from '../../services/ExpenseService';
import { useFocusEffect } from '@react-navigation/native';

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
  margin-bottom: ${spacing.md}px;
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

const ViewAllButton = styled.TouchableOpacity`
  background-color: ${colors.white};
  padding: ${spacing.lg}px;
  border-radius: ${borderRadius.lg}px;
  margin-top: ${spacing.md}px;
  border: 2px solid ${colors.primary}20;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  ${shadows.medium};
`;

const ViewAllButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ViewAllButtonText = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.primary};
  margin-left: ${spacing.sm}px;
`;

const ViewAllButtonSubtext = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  margin-left: ${spacing.sm}px;
  margin-top: ${spacing.xs}px;
`;

const ViewAllButtonIcon = styled.View`
  width: 40px;
  height: 40px;
  background-color: ${colors.primary}15;
  border-radius: ${borderRadius.round}px;
  justify-content: center;
  align-items: center;
`;

const ViewAllButtonTextContainer = styled.View`
  flex: 1;
  margin-left: ${spacing.md}px;
`;

const ExpenseCount = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.primary};
  font-weight: ${typography.weights.bold};
  background-color: ${colors.primary}10;
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.round}px;
  overflow: hidden;
  margin-left: ${spacing.sm}px;
`;

export const DashboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const { projectId } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpensesCount, setTotalExpensesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadProjectData(false); // Don't show loading indicator when focusing
    }, [projectId])
  );

  const loadProjectData = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true);
      }
      
      // Load project details
      const projectData = await ProjectService.getProjectById(projectId);
      if (!projectData) {
        Alert.alert('Error', 'Project not found');
        navigation.goBack();
        return;
      }
      setProject(projectData);
      
      // Load recent expenses (limit to 5 most recent)
      const expensesData = await ExpenseService.getFilteredExpenses({}, 'date', projectId);
      setTotalExpensesCount(expensesData.length); // Store total count
      const recentExpenses = expensesData.slice(0, 5); // Show only 5 most recent
      setExpenses(recentExpenses);
      
    } catch (error) {
      console.error('Error loading project data:', error);
      Alert.alert('Error', 'Failed to load project data');
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
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



  const handleViewAllExpenses = () => {
    navigation.navigate('ExpenseList', { projectId });
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
            <>
              {expenses.map((item) => (
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
              ))}
              
              <ViewAllButton onPress={handleViewAllExpenses} activeOpacity={0.7}>
                <ViewAllButtonIcon>
                  <Ionicons name="list-outline" size={20} color={colors.primary} />
                </ViewAllButtonIcon>
                <ViewAllButtonTextContainer>
                  <ViewAllButtonContent>
                    <ViewAllButtonText>View All Expenses</ViewAllButtonText>
                    <ExpenseCount>{totalExpensesCount}</ExpenseCount>
                  </ViewAllButtonContent>
                  <ViewAllButtonSubtext>
                    See complete expense history and details
                  </ViewAllButtonSubtext>
                </ViewAllButtonTextContainer>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </ViewAllButton>
            </>
          ) : (
            <EmptyContainer>
              <Ionicons name="receipt-outline" size={64} color={colors.gray[400]} />
              <EmptyText>No expenses recorded yet.{'\n'}Add your first expense!</EmptyText>
              <Button
                title="Add First Expense"
                onPress={handleAddExpense}
                variant="primary"
              />
            </EmptyContainer>
          )}
        </ExpensesSection>
      </ScrollView>
    </Screen>
  );
};
