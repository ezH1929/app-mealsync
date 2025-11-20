import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

export interface MenuItem {
  id: string;
  day_id: string;
  name: string;
  description: string;
  category: string;
  diet_tags: string[];
  allergens: string[];
  protein_tag: string | null;
  calorie_range: string | null;
  price: number;
  available_qty: number;
  image_url: string;
  is_discovery_item: boolean;
  is_surplus_candidate: boolean;
  is_active: boolean;
  fasting_compliant: boolean;
  fasting_compliance_note: string | null;
  created_at: string;
}

export interface MenuDay {
  id: string;
  date: string;
  title: string;
  published: boolean;
  created_at: string;
  festival_tag: string | null;
  festival_note: string | null;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  office_status: 'IN_OFFICE' | 'WFH' | 'HYBRID';
  diet_profile: string[];
  allergies: string[];
  fasting: boolean;
  bookmarked_items: string[];
  last_nudge_shown: string | null;
  created_at: string;
}

export interface Prebook {
  id: string;
  user_id: string;
  date: string;
  item_id: string | null;
  item_category: string;
  created_at: string;
}

function readJSON<T>(filename: string): T[] {
  try {
    const filePath = path.join(dataDir, filename);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeJSON<T>(filename: string, data: T[]): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export const mockDb = {
  getMenuDays: (): MenuDay[] => readJSON<MenuDay>('menu_days.json'),
  getMenuDay: (date: string): MenuDay | null => {
    const d = new Date(date);
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
    
    // Weekend - No Menu
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        id: date,
        date: date,
        title: `Weekend - No Menu`,
        published: false,
        created_at: new Date().toISOString(),
        festival_tag: null,
        festival_note: null
      };
    }

    // Weekday - Static Menu
    // Using the template from the populated data (Navratri theme)
    return {
      id: date,
      date: date,
      title: `Menu — ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      published: true,
      created_at: new Date().toISOString(),
      festival_tag: "Navratri",
      festival_note: "Navratri special menu — fasting options highlighted."
    };
  },
  
  getMenuItems: (dayId?: string): MenuItem[] => {
    if (dayId) {
      const d = new Date(dayId);
      const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
      
      // Weekend - No items
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return [];
      }
    }

    const items = readJSON<MenuItem>('menu_items.json');
    // Return all items mapped to the requested dayId
    return dayId 
      ? items.map(item => ({ ...item, day_id: dayId }))
      : items;
  },
  
  getMenuItem: (id: string): MenuItem | null => {
    const items = readJSON<MenuItem>('menu_items.json');
    return items.find(i => i.id === id) || null;
  },
  
  updateMenuItem: (id: string, updates: Partial<MenuItem>): MenuItem | null => {
    const items = readJSON<MenuItem>('menu_items.json');
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    writeJSON('menu_items.json', items);
    return items[index];
  },
  
  getUsers: (): User[] => readJSON<User>('users.json'),
  
  getUser: (id: string): User | null => {
    const users = readJSON<User>('users.json');
    return users.find(u => u.id === id) || null;
  },
  
  getUserByEmail: (email: string): User | null => {
    const users = readJSON<User>('users.json');
    return users.find(u => u.email === email) || null;
  },
  
  updateUser: (id: string, updates: Partial<User>): User | null => {
    const users = readJSON<User>('users.json');
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    writeJSON('users.json', users);
    return users[index];
  },
  
  getPrebooks: (userId?: string, date?: string): Prebook[] => {
    let prebooks = readJSON<Prebook>('prebooks.json');
    if (userId) prebooks = prebooks.filter(p => p.user_id === userId);
    if (date) prebooks = prebooks.filter(p => p.date === date);
    return prebooks;
  },
  
  createPrebook: (prebook: Omit<Prebook, 'id' | 'created_at'>): Prebook => {
    const prebooks = readJSON<Prebook>('prebooks.json');
    const newPrebook: Prebook = {
      ...prebook,
      id: `prebook_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    prebooks.push(newPrebook);
    writeJSON('prebooks.json', prebooks);
    return newPrebook;
  },
  
  deletePrebook: (id: string): boolean => {
    const prebooks = readJSON<Prebook>('prebooks.json');
    const filtered = prebooks.filter(p => p.id !== id);
    if (filtered.length === prebooks.length) return false;
    writeJSON('prebooks.json', filtered);
    return true;
  },
};