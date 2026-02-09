import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

/**
 * Scans multiple receipts and returns consolidated data.
 * @param {Array<{path: string, mimetype: string}>} files 
 */
export const scanReceipts = async (files) => {
    try {
        console.log(`[Gemini OCR] Scanning ${files.length} files...`);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is missing in .env");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prepare image parts for Gemini
        const imageParts = files.map(file => ({
            inlineData: {
                data: Buffer.from(fs.readFileSync(file.path)).toString("base64"),
                mimeType: file.mimetype,
            },
        }));

        const prompt = `
    Analyze these ${files.length} receipts or screenshots. 
    They might be different receipts or multiple photos of the same long receipt.
    
    Extract the following details as a consolidated JSON object:
    - amount: The TOTAL combined transaction amount from all images (number only, no symbols).
    - date: The transaction date (in YYYY-MM-DD format). If multiple dates exist, use the most recent or logical one.
    - merchant: The name of the merchant(s) or person(s) paid.
    - category: The expense category. Choose ONE that best fits the majority of items: [Food, Travel, Groceries, Bills, Entertainment, Health, Shopping, Education, Other].

    Important: 
    - Provide ONE consolidated object. 
    - Add up the amounts from all valid receipts found.
    - Ignore duplicate charges if an image appears twice or shows the same transaction.
    - Return ONLY the JSON string. Do not use Markdown code blocks.
    `;

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();

        console.log('[Gemini OCR] Response:', text);

        // Clean up markdown if Gemini adds it
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);

    } catch (error) {
        console.error("Gemini OCR Error:", error);
        throw new Error(`AI Scan Failed: ${error.message}`);
    }
};
