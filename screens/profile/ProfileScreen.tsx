import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ProfileScreenNavigationProp } from '../../types/navigation';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { UserService } from '../../services/UserService';
import { User } from '../../types/auth';

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
`;

const ProfileSection = styled.View`
  align-items: center;
  margin-bottom: ${spacing.xl}px;
`;

const Avatar = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: ${colors.primary};
  justify-content: center;
  align-items: center;
  margin-bottom: ${spacing.md}px;
`;

const AvatarText = styled.Text`
  font-size: ${typography.sizes.xxxl}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.white};
`;

const UserName = styled.Text`
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.gray[900]};
  text-align: center;
`;

const UserEmail = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[600]};
  margin-top: ${spacing.xs}px;
  text-align: center;
`;

const UserRole = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.primary};
  background-color: ${colors.primary}20;
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.md}px;
  margin-top: ${spacing.sm}px;
  overflow: hidden;
`;

const MenuSection = styled.View`
  margin-bottom: ${spacing.lg}px;
`;

const SectionTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
  margin-bottom: ${spacing.md}px;
`;

const MenuItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: ${spacing.md}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.gray[200]};
`;

const MenuIconContainer = styled.View`
  width: 40px;
  height: 40px;
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.md}px;
  justify-content: center;
  align-items: center;
  margin-right: ${spacing.md}px;
`;

const MenuContent = styled.View`
  flex: 1;
`;

const MenuTitle = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.gray[900]};
`;

const MenuSubtitle = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  margin-top: ${spacing.xs}px;
`;

const ChevronIcon = styled.View`
  margin-left: ${spacing.sm}px;
`;

const LogoutButtonContainer = styled.View`
  margin-top: ${spacing.xl}px;
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

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await UserService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert(t('editProfile.errorTitle'), t('profile.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as any);
  };

  const handleSettings = () => {
    Alert.alert(t('profile.settings'), t('profile.settingsComingSoon'));
  };

  const handleHelp = () => {
    Alert.alert(t('profile.helpSupport'), t('profile.helpComingSoon'));
  };

  const handleAbout = () => {
    Alert.alert(t('profile.about'), t('profile.aboutMessage'));
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirmMessage'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        { 
          text: t('profile.logout'), 
          style: 'destructive',
          onPress: () => {
            // In a real app, you'd clear the authentication state here
            Alert.alert(t('editProfile.successTitle'), t('profile.logoutSuccess'));
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <Screen includeTabBarPadding={true}>
        <LoadingContainer>
          <LoadingText>{t('profile.loading')}</LoadingText>
        </LoadingContainer>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen includeTabBarPadding={true}>
        <LoadingContainer>
          <LoadingText>{t('profile.notFound')}</LoadingText>
          <Button
            title={t('profile.refresh')}
            onPress={loadUserData}
            variant="primary"
          />
        </LoadingContainer>
      </Screen>
    );
  }

  const userInitials = UserService.getUserInitials(user.name);

  return (
    <Screen includeTabBarPadding={true}>
      <Header>
        <HeaderContent>
          <Title>{t('profile.title')}</Title>
          <Subtitle>{t('profile.subtitle')}</Subtitle>
        </HeaderContent>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileSection>
          <Avatar>
            <AvatarText>{userInitials}</AvatarText>
          </Avatar>
          <UserName>{user.name}</UserName>
          <UserEmail>{user.email}</UserEmail>
        </ProfileSection>

        <Card padding="large">
          <MenuSection>
            <SectionTitle>{t('profile.account')}</SectionTitle>
            
            <MenuItem onPress={handleEditProfile}>
              <MenuIconContainer>
                <Ionicons name="person-outline" size={20} color={colors.gray[600]} />
              </MenuIconContainer>
              <MenuContent>
                <MenuTitle>{t('profile.editProfile')}</MenuTitle>
                <MenuSubtitle>{t('profile.editProfileDescription')}</MenuSubtitle>
              </MenuContent>
              <ChevronIcon>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </ChevronIcon>
            </MenuItem>

            <MenuItem onPress={handleSettings}>
              <MenuIconContainer>
                <Ionicons name="settings-outline" size={20} color={colors.gray[600]} />
              </MenuIconContainer>
              <MenuContent>
                <MenuTitle>{t('profile.settings')}</MenuTitle>
                <MenuSubtitle>{t('profile.settingsDescription')}</MenuSubtitle>
              </MenuContent>
              <ChevronIcon>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </ChevronIcon>
            </MenuItem>

            <LanguageSelector />
          </MenuSection>

          <MenuSection>
            <SectionTitle>{t('profile.support')}</SectionTitle>
            
            <MenuItem onPress={handleHelp}>
              <MenuIconContainer>
                <Ionicons name="help-circle-outline" size={20} color={colors.gray[600]} />
              </MenuIconContainer>
              <MenuContent>
                <MenuTitle>{t('profile.helpSupport')}</MenuTitle>
                <MenuSubtitle>{t('profile.helpSupportDescription')}</MenuSubtitle>
              </MenuContent>
              <ChevronIcon>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </ChevronIcon>
            </MenuItem>

            <MenuItem onPress={handleAbout} style={{ borderBottomWidth: 0 }}>
              <MenuIconContainer>
                <Ionicons name="information-circle-outline" size={20} color={colors.gray[600]} />
              </MenuIconContainer>
              <MenuContent>
                <MenuTitle>{t('profile.about')}</MenuTitle>
                <MenuSubtitle>{t('profile.aboutDescription')}</MenuSubtitle>
              </MenuContent>
              <ChevronIcon>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </ChevronIcon>
            </MenuItem>
          </MenuSection>
        </Card>

        <LogoutButtonContainer>
          <Button
            title={t('profile.logout')}
            onPress={handleLogout}
            variant="secondary"
          />
        </LogoutButtonContainer>
      </ScrollView>
    </Screen>
  );
};
