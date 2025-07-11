// screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import { LoginScreenNavigationProp } from '../../types/navigation';
import { LoginData } from '../../types/auth';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography } from '../../theme';

interface Props {
  navigation: LoginScreenNavigationProp;
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

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement actual login API call
      console.log('Login data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to ProjectList on successful login
      navigation.navigate('ProjectList');
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Screen backgroundColor={colors.gray[100]}>
      <Container>
        <Title>Construction Tracker</Title>
        
        <Card variant="elevated" padding="large">
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

          <Input
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            error={errors.password}
            leftIcon="lock-closed"
            secureTextEntry
          />

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            fullWidth
          />
        </Card>

        <LinkContainer>
          <LinkText>Don't have an account?</LinkText>
          <LinkButton onPress={() => navigation.navigate('Register')}>
            <LinkButtonText>Sign Up</LinkButtonText>
          </LinkButton>
        </LinkContainer>
      </Container>
    </Screen>
  );
};
