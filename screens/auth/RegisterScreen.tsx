// screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import { RegisterScreenNavigationProp } from '../../types/navigation';
import { RegisterData } from '../../types/auth';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography } from '../../theme';

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: ${spacing.lg}px;
`;

const Title = styled.Text`
  font-size: ${typography.sizes.title}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.primary};
  text-align: center;
  margin-bottom: ${spacing.xl}px;
`;

const Subtitle = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[600]};
  text-align: center;
  margin-bottom: ${spacing.lg}px;
`;

const LinkContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: ${spacing.lg}px;
`;

const LinkText = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[600]};
`;

const LinkButton = styled.TouchableOpacity`
  margin-left: ${spacing.xs}px;
`;

const LinkButtonText = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.primary};
  font-weight: ${typography.weights.semibold};
`;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement actual register API call
      console.log('Register data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Account Created!',
        'Your account information has been saved. You can sync your data later.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Registration Failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Screen backgroundColor={colors.gray[100]}>
      <Container>
        <Title>Create Account</Title>
        <Subtitle>Enter your details to get started</Subtitle>
        
        <Card variant="elevated" padding="large">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            error={errors.name}
            leftIcon="person"
            autoCapitalize="words"
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            error={errors.email}
            leftIcon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            fullWidth
          />
        </Card>

        <LinkContainer>
          <LinkText>Already have an account?</LinkText>
          <LinkButton onPress={() => navigation.navigate('Login')}>
            <LinkButtonText>Sign In</LinkButtonText>
          </LinkButton>
        </LinkContainer>
      </Container>
    </Screen>
  );
};
