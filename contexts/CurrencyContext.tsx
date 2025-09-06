import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Currency = 'USD' | 'LKR' | 'INR' | 'EUR';

export interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getCurrencySymbol: () => string;
  getCurrencyName: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('LKR');

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const storedCurrency = await AsyncStorage.getItem('selectedCurrency');
        if (storedCurrency && ['USD', 'LKR', 'INR', 'EUR'].includes(storedCurrency)) {
          setCurrencyState(storedCurrency as Currency);
        }
      } catch (error) {
        console.error('Error loading currency:', error);
      }
    };
    loadCurrency();
  }, []);

  const setCurrency = async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      await AsyncStorage.setItem('selectedCurrency', newCurrency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  const getCurrencySymbol = (): string => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'LKR':
        return 'Rs';
      case 'INR':
        return '₹';
      case 'EUR':
        return '€';
      default:
        return 'Rs';
    }
  };

  const getCurrencyName = (): string => {
    switch (currency) {
      case 'USD':
        return 'USD';
      case 'LKR':
        return 'Sri Lankan Rupees';
      case 'INR':
        return 'Indian Rupees';
      case 'EUR':
        return 'Euro';
      default:
        return 'Sri Lankan Rupees';
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, getCurrencySymbol, getCurrencyName }}>
      {children}
    </CurrencyContext.Provider>
  );
};
