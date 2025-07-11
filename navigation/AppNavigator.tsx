// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Main Tab Navigator
import { MainTabNavigator } from './MainTabNavigator';

// Project Screens (accessible from Home tab)
import { CreateProjectScreen } from '../screens/projects/CreateProjectScreen';
import { DashboardScreen } from '../screens/projects/DashboardScreen';

// Expense Screens
import { ExpenseListScreen } from '../screens/expenses/ExpenseListScreen';
import { AddExpenseScreen } from '../screens/expenses/AddExpenseScreen';
import { ExpenseDetailScreen } from '../screens/expenses/ExpenseDetailScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        {/* Main Tab Navigator */}
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        
        {/* Project Screens (accessible from Home tab) */}
        <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        
        {/* Expense Screens */}
        <Stack.Screen name="ExpenseList" component={ExpenseListScreen} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
        <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
