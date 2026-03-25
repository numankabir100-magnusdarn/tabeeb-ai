const express = require('express');
const { param, validationResult } = require('express-validator');

module.exports = function(medicalBrain, db, logger) {
    const router = express.Router();

    router.get('/home-remedies/:condition', [
        param('condition').isString().trim(),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array()[0].msg });
            }
            next();
        }
    ], async (req, res) => {
        try {
            const condition = req.params.condition;
            const remedies = medicalBrain.getHomeRemedies(condition);
            
            res.json({
                condition,
                remedies,
                disclaimer: medicalBrain.getMedicalDisclaimer()
            });
        } catch (error) {
            logger.error('Error fetching home remedies:', error);
            res.status(500).json({ 
                error: 'Failed to fetch remedies',
                disclaimer: medicalBrain.getMedicalDisclaimer()
            });
        }
    });

    return router;
};
