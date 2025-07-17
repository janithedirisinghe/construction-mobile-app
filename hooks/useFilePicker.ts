import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { OfflineStorageService, OfflineFile } from '../services/OfflineStorageService';

export const useFilePicker = () => {
  const [loading, setLoading] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and media library permissions to attach files.'
      );
      return false;
    }
    return true;
  };

  const pickFromCamera = async (): Promise<OfflineFile | null> => {
    if (!(await requestPermissions())) return null;
    
    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const savedFile = await OfflineStorageService.saveFileOffline(result.assets[0].uri, 'image');
        return savedFile;
      }
      return null;
    } catch (error) {
      console.error('Error picking from camera:', error);
      Alert.alert('Error', 'Failed to capture image');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const pickImagesFromLibrary = async (allowsMultipleSelection: boolean = true): Promise<OfflineFile[]> => {
    if (!(await requestPermissions())) return [];
    
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: !allowsMultipleSelection,
        allowsMultipleSelection,
        aspect: [4, 3],
        quality: 0.8,
        selectionLimit: allowsMultipleSelection ? 10 : 1, // Allow up to 10 images
      });

      if (!result.canceled && result.assets) {
        const savedFiles: OfflineFile[] = [];
        for (const asset of result.assets) {
          const savedFile = await OfflineStorageService.saveFileOffline(asset.uri, 'image');
          if (savedFile) {
            savedFiles.push(savedFile);
          }
        }
        return savedFiles;
      }
      return [];
    } catch (error) {
      console.error('Error picking from library:', error);
      Alert.alert('Error', 'Failed to select images');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const pickDocuments = async (): Promise<OfflineFile[]> => {
    setLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const savedFiles: OfflineFile[] = [];
        for (const asset of result.assets) {
          let fileType: 'image' | 'pdf' | 'document' = 'document';
          
          if (asset.mimeType?.startsWith('image/')) {
            fileType = 'image';
          } else if (asset.mimeType === 'application/pdf') {
            fileType = 'pdf';
          }
          
          const savedFile = await OfflineStorageService.saveFileOffline(asset.uri, fileType);
          if (savedFile) {
            savedFiles.push(savedFile);
          }
        }
        return savedFiles;
      }
      return [];
    } catch (error) {
      console.error('Error picking documents:', error);
      Alert.alert('Error', 'Failed to select documents');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const showFilePicker = (allowMultiple: boolean = true): Promise<OfflineFile[]> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Attach Files',
        'Choose an option',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const file = await pickFromCamera();
              resolve(file ? [file] : []);
            }
          },
          {
            text: 'Photos',
            onPress: async () => {
              const files = await pickImagesFromLibrary(allowMultiple);
              resolve(files);
            }
          },
          {
            text: 'Documents/PDFs',
            onPress: async () => {
              const files = await pickDocuments();
              resolve(files);
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve([])
          }
        ]
      );
    });
  };

  // Legacy method for backward compatibility
  const showImagePicker = async (): Promise<OfflineFile | null> => {
    const files = await showFilePicker(false);
    return files.length > 0 ? files[0] : null;
  };

  return {
    showFilePicker,
    showImagePicker, // For backward compatibility
    pickFromCamera,
    pickImagesFromLibrary,
    pickDocuments,
    loading
  };
};
