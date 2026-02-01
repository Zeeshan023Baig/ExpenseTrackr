import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

export const scanReceipt = async (filePath, mimeType) => {
    try {
        // Lazy load key to ensure dotenv is ready
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is missing in .env");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log(`[Gemini OCR] Scanning file: ${filePath}, type: ${mimeType}`);

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
    - category: The expense category. Choose ONE from: [Food, Travel, Groceries, Bills, Entertainment, Health, Shopping, Education, Other].

    Note: 
    - If the image is a Payment Screenshot (GPay/PhonePe), "Paid to X" or "X" is the merchant.
    - Ignore "Transaction ID" numbers.
    - If you cannot find a value, use null.
    
    Return ONLY the JSON string. Do not use Markdown code blocks.
    `;

        const result = await model.generateContent([prompt, filePart]);
        const response = await result.response;
        const text = response.text();

        console.log('[Gemini OCR] Response:', text);

        // Clean up markdown if Gemini adds it
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);

    } catch (error) {
        console.error("Gemini OCR Error:", error);
        // Return a descriptive error to the frontend
        throw new Error(`AI Scan Failed: ${error.message}`);
    }
};
