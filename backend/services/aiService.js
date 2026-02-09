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
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Prepare context: Group by category and date for efficiency
        const context = expenses.map(e => ({
            amount: e.amount,
            category: e.category,
            date: (e.date || e.createdAt).split('T')[0]
        }));

        const prompt = `
            Analyze this historical expense data and predict the future 30 days.
            
            Data: ${JSON.stringify(context.slice(-100))} (limited to last 100 for token efficiency)
            
            Return ONLY a JSON object with:
            - predictedTotal: Estimated total spending for next 30 days
            - predictedCategories: Array of {category, predictedAmount} for top 3 hotspots
            - insights: 3 specific, actionable saving recommendations based on patterns
            - confidence: 0-100 indicating reliability
            
            Return ONLY the JSON. No markdown.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if Gemini adds it
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);

    } catch (error) {
        console.error("AI Prediction Error:", error);
        throw new Error(`AI Forecast Failed: ${error.message}`);
    }
};
