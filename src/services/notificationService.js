// src/services/notificationService.js
import * as Notifications from 'expo-notifications';

const parseDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const scheduleReminder = async (name, expiryDateStr) => {
  try {
    const expiry = parseDate(expiryDateStr);
    const now = new Date();
    
    // 1. Schedule: 1 Day Before (at 9 AM)
    const oneDayBefore = new Date(expiry);
    oneDayBefore.setDate(expiry.getDate() - 1);
    oneDayBefore.setHours(9, 0, 0, 0);

    if (oneDayBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Expiry Soon",
          body: `${name} expires tomorrow!`,
          sound: true,
        },
        trigger: { 
          type: 'date',  // 👈 REQUIRED: Explicit type
          date: oneDayBefore 
        },
      });
      console.log(`✅ Scheduled 'Tomorrow' alert for ${name}`);
    }

    // 2. Schedule: On Expiry Day (at 9 AM)
    const expiryMorning = new Date(expiry);
    expiryMorning.setHours(9, 0, 0, 0);
    
    if (expiryMorning > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🚨 Expiry Alert",
          body: `${name} expires TODAY!`,
          sound: true,
        },
        trigger: { 
          type: 'date',  // 👈 REQUIRED
          date: expiryMorning 
        },
      });
      console.log(`✅ Scheduled 'Today' alert for ${name}`);
    }
    
    return true;
  } catch (error) {
    console.error("❌ Schedule Error:", error);
    return false;
  }
};