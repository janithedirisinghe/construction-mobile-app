// components/common/Input.tsx
import React, { useState } from 'react';
import { TextInputProps } from 'react-native';
import styled from 'styled-components/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'search';
}

const Container = styled.View`
  margin-bottom: ${spacing.md}px;
`;

const Label = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.gray[700]};
  margin-bottom: ${spacing.xs}px;
`;

const InputContainer = styled.View<{ hasError: boolean; variant: string }>`
  flex-direction: row;
  align-items: center;
  background-color: ${colors.white};
  border-width: 1px;
  border-color: ${props => props.hasError ? colors.error : colors.gray[300]};
  border-radius: ${borderRadius.md}px;
  padding-horizontal: ${spacing.md}px;
  ${props => props.variant === 'search' ? `
    background-color: ${colors.gray[100]};
    border-color: transparent;
  ` : ''}
`;

const StyledTextInput = styled.TextInput`
  flex: 1;
  padding-vertical: ${spacing.md}px;
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[900]};
`;

const IconContainer = styled.TouchableOpacity`
  padding: ${spacing.xs}px;
`;

const ErrorText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.error};
  margin-top: ${spacing.xs}px;
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  secureTextEntry,
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  
  const toggleSecureEntry = () => {
    if (secureTextEntry) {
      setIsSecure(!isSecure);
    }
  };

  const finalRightIcon = secureTextEntry 
    ? (isSecure ? 'eye-off' : 'eye')
    : rightIcon;
    
  const finalOnRightIconPress = secureTextEntry 
    ? toggleSecureEntry 
    : onRightIconPress;

  return (
    <Container>
      {label && <Label>{label}</Label>}
      <InputContainer hasError={!!error} variant={variant}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={colors.gray[500]} 
            style={{ marginRight: spacing.sm }}
          />
        )}
        <StyledTextInput
          {...props}
          secureTextEntry={isSecure}
          placeholderTextColor={colors.gray[500]}
        />
        {finalRightIcon && (
          <IconContainer onPress={finalOnRightIconPress}>
            <Ionicons 
              name={finalRightIcon} 
              size={20} 
              color={colors.gray[500]} 
            />
          </IconContainer>
        )}
      </InputContainer>
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};
