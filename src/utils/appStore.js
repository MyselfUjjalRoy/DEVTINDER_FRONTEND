import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import feedReducer from "./feedSlice";
import connectionReducer from "./connectionSlice";
import requestsReducer from "./requestsSlice";
import notificationReducer from "./notificationSlice";

const appStore = configureStore({
    reducer: {
        user: userReducer,
        feed: feedReducer,
        connections : connectionReducer,
        requests: requestsReducer,
        notifications: notificationReducer,
    },
});

export default appStore;