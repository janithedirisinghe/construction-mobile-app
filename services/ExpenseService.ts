// services/ExpenseService.ts
import { db, executeSql, getAllAsync, getFirstAsync, getCurrentTimestamp } from '../database';
import { Expense, CreateExpenseData, ExpenseFilters, SortBy } from '../types/expense';
import { ProjectService } from './ProjectService';

export class ExpenseService {
  // Create a new expense
  static async createExpense(data: CreateExpenseData): Promise<number> {
    try {
      const result = await executeSql(
        `INSERT INTO expenses (title, amount, category, expense_date, notes, receipt_url, project_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.title,
          data.amount,
          data.category,
          data.expenseDate,
          data.notes || null,
          data.receiptUrl || null,
          data.projectId,
          getCurrentTimestamp(),
          getCurrentTimestamp()
        ]
      );

      const expenseId = result.lastInsertRowId;
      
      // Update project total spent
      await ProjectService.updateTotalSpent(data.projectId);
      
      console.log('Expense created with ID:', expenseId);
      return expenseId;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  // Get all expenses
  static async getAllExpenses(): Promise<Expense[]> {
    try {
      const rows = await getAllAsync(`
        SELECT 
          id,
          title,
          amount,
          category,
          expense_date as expenseDate,
          notes,
          receipt_url as receiptUrl,
          project_id as projectId,
          synced,
          created_at as createdAt,
          updated_at as updatedAt
        FROM expenses 
        ORDER BY expense_date DESC, created_at DESC
      `);
      
      return rows.map(this.mapDbRowToExpense);
    } catch (error) {
      console.error('Error getting all expenses:', error);
      throw error;
    }
  }

  // Get expenses by project ID
  static async getExpensesByProject(projectId: number): Promise<Expense[]> {
    try {
      const rows = await getAllAsync(`
        SELECT 
          id,
          title,
          amount,
          category,
          expense_date as expenseDate,
          notes,
          receipt_url as receiptUrl,
          project_id as projectId,
          synced,
          created_at as createdAt,
          updated_at as updatedAt
        FROM expenses 
        WHERE project_id = ?
        ORDER BY expense_date DESC, created_at DESC
      `, [projectId]);
      
      return rows.map(this.mapDbRowToExpense);
    } catch (error) {
      console.error('Error getting expenses by project:', error);
      throw error;
    }
  }

  // Get expense by ID
  static async getExpenseById(id: number): Promise<Expense | null> {
    try {
      const row = await getFirstAsync(`
        SELECT 
          id,
          title,
          amount,
          category,
          expense_date as expenseDate,
          notes,
          receipt_url as receiptUrl,
          project_id as projectId,
          synced,
          created_at as createdAt,
          updated_at as updatedAt
        FROM expenses 
        WHERE id = ?
      `, [id]);
      
      return row ? this.mapDbRowToExpense(row) : null;
    } catch (error) {
      console.error('Error getting expense by ID:', error);
      throw error;
    }
  }

  // Get filtered expenses
  static async getFilteredExpenses(
    filters: ExpenseFilters, 
    sortBy: SortBy = 'date',
    projectId?: number
  ): Promise<Expense[]> {
    try {
      let sql = `
        SELECT 
          id,
          title,
          amount,
          category,
          expense_date as expenseDate,
          notes,
          receipt_url as receiptUrl,
          project_id as projectId,
          synced,
          created_at as createdAt,
          updated_at as updatedAt
        FROM expenses 
        WHERE 1=1
      `;
      
      const params: any[] = [];

      if (projectId) {
        sql += ' AND project_id = ?';
        params.push(projectId);
      }

      if (filters.category) {
        sql += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.startDate) {
        sql += ' AND expense_date >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        sql += ' AND expense_date <= ?';
        params.push(filters.endDate);
      }

      if (filters.minAmount) {
        sql += ' AND amount >= ?';
        params.push(filters.minAmount);
      }

      if (filters.maxAmount) {
        sql += ' AND amount <= ?';
        params.push(filters.maxAmount);
      }

      // Add sorting
      switch (sortBy) {
        case 'amount':
          sql += ' ORDER BY amount DESC';
          break;
        case 'title':
          sql += ' ORDER BY title ASC';
          break;
        case 'category':
          sql += ' ORDER BY category ASC, expense_date DESC';
          break;
        case 'date':
        default:
          sql += ' ORDER BY expense_date DESC, created_at DESC';
          break;
      }

      const rows = await getAllAsync(sql, params);
      return rows.map(this.mapDbRowToExpense);
    } catch (error) {
      console.error('Error getting filtered expenses:', error);
      throw error;
    }
  }

  // Update expense
  static async updateExpense(id: number, data: Partial<CreateExpenseData>): Promise<void> {
    try {
      // Get current expense to know the project ID
      const currentExpense = await this.getExpenseById(id);
      if (!currentExpense) {
        throw new Error('Expense not found');
      }

      const updateFields: string[] = [];
      const params: any[] = [];

      if (data.title !== undefined) {
        updateFields.push('title = ?');
        params.push(data.title);
      }
      if (data.amount !== undefined) {
        updateFields.push('amount = ?');
        params.push(data.amount);
      }
      if (data.category !== undefined) {
        updateFields.push('category = ?');
        params.push(data.category);
      }
      if (data.expenseDate !== undefined) {
        updateFields.push('expense_date = ?');
        params.push(data.expenseDate);
      }
      if (data.notes !== undefined) {
        updateFields.push('notes = ?');
        params.push(data.notes);
      }
      if (data.receiptUrl !== undefined) {
        updateFields.push('receipt_url = ?');
        params.push(data.receiptUrl);
      }

      updateFields.push('updated_at = ?');
      params.push(getCurrentTimestamp());
      
      updateFields.push('synced = ?');
      params.push(0); // Mark as unsynced

      params.push(id);

      await executeSql(
        `UPDATE expenses SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      // Update project total spent
      await ProjectService.updateTotalSpent(currentExpense.projectId);

      console.log('Expense updated:', id);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  // Delete expense
  static async deleteExpense(id: number): Promise<void> {
    try {
      // Get current expense to know the project ID
      const currentExpense = await this.getExpenseById(id);
      if (!currentExpense) {
        throw new Error('Expense not found');
      }

      await executeSql('DELETE FROM expenses WHERE id = ?', [id]);
      
      // Update project total spent
      await ProjectService.updateTotalSpent(currentExpense.projectId);
      
      console.log('Expense deleted:', id);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // Get expense statistics for a project
  static async getExpenseStats(projectId: number): Promise<{
    totalAmount: number;
    expenseCount: number;
    categoryBreakdown: { category: string; amount: number; count: number }[];
  }> {
    try {
      // Get total amount and count
      const totalResult = await getFirstAsync(`
        SELECT 
          COALESCE(SUM(amount), 0) as totalAmount,
          COUNT(*) as expenseCount
        FROM expenses 
        WHERE project_id = ?
      `, [projectId]);

      // Get category breakdown
      const categoryRows = await getAllAsync(`
        SELECT 
          category,
          COALESCE(SUM(amount), 0) as amount,
          COUNT(*) as count
        FROM expenses 
        WHERE project_id = ?
        GROUP BY category
        ORDER BY amount DESC
      `, [projectId]);

      return {
        totalAmount: totalResult?.totalAmount || 0,
        expenseCount: totalResult?.expenseCount || 0,
        categoryBreakdown: categoryRows || []
      };
    } catch (error) {
      console.error('Error getting expense stats:', error);
      throw error;
    }
  }

  // Get unsynced expenses
  static async getUnsyncedExpenses(): Promise<Expense[]> {
    try {
      const rows = await getAllAsync(`
        SELECT 
          id,
          title,
          amount,
          category,
          expense_date as expenseDate,
          notes,
          receipt_url as receiptUrl,
          project_id as projectId,
          synced,
          created_at as createdAt,
          updated_at as updatedAt
        FROM expenses 
        WHERE synced = 0
        ORDER BY created_at DESC
      `);
      
      return rows.map(this.mapDbRowToExpense);
    } catch (error) {
      console.error('Error getting unsynced expenses:', error);
      throw error;
    }
  }

  // Mark expense as synced
  static async markAsSynced(id: number): Promise<void> {
    try {
      await executeSql(
        'UPDATE expenses SET synced = 1 WHERE id = ?',
        [id]
      );
      console.log('Expense marked as synced:', id);
    } catch (error) {
      console.error('Error marking expense as synced:', error);
      throw error;
    }
  }

  // Helper method to map database row to Expense interface
  private static mapDbRowToExpense(row: any): Expense {
    return {
      id: row.id,
      title: row.title,
      amount: row.amount,
      category: row.category,
      expenseDate: row.expenseDate,
      notes: row.notes,
      receiptUrl: row.receiptUrl,
      projectId: row.projectId,
      createdAt: row.createdAt
    };
  }
}
