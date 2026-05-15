import express from "express";
import { handleSMSWebhook, generateToken } from "../controllers/smsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Webhook (Used by APK)
// No "protect" middleware here because the token in the URL is the authentication
router.post("/webhook/:token", handleSMSWebhook);

// Private route to generate/get token (Used by Web App)
router.post("/token", protect, generateToken);

export default router;
