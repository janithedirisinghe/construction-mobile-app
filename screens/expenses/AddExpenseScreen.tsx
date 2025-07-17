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
import { useFilePicker } from '../../hooks/useFilePicker';
import { OfflineFile, OfflineStorageService } from '../../services/OfflineStorageService';

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

const FilesContainer = styled.View`
  margin-top: ${spacing.sm}px;
`;

const FilesList = styled.ScrollView`
  max-height: 200px;
`;

const FileItem = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${colors.gray[100]};
  border: 1px solid ${colors.gray[200]};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.sm}px;
  margin-bottom: ${spacing.xs}px;
`;

const FilePreview = styled.View`
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.md}px;
  background-color: ${colors.gray[200]};
  justify-content: center;
  align-items: center;
  margin-right: ${spacing.sm}px;
`;

const FileImage = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.md}px;
`;

const FileInfo = styled.View`
  flex: 1;
  margin-right: ${spacing.sm}px;
`;

const FileName = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.gray[900]};
`;

const FileType = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.gray[600]};
  margin-top: 2px;
`;

const RemoveFileButton = styled.TouchableOpacity`
  background-color: ${colors.error};
  border-radius: ${borderRadius.round}px;
  width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
`;

const FilesCountText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  margin-top: ${spacing.xs}px;
  text-align: center;
`;

export const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<AddExpenseScreenNavigationProp>();
  const route = useRoute<AddExpenseScreenRouteProp>();
  const { projectId } = route.params;
  const { showFilePicker, loading: fileLoading } = useFilePicker();

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
  const [attachedFiles, setAttachedFiles] = useState<OfflineFile[]>([]);

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
        receiptUrl: attachedFiles.length > 0 ? attachedFiles[0].localUri : undefined, // Store primary file URI (offline only)
        offlineReceiptId: attachedFiles.length > 0 ? attachedFiles[0].id : undefined, // Store primary file ID for future sync
        attachedFileIds: attachedFiles.map(file => file.id), // Store all file IDs
        projectId: projectId
      };
      
      const expenseId = await ExpenseService.createExpense(expenseData);
      
      // Associate all attached files with the created expense
      if (attachedFiles.length > 0 && expenseId) {
        for (const file of attachedFiles) {
          await OfflineStorageService.associateFileWithExpense(file.id, expenseId.toString());
        }
      }
      
      Alert.alert(
        'Success',
        `Expense added successfully with ${attachedFiles.length} attached file(s)! (Stored offline)`,
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

  const handleAttachFiles = async () => {
    const selectedFiles = await showFilePicker(true);
    if (selectedFiles.length > 0) {
      setAttachedFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return 'image' as const;
      case 'pdf':
        return 'document-text' as const;
      default:
        return 'document' as const;
    }
  };

  const getFileTypeLabel = (fileType: string): string => {
    switch (fileType) {
      case 'image':
        return 'Image';
      case 'pdf':
        return 'PDF Document';
      default:
        return 'Document';
    }
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
            <SectionTitle>Attachments</SectionTitle>
            <ReceiptButton onPress={handleAttachFiles} disabled={fileLoading}>
              {fileLoading ? (
                <ActivityIndicator size="small" color={colors.gray[700]} />
              ) : (
                <Ionicons name="attach" size={20} color={colors.gray[700]} />
              )}
              <ReceiptText>
                Attach Files (Images, PDFs - Offline Only)
              </ReceiptText>
            </ReceiptButton>
            
            {attachedFiles.length > 0 && (
              <FilesContainer>
                <FilesCountText>
                  {attachedFiles.length} file(s) attached
                </FilesCountText>
                <FilesList showsVerticalScrollIndicator={false}>
                  {attachedFiles.map((file) => (
                    <FileItem key={file.id}>
                      <FilePreview>
                        {file.fileType === 'image' ? (
                          <FileImage source={{ uri: file.localUri }} resizeMode="cover" />
                        ) : (
                          <Ionicons 
                            name={getFileIcon(file.fileType)} 
                            size={20} 
                            color={colors.primary} 
                          />
                        )}
                      </FilePreview>
                      <FileInfo>
                        <FileName numberOfLines={1}>
                          {file.filename}
                        </FileName>
                        <FileType>
                          {getFileTypeLabel(file.fileType)} • {(file.size / 1024).toFixed(1)} KB
                        </FileType>
                      </FileInfo>
                      <RemoveFileButton onPress={() => handleRemoveFile(file.id)}>
                        <Ionicons name="close" size={12} color={colors.white} />
                      </RemoveFileButton>
                    </FileItem>
                  ))}
                </FilesList>
              </FilesContainer>
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
