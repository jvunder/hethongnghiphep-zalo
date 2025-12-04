export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: 'employee' | 'manager' | 'kitchen';
  department: string;
  zaloId?: string;
  avatar?: string;
  _docId?: string;
}

export interface Leave {
  id: string;
  userId: number;
  userName: string;
  department: string;
  date: string;
  time: 'full' | 'morning' | 'afternoon';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  cancelMeal: boolean;
  isLate: boolean;
  createdAt: string;
  _docId?: string;
}

export interface Meal {
  userId: number;
  userName: string;
  date: string;
  status: 'eating' | 'cancelled';
  reason?: string;
  _docId?: string;
}

export type AppState = {
  currentUser: User | null;
  users: User[];
  leaves: Leave[];
  meals: Record<string, Meal>;
};
