/**
 * Polynomial Regression helper (Degree 2)
 * y = ax^2 + bx + c
 */
const calculatePolynomialRegression = (data) => {
    const n = data.length;
    if (n < 3) {
        // Fallback to linear-like behavior if not enough points
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (let i = 0; i < n; i++) {
            sumX += data[i].x; sumY += data[i].y;
            sumXY += data[i].x * data[i].y; sumX2 += data[i].x * data[i].x;
        }
        const den = (n * sumX2 - sumX * sumX);
        const m = den === 0 ? 0 : (n * sumXY - sumX * sumY) / den;
        const b = (sumY - m * sumX) / (n || 1);
        return { a: 0, b: m, c: b };
    }

    let sumX = 0, sumY = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0, sumXY = 0, sumX2Y = 0;

    for (let i = 0; i < n; i++) {
        const x = data[i].x;
        const y = data[i].y;
        const x2 = x * x;
        sumX += x;
        sumY += y;
        sumX2 += x2;
        sumX3 += x2 * x;
        sumX4 += x2 * x2;
        sumXY += x * y;
        sumX2Y += x2 * y;
    }

    // Solve the system of linear equations using Cramer's rule for 3x3
    // [ sumX4 sumX3 sumX2 ] [ a ]   [ sumX2Y ]
    // [ sumX3 sumX2 sumX  ] [ b ] = [ sumXY  ]
    // [ sumX2 sumX  n     ] [ c ]   [ sumY   ]

    const det = (sumX4 * (sumX2 * n - sumX * sumX)) -
        (sumX3 * (sumX3 * n - sumX * sumX2)) +
        (sumX2 * (sumX3 * sumX - sumX2 * sumX2));

    if (Math.abs(det) < 1e-6) return { a: 0, b: 0, c: sumY / n };

    const detA = (sumX2Y * (sumX2 * n - sumX * sumX)) -
        (sumX3 * (sumXY * n - sumY * sumX)) +
        (sumX2 * (sumXY * sumX - sumY * sumX2));

    const detB = (sumX4 * (sumXY * n - sumY * sumX)) -
        (sumX2Y * (sumX3 * n - sumX * sumX2)) +
        (sumX2 * (sumX3 * sumY - sumX2Y * sumX));

    const detC = (sumX4 * (sumX2 * sumY - sumX * sumXY)) -
        (sumX3 * (sumX3 * sumY - sumX2 * sumXY)) +
        (sumX2Y * (sumX3 * sumX - sumX2 * sumX2));

    return {
        a: detA / det,
        b: detB / det,
        c: detC / det
    };
};

/**
 * Predicts future expenses using historical data via Polynomial Regression.
 * @param {Array} expenses 
 */
export const predictExpenses = async (expenses) => {
    try {
        console.log("[Polynomial Predictor] Analyzing", expenses.length, "expenses...");

        const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstDate = new Date(new Date(sortedExpenses[0].date).setHours(0, 0, 0, 0));
        const lastDate = new Date(new Date(sortedExpenses[sortedExpenses.length - 1].date).setHours(0, 0, 0, 0));

        const diffMs = lastDate - firstDate;
        const totalDaysRange = Math.max(7, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        const dailyTotalsMap = {};
        const categoryDailyMap = {};

        sortedExpenses.forEach(e => {
            const date = new Date(new Date(e.date).setHours(0, 0, 0, 0));
            const dayOffset = Math.floor((date - firstDate) / (1000 * 60 * 60 * 24));
            dailyTotalsMap[dayOffset] = (dailyTotalsMap[dayOffset] || 0) + parseFloat(e.amount);
            if (!categoryDailyMap[e.category]) categoryDailyMap[e.category] = {};
            categoryDailyMap[e.category][dayOffset] = (categoryDailyMap[e.category][dayOffset] || 0) + parseFloat(e.amount);
        });

        const regressionData = [];
        for (let i = 0; i <= totalDaysRange; i++) {
            regressionData.push({ x: i, y: dailyTotalsMap[i] || 0 });
        }

        // Global Trend (Polynomial Regression Degree 2)
        const { a, b, c } = calculatePolynomialRegression(regressionData);

        // Predict next 30 days
        let predictedTotal = 0;
        for (let i = 1; i <= 30; i++) {
            const x = totalDaysRange + i;
            const forecast = a * x * x + b * x + c;
            predictedTotal += Math.max(0, forecast);
        }

        // Category Breakdown
        const predictedCategories = Object.keys(categoryDailyMap).map(cat => {
            const catData = [];
            for (let i = 0; i <= totalDaysRange; i++) {
                catData.push({ x: i, y: categoryDailyMap[cat][i] || 0 });
            }

            const catPR = calculatePolynomialRegression(catData);
            let catTotal = 0;
            for (let i = 1; i <= 30; i++) {
                const x = totalDaysRange + i;
                catTotal += Math.max(0, catPR.a * x * x + catPR.b * x + catPR.c);
            }
            return {
                category: cat,
                predictedAmount: Math.round(catTotal)
            };
        }).filter(c => c.predictedAmount > 0).sort((a, b) => b.predictedAmount - a.predictedAmount);

        // Insights Generation
        const currentTrend = 2 * a * totalDaysRange + b; // Velocity at end of history
        const acceleration = 2 * a; // Constant acceleration in degree 2

        const trendDirection = currentTrend > 0 ? "increasing" : "decreasing";
        const velocityVerb = Math.abs(acceleration) > 0.1 ? (acceleration > 0 ? "speeding up" : "slowing down") : "stable";

        const insights = [
            `Your spending is ${trendDirection} and currently ${velocityVerb} based on recent patterns.`,
            `Top predicted hotspot: ${predictedCategories[0]?.category || 'N/A'} at ₹${predictedCategories[0]?.predictedAmount.toLocaleString() || 0}.`,
            acceleration > 0 ? "Watch out! Your spending growth is accelerating. Consider reviewing non-essential subscriptions." : "Great job! Your spending momentum is slowing down. Keep it up!"
        ];

        return {
            predictedTotal: Math.round(predictedTotal),
            predictedCategories,
            insights,
            confidence: Math.min(98, Math.max(70, 100 - Math.round(Math.abs(a) * 100)))
        };

    } catch (error) {
        console.error("Polynomial Prediction Error:", error);
        throw new Error(`Forecast Failed: ${error.message}`);
    }
};
