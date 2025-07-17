# Construction Project Cost Tracker - Mobile App

A React Native Expo app for tracking construction project expenses and budgets.

## 🏗️ Project Structure

```
├── App.tsx                    # Main app entry point
├── theme.ts                   # App-wide theme configuration
├── components/
│   ├── index.ts              # Component exports
│   └── common/
│       ├── Button.tsx        # Reusable button component
│       ├── Input.tsx         # Reusable input component
│       ├── Card.tsx          # Reusable card component
│       └── Screen.tsx        # Screen wrapper component
├── navigation/
│   └── AppNavigator.tsx      # Main app navigation
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx   # User login
│   │   └── RegisterScreen.tsx # User registration
│   ├── projects/
│   │   ├── ProjectListScreen.tsx    # List all projects
│   │   ├── CreateProjectScreen.tsx  # Create new project
│   │   ├── DashboardScreen.tsx      # Project overview (TODO)
│   │   └── ExpenseListScreen.tsx    # List project expenses (TODO)
│   └── expenses/
│       ├── AddExpenseScreen.tsx     # Add new expense (TODO)
│       └── ExpenseDetailScreen.tsx  # View expense details (TODO)
└── types/
    ├── index.ts              # Type exports
    ├── auth.ts               # Authentication types
    ├── project.ts            # Project-related types
    ├── expense.ts            # Expense-related types
    └── navigation.ts         # Navigation types
```

## 📱 Screens Overview

### ✅ Completed Screens

1. **LoginScreen** - User authentication
   - Email and password fields
   - Form validation
   - Navigation to register screen

2. **RegisterScreen** - User registration
   - Name, email, password, confirm password fields
   - Form validation
   - Navigation back to login

3. **ProjectListScreen** - Project management
   - List of user's projects
   - Budget progress visualization
   - Navigation to create project and project dashboard

4. **CreateProjectScreen** - Project creation
   - Project title, description, dates, budget
   - Form validation
   - Date picker integration (TODO: implement proper date picker)

### 🚧 TODO Screens

5. **DashboardScreen** - Project overview
   - Budget summary
   - Category breakdown charts
   - Recent expenses
   - Quick actions

6. **ExpenseListScreen** - Expense management
   - List all project expenses
   - Filter by category and date
   - Sort by different criteria

7. **AddExpenseScreen** - Expense creation
   - Expense details form
   - Category selection
   - Receipt photo upload
   - Date picker

8. **ExpenseDetailScreen** - Expense details
   - Full expense information
   - Receipt image preview
   - Edit/delete actions

## 📎 File Attachments

The app now supports multiple file attachments for expense entries:

### Supported File Types
- **Images**: JPG, PNG, WEBP (from camera or photo library)
- **PDFs**: PDF documents (from device storage)
- **Multiple Selection**: Upload up to 10 files per expense

### Features
- **Camera Integration**: Take photos directly from the app
- **Photo Library**: Select single or multiple images
- **Document Picker**: Browse and select PDF files
- **File Preview**: Thumbnail previews for images, icons for PDFs
- **Offline Storage**: All files stored locally for offline operation
- **File Management**: Individual file removal, file size display

### Technical Implementation
- Uses `expo-image-picker` for camera and photo library access
- Uses `expo-document-picker` for PDF and document selection
- Files stored in app's document directory using `expo-file-system`
- Metadata tracked in JSON index for offline synchronization
- Backward compatibility maintained with existing single-image workflow

## 🎨 Design System

### Colors
- **Primary**: #ff6b35 (Construction Orange)
- **Secondary**: #666666 (Construction Gray)
- **Success**: #27ae60
- **Warning**: #f39c12
- **Error**: #e74c3c

### Typography
- Font sizes: 12px - 32px
- Weights: normal, medium, semibold, bold

### Components
- **Button**: Primary, secondary, outline variants
- **Input**: Text input with icons and validation
- **Card**: Elevated containers with shadows
- **Screen**: Safe area wrapper with padding

## 🔧 Technology Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Styled Components** for styling
- **React Navigation v6** for navigation
- **Expo Vector Icons** for icons
- **Expo Image Picker** for photo uploads

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Scan the QR code with Expo Go app

## 📝 Data Models

### Project
```typescript
interface Project {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  targetBudget: number;
  totalSpent?: number;
  description?: string;
  userId: number;
}
```

### Expense
```typescript
interface Expense {
  id: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  notes?: string;
  receiptUrl?: string;
  projectId: number;
  createdAt: string;
}
```

### Expense Categories
- Labor
- Materials
- Transport
- Equipment Rental
- Permits
- Misc

## 🔄 Next Steps

1. **Complete remaining screens**:
   - DashboardScreen
   - ExpenseListScreen  
   - AddExpenseScreen
   - ExpenseDetailScreen

2. **Add date picker functionality**

3. **Implement camera/photo picker**

4. **Add charts for budget visualization**

5. **Connect to backend API**

6. **Add authentication state management**

7. **Implement data persistence**

8. **Add offline capability**

## 📱 Features

- ✅ User authentication (UI only)
- ✅ Project creation and listing
- ✅ Form validation
- ✅ Responsive design
- ✅ Type-safe navigation
- 🚧 Expense tracking
- 🚧 Budget monitoring
- 🚧 Photo receipts
- 🚧 Data persistence
- 🚧 Backend integration

The app is now ready for development with a solid foundation and the first four screens implemented!
