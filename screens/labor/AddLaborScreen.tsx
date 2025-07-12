// screens/labor/AddLaborScreen.tsx
import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { AddLaborScreenNavigationProp, AddLaborScreenRouteProp } from '../../types/navigation';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface Props {
  navigation: AddLaborScreenNavigationProp;
  route: AddLaborScreenRouteProp;
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

const roles = [
  'Mason',
  'Carpenter',
  'Helper',
  'Electrician',
  'Plumber',
  'Painter',
  'Welder',
  'Driver',
  'Supervisor',
  'Other'
];

export const AddLaborScreen: React.FC<Props> = ({ navigation, route }) => {
  const { projectId } = route.params;
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    dailyRate: '',
    contactNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter laborer name');
      return false;
    }
    if (!formData.role) {
      Alert.alert('Error', 'Please select a role');
      return false;
    }
    if (!formData.dailyRate || parseFloat(formData.dailyRate) <= 0) {
      Alert.alert('Error', 'Please enter a valid daily rate');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success',
        'Laborer added successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding laborer:', error);
      Alert.alert('Error', 'Failed to add laborer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Header>
        <HeaderContent>
          <BackButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.gray[900]} />
          </BackButton>
          <HeaderText>
            <Title>Add Laborer</Title>
            <Subtitle>Add new team member</Subtitle>
          </HeaderText>
          <Spacer />
        </HeaderContent>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <FormCard>
          <SectionTitle>Basic Information</SectionTitle>
          
          <Input
            label="Full Name"
            placeholder="Enter laborer's full name"
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            autoCapitalize="words"
          />

          <RoleSelector>
            <RoleLabel>Role/Specialization</RoleLabel>
            <RoleGrid>
              {roles.map((role) => (
                <RoleOption
                  key={role}
                  selected={formData.role === role}
                  onPress={() => updateField('role', role)}
                >
                  <RoleText selected={formData.role === role}>{role}</RoleText>
                </RoleOption>
              ))}
            </RoleGrid>
          </RoleSelector>

          <Input
            label="Daily Rate (LKR)"
            placeholder="Enter daily wage rate"
            value={formData.dailyRate}
            onChangeText={(text) => updateField('dailyRate', text)}
            keyboardType="numeric"
          />

          <Input
            label="Contact Number (Optional)"
            placeholder="Enter phone number"
            value={formData.contactNumber}
            onChangeText={(text) => updateField('contactNumber', text)}
            keyboardType="phone-pad"
          />
        </FormCard>

        <Button
          title="Add Laborer"
          onPress={handleSave}
          loading={loading}
        />
      </ScrollView>
    </Screen>
  );
};
