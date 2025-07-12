// types/navigation.ts
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp, CompositeNavigationProp } from '@react-navigation/native';

// Bottom Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Analytics: undefined;
  Profile: undefined;
};

// Stack Navigator (for screens within tabs and auth)
export type RootStackParamList = {
  // Auth Screens
  Login: undefined;
  Register: undefined;
  
  // Main Tab Navigator
  MainTabs: undefined;
  
  // Project Screens (accessible from Home tab)
  CreateProject: undefined;
  Dashboard: { projectId: number };
  ExpenseList: { projectId: number };
  AddExpense: { projectId: number };
  ExpenseDetail: { expenseId: number; projectId: number };
  
  // Labor Management Screens
  LaborManagement: { projectId: number };
  AddLabor: { projectId: number };
  DailyAttendance: { projectId: number };
  LaborDetail: { laborId: number; projectId: number };
  AttendanceHistory: { projectId: number };
};

// Composite navigation types for tab screens
export type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

export type AnalyticsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Analytics'>,
  StackNavigationProp<RootStackParamList>
>;

export type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  StackNavigationProp<RootStackParamList>
>;

// Navigation prop types for each screen
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;
export type CreateProjectScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateProject'>;
export type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;
export type ExpenseListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExpenseList'>;
export type AddExpenseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddExpense'>;
export type ExpenseDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExpenseDetail'>;

// Labor screen navigation types
export type LaborManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LaborManagement'>;
export type AddLaborScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddLabor'>;
export type DailyAttendanceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DailyAttendance'>;
export type LaborDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LaborDetail'>;
export type AttendanceHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AttendanceHistory'>;

// Route prop types for screens that receive parameters
export type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;
export type ExpenseListScreenRouteProp = RouteProp<RootStackParamList, 'ExpenseList'>;
export type AddExpenseScreenRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;
export type ExpenseDetailScreenRouteProp = RouteProp<RootStackParamList, 'ExpenseDetail'>;

// Labor screen route types
export type LaborManagementScreenRouteProp = RouteProp<RootStackParamList, 'LaborManagement'>;
export type AddLaborScreenRouteProp = RouteProp<RootStackParamList, 'AddLabor'>;
export type DailyAttendanceScreenRouteProp = RouteProp<RootStackParamList, 'DailyAttendance'>;
export type LaborDetailScreenRouteProp = RouteProp<RootStackParamList, 'LaborDetail'>;
export type AttendanceHistoryScreenRouteProp = RouteProp<RootStackParamList, 'AttendanceHistory'>;
