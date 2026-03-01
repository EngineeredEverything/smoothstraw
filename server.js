'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3010;
const WAITLIST_FILE = path.join(__dirname, 'data', 'waitlist.json');
const STATIC_DIR = __dirname;

// Middleware
app.use(express.json());

// Ensure data directory and waitlist file exist
function ensureWaitlistFile() {
  const dataDir = path.dirname(WAITLIST_FILE);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(WAITLIST_FILE)) fs.writeFileSync(WAITLIST_FILE, '[]', 'utf8');
}

function readWaitlist() {
  ensureWaitlistFile();
  try {
    return JSON.parse(fs.readFileSync(WAITLIST_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeWaitlist(data) {
  ensureWaitlistFile();
  fs.writeFileSync(WAITLIST_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// POST /api/waitlist — save signup
app.post('/api/waitlist', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const list = readWaitlist();
  const alreadyExists = list.some(entry => entry.email.toLowerCase() === email.toLowerCase());

  if (alreadyExists) {
    return res.status(200).json({ message: 'Already on the list!', duplicate: true });
  }

  const entry = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    timestamp: new Date().toISOString()
  };

  list.push(entry);
  writeWaitlist(list);

  console.log(`[waitlist] New signup: ${name} <${email}>`);
  res.status(201).json({ message: 'Successfully added to waitlist!', entry });
});

// GET /api/waitlist — protected with basic auth
app.get('/api/waitlist', (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const base64 = authHeader.replace('Basic ', '');
  let credentials = '';
  try {
    credentials = Buffer.from(base64, 'base64').toString('utf8');
  } catch {
    // ignore
  }

  const [, password] = credentials.split(':');

  if (password !== 'smoothstraw2026') {
    res.set('WWW-Authenticate', 'Basic realm="SmoothStraw Admin"');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const list = readWaitlist();
  res.json({ count: list.length, waitlist: list });
});

// Serve static files for all other routes
app.use(express.static(STATIC_DIR));
app.use((req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SmoothStraw server running on port ${PORT}`);
});
