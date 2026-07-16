<div align="center">

# DevTinder Frontend

### Modern React client powering the DevTinder developer networking platform.

<p align="center">
A production-ready frontend built with React, Vite, Tailwind CSS, Redux Toolkit, and Socket.io, delivering a fast, responsive, and real-time user experience.
</p>

<p align="center">

<a href="https://devtinder-new.indevs.in/">
<img src="https://img.shields.io/badge/🌐_Live_Application-Visit_Now-2563EB?style=for-the-badge" />
</a>

<a href="https://github.com/MyselfUjjalRoy/DEVTINDER_BACKEND">
<img src="https://img.shields.io/badge/Backend-Repository-success?style=for-the-badge&logo=github" />
</a>

</p>

<p align="center">

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</p>

<p align="center">

![DaisyUI](https://img.shields.io/badge/DaisyUI-5A0EF8?style=for-the-badge)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

</p>

</div>

---

# Live Application

### 🚀 Production

**https://devtinder-new.indevs.in/**

---

# Overview

DevTinder Frontend is a modern single-page application built to provide developers with an intuitive platform for discovering professionals, managing connections, exchanging messages in real time, and accessing premium features through a seamless user experience.

The application is developed using **React** and **Vite**, with **Redux Toolkit** managing global application state and **Socket.io** enabling instant communication between connected users. A clean component-based architecture, responsive design system, and optimized rendering pipeline ensure excellent usability across desktop and mobile devices.

The frontend communicates with a dedicated Express.js backend through RESTful APIs while maintaining authenticated sessions using secure HTTP cookies.

---

# Key Features

## Authentication

- Secure Login & Registration
- Persistent User Sessions
- Cookie-based Authentication
- Protected Routes
- Automatic Session Validation

---

## Developer Discovery

- Personalized Developer Feed
- Browse Developer Profiles
- Send Connection Requests
- Ignore Suggested Profiles
- Infinite Feed Updates

---

## Connection Management

- Incoming Requests
- Outgoing Requests
- Accepted Connections
- Request Review
- Connection Synchronization

---

## Real-Time Messaging

- Instant One-to-One Chat
- Socket.io Client Integration
- Live Message Updates
- Automatic Room Subscription
- Online Conversation Experience

---

## Premium Membership

- Premium Upgrade Interface
- Subscription Verification
- Payment Redirection
- Membership Status Tracking

---

## Profile Management

- Edit Personal Information
- Update Skills & Bio
- Profile Preview
- Account Settings

---

# Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Build Tool | Vite |
| Styling | Tailwind CSS + DaisyUI |
| State Management | Redux Toolkit |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Real-Time Communication | Socket.io Client |

---

# Architecture

The frontend follows a modular architecture emphasizing maintainability, scalability, and component reusability.

### Component Layer

Reusable UI components designed with composition and separation of concerns.

### State Layer

Centralized application state managed through Redux Toolkit slices.

### Routing Layer

Client-side routing handled by React Router DOM with protected navigation.

### Network Layer

Axios instance configured with secure credentials and reusable interceptors.

### Real-Time Layer

Socket.io client maintaining persistent bidirectional communication with the backend.

### UI Layer

Responsive interface built using Tailwind CSS and DaisyUI.

---
# 📂 Project Structure

The application follows a feature-oriented folder structure to promote modularity, maintainability, and scalability.

```text
src/
│
├── assets/             # Static assets
├── components/         # Reusable UI components
├── hooks/              # Custom React hooks
├── pages/              # Application pages
├── redux/              # Redux store & slices
├── routes/             # Route configuration
├── utils/              # Utility functions & constants
├── App.jsx
├── main.jsx
└── index.css
```

---

# 🚀 Getting Started

Follow the steps below to set up the frontend locally.

---

## Prerequisites

Ensure the following software is installed on your system:

- Node.js (v18 or later)
- npm
- Git

---

## Clone the Repository

```bash
git clone https://github.com/MyselfUjjalRoy/DEVTINDER_FRONTEND.git
cd DEVTINDER_FRONTEND
```

---

## Install Dependencies

```bash
npm install
```

---

# ⚙️ Configuration

Before starting the application, configure the backend API endpoint inside the project.

Open:

```text
src/utils/constants.js
```

Update the API base URL according to your environment.

### Local Development

```javascript
export const BASE_URL = "http://localhost:7777";
```

### Production

```javascript
export const BASE_URL = "https://your-production-api.com";
```

---

# ▶️ Running the Application

Start the Vite development server.

```bash
npm run dev
```

By default, the application will be available at:

```
http://localhost:5173
```

---

# 📡 API Communication

The frontend communicates with the backend using a centralized Axios instance.

Key characteristics include:

- Automatic Cookie Handling
- Credential Sharing
- Request Abstraction
- Reusable API Configuration
- Error Handling

Example configuration:

```javascript
axios.defaults.withCredentials = true;
```

---

# 🔄 Global State Management

Redux Toolkit is used to manage application-wide state.

Current store modules include:

- Authentication
- User Profile
- Developer Feed
- Connection Requests
- User Connections
- Chat Messages

This approach minimizes unnecessary API requests while keeping the UI synchronized with backend updates.

---

# 💬 Real-Time Communication

The application integrates **Socket.io Client** to provide seamless real-time messaging.

Features include:

- Automatic Socket Connection
- Room-based Communication
- Live Message Delivery
- Incoming Message Notifications
- Resource Cleanup on Component Unmount

---

# 🎨 UI & Styling

The user interface is built with **Tailwind CSS** and **DaisyUI**, providing:

- Responsive Layout
- Reusable Utility Classes
- Consistent Design System
- Dark Theme Support
- Mobile-Friendly Components

---

# ⚡ Performance Optimizations

Several optimizations have been implemented to ensure a smooth user experience.

### Efficient Rendering

- Component-based architecture
- Minimal re-renders
- Optimized state updates

### Network Optimization

- Reusable Axios instance
- Reduced duplicate requests
- Cookie-based authentication

### User Experience

- Fast navigation
- Real-time UI updates
- Responsive interface
- Optimized loading states

---

# 🔒 Security

Security best practices followed by the frontend include:

- Protected Client Routes
- Cookie-based Authentication
- No Sensitive Credentials Stored on Client
- Secure Communication with Backend APIs
- Session Validation on Refresh

---
# 📦 Building for Production

Generate an optimized production build using Vite.

```bash
npm run build
```

The compiled assets will be generated inside the **dist/** directory.

```
dist/
├── assets/
├── index.html
└── ...
```

These static assets are ready to be served by any modern web server such as **Vercel**, **Netlify**, **Nginx**, or **Cloudflare Pages**.

---

# 🚀 Deployment

The DevTinder frontend is deployed as a static React application.

## Production Environment

**Live Application**

🔗 https://devtinder-new.indevs.in/

---

## Build the Application

```bash
npm run build
```

---

## Deploy Static Assets

Deploy the generated **dist/** directory to your preferred hosting platform.

Popular deployment platforms include:

- Vercel
- Netlify
- AWS EC2 + Nginx
- Cloudflare Pages

---

## Environment Configuration

Before deploying, ensure the frontend points to the correct production backend API.

Example:

```javascript
export const BASE_URL = "https://your-production-api.com";
```

---

# 🌍 Browser Support

The application is fully compatible with modern browsers including:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari

---

# 📈 Performance Highlights

The frontend is optimized for speed and responsiveness.

### Optimizations

- ⚡ Lightning-fast development powered by Vite
- 📦 Optimized production bundles
- 🔄 Efficient Redux state updates
- 🌐 Minimal API requests
- 💬 Persistent WebSocket connection
- 📱 Fully responsive layouts
- 🎯 Lazy component rendering where applicable

---

# 🎯 Future Enhancements

The roadmap for DevTinder includes several planned improvements.

### Planned Features

- 🤖 AI-powered Developer Recommendations
- 🎥 Video Calling
- 🔔 Push Notifications
- 📱 Progressive Web App (PWA)
- 🌙 Enhanced Theme Customization
- 🌍 Multi-language Support
- 📊 User Analytics Dashboard
- 🧠 Smart Search & Filters
- 📍 Online Presence Indicators
- 📁 Resume & Portfolio Uploads

---

# 🤝 Contributing

Contributions are welcome and greatly appreciated.

If you would like to contribute:

1. Fork the repository.
2. Create a new feature branch.

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes.

```bash
git commit -m "Add amazing feature"
```

4. Push the branch.

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request.

---

# 🛡️ License

This project is distributed under the **MIT License**.

You are free to use, modify, and distribute the project in accordance with the license terms.

---

# 🙌 Acknowledgements

Special thanks to the open-source community and the creators of the technologies that power this project.

- React
- Vite
- Tailwind CSS
- DaisyUI
- Redux Toolkit
- Socket.io
- Axios

---

# ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub.

Your support helps increase the visibility of the project and motivates continued development.

---

<div align="center">

## 🌐 Live Application

### https://devtinder-new.indevs.in/

---

### Built with ❤️ using React, Vite, Tailwind CSS & Redux Toolkit

**Modern • Responsive • Real-Time • Scalable**

</div>
