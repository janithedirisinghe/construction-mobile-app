import { User, CreateUserData, UpdateUserData } from '../types/auth';
import { db, executeSql, getAllAsync, getFirstAsync, getCurrentTimestamp } from '../database';

export class UserService {
  /**
   * Check if any user exists in the database
   */
  static async hasUsers(): Promise<boolean> {
    try {
      const result = await getFirstAsync('SELECT COUNT(*) as count FROM users');
      return result.count > 0;
    } catch (error) {
      console.error('Error checking for users:', error);
      throw new Error('Failed to check for existing users');
    }
  }

  /**
   * Get the first user (for single-user app)
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const result = await getFirstAsync('SELECT * FROM users ORDER BY id LIMIT 1');
      if (!result) return null;

      return {
        id: result.id,
        name: result.name,
        email: result.email,
        mobile: result.mobile,
        address: result.address,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      throw new Error('Failed to get current user');
    }
  }

  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      const now = getCurrentTimestamp();
      
      const result = await executeSql(
        `INSERT INTO users (name, email, mobile, address, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userData.name, userData.email, userData.mobile, userData.address, now, now]
      );

      if (!result.lastInsertRowId) {
        throw new Error('Failed to create user');
      }

      // Get the created user
      const newUser = await getFirstAsync(
        'SELECT * FROM users WHERE id = ?',
        [result.lastInsertRowId]
      );

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        address: newUser.address,
        createdAt: newUser.created_at,
        updatedAt: newUser.updated_at,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Update user information
   */
  static async updateUser(userId: number, userData: UpdateUserData): Promise<User> {
    try {
      const now = getCurrentTimestamp();
      
      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];
      
      if (userData.name !== undefined) {
        updates.push('name = ?');
        values.push(userData.name);
      }
      if (userData.email !== undefined) {
        updates.push('email = ?');
        values.push(userData.email);
      }
      if (userData.mobile !== undefined) {
        updates.push('mobile = ?');
        values.push(userData.mobile);
      }
      if (userData.address !== undefined) {
        updates.push('address = ?');
        values.push(userData.address);
      }
      
      updates.push('updated_at = ?');
      values.push(now);
      values.push(userId);

      await executeSql(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Get the updated user
      const updatedUser = await getFirstAsync(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        address: updatedUser.address,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete a user and all associated data
   */
  static async deleteUser(userId: number): Promise<void> {
    try {
      // Delete in reverse order of dependencies
      await executeSql('DELETE FROM labor_attendance WHERE labor_id IN (SELECT id FROM labor WHERE project_id IN (SELECT id FROM projects WHERE user_id = ?))', [userId]);
      await executeSql('DELETE FROM labor_expenses WHERE labor_id IN (SELECT id FROM labor WHERE project_id IN (SELECT id FROM projects WHERE user_id = ?))', [userId]);
      await executeSql('DELETE FROM labor WHERE project_id IN (SELECT id FROM projects WHERE user_id = ?)', [userId]);
      await executeSql('DELETE FROM expenses WHERE project_id IN (SELECT id FROM projects WHERE user_id = ?)', [userId]);
      await executeSql('DELETE FROM files WHERE entity_type = "project" AND entity_id IN (SELECT id FROM projects WHERE user_id = ?)', [userId]);
      await executeSql('DELETE FROM projects WHERE user_id = ?', [userId]);
      await executeSql('DELETE FROM users WHERE id = ?', [userId]);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Get user initials for avatar
   */
  static getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
