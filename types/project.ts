// types/project.ts
export interface Project {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  targetBudget: number;
  totalSpent?: number; // optional, can be calculated from expenses
  description?: string;
  userId: number;
}

export interface CreateProjectData {
  title: string;
  startDate: string;
  endDate: string;
  targetBudget: number;
  description?: string;
}
