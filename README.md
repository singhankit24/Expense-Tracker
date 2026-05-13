# 💰 Expense Tracker

A modern shared expense tracking app for groups — built with **React**, **Express.js**, and **MongoDB Atlas**.

Track group spending, wallet contributions, chat with members, and manage finances from one place.

## ✨ Features

- **Group-based** — create or join groups with unique IDs
- **Dashboard** — overview cards, contribution chart, recent activity
- **Expense tracking** — add, edit, delete expenses with tags and participant splits
- **Contributions** — track wallet top-ups per member
- **Group chat** — real-time messaging with read tracking
- **Admin controls** — only admins can edit/delete records
- **Responsive** — mobile-first design with sidebar (desktop) and bottom nav (mobile)
- **Secure** — bcrypt password hashing, JWT authentication

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite |
| Styling | TailwindCSS |
| Backend | Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcrypt |
| Charts | Recharts |

## 📁 Project Structure

```
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
├── server/          # Express.js backend
│   ├── config/
│   ├── middleware/
│   ├── models/
│   └── routes/
└── package.json     # Root workspace
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account ([free tier](https://mongodb.com/atlas))

### 1. Clone & install

```bash
git clone https://github.com/singhankit24/Expense-Tracker.git
cd Expense-Tracker
npm run install:all
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your MongoDB Atlas connection string and a JWT secret:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/expense-tracker
JWT_SECRET=your-random-secret-string
PORT=5000
```

### 3. Run locally

```bash
npm run dev
```

This starts both the backend (port 5000) and frontend (port 3000) concurrently.

Open **http://localhost:3000** in your browser.

### 4. First-time setup

1. Click **"Create a new group"**
2. Enter a group ID, admin name, and admin password
3. Optionally add members
4. You're in! 🎉

## 🌐 Deployment

### Backend (Render / Railway)
1. Push to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Set root directory to `server/`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables (`MONGODB_URI`, `JWT_SECRET`)

### Frontend (Vercel / Netlify)
1. Create a new project on [Vercel](https://vercel.com)
2. Set root directory to `client/`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

## 📄 License

MIT

---

Made with ❤ by Ankit
