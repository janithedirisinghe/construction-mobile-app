import * as FileSystem from 'expo-file-system';

// Simple UUID generator for React Native
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export interface OfflineFile {
  id: string;
  localUri: string;
  originalUri: string;
  filename: string;
  mimeType: string;
  size: number;
  fileType: 'image' | 'pdf' | 'document';
  expenseId?: string;
  synced: boolean;
  createdAt: string;
}

// Legacy interface for backward compatibility
export interface OfflineImage extends OfflineFile {}

export class OfflineStorageService {
  private static FILES_DIR = `${FileSystem.documentDirectory}expense_files/`;
  private static FILES_INDEX_FILE = `${FileSystem.documentDirectory}files_index.json`;
  // Legacy paths for backward compatibility
  private static IMAGES_DIR = `${FileSystem.documentDirectory}expense_images/`;
  private static IMAGES_INDEX_FILE = `${FileSystem.documentDirectory}images_index.json`;

  static async initializeStorage(): Promise<void> {
    try {
      // Create files directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(this.FILES_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.FILES_DIR, { intermediates: true });
      }

      // Create index file if it doesn't exist
      const indexInfo = await FileSystem.getInfoAsync(this.FILES_INDEX_FILE);
      if (!indexInfo.exists) {
        await FileSystem.writeAsStringAsync(this.FILES_INDEX_FILE, JSON.stringify([]));
      }

      // Migrate old images to new files structure
      await this.migrateOldImages();
    } catch (error) {
      console.error('Error initializing offline storage:', error);
    }
  }

  private static async migrateOldImages(): Promise<void> {
    try {
      const oldIndexInfo = await FileSystem.getInfoAsync(this.IMAGES_INDEX_FILE);
      if (oldIndexInfo.exists) {
        const oldIndexContent = await FileSystem.readAsStringAsync(this.IMAGES_INDEX_FILE);
        const oldImages = JSON.parse(oldIndexContent) || [];
        
        const newFiles: OfflineFile[] = [];
        for (const oldImage of oldImages) {
          const newFile: OfflineFile = {
            ...oldImage,
            fileType: 'image'
          };
          newFiles.push(newFile);
        }
        
        if (newFiles.length > 0) {
          const currentFiles = await this.getFilesIndex();
          const combinedFiles = [...currentFiles, ...newFiles];
          await FileSystem.writeAsStringAsync(this.FILES_INDEX_FILE, JSON.stringify(combinedFiles));
        }
        
        // Remove old index file after migration
        await FileSystem.deleteAsync(this.IMAGES_INDEX_FILE, { idempotent: true });
      }
    } catch (error) {
      console.error('Error migrating old images:', error);
    }
  }

  static async saveImageOffline(imageUri: string, expenseId?: string): Promise<OfflineFile | null> {
    return this.saveFileOffline(imageUri, 'image', expenseId);
  }

  static async saveFileOffline(fileUri: string, fileType: 'image' | 'pdf' | 'document', expenseId?: string): Promise<OfflineFile | null> {
    try {
      await this.initializeStorage();

      const fileId = generateUUID();
      const fileExtension = fileUri.split('.').pop() || (fileType === 'image' ? 'jpg' : 'pdf');
      const filename = `${fileId}.${fileExtension}`;
      const localUri = `${this.FILES_DIR}${filename}`;

      // Copy file to local storage
      await FileSystem.copyAsync({
        from: fileUri,
        to: localUri
      });

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      const fileSize = fileInfo.exists && !fileInfo.isDirectory ? fileInfo.size : 0;
      
      // Determine MIME type
      let mimeType: string;
      if (fileType === 'image') {
        mimeType = `image/${fileExtension}`;
      } else if (fileType === 'pdf') {
        mimeType = 'application/pdf';
      } else {
        mimeType = 'application/octet-stream';
      }
      
      const offlineFile: OfflineFile = {
        id: fileId,
        localUri,
        originalUri: fileUri,
        filename,
        mimeType,
        size: fileSize,
        fileType,
        expenseId,
        synced: false,
        createdAt: new Date().toISOString()
      };

      // Update index
      await this.addToIndex(offlineFile);

      return offlineFile;
    } catch (error) {
      console.error('Error saving file offline:', error);
      return null;
    }
  }

  static async getFilesIndex(): Promise<OfflineFile[]> {
    try {
      const indexContent = await FileSystem.readAsStringAsync(this.FILES_INDEX_FILE);
      return JSON.parse(indexContent) || [];
    } catch (error) {
      console.error('Error reading files index:', error);
      return [];
    }
  }

  // Legacy method for backward compatibility
  static async getImagesIndex(): Promise<OfflineImage[]> {
    const files = await this.getFilesIndex();
    return files.filter(file => file.fileType === 'image');
  }

  private static async addToIndex(file: OfflineFile): Promise<void> {
    try {
      const currentIndex = await this.getFilesIndex();
      currentIndex.push(file);
      await FileSystem.writeAsStringAsync(this.FILES_INDEX_FILE, JSON.stringify(currentIndex));
    } catch (error) {
      console.error('Error updating files index:', error);
    }
  }

  static async updateFileSyncStatus(fileId: string, synced: boolean, remoteUrl?: string): Promise<void> {
    try {
      const currentIndex = await this.getFilesIndex();
      const fileIndex = currentIndex.findIndex(file => file.id === fileId);
      
      if (fileIndex !== -1) {
        currentIndex[fileIndex].synced = synced;
        if (remoteUrl) {
          currentIndex[fileIndex].originalUri = remoteUrl;
        }
        await FileSystem.writeAsStringAsync(this.FILES_INDEX_FILE, JSON.stringify(currentIndex));
      }
    } catch (error) {
      console.error('Error updating file sync status:', error);
    }
  }

  // Legacy method for backward compatibility
  static async updateImageSyncStatus(imageId: string, synced: boolean, remoteUrl?: string): Promise<void> {
    return this.updateFileSyncStatus(imageId, synced, remoteUrl);
  }

  static async getUnsyncedFiles(): Promise<OfflineFile[]> {
    const allFiles = await this.getFilesIndex();
    return allFiles.filter(file => !file.synced);
  }

  // Legacy method for backward compatibility
  static async getUnsyncedImages(): Promise<OfflineImage[]> {
    const unsyncedFiles = await this.getUnsyncedFiles();
    return unsyncedFiles.filter(file => file.fileType === 'image');
  }

  static async deleteFile(fileId: string): Promise<void> {
    try {
      const currentIndex = await this.getFilesIndex();
      const file = currentIndex.find(f => f.id === fileId);
      
      if (file) {
        // Delete physical file
        await FileSystem.deleteAsync(file.localUri, { idempotent: true });
        
        // Remove from index
        const updatedIndex = currentIndex.filter(f => f.id !== fileId);
        await FileSystem.writeAsStringAsync(this.FILES_INDEX_FILE, JSON.stringify(updatedIndex));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  // Legacy method for backward compatibility
  static async deleteImage(imageId: string): Promise<void> {
    return this.deleteFile(imageId);
  }

  static async getFilesByExpenseId(expenseId: string): Promise<OfflineFile[]> {
    const allFiles = await this.getFilesIndex();
    return allFiles.filter(file => file.expenseId === expenseId);
  }

  // Legacy method for backward compatibility
  static async getImagesByExpenseId(expenseId: string): Promise<OfflineImage[]> {
    const files = await this.getFilesByExpenseId(expenseId);
    return files.filter(file => file.fileType === 'image');
  }

  static async associateFileWithExpense(fileId: string, expenseId: string): Promise<void> {
    try {
      const currentIndex = await this.getFilesIndex();
      const fileIndex = currentIndex.findIndex(file => file.id === fileId);
      
      if (fileIndex !== -1) {
        currentIndex[fileIndex].expenseId = expenseId;
        await FileSystem.writeAsStringAsync(this.FILES_INDEX_FILE, JSON.stringify(currentIndex));
      }
    } catch (error) {
      console.error('Error associating file with expense:', error);
    }
  }

  // Legacy method for backward compatibility
  static async associateImageWithExpense(imageId: string, expenseId: string): Promise<void> {
    return this.associateFileWithExpense(imageId, expenseId);
  }
}
