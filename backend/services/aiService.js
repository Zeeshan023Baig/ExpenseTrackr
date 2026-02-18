import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Predicts future expenses using historical data.
 * @param {Array} expenses 
 */
/**
 * Simple Linear Regression helper
 * y = mx + b
 */
const calculateLinearRegression = (data) => {
    const n = data.length;
    if (n < 2) return { m: 0, b: data[0]?.y || 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
        sumX += data[i].x;
        sumY += data[i].y;
        sumXY += data[i].x * data[i].y;
        sumX2 += data[i].x * data[i].x;
    }

    const denominator = (n * sumX2 - sumX * sumX);
    const m = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
    const b = (sumY - m * sumX) / n;

    return { m, b };
};

/**
 * Predicts future expenses using historical data via Linear Regression.
 * @param {Array} expenses 
 */
export const predictExpenses = async (expenses) => {
    try {
        console.log("[Linear Predictor] Analyzing", expenses.length, "expenses...");

        // 1. Group expenses by date (daily total)
        const dailyTotals = {};
        const categoryTotals = {};

        const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstDate = new Date(sortedExpenses[0].date);

        sortedExpenses.forEach(e => {
            const dateStr = new Date(e.date).toISOString().split('T')[0];
            const daysSinceStart = Math.floor((new Date(e.date) - firstDate) / (1000 * 60 * 60 * 24));

            dailyTotals[daysSinceStart] = (dailyTotals[daysSinceStart] || 0) + parseFloat(e.amount);

            if (!categoryTotals[e.category]) categoryTotals[e.category] = [];
            categoryTotals[e.category].push({ x: daysSinceStart, y: parseFloat(e.amount) });
        });

        const regressionData = Object.keys(dailyTotals).map(day => ({
            x: parseInt(day),
            y: dailyTotals[day]
        }));

        // 2. Global Trend (Linear Regression)
        const { m, b } = calculateLinearRegression(regressionData);

        // Predict next 30 days
        const lastDay = regressionData[regressionData.length - 1].x;
        let predictedTotal = 0;
        for (let i = 1; i <= 30; i++) {
            const forecast = m * (lastDay + i) + b;
            predictedTotal += Math.max(0, forecast); // Disallow negative spend
        }

        // 3. Category Breakdown
        const predictedCategories = Object.keys(categoryTotals).map(cat => {
            const catLR = calculateLinearRegression(categoryTotals[cat]);
            let catTotal = 0;
            for (let i = 1; i <= 30; i++) {
                catTotal += Math.max(0, catLR.m * (lastDay + i) + catLR.b);
            }
            return {
                category: cat,
                predictedAmount: Math.round(catTotal)
            };
        }).filter(c => c.predictedAmount > 0).sort((a, b) => b.predictedAmount - a.predictedAmount);

        // 4. Insights Generation
        const trendDirection = m > 0 ? "increasing" : "decreasing";
        const trendPercent = Math.abs(Math.round((m / (m * lastDay + b)) * 100)) || 0;

        const insights = [
            `Based on your history, spending is ${trendDirection} by approx ${trendPercent}% daily.`,
            `Your largest predicted category is ${predictedCategories[0]?.category || 'N/A'} at ₹${predictedCategories[0]?.predictedAmount.toLocaleString() || 0}.`,
            m > 0 ? "Try setting specific budgets for your top categories to reverse the upward trend." : "Great job! Your spending trend is heading downwards compared to previous periods."
        ];

        return {
            predictedTotal: Math.round(predictedTotal),
            predictedCategories,
            insights,
            confidence: Math.min(95, Math.max(60, 100 - Math.round(Math.abs(m) * 10))) // Heuristic confidence
        };

    } catch (error) {
        console.error("Linear Prediction Error:", error);
        throw new Error(`Forecast Failed: ${error.message}`);
    }
};
