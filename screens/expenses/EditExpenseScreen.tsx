// screens/expenses/EditExpenseScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, View, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { 
  EditExpenseScreenNavigationProp, 
  EditExpenseScreenRouteProp 
} from '../../types/navigation';
import { CreateExpenseData, ExpenseCategory, EXPENSE_CATEGORIES, Expense } from '../../types/expense';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { ExpenseService } from '../../services/ExpenseService';

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

const FormContainer = styled(Card)`
  margin-bottom: ${spacing.lg}px;
`;

const FormSection = styled.View`
  margin-bottom: ${spacing.lg}px;
`;

const SectionTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
  margin-bottom: ${spacing.md}px;
`;

const CategoryGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: ${spacing.sm}px;
`;

const CategoryButton = styled.TouchableOpacity<{ isSelected: boolean }>`
  flex: 1;
  min-width: 45%;
  background-color: ${props => props.isSelected ? colors.primary : colors.white};
  border: 2px solid ${props => props.isSelected ? colors.primary : colors.gray[300]};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px;
  align-items: center;
  margin-bottom: ${spacing.sm}px;
`;

const CategoryText = styled.Text<{ isSelected: boolean }>`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${props => props.isSelected ? colors.white : colors.gray[700]};
  text-align: center;
`;

const DateLabel = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.gray[900]};
  margin-bottom: ${spacing.sm}px;
`;

const DatePickerButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: ${colors.white};
  border: 2px solid ${colors.gray[300]};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.sm}px;
`;

const DateIcon = styled.View`
  width: 40px;
  height: 40px;
  background-color: ${colors.primary}10;
  border-radius: ${borderRadius.round}px;
  justify-content: center;
  align-items: center;
  margin-right: ${spacing.md}px;
`;

const DateText = styled.Text<{ hasValue: boolean }>`
  flex: 1;
  font-size: ${typography.sizes.md}px;
  color: ${props => props.hasValue ? colors.gray[900] : colors.gray[500]};
  font-weight: ${typography.weights.medium};
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: ${spacing.md}px;
  margin-bottom: ${spacing.xl}px;
  padding: 0 ${spacing.xs}px;
`;

const ActionButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${props => 
    props.variant === 'primary' ? colors.primary : 
    props.variant === 'danger' ? colors.error : 
    colors.white};
  padding: ${spacing.md}px ${spacing.lg}px;
  border-radius: ${borderRadius.xl}px;
  border: 2px solid ${props => 
    props.variant === 'primary' ? colors.primary : 
    props.variant === 'danger' ? colors.error : 
    colors.gray[300]};
  shadow-color: ${colors.black};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
  opacity: ${props => props.disabled ? 0.6 : 1};
`;

const ActionButtonText = styled.Text<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${props => 
    props.variant === 'primary' ? colors.white : 
    props.variant === 'danger' ? colors.white : 
    colors.gray[700]};
  margin-left: ${spacing.sm}px;
`;

const LoadingContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ErrorText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.error};
  margin-top: ${spacing.xs}px;
  margin-left: ${spacing.sm}px;
`;

const LoadingScreen = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${spacing.xl}px;
`;

const LoadingText = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[600]};
  margin-top: ${spacing.md}px;
