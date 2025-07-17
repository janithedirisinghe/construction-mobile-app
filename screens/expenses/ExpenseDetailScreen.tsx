import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, Share, Modal, Dimensions, Image, Text, View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { 
  ExpenseDetailScreenNavigationProp, 
  ExpenseDetailScreenRouteProp 
} from '../../types/navigation';
import { Expense } from '../../types/expense';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { ExpenseService } from '../../services/ExpenseService';
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
  border-radius: ${borderRadius.md}px;
  overflow: hidden;
  margin-top: ${spacing.sm}px;
  border: 1px solid ${colors.gray[300]};
`;

const ReceiptText = styled.Text`
  color: ${colors.gray[600]};
  font-size: ${typography.sizes.sm}px;
  text-align: center;
  padding: ${spacing.sm}px;
  background-color: rgba(255, 255, 255, 0.9);
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

const ReceiptImage = styled.Image`
  width: 100%;
  height: 200px;
  border-radius: ${borderRadius.md}px;
`;

const ReceiptImageFull = styled.Image`
  width: 100%;
  height: 100%;
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

const FilesCountText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  margin-top: ${spacing.xs}px;
  text-align: center;
`;

export const ExpenseDetailScreen: React.FC = () => {
  const navigation = useNavigation<ExpenseDetailScreenNavigationProp>();
  const route = useRoute<ExpenseDetailScreenRouteProp>();
  const { expenseId, projectId } = route.params;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<OfflineFile[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  useEffect(() => {
    loadExpenseDetails();
  }, [expenseId]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadExpenseDetails();
    }, [expenseId])
  );

  const loadExpenseDetails = async () => {
    try {
      setLoading(true);
      const expenseData = await ExpenseService.getExpenseById(expenseId);
      if (!expenseData) {
        Alert.alert('Error', 'Expense not found');
        navigation.goBack();
        return;
      }
      setExpense(expenseData);

      // Load attached files for this expense
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
    } catch (error) {
      console.error('Error loading expense:', error);
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
    navigation.navigate('EditExpense', { expenseId, projectId });
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
              setLoading(true);
              await ExpenseService.deleteExpense(expenseId);
              Alert.alert('Success', 'Expense deleted successfully', [
                { text: 'OK', onPress: () => navigation.navigate('ExpenseList', { projectId }) }
              ]);
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense');
            } finally {
              setLoading(false);
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

  const handleViewFile = (index: number) => {
    if (attachedFiles[index]) {
      setSelectedFileIndex(index);
      setShowReceiptModal(true);
    }
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

          {attachedFiles.length > 0 && (
            <DetailSection>
              <SectionTitle>Attachments ({attachedFiles.length})</SectionTitle>
              <FilesContainer>
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
                        </FileType>
                      </FileInfo>
                    </FileItem>
                  ))}
                </FilesList>
              </FilesContainer>
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

      {/* File View Modal */}
      <Modal
        visible={showReceiptModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <ModalContainer>
          <ModalHeader>
            <ModalTitle>
              {attachedFiles.length > 0 ? (
                `${attachedFiles[selectedFileIndex]?.fileType === 'image' ? 'Image' : 'Document'} (${selectedFileIndex + 1}/${attachedFiles.length})`
              ) : (
                'File'
              )}
            </ModalTitle>
            <ModalCloseButton onPress={() => setShowReceiptModal(false)}>
              <Ionicons name="close" size={24} color={colors.white} />
            </ModalCloseButton>
          </ModalHeader>
          <ImageContainer>
            {attachedFiles.length > 0 && attachedFiles[selectedFileIndex] && (
              <>
                {attachedFiles[selectedFileIndex].fileType === 'image' ? (
                  <ReceiptImageFull 
                    source={{ uri: attachedFiles[selectedFileIndex].localUri }} 
                    resizeMode="contain"
                  />
                ) : (
                  <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <Ionicons 
                      name="document-text" 
                      size={80} 
                      color={colors.white} 
                    />
                    <ModalTitle style={{ marginTop: spacing.md, fontSize: typography.sizes.lg }}>
                      {attachedFiles[selectedFileIndex].filename}
                    </ModalTitle>
                    <Text style={{ color: colors.white, marginTop: spacing.sm, textAlign: 'center' }}>
                      PDF files cannot be previewed in the app
                    </Text>
                  </View>
                )}
              </>
            )}
          </ImageContainer>
        </ModalContainer>
      </Modal>
    </Screen>
  );
};
