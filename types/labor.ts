export interface Labor {
  id: number;
  name: string;
  role: string; // e.g., "Mason", "Carpenter", "Helper", "Electrician"
  dailyRate: number;
  contactNumber?: string;
  projectId: number;
  isActive: boolean;
  createdAt: string;
}

export interface LaborAttendance {
  id: number;
  laborId: number;
  date: string;
  isPresent: boolean;
  hoursWorked: number;
  overtime: number;
  notes?: string;
  createdAt: string;
}

export interface LaborExpense {
  id: number;
  laborId: number;
  date: string;
  amount: number;
  type: 'daily_wage' | 'overtime' | 'bonus' | 'advance' | 'deduction';
  description: string;
  createdAt: string;
}

export interface DailyLaborSummary {
  date: string;
  totalPresent: number;
  totalAbsent: number;
  totalHours: number;
  totalCost: number;
  attendance: LaborAttendance[];
}
