const express = require('express');
const { body, validationResult } = require('express-validator');

module.exports = function(medicalBrain, db, logger) {
    const router = express.Router();

    router.post('/set-medication-reminder', [
        body('phoneNumber').matches(/^(\+92|0)?3[0-9]{9}$/).withMessage('Valid Pakistani phone number required'),
        body('medicationName').isString().trim().notEmpty(),
        body('dosage').isString().trim().notEmpty(),
        body('frequency').isString().trim().notEmpty(),
        body('times').isArray({ min: 1 }),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array()[0].msg });
            }
            next();
        }
    ], async (req, res) => {
        try {
            const { phoneNumber, medicationName, dosage, frequency, times } = req.body;
            
            const reminder = medicalBrain.setMedicationReminder(phoneNumber, medicationName, dosage, frequency, times);
            
            // Save to database
            db.run(`INSERT INTO medication_reminders 
                   (phone_number, medication, dosage, frequency, times) 
                   VALUES (?, ?, ?, ?, ?)`, 
            [
                reminder.phoneNumber,
                medicationName,
                dosage,
                frequency,
                JSON.stringify(times)
            ]);

            logger.info(`Reminder set for ${reminder.phoneNumber} - ${medicationName}`);

            res.json({
                ...reminder,
                disclaimer: 'Reminders are sent via WhatsApp. Standard messaging rates may apply.'
            });
        } catch (error) {
            logger.error('Error setting medication reminder:', error);
            res.status(500).json({ error: 'Failed to set medication reminder' });
        }
    });

    return router;
};
