import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
    liveNotification: null,
  },
  reducers: {
    addNotifications: (state, action) => {
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
    },
    addNotification: (state, action) => {
      state.notifications = [action.payload, ...state.notifications];
      state.unreadCount += 1;
      state.liveNotification = action.payload;
    },
    markNotificationRead: (state, action) => {
      state.notifications = state.notifications.map((n) =>
        n._id === action.payload ? { ...n, isRead: true } : n
      );
      state.unreadCount = Math.max(
        0,
        state.notifications.filter((n) => !n.isRead).length
      );
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n._id !== action.payload
      );
      state.unreadCount = Math.max(
        0,
        state.notifications.filter((n) => !n.isRead).length
      );
    },
    markAllRead: (state) => {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        isRead: true,
      }));
      state.unreadCount = 0;
    },
  },
});

export const {
  addNotifications,
  addNotification,
  markNotificationRead,
  markAllRead,
  removeNotification,
} = notificationSlice.actions;
export default notificationSlice.reducer;
