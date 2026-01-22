const Message = require('../models/Message');

// @desc    Receive message & return bot reply
// @route   POST /api/chat
// @access  Public
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        // Save User Message
        const userMessage = await Message.create({
            role: 'user',
            content: message
        });

        // Mock Bot Logic (Echo for simplicity, or simple logic)
        let botReplyContent = `You said: "${message}"`;
        if (message.toLowerCase().includes('hello')) {
            botReplyContent = 'Hello there! How can I help you today?';
        } else if (message.toLowerCase().includes('help')) {
            botReplyContent = 'I can help you with simple questions. Just ask!';
        }

        // Save Bot Message
        const botMessage = await Message.create({
            role: 'bot',
            content: botReplyContent
        });

        res.status(201).json({
            userMessage,
            botMessage
        });
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Fetch chat history
// @route   GET /api/history
// @access  Public
const getHistory = async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error in getHistory:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Clear all chats
// @route   DELETE /api/history
// @access  Public
const clearHistory = async (req, res) => {
    try {
        await Message.deleteMany({});
        res.status(200).json({ message: 'Chat history cleared' });
    } catch (error) {
        console.error('Error in clearHistory:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

module.exports = {
    sendMessage,
    getHistory,
    clearHistory
};
