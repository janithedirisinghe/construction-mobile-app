import React, { useState } from 'react';
import { ScrollView, Alert, View, TouchableOpacity, Platform, ActivityIndicator, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { 
  AddExpenseScreenNavigationProp, 
  AddExpenseScreenRouteProp 
} from '../../types/navigation';
import { CreateExpenseData, ExpenseCategory, EXPENSE_CATEGORIES } from '../../types/expense';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { ExpenseService } from '../../services/ExpenseService';
import { useImagePicker } from '../../hooks/useImagePicker';
import { OfflineImage } from '../../services/OfflineStorageService';

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

const ProgressIndicator = styled.View`
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.sm}px;
`;

const ProgressText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  text-align: center;
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

const CategoryContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${spacing.sm}px;
  margin-bottom: ${spacing.md}px;
`;

const CategoryButton = styled.TouchableOpacity<{ selected: boolean }>`
  background-color: ${props => props.selected ? colors.primary : colors.gray[100]};
  padding: ${spacing.sm}px ${spacing.md}px;
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${props => props.selected ? colors.primary : colors.gray[200]};
  min-width: 100px;
  align-items: center;
`;

const CategoryText = styled.Text<{ selected: boolean }>`
  color: ${props => props.selected ? colors.white : colors.gray[700]};
  font-weight: ${typography.weights.medium};
  font-size: ${typography.sizes.sm}px;
`;

const DatePickerButton = styled.TouchableOpacity`
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.md}px;
  border: 1px solid ${colors.gray[200]};
`;

const DateLabel = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.gray[700]};
  margin-bottom: ${spacing.sm}px;
`;

const DateText = styled.Text<{ hasValue: boolean }>`
  font-size: ${typography.sizes.md}px;
  color: ${props => props.hasValue ? colors.gray[900] : colors.gray[500]};
  text-align: center;
`;

const DateIcon = styled.View`
  align-items: center;
  margin-bottom: ${spacing.xs}px;
`;

const TextArea = styled.TextInput`
  background-color: ${colors.gray[100]};
  border: 1px solid ${colors.gray[200]};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px;
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[900]};
  min-height: 100px;
  text-align-vertical: top;
`;

const ReceiptButton = styled.TouchableOpacity`
  background-color: ${colors.gray[100]};
  padding: ${spacing.md}px;
  border-radius: ${borderRadius.lg}px;
  border: 1px solid ${colors.gray[200]};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm}px;
`;

const ReceiptText = styled.Text`
  color: ${colors.gray[700]};
  font-weight: ${typography.weights.medium};
  font-size: ${typography.sizes.md}px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: ${spacing.md}px;
  margin-bottom: ${spacing.xl}px;
  padding: 0 ${spacing.xs}px;
`;

const ActionButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.variant === 'primary' ? colors.primary : colors.white};
  padding: ${spacing.md}px ${spacing.lg}px;
  border-radius: ${borderRadius.xl}px;
  border: 2px solid ${props => props.variant === 'primary' ? colors.primary : colors.gray[300]};
`;

const ActionButtonText = styled.Text<{ variant?: 'primary' | 'secondary' }>`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.bold};
  color: ${props => props.variant === 'primary' ? colors.white : colors.gray[700]};
  margin-left: ${spacing.xs}px;
`;

const LoadingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ErrorText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.error};
  margin-top: ${spacing.xs}px;
`;

const ReceiptPreview = styled.View`
  margin-top: ${spacing.sm}px;
  border-radius: ${borderRadius.lg}px;
  overflow: hidden;
  position: relative;
`;

const ReceiptImage = styled.Image`
  width: 100%;
  height: 150px;
  background-color: ${colors.gray[100]};
`;

const RemoveReceiptButton = styled.TouchableOpacity`
  position: absolute;
  top: ${spacing.sm}px;
  right: ${spacing.sm}px;
  background-color: ${colors.error};
  border-radius: ${borderRadius.round}px;
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
`;

