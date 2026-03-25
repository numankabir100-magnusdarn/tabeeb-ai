const express = require('express');
const { param, validationResult } = require('express-validator');

module.exports = function(medicalBrain, db, logger) {
    const router = express.Router();

    router.get('/pharmacy-prices/:medicine', [
        param('medicine').isString().trim(),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array()[0].msg });
            }
            next();
        }
    ], async (req, res) => {
        try {
            const medicine = req.params.medicine;
            const prices = medicalBrain.getPharmacyPrices(medicine);
            
            res.json({
                medicine,
                prices,
                disclaimer: 'Prices are approximate and may vary. Please verify with pharmacies.'
            });
        } catch (error) {
            logger.error('Error fetching pharmacy prices:', error);
            res.status(500).json({ error: 'Failed to fetch prices' });
        }
    });

    return router;
};
