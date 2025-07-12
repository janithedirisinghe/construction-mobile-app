// database/index.ts
import * as SQLite from 'expo-sqlite';

// Database name
const DATABASE_NAME = 'construction_app.db';

// Open database
export const db = SQLite.openDatabaseSync(DATABASE_NAME);

// Database initialization
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Projects table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        target_budget REAL NOT NULL,
        total_spent REAL DEFAULT 0,
        description TEXT,
        user_id INTEGER NOT NULL,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Expenses table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        expense_date TEXT NOT NULL,
        notes TEXT,
        receipt_url TEXT,
        project_id INTEGER NOT NULL,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      );
    `);

    // Labor table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS labor (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        daily_rate REAL NOT NULL,
        contact_number TEXT,
        project_id INTEGER NOT NULL,
        is_active INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      );
    `);

    // Labor Attendance table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS labor_attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        labor_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        is_present INTEGER NOT NULL,
        hours_worked REAL DEFAULT 0,
        overtime REAL DEFAULT 0,
        notes TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (labor_id) REFERENCES labor (id),
        UNIQUE(labor_id, date)
      );
    `);

    // Labor Expenses table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS labor_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        labor_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (labor_id) REFERENCES labor (id)
      );
    `);

    // Images/Files table (for receipts and other files)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        server_url TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Sync status table (to track what needs to be synced)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        operation TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Helper function to execute SQL with promise
export const executeSql = async (
  sql: string,
  params: any[] = []
): Promise<any> => {
  try {
    const result = await db.runAsync(sql, params);
    return result;
  } catch (error) {
    console.error('SQL execution error:', error);
    throw error;
  }
};

// Helper function to get all rows
export const getAllAsync = async (
  sql: string,
  params: any[] = []
): Promise<any[]> => {
  try {
    const result = await db.getAllAsync(sql, params);
    return result;
  } catch (error) {
    console.error('SQL get all error:', error);
    throw error;
  }
};

// Helper function to get first row
export const getFirstAsync = async (
  sql: string,
  params: any[] = []
): Promise<any> => {
  try {
    const result = await db.getFirstAsync(sql, params);
    return result;
  } catch (error) {
    console.error('SQL get first error:', error);
    throw error;
  }
};

// Helper function to get current timestamp
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
