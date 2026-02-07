
export interface LogEntry {
  id: string;
  timestamp: string; // ISO 8601 format
}

export interface Category {
  categoryId: string; // Unique ID for category
  name: string;
  isDefault: boolean;
}

export interface LogItem {
  id: string;
  title: string;
  categoryId: string; // Reference category by ID, not name
  logs: LogEntry[];
  createdAt: string; // ISO 8601 format
  isDeleted?: boolean; // Soft delete flag
}

// Default category names for backward compatibility
export type DefaultCategoryName = 'Home' | 'Car' | 'Family' | 'Personal' | 'Maintenance';

export const DEFAULT_CATEGORY_NAMES: DefaultCategoryName[] = ['Home', 'Car', 'Family', 'Personal', 'Maintenance'];

// Default categories with IDs
export const DEFAULT_CATEGORIES: Category[] = [
  { categoryId: 'default-home', name: 'Home', isDefault: true },
  { categoryId: 'default-car', name: 'Car', isDefault: true },
  { categoryId: 'default-family', name: 'Family', isDefault: true },
  { categoryId: 'default-personal', name: 'Personal', isDefault: true },
  { categoryId: 'default-maintenance', name: 'Maintenance', isDefault: true },
];

export const CATEGORY_COLORS: Record<DefaultCategoryName, { light: string; dark: string }> = {
  Home: { light: '#DBEAFE', dark: '#1E3A8A' },
  Car: { light: '#FEE2E2', dark: '#7F1D1D' },
  Family: { light: '#FCE7F3', dark: '#831843' },
  Personal: { light: '#E0E7FF', dark: '#312E81' },
  Maintenance: { light: '#FEF3C7', dark: '#78350F' },
};
