import React from 'react';
import { ScrollView, Alert } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ProfileScreenNavigationProp } from '../../types/navigation';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { colors, spacing, typography, borderRadius } from '../../theme';

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

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit profile functionality will be implemented soon.');
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

  const handleDatabaseTest = () => {
    navigation.navigate('DatabaseTest');
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
            <AvatarText>JD</AvatarText>
          </Avatar>
          <UserName>John Doe</UserName>
          <UserEmail>john.doe@example.com</UserEmail>
          <UserRole>Project Manager</UserRole>
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

            <MenuItem onPress={handleAbout}>
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

            <MenuItem onPress={handleDatabaseTest} style={{ borderBottomWidth: 0 }}>
              <MenuIconContainer>
                <Ionicons name="construct-outline" size={20} color={colors.gray[600]} />
              </MenuIconContainer>
              <MenuContent>
                <MenuTitle>Database Test</MenuTitle>
                <MenuSubtitle>Test SQLite functionality</MenuSubtitle>
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
