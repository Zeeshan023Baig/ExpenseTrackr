import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Parses bank SMS text into structured expense data using Gemini AI.
 * @param {string} smsText 
 */
export const parseSMS = async (smsText) => {
    try {
        console.log(`[Gemini SMS] Parsing SMS: "${smsText.substring(0, 50)}..."`);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is missing in .env");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }, { apiVersion: "v1beta" });
        
        const prompt = `
        You are an expert financial assistant. Analyze the following bank SMS message and extract transaction details.

        SMS Text: "${smsText}"

        Extract the following as JSON:
        - amount: The numeric transaction amount (e.g., 500.50).
        - merchant: The vendor or person paid/received from (e.g., "Starbucks", "Zomato", "Amazon").
        - category: Choose ONE from [Food, Travel, Groceries, Bills, Entertainment, Health, Shopping, Education, Other].
        - date: The transaction date in YYYY-MM-DD format. If not found, use today's date (${new Date().toISOString().split('T')[0]}).
        - type: Either "expense" or "income".

        Rules:
        1. If it's a debit/spent/paid message, type is "expense".
        2. If it's a credit/received/deposited message, type is "income".
        3. Return ONLY the JSON object. No markdown, no explanations.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('[Gemini SMS] AI Raw Response:', text);

        // Clean up markdown if Gemini adds it
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const parsed = JSON.parse(cleanText);

        // Basic validation/normalization
        return {
            amount: parseFloat(parsed.amount) || 0,
            description: parsed.merchant || "SMS Expense",
            category: parsed.category || "Other",
            date: parsed.date || new Date().toISOString().split('T')[0],
            type: parsed.type || "expense"
        };

    } catch (error) {
        console.error("Gemini SMS Error:", error);
        throw new Error(`AI SMS Parsing Failed: ${error.message}`);
    }
};
