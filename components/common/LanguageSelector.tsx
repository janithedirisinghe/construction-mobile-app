import React, { useState } from 'react';
import { Modal, TouchableOpacity, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage, Language } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

const LanguageSelectorButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: ${spacing.md}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.gray[200]};
`;

const LanguageIconContainer = styled.View`
  width: 40px;
  height: 40px;
  background-color: ${colors.gray[100]};
  border-radius: ${borderRadius.md}px;
  justify-content: center;
  align-items: center;
  margin-right: ${spacing.md}px;
`;

const LanguageContent = styled.View`
  flex: 1;
`;

const LanguageTitle = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.gray[900]};
`;

const LanguageSubtitle = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  margin-top: ${spacing.xs}px;
`;

const ChevronIcon = styled.View`
  margin-left: ${spacing.sm}px;
`;

// Modal components
const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.View`
  background-color: ${colors.white};
  border-radius: ${borderRadius.xl}px;
  width: 85%;
  max-height: 70%;
  overflow: hidden;
`;

const ModalHeader = styled.View`
  padding: ${spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.gray[200]};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.gray[900]};
`;

const CloseButton = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  border-radius: ${borderRadius.round}px;
  background-color: ${colors.gray[100]};
  justify-content: center;
  align-items: center;
`;

const LanguageOption = styled.TouchableOpacity<{ isSelected: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: ${spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.gray[100]};
  background-color: ${props => props.isSelected ? colors.primary + '10' : 'transparent'};
`;

const LanguageFlag = styled.View`
  width: 48px;
  height: 48px;
  border-radius: ${borderRadius.md}px;
  background-color: ${colors.primary};
  justify-content: center;
  align-items: center;
  margin-right: ${spacing.md}px;
`;

const LanguageFlagText = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.white};
`;

const LanguageInfo = styled.View`
  flex: 1;
`;

const LanguageName = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.gray[900]};
`;

const LanguageNativeName = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.gray[600]};
  margin-top: ${spacing.xs}px;
`;

const CheckIcon = styled.View<{ isVisible: boolean }>`
  opacity: ${props => props.isVisible ? 1 : 0};
`;

interface LanguageSelectorProps {
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLanguageInfo = languages.find((lang: any) => lang.code === currentLanguage);

  const handleLanguageSelect = async (language: Language) => {
    await changeLanguage(language);
    setModalVisible(false);
  };

  const getLanguageEmoji = (code: Language) => {
    switch (code) {
      case 'en': return '🇬🇧';
      case 'si': return '🇱🇰';
      case 'ta': return '🇱🇰';
      default: return '🌐';
    }
  };

  return (
    <>
      <LanguageSelectorButton style={style} onPress={() => setModalVisible(true)}>
        <LanguageIconContainer>
          <Ionicons name="language" size={20} color={colors.gray[600]} />
        </LanguageIconContainer>
        <LanguageContent>
          <LanguageTitle>Language</LanguageTitle>
          <LanguageSubtitle>{currentLanguageInfo?.nativeName}</LanguageSubtitle>
        </LanguageContent>
        <ChevronIcon>
          <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
        </ChevronIcon>
      </LanguageSelectorButton>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Select Language</ModalTitle>
              <CloseButton onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color={colors.gray[600]} />
              </CloseButton>
            </ModalHeader>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {languages.map((language: any) => (
                <LanguageOption
                  key={language.code}
                  isSelected={language.code === currentLanguage}
                  onPress={() => handleLanguageSelect(language.code)}
                >
                  <LanguageFlag>
                    <LanguageFlagText>
                      {getLanguageEmoji(language.code)}
                    </LanguageFlagText>
                  </LanguageFlag>
                  <LanguageInfo>
                    <LanguageName>{language.name}</LanguageName>
                    <LanguageNativeName>{language.nativeName}</LanguageNativeName>
                  </LanguageInfo>
                  <CheckIcon isVisible={language.code === currentLanguage}>
                    <Ionicons name="checkmark" size={24} color={colors.primary} />
                  </CheckIcon>
                </LanguageOption>
              ))}
            </ScrollView>
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </>
  );
};
