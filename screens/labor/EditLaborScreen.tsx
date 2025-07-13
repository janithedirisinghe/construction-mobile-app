// screens/labor/EditLaborScreen.tsx
import React, { useState, useEffect } from 'react';
import { Alert, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { EditLaborScreenNavigationProp, EditLaborScreenRouteProp } from '../../types/navigation';
import { Labor } from '../../types/labor';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { LaborService } from '../../services/LaborService';

interface Props {
  navigation: EditLaborScreenNavigationProp;
  route: EditLaborScreenRouteProp;
}

const Header = styled.View`
  background-color: ${colors.white};
  padding: ${spacing.lg}px;
  margin: 0 -${spacing.lg}px ${spacing.md}px -${spacing.lg}px;
  border-bottom-left-radius: ${borderRadius.xl}px;
  border-bottom-right-radius: ${borderRadius.xl}px;
`;

const HeaderContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.round}px;
  justify-content: center;
  align-items: center;
`;

const HeaderText = styled.View`
  flex: 1;
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

const Spacer = styled.View`
  width: 40px;
`;

const FormCard = styled(Card)`
  margin-bottom: ${spacing.lg}px;
`;

const SectionTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
  margin-bottom: ${spacing.md}px;
`;

const RoleSelector = styled.View`
  margin-bottom: ${spacing.md}px;
`;

const RoleLabel = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.gray[700]};
  margin-bottom: ${spacing.sm}px;
`;

const RoleGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${spacing.sm}px;
`;

const RoleOption = styled.TouchableOpacity<{ selected: boolean }>`
  background-color: ${props => props.selected ? colors.primary : colors.gray[100]};
  padding: ${spacing.sm}px ${spacing.md}px;
  border-radius: ${borderRadius.sm}px;
  border: 1px solid ${props => props.selected ? colors.primary : colors.gray[200]};
`;

const RoleText = styled.Text<{ selected: boolean }>`
  color: ${props => props.selected ? colors.white : colors.gray[700]};
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
`;

const StatusToggle = styled.View`
  margin-bottom: ${spacing.md}px;
`;

const StatusRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md}px;
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.md}px;
`;

const StatusLabel = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.gray[900]};
`;

const StatusSwitch = styled.TouchableOpacity<{ isActive: boolean }>`
  width: 50px;
  height: 30px;
  border-radius: 15px;
  background-color: ${props => props.isActive ? colors.success : colors.gray[300]};
  justify-content: center;
  align-items: ${props => props.isActive ? 'flex-end' : 'flex-start'};
  padding: 0 3px;
`;

const SwitchKnob = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${colors.white};
`;

const DeleteButtonContainer = styled.View`
  margin-top: ${spacing.md}px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${spacing.xl}px;
`;

const LoadingText = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.gray[500]};
  text-align: center;
  margin-top: ${spacing.md}px;
