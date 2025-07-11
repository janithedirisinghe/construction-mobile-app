// types/navigation.ts
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ProjectList: undefined;
  CreateProject: undefined;
  Dashboard: { projectId: number };
  ExpenseList: { projectId: number };
  AddExpense: { projectId: number };
  ExpenseDetail: { expenseId: number; projectId: number };
};

// Navigation prop types for each screen
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;
export type ProjectListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProjectList'>;
export type CreateProjectScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateProject'>;
export type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;
export type ExpenseListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExpenseList'>;
export type AddExpenseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddExpense'>;
export type ExpenseDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ExpenseDetail'>;

// Route prop types for screens that receive parameters
export type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;
export type ExpenseListScreenRouteProp = RouteProp<RootStackParamList, 'ExpenseList'>;
export type AddExpenseScreenRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;
export type ExpenseDetailScreenRouteProp = RouteProp<RootStackParamList, 'ExpenseDetail'>;
