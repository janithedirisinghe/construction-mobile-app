import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, Alert, ScrollView, RefreshControl } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { 
  ExpenseListScreenNavigationProp, 
  ExpenseListScreenRouteProp 
} from '../../types/navigation';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '../../types/expense';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { ExpenseService } from '../../services/ExpenseService';

// Header Components
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
  margin-bottom: ${spacing.md}px;
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

// Summary Card Components
const SummaryCard = styled(Card)`
  margin-bottom: ${spacing.lg}px;
`;

const SummaryContent = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SummaryItem = styled.View`
  flex: 1;
  align-items: center;
`;

const SummaryLabel = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.gray[500]};
  text-transform: uppercase;
  margin-bottom: ${spacing.xs}px;
  font-weight: ${typography.weights.medium};
`;

const SummaryValue = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.primary};
`;

const SummaryCount = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.gray[900]};
`;

// Filter Components
const FilterSection = styled.View`
  margin-bottom: ${spacing.lg}px;
`;

const FilterLabel = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
  margin-bottom: ${spacing.sm}px;
`;

const FilterContainer = styled.ScrollView`
  flex-direction: row;
`;

const FilterButton = styled.TouchableOpacity<{ active: boolean }>`
  background-color: ${props => props.active ? colors.primary : colors.white};
  border: 2px solid ${props => props.active ? colors.primary : colors.gray[200]};
  padding: ${spacing.sm}px ${spacing.md}px;
  border-radius: ${borderRadius.round}px;
  margin-right: ${spacing.sm}px;
  min-width: 80px;
  align-items: center;
  ${shadows.small};
`;

const FilterText = styled.Text<{ active: boolean }>`
  color: ${props => props.active ? colors.white : colors.gray[700]};
  font-weight: ${typography.weights.semibold};
  font-size: ${typography.sizes.sm}px;
`;

// Expense Item Components
const ExpenseCard = styled(Card)`
  margin-bottom: ${spacing.md}px;
`;

const ExpenseHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.sm}px;
`;

const ExpenseInfo = styled.View`
  flex: 1;
  margin-right: ${spacing.md}px;
`;

const ExpenseTitle = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
  margin-bottom: ${spacing.xs}px;
`;

const ExpenseDescription = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  line-height: 20px;
`;

const ExpenseAmountContainer = styled.View`
  align-items: flex-end;
  flex-direction: row;
  align-items: center;
  gap: ${spacing.sm}px;
`;

const EditButton = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.round}px;
  justify-content: center;
  align-items: center;
`;

const ExpenseAmount = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.primary};
`;

const ExpenseFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: ${spacing.sm}px;
  padding-top: ${spacing.sm}px;
  border-top-width: 1px;
  border-top-color: ${colors.gray[200]};
`;

const CategoryBadge = styled.View`
  background-color: ${colors.primary}15;
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.round}px;
  flex-direction: row;
  align-items: center;
`;

const CategoryText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.primary};
  font-weight: ${typography.weights.semibold};
  margin-left: ${spacing.xs}px;
`;

const ExpenseDateContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ExpenseDate = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[500]};
  margin-left: ${spacing.xs}px;
`;

// Empty State Components
const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${spacing.xxl}px;
`;

const EmptyIcon = styled.View`
  width: 80px;
  height: 80px;
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.round}px;
  justify-content: center;
  align-items: center;
  margin-bottom: ${spacing.lg}px;
`;

const EmptyTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.gray[700]};
  text-align: center;
  margin-bottom: ${spacing.sm}px;
`;

const EmptyText = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[500]};
  text-align: center;
  margin-bottom: ${spacing.lg}px;
  line-height: 22px;
`;

// Action Button Components
const FloatingActionButton = styled.TouchableOpacity`
  position: absolute;
  bottom: ${spacing.lg}px;
  right: ${spacing.lg}px;
  width: 56px;
  height: 56px;
  background-color: ${colors.primary};
  border-radius: ${borderRadius.round}px;
  justify-content: center;
  align-items: center;
  ${shadows.large};
`;

const QuickActionBar = styled.View`
  flex-direction: row;
  padding: ${spacing.md}px;
  background-color: ${colors.white};
  border-top-width: 1px;
  border-top-color: ${colors.gray[200]};
  gap: ${spacing.sm}px;
