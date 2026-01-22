const express = require('express');
const router = express.Router();
const { sendMessage, getHistory, clearHistory } = require('../controllers/chatController');

// POST /chat -> receive message & return bot reply
// Note: User asked for POST /chat, but usually REST suggests POST /messages or similar.
// I will map it to /chat as requested, or more standard /api/chat if mounted there.
// If mounted at /api, then:
router.post('/chat', sendMessage);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

module.exports = router;
