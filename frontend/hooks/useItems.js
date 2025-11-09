'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

const API_BASE = process.env.VITE_BACKEND_LINK || 'http://localhost:5000/api';

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/items`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (itemData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = { _id: tempId, ...itemData, createdAt: new Date().toISOString() };
    
    setItems((prev) => [optimisticItem, ...prev]);
    
    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (!res.ok) throw new Error('Failed to create item');
      const created = await res.json();
      
      setItems((prev) => prev.map((item) => (item._id === tempId ? created : item)));
      toast.success('Item created successfully');
      return created;
    } catch (err) {
      setItems((prev) => prev.filter((item) => item._id !== tempId));
      toast.error('Failed to create item');
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (id, itemData) => {
    const previousItems = [...items];
    
    setItems((prev) => prev.map((item) => (item._id === id ? { ...item, ...itemData } : item)));
    
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (!res.ok) throw new Error('Failed to update item');
      const updated = await res.json();
      
      setItems((prev) => prev.map((item) => (item._id === id ? updated : item)));
      toast.success('Item updated successfully');
      return updated;
    } catch (err) {
      setItems(previousItems);
      toast.error('Failed to update item');
      throw err;
    }
  }, [items]);

  const deleteItem = useCallback(async (id) => {
    const previousItems = [...items];
    
    setItems((prev) => prev.filter((item) => item._id !== id));
    
    toast.success('Item deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          setItems(previousItems);
          toast.success('Delete cancelled');
        },
      },
      duration: 5000,
    });
    
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');
    } catch (err) {
      setItems(previousItems);
      toast.error('Failed to delete item');
      throw err;
    }
  }, [items]);

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  };
}
