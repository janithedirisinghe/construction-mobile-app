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

// Profile Screens
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';

// Project Screens (accessible from Home tab)
import { CreateProjectScreen } from '../screens/projects/CreateProjectScreen';
import { EditProjectScreen } from '../screens/projects/EditProjectScreen';
import { DashboardScreen } from '../screens/projects/DashboardScreen';

// Expense Screens
import { ExpenseListScreen } from '../screens/expenses/ExpenseListScreen';
import { AddExpenseScreen } from '../screens/expenses/AddExpenseScreen';
import { EditExpenseScreen } from '../screens/expenses/EditExpenseScreen';
import { ExpenseDetailScreen } from '../screens/expenses/ExpenseDetailScreen';

// Labor Screens
import { LaborManagementScreen } from '../screens/labor/LaborManagementScreen';
import { AddLaborScreen } from '../screens/labor/AddLaborScreen';
import { EditLaborScreen } from '../screens/labor/EditLaborScreen';
import { LaborDetailScreen } from '../screens/labor/LaborDetailScreen';
import { DailyAttendanceScreen } from '../screens/labor/DailyAttendanceScreen';
import { AttendanceHistoryScreen } from '../screens/labor/AttendanceHistoryScreen';
import { DatabaseTestScreen } from '../screens/DatabaseTestScreen';

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
        <Stack.Screen name="DatabaseTest" component={DatabaseTestScreen} />
        
        {/* Main Tab Navigator */}
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        
        {/* Profile Screens */}
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        
        {/* Project Screens (accessible from Home tab) */}
        <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
        <Stack.Screen name="EditProject" component={EditProjectScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        
        {/* Expense Screens */}
        <Stack.Screen name="ExpenseList" component={ExpenseListScreen} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
        <Stack.Screen name="EditExpense" component={EditExpenseScreen} />
        <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
        
        {/* Labor Screens */}
        <Stack.Screen name="LaborManagement" component={LaborManagementScreen} />
        <Stack.Screen name="AddLabor" component={AddLaborScreen} />
        <Stack.Screen name="EditLabor" component={EditLaborScreen} />
        <Stack.Screen name="LaborDetail" component={LaborDetailScreen} />
        <Stack.Screen name="DailyAttendance" component={DailyAttendanceScreen} />
        <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