`;

interface FormData extends CreateExpenseData {
  id?: number;
}

interface FormErrors {
  title?: string;
  amount?: string;
  category?: string;
  expenseDate?: string;
  notes?: string;
}

export const EditExpenseScreen: React.FC = () => {
  const navigation = useNavigation<EditExpenseScreenNavigationProp>();
  const route = useRoute<EditExpenseScreenRouteProp>();
  const { expenseId, projectId } = route.params;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    amount: 0,
    category: 'Materials',
    expenseDate: '',
    notes: '',
    projectId: projectId,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    loadExpense();
  }, [expenseId]);

  const loadExpense = async () => {
    try {
      setInitialLoading(true);
      const expenseData = await ExpenseService.getExpenseById(expenseId);
      if (!expenseData) {
        Alert.alert('Error', 'Expense not found');
        navigation.goBack();
        return;
      }
      
      setExpense(expenseData);
      setFormData({
        id: expenseData.id,
        title: expenseData.title,
        amount: expenseData.amount,
        category: expenseData.category,
        expenseDate: expenseData.expenseDate,
        notes: expenseData.notes || '',
        projectId: expenseData.projectId,
      });
    } catch (error) {
      console.error('Error loading expense:', error);
      Alert.alert('Error', 'Failed to load expense details');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Expense title is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Expense date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateExpense = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before updating');
      return;
    }

    try {
      setLoading(true);
      
      const updateData: Partial<CreateExpenseData> = {
        title: formData.title.trim(),
        amount: formData.amount,
        category: formData.category,
        expenseDate: formData.expenseDate,
        notes: formData.notes?.trim(),
      };

      await ExpenseService.updateExpense(expenseId, updateData);
      
      Alert.alert(
        'Success',
        'Expense updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          }
        ]
      );
    } catch (error) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', 'Failed to update expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteExpense,
        }
      ]
    );
  };

  const confirmDeleteExpense = async () => {
    try {
      setLoading(true);
      await ExpenseService.deleteExpense(expenseId);
      
      Alert.alert(
        'Success',
        'Expense deleted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ExpenseList', { projectId }),
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Failed to delete expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDatePress = () => {
    const currentDate = formData.expenseDate ? new Date(formData.expenseDate) : new Date();
    setTempDate(currentDate);
    setShowDatePicker(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      updateField('expenseDate', dateString);
      
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return 'Select expense date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString();
  };

  if (initialLoading) {
    return (
      <Screen>
        <LoadingScreen>
          <ActivityIndicator size="large" color={colors.primary} />
          <LoadingText>Loading expense details...</LoadingText>
        </LoadingScreen>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header>
          <HeaderContent>
            <BackButton onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
            </BackButton>
            <HeaderText>
              <Title>Edit Expense</Title>
              <Subtitle>Update expense details</Subtitle>
            </HeaderText>
            <Spacer />
          </HeaderContent>
        </Header>

        <FormContainer padding="large">
          <FormSection>
            <SectionTitle>Basic Information</SectionTitle>
            <Input
              label="Expense Title"
              placeholder="Enter expense description"
              value={formData.title}
              onChangeText={(value) => updateField('title', value)}
              error={errors.title}
              leftIcon="receipt"
            />

            <Input
              label="Amount (LKR)"
              placeholder="Enter amount"
              value={formData.amount ? formatCurrency(formData.amount) : ''}
              onChangeText={(value) => {
                const numericValue = parseFloat(value.replace(/,/g, '')) || 0;
                updateField('amount', numericValue);
              }}
              error={errors.amount}
              leftIcon="wallet"
              keyboardType="numeric"
            />
          </FormSection>

          <FormSection>
            <SectionTitle>Category</SectionTitle>
            <CategoryGrid>
              {EXPENSE_CATEGORIES.map((category) => (
                <CategoryButton
                  key={category}
                  isSelected={formData.category === category}
                  onPress={() => updateField('category', category)}
                >
                  <CategoryText isSelected={formData.category === category}>
                    {category}
                  </CategoryText>
                </CategoryButton>
              ))}
            </CategoryGrid>
            {errors.category && <ErrorText>{errors.category}</ErrorText>}
          </FormSection>

          <FormSection>
            <SectionTitle>Date & Details</SectionTitle>
            <DateLabel>Expense Date</DateLabel>
            <DatePickerButton onPress={handleDatePress}>
              <DateIcon>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </DateIcon>
              <DateText hasValue={!!formData.expenseDate}>
                {formatDateForDisplay(formData.expenseDate)}
              </DateText>
            </DatePickerButton>
            {errors.expenseDate && <ErrorText>{errors.expenseDate}</ErrorText>}

            <Input
              label="Notes (Optional)"
              placeholder="Additional details or notes"
              value={formData.notes}
              onChangeText={(value) => updateField('notes', value)}
              error={errors.notes}
              leftIcon="document-text"
              multiline
              numberOfLines={3}
            />
          </FormSection>
        </FormContainer>

        <ButtonContainer>
          <ActionButton variant="secondary" onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={18} color={colors.gray[700]} />
            <ActionButtonText variant="secondary">Cancel</ActionButtonText>
          </ActionButton>
          
          <ActionButton variant="primary" onPress={handleUpdateExpense} disabled={loading}>
            {loading ? (
              <LoadingContainer>
                <ActivityIndicator size="small" color={colors.white} />
                <ActionButtonText variant="primary">Updating...</ActionButtonText>
              </LoadingContainer>
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color={colors.white} />
                <ActionButtonText variant="primary">Update</ActionButtonText>
              </>
            )}
          </ActionButton>
        </ButtonContainer>

        <ButtonContainer>
          <ActionButton variant="danger" onPress={handleDeleteExpense} disabled={loading}>
            <Ionicons name="trash" size={18} color={colors.white} />
            <ActionButtonText variant="danger">Delete Expense</ActionButtonText>
          </ActionButton>
        </ButtonContainer>

        {showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </ScrollView>
    </Screen>
  );
};
