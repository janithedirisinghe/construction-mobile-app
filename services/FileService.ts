// services/FileService.ts
import * as FileSystem from 'expo-file-system';
import { db, executeSql, getAllAsync, getFirstAsync, getCurrentTimestamp } from '../database';

export interface FileRecord {
  id: number;
  filePath: string;
  fileType: string;
  entityType: string;
  entityId: number;
  serverUrl?: string;
  synced: number;
  createdAt: string;
}

export class FileService {
  // Directory for storing app files
  static readonly APP_DIRECTORY = `${FileSystem.documentDirectory}construction-app/`;
  static readonly IMAGES_DIRECTORY = `${FileService.APP_DIRECTORY}images/`;
  static readonly RECEIPTS_DIRECTORY = `${FileService.APP_DIRECTORY}receipts/`;

  // Initialize directories
  static async initializeDirectories(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(FileService.APP_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(FileService.APP_DIRECTORY, { intermediates: true });
      }

      const imagesInfo = await FileSystem.getInfoAsync(FileService.IMAGES_DIRECTORY);
      if (!imagesInfo.exists) {
        await FileSystem.makeDirectoryAsync(FileService.IMAGES_DIRECTORY, { intermediates: true });
      }

      const receiptsInfo = await FileSystem.getInfoAsync(FileService.RECEIPTS_DIRECTORY);
      if (!receiptsInfo.exists) {
        await FileSystem.makeDirectoryAsync(FileService.RECEIPTS_DIRECTORY, { intermediates: true });
      }

      console.log('File directories initialized');
    } catch (error) {
      console.error('Error initializing directories:', error);
      throw error;
    }
  }

  // Save image/file locally and record in database
  static async saveFile(
    sourceUri: string,
    entityType: 'expense' | 'project' | 'labor',
    entityId: number,
    fileType: 'image' | 'document' = 'image'
  ): Promise<string> {
    try {
      await this.initializeDirectories();

      // Generate unique filename
      const timestamp = Date.now();
      const extension = this.getFileExtension(sourceUri) || 'jpg';
      const fileName = `${entityType}_${entityId}_${timestamp}.${extension}`;
      
      // Determine target directory based on file type
      const targetDirectory = fileType === 'image' ? this.IMAGES_DIRECTORY : this.RECEIPTS_DIRECTORY;
      const targetPath = `${targetDirectory}${fileName}`;

      // Copy file to local storage
      await FileSystem.copyAsync({
        from: sourceUri,
        to: targetPath
      });

      // Save record in database
      const result = await executeSql(
        `INSERT INTO files (file_path, file_type, entity_type, entity_id, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [targetPath, fileType, entityType, entityId, getCurrentTimestamp()]
      );

      console.log('File saved:', targetPath, 'DB ID:', result.lastInsertRowId);
      return targetPath;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  // Get files for an entity
  static async getFilesForEntity(entityType: string, entityId: number): Promise<FileRecord[]> {
    try {
      const rows = await getAllAsync(`
        SELECT 
          id,
          file_path as filePath,
          file_type as fileType,
          entity_type as entityType,
          entity_id as entityId,
          server_url as serverUrl,
          synced,
          created_at as createdAt
        FROM files 
        WHERE entity_type = ? AND entity_id = ?
        ORDER BY created_at DESC
      `, [entityType, entityId]);
      
      return rows.map(this.mapDbRowToFileRecord);
    } catch (error) {
      console.error('Error getting files for entity:', error);
      throw error;
    }
  }

  // Get file by ID
  static async getFileById(id: number): Promise<FileRecord | null> {
    try {
      const row = await getFirstAsync(`
        SELECT 
          id,
          file_path as filePath,
          file_type as fileType,
          entity_type as entityType,
          entity_id as entityId,
          server_url as serverUrl,
          synced,
          created_at as createdAt
        FROM files 
        WHERE id = ?
      `, [id]);
      
      return row ? this.mapDbRowToFileRecord(row) : null;
    } catch (error) {
      console.error('Error getting file by ID:', error);
      throw error;
    }
  }

  // Delete file
  static async deleteFile(id: number): Promise<void> {
    try {
      const fileRecord = await this.getFileById(id);
      if (!fileRecord) {
        throw new Error('File record not found');
      }

      // Delete physical file
      const fileInfo = await FileSystem.getInfoAsync(fileRecord.filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileRecord.filePath);
      }

      // Delete database record
      await executeSql('DELETE FROM files WHERE id = ?', [id]);
      
      console.log('File deleted:', id);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Update file with server URL after sync
  static async updateServerUrl(id: number, serverUrl: string): Promise<void> {
    try {
      await executeSql(
        'UPDATE files SET server_url = ?, synced = 1 WHERE id = ?',
        [serverUrl, id]
      );
      console.log('File server URL updated:', id);
    } catch (error) {
      console.error('Error updating server URL:', error);
      throw error;
    }
  }

  // Get unsynced files
  static async getUnsyncedFiles(): Promise<FileRecord[]> {
    try {
      const rows = await getAllAsync(`
        SELECT 
          id,
          file_path as filePath,
          file_type as fileType,
          entity_type as entityType,
          entity_id as entityId,
          server_url as serverUrl,
          synced,
          created_at as createdAt
        FROM files 
        WHERE synced = 0
        ORDER BY created_at ASC
      `);
      
      return rows.map(this.mapDbRowToFileRecord);
    } catch (error) {
      console.error('Error getting unsynced files:', error);
      throw error;
    }
  }

  // Mark file as synced
  static async markAsSynced(id: number): Promise<void> {
    try {
      await executeSql(
        'UPDATE files SET synced = 1 WHERE id = ?',
        [id]
      );
      console.log('File marked as synced:', id);
    } catch (error) {
      console.error('Error marking file as synced:', error);
      throw error;
    }
  }

  // Get file extension from URI
  private static getFileExtension(uri: string): string | null {
    const match = uri.match(/\.([^.]+)$/);
    return match ? match[1] : null;
  }

  // Check if file exists locally
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      return fileInfo.exists;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }

  // Get file URI for display (adds file:// prefix if needed)
  static getFileUri(filePath: string): string {
    if (filePath.startsWith('file://')) {
      return filePath;
    }
    return `file://${filePath}`;
  }

  // Clean up orphaned files (files not referenced in database)
  static async cleanupOrphanedFiles(): Promise<void> {
    try {
      // Get all file paths from database
      const dbFiles = await getAllAsync('SELECT file_path FROM files');
      const dbFilePaths = dbFiles.map(row => row.file_path);

      // Check images directory
      await this.cleanupDirectory(this.IMAGES_DIRECTORY, dbFilePaths);
      
      // Check receipts directory
      await this.cleanupDirectory(this.RECEIPTS_DIRECTORY, dbFilePaths);

      console.log('Orphaned files cleanup completed');
    } catch (error) {
      console.error('Error cleaning up orphaned files:', error);
    }
  }

  private static async cleanupDirectory(directoryPath: string, dbFilePaths: string[]): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(directoryPath);
      if (!dirInfo.exists) return;

      const files = await FileSystem.readDirectoryAsync(directoryPath);
      
      for (const fileName of files) {
        const filePath = `${directoryPath}${fileName}`;
        
        // If file is not in database, delete it
        if (!dbFilePaths.includes(filePath)) {
          await FileSystem.deleteAsync(filePath);
          console.log('Deleted orphaned file:', filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up directory:', directoryPath, error);
    }
  }

  // Helper method to map database row to FileRecord interface
  private static mapDbRowToFileRecord(row: any): FileRecord {
    return {
      id: row.id,
      filePath: row.filePath,
      fileType: row.fileType,
      entityType: row.entityType,
      entityId: row.entityId,
      serverUrl: row.serverUrl,
      synced: row.synced,
      createdAt: row.createdAt
    };
  }
}
