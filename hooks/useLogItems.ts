
import { useState, useEffect } from 'react';
import { storage } from '@/utils/storage';
import { LogItem, LogEntry, Category } from '@/types/LogItem';

const STORAGE_KEY = 'did_i_log_it_items';

export function useLogItems() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load items from storage
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      console.log('Loading log items from storage');
      const stored = await storage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(parsed);
        console.log('Loaded items:', parsed.length);
      }
    } catch (error) {
      console.error('Error loading items:', error);
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

  const addItem = async (title: string, category: Category) => {
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

  const deleteItem = async (itemId: string) => {
    console.log('Deleting item:', itemId);
    const updatedItems = items.filter((item) => item.id !== itemId);
    await saveItems(updatedItems);
  };

  const deleteLog = async (itemId: string, logId: string) => {
    console.log('Deleting log:', logId, 'from item:', itemId);
    const updatedItems = items.map((item) =>
      item.id === itemId
        ? { ...item, logs: item.logs.filter((log) => log.id !== logId) }
        : item
    );
    await saveItems(updatedItems);
  };

  return {
    items,
    loading,
    addItem,
    logItem,
    deleteItem,
    deleteLog,
  };
}
