import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './navigation/AppNavigator';
import { SplashScreen } from './screens/SplashScreen';
import { UserRegistrationScreen } from './screens/auth/UserRegistrationScreen';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { initializeDatabase } from './database';
import { OfflineStorageService, UserService } from './services';
import './i18n'; // Initialize i18n
// import { ImageSyncService } from './services'; // Online sync disabled

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [needsUserRegistration, setNeedsUserRegistration] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize the database
        await initializeDatabase();
        setDbInitialized(true);
        console.log('Database initialized successfully');
        
        // Check if user exists
        const hasUsers = await UserService.hasUsers();
        setNeedsUserRegistration(!hasUsers);
        
        // Initialize offline storage (online sync disabled)
        await OfflineStorageService.initializeStorage();
        console.log('Offline storage initialized successfully');
        
        // Online sync disabled
        // await ImageSyncService.syncOnAppStart();
        // console.log('Image sync completed');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // You might want to show an error screen here
      }
    };

    initializeApp();
  }, []);

  const handleSplashFinish = () => {
    if (dbInitialized) {
      setIsLoading(false);
    }
  };

  const handleUserRegistered = async () => {
    setNeedsUserRegistration(false);
  };

  // Show splash screen while loading or database is initializing
  if (isLoading || !dbInitialized) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Show user registration if no user exists
  if (needsUserRegistration) {
    return (
      <SafeAreaProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <UserRegistrationScreen onUserRegistered={handleUserRegistered} />
            <StatusBar style="auto" />
          </CurrencyProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </CurrencyProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
