import { io } from "socket.io-client";
import { BASE_URL } from "./constants";
let socketInstance = null;
export const getSocket = () => {
    return socketInstance;
};
export const createSocketConnection = () => {
    if (socketInstance) return socketInstance;
    const config = {
        withCredentials: true // Crucial to send HttpOnly cookies to the backend
    };
    if(location.hostname==="localhost"){
        socketInstance = io(BASE_URL, config);
    }else{
        socketInstance = io("/", {path:"/api/socket.io/", ...config});
    }
    
    return socketInstance;
};
export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
};
