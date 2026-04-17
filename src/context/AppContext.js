import React, { createContext, useState, useContext, useEffect } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { db } from '../config/firebase';
import { scheduleReminder } from '../services/notificationService'; // 👈 Import Service

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // 1. LISTEN TO DATABASE (Syncs cloud → UI)
  useEffect(() => {
    const dbRef = ref(db, 'reminders');
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        list.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
        setProducts(list);
      } else {
        setProducts([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. ADD TO CLOUD + SCHEDULE NOTIFICATIONS
  const addProduct = async (product) => {
    try {
      // Save to Firebase
      const newRef = push(ref(db, 'reminders'));
      await update(newRef, { ...product, id: newRef.key });
      
      // 🔔 Schedule Notifications
      await scheduleReminder(product.name, product.expiry);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // 3. UPDATE IN CLOUD + RESCHEDULE NOTIFICATIONS
  const updateProduct = async (id, updates) => {
    try {
      await update(ref(db, `reminders/${id}`), updates);
      
      // 🔔 If expiry changed, schedule new notifications
      if (updates.expiry || updates.name) {
        // Note: For a prototype, we just schedule new ones. 
        // In production, we would cancel old ones first.
        const product = products.find(p => p.id === id);
        if (product) {
           await scheduleReminder(updates.name || product.name, updates.expiry || product.expiry);
        }
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  // 4. DELETE FROM CLOUD
  const removeProduct = async (id) => {
    try {
      await remove(ref(db, `reminders/${id}`));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      products, 
      addProduct, 
      updateProduct, 
      removeProduct, 
      editingId, 
      setEditingId 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);