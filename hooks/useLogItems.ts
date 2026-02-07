
import { useState, useEffect, useCallback, useRef } from 'react';
import { storage } from '@/utils/storage';
import { LogItem, LogEntry, Category, DEFAULT_CATEGORIES } from '@/types/LogItem';
import Toast from 'react-native-toast-message';

const STORAGE_KEY = 'did_i_log_it_items';
const CATEGORIES_KEY = 'did_i_log_it_categories';

export function useLogItems() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // Active categories only
  const [archivedCategories, setArchivedCategories] = useState<Category[]>([]); // Archived categories
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
            isArchived: false,
          }));
          setCategories(migratedCategories.filter((c: Category) => !c.isArchived));
          setArchivedCategories(migratedCategories.filter((c: Category) => c.isArchived));
          await storage.setItem(CATEGORIES_KEY, JSON.stringify(migratedCategories));
          console.log('Migrated custom categories to new format:', migratedCategories);
        } else {
          // Migration: Add isArchived field to existing categories if missing
          const migratedCategories = parsed.map((cat: any) => ({
            ...cat,
            isArchived: cat.isArchived ?? false,
          }));
          
          // Separate active and archived
          const active = migratedCategories.filter((c: Category) => !c.isArchived);
          const archived = migratedCategories.filter((c: Category) => c.isArchived);
          
          setCategories(active);
          setArchivedCategories(archived);
          console.log('Loaded custom categories - active:', active.length, 'archived:', archived.length);
          
          // Save migrated data if isArchived was added
          if (parsed.some((cat: any) => cat.isArchived === undefined)) {
            await storage.setItem(CATEGORIES_KEY, JSON.stringify(migratedCategories));
            console.log('Migrated categories with isArchived field');
          }
        }
      } else {
        // Initialize with empty arrays if no categories exist
        setCategories([]);
        setArchivedCategories([]);
        console.log('No custom categories found, initialized with empty arrays');
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

  const saveCategories = async (allCategories: Category[]) => {
    try {
      console.log('Saving all categories to storage (active + archived):', allCategories.length);
      await storage.setItem(CATEGORIES_KEY, JSON.stringify(allCategories));
      
      // Separate active and archived for state
      const active = allCategories.filter(c => !c.isArchived);
      const archived = allCategories.filter(c => c.isArchived);
      
      setCategories(active);
      setArchivedCategories(archived);
      console.log('Categories updated - active:', active.length, 'archived:', archived.length);
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
    
    // Check if category name already exists (including default categories and archived)
    const allCategories = [...DEFAULT_CATEGORIES, ...currentCategories];
    const exists = allCategories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
    
    if (!exists) {
      const newCategory: Category = {
        categoryId: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: categoryName,
        isDefault: false,
        sortOrder: DEFAULT_CATEGORIES.length + currentCategories.length,
        isArchived: false,
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

  const archiveCategory = useCallback(async (categoryId: string): Promise<boolean> => {
    try {
      console.log('=== STARTING CATEGORY ARCHIVE (SOFT DELETE) ===');
      console.log('Archiving category and moving items to Uncategorised:', categoryId);
      
      // CRITICAL: Read from storage first to ensure we have the latest data (single source of truth)
      const storedItems = await storage.getItem(STORAGE_KEY);
      const currentItems = storedItems ? JSON.parse(storedItems) : [];
      
      const storedCategories = await storage.getItem(CATEGORIES_KEY);
      const currentCategories = storedCategories ? JSON.parse(storedCategories) : [];
      
      console.log('Current items from storage before category archive:', currentItems.length);
      console.log('Current categories from storage before archive:', currentCategories.length);
      
      // Find the category to archive
      const categoryToArchive = currentCategories.find((cat: Category) => cat.categoryId === categoryId);
      
      if (!categoryToArchive) {
        console.warn('Category not found for archive:', categoryId);
        Toast.show({ type: 'error', text1: 'Category not found.' });
        return false;
      }
      
      console.log('Found category to archive:', categoryToArchive.name);
      
      if (categoryToArchive.isDefault) {
        console.warn('Attempted to archive a default category:', categoryId);
        Toast.show({ type: 'error', text1: "Default categories can't be archived." });
        return false;
      }
      
      // Find all items that belong to this category
      const itemsToUpdate = currentItems.filter((item: LogItem) => item.categoryId === categoryId);
      console.log('Items to move to Uncategorised (categoryId = null):', itemsToUpdate.length);
      itemsToUpdate.forEach((item: LogItem) => {
        console.log('  - Moving item:', item.title);
      });
      
      // Set categoryId to null for items in the archived category (move to Uncategorised)
      // DO NOT delete items or their logs
      const updatedItems = currentItems.map((item: LogItem) =>
        item.categoryId === categoryId ? { ...item, categoryId: null } : item
      );
      console.log('Items updated - total count:', updatedItems.length);
      
      // Set isArchived = true for the category
      const updatedCategories = currentCategories.map((cat: Category) =>
        cat.categoryId === categoryId ? { ...cat, isArchived: true } : cat
      );
      console.log('Category archived in list');
      
      // Save both to persistent storage
      await storage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      console.log('✓ Items saved to storage (categoryId set to null for affected items)');
      
      await storage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
      console.log('✓ Categories saved to storage');
      
      // Update in-memory state
      setItems(updatedItems);
      await saveCategories(updatedCategories); // This will separate active/archived
      console.log('✓ In-memory state updated');
      
      // Verify the archive by reading back from storage
      const verifyItems = await storage.getItem(STORAGE_KEY);
      const verifiedItems = verifyItems ? JSON.parse(verifyItems) : [];
      console.log('Verified items after category archive - total count:', verifiedItems.length);
      const uncategorisedCount = verifiedItems.filter((item: LogItem) => item.categoryId === null).length;
      console.log('Verified uncategorised items count:', uncategorisedCount);
      
      const verifyCategories = await storage.getItem(CATEGORIES_KEY);
      const verifiedCategories = verifyCategories ? JSON.parse(verifyCategories) : [];
      const archivedCount = verifiedCategories.filter((cat: Category) => cat.isArchived).length;
      console.log('Verified categories after archive - total count:', verifiedCategories.length, 'archived:', archivedCount);
      
      Toast.show({ type: 'success', text1: 'Category archived.' });
      console.log('=== CATEGORY ARCHIVE COMPLETE (ITEMS MOVED TO UNCATEGORISED) ===');
      return true;
    } catch (error) {
      console.error('Failed to archive category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Toast.show({ type: 'error', text1: `Archive failed: ${errorMessage}` });
      return false;
    }
  }, []);

  const restoreCategory = useCallback(async (categoryId: string): Promise<boolean> => {
    try {
      console.log('=== STARTING CATEGORY RESTORE ===');
      console.log('Restoring category:', categoryId);
      
      // Read from storage to get the latest categories
      const storedCategories = await storage.getItem(CATEGORIES_KEY);
      const currentCategories = storedCategories ? JSON.parse(storedCategories) : [];
      
      console.log('Current categories from storage before restore:', currentCategories.length);
      
      // Find the category to restore
      const categoryToRestore = currentCategories.find((cat: Category) => cat.categoryId === categoryId);
      
      if (!categoryToRestore) {
        console.warn('Category not found for restore:', categoryId);
        Toast.show({ type: 'error', text1: 'Category not found.' });
        return false;
      }
      
      console.log('Found category to restore:', categoryToRestore.name);
      
      // Set isArchived = false for the category
      const updatedCategories = currentCategories.map((cat: Category) =>
        cat.categoryId === categoryId ? { ...cat, isArchived: false } : cat
      );
      console.log('Category restored in list');
      
      // Save to persistent storage
      await storage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
      console.log('✓ Categories saved to storage');
      
      // Update in-memory state
      await saveCategories(updatedCategories); // This will separate active/archived
      console.log('✓ In-memory state updated');
      
      // Verify the restore by reading back from storage
      const verifyCategories = await storage.getItem(CATEGORIES_KEY);
      const verifiedCategories = verifyCategories ? JSON.parse(verifyCategories) : [];
      const archivedCount = verifiedCategories.filter((cat: Category) => cat.isArchived).length;
      console.log('Verified categories after restore - total count:', verifiedCategories.length, 'archived:', archivedCount);
      
      Toast.show({ type: 'success', text1: 'Category restored.' });
      console.log('=== CATEGORY RESTORE COMPLETE ===');
      return true;
    } catch (error) {
      console.error('Failed to restore category:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Toast.show({ type: 'error', text1: `Restore failed: ${errorMessage}` });
      return false;
    }
  }, []);

  // Legacy deleteCategory function - now calls archiveCategory
  const deleteCategory = useCallback(async (categoryId: string): Promise<boolean> => {
    console.log('deleteCategory called - redirecting to archiveCategory');
    return await archiveCategory(categoryId);
  }, [archiveCategory]);

  return {
    items,
    loading,
    categories, // Active custom categories only (isArchived = false)
    archivedCategories, // Archived custom categories (isArchived = true)
    addItem,
    logItem,
    softDeleteItem,
    restoreItem,
    deleteItem,
    deleteLog,
    clearItemHistory,
    addCategory,
    renameCategory,
    deleteCategory, // Legacy - calls archiveCategory
    archiveCategory,
    restoreCategory,
  };
}
