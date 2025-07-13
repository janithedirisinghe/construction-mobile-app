# SQLite Integration for Construction Mobile App

This document explains how to use the SQLite database implementation in your React Native construction management app.

## Overview

The app now uses SQLite for local data storage with optional syncing to a remote server. This enables:
- **Offline functionality**: All data is stored locally and accessible without internet
- **Selective sync**: Users can choose when to sync data with the server
- **Image storage**: Images are stored in the device file system with paths in the database
- **Data integrity**: Proper foreign key relationships and constraints

## Database Structure

### Tables Created:
1. **projects** - Project information
2. **expenses** - Expense records linked to projects
3. **labor** - Labor/worker information
4. **labor_attendance** - Daily attendance tracking
5. **labor_expenses** - Labor payment records
6. **files** - File/image paths and metadata
7. **sync_queue** - Tracks items pending sync
8. **app_settings** - App configuration and sync status

## Services Available

### 1. ProjectService
Manages project CRUD operations:

```typescript
import { ProjectService } from './services';

// Create a project
const projectId = await ProjectService.createProject({
  title: 'New Building Project',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  targetBudget: 50000,
  description: 'Office building construction'
});

// Get all projects
const projects = await ProjectService.getAllProjects();

// Get project by ID
const project = await ProjectService.getProjectById(1);

// Update project
await ProjectService.updateProject(1, {
  title: 'Updated Project Name',
  targetBudget: 60000
});

// Delete project
await ProjectService.deleteProject(1);
```

### 2. ExpenseService
Manages expense tracking:

```typescript
import { ExpenseService } from './services';

// Create an expense
const expenseId = await ExpenseService.createExpense({
  title: 'Cement Purchase',
  amount: 500,
  category: 'Materials',
  expenseDate: '2025-01-15',
  notes: 'Purchased from ABC Suppliers',
  projectId: 1
});

// Get expenses for a project
const expenses = await ExpenseService.getExpensesByProject(1);

// Get filtered expenses
const filteredExpenses = await ExpenseService.getFilteredExpenses({
  category: 'Materials',
  startDate: '2025-01-01',
  endDate: '2025-01-31'
}, 'amount', 1); // Sort by amount for project 1

// Get expense statistics
const stats = await ExpenseService.getExpenseStats(1);
```

### 3. FileService
Handles image and file storage:

```typescript
import { FileService } from './services';

// Save an image (e.g., receipt photo)
const imagePath = await FileService.saveFile(
  'file:///path/to/image.jpg',
  'expense',
  expenseId,
  'image'
);

// Get files for an entity
const files = await FileService.getFilesForEntity('expense', expenseId);

// Delete a file
await FileService.deleteFile(fileId);
```

### 4. LaborService
Manages labor/workforce:

```typescript
import { LaborService } from './services';

// Add a worker
const laborId = await LaborService.createLabor({
  name: 'John Doe',
  role: 'Mason',
  dailyRate: 150,
  contactNumber: '+1234567890',
  projectId: 1
});

// Record attendance
await LaborService.recordAttendance({
  laborId: 1,
  date: '2025-01-15',
  isPresent: true,
  hoursWorked: 8,
  overtime: 2,
  notes: 'Worked on foundation'
});

// Get daily summary
const summary = await LaborService.getDailyLaborSummary(1, '2025-01-15');
```

### 5. SyncService
Handles data synchronization:

```typescript
import { SyncService } from './services';

// Check sync status
const status = await SyncService.getSyncStatus();

// Sync all data
const result = await SyncService.syncAllData();
if (result.success) {
  console.log('Sync completed successfully');
}

// Force sync specific item
await SyncService.forceSyncItem('project', projectId);
```

## How to Use in Your App

### 1. Database Initialization
The database is automatically initialized when the app starts (see `App.tsx`):

```typescript
import { initializeDatabase } from './database';

useEffect(() => {
  const initializeApp = async () => {
    try {
      await initializeDatabase();
      console.log('Database ready');
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  };
  
  initializeApp();
}, []);
```

### 2. Using in Screens
Import and use services in your screens:

```typescript
import React, { useState, useEffect } from 'react';
import { ProjectService, ExpenseService } from '../services';

export const ProjectScreen = () => {
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    loadProjects();
  }, []);
  
  const loadProjects = async () => {
    try {
      const data = await ProjectService.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };
  
  // Rest of your component...
};
```

### 3. Image/Receipt Handling
When users take photos of receipts:

```typescript
import * as ImagePicker from 'expo-image-picker';
import { FileService } from '../services';

const takeReceiptPhoto = async (expenseId: number) => {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    try {
      const imagePath = await FileService.saveFile(
        result.assets[0].uri,
        'expense',
        expenseId,
        'image'
      );
      
      // Update expense with receipt path
      await ExpenseService.updateExpense(expenseId, {
        receiptUrl: imagePath
      });
      
      console.log('Receipt saved successfully');
    } catch (error) {
      console.error('Failed to save receipt:', error);
    }
  }
};
```

## Data Flow

1. **Local Operations**: All CRUD operations work offline using SQLite
2. **Sync Tracking**: Changes are marked as `synced: 0` in the database
3. **User-Initiated Sync**: When user taps "Sync", unsynced data is uploaded
4. **File Handling**: Images are uploaded first, then database records are synced
5. **Conflict Resolution**: Server typically wins in case of conflicts

## Testing

Use the `DatabaseTestScreen` to test all functionality:

```typescript
import { DatabaseTestScreen } from '../screens/DatabaseTestScreen';

// Add to your navigation to test the implementation
```

## Server Integration

To complete the sync functionality, implement these API endpoints on your server:

- `POST /api/projects` - Create/update projects
- `POST /api/expenses` - Create/update expenses  
- `POST /api/files` - Upload files/images
- `GET /api/health` - Health check for connectivity

## Benefits

✅ **Offline-first**: App works without internet  
✅ **Selective sync**: Users control when to sync  
✅ **Local images**: Fast image display from local storage  
✅ **Data integrity**: Foreign key constraints and transactions  
✅ **Type safety**: Full TypeScript support  
✅ **Scalable**: Can handle thousands of records efficiently  

## Migration from Previous Version

If you had existing services, you can gradually migrate:

1. Keep existing services as fallbacks
2. Test SQLite services thoroughly
3. Switch over screen by screen
4. Remove old services once migration is complete

The SQLite implementation is now ready for production use!
