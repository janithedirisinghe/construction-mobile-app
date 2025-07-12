// screens/projects/CreateProjectScreen.tsx
import React, { useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { CreateProjectScreenNavigationProp } from '../../types/navigation';
import { CreateProjectData } from '../../types/project';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { ProjectService } from '../../services/ProjectService';

interface Props {
  navigation: CreateProjectScreenNavigationProp;
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

const ActionButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.variant === 'primary' ? colors.primary : colors.white};
  padding: ${spacing.md}px ${spacing.lg}px;
  border-radius: ${borderRadius.xl}px;
  border: 2px solid ${props => props.variant === 'primary' ? colors.primary : colors.gray[300]};
  shadow-color: ${colors.black};
  shadow-offset: 0px 2px;
  shadow-opacity: ${props => props.variant === 'primary' ? 0.15 : 0.05};
  shadow-radius: 3px;
  elevation: ${props => props.variant === 'primary' ? 3 : 1};
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

const ErrorText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.error};
  margin-top: ${spacing.xs}px;
`;

export const CreateProjectScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    startDate: '',
    endDate: '',
    targetBudget: 0,
    description: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'startDate' | 'endDate'>('startDate');
  const [tempDate, setTempDate] = useState(new Date());

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.targetBudget || formData.targetBudget <= 0) {
      newErrors.targetBudget = 'Please enter a valid budget amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateProject = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const projectData: CreateProjectData = {
        ...formData,
        userId: 1, // TODO: Get from auth context
      };
      
      const newProject = await ProjectService.createProject(projectData);
      console.log('Project created:', newProject);
      
      Alert.alert(
        'Project Created!',
        'Your project has been created successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof CreateProjectData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
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

  const handleDatePress = (field: 'startDate' | 'endDate') => {
    setDatePickerMode(field);
    const currentDate = formData[field] ? new Date(formData[field]) : new Date();
    setTempDate(currentDate);
    setShowDatePicker(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || tempDate;
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      updateField(datePickerMode, formattedDate);
      
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const getMinDate = () => {
    if (datePickerMode === 'endDate' && formData.startDate) {
      const startDate = new Date(formData.startDate);
      startDate.setDate(startDate.getDate() + 1); // End date should be at least 1 day after start date
      return startDate;
    }
    return new Date(); // Start date should be today or later
  };

  return (
    <Screen>
      <Header>
        <HeaderContent>
          <BackButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.gray[700]} />
          </BackButton>
          
          <HeaderText>
            <Title>Create Project</Title>
            <Subtitle>Build your next great project</Subtitle>
          </HeaderText>
          
          <Spacer />
        </HeaderContent>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ProgressIndicator>
          <ProgressText>Step 1 of 1 - Project Details</ProgressText>
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
          
          <ActionButton variant="primary" onPress={handleCreateProject} disabled={loading}>
            {loading ? (
              <LoadingContainer>
                <ActivityIndicator size="small" color={colors.white} />
                <ActionButtonText variant="primary">Creating...</ActionButtonText>
              </LoadingContainer>
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color={colors.white} />
                <ActionButtonText variant="primary">Create</ActionButtonText>
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
            minimumDate={getMinDate()}
          />
        )}
      </ScrollView>
    </Screen>
  );
};
