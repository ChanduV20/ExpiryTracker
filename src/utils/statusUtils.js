// src/utils/statusUtils.js
export const getProductStatus = (expiryDateStr) => {
  if (!expiryDateStr) return { color: '#95a5a6', text: 'Unknown' };
  
  const now = new Date();
  // Normalize to midnight to avoid timezone/off-by-one errors
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [y, m, d] = expiryDateStr.split('-').map(Number);
  const expiry = new Date(y, m - 1, d);
  
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { color: '#e74c3c', text: 'Expired' };   // 🔴 Red
  if (diffDays === 0) return { color: '#e67e22', text: 'Today' };   // 🟠 Orange
  if (diffDays <= 3) return { color: '#f1c40f', text: `${diffDays}d` }; // 🟡 Yellow
  return { color: '#2ecc71', text: `${diffDays}d` };                // 🟢 Green
};