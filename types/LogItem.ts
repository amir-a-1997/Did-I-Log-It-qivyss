
export interface LogEntry {
  id: string;
  timestamp: string; // ISO 8601 format
}

export interface LogItem {
  id: string;
  title: string;
  category: string; // Changed from Category type to string to support custom categories
  logs: LogEntry[];
  createdAt: string; // ISO 8601 format
  isDeleted?: boolean; // Soft delete flag
}

export type Category = 'Home' | 'Car' | 'Family' | 'Personal' | 'Maintenance';

export const DEFAULT_CATEGORIES: Category[] = ['Home', 'Car', 'Family', 'Personal', 'Maintenance'];

export const CATEGORIES: Category[] = DEFAULT_CATEGORIES; // Keep for backward compatibility

export const CATEGORY_COLORS: Record<Category, { light: string; dark: string }> = {
  Home: { light: '#DBEAFE', dark: '#1E3A8A' },
  Car: { light: '#FEE2E2', dark: '#7F1D1D' },
  Family: { light: '#FCE7F3', dark: '#831843' },
  Personal: { light: '#E0E7FF', dark: '#312E81' },
  Maintenance: { light: '#FEF3C7', dark: '#78350F' },
};
