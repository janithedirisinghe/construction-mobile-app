import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { UserService } from '../../services/UserService';
import { User, UpdateUserData } from '../../types/auth';

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

const FormSection = styled.View`
  margin-bottom: ${spacing.xl}px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  gap: ${spacing.md}px;
  margin-top: ${spacing.lg}px;
  margin-bottom: ${spacing.xxl}px;
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

interface EditProfileScreenProps {
  onProfileUpdated?: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ 
  onProfileUpdated 
}) => {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UpdateUserData>({
    name: '',
    email: '',
    mobile: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<UpdateUserData>>({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await UserService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setFormData({
          name: currentUser.name,
          email: currentUser.email,
          mobile: currentUser.mobile,
          address: currentUser.address,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateUserData> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobile?.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UpdateUserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validateForm() || !user) {
      return;
    }

    try {
      setSaving(true);
      await UserService.updateUser(user.id, formData);
      Alert.alert(
        'Success',
        'Your profile has been updated successfully.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              onProfileUpdated?.();
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <Screen>
        <LoadingContainer>
          <LoadingText>Loading profile...</LoadingText>
        </LoadingContainer>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <LoadingContainer>
          <LoadingText>Profile not found</LoadingText>
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
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Header>
          <HeaderContent>
            <BackButton onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
            </BackButton>
            <HeaderText>
              <Title>Edit Profile</Title>
              <Subtitle>Update your information</Subtitle>
            </HeaderText>
            <Spacer />
          </HeaderContent>
        </Header>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Card padding="large">
            <FormSection>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name || ''}
                onChangeText={(value) => handleInputChange('name', value)}
                error={errors.name}
                autoCapitalize="words"
                autoComplete="name"
              />

              <Input
                label="Email Address"
                placeholder="Enter your email address"
                value={formData.email || ''}
                onChangeText={(value) => handleInputChange('email', value)}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Input
                label="Mobile Number"
                placeholder="Enter your mobile number"
                value={formData.mobile || ''}
                onChangeText={(value) => handleInputChange('mobile', value)}
                error={errors.mobile}
                keyboardType="phone-pad"
                autoComplete="tel"
              />

              <Input
                label="Address"
                placeholder="Enter your address"
                value={formData.address || ''}
                onChangeText={(value) => handleInputChange('address', value)}
                error={errors.address}
                multiline
                numberOfLines={3}
                autoCapitalize="words"
                autoComplete="street-address"
              />
            </FormSection>

            <ButtonContainer>
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="secondary"
              />
              <Button
                title={saving ? "Saving..." : "Save Changes"}
                onPress={handleSave}
                disabled={saving}
                variant="primary"
              />
            </ButtonContainer>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};
