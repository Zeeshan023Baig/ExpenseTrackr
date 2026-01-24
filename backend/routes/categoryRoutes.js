const express = require('express');
const router = express.Router();

// Since we used ENUM for categories in Expense model, 
// we can provide a simple endpoint to get valid categories 
// or expand this to a full Category model table if user wants custom categories.
// For now, based on context, a static list or simple return is enough given the prompt scale.

router.get('/', (req, res) => {
    res.json([
        'Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Other'
    ]);
});

module.exports = router;
