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

        // 1. Determine timeline range
        const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstDate = new Date(new Date(sortedExpenses[0].date).setHours(0, 0, 0, 0));
        const lastDate = new Date(new Date(sortedExpenses[sortedExpenses.length - 1].date).setHours(0, 0, 0, 0));

        // Calculate total days in history (min 7 days for better math)
        const diffMs = lastDate - firstDate;
        const totalDaysRange = Math.max(7, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        // 2. Group expenses by day (filling gaps with 0)
        const dailyTotalsMap = {};
        const categoryDailyMap = {};

        sortedExpenses.forEach(e => {
            const date = new Date(new Date(e.date).setHours(0, 0, 0, 0));
            const dayOffset = Math.floor((date - firstDate) / (1000 * 60 * 60 * 24));

            dailyTotalsMap[dayOffset] = (dailyTotalsMap[dayOffset] || 0) + parseFloat(e.amount);

            if (!categoryDailyMap[e.category]) categoryDailyMap[e.category] = {};
            categoryDailyMap[e.category][dayOffset] = (categoryDailyMap[e.category][dayOffset] || 0) + parseFloat(e.amount);
        });

        // Create full timeline for global trend
        const regressionData = [];
        for (let i = 0; i <= totalDaysRange; i++) {
            regressionData.push({ x: i, y: dailyTotalsMap[i] || 0 });
        }

        // 3. Global Trend (Linear Regression)
        const { m, b } = calculateLinearRegression(regressionData);

        // Predict next 30 days
        let predictedTotal = 0;
        for (let i = 1; i <= 30; i++) {
            const forecast = m * (totalDaysRange + i) + b;
            predictedTotal += Math.max(0, forecast); // Disallow negative spend
        }

        // 4. Category Breakdown
        const predictedCategories = Object.keys(categoryDailyMap).map(cat => {
            const catData = [];
            for (let i = 0; i <= totalDaysRange; i++) {
                catData.push({ x: i, y: categoryDailyMap[cat][i] || 0 });
            }

            const catLR = calculateLinearRegression(catData);
            let catTotal = 0;
            for (let i = 1; i <= 30; i++) {
                catTotal += Math.max(0, catLR.m * (totalDaysRange + i) + catLR.b);
            }
            return {
                category: cat,
                predictedAmount: Math.round(catTotal)
            };
        }).filter(c => c.predictedAmount > 0).sort((a, b) => b.predictedAmount - a.predictedAmount);

        // 5. Insights Generation
        const currentDailyAvg = m * totalDaysRange + b;
        const trendDirection = m > 0 ? "increasing" : "decreasing";
        const trendPercent = currentDailyAvg === 0 ? 0 : Math.abs(Math.round((m / currentDailyAvg) * 100));

        const insights = [
            `Spending is currently ${trendDirection} by approx ${trendPercent}% daily compared to your historical average.`,
            `Your top predicted hotspot is ${predictedCategories[0]?.category || 'N/A'} at ₹${predictedCategories[0]?.predictedAmount.toLocaleString() || 0}.`,
            m > 0 ? "Try consolidating your largest recurring expenses to bring the trend line down." : "Your spending habits are improving! The trend line is moving downwards."
        ];

        return {
            predictedTotal: Math.round(predictedTotal),
            predictedCategories,
            insights,
            confidence: Math.min(98, Math.max(65, 100 - Math.round(Math.abs(m) * 5)))
        };

    } catch (error) {
        console.error("Linear Prediction Error:", error);
        throw new Error(`Forecast Failed: ${error.message}`);
    }
};
