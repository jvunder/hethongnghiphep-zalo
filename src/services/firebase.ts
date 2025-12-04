import { User, Leave, Meal } from '../types';

// Firebase REST API Config
const FIREBASE_PROJECT_ID = 'leave-meal-management';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

// Default users
export const DEFAULT_USERS: User[] = [
  { id: 1, username: 'admin', password: '123456', name: 'Quản lý', role: 'manager', department: 'Quản lý' },
  { id: 2, username: 'nv1', password: '123456', name: 'Nguyễn Văn A', role: 'employee', department: 'Kỹ thuật' },
  { id: 3, username: 'nv2', password: '123456', name: 'Trần Thị B', role: 'employee', department: 'Kế toán' },
  { id: 4, username: 'nhabep', password: '123456', name: 'Nhà Bếp', role: 'kitchen', department: 'Nhà bếp' }
];

// Convert JS value to Firestore format
function toFirestoreValue(value: any): any {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: value.toString() };
    return { doubleValue: value };
  }
  if (typeof value === 'boolean') return { booleanValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === 'object') {
    const fields: Record<string, any> = {};
    for (const key in value) {
      fields[key] = toFirestoreValue(value[key]);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

function toFirestoreDoc(obj: Record<string, any>): { fields: Record<string, any> } {
  const fields: Record<string, any> = {};
  for (const key in obj) {
    if (key !== '_docId') {
      fields[key] = toFirestoreValue(obj[key]);
    }
  }
  return { fields };
}

// Convert Firestore format to JS value
function fromFirestoreValue(value: any): any {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return parseInt(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ('mapValue' in value) return fromFirestoreDoc({ fields: value.mapValue.fields });
  return null;
}

function fromFirestoreDoc(doc: { fields?: Record<string, any> }): any {
  if (!doc || !doc.fields) return null;
  const obj: Record<string, any> = {};
  for (const key in doc.fields) {
    obj[key] = fromFirestoreValue(doc.fields[key]);
  }
  return obj;
}

// Fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// REST API calls
export async function firestoreGet<T>(collection: string): Promise<T[]> {
  try {
    const response = await fetchWithTimeout(`${FIRESTORE_BASE_URL}/${collection}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return (data.documents || []).map((doc: any) => {
      const obj = fromFirestoreDoc(doc);
      obj._docId = doc.name.split('/').pop();
      return obj as T;
    });
  } catch (e) {
    console.error(`Error getting ${collection}:`, e);
    return [];
  }
}

export async function firestoreSet(collection: string, docId: string, data: Record<string, any>): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(`${FIRESTORE_BASE_URL}/${collection}/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDoc(data))
    });
    return response.ok;
  } catch (e) {
    console.error(`Error setting ${collection}/${docId}:`, e);
    return false;
  }
}

export async function firestoreAdd(collection: string, data: Record<string, any>): Promise<string | null> {
  try {
    const response = await fetchWithTimeout(`${FIRESTORE_BASE_URL}/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDoc(data))
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    return result.name.split('/').pop();
  } catch (e) {
    console.error(`Error adding to ${collection}:`, e);
    return null;
  }
}

export async function firestoreDelete(collection: string, docId: string): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(`${FIRESTORE_BASE_URL}/${collection}/${docId}`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (e) {
    console.error(`Error deleting ${collection}/${docId}:`, e);
    return false;
  }
}

export async function firestoreUpdate(collection: string, docId: string, updates: Record<string, any>): Promise<boolean> {
  try {
    const updateMask = Object.keys(updates).map(k => `updateMask.fieldPaths=${k}`).join('&');
    const response = await fetchWithTimeout(`${FIRESTORE_BASE_URL}/${collection}/${docId}?${updateMask}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFirestoreDoc(updates))
    });
    return response.ok;
  } catch (e) {
    console.error(`Error updating ${collection}/${docId}:`, e);
    return false;
  }
}

// Data management functions
export async function loadUsers(): Promise<User[]> {
  try {
    const users = await firestoreGet<User>('users');
    if (users.length === 0) {
      // Initialize default users
      for (const user of DEFAULT_USERS) {
        await firestoreSet('users', user.id.toString(), user);
      }
      return DEFAULT_USERS;
    }
    // Ensure kitchen user exists
    const hasKitchen = users.find(u => u.role === 'kitchen');
    if (!hasKitchen) {
      const kitchenUser = DEFAULT_USERS.find(u => u.role === 'kitchen')!;
      users.push(kitchenUser);
      await firestoreSet('users', '4', kitchenUser);
    }
    return users;
  } catch (e) {
    console.error('Error loading users:', e);
    return DEFAULT_USERS;
  }
}

export async function saveUser(user: User): Promise<void> {
  await firestoreSet('users', user.id.toString(), user);
}

export async function deleteUser(userId: number): Promise<void> {
  await firestoreDelete('users', userId.toString());
}

export async function loadLeaves(): Promise<Leave[]> {
  try {
    const leaves = await firestoreGet<Leave>('leaves');
    leaves.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return leaves;
  } catch (e) {
    console.error('Error loading leaves:', e);
    return [];
  }
}

export async function addLeave(leave: Omit<Leave, '_docId'>): Promise<Leave | null> {
  const docId = await firestoreAdd('leaves', leave);
  if (docId) {
    return { ...leave, _docId: docId };
  }
  return null;
}

export async function updateLeave(docId: string, updates: Partial<Leave>): Promise<void> {
  await firestoreUpdate('leaves', docId, updates);
}

export async function loadMeals(): Promise<Record<string, Meal>> {
  try {
    const meals = await firestoreGet<Meal>('meals');
    const mealMap: Record<string, Meal> = {};
    meals.forEach(m => {
      if (m._docId) {
        mealMap[m._docId] = m;
      }
    });
    return mealMap;
  } catch (e) {
    console.error('Error loading meals:', e);
    return {};
  }
}

export async function saveMeal(date: string, meal: Meal): Promise<void> {
  const mealKey = `${meal.userId}_${date}`;
  await firestoreSet('meals', mealKey, { ...meal, date });
}
