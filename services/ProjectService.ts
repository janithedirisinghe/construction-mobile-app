// services/ProjectService.ts
import { db, executeSql, getAllAsync, getFirstAsync, getCurrentTimestamp } from '../database';
import { Project, CreateProjectData } from '../types/project';
import { UserService } from './UserService';

export class ProjectService {
  // Create a new project
  static async createProject(data: CreateProjectData): Promise<number> {
    try {
      // Get current user
      const currentUser = await UserService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user found. Please register first.');
      }

      const result = await executeSql(
        `INSERT INTO projects (title, start_date, end_date, target_budget, description, user_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.title,
          data.startDate,
          data.endDate,
          data.targetBudget,
          data.description || null,
          currentUser.id,
          getCurrentTimestamp(),
          getCurrentTimestamp()
        ]
      );
      
      console.log('Project created with ID:', result.lastInsertRowId);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Get all projects for current user
  static async getAllProjects(): Promise<Project[]> {
    try {
      // Get current user
      const currentUser = await UserService.getCurrentUser();
      if (!currentUser) {
        return [];
      }

      const rows = await getAllAsync(`
        SELECT 
          id,
          title,
          start_date as startDate,
          end_date as endDate,
          target_budget as targetBudget,
          total_spent as totalSpent,
          description,
          user_id as userId,
          synced,
          created_at as createdAt,
          updated_at as updatedAt
        FROM projects 
        WHERE user_id = ?
        ORDER BY created_at DESC
      `, [currentUser.id]);
      
      return rows.map(this.mapDbRowToProject);
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw error;
    }
  }

  // Get project by ID (check if it belongs to current user)
  static async getProjectById(id: number): Promise<Project | null> {
    try {
      // Get current user
      const currentUser = await UserService.getCurrentUser();
      if (!currentUser) {
        return null;
      }

      const row = await getFirstAsync(`
        SELECT 
          id,
          title,
          start_date as startDate,
          end_date as endDate,
          target_budget as targetBudget,
          total_spent as totalSpent,
          description,
          user_id as userId,
          synced,
          created_at as createdAt,
          updated_at as updatedAt
        FROM projects 
        WHERE id = ? AND user_id = ?
      `, [id, currentUser.id]);
      
      return row ? this.mapDbRowToProject(row) : null;
    } catch (error) {
      console.error('Error getting project by ID:', error);
      throw error;
    }
  }

  // Update project
  static async updateProject(id: number, data: Partial<CreateProjectData>): Promise<void> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];

      if (data.title !== undefined) {
        updateFields.push('title = ?');
        params.push(data.title);
      }
      if (data.startDate !== undefined) {
        updateFields.push('start_date = ?');
        params.push(data.startDate);
      }
      if (data.endDate !== undefined) {
        updateFields.push('end_date = ?');
        params.push(data.endDate);
      }
      if (data.targetBudget !== undefined) {
        updateFields.push('target_budget = ?');
        params.push(data.targetBudget);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        params.push(data.description);
      }

      updateFields.push('updated_at = ?');
      params.push(getCurrentTimestamp());
      
      updateFields.push('synced = ?');
      params.push(0); // Mark as unsynced

      params.push(id);

      await executeSql(
        `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      console.log('Project updated:', id);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete project
  static async deleteProject(id: number): Promise<void> {
    try {
      await executeSql('DELETE FROM projects WHERE id = ?', [id]);
      console.log('Project deleted:', id);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Update total spent for a project (called when expenses are added/removed)
  static async updateTotalSpent(projectId: number): Promise<void> {
    try {
      const result = await getFirstAsync(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expenses 
        WHERE project_id = ?
      `, [projectId]);

      const totalSpent = result?.total || 0;

      await executeSql(
        'UPDATE projects SET total_spent = ?, updated_at = ? WHERE id = ?',
        [totalSpent, getCurrentTimestamp(), projectId]
      );

      console.log('Total spent updated for project:', projectId, 'Total:', totalSpent);
    } catch (error) {
      console.error('Error updating total spent:', error);
      throw error;
    }
  }

  // Get unsynced projects for current user
  static async getUnsyncedProjects(): Promise<Project[]> {
    try {
      // Get current user
      const currentUser = await UserService.getCurrentUser();
      if (!currentUser) {
        return [];
      }

      const rows = await getAllAsync(`
        SELECT 
          id,
          title,
          start_date as startDate,
          end_date as endDate,
          target_budget as targetBudget,
          total_spent as totalSpent,
          description,
          user_id as userId,
          synced,
          created_at as createdAt,
          updated_at as updatedAt
        FROM projects 
        WHERE synced = 0 AND user_id = ?
        ORDER BY created_at DESC
      `, [currentUser.id]);
      
      return rows.map(this.mapDbRowToProject);
    } catch (error) {
      console.error('Error getting unsynced projects:', error);
      throw error;
    }
  }

  // Mark project as synced
  static async markAsSynced(id: number): Promise<void> {
    try {
      await executeSql(
        'UPDATE projects SET synced = 1 WHERE id = ?',
        [id]
      );
      console.log('Project marked as synced:', id);
    } catch (error) {
      console.error('Error marking project as synced:', error);
      throw error;
    }
  }

  // Helper method to map database row to Project interface
  private static mapDbRowToProject(row: any): Project {
    return {
      id: row.id,
      title: row.title,
      startDate: row.startDate,
      endDate: row.endDate,
      targetBudget: row.targetBudget,
      totalSpent: row.totalSpent || 0,
      description: row.description,
      userId: row.userId
    };
  }
}
