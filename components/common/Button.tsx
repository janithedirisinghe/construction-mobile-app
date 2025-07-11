// components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const getButtonColors = (variant: string, disabled: boolean) => {
  if (disabled) {
    return {
      backgroundColor: colors.gray[300],
      textColor: colors.gray[500],
    };
  }

  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.primary,
        textColor: colors.white,
      };
    case 'secondary':
      return {
        backgroundColor: colors.secondary,
        textColor: colors.white,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        textColor: colors.primary,
        borderColor: colors.primary,
      };
    default:
      return {
        backgroundColor: colors.primary,
        textColor: colors.white,
      };
  }
};

const getButtonSize = (size: string) => {
  switch (size) {
    case 'small':
      return {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        fontSize: typography.sizes.sm,
      };
    case 'large':
      return {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        fontSize: typography.sizes.lg,
      };
    default: // medium
      return {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        fontSize: typography.sizes.md,
      };
  }
};

const StyledButton = styled(TouchableOpacity)<{
  variant: string;
  size: string;
  disabled: boolean;
  fullWidth: boolean;
}>`
  ${(props) => {
    const colors = getButtonColors(props.variant, props.disabled);
    const size = getButtonSize(props.size);
    
    return `
      background-color: ${colors.backgroundColor};
      padding-vertical: ${size.paddingVertical}px;
      padding-horizontal: ${size.paddingHorizontal}px;
      border-radius: ${borderRadius.md}px;
      align-items: center;
      justify-content: center;
      flex-direction: row;
      ${props.fullWidth ? 'align-self: stretch;' : ''}
      ${props.variant === 'outline' ? `border-width: 1px; border-color: ${colors.borderColor};` : ''}
      ${!props.disabled ? `
        shadow-color: ${shadows.small.shadowColor};
        shadow-offset: 0px 1px;
        shadow-opacity: ${shadows.small.shadowOpacity};
        shadow-radius: ${shadows.small.shadowRadius}px;
        elevation: ${shadows.small.elevation};
      ` : ''}
    `;
  }}
`;

const ButtonText = styled.Text<{
  variant: string;
  size: string;
  disabled: boolean;
}>`
  ${(props) => {
    const colors = getButtonColors(props.variant, props.disabled);
    const size = getButtonSize(props.size);
    
    return `
      color: ${colors.textColor};
      font-size: ${size.fontSize}px;
      font-weight: ${typography.weights.semibold};
    `;
  }}
`;

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={getButtonColors(variant, disabled).textColor} 
          size="small" 
        />
      ) : (
        <ButtonText
          variant={variant}
          size={size}
          disabled={disabled}
        >
          {title}
        </ButtonText>
      )}
    </StyledButton>
  );
};
