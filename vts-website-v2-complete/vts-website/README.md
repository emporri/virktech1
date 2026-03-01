# 🚀 Virk Tech Solutions Website

Modern, full-stack website for Virk Tech Solutions — South East London's premier tech repair specialists.

---

## 🔑 Admin Accounts

| Username    | Password       | Role                  |
|-------------|----------------|-----------------------|
| `admin`     | `VTS@Admin2025`| Administrator         |
| `manager`   | `VTS@Mgr2025`  | Store Manager         |
| `belvedere` | `VTS@Bel2025`  | Staff — Belvedere     |
| `sidcup`    | `VTS@Sid2025`  | Staff — Sidcup        |
| `woolwich`  | `VTS@Woo2025`  | Staff — Woolwich      |

---

## 🛠️ Setup & Installation

### 1. Install Node.js (v18+)
Download from [nodejs.org](https://nodejs.org)

### 2. Install Dependencies
```bash
cd vts-website
npm install
```

### 3. Configure Email (for notifications)
Edit `backend/server.js` and update the email config:
```js
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-gmail@gmail.com',
    pass: 'your-app-password'  // Use Gmail App Password (not your main password)
  }
});
```

> **Gmail App Password**: Go to Google Account → Security → 2FA → App Passwords → Generate

Or use environment variables:
```bash
EMAIL_USER=your-email@gmail.com EMAIL_PASS=your-app-password npm start
```

### 4. Start the Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 5. Access the Site
- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

---

## 📂 File Structure
```
vts-website/
├── public/
│   ├── index.html      # Main website (all pages)
│   └── images/
│       └── logo.png    # VTS Logo
├── admin/
│   └── index.html      # Admin dashboard
├── backend/
│   └── server.js       # Express.js API server
├── package.json
└── README.md
```

---

## ✨ Features

- ✅ Loading animation with rotating 3D logo
- ✅ "Hello... Welcome to Virk Tech" greeting
- ✅ Dynamic Spline robot hero animation
- ✅ Sticky WhatsApp chat button (opens wa.me/447762121336)
- ✅ Dark modern UI with gradient glow effects
- ✅ Repair booking system (device → model → repair type → appointment)
- ✅ Buy & Sell request system
- ✅ Products catalogue with search + filter + sort (20 products)
- ✅ Store locator with all 6 London locations + Google Maps links
- ✅ Admin panel with 5 staff accounts
- ✅ Email notifications to ziamsatti@gmail.com
- ✅ JSON file database for storing bookings
- ✅ Stores summary in footer on all pages
- ✅ "Contact Us" calls +447762121336

---

## 🌐 Deploying to Production

### Option A: Vercel / Netlify (Frontend only)
Upload the `public/` folder. Note: Backend API won't work without a server.

### Option B: Railway / Render / Heroku (Full Stack)
1. Push code to GitHub
2. Connect to Railway/Render
3. Set `EMAIL_USER` and `EMAIL_PASS` environment variables
4. Deploy!

### Option C: VPS (Ubuntu/Debian)
```bash
# Install Node + PM2
npm install -g pm2
pm2 start backend/server.js --name "vts-site"
pm2 save
pm2 startup
```

---

## 📞 Contact
Virk Tech Solutions | +44 7762 121336 | WhatsApp: wa.me/447762121336
