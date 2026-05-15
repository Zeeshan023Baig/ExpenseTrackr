import User from "../models/User.js";
import Expense from "../models/Expense.js";
import { parseSMS } from "../services/smsParserService.js";

/**
 * Handle incoming SMS from APK webhook
 * POST /api/sms/webhook/:token
 */
export const handleSMSWebhook = async (req, res) => {
    try {
        const { token } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "No SMS text provided" });
        }

        // 1. Find user by token
        const user = await User.findOne({ where: { webhookToken: token } });
        if (!user) {
            return res.status(401).json({ message: "Invalid webhook token" });
        }

        console.log(`[SMS Webhook] Received SMS for user: ${user.username}`);

        // 2. Parse SMS with AI
        const parsedData = await parseSMS(text);

        // 3. Auto-add expense if it's an expense
        // Note: For now we only add "expense". If it's income, we might skip or handle later.
        if (parsedData.type === "expense") {
            const expense = await Expense.create({
                userId: user.id,
                amount: parsedData.amount,
                description: parsedData.description,
                category: parsedData.category,
                date: parsedData.date
            });

            console.log(`[SMS Webhook] Automatically added expense: ₹${expense.amount} at ${expense.description}`);
            
            return res.status(201).json({
                message: "Expense added automatically",
                expense
            });
        } else {
            return res.status(200).json({
                message: "Received income SMS, skipping for now as per current expense-only logic",
                parsedData
            });
        }

    } catch (error) {
        console.error("SMS Webhook Error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Generate/Refresh Webhook Token for a user
 * POST /api/sms/token
 */
export const generateToken = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate a random 32-char token
        const newToken = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);
        
        user.webhookToken = newToken;
        await user.save();

        res.json({ webhookToken: newToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
