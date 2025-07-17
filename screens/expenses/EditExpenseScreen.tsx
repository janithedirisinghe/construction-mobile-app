// screens/expenses/EditExpenseScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, View, TouchableOpacity, Platform, ActivityIndicator, Image, Modal, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
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

// Receipt styling components
const ReceiptSection = styled.View`
  margin-top: ${spacing.lg}px;
`;

const ReceiptButton = styled.TouchableOpacity`
  background-color: ${colors.gray[100]};
  padding: ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm}px;
  border: 2px dashed ${colors.gray[300]};
`;

const ReceiptText = styled.Text`
  color: ${colors.gray[600]};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
`;

const ReceiptPreview = styled.View`
  margin-top: ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  overflow: hidden;
  position: relative;
  border: 1px solid ${colors.gray[300]};
`;

const ReceiptImage = styled.Image`
  width: 100%;
  height: 200px;
  border-radius: ${borderRadius.md}px;
`;

const RemoveReceiptButton = styled.TouchableOpacity`
  position: absolute;
  top: ${spacing.sm}px;
  right: ${spacing.sm}px;
  background-color: ${colors.error};
  width: 24px;
  height: 24px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.View`
  flex: 1;
  background-color: ${colors.black};
  justify-content: center;
  align-items: center;
`;

const ModalHeader = styled.View`
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${spacing.lg}px;
  z-index: 1000;
`;

const ModalCloseButton = styled.TouchableOpacity`
  background-color: rgba(0, 0, 0, 0.5);
  padding: ${spacing.sm}px;
  border-radius: ${borderRadius.round}px;
`;

const ModalTitle = styled.Text`
  color: ${colors.white};
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
`;

const ImageContainer = styled.View`
  width: 100%;
  height: 70%;
  justify-content: center;
  align-items: center;
`;

const ReceiptImageFull = styled.Image`
  width: 100%;
  height: 100%;
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

