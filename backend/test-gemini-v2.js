import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const configs = [
        { model: "gemini-1.5-flash", version: "v1" },
        { model: "gemini-1.5-flash", version: "v1beta" },
        { model: "gemini-2.0-flash-exp", version: "v1beta" }
    ];

    for (const config of configs) {
        console.log(`\nTesting: ${config.model} on ${config.version}`);
        try {
            const model = genAI.getGenerativeModel({ model: config.model }, { apiVersion: config.version });
            const result = await model.generateContent("test");
            const response = await result.response;
            console.log(`✅ SUCCESS: ${response.text().substring(0, 20)}`);
        } catch (e) {
            console.log(`❌ FAILED: ${e.message}`);
        }
    }
}
test();
