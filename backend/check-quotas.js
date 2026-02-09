import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function checkQuotas() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // We'll test models that are commonly in the free tier
    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-2.0-flash-exp"
    ];

    for (const mName of models) {
        console.log(`\nTesting Model: ${mName}...`);
        try {
            // We use v1beta as it usually has the most models enabled for free tier
            const model = genAI.getGenerativeModel({ model: mName }, { apiVersion: "v1beta" });
            const result = await model.generateContent("Say hello");
            const response = await result.response;
            console.log(`✅ SUCCESS: ${response.text().substring(0, 30)}`);
        } catch (e) {
            console.log(`❌ FAILED: ${e.message}`);
        }
    }
}

checkQuotas();
