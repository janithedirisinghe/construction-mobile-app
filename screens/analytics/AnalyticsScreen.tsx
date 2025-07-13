import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AnalyticsScreenNavigationProp } from '../../types/navigation';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { ProjectService } from '../../services/ProjectService';
import { ExpenseService } from '../../services/ExpenseService';
import { Project } from '../../types/project';
import { Expense } from '../../types/expense';

const Header = styled.View`
  background-color: ${colors.white};
  padding: ${spacing.lg}px;
  margin: 0 -${spacing.lg}px ${spacing.md}px -${spacing.lg}px;
  border-bottom-left-radius: ${borderRadius.xl}px;
  border-bottom-right-radius: ${borderRadius.xl}px;
  ${shadows.medium};
`;

const HeaderContent = styled.View`
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

const StatsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 -${spacing.xs}px;
  margin-bottom: ${spacing.lg}px;
`;

const StatCard = styled(Card)`
  flex: 1;
  min-width: 48%;
  margin: ${spacing.xs}px;
`;

const StatHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing.md}px;
`;

const StatIconContainer = styled.View`
  width: 44px;
  height: 44px;
  border-radius: ${borderRadius.md}px;
  justify-content: center;
  align-items: center;
`;

const StatValue = styled.Text`
  font-size: ${typography.sizes.xxl}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.gray[900]};
  margin-bottom: ${spacing.xs}px;
`;

const StatLabel = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  font-weight: ${typography.weights.medium};
  margin-bottom: ${spacing.xs}px;
`;

const StatChange = styled.Text<{ positive: boolean }>`
  font-size: ${typography.sizes.xs}px;
  color: ${props => props.positive ? colors.success : colors.error};
  font-weight: ${typography.weights.semibold};
`;

const ChartSection = styled.View`
  margin-bottom: ${spacing.lg}px;
`;

const SectionTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
  margin-bottom: ${spacing.md}px;
`;

const ProgressContainer = styled.View`
  margin-bottom: ${spacing.md}px;
`;

const ProgressHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.sm}px;
`;

const ProgressLabel = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.gray[900]};
`;

const ProgressValue = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.primary};
`;

const ProgressBar = styled.View`
  height: 8px;
  background-color: ${colors.gray[200]};
  border-radius: ${borderRadius.round}px;
  overflow: hidden;
`;

const ProgressFill = styled.View<{ percentage: number; color?: string }>`
  height: 100%;
  width: ${props => Math.min(props.percentage, 100)}%;
  background-color: ${props => props.color || colors.primary};
  border-radius: ${borderRadius.round}px;
`;

const CategoryContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${spacing.sm}px;
`;

const CategoryItem = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${colors.gray[100]};
  padding: ${spacing.sm}px ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  border-left-width: 4px;
  border-left-color: ${colors.primary};
`;

const CategoryDot = styled.View<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: ${borderRadius.round}px;
  background-color: ${props => props.color};
  margin-right: ${spacing.sm}px;
`;

const CategoryInfo = styled.View`
  flex: 1;
`;

const CategoryName = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.gray[900]};
`;

const CategoryAmount = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.gray[600]};
`;

const RecentActivity = styled.View`
  margin-bottom: ${spacing.lg}px;
`;

const ActivityItem = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${spacing.md}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.gray[200]};
`;

const ActivityIconContainer = styled.View`
  width: 44px;
  height: 44px;
  background-color: ${colors.primary}20;
  border-radius: ${borderRadius.md}px;
  justify-content: center;
  align-items: center;
  margin-right: ${spacing.md}px;
`;

const ActivityContent = styled.View`
  flex: 1;
`;

const ActivityTitle = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.gray[900]};
`;

const ActivitySubtitle = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  margin-top: ${spacing.xs}px;
`;

const ActivityAmount = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${spacing.xxl}px;
`;

const LoadingIcon = styled.View`
  width: 80px;
  height: 80px;
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.round}px;
  justify-content: center;
  align-items: center;
  margin-bottom: ${spacing.lg}px;
`;

const LoadingTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.gray[700]};
  text-align: center;
  margin-bottom: ${spacing.sm}px;
`;

