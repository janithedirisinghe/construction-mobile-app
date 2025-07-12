import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './navigation/AppNavigator';
import { SplashScreen } from './screens/SplashScreen';
import { initializeDatabase } from './database';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize the database
        await initializeDatabase();
        setDbInitialized(true);
        console.log('Database initialized successfully');
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

  // Show splash screen while loading or database is initializing
  if (isLoading || !dbInitialized) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