const FilePreview = styled.TouchableOpacity`
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

interface FormData extends CreateExpenseData {
  id?: number;
}

interface FormErrors {
  title?: string;
  amount?: string;
  category?: string;
  expenseDate?: string;
  notes?: string;
  receiptUrl?: string;
}

export const EditExpenseScreen: React.FC = () => {
  const navigation = useNavigation<EditExpenseScreenNavigationProp>();
  const route = useRoute<EditExpenseScreenRouteProp>();
  const { expenseId, projectId } = route.params;
  const { showFilePicker, loading: fileLoading } = useFilePicker();

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
  const [attachedFiles, setAttachedFiles] = useState<OfflineFile[]>([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

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
        receiptUrl: expenseData.receiptUrl,
        projectId: expenseData.projectId,
      });
      
      // Load attached files for this expense
      if (expenseData.id) {
        try {
          const files = await OfflineStorageService.getFilesByExpenseId(expenseData.id.toString());
          setAttachedFiles(files);
        } catch (error) {
          console.error('Error loading expense files:', error);
          // If there's a receiptUrl but no files found, create a legacy file entry
          if (expenseData.receiptUrl) {
            const legacyFile: OfflineFile = {
              id: expenseData.id.toString(),
              localUri: expenseData.receiptUrl,
              originalUri: expenseData.receiptUrl,
              filename: `receipt_${expenseData.id}.jpg`,
              mimeType: 'image/jpeg',
              size: 0,
              fileType: 'image',
              expenseId: expenseData.id.toString(),
              synced: true,
              createdAt: expenseData.createdAt
            };
            setAttachedFiles([legacyFile]);
          }
        }
      }
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
        receiptUrl: attachedFiles.length > 0 ? attachedFiles[0].localUri : undefined,
        offlineReceiptId: attachedFiles.length > 0 ? attachedFiles[0].id : undefined,
        attachedFileIds: attachedFiles.map(file => file.id),
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

  const handleAttachFiles = async () => {
    const selectedFiles = await showFilePicker(true);
    if (selectedFiles.length > 0) {
      // Associate files with expense if expense exists
      if (expense?.id) {
        for (const file of selectedFiles) {
          await OfflineStorageService.associateFileWithExpense(file.id, expense.id.toString());
        }
      }
      setAttachedFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    setAttachedFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    // Delete the file from storage
    await OfflineStorageService.deleteFile(fileId);
  };

  const handleViewFile = (index: number) => {
    if (attachedFiles[index]) {
      const file = attachedFiles[index];
      
      // For PDF files, directly open with external app picker
      if (file.fileType === 'pdf') {
        openFileWithExternalApp(file);
      } else {
        // For images, show in modal
        setSelectedFileIndex(index);
        setShowReceiptModal(true);
      }
    }
  };

  const openFileWithExternalApp = async (file: OfflineFile) => {
    try {
      // Ensure file has proper extension for better app recognition
      let fileUri = file.localUri;
      const fileExtension = file.filename?.split('.').pop()?.toLowerCase();
      
      // For PDF files, ensure the URI has .pdf extension for better app recognition
      if (file.fileType === 'pdf' && fileExtension !== 'pdf') {
        const tempFileName = `${file.filename || 'document'}.pdf`;
        const tempUri = `${FileSystem.cacheDirectory}${tempFileName}`;
        
        try {
          await FileSystem.copyAsync({
            from: file.localUri,
            to: tempUri,
          });
          fileUri = tempUri;
        } catch (copyError) {
          console.warn('Could not copy file with proper extension, using original:', copyError);
          fileUri = file.localUri;
        }
      }

      if (Platform.OS === 'android') {
        // For Android, use Sharing to show apps that can handle the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: file.mimeType || 'application/pdf',
            dialogTitle: 'Open with...',
          });
        } else {
          Alert.alert('Error', 'Unable to open file. File sharing is not available on this device.');
        }
      } else {
        // For iOS, use Sharing which will try to open with default app
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: file.mimeType || 'application/pdf',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert('Error', 'Unable to open file. File sharing is not available on this device.');
        }
      }
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert(
        'Error', 
        'Unable to open the file. Please make sure you have a PDF viewer app installed.'
      );
    }
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

          <FormSection>
            <SectionTitle>Attachments</SectionTitle>
            <ReceiptButton onPress={handleAttachFiles} disabled={fileLoading}>
              {fileLoading ? (
                <ActivityIndicator size="small" color={colors.gray[700]} />
              ) : (
                <Ionicons name="attach" size={20} color={colors.gray[700]} />
              )}
              <ReceiptText>
                Attach Files (Images, PDFs)
              </ReceiptText>
            </ReceiptButton>
            
            {attachedFiles.length > 0 && (
              <FilesContainer>
                <FilesCountText>
                  {attachedFiles.length} file(s) attached
                </FilesCountText>
                <FilesList showsVerticalScrollIndicator={false}>
                  {attachedFiles.map((file, index) => (
                    <FileItem key={file.id}>
                      <FilePreview onPress={() => handleViewFile(index)}>
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
                          {file.fileType === 'pdf' && ' • Tap to open'}
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

        {/* File View Modal - Only for images */}
        {showReceiptModal && attachedFiles.length > 0 && (
          <Modal
            visible={showReceiptModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowReceiptModal(false)}
          >
            <ModalContainer>
              <ModalHeader>
                <ModalTitle>
                  {attachedFiles[selectedFileIndex] ? (
                    `Image (${selectedFileIndex + 1}/${attachedFiles.filter(f => f.fileType === 'image').length})`
                  ) : (
                    'Image'
                  )}
                </ModalTitle>
                <ModalCloseButton onPress={() => setShowReceiptModal(false)}>
                  <Ionicons name="close" size={24} color={colors.white} />
                </ModalCloseButton>
              </ModalHeader>

              <ImageContainer>
                {attachedFiles[selectedFileIndex]?.fileType === 'image' && (
                  <ReceiptImageFull 
                    source={{ uri: attachedFiles[selectedFileIndex].localUri }} 
                    resizeMode="contain" 
                  />
                )}
              </ImageContainer>
            </ModalContainer>
          </Modal>
        )}

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