`;

const predefinedRoles = [
  'Mason',
  'Carpenter',
  'Electrician',
  'Plumber',
  'Painter',
  'Welder',
  'Helper',
  'Supervisor',
  'Driver',
  'Other'
];

export const EditLaborScreen: React.FC<Props> = ({ navigation, route }) => {
  const { laborId, projectId } = route.params;
  const [labor, setLabor] = useState<Labor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadLaborData();
  }, [laborId]);

  const loadLaborData = async () => {
    try {
      setLoading(true);
      const laborData = await LaborService.getLaborById(laborId);
      
      if (!laborData) {
        Alert.alert('Error', 'Labor not found');
        navigation.goBack();
        return;
      }

      setLabor(laborData);
      setName(laborData.name);
      setDailyRate(laborData.dailyRate.toString());
      setContactNumber(laborData.contactNumber || '');
      setIsActive(laborData.isActive);

      // Set role
      if (predefinedRoles.includes(laborData.role)) {
        setSelectedRole(laborData.role);
        setCustomRole('');
      } else {
        setSelectedRole('Other');
        setCustomRole(laborData.role);
      }
    } catch (error) {
      console.error('Error loading labor data:', error);
      Alert.alert('Error', 'Failed to load labor data');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter laborer name');
      return false;
    }

    if (!selectedRole) {
      Alert.alert('Validation Error', 'Please select a role');
      return false;
    }

    if (selectedRole === 'Other' && !customRole.trim()) {
      Alert.alert('Validation Error', 'Please enter custom role');
      return false;
    }

    if (!dailyRate.trim() || isNaN(Number(dailyRate)) || Number(dailyRate) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid daily rate');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const finalRole = selectedRole === 'Other' ? customRole.trim() : selectedRole;
      
      await LaborService.updateLabor(laborId, {
        name: name.trim(),
        role: finalRole,
        dailyRate: Number(dailyRate),
        contactNumber: contactNumber.trim() || undefined,
        isActive: isActive
      });

      Alert.alert('Success', 'Laborer updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating labor:', error);
      Alert.alert('Error', 'Failed to update laborer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!labor) return;

    try {
      // Check if labor can be deleted
      const { canDelete, reason } = await LaborService.canDeleteLabor(laborId);
      
      if (!canDelete) {
        Alert.alert(
          'Cannot Delete',
          reason || 'This laborer cannot be deleted due to existing records.',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Delete Laborer',
        `Are you sure you want to delete ${labor.name}? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await LaborService.deleteLabor(laborId);
                Alert.alert('Success', 'Laborer deleted successfully', [
                  { text: 'OK', onPress: () => navigation.navigate('LaborManagement', { projectId }) }
                ]);
              } catch (error) {
                console.error('Error deleting labor:', error);
                Alert.alert('Error', 'Failed to delete laborer');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error checking labor dependencies:', error);
      Alert.alert('Error', 'Failed to check if laborer can be deleted');
    }
  };

  if (loading) {
    return (
      <Screen>
        <LoadingContainer>
          <Ionicons name="person-outline" size={64} color={colors.gray[400]} />
          <LoadingText>Loading laborer data...</LoadingText>
        </LoadingContainer>
      </Screen>
    );
  }

  if (!labor) {
    return (
      <Screen>
        <LoadingContainer>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <LoadingText>Laborer not found</LoadingText>
        </LoadingContainer>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header>
        <HeaderContent>
          <BackButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
          </BackButton>
          <HeaderText>
            <Title>Edit Laborer</Title>
            <Subtitle>Update laborer information</Subtitle>
          </HeaderText>
          <Spacer />
        </HeaderContent>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <FormCard>
          <SectionTitle>Basic Information</SectionTitle>
          
          <Input
            label="Laborer Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter laborer name"
          />

          <RoleSelector>
            <RoleLabel>Role *</RoleLabel>
            <RoleGrid>
              {predefinedRoles.map((role) => (
                <RoleOption
                  key={role}
                  selected={selectedRole === role}
                  onPress={() => {
                    setSelectedRole(role);
                    if (role !== 'Other') {
                      setCustomRole('');
                    }
                  }}
                >
                  <RoleText selected={selectedRole === role}>{role}</RoleText>
                </RoleOption>
              ))}
            </RoleGrid>
          </RoleSelector>

          {selectedRole === 'Other' && (
            <Input
              label="Custom Role"
              value={customRole}
              onChangeText={setCustomRole}
              placeholder="Enter custom role"
            />
          )}

          <Input
            label="Daily Rate (LKR)"
            value={dailyRate}
            onChangeText={setDailyRate}
            placeholder="Enter daily rate"
            keyboardType="numeric"
          />

          <Input
            label="Contact Number"
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="Enter contact number (optional)"
            keyboardType="phone-pad"
          />

          <StatusToggle>
            <RoleLabel>Status</RoleLabel>
            <StatusRow>
              <StatusLabel>{isActive ? 'Active' : 'Inactive'}</StatusLabel>
              <StatusSwitch 
                isActive={isActive}
                onPress={() => setIsActive(!isActive)}
              >
                <SwitchKnob />
              </StatusSwitch>
            </StatusRow>
          </StatusToggle>
        </FormCard>

        <Button
          title={saving ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          disabled={saving}
          loading={saving}
        />

        <DeleteButtonContainer>
          <Button
            title="Delete Laborer"
            onPress={handleDelete}
            variant="outline"
          />
        </DeleteButtonContainer>
      </ScrollView>
    </Screen>
  );
};
