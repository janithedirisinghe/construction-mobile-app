// screens/DatabaseTestScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Screen } from '../components/common/Screen';
import { ProjectService, ExpenseService, FileService, SyncService } from '../services';
import { Project, Expense } from '../types';

export const DatabaseTestScreen: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const projectsData = await ProjectService.getAllProjects();
      const expensesData = await ExpenseService.getAllExpenses();
      const status = await SyncService.getSyncStatus();
      
      setProjects(projectsData);
      setExpenses(expensesData);
      setSyncStatus(status);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const createTestProject = async () => {
    try {
      const projectData = {
        title: newProjectTitle || `Test Project ${Date.now()}`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        targetBudget: 10000,
        description: 'This is a test project created via SQLite'
      };

      const projectId = await ProjectService.createProject(projectData);
      Alert.alert('Success', `Project created with ID: ${projectId}`);
      setNewProjectTitle('');
      loadData();
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project');
    }
  };

  const createTestExpense = async () => {
    if (projects.length === 0) {
      Alert.alert('Error', 'Please create a project first');
      return;
    }

    try {
      const expenseData = {
        title: `Test Expense ${Date.now()}`,
        amount: Math.floor(Math.random() * 1000) + 100,
        category: 'Materials' as const,
        expenseDate: new Date().toISOString().split('T')[0],
        notes: 'Test expense created via SQLite',
        projectId: projects[0].id
      };

      const expenseId = await ExpenseService.createExpense(expenseData);
      Alert.alert('Success', `Expense created with ID: ${expenseId}`);
      loadData();
    } catch (error) {
      console.error('Error creating expense:', error);
      Alert.alert('Error', 'Failed to create expense');
    }
  };

  const testSync = async () => {
    try {
      const result = await SyncService.syncAllData();
      Alert.alert(
        result.success ? 'Success' : 'Error', 
        result.message
      );
      loadData();
    } catch (error) {
      console.error('Error syncing:', error);
      Alert.alert('Error', 'Sync failed');
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete all test data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all expenses first (due to foreign key constraints)
              for (const expense of expenses) {
                await ExpenseService.deleteExpense(expense.id);
              }
              
              // Then delete all projects
              for (const project of projects) {
                await ProjectService.deleteProject(project.id);
              }
              
              Alert.alert('Success', 'All data deleted');
              loadData();
            } catch (error) {
              console.error('Error deleting data:', error);
              Alert.alert('Error', 'Failed to delete data');
            }
          }
        }
      ]
    );
  };

  return (
    <Screen style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>SQLite Database Test</Text>
        
        {/* Sync Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync Status</Text>
          {syncStatus && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                Connected: {syncStatus.isConnected ? '✅' : '❌'}
              </Text>
              <Text style={styles.statusText}>
                Pending Projects: {syncStatus.pendingSync.projects}
              </Text>
              <Text style={styles.statusText}>
                Pending Expenses: {syncStatus.pendingSync.expenses}
              </Text>
              <Text style={styles.statusText}>
                Pending Files: {syncStatus.pendingSync.files}
              </Text>
              {syncStatus.lastSyncTime && (
                <Text style={styles.statusText}>
                  Last Sync: {new Date(syncStatus.lastSyncTime).toLocaleString()}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Create Test Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create Test Data</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Project Title (optional)"
            value={newProjectTitle}
            onChangeText={setNewProjectTitle}
          />
          
          <TouchableOpacity style={styles.button} onPress={createTestProject}>
            <Text style={styles.buttonText}>Create Test Project</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={createTestExpense}>
            <Text style={styles.buttonText}>Create Test Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.button} onPress={loadData}>
            <Text style={styles.buttonText}>Refresh Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={testSync}>
            <Text style={styles.buttonText}>Test Sync</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearAllData}>
            <Text style={styles.buttonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* Projects Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects ({projects.length})</Text>
          {projects.map((project) => (
            <View key={project.id} style={styles.itemContainer}>
              <Text style={styles.itemTitle}>{project.title}</Text>
              <Text style={styles.itemText}>Budget: ${project.targetBudget}</Text>
              <Text style={styles.itemText}>Spent: ${project.totalSpent || 0}</Text>
              <Text style={styles.itemText}>ID: {project.id}</Text>
            </View>
          ))}
        </View>

        {/* Expenses Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expenses ({expenses.length})</Text>
          {expenses.map((expense) => (
            <View key={expense.id} style={styles.itemContainer}>
              <Text style={styles.itemTitle}>{expense.title}</Text>
              <Text style={styles.itemText}>Amount: ${expense.amount}</Text>
              <Text style={styles.itemText}>Category: {expense.category}</Text>
              <Text style={styles.itemText}>Project ID: {expense.projectId}</Text>
              <Text style={styles.itemText}>ID: {expense.id}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  itemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
});
