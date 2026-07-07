# Food Saga - Premium AI-Powered Recipe Discovery & Meal Planner

Food Saga is a high-performance, production-ready full stack SaaS application designed for recipe searches, customized macro-based meal calendars, and interactive AI kitchen assistance. Built from scratch with glassmorphic aesthetics and modern clean architectural designs.

---

## 🍳 Core Product Features

- **Landing Page & Home Feed**: Personalized welcome feeds, streak widgets, and seasonal trending recipe catalogs.
- **Smart Catalog Browsing**: Advanced filtering systems (by difficulty, cuisine style, protein/carbs bounds, dietary constraints) with auto-complete query searches.
- **Visual Meal Planner**: Schedule Breakfast, Lunch, and Dinner calendars using smooth drag-and-drop mechanics.
- **Groceries Checklist**: Merges scheduled recipes ingredients automatically into an editable, checklist format that can be printed or saved directly to PDF.
- **AI Chef Recommendation Engine**: Compiles kitchen ingredients list, weather, and fitness goals to recommend custom meals via **Google's Gemini API**.
- **Interactive Cooking Timer**: Visual timer countdowns with buzzer alerts.
- **Speech Reader (TTS)**: Web Speech Synthesis dictation reading instructions aloud step-by-step.
- **Voice Dictation (STT)**: Dictate chat queries using native browser speech recognition options.
- **PWA Offline caching**: Configured Web Manifest and custom caching Service Worker (`sw.js`).
- **Dark/Light Mode**: Synced transitions via custom HSL tailwind color parameters.
- **Administrative Panel**: Manage user account roles and catalog recipes.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Chart.js, Lucide-React, Service Workers (PWA).
- **Backend**: Node.js, Express.js, JWT security middleware.
- **Database**: MongoDB Atlas via Mongoose.
- **Authentication**: Native JWT Auth (with easy Firebase integration).

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18.x or above)
- MongoDB (or run in fallback offline mode)

### 1. Backend Server Setup
Navigate into the backend server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Create a `.env` file from the template:
```env
PORT=5000
JWT_SECRET=your_custom_secret
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_token
```

Start the Express development server:
```bash
npm run dev
```
*(Note: If no MONGO_URI is supplied, the server logs a warning and automatically activates mock memory data buffers so the app remains fully functional).*

### 2. Frontend Client Setup
Navigate into the client directory:
```bash
cd client
```

Install packages:
```bash
npm install --legacy-peer-deps
```

Start the Vite React development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🚀 Deployment Instructions

### Database (MongoDB Atlas)
1. Sign up on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Free Cluster and select **Database Access** to create database users.
3. Whitelist access IP address `0.0.0.0/0` under Network Access.
4. Retrieve connection string and set `MONGO_URI` in server environment variables.

### Backend (Render)
1. Sign up on [Render](https://render.com/).
2. Click **New +** and choose **Web Service**.
3. Link your GitHub repository and point root directory to `server`.
4. Configure environment keys: `MONGO_URI`, `GEMINI_API_KEY`, `JWT_SECRET`.
5. Deploy.

### Frontend (Vercel)
1. Sign up on [Vercel](https://vercel.com/).
2. Import project repository.
3. Configure Root Directory to `client`.
4. Set framework preset to **Vite**.
5. Deploy.
