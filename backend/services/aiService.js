import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Predicts future expenses using historical data.
 * @param {Array} expenses 
 */
export const predictExpenses = async (expenses) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is missing in .env");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }, { apiVersion: "v1" });

        console.log("[AI Predictor] Preparing context for", expenses.length, "expenses...");

        const context = expenses.map(e => {
            const dateObj = e.date ? new Date(e.date) : new Date(e.createdAt);
            const dateStr = !isNaN(dateObj) ? dateObj.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            return {
                amount: e.amount,
                category: e.category,
                date: dateStr
            };
        });

        const prompt = `
            Analyze this historical expense data and predict the future 30 days.
            
            Data: ${JSON.stringify(context.slice(-100))}
            
            Return ONLY a valid JSON object with these exact keys:
            - "predictedTotal": (number)
            - "predictedCategories": Array of {"category": string, "predictedAmount": number}
            - "insights": Array of 3 strings
            - "confidence": (number 0-100)
        `;

        console.log("[AI Predictor] Sending prompt to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("[AI Predictor] Raw response:", text);

        // Clean up markdown if Gemini adds it
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();

        return JSON.parse(cleanText);

    } catch (error) {
        console.error("AI Prediction Error Detailed:", error);
        throw new Error(`AI Forecast Failed: ${error.message}`);
    }
};
