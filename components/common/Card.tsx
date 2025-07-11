// components/common/Card.tsx
import React from 'react';
import { ViewProps } from 'react-native';
import styled from 'styled-components/native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const StyledCard = styled.View<{ variant: string; padding: string }>`
  background-color: ${colors.white};
  border-radius: ${borderRadius.lg}px;
  
  ${props => {
    let paddingValue = spacing.md;
    switch (props.padding) {
      case 'none':
        paddingValue = 0;
        break;
      case 'small':
        paddingValue = spacing.sm;
        break;
      case 'large':
        paddingValue = spacing.lg;
        break;
      default:
        paddingValue = spacing.md;
    }
    return `padding: ${paddingValue}px;`;
  }}
  
  ${props => {
    switch (props.variant) {
      case 'elevated':
        return `
          shadow-color: ${shadows.medium.shadowColor};
          shadow-offset: 0px 2px;
          shadow-opacity: ${shadows.medium.shadowOpacity};
          shadow-radius: ${shadows.medium.shadowRadius}px;
          elevation: ${shadows.medium.elevation};
        `;
      case 'outlined':
        return `
          border-width: 1px;
          border-color: ${colors.gray[200]};
        `;
      default:
        return `
          shadow-color: ${shadows.small.shadowColor};
          shadow-offset: 0px 1px;
          shadow-opacity: ${shadows.small.shadowOpacity};
          shadow-radius: ${shadows.small.shadowRadius}px;
          elevation: ${shadows.small.elevation};
        `;
    }
  }}
`;

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  ...props
}) => {
  return (
    <StyledCard variant={variant} padding={padding} {...props}>
      {children}
    </StyledCard>
  );
};
