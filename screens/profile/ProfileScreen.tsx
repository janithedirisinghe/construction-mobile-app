import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ProfileScreenNavigationProp } from '../../types/navigation';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
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
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as any);
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings functionality will be implemented soon.');
  };

  const handleHelp = () => {
    Alert.alert('Help & Support', 'Help & support functionality will be implemented soon.');
  };

  const handleAbout = () => {
    Alert.alert('About', 'Construction App v1.0.0\nBuilt for construction project management.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // In a real app, you'd clear the authentication state here
            Alert.alert('Success', 'You have been logged out successfully.');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <Screen includeTabBarPadding={true}>
        <LoadingContainer>
          <LoadingText>Loading profile...</LoadingText>
        </LoadingContainer>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen includeTabBarPadding={true}>
        <LoadingContainer>
          <LoadingText>Profile not found</LoadingText>
          <Button
            title="Refresh"
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
          <Title>Profile</Title>
          <Subtitle>Manage your account settings</Subtitle>
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
            <SectionTitle>Account</SectionTitle>
            
            <MenuItem onPress={handleEditProfile}>
              <MenuIconContainer>
                <Ionicons name="person-outline" size={20} color={colors.gray[600]} />
              </MenuIconContainer>
              <MenuContent>
                <MenuTitle>Edit Profile</MenuTitle>
                <MenuSubtitle>Update your personal information</MenuSubtitle>
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
                <MenuTitle>Settings</MenuTitle>
                <MenuSubtitle>App preferences and notifications</MenuSubtitle>
              </MenuContent>
              <ChevronIcon>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </ChevronIcon>
            </MenuItem>
          </MenuSection>

          <MenuSection>
            <SectionTitle>Support</SectionTitle>
            
            <MenuItem onPress={handleHelp}>
              <MenuIconContainer>
                <Ionicons name="help-circle-outline" size={20} color={colors.gray[600]} />
              </MenuIconContainer>
              <MenuContent>
                <MenuTitle>Help & Support</MenuTitle>
                <MenuSubtitle>Get help and contact support</MenuSubtitle>
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
                <MenuTitle>About</MenuTitle>
                <MenuSubtitle>App version and information</MenuSubtitle>
              </MenuContent>
              <ChevronIcon>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </ChevronIcon>
            </MenuItem>
          </MenuSection>
        </Card>

        <LogoutButtonContainer>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
          />
        </LogoutButtonContainer>
      </ScrollView>
    </Screen>
  );
};