`;
// Helper function to get category icon
const getCategoryIcon = (category: ExpenseCategory | 'All'): any => {
  const iconMap: Record<string, any> = {
    'Materials': 'hammer-outline',
    'Labor': 'people-outline',
    'Equipment': 'construct-outline',
    'Equipment Rental': 'construct-outline',
    'Transport': 'car-outline',
    'Permits': 'document-text-outline',
    'Utilities': 'flash-outline',
    'Other': 'ellipsis-horizontal-circle-outline',
    'All': 'apps-outline'
  };
  return iconMap[category] || 'receipt-outline';
};

export const ExpenseListScreen: React.FC = () => {
  const navigation = useNavigation<ExpenseListScreenNavigationProp>();
  const route = useRoute<ExpenseListScreenRouteProp>();
  const { projectId } = route.params;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, [projectId]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadExpenses(false); // Don't show loading indicator when focusing
    }, [projectId])
  );

  const loadExpenses = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true);
      }
      const expensesData = await ExpenseService.getFilteredExpenses({}, 'date', projectId);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading expenses:', error);
      Alert.alert('Error', 'Failed to load expenses');
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredExpenses(expenses);
    } else {
      setFilteredExpenses(expenses.filter(expense => expense.category === selectedCategory));
    }
  }, [selectedCategory, expenses]);

  const formatAmount = (amount: number) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTotalAmount = () => {
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpenseCount = () => {
    return filteredExpenses.length;
  };

  const handleExpensePress = (expense: Expense) => {
    navigation.navigate('ExpenseDetail', { 
      expenseId: expense.id, 
      projectId: projectId 
    });
  };

  const handleAddExpense = () => {
    navigation.navigate('AddExpense', { projectId });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const handleEditPress = (e: any) => {
      e.stopPropagation(); // Prevent card's onPress from firing
      navigation.navigate('EditExpense', { expenseId: item.id, projectId: item.projectId });
    };

    return (
      <TouchableOpacity onPress={() => handleExpensePress(item)}>
        <ExpenseCard>
          <ExpenseHeader>
            <ExpenseInfo>
              <ExpenseTitle>{item.title}</ExpenseTitle>
            </ExpenseInfo>
            <ExpenseAmountContainer>
              <ExpenseAmount>{formatAmount(item.amount)}</ExpenseAmount>
              <EditButton onPress={handleEditPress}>
                <Ionicons name="create-outline" size={16} color={colors.primary} />
              </EditButton>
            </ExpenseAmountContainer>
          </ExpenseHeader>
        
        <ExpenseFooter>
          <CategoryBadge>
            <Ionicons 
              name={getCategoryIcon(item.category)} 
              size={12} 
              color={colors.primary} 
            />
            <CategoryText>{item.category}</CategoryText>
          </CategoryBadge>
          
          <ExpenseDateContainer>
            <Ionicons name="calendar-outline" size={14} color={colors.gray[500]} />
            <ExpenseDate>{formatDate(item.expenseDate)}</ExpenseDate>
          </ExpenseDateContainer>
        </ExpenseFooter>
      </ExpenseCard>
    </TouchableOpacity>
    );
  };

  const renderFilterButton = (category: ExpenseCategory | 'All') => (
    <FilterButton
      key={category}
      active={selectedCategory === category}
      onPress={() => setSelectedCategory(category)}
    >
      <FilterText active={selectedCategory === category}>
        {category}
      </FilterText>
    </FilterButton>
  );

  const renderEmptyState = () => (
    <EmptyContainer>
      <EmptyIcon>
        <Ionicons 
          name={selectedCategory === 'All' ? 'receipt-outline' : getCategoryIcon(selectedCategory)} 
          size={40} 
          color={colors.gray[400]} 
        />
      </EmptyIcon>
      <EmptyTitle>
        {selectedCategory === 'All' ? 'No Expenses Yet' : `No ${selectedCategory} Expenses`}
      </EmptyTitle>
      <EmptyText>
        {selectedCategory === 'All' 
          ? 'Start tracking your project expenses by adding your first expense entry.'
          : `No expenses found for ${selectedCategory.toLowerCase()} category. Try selecting a different category or add a new expense.`
        }
      </EmptyText>
      <Button
        title="Add First Expense"
        onPress={handleAddExpense}
        variant="primary"
      />
    </EmptyContainer>
  );

  if (loading) {
    return (
      <Screen>
        <Header>
          <HeaderContent>
            <BackButton onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
            </BackButton>
            <HeaderText>
              <Title>Expenses</Title>
              <Subtitle>Loading...</Subtitle>
            </HeaderText>
            <Spacer />
          </HeaderContent>
        </Header>
        
        <EmptyContainer>
          <EmptyIcon>
            <Ionicons name="time-outline" size={40} color={colors.gray[400]} />
          </EmptyIcon>
          <EmptyTitle>Loading Expenses</EmptyTitle>
          <EmptyText>Please wait while we fetch your expense data...</EmptyText>
        </EmptyContainer>
      </Screen>
    );
  }

  return (
    <Screen>
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
            <BackButton onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
            </BackButton>
            <HeaderText>
              <Title>Expenses</Title>
              <Subtitle>Track project spending</Subtitle>
            </HeaderText>
            <Spacer />
          </HeaderContent>
          
          <SummaryCard>
            <SummaryContent>
              <SummaryItem>
                <SummaryLabel>Total Spent</SummaryLabel>
                <SummaryValue>{formatAmount(getTotalAmount())}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Expenses</SummaryLabel>
                <SummaryCount>{getExpenseCount()}</SummaryCount>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Category</SummaryLabel>
                <SummaryCount>{selectedCategory}</SummaryCount>
              </SummaryItem>
            </SummaryContent>
          </SummaryCard>
        </Header>

        <FilterSection>
          <FilterLabel>Filter by Category</FilterLabel>
          <FilterContainer 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: spacing.lg }}
          >
            {renderFilterButton('All')}
            {EXPENSE_CATEGORIES.map(category => renderFilterButton(category))}
          </FilterContainer>
        </FilterSection>

        {filteredExpenses.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredExpenses}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
          />
        )}
      </ScrollView>

      <FloatingActionButton onPress={handleAddExpense} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={colors.white} />
      </FloatingActionButton>
    </Screen>
  );
};