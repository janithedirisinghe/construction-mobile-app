// services/LaborService.ts
import { db, executeSql, getAllAsync, getFirstAsync, getCurrentTimestamp } from '../database';
import { Labor, LaborAttendance, LaborExpense, DailyLaborSummary } from '../types/labor';

export class LaborService {
  // Create a new labor entry
  static async createLabor(data: {
    name: string;
    role: string;
    dailyRate: number;
    contactNumber?: string;
    projectId: number;
  }): Promise<number> {
    try {
      const result = await executeSql(
        `INSERT INTO labor (name, role, daily_rate, contact_number, project_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.role,
          data.dailyRate,
          data.contactNumber || null,
          data.projectId,
          getCurrentTimestamp(),
          getCurrentTimestamp()
        ]
      );
      
      console.log('Labor created with ID:', result.lastInsertRowId);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating labor:', error);
      throw error;
    }
  }

  // Get all labor for a project
  static async getLaborByProject(projectId: number, activeOnly: boolean = true): Promise<Labor[]> {
    try {
      let sql = `
        SELECT 
          id,
          name,
          role,
          daily_rate as dailyRate,
          contact_number as contactNumber,
          project_id as projectId,
          is_active as isActive,
          synced,
          created_at as createdAt,
          updated_at as updatedAt
        FROM labor 
        WHERE project_id = ?
      `;
      
      const params = [projectId];
      
      if (activeOnly) {
        sql += ' AND is_active = 1';
      }
      
      sql += ' ORDER BY name ASC';

      const rows = await getAllAsync(sql, params);
      return rows.map(this.mapDbRowToLabor);
    } catch (error) {
      console.error('Error getting labor by project:', error);
      throw error;
    }
  }

  // Get labor by ID
  static async getLaborById(id: number): Promise<Labor | null> {
    try {
      const row = await getFirstAsync(`
        SELECT 
          id,
          name,
          role,
          daily_rate as dailyRate,
          contact_number as contactNumber,
          project_id as projectId,
          is_active as isActive,
          synced,
          created_at as createdAt,
          updated_at as updatedAt
        FROM labor 
        WHERE id = ?
      `, [id]);
      
      return row ? this.mapDbRowToLabor(row) : null;
    } catch (error) {
      console.error('Error getting labor by ID:', error);
      throw error;
    }
  }

  // Update labor
  static async updateLabor(id: number, data: {
    name?: string;
    role?: string;
    dailyRate?: number;
    contactNumber?: string;
    isActive?: boolean;
  }): Promise<void> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];

      if (data.name !== undefined) {
        updateFields.push('name = ?');
        params.push(data.name);
      }
      if (data.role !== undefined) {
        updateFields.push('role = ?');
        params.push(data.role);
      }
      if (data.dailyRate !== undefined) {
        updateFields.push('daily_rate = ?');
        params.push(data.dailyRate);
      }
      if (data.contactNumber !== undefined) {
        updateFields.push('contact_number = ?');
        params.push(data.contactNumber);
      }
      if (data.isActive !== undefined) {
        updateFields.push('is_active = ?');
        params.push(data.isActive ? 1 : 0);
      }

      updateFields.push('updated_at = ?');
      params.push(getCurrentTimestamp());
      
      updateFields.push('synced = ?');
      params.push(0); // Mark as unsynced

      params.push(id);

      await executeSql(
        `UPDATE labor SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      console.log('Labor updated:', id);
    } catch (error) {
      console.error('Error updating labor:', error);
      throw error;
    }
  }

  // Delete labor (soft delete by setting inactive)
  static async deleteLabor(id: number): Promise<void> {
    try {
      await executeSql(
        'UPDATE labor SET is_active = 0, updated_at = ?, synced = 0 WHERE id = ?',
        [getCurrentTimestamp(), id]
      );
      console.log('Labor deleted (set inactive):', id);
    } catch (error) {
      console.error('Error deleting labor:', error);
      throw error;
    }
  }

  // Record attendance
  static async recordAttendance(data: {
    laborId: number;
    date: string;
    isPresent: boolean;
    hoursWorked: number;
    overtime: number;
    notes?: string;
  }): Promise<number> {
    try {
      const result = await executeSql(
        `INSERT OR REPLACE INTO labor_attendance 
         (labor_id, date, is_present, hours_worked, overtime, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.laborId,
          data.date,
          data.isPresent ? 1 : 0,
          data.hoursWorked,
          data.overtime,
          data.notes || null,
          getCurrentTimestamp()
        ]
      );
      
      console.log('Attendance recorded for labor:', data.laborId, 'Date:', data.date);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error recording attendance:', error);
      throw error;
    }
  }

  // Get attendance for a specific date
  static async getAttendanceByDate(projectId: number, date: string): Promise<LaborAttendance[]> {
    try {
      const rows = await getAllAsync(`
        SELECT 
          la.id,
          la.labor_id as laborId,
          la.date,
          la.is_present as isPresent,
          la.hours_worked as hoursWorked,
          la.overtime,
          la.notes,
          la.synced,
          la.created_at as createdAt
        FROM labor_attendance la
        JOIN labor l ON la.labor_id = l.id
        WHERE l.project_id = ? AND la.date = ?
        ORDER BY l.name ASC
      `, [projectId, date]);
      
      return rows.map(this.mapDbRowToAttendance);
    } catch (error) {
      console.error('Error getting attendance by date:', error);
      throw error;
    }
  }

  // Get attendance for a labor within date range
  static async getAttendanceByLabor(
    laborId: number, 
    startDate?: string, 
    endDate?: string
  ): Promise<LaborAttendance[]> {
    try {
      let sql = `
        SELECT 
          id,
          labor_id as laborId,
          date,
          is_present as isPresent,
          hours_worked as hoursWorked,
          overtime,
          notes,
          synced,
          created_at as createdAt
        FROM labor_attendance
        WHERE labor_id = ?
      `;
      
      const params: any[] = [laborId];
      
      if (startDate) {
        sql += ' AND date >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        sql += ' AND date <= ?';
        params.push(endDate);
      }
      
      sql += ' ORDER BY date DESC';

      const rows = await getAllAsync(sql, params);
      return rows.map(this.mapDbRowToAttendance);
    } catch (error) {
      console.error('Error getting attendance by labor:', error);
      throw error;
    }
  }

  // Get daily labor summary
  static async getDailyLaborSummary(projectId: number, date: string): Promise<DailyLaborSummary> {
    try {
      // Get summary statistics
      const summaryResult = await getFirstAsync(`
        SELECT 
          COUNT(*) as totalLabor,
          SUM(CASE WHEN la.is_present = 1 THEN 1 ELSE 0 END) as totalPresent,
          SUM(CASE WHEN la.is_present = 0 THEN 1 ELSE 0 END) as totalAbsent,
          SUM(CASE WHEN la.is_present = 1 THEN la.hours_worked ELSE 0 END) as totalHours,
          SUM(CASE WHEN la.is_present = 1 THEN (la.hours_worked * l.daily_rate / 8) + (la.overtime * l.daily_rate / 8 * 1.5) ELSE 0 END) as totalCost
        FROM labor l
        LEFT JOIN labor_attendance la ON l.id = la.labor_id AND la.date = ?
        WHERE l.project_id = ? AND l.is_active = 1
      `, [date, projectId]);

      // Get detailed attendance
      const attendance = await this.getAttendanceByDate(projectId, date);

      return {
        date,
        totalPresent: summaryResult?.totalPresent || 0,
        totalAbsent: summaryResult?.totalAbsent || 0,
        totalHours: summaryResult?.totalHours || 0,
        totalCost: summaryResult?.totalCost || 0,
        attendance
      };
    } catch (error) {
      console.error('Error getting daily labor summary:', error);
      throw error;
    }
  }

  // Record labor expense
  static async recordLaborExpense(data: {
    laborId: number;
    date: string;
    amount: number;
    type: 'daily_wage' | 'overtime' | 'bonus' | 'advance' | 'deduction';
    description: string;
  }): Promise<number> {
    try {
      const result = await executeSql(
        `INSERT INTO labor_expenses (labor_id, date, amount, type, description, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.laborId,
          data.date,
          data.amount,
          data.type,
          data.description,
          getCurrentTimestamp()
        ]
      );
      
      console.log('Labor expense recorded:', result.lastInsertRowId);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error recording labor expense:', error);
      throw error;
    }
  }

  // Get labor expenses
  static async getLaborExpenses(
    laborId?: number, 
    startDate?: string, 
    endDate?: string
  ): Promise<LaborExpense[]> {
    try {
      let sql = `
        SELECT 
          id,
          labor_id as laborId,
          date,
          amount,
          type,
          description,
          synced,
          created_at as createdAt
        FROM labor_expenses
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (laborId) {
        sql += ' AND labor_id = ?';
        params.push(laborId);
      }
      
      if (startDate) {
        sql += ' AND date >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        sql += ' AND date <= ?';
        params.push(endDate);
      }
      
      sql += ' ORDER BY date DESC, created_at DESC';

      const rows = await getAllAsync(sql, params);
      return rows.map(this.mapDbRowToLaborExpense);
    } catch (error) {
      console.error('Error getting labor expenses:', error);
      throw error;
    }
  }

  // Get unsynced labor data
  static async getUnsyncedLabor(): Promise<Labor[]> {
    try {
      const rows = await getAllAsync(`
        SELECT 
          id,
          name,
          role,
          daily_rate as dailyRate,
          contact_number as contactNumber,
          project_id as projectId,
          is_active as isActive,
          synced,
          created_at as createdAt,
          updated_at as updatedAt
        FROM labor 
        WHERE synced = 0
        ORDER BY created_at DESC
      `);
      
      return rows.map(this.mapDbRowToLabor);
    } catch (error) {
      console.error('Error getting unsynced labor:', error);
      throw error;
    }
  }

  // Mark labor as synced
  static async markAsSynced(id: number): Promise<void> {
    try {
      await executeSql(
        'UPDATE labor SET synced = 1 WHERE id = ?',
        [id]
      );
      console.log('Labor marked as synced:', id);
    } catch (error) {
      console.error('Error marking labor as synced:', error);
      throw error;
    }
  }

  // Helper methods to map database rows to interfaces
  private static mapDbRowToLabor(row: any): Labor {
    return {
      id: row.id,
      name: row.name,
      role: row.role,
      dailyRate: row.dailyRate,
      contactNumber: row.contactNumber,
      projectId: row.projectId,
      isActive: Boolean(row.isActive),
      createdAt: row.createdAt
    };
  }

  private static mapDbRowToAttendance(row: any): LaborAttendance {
    return {
      id: row.id,
      laborId: row.laborId,
      date: row.date,
      isPresent: Boolean(row.isPresent),
      hoursWorked: row.hoursWorked,
      overtime: row.overtime,
      notes: row.notes,
      createdAt: row.createdAt
    };
  }

  private static mapDbRowToLaborExpense(row: any): LaborExpense {
    return {
      id: row.id,
      laborId: row.laborId,
      date: row.date,
      amount: row.amount,
      type: row.type,
      description: row.description,
      createdAt: row.createdAt
    };
  }
}
