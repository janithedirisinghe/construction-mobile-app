import React, { useState, useEffect } from 'react';
import { ScrollView, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AnalyticsScreenNavigationProp } from '../../types/navigation';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { colors, spacing, typography, borderRadius } from '../../theme';

const Header = styled.View`
  background-color: ${colors.white};
  padding: ${spacing.lg}px;
  margin: 0 -${spacing.lg}px ${spacing.md}px -${spacing.lg}px;
  border-bottom-left-radius: ${borderRadius.xl}px;
  border-bottom-right-radius: ${borderRadius.xl}px;
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
  min-width: 160px;
  margin: ${spacing.xs}px;
`;

const StatHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing.sm}px;
`;

const StatIconContainer = styled.View`
  width: 40px;
  height: 40px;
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
`;

const StatChange = styled.Text<{ positive: boolean }>`
  font-size: ${typography.sizes.xs}px;
  color: ${props => props.positive ? colors.success : colors.error};
  font-weight: ${typography.weights.medium};
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

const ChartPlaceholder = styled.View`
  height: 200px;
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.md}px;
  justify-content: center;
  align-items: center;
  border: 2px dashed ${colors.gray[300]};
`;

const ChartPlaceholderText = styled.Text`
  color: ${colors.gray[500]};
  font-size: ${typography.sizes.md}px;
  margin-top: ${spacing.sm}px;
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
  width: 40px;
  height: 40px;
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
`;

const LoadingText = styled.Text`
  font-size: ${typography.sizes.lg}px;
  color: ${colors.gray[500]};
`;

// Mock data
const mockStats = {
  totalProjects: 5,
  activeProjects: 3,
  totalBudget: 15000000,
  totalSpent: 8500000,
  thisMonthExpenses: 750000,
  avgProjectCost: 3000000,
};

const mockRecentActivity = [
  {
    id: 1,
    title: 'Material Purchase',
    subtitle: 'Concrete mix for Villa project',
    amount: 250000,
    date: '2024-07-10',
    type: 'expense'
  },
  {
    id: 2,
    title: 'Labor Payment',
    subtitle: 'Weekly wages for construction crew',
    amount: 180000,
    date: '2024-07-09',
    type: 'expense'
  },
  {
    id: 3,
    title: 'Equipment Rental',
    subtitle: 'Excavator rental for foundation',
    amount: 85000,
    date: '2024-07-08',
    type: 'expense'
  },
];

export const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<AnalyticsScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(mockStats);
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would fetch actual analytics data here
      setStats(mockStats);
      setRecentActivity(mockRecentActivity);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Screen includeTabBarPadding={true}>
        <LoadingContainer>
          <LoadingText>Loading analytics...</LoadingText>
        </LoadingContainer>
      </Screen>
    );
  }

  const completionRate = (stats.totalProjects > 0) ? 
    ((stats.totalProjects - stats.activeProjects) / stats.totalProjects * 100) : 0;
  
  const budgetUtilization = (stats.totalBudget > 0) ? 
    (stats.totalSpent / stats.totalBudget * 100) : 0;

  return (
    <Screen includeTabBarPadding={true}>
      <Header>
        <HeaderContent>
          <Title>Analytics</Title>
          <Subtitle>Project insights and statistics</Subtitle>
        </HeaderContent>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <StatsGrid>
          <StatCard padding="medium">
            <StatHeader>
              <StatIconContainer style={{ backgroundColor: colors.primary + '20' }}>
                <Ionicons name="folder" size={20} color={colors.primary} />
              </StatIconContainer>
            </StatHeader>
            <StatValue>{stats.totalProjects}</StatValue>
            <StatLabel>Total Projects</StatLabel>
            <StatChange positive={true}>+2 this month</StatChange>
          </StatCard>

          <StatCard padding="medium">
            <StatHeader>
              <StatIconContainer style={{ backgroundColor: colors.success + '20' }}>
                <Ionicons name="trending-up" size={20} color={colors.success} />
              </StatIconContainer>
            </StatHeader>
            <StatValue>{stats.activeProjects}</StatValue>
            <StatLabel>Active Projects</StatLabel>
            <StatChange positive={true}>60% active rate</StatChange>
          </StatCard>

          <StatCard padding="medium">
            <StatHeader>
              <StatIconContainer style={{ backgroundColor: colors.warning + '20' }}>
                <Ionicons name="wallet" size={20} color={colors.warning} />
              </StatIconContainer>
            </StatHeader>
            <StatValue>{formatCurrency(stats.totalBudget)}</StatValue>
            <StatLabel>Total Budget</StatLabel>
            <StatChange positive={false}>-5% from last month</StatChange>
          </StatCard>

          <StatCard padding="medium">
            <StatHeader>
              <StatIconContainer style={{ backgroundColor: colors.error + '20' }}>
                <Ionicons name="card" size={20} color={colors.error} />
              </StatIconContainer>
            </StatHeader>
            <StatValue>{formatCurrency(stats.totalSpent)}</StatValue>
            <StatLabel>Total Spent</StatLabel>
            <StatChange positive={false}>{budgetUtilization.toFixed(1)}% of budget</StatChange>
          </StatCard>
        </StatsGrid>

        <Card padding="large">
          <ChartSection>
            <SectionTitle>Budget vs Spending Trend</SectionTitle>
            <ChartPlaceholder>
              <Ionicons name="bar-chart" size={48} color={colors.gray[400]} />
              <ChartPlaceholderText>Chart will be implemented soon</ChartPlaceholderText>
            </ChartPlaceholder>
          </ChartSection>
        </Card>

        <Card padding="large">
          <RecentActivity>
            <SectionTitle>Recent Activity</SectionTitle>
            {recentActivity.map((activity, index) => (
              <ActivityItem key={activity.id} style={{ 
                borderBottomWidth: index === recentActivity.length - 1 ? 0 : 1 
              }}>
                <ActivityIconContainer>
                  <Ionicons 
                    name={activity.type === 'expense' ? 'remove-circle' : 'add-circle'} 
                    size={20} 
                    color={colors.primary} 
                  />
                </ActivityIconContainer>
                <ActivityContent>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivitySubtitle>{activity.subtitle} • {formatDate(activity.date)}</ActivitySubtitle>
                </ActivityContent>
                <ActivityAmount>{formatCurrency(activity.amount)}</ActivityAmount>
              </ActivityItem>
            ))}
          </RecentActivity>
        </Card>
      </ScrollView>
    </Screen>
  );
};
