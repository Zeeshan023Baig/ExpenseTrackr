import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function runTest() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    let results = "Gemini Quota Test Results\n\n";

    const tests = [
        { name: "gemini-1.5-flash", version: "v1beta" },
        { name: "gemini-1.5-flash-latest", version: "v1beta" },
        { name: "gemini-1.5-pro", version: "v1beta" },
        { name: "gemini-1.5-pro-latest", version: "v1beta" },
        { name: "gemini-1.5-flash-8b", version: "v1beta" },
        { name: "gemini-pro-latest", version: "v1beta" },
        { name: "gemini-flash-latest", version: "v1beta" }
    ];

    for (const test of tests) {
        results += `Testing: ${test.name} (${test.version})...\n`;
        try {
            const model = genAI.getGenerativeModel({ model: test.name }, { apiVersion: test.version });
            const result = await model.generateContent("Say hello");
            const response = await result.response;
            results += `✅ WORKED: ${response.text().substring(0, 30)}\n`;
        } catch (e) {
            results += `❌ FAILED: ${e.message}\n`;
        }
        results += "-------------------\n";
    }

    fs.writeFileSync("quota_results.txt", results);
    console.log("Done. Results in quota_results.txt");
}

runTest();
