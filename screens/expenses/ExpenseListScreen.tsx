import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, Alert, View } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { 
  ExpenseListScreenNavigationProp, 
  ExpenseListScreenRouteProp 
} from '../../types/navigation';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '../../types/expense';
import { colors, spacing, typography, borderRadius } from '../../theme';

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.lg}px;
`;

const Title = styled.Text`
  font-size: ${typography.sizes.title}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.gray[900]};
`;

const TotalAmount = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.primary};
`;

const FilterContainer = styled.View`
  flex-direction: row;
  margin-bottom: ${spacing.md}px;
`;

const FilterButton = styled.TouchableOpacity<{ active: boolean }>`
  background-color: ${props => props.active ? colors.primary : colors.gray[200]};
  padding: ${spacing.sm}px ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  margin-right: ${spacing.sm}px;
`;

const FilterText = styled.Text<{ active: boolean }>`
  color: ${props => props.active ? colors.white : colors.gray[700]};
  font-weight: ${typography.weights.medium};
  font-size: ${typography.sizes.sm}px;
`;

const ExpenseItem = styled.TouchableOpacity`
  margin-bottom: ${spacing.md}px;
`;

const ExpenseHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${spacing.sm}px;
`;

const ExpenseTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
  flex: 1;
`;

const ExpenseAmount = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.primary};
`;

const ExpenseDetails = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CategoryBadge = styled.View`
  background-color: ${colors.gray[200]};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
`;

const CategoryText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.gray[700]};
  font-weight: ${typography.weights.medium};
`;

const ExpenseDate = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
`;

const EmptyState = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${spacing.xxl}px;
`;

const EmptyText = styled.Text`
  font-size: ${typography.sizes.lg}px;
  color: ${colors.gray[500]};
  text-align: center;
  margin-bottom: ${spacing.lg}px;
`;

export const ExpenseListScreen: React.FC = () => {
  const navigation = useNavigation<ExpenseListScreenNavigationProp>();
  const route = useRoute<ExpenseListScreenRouteProp>();
  const { projectId } = route.params;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  const mockExpenses: Expense[] = [
    {
      id: 1,
      title: 'Concrete Mix',
      amount: 2500.00,
      category: 'Materials',
      expenseDate: '2025-07-10',
      notes: 'For foundation work',
      projectId: projectId,
      createdAt: '2025-07-10T10:00:00Z'
    },
    {
      id: 2,
      title: 'Construction Worker Payment',
      amount: 1200.00,
      category: 'Labor',
      expenseDate: '2025-07-09',
      notes: 'Daily wage for 3 workers',
      projectId: projectId,
      createdAt: '2025-07-09T18:00:00Z'
    },
    {
      id: 3,
      title: 'Excavator Rental',
      amount: 800.00,
      category: 'Equipment Rental',
      expenseDate: '2025-07-08',
      notes: '8-hour rental',
      projectId: projectId,
      createdAt: '2025-07-08T15:30:00Z'
    },
    {
      id: 4,
      title: 'Building Permit',
      amount: 350.00,
      category: 'Permits',
      expenseDate: '2025-07-07',
      projectId: projectId,
      createdAt: '2025-07-07T09:00:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setExpenses(mockExpenses);
      setFilteredExpenses(mockExpenses);
      setLoading(false);
    }, 1000);
  }, [projectId]);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredExpenses(expenses);
    } else {
      setFilteredExpenses(expenses.filter(expense => expense.category === selectedCategory));
    }
  }, [selectedCategory, expenses]);

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTotalAmount = () => {
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
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

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <ExpenseItem onPress={() => handleExpensePress(item)}>
      <Card variant="default" padding="medium">
        <ExpenseHeader>
          <ExpenseTitle>{item.title}</ExpenseTitle>
          <ExpenseAmount>{formatAmount(item.amount)}</ExpenseAmount>
        </ExpenseHeader>
        <ExpenseDetails>
          <CategoryBadge>
            <CategoryText>{item.category}</CategoryText>
          </CategoryBadge>
          <ExpenseDate>{formatDate(item.expenseDate)}</ExpenseDate>
        </ExpenseDetails>
      </Card>
    </ExpenseItem>
  );

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

  if (loading) {
    return (
      <Screen>
        <EmptyState>
          <EmptyText>Loading expenses...</EmptyText>
        </EmptyState>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header>
        <Title>Expenses</Title>
        <TotalAmount>{formatAmount(getTotalAmount())}</TotalAmount>
      </Header>

      <FilterContainer>
        {renderFilterButton('All')}
        {EXPENSE_CATEGORIES.map(category => renderFilterButton(category))}
      </FilterContainer>

      {filteredExpenses.length === 0 ? (
        <EmptyState>
          <EmptyText>
            {selectedCategory === 'All' 
              ? 'No expenses found for this project'
              : `No ${selectedCategory.toLowerCase()} expenses found`
            }
          </EmptyText>
          <Button
            title="Add First Expense"
            onPress={handleAddExpense}
            variant="primary"
          />
        </EmptyState>
      ) : (
        <FlatList
          data={filteredExpenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        />
      )}

      <View style={{ marginTop: spacing.md }}>
        <Button
          title="Add Expense"
          onPress={handleAddExpense}
          variant="primary"
          fullWidth
        />
      </View>
    </Screen>
  );
};