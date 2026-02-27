/**
 * Weighted Linear Regression helper
 * y = mx + c
 * Weights recent data more heavily than older data.
 */
const calculateWeightedLinearRegression = (data) => {
    const n = data.length;
    if (n < 2) return { m: 0, c: data[0]?.y || 0 };

    let sumW = 0, sumWX = 0, sumWY = 0, sumWXX = 0, sumWXY = 0;

    for (let i = 0; i < n; i++) {
        // Linear weight: newest data gets full weight, oldest gets 0.5
        const weight = 0.5 + (0.5 * (i / (n - 1 || 1)));
        const x = data[i].x;
        const y = data[i].y;

        sumW += weight;
        sumWX += weight * x;
        sumWY += weight * y;
        sumWXX += weight * x * x;
        sumWXY += weight * x * y;
    }

    const den = (sumW * sumWXX - sumWX * sumWX);
    const m = den === 0 ? 0 : (sumW * sumWXY - sumWX * sumWY) / den;
    const c = (sumWY - m * sumWX) / sumW;

    return { m, c };
};

/**
 * Predicts future expenses using a Conservative Weighted model.
 * @param {Array} expenses 
 * @param {Number} userBudget
 */
export const predictExpenses = async (expenses, userBudget = 0) => {
    try {
        console.log("[Conservative Predictor] Analyzing", expenses.length, "expenses with budget ₹", userBudget);

        const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstDate = new Date(new Date(sortedExpenses[0].date).setHours(0, 0, 0, 0));
        const lastDate = new Date(new Date(sortedExpenses[sortedExpenses.length - 1].date).setHours(0, 0, 0, 0));

        const diffMs = lastDate - firstDate;
        const totalDaysRange = Math.max(7, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        const dailyTotalsMap = {};
        const categoryDailyMap = {};

        // Calculate a clean baseline (ignore extreme single-day spikes > 3x average)
        const totalAmount = sortedExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        const overallAvgDaily = totalAmount / (totalDaysRange + 1 || 1);

        sortedExpenses.forEach(e => {
            const date = new Date(new Date(e.date).setHours(0, 0, 0, 0));
            const dayOffset = Math.floor((date - firstDate) / (1000 * 60 * 60 * 24));
            const amount = parseFloat(e.amount);

            dailyTotalsMap[dayOffset] = (dailyTotalsMap[dayOffset] || 0) + amount;

            if (!categoryDailyMap[e.category]) categoryDailyMap[e.category] = {};
            categoryDailyMap[e.category][dayOffset] = (categoryDailyMap[e.category][dayOffset] || 0) + amount;
        });

        const regressionData = [];
        for (let i = 0; i <= totalDaysRange; i++) {
            const y = dailyTotalsMap[i] || 0;
            const dampedY = y > (overallAvgDaily * 3) ? (overallAvgDaily * 1.5 + y * 0.1) : y;
            regressionData.push({ x: i, y: dampedY });
        }

        const { m, c } = calculateWeightedLinearRegression(regressionData);

        let predictedTotal = 0;
        for (let i = 1; i <= 30; i++) {
            const x = totalDaysRange + i;
            const trendForecast = m * x + c;
            const blendFactor = Math.min(0.8, 0.4 + (i / 60));
            const forecast = (trendForecast * (1 - blendFactor)) + (overallAvgDaily * blendFactor);
            predictedTotal += Math.max(0, forecast);
        }

        const predictedCategories = Object.keys(categoryDailyMap).map(cat => {
            const catData = [];
            let catTotalHistorical = 0;
            for (let i = 0; i <= totalDaysRange; i++) {
                const val = categoryDailyMap[cat][i] || 0;
                catData.push({ x: i, y: val });
                catTotalHistorical += val;
            }

            const catAvg = catTotalHistorical / (totalDaysRange + 1 || 1);
            const { m: catM, c: catC } = calculateWeightedLinearRegression(catData);

            let catPredictedTotal = 0;
            for (let i = 1; i <= 30; i++) {
                const x = totalDaysRange + i;
                const forecast = catM * x + catC;
                const blended = (forecast * 0.3) + (catAvg * 0.7);
                catPredictedTotal += Math.max(0, blended);
            }
            return {
                category: cat,
                predictedAmount: Math.round(catPredictedTotal)
            };
        }).filter(c => c.predictedAmount > 10).sort((a, b) => b.predictedAmount - a.predictedAmount);

        // Behavioral Analytics
        const weekdayTotals = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        const weekendDays = [0, 6]; // Sun, Sat
        let weekendSpend = 0, weekdaySpend = 0;

        sortedExpenses.forEach(e => {
            const d = new Date(e.date);
            const day = d.getDay();
            const amt = parseFloat(e.amount);
            weekdayTotals[day] += amt;
            if (weekendDays.includes(day)) weekendSpend += amt;
            else weekdaySpend += amt;
        });

        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const maxDayEntry = Object.entries(weekdayTotals).reduce((a, b) => b[1] > a[1] ? b : a, ["0", 0]);
        const peakDay = dayNames[maxDayEntry[0]];

        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysPassed = now.getDate() || 1;
        const daysLeft = daysInMonth - daysPassed || 1;

        const monthlySpent = sortedExpenses
            .filter(e => new Date(e.date).getMonth() === now.getMonth() && new Date(e.date).getFullYear() === now.getFullYear())
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);

        // Use the user's actual budget, fallback to AI's guess (naive projection)
        const budgetBaseline = userBudget > 0 ? userBudget : (overallAvgDaily * 30);
        const dailyBudgetIQ = Math.max(0, Math.round((budgetBaseline - monthlySpent) / daysLeft));

        const naiveProjection = overallAvgDaily * 30;
        const finalPredicted = Math.min(predictedTotal, naiveProjection * 1.3);

        const trendDirection = m > 0 ? "increasing" : "decreasing";
        const velocity = Math.abs(m) > (overallAvgDaily * 0.05) ? "steadily" : "slightly";

        const insights = [
            `Overall trend: Spending is ${trendDirection} ${velocity}.`,
            `Your peak spending day is typically ${peakDay}.`,
            `Weekend vs Weekday: Your weekend spend is ₹${weekendSpend.toLocaleString('en-IN')} vs ₹${weekdaySpend.toLocaleString('en-IN')} on weekdays.`,
            m > 0 ? "Recent spikes are pushing your trend up. We've adjusted for one-time costs." : "Great! Your spending is stabilized and predictable."
        ];

        return {
            predictedTotal: Math.round(finalPredicted),
            predictedCategories: predictedCategories.slice(0, 10),
            insights,
            behavioral: {
                peakDay,
                weekendRatio: weekendSpend / (weekendSpend + weekdaySpend || 1),
                dailyBudgetIQ,
                burnRate: Math.round(monthlySpent / daysPassed)
            },
            confidence: Math.min(95, Math.max(75, 90 - Math.round(Math.abs(m / (overallAvgDaily || 1)) * 100)))
        };

    } catch (error) {
        console.error("Conservative Prediction Error:", error);
        throw new Error(`Forecast Failed: ${error.message}`);
    }
};
