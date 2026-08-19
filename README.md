# PostForge — Multi-Platform Post Creator

Ek full-stack MERN app jisme user login/register karke ek hi post likh sakta hai aur usse
Twitter, Instagram, LinkedIn, Facebook — multiple platforms pe ek saath "publish" kar sakta hai.
Har platform ke apne character limits, hashtag rules hote hain — form real-time validate karta hai.

## ✨ Features

- **Auth** — JWT-based register/login
- **Post creation form** — title, description, optional image/video upload, multi-select platform dropdown
- **Real-time validation** — character counter jo selected platforms ke sabse strict limit ko follow karta hai (Twitter 280, Instagram 2200, LinkedIn 3000, Facebook 5000)
- **Media validation** — image max 1MB, video max 12MB (client + server dono side)
- **3D glass UI** — tilt-on-hover cards, gradient buttons, glassmorphism panels
- **Dashboard** — filter posts by platform/status, search by title
- **Analytics** — per-platform post count bars + status breakdown (draft/scheduled/published)
- **Calendar view** — posts grouped by date
- **Performance** — `reselect` memoized selectors (`src/store/selectors.js`) taaki filtering/grouping/analytics
  large post lists pe bhi unnecessary re-render/re-compute na karein

## 🧱 Tech Stack

| Layer     | Tech                                             |
|-----------|---------------------------------------------------|
| Frontend  | React (Vite), React Router, Tailwind CSS, Reselect, Axios |
| Backend   | Node.js, Express, JWT, Multer, bcryptjs           |
| Database  | MongoDB Atlas (Mongoose)                          |
| Hosting   | Frontend → Netlify · Backend → Render             |

## 📁 Folder Structure

```
social-post-creator/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/    # PostForm, Dashboard, Login, Register, etc.
│   │   ├── store/         # platforms.js (config) + selectors.js (reselect)
│   │   ├── context/        # AuthContext
│   │   └── api/            # axios instance
│   └── netlify.toml
└── backend/            # Express API
    ├── models/          # User.js, Post.js
    ├── routes/          # auth.js, posts.js
    ├── middleware/       # auth.js (JWT guard), upload.js (multer)
    └── config/db.js      # MongoDB Atlas connection
```

---

## 🚀 Local Setup (Run karne ke liye)

### 1. MongoDB Atlas ready karo
1. https://cloud.mongodb.com pe free cluster banao (M0 free tier)
2. Database Access me ek user banao (username + password)
3. Network Access me `0.0.0.0/0` allow karo (ya apna IP)
4. "Connect" → "Drivers" se connection string copy karo, ye jaisa dikhega:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/social-post-creator`

### 2. Backend chalao
```bash
cd backend
npm install
cp .env.example .env
```
`.env` file open karke fill karo:
```
MONGO_URI=<apna atlas connection string>
JWT_SECRET=<koi bhi random long string>
PORT=5000
CLIENT_URL=http://localhost:5173
```
Phir run karo:
```bash
npm run dev
```
Backend `http://localhost:5000` pe chalega. `/uploads` folder auto-create ho jayega media ke liye.

### 3. Frontend chalao
Naye terminal me:
```bash
cd frontend
npm install
cp .env.example .env
```
`.env` me:
```
VITE_API_URL=http://localhost:5000
```
Phir run karo:
```bash
npm run dev
```
Frontend `http://localhost:5173` pe khulega. Register karo → login → post create karo.

---

## ☁️ Deployment

### Backend → Render
1. Is `backend/` folder ko apne GitHub repo me push karo (ya poore project ko ek repo me, root directory `backend` set karo)
2. https://render.com pe "New Web Service" banao, apna repo connect karo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Environment variables add karo (Render dashboard me): `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (apna Netlify URL baad me daalna), `PORT` (Render khud provide karta hai, isse skip bhi kar sakte ho)
5. Deploy hone ke baad tumhe ek URL milega jaisे `https://postforge-api.onrender.com`

> Note: Render free tier pe uploaded files (`/uploads`) restart pe delete ho sakti hain (ephemeral storage). Production ke liye Cloudinary/AWS S3 use karna better hoga — abhi ke liye demo/college-project scope ke hisaab se local storage kaafi hai.

### Frontend → Netlify
1. `frontend/` folder ko GitHub repo me push karo
2. https://netlify.com pe "Add new site" → "Import from Git" → repo select karo
3. Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. Environment variable add karo: `VITE_API_URL` = tumhara Render backend URL (e.g. `https://postforge-api.onrender.com`)
5. Deploy → Netlify URL mil jayega (e.g. `https://postforge.netlify.app`)
6. Ab Render backend ke `CLIENT_URL` env variable ko is Netlify URL se update kar do (CORS ke liye) aur redeploy kar do

`netlify.toml` already frontend folder me hai — SPA routing (React Router refresh issue) automatically handle karega.

---

## 🔑 Environment Variables Summary

**backend/.env**
```
MONGO_URI=
JWT_SECRET=
PORT=5000
CLIENT_URL=
```

**frontend/.env**
```
VITE_API_URL=
```

---

## 🧠 Notes on architecture choices

- **Reselect selectors** (`frontend/src/store/selectors.js`): `selectFilteredPosts`, `selectPostsByDate`, `selectAnalytics` — ye sab memoized hain, matlab jab tak underlying posts/filters change nahi hote, dobara compute nahi honge. Dashboard me `useMemo` ke sath combine kiya gaya hai taaki large post lists pe bhi UI smooth rahe.
- **Platform config single source of truth** (`frontend/src/store/platforms.js`): character limits, colors, hashtag notes — sab yahin define hain, form aur dashboard dono isi se padhte hain.
- **Strictest limit logic**: jab user multiple platforms select karta hai, description ka character limit un sabme se sabse chhota limit follow karta hai (client aur server dono pe enforce hota hai).

## 🛠️ Future improvements (agar aage extend karna ho)
- Cloudinary/S3 pe media upload shift karna (Render ephemeral storage se bachne ke liye)
- Post scheduling ke liye actual cron/queue system
- Real platform APIs (Twitter API v2, Meta Graph API, LinkedIn API) se actual publish karna
