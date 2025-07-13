// screens/projects/ProjectListScreen.tsx
import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, TextInput } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../../types/navigation';
import { Project } from '../../types/project';
import { User } from '../../types/auth';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { ProjectService } from '../../services/ProjectService';
import { UserService } from '../../services/UserService';

const Header = styled.View`
  background-color: ${colors.white};
  padding: ${spacing.lg}px;
  margin: 0 -${spacing.lg}px ${spacing.lg}px -${spacing.lg}px;
  border-bottom-left-radius: ${borderRadius.xl}px;
  border-bottom-right-radius: ${borderRadius.xl}px;
  ${shadows.medium};
`;

const WelcomeSection = styled.View`
  margin-bottom: ${spacing.lg}px;
`;

const WelcomeText = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.normal};
  color: ${colors.gray[600]};
  margin-bottom: ${spacing.xs}px;
`;

const Title = styled.Text`
  font-size: ${typography.sizes.title}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.gray[900]};
`;

const SearchSection = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${spacing.md}px;
`;

const SearchContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.xs}px ${spacing.sm}px;
  margin-right: ${spacing.sm}px;
`;

const SearchInput = styled(TextInput)`
  flex: 1;
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[900]};
  margin-left: ${spacing.sm}px;
`;

const FilterButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  background-color: ${colors.primary};
  border-radius: ${borderRadius.lg}px;
  justify-content: center;
  align-items: center;
`;

const ActionButtons = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const ActionButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.variant === 'primary' ? colors.primary : colors.gray[200]};
  padding: ${spacing.sm}px ${spacing.md}px;
  border-radius: ${borderRadius.lg}px;
  margin: 0 ${spacing.xs}px;
`;

const ActionButtonText = styled.Text<{ variant?: 'primary' | 'secondary' }>`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.semibold};
  color: ${props => props.variant === 'primary' ? colors.white : colors.gray[700]};
  margin-left: ${spacing.xs}px;
`;

const ProjectCard = styled(Card)`
  margin-bottom: ${spacing.md}px;
`;

const ProjectHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.sm}px;
`;

const ProjectTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
  flex: 1;
`;

const MenuButton = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.round}px;
  justify-content: center;
  align-items: center;
`;

const BudgetInfo = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${spacing.sm}px;
`;

const BudgetItem = styled.View`
  flex: 1;
`;

const BudgetLabel = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.gray[500]};
  text-transform: uppercase;
`;

const BudgetValue = styled.Text`
  font-size: ${typography.sizes.md}px;
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

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${spacing.xl}px;
`;

const EmptyText = styled.Text`
  font-size: ${typography.sizes.lg}px;
  color: ${colors.gray[500]};
  text-align: center;
  margin-top: ${spacing.md}px;
`;

export const ProjectListScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
    loadCurrentUser();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadProjects(false); // Don't show loading indicator when focusing
      loadCurrentUser(); // Also refresh user data
    }, [])
  );

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery]);

  const loadCurrentUser = async () => {
    try {
      const user = await UserService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadProjects = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true);
      }
      const projectsData = await ProjectService.getAllProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
    }
  };

  const filterProjects = () => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects);
      return;
    }
    
    const filtered = projects.filter(project =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProjects(filtered);
  };

  const formatCurrency = (amount: number): string => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const calculateProgress = (spent: number, budget: number): number => {
    return Math.min((spent / budget) * 100, 100);
  };

  const renderProject = ({ item }: { item: Project }) => {
    const progress = calculateProgress(item.totalSpent || 0, item.targetBudget);
    const remaining = item.targetBudget - (item.totalSpent || 0);

    const handleEditPress = (e: any) => {
      e.stopPropagation(); // Prevent card's onPress from firing
      navigation.navigate('EditProject', { projectId: item.id });
    };

    return (
      <TouchableOpacity onPress={() => navigation.navigate('Dashboard', { projectId: item.id })}>
        <ProjectCard>
          <ProjectHeader>
            <ProjectTitle>{item.title}</ProjectTitle>
            <MenuButton onPress={handleEditPress}>
              <Ionicons name="create-outline" size={16} color={colors.primary} />
            </MenuButton>
          </ProjectHeader>

          <BudgetInfo>
            <BudgetItem>
              <BudgetLabel>Budget</BudgetLabel>
              <BudgetValue>{formatCurrency(item.targetBudget)}</BudgetValue>
            </BudgetItem>
            <BudgetItem>
              <BudgetLabel>Spent</BudgetLabel>
              <BudgetValue>{formatCurrency(item.totalSpent || 0)}</BudgetValue>
            </BudgetItem>
            <BudgetItem>
              <BudgetLabel>Remaining</BudgetLabel>
              <BudgetValue style={{ color: remaining < 0 ? colors.error : colors.success }}>
                {formatCurrency(remaining)}
              </BudgetValue>
            </BudgetItem>
          </BudgetInfo>

          <ProgressContainer>
            <ProgressLabel>
              <ProgressText>Progress</ProgressText>
              <ProgressText>{progress.toFixed(1)}%</ProgressText>
            </ProgressLabel>
            <ProgressBar>
              <ProgressFill percentage={progress} />
            </ProgressBar>
          </ProgressContainer>
        </ProjectCard>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <EmptyContainer>
      <Ionicons name="folder-open-outline" size={64} color={colors.gray[400]} />
      <EmptyText>
        {searchQuery ? `No projects found for "${searchQuery}"` : 'No projects yet.\nCreate your first project!'}
      </EmptyText>
    </EmptyContainer>
  );

  return (
    <Screen includeTabBarPadding={true}>
      <Header>
        <WelcomeSection>
          <WelcomeText>Welcome back,</WelcomeText>
          <Title>{currentUser?.name || 'User'}</Title>
        </WelcomeSection>

        <SearchSection>
          <SearchContainer>
            <Ionicons name="search" size={20} color={colors.gray[500]} />
            <SearchInput
              placeholder="Search projects..."
              placeholderTextColor={colors.gray[500]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.gray[500]} />
              </TouchableOpacity>
            )}
          </SearchContainer>
          
          <FilterButton>
            <Ionicons name="funnel" size={20} color={colors.white} />
          </FilterButton>
        </SearchSection>

        <ActionButtons>
          <ActionButton variant="primary" onPress={() => navigation.navigate('CreateProject')} style={{ marginHorizontal: 0 }}>
            <Ionicons name="add" size={16} color={colors.white} />
            <ActionButtonText variant="primary">New Project</ActionButtonText>
          </ActionButton>
        </ActionButtons>
      </Header>

      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        refreshing={loading}
        onRefresh={loadProjects}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      />
    </Screen>
  );
};
