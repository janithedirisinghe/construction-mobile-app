// screens/projects/EditProjectScreen.tsx
import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { EditProjectScreenNavigationProp, EditProjectScreenRouteProp } from '../../types/navigation';
import { CreateProjectData, Project } from '../../types/project';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { ProjectService } from '../../services/ProjectService';

interface Props {
  navigation: EditProjectScreenNavigationProp;
  route: EditProjectScreenRouteProp;
}

const Header = styled.View`
  background-color: ${colors.white};
  padding: ${spacing.lg}px;
  margin: 0 -${spacing.lg}px ${spacing.xs}px -${spacing.lg}px;
  border-bottom-left-radius: ${borderRadius.xl}px;
  border-bottom-right-radius: ${borderRadius.xl}px;
  shadow-color: ${shadows.medium.shadowColor};
  shadow-offset: ${shadows.medium.shadowOffset.width}px ${shadows.medium.shadowOffset.height}px;
  shadow-opacity: ${shadows.medium.shadowOpacity};
  shadow-radius: ${shadows.medium.shadowRadius}px;
  elevation: ${shadows.medium.elevation};
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

const DateLabel = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.gray[900]};
  margin-bottom: ${spacing.sm}px;
  margin-top: ${spacing.md}px;
`;

const DatePickerButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: ${colors.white};
  border: 2px solid ${colors.gray[300]};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.xs}px;
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

const ErrorText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.error};
  margin-top: ${spacing.xs}px;
  margin-left: ${spacing.sm}px;
`;

const ProgressIndicator = styled.View`
  background-color: ${colors.white};
  padding: ${spacing.md}px ${spacing.lg}px;
  margin: 0 -${spacing.lg}px ${spacing.md}px -${spacing.lg}px;
  border-radius: ${borderRadius.lg}px;
  align-items: center;
`;

const ProgressText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  font-weight: ${typography.weights.medium};
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

interface FormData extends CreateProjectData {
  id?: number;
}

interface FormErrors {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  targetBudget?: string;
}

export const EditProjectScreen: React.FC<Props> = ({ navigation, route }) => {
  const { projectId } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    targetBudget: 0,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<'startDate' | 'endDate'>('startDate');
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setInitialLoading(true);
      const projectData = await ProjectService.getProjectById(projectId);
      if (!projectData) {
        Alert.alert('Error', 'Project not found');
        navigation.goBack();
        return;
      }
      
      setProject(projectData);
      setFormData({
        id: projectData.id,
        title: projectData.title,
        description: projectData.description || '',
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        targetBudget: projectData.targetBudget,
      });
    } catch (error) {
      console.error('Error loading project:', error);
      Alert.alert('Error', 'Failed to load project details');
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
      newErrors.title = 'Project title is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (!formData.targetBudget || formData.targetBudget <= 0) {
      newErrors.targetBudget = 'Target budget must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProject = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before updating');
      return;
    }

    try {
      setLoading(true);
      
      const updateData: Partial<CreateProjectData> = {
        title: formData.title.trim(),
        description: formData.description?.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        targetBudget: formData.targetBudget,
      };

      await ProjectService.updateProject(projectId, updateData);
      
      Alert.alert(
        'Success',
        'Project updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          }
        ]
      );
    } catch (error) {
      console.error('Error updating project:', error);
      Alert.alert('Error', 'Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = () => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone and will also delete all associated expenses and labor records.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteProject,
        }
      ]
    );
  };

  const confirmDeleteProject = async () => {
    try {
      setLoading(true);
      await ProjectService.deleteProject(projectId);
      
      Alert.alert(
        'Success',
        'Project deleted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MainTabs'),
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting project:', error);
      Alert.alert('Error', 'Failed to delete project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDatePress = (field: 'startDate' | 'endDate') => {
    setCurrentDateField(field);
    const currentDate = formData[field] ? new Date(formData[field]) : new Date();
    setTempDate(currentDate);
    setShowDatePicker(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      updateField(currentDateField, dateString);
      
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return 'Select date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMinDate = (): Date => {
    if (currentDateField === 'endDate' && formData.startDate) {
      const startDate = new Date(formData.startDate);
      startDate.setDate(startDate.getDate() + 1);
      return startDate;
    }
    return new Date();
  };

  if (initialLoading) {
    return (
      <Screen>
        <LoadingScreen>
          <ActivityIndicator size="large" color={colors.primary} />
          <LoadingText>Loading project details...</LoadingText>
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
              <Title>Edit Project</Title>
              <Subtitle>Update project details</Subtitle>
            </HeaderText>
            <Spacer />
          </HeaderContent>
        </Header>

        <ProgressIndicator>
          <ProgressText>Editing: {project?.title}</ProgressText>
        </ProgressIndicator>

        <FormContainer padding="large">
          <FormSection>
            <SectionTitle>Basic Information</SectionTitle>
            <Input
              label="Project Title"
              placeholder="Enter project name"
              value={formData.title}
              onChangeText={(value) => updateField('title', value)}
              error={errors.title}
              leftIcon="hammer"
            />

            <Input
              label="Description (Optional)"
              placeholder="Enter project description"
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              error={errors.description}
              leftIcon="document-text"
              multiline
              numberOfLines={3}
            />
          </FormSection>

          <FormSection>
            <SectionTitle>Timeline</SectionTitle>
            <DateLabel>Start Date</DateLabel>
            <DatePickerButton onPress={() => handleDatePress('startDate')}>
              <DateIcon>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </DateIcon>
              <DateText hasValue={!!formData.startDate}>
                {formatDateForDisplay(formData.startDate)}
              </DateText>
            </DatePickerButton>
            {errors.startDate && (
              <ErrorText>{errors.startDate}</ErrorText>
            )}

            <DateLabel>End Date</DateLabel>
            <DatePickerButton onPress={() => handleDatePress('endDate')}>
              <DateIcon>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </DateIcon>
              <DateText hasValue={!!formData.endDate}>
                {formatDateForDisplay(formData.endDate)}
              </DateText>
            </DatePickerButton>
            {errors.endDate && (
              <ErrorText>{errors.endDate}</ErrorText>
            )}
          </FormSection>

          <FormSection>
            <SectionTitle>Budget</SectionTitle>
            <Input
              label="Target Budget (LKR)"
              placeholder="Enter total budget"
              value={formData.targetBudget ? formData.targetBudget.toString() : ''}
              onChangeText={(value) => updateField('targetBudget', parseFloat(value) || 0)}
              error={errors.targetBudget}
              leftIcon="wallet"
              keyboardType="numeric"
            />
          </FormSection>
        </FormContainer>

        <ButtonContainer>
          <ActionButton variant="secondary" onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={18} color={colors.gray[700]} />
            <ActionButtonText variant="secondary">Cancel</ActionButtonText>
          </ActionButton>
          
          <ActionButton variant="primary" onPress={handleUpdateProject} disabled={loading}>
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
          <ActionButton variant="danger" onPress={handleDeleteProject} disabled={loading}>
            <Ionicons name="trash" size={18} color={colors.white} />
            <ActionButtonText variant="danger">Delete Project</ActionButtonText>
          </ActionButton>
        </ButtonContainer>

        {showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={getMinDate()}
          />
        )}
      </ScrollView>
    </Screen>
  );
};
