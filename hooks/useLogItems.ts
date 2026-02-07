
import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/utils/storage';
import { LogItem, LogEntry, Category } from '@/types/LogItem';

const STORAGE_KEY = 'did_i_log_it_items';
const CATEGORIES_KEY = 'did_i_log_it_categories';

export function useLogItems() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
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
        setItems(parsed);
        console.log('Loaded items:', parsed.length);
      }

      // Load custom categories
      const storedCategories = await storage.getItem(CATEGORIES_KEY);
      if (storedCategories) {
        const parsed = JSON.parse(storedCategories);
        setCustomCategories(parsed);
        console.log('Loaded custom categories:', parsed);
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

  const saveCategories = async (categories: string[]) => {
    try {
      console.log('Saving custom categories to storage:', categories);
      await storage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      setCustomCategories(categories);
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

  const addItem = async (title: string, category: string) => {
    console.log('Adding new item:', title, category);
    const newItem: LogItem = {
      id: Date.now().toString(),
      title,
      category,
      logs: [],
      createdAt: new Date().toISOString(),
    };
    await saveItems([...items, newItem]);
  };

  const logItem = async (itemId: string) => {
    console.log('Logging item:', itemId);
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, logs: [newLog, ...item.logs] } : item
    );
    await saveItems(updatedItems);
  };

  const deleteItem = useCallback(async (itemId: string) => {
    console.log('Deleting item and all history:', itemId);
    const updatedItems = items.filter((item) => item.id !== itemId);
    await saveItems(updatedItems);
  }, [items]);

  const deleteLog = async (itemId: string, logId: string) => {
    console.log('Deleting log:', logId, 'from item:', itemId);
    const updatedItems = items.map((item) =>
      item.id === itemId
        ? { ...item, logs: item.logs.filter((log) => log.id !== logId) }
        : item
    );
    await saveItems(updatedItems);
  };

  const clearItemHistory = useCallback(async (itemId: string) => {
    console.log('Clearing ALL history for item:', itemId);
    // Find the item and clear its logs
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, logs: [] } : item
    );
    // Save to persistent storage
    await saveItems(updatedItems);
    console.log('History cleared and saved to storage');
  }, [items]);

  const addCategory = async (categoryName: string) => {
    console.log('Adding custom category:', categoryName);
    if (!customCategories.includes(categoryName)) {
      const updatedCategories = [...customCategories, categoryName];
      await saveCategories(updatedCategories);
    }
  };

  const renameCategory = async (oldName: string, newName: string) => {
    console.log('Renaming category:', oldName, 'to', newName);
    
    // Update category list
    const updatedCategories = customCategories.map((cat) =>
      cat === oldName ? newName : cat
    );
    await saveCategories(updatedCategories);

    // Update all items with this category
    const updatedItems = items.map((item) =>
      item.category === oldName ? { ...item, category: newName } : item
    );
    await saveItems(updatedItems);
  };

  const deleteCategory = async (categoryName: string) => {
    console.log('Deleting category:', categoryName);
    
    // Remove from category list
    const updatedCategories = customCategories.filter((cat) => cat !== categoryName);
    await saveCategories(updatedCategories);

    // Move items to "Uncategorised"
    const updatedItems = items.map((item) =>
      item.category === categoryName ? { ...item, category: 'Uncategorised' } : item
    );
    await saveItems(updatedItems);
  };

  return {
    items,
    loading,
    customCategories,
    addItem,
    logItem,
    deleteItem,
    deleteLog,
    clearItemHistory,
    addCategory,
    renameCategory,
    deleteCategory,
  };
}
