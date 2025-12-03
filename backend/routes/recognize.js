const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const say = require('say');
const auth = require('../middleware/auth');
const axios = require('axios');
const { default: translate } = require('@vitalets/google-translate-api');

const TRIGGER_WORDS = ['help', 'fire', 'danger', 'emergency'];

// ---------- Mock recognition ----------
function mockRecognizeFromFilename(filename) {
  const name = (filename || '').toLowerCase();
  if (TRIGGER_WORDS.some(w => name.includes(w))) return { text: 'help', isTrigger: true };
  const wordMatch = name.match(/[a-z]+/);
  return { text: wordMatch ? wordMatch[0] : 'unknown', isTrigger: false };
}

// ---------- TTS ----------
function speakText(text) {
  if (!text) return;
  try { say.speak(String(text)); } 
  catch (err) { console.error('TTS error:', err.message); }
}

// ---------- Translation ----------
async function translateTextLibre(text, targetLang = 'hi') {
  try {
    if (!text) return '';
    const OVERRIDES = {
      help: { hi: 'मदद', ml: 'സഹായം', ta: 'உதவி' },
      fire: { hi: 'आग', ml: 'തീ', ta: 'தீ' },
      danger: { hi: 'खतरा', ml: 'അപായം', ta: 'ஆபத்து' },
      emergency: { hi: 'आपातकाल', ml: 'അപത്കാലം', ta: 'அவசரம்' },
    };
    const lower = text.toLowerCase();
    if (OVERRIDES[lower]) return OVERRIDES[lower][targetLang] || '';
    return (await translate(text, { to: targetLang }))?.text || '';
  } catch (err) { return ''; }
}

// ---------- Main recognize route ----------
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    let recognized = { text: 'unknown', isTrigger: false };

    if (req.file) {
      recognized = mockRecognizeFromFilename(req.file.originalname || req.file.filename);
      fs.unlink(req.file.path, () => {});
    } else if (req.body?.textManual) {
      recognized = { text: String(req.body.textManual).trim(), isTrigger: false };
    } else {
      return res.status(400).json({ error: 'No image or text provided' });
    }

    const rawText = String(recognized.text || '').trim();
    const isTrigger = TRIGGER_WORDS.includes(rawText.toLowerCase());

    speakText(rawText);

    // Trigger SMS alert if a trigger word
    if (isTrigger) {
      try {
        await axios.post(
          'http://localhost:4000/api/alert/send',
          { recognizedText: rawText, lat: req.body.lat, lng: req.body.lng },
          { headers: { Authorization: req.headers.authorization } }
        );
      } catch (err) {
        console.error('❌ Error sending SMS alert:', err.response?.data || err.message);
      }
    }

    // Translations
    const translations = {};
    const langMap = { hindi: 'hi', malayalam: 'ml', tamil: 'ta' };
    for (const [key, code] of Object.entries(langMap)) {
      translations[key] = await translateTextLibre(rawText, code);
    }

    return res.json({ recognizedText: rawText, isTrigger, translations });

  } catch (err) {
    console.error('recognize route error:', err.message);
    return res.status(500).json({ error: 'Server error during recognition' });
  }
});

module.exports = router;
