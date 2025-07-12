// services/SyncService.ts
import { ProjectService } from './ProjectService';
import { ExpenseService } from './ExpenseService';
import { FileService } from './FileService';
import { executeSql, getAllAsync } from '../database';

export interface SyncStatus {
  isConnected: boolean;
  lastSyncTime?: string;
  pendingSync: {
    projects: number;
    expenses: number;
    files: number;
  };
}

export class SyncService {
  private static readonly SYNC_ENDPOINT = 'YOUR_API_ENDPOINT_HERE'; // Replace with your actual API endpoint
  private static isCurrentlySyncing = false;

  // Check if device is connected to internet
  static async checkConnectivity(): Promise<boolean> {
    try {
      // You can implement a more robust connectivity check here
      // For now, we'll assume connected if we can reach the server
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.SYNC_ENDPOINT}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log('No internet connectivity or server unreachable');
      return false;
    }
  }

  // Get current sync status
  static async getSyncStatus(): Promise<SyncStatus> {
    try {
      const isConnected = await this.checkConnectivity();
      
      // Get pending sync counts
      const unsyncedProjects = await ProjectService.getUnsyncedProjects();
      const unsyncedExpenses = await ExpenseService.getUnsyncedExpenses();
      const unsyncedFiles = await FileService.getUnsyncedFiles();

      // Get last sync time from local storage or database
      const lastSyncRecord = await this.getLastSyncTime();

      return {
        isConnected,
        lastSyncTime: lastSyncRecord,
        pendingSync: {
          projects: unsyncedProjects.length,
          expenses: unsyncedExpenses.length,
          files: unsyncedFiles.length,
        }
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        isConnected: false,
        pendingSync: {
          projects: 0,
          expenses: 0,
          files: 0,
        }
      };
    }
  }

  // Perform full sync
  static async syncAllData(): Promise<{ success: boolean; message: string }> {
    if (this.isCurrentlySyncing) {
      return { success: false, message: 'Sync already in progress' };
    }

    try {
      this.isCurrentlySyncing = true;

      // Check connectivity
      const isConnected = await this.checkConnectivity();
      if (!isConnected) {
        return { success: false, message: 'No internet connection' };
      }

      console.log('Starting full sync...');

      // Sync in order: Files first (for receipts), then Projects, then Expenses
      await this.syncFiles();
      await this.syncProjects();
      await this.syncExpenses();

      // Update last sync time
      await this.updateLastSyncTime();

      console.log('Full sync completed successfully');
      return { success: true, message: 'Sync completed successfully' };

    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, message: `Sync failed: ${error}` };
    } finally {
      this.isCurrentlySyncing = false;
    }
  }

  // Sync projects
  private static async syncProjects(): Promise<void> {
    const unsyncedProjects = await ProjectService.getUnsyncedProjects();
    
    for (const project of unsyncedProjects) {
      try {
        // Upload project to server
        const response = await fetch(`${this.SYNC_ENDPOINT}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            localId: project.id,
            title: project.title,
            startDate: project.startDate,
            endDate: project.endDate,
            targetBudget: project.targetBudget,
            description: project.description,
            totalSpent: project.totalSpent,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          // Mark as synced
          await ProjectService.markAsSynced(project.id);
          console.log(`Project ${project.id} synced successfully`);
        } else {
          console.error(`Failed to sync project ${project.id}:`, response.statusText);
        }
      } catch (error) {
        console.error(`Error syncing project ${project.id}:`, error);
      }
    }
  }

  // Sync expenses
  private static async syncExpenses(): Promise<void> {
    const unsyncedExpenses = await ExpenseService.getUnsyncedExpenses();
    
    for (const expense of unsyncedExpenses) {
      try {
        // Upload expense to server
        const response = await fetch(`${this.SYNC_ENDPOINT}/expenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            localId: expense.id,
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            expenseDate: expense.expenseDate,
            notes: expense.notes,
            receiptUrl: expense.receiptUrl,
            projectId: expense.projectId,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          // Mark as synced
          await ExpenseService.markAsSynced(expense.id);
          console.log(`Expense ${expense.id} synced successfully`);
        } else {
          console.error(`Failed to sync expense ${expense.id}:`, response.statusText);
        }
      } catch (error) {
        console.error(`Error syncing expense ${expense.id}:`, error);
      }
    }
  }

  // Sync files
  private static async syncFiles(): Promise<void> {
    const unsyncedFiles = await FileService.getUnsyncedFiles();
    
    for (const file of unsyncedFiles) {
      try {
        // Check if file still exists locally
        const fileExists = await FileService.fileExists(file.filePath);
        if (!fileExists) {
          console.warn(`File ${file.id} no longer exists locally, marking as synced`);
          await FileService.markAsSynced(file.id);
          continue;
        }

        // Upload file to server
        const formData = new FormData();
        formData.append('file', {
          uri: FileService.getFileUri(file.filePath),
          type: file.fileType === 'image' ? 'image/jpeg' : 'application/octet-stream',
          name: `file_${file.id}.${file.fileType === 'image' ? 'jpg' : 'pdf'}`,
        } as any);
        formData.append('entityType', file.entityType);
        formData.append('entityId', file.entityId.toString());
        formData.append('fileType', file.fileType);

        const response = await fetch(`${this.SYNC_ENDPOINT}/files`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.ok) {
          const result = await response.json();
          // Update with server URL and mark as synced
          await FileService.updateServerUrl(file.id, result.serverUrl);
          console.log(`File ${file.id} synced successfully`);
        } else {
          console.error(`Failed to sync file ${file.id}:`, response.statusText);
        }
      } catch (error) {
        console.error(`Error syncing file ${file.id}:`, error);
      }
    }
  }

  // Get last sync time
  private static async getLastSyncTime(): Promise<string | undefined> {
    try {
      const result = await getAllAsync(`
        SELECT value FROM app_settings WHERE key = 'lastSyncTime'
      `);
      return result.length > 0 ? result[0].value : undefined;
    } catch (error) {
      // Table might not exist yet, that's okay
      return undefined;
    }
  }

  // Update last sync time
  private static async updateLastSyncTime(): Promise<void> {
    try {
      const currentTime = new Date().toISOString();
      
      // Create settings table if it doesn't exist
      await executeSql(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert or update last sync time
      await executeSql(`
        INSERT OR REPLACE INTO app_settings (key, value, updated_at)
        VALUES ('lastSyncTime', ?, ?)
      `, [currentTime, currentTime]);

      console.log('Last sync time updated:', currentTime);
    } catch (error) {
      console.error('Error updating last sync time:', error);
    }
  }

  // Force sync a specific item
  static async forceSyncItem(type: 'project' | 'expense' | 'file', id: number): Promise<boolean> {
    try {
      const isConnected = await this.checkConnectivity();
      if (!isConnected) {
        throw new Error('No internet connection');
      }

      switch (type) {
        case 'project':
          const project = await ProjectService.getProjectById(id);
          if (project) {
            // Reset sync status and sync
            await executeSql('UPDATE projects SET synced = 0 WHERE id = ?', [id]);
            await this.syncProjects();
            return true;
          }
          break;

        case 'expense':
          const expense = await ExpenseService.getExpenseById(id);
          if (expense) {
            // Reset sync status and sync
            await executeSql('UPDATE expenses SET synced = 0 WHERE id = ?', [id]);
            await this.syncExpenses();
            return true;
          }
          break;

        case 'file':
          const file = await FileService.getFileById(id);
          if (file) {
            // Reset sync status and sync
            await executeSql('UPDATE files SET synced = 0 WHERE id = ?', [id]);
            await this.syncFiles();
            return true;
          }
          break;
      }

      return false;
    } catch (error) {
      console.error('Error force syncing item:', error);
      return false;
    }
  }
}
