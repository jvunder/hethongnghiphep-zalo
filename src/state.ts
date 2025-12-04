import { User, Leave, Meal } from './types';
import { loadUsers, loadLeaves, loadMeals, saveUser, addLeave, updateLeave, saveMeal, deleteUser, DEFAULT_USERS } from './services/firebase';

// Global state
let currentUser: User | null = null;
let users: User[] = [];
let leaves: Leave[] = [];
let meals: Record<string, Meal> = {};
let listeners: (() => void)[] = [];
let syncInterval: ReturnType<typeof setInterval> | null = null;

// State getters
export const getState = () => ({
  currentUser,
  users,
  leaves,
  meals
});

export const getCurrentUser = () => currentUser;
export const getUsers = () => users.length > 0 ? users : DEFAULT_USERS;
export const getLeaves = () => leaves;
export const getMeals = () => meals;

// Subscribe to state changes
export const subscribe = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(l => l());
};

// Auth actions
export const login = (user: User) => {
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  startDataSync();
  notifyListeners();
};

export const logout = () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  stopDataSync();
  notifyListeners();
};

export const restoreSession = async (): Promise<boolean> => {
  const saved = localStorage.getItem('currentUser');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      startDataSync();
      notifyListeners();
      return true;
    } catch {
      localStorage.removeItem('currentUser');
    }
  }
  return false;
};

// Data initialization
export const initData = async () => {
  users = await loadUsers();
  leaves = await loadLeaves();
  meals = await loadMeals();
  notifyListeners();
};

// Data sync (polling every 30s)
const startDataSync = () => {
  if (syncInterval) return;
  syncInterval = setInterval(async () => {
    if (currentUser) {
      users = await loadUsers();
      leaves = await loadLeaves();
      meals = await loadMeals();
      notifyListeners();
    }
  }, 30000);
};

const stopDataSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};

// User actions
export const createUser = async (userData: Omit<User, 'id'>) => {
  const maxId = Math.max(...users.map(u => u.id), 0);
  const newUser: User = { ...userData, id: maxId + 1 };
  await saveUser(newUser);
  users = [...users, newUser];
  notifyListeners();
  return newUser;
};

export const editUser = async (user: User) => {
  await saveUser(user);
  users = users.map(u => u.id === user.id ? user : u);
  if (currentUser?.id === user.id) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
  notifyListeners();
};

export const removeUser = async (userId: number) => {
  await deleteUser(userId);
  users = users.filter(u => u.id !== userId);
  notifyListeners();
};

// Leave actions
export const createLeave = async (leaveData: Omit<Leave, 'id' | '_docId'>) => {
  const id = Date.now().toString();
  const leave = await addLeave({ ...leaveData, id });
  if (leave) {
    leaves = [leave, ...leaves];
    notifyListeners();
    return leave;
  }
  return null;
};

export const modifyLeave = async (docId: string, updates: Partial<Leave>) => {
  await updateLeave(docId, updates);
  leaves = leaves.map(l => l._docId === docId ? { ...l, ...updates } : l);
  notifyListeners();
};

// Meal actions
export const updateMeal = async (date: string, meal: Meal) => {
  await saveMeal(date, meal);
  const key = `${meal.userId}_${date}`;
  meals = { ...meals, [key]: { ...meal, date } };
  notifyListeners();
};

// Helpers
export const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export const formatDateChinese = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};
