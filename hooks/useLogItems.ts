
import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/utils/storage';
import { LogItem, LogEntry, Category, DEFAULT_CATEGORIES } from '@/types/LogItem';

const STORAGE_KEY = 'did_i_log_it_items';
const CATEGORIES_KEY = 'did_i_log_it_categories';

export function useLogItems() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
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

      // Load custom categories
      const storedCategories = await storage.getItem(CATEGORIES_KEY);
      if (storedCategories) {
        const parsed = JSON.parse(storedCategories);
        
        // Migration: Convert old string array to Category objects
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
          const migratedCategories = parsed.map((name: string) => ({
            categoryId: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            isDefault: false,
          }));
          setCustomCategories(migratedCategories);
          await storage.setItem(CATEGORIES_KEY, JSON.stringify(migratedCategories));
          console.log('Migrated custom categories to new format:', migratedCategories);
        } else {
          setCustomCategories(parsed);
          console.log('Loaded custom categories:', parsed);
        }
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

  const saveCategories = async (categories: Category[]) => {
    try {
      console.log('Saving custom categories to storage:', categories);
      await storage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      setCustomCategories(categories);
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
    
    // Check if category name already exists
    const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];
    const exists = allCategories.some(cat => cat.name === categoryName);
    
    if (!exists) {
      const newCategory: Category = {
        categoryId: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: categoryName,
        isDefault: false,
      };
      const updatedCategories = [...customCategories, newCategory];
      await saveCategories(updatedCategories);
    }
  };

  const renameCategory = async (categoryId: string, newName: string) => {
    console.log('Renaming category:', categoryId, 'to', newName);
    
    // Update category list
    const updatedCategories = customCategories.map((cat) =>
      cat.categoryId === categoryId ? { ...cat, name: newName } : cat
    );
    await saveCategories(updatedCategories);
  };

  const deleteCategory = useCallback(async (categoryId: string): Promise<boolean> => {
    try {
      console.log('Permanently deleting category and all items in it:', categoryId);
      
      // CRITICAL: Read from storage first to ensure we have the latest data (single source of truth)
      const storedItems = await storage.getItem(STORAGE_KEY);
      const currentItems = storedItems ? JSON.parse(storedItems) : [];
      
      const storedCategories = await storage.getItem(CATEGORIES_KEY);
      const currentCategories = storedCategories ? JSON.parse(storedCategories) : [];
      
      console.log('Current items from storage before category deletion:', currentItems.length);
      
      // Find the category to delete
      const categoryToDelete = currentCategories.find((cat: Category) => cat.categoryId === categoryId);
      
      if (!categoryToDelete) {
        console.warn('Category not found for deletion:', categoryId);
        return false;
      }
      
      if (categoryToDelete.isDefault) {
        console.warn('Attempted to delete a default category:', categoryId);
        return false;
      }
      
      // Find all items that belong to this category
      const itemsToDelete = currentItems.filter((item: LogItem) => item.categoryId === categoryId);
      console.log('Items to permanently delete:', itemsToDelete.length);
      
      // Permanently delete all items in this category (including their logs)
      const updatedItems = currentItems.filter((item: LogItem) => item.categoryId !== categoryId);
      
      // Remove the category from the custom categories list
      const updatedCategories = currentCategories.filter((cat: Category) => cat.categoryId !== categoryId);
      
      // Save both to persistent storage
      await storage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      await storage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
      
      console.log('Category and all items permanently deleted and saved to storage');
      
      // Update in-memory state
      setItems(updatedItems);
      setCustomCategories(updatedCategories);
      
      // Verify the deletion by reading back from storage
      const verifyItems = await storage.getItem(STORAGE_KEY);
      const verifiedItems = verifyItems ? JSON.parse(verifyItems) : [];
      console.log('Verified items after category deletion - total count:', verifiedItems.length);
      
      return true;
    } catch (error) {
      console.error('Failed to delete category and items:', error);
      return false;
    }
  }, []);

  return {
    items,
    loading,
    customCategories,
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
