import React, { useState } from 'react';
import { ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { UserService } from '../../services/UserService';
import { CreateUserData } from '../../types/auth';

const Header = styled.View`
  background-color: ${colors.white};
  padding: ${spacing.lg}px;
  margin: 0 -${spacing.lg}px ${spacing.md}px -${spacing.lg}px;
  border-bottom-left-radius: ${borderRadius.xl}px;
  border-bottom-right-radius: ${borderRadius.xl}px;
`;

const HeaderContent = styled.View`
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
  text-align: center;
`;

const WelcomeSection = styled.View`
  align-items: center;
  margin-bottom: ${spacing.xl}px;
`;

const WelcomeIcon = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${colors.primary};
  justify-content: center;
  align-items: center;
  margin-bottom: ${spacing.md}px;
`;

const WelcomeTitle = styled.Text`
  font-size: ${typography.sizes.xxl}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.gray[900]};
  text-align: center;
  margin-bottom: ${spacing.sm}px;
`;

const WelcomeText = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[600]};
  text-align: center;
  line-height: 22px;
`;

const FormSection = styled.View`
  margin-bottom: ${spacing.xl}px;
`;

const ButtonContainer = styled.View`
  margin-top: ${spacing.lg}px;
  margin-bottom: ${spacing.xxl}px;
`;

interface UserRegistrationScreenProps {
  onUserRegistered?: () => void;
}

export const UserRegistrationScreen: React.FC<UserRegistrationScreenProps> = ({ 
  onUserRegistered 
}) => {
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    mobile: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateUserData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUserData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await UserService.createUser(formData);
      Alert.alert(
        'Welcome!',
        'Your profile has been created successfully. You can now start using the Construction App.',
        [{ 
          text: 'Get Started', 
          onPress: () => {
            onUserRegistered?.();
          }
        }]
      );
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Header>
          <HeaderContent>
            <Title>Welcome to Construction App</Title>
            <Subtitle>Let's set up your profile to get started</Subtitle>
          </HeaderContent>
        </Header>

        <ScrollView showsVerticalScrollIndicator={false}>
          <WelcomeSection>
            <WelcomeIcon>
              <Ionicons name="construct" size={40} color={colors.white} />
            </WelcomeIcon>
            <WelcomeTitle>First Time Setup</WelcomeTitle>
            <WelcomeText>
              Please provide your basic information to create your profile. 
              This will help us personalize your experience.
            </WelcomeText>
          </WelcomeSection>

          <Card padding="large">
            <FormSection>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                error={errors.name}
                autoCapitalize="words"
                autoComplete="name"
              />

              <Input
                label="Email Address"
                placeholder="Enter your email address"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Input
                label="Mobile Number"
                placeholder="Enter your mobile number"
                value={formData.mobile}
                onChangeText={(value) => handleInputChange('mobile', value)}
                error={errors.mobile}
                keyboardType="phone-pad"
                autoComplete="tel"
              />

              <Input
                label="Address"
                placeholder="Enter your address"
                value={formData.address}
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
                title={loading ? "Creating Profile..." : "Create Profile"}
                onPress={handleRegister}
                disabled={loading}
                variant="primary"
              />
            </ButtonContainer>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};
