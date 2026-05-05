// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const chatRoutes = require("./routes/chatRoutes");

// ✅ Translation library
const { translate } = require('@vitalets/google-translate-api');

const app = express();
const recognizeRoutes = require("./routes/recognize");
app.use("/api/recognize", recognizeRoutes);

// ---------------- CONFIG ----------------
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

// ---------------- CORS SETUP ----------------
const corsOptions = {
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// ---------------- BODY PARSERS ----------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------- STATIC FILES ----------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/gestures', express.static(path.join(__dirname, 'uploads', 'gestures')));

// ---------------- HEALTH CHECK ----------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});
app.get('/', (req, res) => {
  res.send('GestureVoice Backend is running 🚀');
});
// ---------------- ROUTES ----------------
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/user', require('./routes/user'));
  app.use('/api/chat', require('./routes/chatRoutes'));
  
  app.use('/api/alert', require('./routes/alert'));
  app.use('/api/learning', require('./routes/learning'));
  app.use('/emergency', require('./routes/emergency'));
} catch (e) {
  console.error('Error loading routes. Make sure route files exist in ./routes:', e);
}

// ---------------- TRANSLATION ENDPOINT ----------------
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: "Missing 'text' or 'targetLang' field" });
    }

    console.log(`🔤 Translating "${text}" → ${targetLang}`);
    const result = await translate(text, { to: targetLang });

    res.json({ translatedText: result.text });
  } catch (err) {
    console.error('❌ Translation error:', err);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// ---------------- ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

// ---------------- SERVER START ----------------
app.listen(PORT, () => {
  console.log(`✅ Backend listening on port ${PORT}`);
  if (FRONTEND_ORIGIN && FRONTEND_ORIGIN !== '*') {
    console.log(`CORS restricted to origin: ${FRONTEND_ORIGIN}`);
  } else {
    console.log('CORS origin: * (allow all)');
  }
});
