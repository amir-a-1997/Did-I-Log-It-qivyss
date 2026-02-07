
import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/utils/storage';
import { LogItem, LogEntry, Category, DEFAULT_CATEGORIES } from '@/types/LogItem';

const STORAGE_KEY = 'did_i_log_it_items';
const CATEGORIES_KEY = 'did_i_log_it_categories';

export function useLogItems() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Load items and categories from storage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading log items and categories from storage');
      
      // Load items
      const storedItems = await storage.getItem(STORAGE_KEY);
      if (storedItems) {
        const parsed = JSON.parse(storedItems);
        
        // Migration: Convert old string-based categories to categoryId
        const migratedItems = parsed.map((item: any) => {
          if (item.category && !item.categoryId) {
            // Find matching default category
            const defaultCat = DEFAULT_CATEGORIES.find(cat => cat.name === item.category);
            return {
              ...item,
              categoryId: defaultCat ? defaultCat.categoryId : 'default-home',
            };
          }
          return item;
        });
        
        setItems(migratedItems);
        console.log('Loaded items:', migratedItems.length);
      }

      // Load categories
      const storedCategories = await storage.getItem(CATEGORIES_KEY);
      if (storedCategories) {
        const parsed = JSON.parse(storedCategories);
        
        // Migration: Convert old string array to Category objects
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
          const migratedCategories = parsed.map((name: string, index: number) => ({
            categoryId: `custom-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            isDefault: false,
            sortOrder: DEFAULT_CATEGORIES.length + index,
          }));
          setCategories(migratedCategories);
          await storage.setItem(CATEGORIES_KEY, JSON.stringify(migratedCategories));
          console.log('Migrated custom categories to new format:', migratedCategories);
        } else {
          setCategories(parsed);
          console.log('Loaded custom categories:', parsed);
        }
      } else {
        // Initialize with empty array if no categories exist
        setCategories([]);
        console.log('No custom categories found, initialized with empty array');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveItems = async (newItems: LogItem[]) => {
    try {
      console.log('Saving items to storage:', newItems.length);
      await storage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      setItems(newItems);
    } catch (error) {
      console.error('Error saving items:', error);
    }
  };

  const saveCategories = async (newCategories: Category[]) => {
    try {
      console.log('Saving custom categories to storage:', newCategories);
      await storage.setItem(CATEGORIES_KEY, JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

  const addItem = async (title: string, categoryId: string) => {
    console.log('Adding new item:', title, categoryId);
    const newItem: LogItem = {
      id: Date.now().toString(),
      title,
      categoryId,
      logs: [],
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };
    await saveItems([...items, newItem]);
  };

  const logItem = useCallback(async (itemId: string) => {
    console.log('Logging item:', itemId);
    
    // CRITICAL FIX: Read from storage first to get the latest data (single source of truth)
    const storedItems = await storage.getItem(STORAGE_KEY);
    const currentItems = storedItems ? JSON.parse(storedItems) : [];
    
    console.log('Current items from storage before logging:', currentItems.length);
    
    // Create new log entry
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    // Update the item by reading from storage, not from in-memory state
    const updatedItems = currentItems.map((item: LogItem) =>
      item.id === itemId ? { ...item, logs: [newLog, ...item.logs] } : item
    );
    
    // Save to persistent storage
    await storage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
    console.log('Log entry added and saved to storage for item:', itemId);
    
    // Update in-memory state
    setItems(updatedItems);
    
    // Verify the log was added by reading back from storage
    const verifyItems = await storage.getItem(STORAGE_KEY);
    const verifiedItems = verifyItems ? JSON.parse(verifyItems) : [];
    const verifiedItem = verifiedItems.find((item: LogItem) => item.id === itemId);
    console.log('Verified item after logging - logs count:', verifiedItem?.logs.length || 0);
  }, []);

  const softDeleteItem = useCallback(async (itemId: string) => {
    console.log('Soft deleting item (marking as deleted):', itemId);
    
    // Read from storage to ensure we have the latest data
    const storedItems = await storage.getItem(STORAGE_KEY);
    const currentItems = storedItems ? JSON.parse(storedItems) : [];
    
    const updatedItems = currentItems.map((item: LogItem) =>
      item.id === itemId ? { ...item, isDeleted: true } : item
    );
    
    await saveItems(updatedItems);
    console.log('Item marked as deleted:', itemId);
  }, []);

  const restoreItem = useCallback(async (itemId: string) => {
    console.log('Restoring item (unmarking as deleted):', itemId);
    
    // Read from storage to ensure we have the latest data
    const storedItems = await storage.getItem(STORAGE_KEY);
    const currentItems = storedItems ? JSON.parse(storedItems) : [];
    
    const updatedItems = currentItems.map((item: LogItem) =>
      item.id === itemId ? { ...item, isDeleted: false } : item
    );
    
    await saveItems(updatedItems);
    console.log('Item restored:', itemId);
  }, []);

  const deleteItem = useCallback(async (itemId: string) => {
    console.log('Permanently deleting item and all history:', itemId);
    // Read from storage to ensure we have the latest data
    const storedItems = await storage.getItem(STORAGE_KEY);
    const currentItems = storedItems ? JSON.parse(storedItems) : [];
    const updatedItems = currentItems.filter((item: LogItem) => item.id !== itemId);
    await saveItems(updatedItems);
  }, []);

  const deleteLog = async (itemId: string, logId: string) => {
    console.log('Deleting log:', logId, 'from item:', itemId);
    
    // Read from storage first to ensure we have the latest data
    const storedItems = await storage.getItem(STORAGE_KEY);
    const currentItems = storedItems ? JSON.parse(storedItems) : [];
    
    const updatedItems = currentItems.map((item: LogItem) =>
      item.id === itemId
        ? { ...item, logs: item.logs.filter((log) => log.id !== logId) }
        : item
    );
    await saveItems(updatedItems);
  };

  const clearItemHistory = useCallback(async (itemId: string) => {
    console.log('Clearing ALL history for item:', itemId);
    
    // CRITICAL: Read from storage first to ensure we have the latest data (single source of truth)
    const storedItems = await storage.getItem(STORAGE_KEY);
    const currentItems = storedItems ? JSON.parse(storedItems) : [];
    
    console.log('Current items from storage before clear:', currentItems.length);
    
    // Find the item and clear its logs array
    const updatedItems = currentItems.map((item: LogItem) =>
      item.id === itemId ? { ...item, logs: [] } : item
    );
    
    // Save to persistent storage
    await storage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
    console.log('History cleared and saved to storage for item:', itemId);
    
    // Update in-memory state
    setItems(updatedItems);
    
    // Verify the clear by reading back from storage
    const verifyItems = await storage.getItem(STORAGE_KEY);
    const verifiedItems = verifyItems ? JSON.parse(verifyItems) : [];
    const verifiedItem = verifiedItems.find((item: LogItem) => item.id === itemId);
    console.log('Verified item after clear - logs count:', verifiedItem?.logs.length || 0);
  }, []);

  const addCategory = async (categoryName: string) => {
    console.log('Adding custom category:', categoryName);
    
    // Read from storage to get the latest categories
    const storedCategories = await storage.getItem(CATEGORIES_KEY);
    const currentCategories = storedCategories ? JSON.parse(storedCategories) : [];
    
    // Check if category name already exists (including default categories)
    const allCategories = [...DEFAULT_CATEGORIES, ...currentCategories];
    const exists = allCategories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
    
    if (!exists) {
      const newCategory: Category = {
        categoryId: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: categoryName,
        isDefault: false,
        sortOrder: DEFAULT_CATEGORIES.length + currentCategories.length,
      };
      const updatedCategories = [...currentCategories, newCategory];
      await saveCategories(updatedCategories);
      console.log('Category added successfully:', newCategory);
    } else {
      console.warn('Category already exists:', categoryName);
    }
  };

  const renameCategory = async (categoryId: string, newName: string) => {
    console.log('Renaming category:', categoryId, 'to', newName);
    
    // Read from storage to get the latest categories
    const storedCategories = await storage.getItem(CATEGORIES_KEY);
    const currentCategories = storedCategories ? JSON.parse(storedCategories) : [];
    
    // Update category list
    const updatedCategories = currentCategories.map((cat: Category) =>
      cat.categoryId === categoryId ? { ...cat, name: newName } : cat
    );
    await saveCategories(updatedCategories);
    console.log('Category renamed successfully');
  };

  const deleteCategory = useCallback(async (categoryId: string): Promise<boolean> => {
    try {
      console.log('=== STARTING CATEGORY DELETION ===');
      console.log('Permanently deleting category and all items in it:', categoryId);
      
      // CRITICAL: Read from storage first to ensure we have the latest data (single source of truth)
      const storedItems = await storage.getItem(STORAGE_KEY);
      const currentItems = storedItems ? JSON.parse(storedItems) : [];
      
      const storedCategories = await storage.getItem(CATEGORIES_KEY);
      const currentCategories = storedCategories ? JSON.parse(storedCategories) : [];
      
      console.log('Current items from storage before category deletion:', currentItems.length);
      console.log('Current categories from storage before deletion:', currentCategories.length);
      
      // Find the category to delete
      const categoryToDelete = currentCategories.find((cat: Category) => cat.categoryId === categoryId);
      
      if (!categoryToDelete) {
        console.warn('Category not found for deletion:', categoryId);
        return false;
      }
      
      console.log('Found category to delete:', categoryToDelete.name);
      
      if (categoryToDelete.isDefault) {
        console.warn('Attempted to delete a default category:', categoryId);
        return false;
      }
      
      // Find all items that belong to this category
      const itemsToDelete = currentItems.filter((item: LogItem) => item.categoryId === categoryId);
      console.log('Items to permanently delete:', itemsToDelete.length);
      itemsToDelete.forEach((item: LogItem) => {
        console.log('  - Deleting item:', item.title, 'with', item.logs.length, 'logs');
      });
      
      // Permanently delete all items in this category (including their logs)
      const updatedItems = currentItems.filter((item: LogItem) => item.categoryId !== categoryId);
      console.log('Remaining items after deletion:', updatedItems.length);
      
      // Remove the category from the custom categories list
      const updatedCategories = currentCategories.filter((cat: Category) => cat.categoryId !== categoryId);
      console.log('Remaining categories after deletion:', updatedCategories.length);
      
      // Save both to persistent storage
      await storage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      console.log('✓ Items saved to storage');
      
      await storage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
      console.log('✓ Categories saved to storage');
      
      // Update in-memory state
      setItems(updatedItems);
      setCategories(updatedCategories);
      console.log('✓ In-memory state updated');
      
      // Verify the deletion by reading back from storage
      const verifyItems = await storage.getItem(STORAGE_KEY);
      const verifiedItems = verifyItems ? JSON.parse(verifyItems) : [];
      console.log('Verified items after category deletion - total count:', verifiedItems.length);
      
      const verifyCategories = await storage.getItem(CATEGORIES_KEY);
      const verifiedCategories = verifyCategories ? JSON.parse(verifyCategories) : [];
      console.log('Verified categories after deletion - total count:', verifiedCategories.length);
      
      console.log('=== CATEGORY DELETION COMPLETE ===');
      return true;
    } catch (error) {
      console.error('Failed to delete category and items:', error);
      return false;
    }
  }, []);

  return {
    items,
    loading,
    categories, // Return all categories (custom only, default categories are in DEFAULT_CATEGORIES constant)
    addItem,
    logItem,
    softDeleteItem,
    restoreItem,
    deleteItem,
    deleteLog,
    clearItemHistory,
    addCategory,
    renameCategory,
    deleteCategory,
  };
}
