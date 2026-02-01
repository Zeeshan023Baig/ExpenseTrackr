import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const scanReceipt = async (filePath, mimeType) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Read file
        const filePart = {
            inlineData: {
                data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
                mimeType: mimeType,
            },
        };

        const prompt = `
    Analyze this receipt or screenshot. 
    Extract the following details as a JSON object:
    - amount: The total transaction amount (number only, no symbols).
    - date: The transaction date (in YYYY-MM-DD format). If not found, use null.
    - merchant: The name of the merchant or person paid (string).
    - category: A suggested category (e.g., Food, Travel, Shopping, Bills, Other).

    If you cannot find a value, use null.
    Return ONLY the JSON string. Do not use Markdown code blocks.
    `;

        const result = await model.generateContent([prompt, filePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if Gemini adds it
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);

    } catch (error) {
        console.error("Gemini OCR Error:", error);
        throw new Error("Failed to scan receipt with AI");
    }
};
