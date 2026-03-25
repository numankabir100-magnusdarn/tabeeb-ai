const express = require('express');
const { param, query, validationResult } = require('express-validator');

module.exports = function(medicalBrain, db, logger) {
    const router = express.Router();

    router.get('/find-specialist/:specialty', [
        param('specialty').isString().trim(),
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
            const { specialty } = req.params;
            const { city = 'rawalpindi' } = req.query;
            const specialists = medicalBrain.findSpecialists(specialty, city);
            
            res.json({
                specialty,
                city,
                specialists,
                disclaimer: 'Please verify doctor availability and credentials before booking appointments.'
            });
        } catch (error) {
            logger.error('Error finding specialists:', error);
            res.status(500).json({ error: 'Failed to find specialists' });
        }
    });

    return router;
};
