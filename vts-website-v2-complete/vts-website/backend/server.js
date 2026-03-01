const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// ============ DATABASE (JSON file-based) ============
function readDB() {
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ bookings: [], buysell: [] }));
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ============ EMAIL TRANSPORTER ============
// Configure with your SMTP settings (e.g., Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

async function sendEmail(subject, html) {
  try {
    await transporter.sendMail({
      from: '"Virk Tech Solutions" <noreply@virktechsolutions.com>',
      to: 'ziamsatti@gmail.com',
      subject,
      html
    });
    console.log('Email sent:', subject);
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

// ============ ADMIN ACCOUNTS ============
const ADMINS = [
  { username: 'admin', password: 'VTS@Admin2025', name: 'Super Admin', role: 'Administrator' },
  { username: 'manager', password: 'VTS@Mgr2025', name: 'Store Manager', role: 'Manager' },
  { username: 'belvedere', password: 'VTS@Bel2025', name: 'Belvedere Staff', role: 'Staff — Belvedere' },
  { username: 'sidcup', password: 'VTS@Sid2025', name: 'Sidcup Staff', role: 'Staff — Sidcup' },
  { username: 'woolwich', password: 'VTS@Woo2025', name: 'Woolwich Staff', role: 'Staff — Woolwich' }
];

// ============ ROUTES ============

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const admin = ADMINS.find(a => a.username === username && a.password === password);
  if (admin) {
    const { password: _, ...safe } = admin;
    res.json({ success: true, user: safe });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Get all bookings
app.get('/api/admin/bookings', (req, res) => {
  const db = readDB();
  res.json({ bookings: db.bookings, buysell: db.buysell });
});

// Update booking status
app.patch('/api/admin/booking/:id', (req, res) => {
  const db = readDB();
  const idx = db.bookings.findIndex(b => b.id === req.params.id);
  if (idx !== -1) {
    db.bookings[idx].status = req.body.status;
    writeDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Delete booking
app.delete('/api/admin/booking/:id', (req, res) => {
  const db = readDB();
  db.bookings = db.bookings.filter(b => b.id !== req.params.id);
  db.buysell = db.buysell.filter(b => b.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// ========== POST: Book Repair ==========
app.post('/api/booking/repair', async (req, res) => {
  const { name, email, phone, date, time, branch, device, repairType, notes } = req.body;

  if (!name || !email || !phone || !date) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const booking = {
    id: 'REP-' + Date.now(),
    type: 'repair',
    name, email, phone, date, time, branch, device, repairType, notes,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  const db = readDB();
  db.bookings.unshift(booking);
  writeDB(db);

  // Send email notification
  await sendEmail(
    `🔧 New Repair Booking — ${device} (${repairType})`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; background: #080a0e; color: #f0f4ff; padding: 32px; border-radius: 16px;">
      <h2 style="color: #00d4ff; margin-bottom: 8px;">New Repair Booking</h2>
      <p style="color: #8892a4; margin-bottom: 24px;">A new repair appointment has been submitted.</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Booking ID</td><td style="padding: 10px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.07)">${booking.id}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Customer</td><td style="padding: 10px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.07)">${name}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Email</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.07)">${email}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Phone</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.07)">${phone}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Device</td><td style="padding: 10px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.07)">${device}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Repair Type</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.07)">${repairType}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Appointment</td><td style="padding: 10px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.07)">${date} at ${time}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Branch</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.07)">${branch}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4">Notes</td><td style="padding: 10px">${notes || 'None'}</td></tr>
      </table>
      
      <p style="margin-top: 24px; color: #8892a4; font-size: 13px;">© 2025 Virk Tech Solutions</p>
    </div>
    `
  );

  res.json({ success: true, booking });
});

// ========== POST: Buy/Sell Request ==========
app.post('/api/booking/buysell', async (req, res) => {
  const { name, email, phone, requestType, brand, model, condition, notes } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const request = {
    id: 'BS-' + Date.now(),
    type: 'buysell',
    requestType,
    name, email, phone, brand, model, condition, notes,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  const db = readDB();
  db.buysell.unshift(request);
  writeDB(db);

  await sendEmail(
    `🔄 New ${requestType === 'sell' ? 'Sell' : 'Buy'} Request — ${brand} ${model}`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; background: #080a0e; color: #f0f4ff; padding: 32px; border-radius: 16px;">
      <h2 style="color: #7c3aed; margin-bottom: 8px;">New ${requestType === 'sell' ? 'Sell' : 'Buy'} Request</h2>
      <p style="color: #8892a4; margin-bottom: 24px;">A customer wants to ${requestType} a device.</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Request ID</td><td style="padding: 10px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.07)">${request.id}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Customer</td><td style="padding: 10px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.07)">${name}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Email</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.07)">${email}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Phone</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.07)">${phone}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Device Brand</td><td style="padding: 10px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.07)">${brand}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Model</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.07)">${model}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4; border-bottom: 1px solid rgba(255,255,255,0.07)">Condition</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.07)">${condition}</td></tr>
        <tr><td style="padding: 10px; color: #8892a4">Notes</td><td style="padding: 10px">${notes || 'None'}</td></tr>
      </table>
      
      <p style="margin-top: 24px; color: #8892a4; font-size: 13px;">© 2025 Virk Tech Solutions</p>
    </div>
    `
  );

  res.json({ success: true, request });
});

// ============ START ============
app.listen(PORT, () => {
  console.log(`✅ VTS Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin dashboard: http://localhost:${PORT}/admin`);
});
