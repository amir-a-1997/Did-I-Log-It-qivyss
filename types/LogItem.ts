
export interface LogEntry {
  id: string;
  timestamp: string; // ISO 8601 format
}

export interface LogItem {
  id: string;
  title: string;
  category: Category;
  logs: LogEntry[];
  createdAt: string; // ISO 8601 format
}

export type Category = 'Home' | 'Car' | 'Family' | 'Personal' | 'Maintenance';

export const CATEGORIES: Category[] = ['Home', 'Car', 'Family', 'Personal', 'Maintenance'];

export const CATEGORY_COLORS: Record<Category, { light: string; dark: string }> = {
  Home: { light: '#DBEAFE', dark: '#1E3A8A' },
  Car: { light: '#FEE2E2', dark: '#7F1D1D' },
  Family: { light: '#FCE7F3', dark: '#831843' },
  Personal: { light: '#E0E7FF', dark: '#312E81' },
  Maintenance: { light: '#FEF3C7', dark: '#78350F' },
};
