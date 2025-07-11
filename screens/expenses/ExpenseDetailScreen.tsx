import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, Share } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { 
  ExpenseDetailScreenNavigationProp, 
  ExpenseDetailScreenRouteProp 
} from '../../types/navigation';
import { Expense } from '../../types/expense';
import { colors, spacing, typography, borderRadius } from '../../theme';

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

const ExpenseHeader = styled.View`
  margin-bottom: ${spacing.lg}px;
  align-items: center;
`;

const ExpenseTitle = styled.Text`
  font-size: ${typography.sizes.xxl}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.gray[900]};
  text-align: center;
  margin-bottom: ${spacing.sm}px;
`;

const Amount = styled.Text`
  font-size: ${typography.sizes.xxxl}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.primary};
`;

const DetailSection = styled.View`
  margin-bottom: ${spacing.lg}px;
`;

const SectionTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
  margin-bottom: ${spacing.md}px;
`;

const DetailRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.md}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.gray[200]};
`;

const DetailLabel = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[600]};
  font-weight: ${typography.weights.medium};
`;

const DetailValue = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[900]};
  font-weight: ${typography.weights.semibold};
  flex: 1;
  text-align: right;
`;

const CategoryBadge = styled.View`
  background-color: ${colors.primary};
  padding: ${spacing.sm}px ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
`;

const CategoryText = styled.Text`
  color: ${colors.white};
  font-weight: ${typography.weights.semibold};
  font-size: ${typography.sizes.sm}px;
`;

const NotesContainer = styled.View`
  background-color: ${colors.gray[100]};
  padding: ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  margin-top: ${spacing.sm}px;
`;

const NotesText = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[700]};
  line-height: 22px;
`;

const ReceiptContainer = styled.TouchableOpacity`
  background-color: ${colors.gray[100]};
  padding: ${spacing.lg}px;
  border-radius: ${borderRadius.md}px;
  align-items: center;
  justify-content: center;
  margin-top: ${spacing.sm}px;
  border: 2px dashed ${colors.gray[300]};
`;

const ReceiptText = styled.Text`
  color: ${colors.gray[600]};
  font-size: ${typography.sizes.md}px;
  margin-top: ${spacing.sm}px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  gap: ${spacing.md}px;
  margin-top: ${spacing.xl}px;
  margin-bottom: ${spacing.md}px;
`;

const DeleteButtonContainer = styled.View`
  margin-top: ${spacing.md}px;
  margin-bottom: ${spacing.xxl}px;
  padding: 0 ${spacing.xl}px;
`;

const DeleteButton = styled.TouchableOpacity`
  background-color: ${colors.white};
  padding: ${spacing.sm}px ${spacing.lg}px;
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.error};
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: ${spacing.sm}px;
`;

const DeleteButtonText = styled.Text`
  color: ${colors.error};
  font-weight: ${typography.weights.medium};
  font-size: ${typography.sizes.sm}px;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${colors.gray[100]};
  padding: ${spacing.md}px;
  border-radius: ${borderRadius.xl}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm}px;
  flex: 1;
`;

const ActionButtonText = styled.Text`
  color: ${colors.gray[700]};
  font-weight: ${typography.weights.medium};
  font-size: ${typography.sizes.md}px;
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

export const ExpenseDetailScreen: React.FC = () => {
  const navigation = useNavigation<ExpenseDetailScreenNavigationProp>();
  const route = useRoute<ExpenseDetailScreenRouteProp>();
  const { expenseId, projectId } = route.params;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenseDetails();
  }, [expenseId]);

  const loadExpenseDetails = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API call
      const mockExpense: Expense = {
        id: expenseId,
        title: 'Concrete Mix',
        amount: 250000,
        category: 'Materials',
        expenseDate: '2025-07-10',
        notes: 'High-quality concrete mix for foundation work. Includes delivery charges and additional materials for reinforcement.',
        receiptUrl: 'https://example.com/receipt.jpg',
        projectId: projectId,
        createdAt: '2025-07-10T10:00:00Z'
      };

      setExpense(mockExpense);
    } catch (error) {
      Alert.alert('Error', 'Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    Alert.alert('Edit Expense', 'Edit functionality will be implemented soon.');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1000));
              Alert.alert('Success', 'Expense deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    if (!expense) return;

    try {
      await Share.share({
        message: `Expense Details:\nTitle: ${expense.title}\nAmount: ${formatAmount(expense.amount)}\nCategory: ${expense.category}\nDate: ${formatDate(expense.expenseDate)}\n${expense.notes ? `Notes: ${expense.notes}` : ''}`,
        title: 'Expense Details'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share expense details');
    }
  };

  const handleViewReceipt = () => {
    Alert.alert('View Receipt', 'Receipt viewing functionality will be implemented soon.');
  };

  if (loading) {
    return (
      <Screen>
        <LoadingContainer>
          <LoadingText>Loading expense details...</LoadingText>
        </LoadingContainer>
      </Screen>
    );
  }

  if (!expense) {
    return (
      <Screen>
        <LoadingContainer>
          <LoadingText>Expense not found</LoadingText>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="primary"
          />
        </LoadingContainer>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header>
        <HeaderContent>
          <BackButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
          </BackButton>
          <HeaderText>
            <Title>Expense Details</Title>
            <Subtitle>View expense information</Subtitle>
          </HeaderText>
          <Spacer />
        </HeaderContent>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ExpenseHeader>
          <ExpenseTitle>{expense.title}</ExpenseTitle>
          <Amount>{formatAmount(expense.amount)}</Amount>
        </ExpenseHeader>

        <Card padding="large">
          <DetailSection>
            <SectionTitle>Expense Details</SectionTitle>
            
            <DetailRow>
              <DetailLabel>Category</DetailLabel>
              <CategoryBadge>
                <CategoryText>{expense.category}</CategoryText>
              </CategoryBadge>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Expense Date</DetailLabel>
              <DetailValue>{formatDate(expense.expenseDate)}</DetailValue>
            </DetailRow>

            <DetailRow>
              <DetailLabel>Created</DetailLabel>
              <DetailValue>{formatDateTime(expense.createdAt)}</DetailValue>
            </DetailRow>

            <DetailRow style={{ borderBottomWidth: 0 }}>
              <DetailLabel>Project ID</DetailLabel>
              <DetailValue>#{expense.projectId}</DetailValue>
            </DetailRow>
          </DetailSection>

          {expense.notes && (
            <DetailSection>
              <SectionTitle>Notes</SectionTitle>
              <NotesContainer>
                <NotesText>{expense.notes}</NotesText>
              </NotesContainer>
            </DetailSection>
          )}

          {expense.receiptUrl && (
            <DetailSection>
              <SectionTitle>Receipt</SectionTitle>
              <ReceiptContainer onPress={handleViewReceipt}>
                <Ionicons name="document-text-outline" size={32} color={colors.gray[500]} />
                <ReceiptText>Tap to view receipt</ReceiptText>
              </ReceiptContainer>
            </DetailSection>
          )}
        </Card>

        <ButtonContainer>
          <ActionButton onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={colors.gray[700]} />
            <ActionButtonText>Share</ActionButtonText>
          </ActionButton>
          
          <ActionButton onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color={colors.gray[700]} />
            <ActionButtonText>Edit</ActionButtonText>
          </ActionButton>
        </ButtonContainer>

        <DeleteButtonContainer>
          <DeleteButton onPress={handleDelete}>
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <DeleteButtonText>Delete Expense</DeleteButtonText>
          </DeleteButton>
        </DeleteButtonContainer>
      </ScrollView>
    </Screen>
  );
};