const LoadingText = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[500]};
  text-align: center;
  line-height: 22px;
`;

interface AnalyticsData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
  totalExpenses: number;
  avgExpenseAmount: number;
  recentExpenses: Expense[];
  expensesByCategory: { [key: string]: number };
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Materials': colors.primary,
  'Labor': colors.success,
  'Equipment': colors.warning,
  'Equipment Rental': colors.info,
  'Transport': colors.error,
  'Permits': '#8B5CF6',
  'Utilities': '#06B6D4',
  'Other': colors.gray[500],
};

export const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<AnalyticsScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadAnalytics(false);
    }, [])
  );

  const loadAnalytics = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      // Load all projects
      const projects = await ProjectService.getAllProjects();
      
      // Load all expenses
      const expenses = await ExpenseService.getAllExpenses();
      
      const now = new Date();
      const activeProjects = projects.filter(project => {
        const endDate = new Date(project.endDate);
        return endDate >= now;
      });

      const completedProjects = projects.filter(project => {
        const endDate = new Date(project.endDate);
        return endDate < now;
      });

      const totalBudget = projects.reduce((sum, project) => sum + project.targetBudget, 0);
      const totalSpent = projects.reduce((sum, project) => sum + (project.totalSpent || 0), 0);
      
      // Calculate expenses by category
      const expensesByCategory: { [key: string]: number } = {};
      expenses.forEach(expense => {
        if (expensesByCategory[expense.category]) {
          expensesByCategory[expense.category] += expense.amount;
        } else {
          expensesByCategory[expense.category] = expense.amount;
        }
      });

      const analyticsData: AnalyticsData = {
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        totalBudget,
        totalSpent,
        budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        totalExpenses: expenses.length,
        avgExpenseAmount: expenses.length > 0 ? 
          expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length : 0,
        recentExpenses: expenses.slice(0, 5),
        expensesByCategory,
      };

      setAnalyticsData(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics(false);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: 'short',
    });
  };

  const renderProgressBar = (label: string, current: number, total: number, color?: string) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    return (
      <ProgressContainer>
        <ProgressHeader>
          <ProgressLabel>{label}</ProgressLabel>
          <ProgressValue>{percentage.toFixed(1)}%</ProgressValue>
        </ProgressHeader>
        <ProgressBar>
          <ProgressFill percentage={percentage} color={color} />
        </ProgressBar>
      </ProgressContainer>
    );
  };

  if (loading) {
    return (
      <Screen includeTabBarPadding={true}>
        <Header>
          <HeaderContent>
            <Title>Analytics</Title>
            <Subtitle>Loading insights...</Subtitle>
          </HeaderContent>
        </Header>
        
        <LoadingContainer>
          <LoadingIcon>
            <Ionicons name="analytics-outline" size={40} color={colors.gray[400]} />
          </LoadingIcon>
          <LoadingTitle>Loading Analytics</LoadingTitle>
          <LoadingText>Please wait while we analyze your project data...</LoadingText>
        </LoadingContainer>
      </Screen>
    );
  }

  if (!analyticsData) {
    return (
      <Screen includeTabBarPadding={true}>
        <Header>
          <HeaderContent>
            <Title>Analytics</Title>
            <Subtitle>Project insights and statistics</Subtitle>
          </HeaderContent>
        </Header>
        
        <LoadingContainer>
          <LoadingIcon>
            <Ionicons name="bar-chart-outline" size={40} color={colors.gray[400]} />
          </LoadingIcon>
          <LoadingTitle>No Data Available</LoadingTitle>
          <LoadingText>
            Start creating projects and adding expenses to see your analytics dashboard.
          </LoadingText>
        </LoadingContainer>
      </Screen>
    );
  }

  return (
    <Screen includeTabBarPadding={true}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <Header>
          <HeaderContent>
            <Title>Analytics</Title>
            <Subtitle>Project insights and statistics</Subtitle>
          </HeaderContent>
        </Header>

        <StatsGrid>
          <StatCard padding="medium">
            <StatHeader>
              <StatIconContainer style={{ backgroundColor: colors.primary + '20' }}>
                <Ionicons name="folder-outline" size={20} color={colors.primary} />
              </StatIconContainer>
            </StatHeader>
            <StatValue>{analyticsData.totalProjects}</StatValue>
            <StatLabel>Total Projects</StatLabel>
            <StatChange positive={true}>{analyticsData.activeProjects} active</StatChange>
          </StatCard>

          <StatCard padding="medium">
            <StatHeader>
              <StatIconContainer style={{ backgroundColor: colors.success + '20' }}>
                <Ionicons name="pie-chart-outline" size={20} color={colors.success} />
              </StatIconContainer>
            </StatHeader>
            <StatValue>{analyticsData.budgetUtilization.toFixed(1)}%</StatValue>
            <StatLabel>Budget Used</StatLabel>
            <StatChange positive={analyticsData.budgetUtilization <= 90}>
              {analyticsData.budgetUtilization > 100 ? 'Over budget' : 'On track'}
            </StatChange>
          </StatCard>

          <StatCard padding="medium">
            <StatHeader>
              <StatIconContainer style={{ backgroundColor: colors.warning + '20' }}>
                <Ionicons name="receipt-outline" size={20} color={colors.warning} />
              </StatIconContainer>
            </StatHeader>
            <StatValue>{analyticsData.totalExpenses}</StatValue>
            <StatLabel>Total Expenses</StatLabel>
            <StatChange positive={true}>All time</StatChange>
          </StatCard>

          <StatCard padding="medium">
            <StatHeader>
              <StatIconContainer style={{ backgroundColor: colors.info + '20' }}>
                <Ionicons name="trending-up-outline" size={20} color={colors.info} />
              </StatIconContainer>
            </StatHeader>
            <StatValue>{formatCurrency(analyticsData.avgExpenseAmount)}</StatValue>
            <StatLabel>Avg Expense</StatLabel>
            <StatChange positive={true}>Per transaction</StatChange>
          </StatCard>
        </StatsGrid>

        <Card padding="large">
          <ChartSection>
            <SectionTitle>Budget Overview</SectionTitle>
            
            {renderProgressBar(
              'Budget Utilization',
              analyticsData.totalSpent,
              analyticsData.totalBudget,
              analyticsData.budgetUtilization > 90 ? colors.error : colors.primary
            )}
            
            {renderProgressBar(
              'Project Completion',
              analyticsData.completedProjects,
              analyticsData.totalProjects,
              colors.success
            )}
          </ChartSection>
        </Card>

        <Card padding="large">
          <ChartSection>
            <SectionTitle>Expense Categories</SectionTitle>
            
            <CategoryContainer>
              {Object.entries(analyticsData.expensesByCategory)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 6)
                .map(([category, amount]) => (
                  <CategoryItem key={category}>
                    <CategoryDot color={CATEGORY_COLORS[category] || colors.primary} />
                    <CategoryInfo>
                      <CategoryName>{category}</CategoryName>
                      <CategoryAmount>{formatCurrency(amount as number)}</CategoryAmount>
                    </CategoryInfo>
                  </CategoryItem>
                ))}
            </CategoryContainer>
          </ChartSection>
        </Card>

        <Card padding="large">
          <RecentActivity>
            <SectionTitle>Recent Activity</SectionTitle>
            
            {analyticsData.recentExpenses.map((expense, index) => (
              <ActivityItem 
                key={expense.id} 
                style={{ borderBottomWidth: index === analyticsData.recentExpenses.length - 1 ? 0 : 1 }}
              >
                <ActivityIconContainer>
                  <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                </ActivityIconContainer>
                <ActivityContent>
                  <ActivityTitle>{expense.title}</ActivityTitle>
                  <ActivitySubtitle>
                    {expense.category} • {formatDate(expense.expenseDate)}
                  </ActivitySubtitle>
                </ActivityContent>
                <ActivityAmount>{formatCurrency(expense.amount)}</ActivityAmount>
              </ActivityItem>
            ))}
          </RecentActivity>
        </Card>
      </ScrollView>
    </Screen>
  );
};
