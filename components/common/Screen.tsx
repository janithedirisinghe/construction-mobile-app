// components/common/Screen.tsx
import React from 'react';
import { ViewProps } from 'react-native';
import styled from 'styled-components/native';
import { colors, spacing } from '../../theme';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  backgroundColor?: string;
  padding?: boolean;
}

const Container = styled.View<{ backgroundColor: string; padding: boolean }>`
  flex: 1;
  background-color: ${props => props.backgroundColor};
  ${props => props.padding ? `padding: ${spacing.md}px;` : ''}
`;

const SafeContainer = styled.SafeAreaView<{ backgroundColor: string; padding: boolean }>`
  flex: 1;
  background-color: ${props => props.backgroundColor};
  ${props => props.padding ? `padding: ${spacing.md}px;` : ''}
`;

export const Screen: React.FC<ScreenProps> = ({
  children,
  backgroundColor = colors.gray[100],
  padding = true,
  ...props
}) => {
  return (
    <SafeContainer backgroundColor={backgroundColor} padding={padding} {...props}>
      {children}
    </SafeContainer>
  );
};
