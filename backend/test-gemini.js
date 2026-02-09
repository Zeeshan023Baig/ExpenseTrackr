import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY is missing in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const versions = ["v1", "v1beta"];
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest"];

    for (const apiVersion of versions) {
        for (const modelName of models) {
            console.log(`\nTesting Model: ${modelName} | API Version: ${apiVersion}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion });
                const result = await model.generateContent("Hello, are you there?");
                const response = await result.response;
                console.log(`✅ Success! Response preview: ${response.text().substring(0, 50)}...`);
            } catch (error) {
                console.error(`❌ Failed: ${error.message}`);
            }
        }
    }
}

testGemini();
