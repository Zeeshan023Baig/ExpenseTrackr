# 💰 ExpenseTrackr
<!-- Forced Deployment Sync: 2026-02-01 14:32 -->


A modern expense tracking application that you can run with your friends on the same Wi-Fi!

## 🚀 Quick Start Guide

### 1. Prerequisites
-   **Node.js**: [Download Here](https://nodejs.org/) (Install the LTS version)
-   **MySQL**: You need a local MySQL database running.

### 2. Installation
Open your terminal (Command Prompt or PowerShell) in this folder and run:

```bash
# This installs all necessary libraries for both Frontend and Backend
npm run install-all
```

### 3. Setup Secrets (Important!)
You need to set up your database password.

1.  Go to the `backend` folder.
2.  Copy the file named `.env.example` and rename it to `.env`.
3.  Open `.env` in Notepad.
4.  Change `DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE` to your **actual MySQL password**.
5.  Save the file.

### 4. Run the App
To start everything at once:

```bash
npm run dev
```

-   **Frontend**: [http://localhost:3000](http://localhost:3000) (or whichever port opens)
-   **Backend**: [http://localhost:5000](http://localhost:5000)

### 👯‍♀️ Playing with Friends (LAN Mode)
If you want to access the app from another device on the same Wi-Fi:

1.  **Find the Host IP**: On the computer running the code, open terminal and type `ipconfig` (Windows) or `ifconfig` (Mac/Linux). Look for "IPv4 Address" (e.g., `192.168.1.10`).
2.  **Visit from Friend's Device**: Open a browser and go to `http://YOUR_IP_ADDRESS:3000`.

---

## 🛠️ Features
-   **Dashboard**: Overview of expenses.
-   **Expenses**: Add, Edit, Delete tracking.
-   **Secure Login**: Your data is protected.
-   **Works on LAN**: Access from your phone or friend's laptop!
