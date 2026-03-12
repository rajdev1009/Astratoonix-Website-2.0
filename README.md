# 🎬 AstraToonix v3

**Professional Movie & Series Streaming Platform**  
Node.js · Express · MongoDB Atlas · Socket.io · Vanilla JS

---

## 📁 Complete File Structure

```
astratoonix/
│
├── server.js                    ← Main entry (Express + Socket.io)
├── package.json
├── .env.example                 ← Copy → .env
├── .gitignore
│
├── config/
│   └── db.js                    ← MongoDB connection
│
├── middleware/
│   └── adminAuth.js             ← Admin password header check
│
├── models/
│   ├── Movie.js                 ← Movie schema (hide/premium)
│   ├── Series.js                ← Series + Episodes schema
│   ├── User.js                  ← User (premium/expiry/block/trial)
│   └── SearchLog.js             ← Search query tracking
│
├── routes/
│   ├── content.js               ← Movies/Series CRUD + hide/edit
│   ├── users.js                 ← Auth + VIP + Block + Trial
│   └── analytics.js             ← Search logs
│
└── public/
    ├── index.html               ← Frontend shell
    ├── css/
    │   └── style.css            ← All styles
    └── js/
        ├── config.js            ← App state
        ├── api.js               ← Fetch wrapper
        ├── ui.js                ← Modals, notify, ads
        ├── auth.js              ← Login/Register/Logout
        ├── content.js           ← Grid/Filter/Search
        ├── player.js            ← Video player
        └── admin.js             ← Full admin panel logic
```

---

## 🔑 Password System

| Password | Value | Use |
|---|---|---|
| Admin Panel | `782447` | Logo click → panel open |
| Action Password 1 | `7578848529` | Master Reset Step 1 |
| Action Password 2 | `9395700000` | Master Reset Step 2 |
| Confirm Text | `DELETE ALL` | Final wipe confirmation |

---

## ⚙️ Admin Panel — 4 Sections

### 📦 Content Tab
- Add Movie (Title + Poster + 4 quality links + Premium toggle)
- Add Series (Episode builder — each episode has own poster + 4 links + Premium)
- Save dabao → MongoDB mein turant save, site pe live!

### 🗂 Manage Tab
- Saare movies/series ki list
- ✏ Edit (title/poster badlo)
- 👁 Hide (public se chupaao, delete nahi hota)
- 🗑 Delete (hamesha ke liye hatao)

### 👥 Users Tab
- Stats: Total / VIP / Blocked / Expired
- Quick VIP Grant by Email (Days ya Lifetime)
- Har user ke liye: Grant Days · Lifetime · Revoke · Trial · Block/Unblock
- Status tracking: active / expired / trial / blocked / free
- Master Reset (3-step: Pass1 + Pass2 + "DELETE ALL")

### 📊 Analytics Tab
- Search History — users kya search kar rahe hain (count ke saath)
- Real-time Live Viewer Count (Socket.io)

---

## 🚀 Deploy on Koyeb

### Step 1 — GitHub
```bash
git init
git add .
git commit -m "AstraToonix v3"
git branch -M main
git remote add origin https://github.com/YOUR/astratoonix.git
git push -u origin main
```

### Step 2 — MongoDB Atlas
1. [mongodb.com/atlas](https://mongodb.com/atlas) → Free cluster
2. Create DB user + allow `0.0.0.0/0`
3. Get URI: `mongodb+srv://user:pass@cluster.mongodb.net/astratoonix`

### Step 3 — Koyeb Dashboard
1. [koyeb.com](https://koyeb.com) → Create App → GitHub
2. Set Environment Variables:

| Key | Value |
|---|---|
| `MONGO_URI` | Your Atlas URI |
| `ADMIN_PASSWORD` | `782447` |
| `ACTION_PASSWORD_1` | `7578848529` |
| `ACTION_PASSWORD_2` | `9395700000` |
| `RESET_CONFIRM_TEXT` | `DELETE ALL` |
| `PORT` | `3000` |

3. Run: `npm start` · Port: `3000` · Deploy!

---

## ✨ Features
- 🎥 In-site streaming: MP4, HLS/M3U8, YouTube, Google Drive, Streamtape
- ⭐ VIP — Days-based (30d, 15d...) or Lifetime
- ⏰ Auto expiry tracking with days-remaining display
- 🔴 Block/Unblock users
- 🔵 Trial access mode
- 🔍 Search history analytics
- 🌐 Real-time live count (Socket.io)
- 📢 Adsterra ads (hidden for VIP)
- 📱 Mobile responsive
