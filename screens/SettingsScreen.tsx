import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text as RNText, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useCurrency, Currency } from '../contexts/CurrencyContext';
import { Screen } from '../components/common/Screen';

const SettingsScreen: React.FC = () => {
  const { currency, setCurrency, getCurrencyName } = useCurrency();
  const [showPicker, setShowPicker] = useState(false);

  const currencies: { value: Currency; label: string }[] = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'LKR', label: 'LKR - Sri Lankan Rupees' },
    { value: 'INR', label: 'INR - Indian Rupees' },
    { value: 'EUR', label: 'EUR - Euro' },
  ];

  return (
    <Screen>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <RNText style={styles.title}>Settings</RNText>

          <View style={styles.card}>
            <View style={styles.section}>
              <RNText style={styles.sectionTitle}>Regional</RNText>

              <View style={styles.setting}>
                <RNText style={styles.label}>Currency</RNText>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowPicker(true)}
                >
                  <RNText style={styles.pickerText}>{getCurrencyName()}</RNText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <RNText style={styles.modalTitle}>Select Currency</RNText>
              <Picker
                selectedValue={currency}
                onValueChange={(itemValue) => {
                  setCurrency(itemValue);
                  setShowPicker(false);
                }}
                style={styles.picker}
              >
                {currencies.map((item) => (
                  <Picker.Item key={item.value} label={item.label} value={item.value} />
                ))}
              </Picker>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPicker(false)}
              >
                <RNText style={styles.closeButtonText}>Close</RNText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  setting: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  pickerText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  picker: {
    height: 200,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SettingsScreen;
