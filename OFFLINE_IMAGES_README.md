# Offline Image Storage Implementation - ONLINE SYNC DISABLED

## ⚠️ STATUS: OFFLINE MODE ENABLED, ONLINE SYNC DISABLED

The offline image functionality is **ACTIVE** and working. However, online synchronization to the server has been **DISABLED**. 

Images are stored locally and can be attached to expenses, but they will **NOT** be uploaded to any server.

## Current Status

### ✅ **ENABLED (Working):**
- Local image storage using Expo FileSystem
- Camera and gallery image picking
- Image attachment to expenses
- Local image preview and management
- SQLite database storage of image references
- Offline image metadata tracking

### ❌ **DISABLED (Not Working):**
- Image upload to server
- Network connectivity checking
- Image synchronization when online
- Remote URL storage
- Server-side image backup

## What's Been Disabled

### Files Modified for Online Sync Disable:
- `App.tsx` - ImageSyncService initialization commented out
- `ImageSyncService.ts` - All sync methods disabled with console logs
- `services/index.ts` - ImageSyncService export commented out  

### Files Still Active:
- `OfflineStorageService.ts` - Fully functional for local storage
- `useImagePicker.ts` - Fully functional for image picking
- `AddExpenseScreen.tsx` - Shows "Offline Only" in UI
- Database schema - Supports both local and future remote URLs

## Current User Experience

1. **Adding Receipts:**
   - Tap "Attach Receipt (Offline Only)" 
   - Choose Camera or Gallery
   - Image is saved locally immediately
   - Preview shows with remove option
   - Works completely offline

2. **Storage Location:**
   - Images: `{app_directory}/expense_images/`
   - Index: `{app_directory}/images_index.json`
   - Database: Local SQLite with receipt references

3. **Success Message:**
   - Shows "Expense added successfully! (Stored offline)"
   - Indicates data is local only

## To Re-enable Online Sync Later

1. **Uncomment in `App.tsx`:**
   ```typescript
   import { ImageSyncService } from './services';
   await ImageSyncService.syncOnAppStart();
   ```

2. **Restore `ImageSyncService.ts` methods:**
   - Uncomment the sync logic
   - Add your server endpoint URL
   - Test network connectivity

3. **Update `services/index.ts`:**
   ```typescript
   export { ImageSyncService } from './ImageSyncService';
   ```

4. **Configure Server Endpoint:**
   ```typescript
   const response = await fetch('YOUR_UPLOAD_ENDPOINT', {
     // Your server configuration
   });
   ```

## Benefits of Current Setup

- ✅ **Fully functional offline image storage**
- ✅ **No network dependencies**  
- ✅ **Fast, reliable local storage**
- ✅ **Ready for future online sync**
- ✅ **All infrastructure in place**

---

# Original Implementation Documentation

## Key Features
- **Offline Storage**: Images are saved to device storage using Expo FileSystem
- **Image Picker**: Camera and gallery options for selecting images
- **Sync Capability**: Images can be uploaded to server when online
- **Metadata Tracking**: JSON index file tracks all images and sync status
- **Automatic Cleanup**: Images can be associated with expenses and cleaned up

## File Structure
```
services/
├── OfflineStorageService.ts - Core offline image storage functionality
├── ImageSyncService.ts - Sync images to server when online
└── index.ts - Export all services

hooks/
├── useImagePicker.ts - React hook for image picking functionality
└── index.ts - Export all hooks

types/
└── expense.ts - Updated to include offlineReceiptId field
```

## How It Works

### 1. Image Storage Location
- **Directory**: `{FileSystem.documentDirectory}expense_images/`
- **Index File**: `{FileSystem.documentDirectory}images_index.json`
- **Naming**: Files are saved with UUID names (e.g., `abc123.jpg`)

### 2. Image Metadata
Each image is tracked with this structure:
```typescript
interface OfflineImage {
  id: string;           // UUID for the image
  localUri: string;     // Local file path
  originalUri: string;  // Original URI from picker
  filename: string;     // Generated filename
  mimeType: string;     // Image type (image/jpg, etc.)
  size: number;         // File size in bytes
  expenseId?: string;   // Associated expense ID
  synced: boolean;      // Whether uploaded to server
  createdAt: string;    // ISO timestamp
}
```

### 3. Usage Flow

#### Adding a Receipt
1. User taps "Attach Receipt"
2. Alert shows Camera/Gallery options
3. Image picker launches
4. Selected image is copied to app storage
5. Image metadata is added to index
6. Image preview is shown to user
7. On expense save, receipt URL and offline ID are stored

#### Syncing (When Online)
1. App checks for unsynced images
2. Each image is uploaded to server
3. Server returns remote URL
4. Local metadata is updated with sync status
5. Remote URL replaces local URL in database

## Key Components

### OfflineStorageService
Main service for image storage operations:
- `saveImageOffline()` - Save image to local storage
- `getImagesIndex()` - Get all stored images
- `deleteImage()` - Remove image and metadata
- `updateImageSyncStatus()` - Mark image as synced

### useImagePicker Hook
React hook providing image picker functionality:
- `showImagePicker()` - Show camera/gallery options
- `pickFromCamera()` - Launch camera
- `pickFromLibrary()` - Launch gallery
- Handles permissions automatically

### ImageSyncService
Handles syncing images to server:
- `syncPendingImages()` - Upload unsynced images
- `syncOnAppStart()` - Sync when app launches
- `syncOnNetworkRestore()` - Sync when connection restored

## Database Changes
Added `offline_receipt_id` field to expenses table to track offline images:
```sql
ALTER TABLE expenses ADD COLUMN offline_receipt_id TEXT;
```

## Dependencies Added
- `expo-file-system` - File system operations
- `expo-image-picker` - Camera and gallery access
- `uuid` - Generating unique IDs
- `@react-native-community/netinfo` - Network status
- `@react-native-async-storage/async-storage` - Async storage

## Usage Example

```typescript
// In a component
const { showImagePicker, loading } = useImagePicker();

const handleAttachReceipt = async () => {
  const image = await showImagePicker();
  if (image) {
    setAttachedReceipt(image);
    // Image is now saved offline and ready to use
  }
};
```

## Sync Implementation Notes

The `ImageSyncService.uploadImageToServer()` method needs to be customized with your actual server endpoint:

```typescript
const response = await fetch('YOUR_UPLOAD_ENDPOINT', {
  method: 'POST',
  body: formData,
  headers: {
    'Content-Type': 'multipart/form-data',
    // Add your authentication headers
  },
});
```

## Error Handling
- Permissions are requested automatically
- File operations are wrapped in try-catch
- Network errors during sync are logged but don't crash app
- Invalid images are handled gracefully

## Storage Considerations
- Images are compressed to 80% quality to save space
- Aspect ratio is maintained at 4:3 for consistency
- Large images are automatically resized by the picker
- Storage space should be monitored in production

## Testing
To test the offline functionality:
1. Turn off internet connection
2. Add expenses with receipt images
3. Verify images are stored locally
4. Turn on internet connection
5. Check that images sync to server
6. Verify local images are marked as synced