export const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<AddExpenseScreenNavigationProp>();
  const route = useRoute<AddExpenseScreenRouteProp>();
  const { projectId } = route.params;
  const { showImagePicker, loading: imageLoading } = useImagePicker();

  const [formData, setFormData] = useState<CreateExpenseData>({
    title: '',
    amount: 0,
    category: 'Materials',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
    projectId: projectId
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [attachedReceipt, setAttachedReceipt] = useState<OfflineImage | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const expenseData: CreateExpenseData = {
        title: formData.title,
        amount: formData.amount,
        category: formData.category,
        expenseDate: formData.expenseDate,
        notes: formData.notes,
        receiptUrl: attachedReceipt?.localUri, // Store local URI (offline only)
        offlineReceiptId: attachedReceipt?.id, // Store receipt ID for future sync
        projectId: projectId
      };
      
      await ExpenseService.createExpense(expenseData);
      
      Alert.alert(
        'Success',
        'Expense added successfully! (Stored offline)',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating expense:', error);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleAttachReceipt = async () => {
    const selectedImage = await showImagePicker();
    if (selectedImage) {
      setAttachedReceipt(selectedImage);
      updateFormData('receiptUrl', selectedImage.localUri);
    }
  };

  const handleRemoveReceipt = () => {
    setAttachedReceipt(null);
    updateFormData('receiptUrl', undefined);
  };

  const updateFormData = (field: keyof CreateExpenseData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return 'Select date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      const formattedDate = selectedDate.toISOString().split('T')[0];
      updateFormData('expenseDate', formattedDate);
      
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  return (
    <Screen>
      <Header>
        <HeaderContent>
          <BackButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.gray[700]} />
          </BackButton>
          
          <HeaderText>
            <Title>Add Expense</Title>
            <Subtitle>Track your project expenses</Subtitle>
          </HeaderText>
          
          <Spacer />
        </HeaderContent>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ProgressIndicator>
          <ProgressText>Step 1 of 1 - Expense Details</ProgressText>
        </ProgressIndicator>

        <FormContainer padding="large">
          <FormSection>
            <SectionTitle>Basic Information</SectionTitle>
            <Input
              label="Expense Title"
              placeholder="e.g., Concrete Mix, Worker Payment"
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
              error={errors.title}
              leftIcon="receipt"
            />

            <Input
              label="Amount (LKR)"
              placeholder="0.00"
              value={formData.amount ? formData.amount.toString() : ''}
              onChangeText={(text: string) => {
                const amount = parseFloat(text) || 0;
                updateFormData('amount', amount);
              }}
              keyboardType="numeric"
              error={errors.amount}
              leftIcon="cash"
            />
          </FormSection>

          <FormSection>
            <SectionTitle>Category</SectionTitle>
            <CategoryContainer>
              {EXPENSE_CATEGORIES.map((category) => (
                <CategoryButton
                  key={category}
                  selected={formData.category === category}
                  onPress={() => updateFormData('category', category)}
                >
                  <CategoryText selected={formData.category === category}>
                    {category}
                  </CategoryText>
                </CategoryButton>
              ))}
            </CategoryContainer>
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
            {errors.expenseDate && (
              <ErrorText>{errors.expenseDate}</ErrorText>
            )}

            <DateLabel>Notes (Optional)</DateLabel>
            <TextArea
              placeholder="Add any additional notes about this expense..."
              value={formData.notes}
              onChangeText={(text) => updateFormData('notes', text)}
              multiline
              placeholderTextColor={colors.gray[500]}
            />
          </FormSection>

          <FormSection>
            <SectionTitle>Receipt</SectionTitle>
            <ReceiptButton onPress={handleAttachReceipt} disabled={imageLoading}>
              {imageLoading ? (
                <ActivityIndicator size="small" color={colors.gray[700]} />
              ) : (
                <Ionicons name="camera" size={20} color={colors.gray[700]} />
              )}
              <ReceiptText>
                {attachedReceipt ? 'Change Receipt' : 'Attach Receipt (Offline Only)'}
              </ReceiptText>
            </ReceiptButton>
            
            {attachedReceipt && (
              <ReceiptPreview>
                <ReceiptImage source={{ uri: attachedReceipt.localUri }} resizeMode="cover" />
                <RemoveReceiptButton onPress={handleRemoveReceipt}>
                  <Ionicons name="close" size={12} color={colors.white} />
                </RemoveReceiptButton>
              </ReceiptPreview>
            )}
          </FormSection>
        </FormContainer>

        <ButtonContainer>
          <ActionButton variant="secondary" onPress={handleCancel}>
            <Ionicons name="close" size={18} color={colors.gray[700]} />
            <ActionButtonText variant="secondary">Cancel</ActionButtonText>
          </ActionButton>
          
          <ActionButton variant="primary" onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <LoadingContainer>
                <ActivityIndicator size="small" color={colors.white} />
                <ActionButtonText variant="primary">Adding...</ActionButtonText>
              </LoadingContainer>
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color={colors.white} />
                <ActionButtonText variant="primary">Add Expense</ActionButtonText>
              </>
            )}
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
