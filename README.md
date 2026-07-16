# 🚀 DevTinder Frontend

<p align='center'>
  <strong>A modern React web client for the DevTinder developer networking platform.</strong>
</p>

<p align='center'>
  🌐 <strong>Live Application:</strong><br>
  <a href='https://devtinder-new.indevs.in/' target='_blank'>
    https://devtinder-new.indevs.in/
  </a>
</p>

<p align='center'>

![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge\&logo=react\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Frontend-purple?style=for-the-badge\&logo=vite\&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-State_Management-764ABC?style=for-the-badge\&logo=redux\&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-black?style=for-the-badge\&logo=socketdotio\&logoColor=white)

</p>

---

# 📖 About the Project

**DevTinder Frontend** is the React-based web client for the DevTinder platform, a full-stack social networking application built specifically for developers. It provides a clean, responsive, and interactive user experience where developers can discover matches, review pending connection requests, manage profiles, upgrade to premium memberships, and chat in real time.

Built with **React**, **Vite**, **Redux Toolkit**, **TailwindCSS**, and **Socket.io-client**, the frontend communicates with the DevTinder backend through secure Axios requests and WebSocket connections, ensuring smooth session handling and instant chat updates.

---

# ✨ Client Features

## 🧠 State Management

* Redux Toolkit Store
* User Profile Slice
* Candidate Feed Slice
* Connections Slice
* Request Synchronization

---

## 🔐 Session Integrity

* Secure Axios Configuration
* Automatic Cookie Credentials
* Authenticated API Requests
* Protected Client Routes

---

## 💬 Real-Time Chat & Inbox

* Secure Socket.io Client
* Dynamic Chat Room Subscriptions
* Instant Message Notifications
* Live Badge Count Updates
* Cleanup on Component Unmount

---

## 🎨 Interactive Pages

* Developer Discovery Feed
* Pending Requests Dashboard
* Connections Management
* Profile Editing Interface
* Premium Upgrade & Verification

---

# 🛠️ Tech Stack

| Category                | Technologies               |
| ----------------------- | -------------------------- |
| Framework               | React                      |
| Build Tool              | Vite                       |
| Styling                 | TailwindCSS v3, daisyUI    |
| State Management        | Redux Toolkit, React Redux |
| Routing                 | React Router DOM v7        |
| HTTP Client             | Axios                      |
| Real-Time Communication | Socket.io-client           |

---

# 📂 Project Structure

```text
devtinder-frontend/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md
```

---

# ⚙️ Local Setup & Development

## Clone the Repository

```bash
git clone https://github.com/MyselfUjjalRoy/DEVTINDER_FRONTEND.git
cd DEVTINDER_FRONTEND
```

## Install Dependencies

```bash
npm install
```

## Configure API Endpoint

Before running the application, inspect the API base endpoint configuration in:

```text
/src/utils/constants.js
```

Ensure it points to your local backend server for development or the production backend URL when deploying.

## Start the Development Server

```bash
npm run dev
```

The frontend runs locally on Vite's default development port, usually:

```text
http://localhost:5173
```

---

# ☁️ Deployment & Hosting

The frontend is built as static assets and hosted on an <strong>AWS EC2 (Ubuntu)</strong> instance behind <strong>Nginx</strong>.

## Connect to EC2

```bash
ssh -i 'your-key-file.pem' ubuntu@your-ec2-ip-address
```

## Build Static Files

```bash
npm run build
```

This generates the optimized <code>dist</code> folder.

## Deploy to Nginx Web Server

```bash
sudo cp -r dist/* /var/www/html/
```

## Reload Nginx

```bash
sudo systemctl restart nginx
```

---

# 🌐 Domain & DNS Setup

* Domain registration managed through <strong>NameCheap</strong>.
* DNS mapping, routing, and SSL termination configured through <strong>Cloudflare</strong>.
* Secure HTTPS access provided for the live application.

---

# 🚀 Future Improvements

* Progressive Web App (PWA) support
* Push notifications
* Advanced developer search & filters
* Video calling integration
* AI-powered developer recommendations
* Enhanced accessibility improvements

---

# ⭐ Why DevTinder Frontend?

DevTinder Frontend demonstrates how to build a modern, scalable, and responsive React application with global state management, secure session handling, real-time communication, and production-ready deployment practices.

It showcases practical frontend engineering skills relevant to full-stack development and portfolio projects.

---

## 💙 If you found this project helpful, consider giving it a ⭐ on GitHub!
