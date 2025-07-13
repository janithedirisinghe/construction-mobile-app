import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { OfflineStorageService, OfflineImage } from '../services/OfflineStorageService';

export const useImagePicker = () => {
  const [loading, setLoading] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and media library permissions to attach receipts.'
      );
      return false;
    }
    return true;
  };

  const pickFromCamera = async (): Promise<OfflineImage | null> => {
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
        const savedImage = await OfflineStorageService.saveImageOffline(result.assets[0].uri);
        return savedImage;
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

  const pickFromLibrary = async (): Promise<OfflineImage | null> => {
    if (!(await requestPermissions())) return null;
    
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const savedImage = await OfflineStorageService.saveImageOffline(result.assets[0].uri);
        return savedImage;
      }
      return null;
    } catch (error) {
      console.error('Error picking from library:', error);
      Alert.alert('Error', 'Failed to select image');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const showImagePicker = (): Promise<OfflineImage | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Attach Receipt',
        'Choose an option',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const image = await pickFromCamera();
              resolve(image);
            }
          },
          {
            text: 'Gallery',
            onPress: async () => {
              const image = await pickFromLibrary();
              resolve(image);
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null)
          }
        ]
      );
    });
  };

  return {
    showImagePicker,
    pickFromCamera,
    pickFromLibrary,
    loading
  };
};
