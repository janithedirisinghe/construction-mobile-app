// components/common/Screen.tsx
import React from 'react';
import { ViewProps } from 'react-native';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  backgroundColor?: string;
  padding?: boolean;
  includeTabBarPadding?: boolean;
}

const Container = styled.View<{ 
  backgroundColor: string; 
  padding: boolean;
  paddingTop: number;
  paddingBottom: number;
}>`
  flex: 1;
  background-color: ${props => props.backgroundColor};
  padding-top: ${props => props.paddingTop}px;
  padding-bottom: ${props => props.paddingBottom}px;
  ${props => props.padding ? `
    padding-left: ${spacing.md}px;
    padding-right: ${spacing.md}px;
  ` : ''}
`;

export const Screen: React.FC<ScreenProps> = ({
  children,
  backgroundColor = colors.gray[100],
  padding = true,
  includeTabBarPadding = false,
  ...props
}) => {
  const insets = useSafeAreaInsets();
  
  const paddingTop = padding ? Math.max(insets.top, spacing.md) : insets.top;
  const paddingBottom = includeTabBarPadding 
    ? (padding ? spacing.md : 0)
    : Math.max(insets.bottom, padding ? spacing.md : 0);

  return (
    <Container 
      backgroundColor={backgroundColor} 
      padding={padding}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      {...props}
    >
      {children}
    </Container>
  );
};
