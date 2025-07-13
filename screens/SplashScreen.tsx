// screens/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { Dimensions, StatusBar, Animated } from 'react-native';
import styled from 'styled-components/native';
import { colors, spacing, typography, borderRadius } from '../theme';

interface Props {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

const Container = styled.View`
  flex: 1;
  background-color: ${colors.primary};
  justify-content: center;
  align-items: center;
  padding: ${spacing.xl}px;
`;

const LogoContainer = styled.View`
  align-items: center;
  flex: 1;
  justify-content: center;
`;

const LogoCircle = styled.View`
  width: 120px;
  height: 120px;
  background-color: ${colors.white};
  border-radius: 60px;
  justify-content: center;
  align-items: center;
  shadow-color: ${colors.black};
  shadow-offset: 0px 8px;
  shadow-opacity: 0.3;
  shadow-radius: 16px;
  elevation: 16;
  margin-bottom: ${spacing.lg}px;
`;

const LogoText = styled.Text`
  font-size: 36px;
  font-weight: ${typography.weights.bold};
  color: ${colors.primary};
  letter-spacing: -1px;
`;

const AppName = styled.Text`
  font-size: ${typography.sizes.xxxl}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.white};
  text-align: center;
  margin-bottom: ${spacing.sm}px;
  letter-spacing: 1px;
`;

const Tagline = styled.Text`
  font-size: ${typography.sizes.lg}px;
  color: ${colors.white}90;
  text-align: center;
  font-weight: ${typography.weights.medium};
`;


const BottomContainer = styled.View`
  align-items: center;
  position: absolute;
  bottom: ${spacing.xxl}px;
  left: 0;
  right: 0;
`;

const LoadingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${spacing.lg}px;
`;

const LoadingDot = styled(Animated.View)<{ delay: number }>`
  width: 8px;
  height: 8px;
  background-color: ${colors.white};
  border-radius: 4px;
  margin: 0 4px;
`;

const VersionText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.white}60;
  text-align: center;
`;



export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const opacity1 = useRef(new Animated.Value(0.3)).current;
  const opacity2 = useRef(new Animated.Value(0.3)).current;
  const opacity3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = () => {
      const createAnimation = (animatedValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 600,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
      };

      Animated.parallel([
        createAnimation(opacity1, 0),
        createAnimation(opacity2, 200),
        createAnimation(opacity3, 400),
      ]).start();
    };

    animateDots();

    const timer = setTimeout(() => {
      onFinish();
    }, 4000); // Show splash for 4 seconds

    return () => clearTimeout(timer);
  }, [onFinish, opacity1, opacity2, opacity3]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Container>
        <LogoContainer>
          <LogoCircle>
            <LogoText>BT</LogoText>
          </LogoCircle>
          <AppName>BuildTrack</AppName>
          <Tagline>Construction Budget Management</Tagline>
        </LogoContainer>

        <BottomContainer>
          <LoadingContainer>
            <LoadingDot delay={0} style={{ opacity: opacity1 }} />
            <LoadingDot delay={200} style={{ opacity: opacity2 }} />
            <LoadingDot delay={400} style={{ opacity: opacity3 }} />
          </LoadingContainer>
          <VersionText>Version 1.0.0</VersionText>
        </BottomContainer>
      </Container>
    </>
  );
};
