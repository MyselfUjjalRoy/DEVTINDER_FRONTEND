# 🚀 DevTinder Frontend

<div align='center'>

### A modern React web client for a developer networking platform

<p>
  <a href='https://devtinder-new.indevs.in/' target='_blank'>
    <img src='https://img.shields.io/badge/🌐_Live_Demo-devtinder--new.indevs.in-2563EB?style=for-the-badge' />
  </a>
</p>

<p>

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge\&logo=redux\&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge\&logo=socketdotio\&logoColor=white)

</p>

</div>

---

# 📖 About the Project

**DevTinder Frontend** is the React web client for the DevTinder platform, a full-stack social networking application designed specifically for developers. It provides a modern, responsive, and interactive user interface where developers can discover potential connections, manage requests, edit profiles, upgrade accounts, and communicate through real-time chat.

Built with **Vite**, **React**, **TailwindCSS**, and **Redux Toolkit**, the frontend focuses on delivering a seamless user experience with efficient state management, secure API communication, and dynamic UI updates.

---

# ✨ Features

### 👤 User Experience

* Developer discovery feed
* Profile viewing and editing
* Responsive design for all screen sizes
* Interactive UI components with DaisyUI

### 🔄 State Management

* Redux Toolkit store slices
* User profile state management
* Candidate feed synchronization
* Connection and request tracking

### 🔐 Session Management

* Secure cookie-based authentication
* Global Axios configuration
* Automatic credential attachment for API requests

### 💬 Real-Time Communication

* Socket.io client integration
* Real-time chat functionality
* Dynamic message notifications
* Automatic resource cleanup on component unmount

### 💎 Premium Features

* Account upgrade interface
* Premium status verification
* Payment-related UI integration

---

# 🛠 Tech Stack

| Category                | Technologies                |
| ----------------------- | --------------------------- |
| Framework & Tooling     | Vite + React                |
| Styling                 | TailwindCSS v3 + DaisyUI    |
| State Management        | Redux Toolkit + React Redux |
| Routing                 | React Router DOM v7         |
| HTTP Client             | Axios                       |
| Real-Time Communication | Socket.io-client            |

---

# 🏗 Architecture Overview

## Component Structure

* Reusable React components
* Page-based routing with React Router
* Modular UI organization

## State Management

* Centralized Redux store
* Feature-based slices
* Predictable state updates

## API Communication

* Axios-based HTTP requests
* Global configuration for credentials
* Environment-based API endpoint management

## Real-Time Features

* Secure WebSocket client helper
* Room subscriptions for chat
* Live notification updates

---

# 📂 Project Structure

```text
src/
├── components/
├── pages/
├── store/
├── slices/
├── utils/
├── routes/
├── App.jsx
└── main.jsx
```

---

# ⚙️ Local Setup

## Clone the Repository

```bash
git clone https://github.com/MyselfUjjalRoy/DEVTINDER_FRONTEND.git
cd DEVTINDER_FRONTEND
```

## Install Dependencies

```bash
npm install
```

## Configure API Base URL

Before running the application, inspect the API base endpoint configuration in:

```text
/src/utils/constants.js
```

Ensure it points to your local backend server during development or the production API URL when deployed.

---

# ▶️ Run the Development Server

```bash
npm run dev
```

The frontend will run on Vite’s default development port, typically:

```text
http://localhost:5173
```

---

# ☁️ Deployment & Hosting

The frontend is built as static assets and hosted on an **AWS EC2** instance behind **Nginx**.

## Connect to EC2

```bash
ssh -i "your-key-file.pem" ubuntu@your-ec2-ip-address
```

## Build Static Files

```bash
npm run build
```

This generates the optimized `dist` folder.

## Deploy to Nginx

```bash
sudo cp -r dist/* /var/www/html/
```

## Reload Nginx

```bash
sudo systemctl restart nginx
```

---

# 🌐 Domain & DNS Setup

* Domain registration is managed through **NameCheap**
* DNS mapping and routing are configured via **Cloudflare**
* SSL certificate termination is handled by **Cloudflare** for secure HTTPS connections

---

# 🔒 Security & Performance

* Secure cookie-based session handling
* Optimized production build with Vite
* Lazy-loaded routes where applicable
* Efficient state updates with Redux Toolkit
* Real-time event cleanup to prevent memory leaks

---

# 🚀 Future Improvements

* Push notification support
* Enhanced accessibility features
* Progressive Web App support
* Advanced search and filtering
* Improved chat notification system

---

# ⭐ Why DevTinder Frontend?

DevTinder Frontend demonstrates modern React development practices by combining component-based architecture, centralized state management, secure API communication, and real-time user interaction into a scalable and maintainable frontend application.

<div align='center'>

### 🌐 Live Application

### https://devtinder-new.indevs.in/

</div>
