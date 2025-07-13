import * as FileSystem from 'expo-file-system';

// Simple UUID generator for React Native
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export interface OfflineImage {
  id: string;
  localUri: string;
  originalUri: string;
  filename: string;
  mimeType: string;
  size: number;
  expenseId?: string;
  synced: boolean;
  createdAt: string;
}

export class OfflineStorageService {
  private static IMAGES_DIR = `${FileSystem.documentDirectory}expense_images/`;
  private static IMAGES_INDEX_FILE = `${FileSystem.documentDirectory}images_index.json`;

  static async initializeStorage(): Promise<void> {
    try {
      // Create images directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(this.IMAGES_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.IMAGES_DIR, { intermediates: true });
      }

      // Create index file if it doesn't exist
      const indexInfo = await FileSystem.getInfoAsync(this.IMAGES_INDEX_FILE);
      if (!indexInfo.exists) {
        await FileSystem.writeAsStringAsync(this.IMAGES_INDEX_FILE, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error initializing offline storage:', error);
    }
  }

  static async saveImageOffline(imageUri: string, expenseId?: string): Promise<OfflineImage | null> {
    try {
      await this.initializeStorage();

      const imageId = generateUUID();
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const filename = `${imageId}.${fileExtension}`;
      const localUri = `${this.IMAGES_DIR}${filename}`;

      // Copy image to local storage
      await FileSystem.copyAsync({
        from: imageUri,
        to: localUri
      });

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      const fileSize = fileInfo.exists && !fileInfo.isDirectory ? fileInfo.size : 0;
      
      const offlineImage: OfflineImage = {
        id: imageId,
        localUri,
        originalUri: imageUri,
        filename,
        mimeType: `image/${fileExtension}`,
        size: fileSize,
        expenseId,
        synced: false,
        createdAt: new Date().toISOString()
      };

      // Update index
      await this.addToIndex(offlineImage);

      return offlineImage;
    } catch (error) {
      console.error('Error saving image offline:', error);
      return null;
    }
  }

  static async getImagesIndex(): Promise<OfflineImage[]> {
    try {
      const indexContent = await FileSystem.readAsStringAsync(this.IMAGES_INDEX_FILE);
      return JSON.parse(indexContent) || [];
    } catch (error) {
      console.error('Error reading images index:', error);
      return [];
    }
  }

  private static async addToIndex(image: OfflineImage): Promise<void> {
    try {
      const currentIndex = await this.getImagesIndex();
      currentIndex.push(image);
      await FileSystem.writeAsStringAsync(this.IMAGES_INDEX_FILE, JSON.stringify(currentIndex));
    } catch (error) {
      console.error('Error updating images index:', error);
    }
  }

  static async updateImageSyncStatus(imageId: string, synced: boolean, remoteUrl?: string): Promise<void> {
    try {
      const currentIndex = await this.getImagesIndex();
      const imageIndex = currentIndex.findIndex(img => img.id === imageId);
      
      if (imageIndex !== -1) {
        currentIndex[imageIndex].synced = synced;
        if (remoteUrl) {
          currentIndex[imageIndex].originalUri = remoteUrl;
        }
        await FileSystem.writeAsStringAsync(this.IMAGES_INDEX_FILE, JSON.stringify(currentIndex));
      }
    } catch (error) {
      console.error('Error updating image sync status:', error);
    }
  }

  static async getUnsyncedImages(): Promise<OfflineImage[]> {
    const allImages = await this.getImagesIndex();
    return allImages.filter(img => !img.synced);
  }

  static async deleteImage(imageId: string): Promise<void> {
    try {
      const currentIndex = await this.getImagesIndex();
      const image = currentIndex.find(img => img.id === imageId);
      
      if (image) {
        // Delete physical file
        await FileSystem.deleteAsync(image.localUri, { idempotent: true });
        
        // Remove from index
        const updatedIndex = currentIndex.filter(img => img.id !== imageId);
        await FileSystem.writeAsStringAsync(this.IMAGES_INDEX_FILE, JSON.stringify(updatedIndex));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  static async getImagesByExpenseId(expenseId: string): Promise<OfflineImage[]> {
    const allImages = await this.getImagesIndex();
    return allImages.filter(img => img.expenseId === expenseId);
  }

  static async associateImageWithExpense(imageId: string, expenseId: string): Promise<void> {
    try {
      const currentIndex = await this.getImagesIndex();
      const imageIndex = currentIndex.findIndex(img => img.id === imageId);
      
      if (imageIndex !== -1) {
        currentIndex[imageIndex].expenseId = expenseId;
        await FileSystem.writeAsStringAsync(this.IMAGES_INDEX_FILE, JSON.stringify(currentIndex));
      }
    } catch (error) {
      console.error('Error associating image with expense:', error);
    }
  }
}
