import React, { createContext, useState, useContext, useEffect } from 'react';
import { ref, onValue, push, update, remove, set } from 'firebase/database'; // 👈 Added 'set'
import { db } from '../config/firebase';
import { scheduleReminder } from '../services/notificationService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // 🔔 Listen to Products
  useEffect(() => {
    const unsub = onValue(ref(db, 'reminders'), (snap) => {
      const data = snap.val();
      setProducts(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
    });
    return () => unsub();
  }, []);

  // 🔔 Listen to Categories
  useEffect(() => {
    const unsub = onValue(ref(db, 'categories'), (snap) => {
      const data = snap.val();
      if (data) {
        // Handle both string values and object values
        const cats = Object.keys(data).map(key => ({ 
          id: key, 
          name: typeof data[key] === 'string' ? data[key] : data[key].name 
        }));
        setCategories(cats);
      } else {
        setCategories([]);
      }
    });
    return () => unsub();
  }, []);

  const addProduct = async (product) => {
    const newRef = push(ref(db, 'reminders'));
    const payload = { ...product, id: newRef.key, category: product.category || 'Uncategorized' };
    await update(newRef, payload);
    await scheduleReminder(product.name, product.expiry);
  };

  const updateProduct = async (id, updates) => {
    await update(ref(db, `reminders/${id}`), updates);
    const product = products.find(p => p.id === id);
    if (product && (updates.expiry || updates.name)) {
      await scheduleReminder(updates.name || product.name, updates.expiry || product.expiry);
    }
  };

  const removeProduct = async (id) => await remove(ref(db, `reminders/${id}`));

  // ✅ FIXED: Properly save category name
  const addCategory = async (name) => {
    try {
      const newRef = push(ref(db, 'categories'));
      await set(newRef, name.trim()); // 👈 Use set() with string value
      console.log(`✅ Category added: ${name}`);
    } catch (error) {
      console.error('❌ Error adding category:', error);
    }
  };

  const removeCategory = async (id) => {
    try {
      await remove(ref(db, `categories/${id}`));
    } catch (error) {
      console.error('❌ Error removing category:', error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      products, 
      categories, 
      selectedCategory, 
      setSelectedCategory,
      addProduct, 
      updateProduct, 
      removeProduct, 
      addCategory, 
      removeCategory,
      editingId, 
      setEditingId 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);