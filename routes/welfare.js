const express = require('express');
const { query, validationResult } = require('express-validator');

module.exports = function(medicalBrain, db, logger) {
    const router = express.Router();

    router.get('/welfare-hospitals', [
        query('city').optional().isString().trim(),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array()[0].msg });
            }
            next();
        }
    ], async (req, res) => {
        try {
            const { city = 'rawalpindi' } = req.query;
            const hospitals = medicalBrain.getWelfareHospitals(city);
            
            res.json({
                city,
                hospitals,
                disclaimer: 'Please verify hospital services and availability before visiting.'
            });
        } catch (error) {
            logger.error('Error fetching welfare hospitals:', error);
            res.status(500).json({ error: 'Failed to fetch hospital information' });
        }
    });

    return router;
};
