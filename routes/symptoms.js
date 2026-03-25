const express = require('express');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

module.exports = function(medicalBrain, db, logger) {
    const router = express.Router();

    // Middleware to validate request
    const validateRequest = (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: errors.array()[0].msg,
                disclaimer: 'This is not medical advice. Always consult a healthcare professional.'
            });
        }
        next();
    };

    // Symptom analysis endpoint
    router.post('/analyze-symptoms', [
        body('symptoms')
            .isArray({ min: 1, max: 10 }).withMessage('Symptoms must be an array with 1 to 10 items')
            .customSanitizer(value => value.map(v => sanitizeHtml(v))),
        body('duration').optional().isString().trim(),
        body('severity').optional().isString().trim(),
        validateRequest
    ], async (req, res) => {
        try {
            const { symptoms, duration, severity } = req.body;
            
            // Log access
            logger.info('Analyzing symptoms: ' + symptoms.join(', '));

            // Determine if emergency
            const triageResult = medicalBrain.triageAlgorithm.emergencyDetection(symptoms, severity, duration);
            
            // Get detailed analysis
            const analysis = medicalBrain.getDetailedAnalysis(symptoms, { duration, severity });
            
            // Apply Pakistani context
            const contextualizedAnalysis = medicalBrain.applyPakistaniContext(analysis, { duration, severity });

            const emergencyWarning = triageResult.isEmergency ? {
                level: 'high',
                message: 'Seek immediate medical attention or call emergency services.',
                reasons: ['Your symptoms may indicate a serious medical condition']
            } : {
                level: 'low',
                message: 'Monitor your symptoms and seek medical care if they worsen.'
            };

            const response = {
                possibleConditions: contextualizedAnalysis.possibleConditions || [],
                recommendations: contextualizedAnalysis.recommendations || ['Rest and stay hydrated', 'Monitor your symptoms'],
                severity: severity || 'moderate',
                duration: duration || 'unknown',
                disclaimer: 'This is not medical advice. Always consult a healthcare professional.',
                emergencyWarning
            };

            // Save to DB
            db.run('INSERT INTO symptom_checks (user_id, symptoms, result) VALUES (?, ?, ?)', [
                null, 
                JSON.stringify(symptoms),
                JSON.stringify(response)
            ]);

            res.json(response);
        } catch (error) {
            logger.error('Error analyzing symptoms:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                disclaimer: 'This is not medical advice. Always consult a healthcare professional.'
            });
        }
    });

    // Smart Symptom Triage with TABEEB AI Medical Brain
    router.post('/smart-triage', [
        body('symptoms')
            .isArray({ min: 1, max: 10 }).withMessage('Symptoms must be an array with 1 to 10 items')
            .customSanitizer(value => value.map(v => sanitizeHtml(v))),
        validateRequest
    ], async (req, res) => {
        try {
            const { symptoms, duration, severity, answers = {}, age, region, gender } = req.body;
            
            logger.info('Smart Triage requested for symptoms: ' + symptoms.join(', '));

            // Use Medical Brain for enhanced AI analysis
            const analysis = await medicalBrain.analyzeSymptomsWithAI(symptoms, {
                severity,
                duration,
                age,
                region,
                gender,
                answers
            });
            
            // Save to DB
            db.run('INSERT INTO symptom_checks (user_id, symptoms, result) VALUES (?, ?, ?)', [
                null, 
                JSON.stringify(symptoms),
                JSON.stringify(analysis)
            ]);

            res.json({
                ...analysis,
                disclaimer: medicalBrain.getMedicalDisclaimer()
            });
        } catch (error) {
            logger.error('Error in smart triage:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                disclaimer: medicalBrain.getMedicalDisclaimer()
            });
        }
    });

    return router;
};
