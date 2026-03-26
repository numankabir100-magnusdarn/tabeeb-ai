const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const twilio = require('twilio');
require('dotenv').config();

// Custom modules
const logger = require('../logger');
const db = require('../db');
const MedicalBrain = require('../src/medical-brain');

const app = express();

// Initialize Medical Brain
const medicalBrain = new MedicalBrain();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());

// Global Medical Disclaimer Middleware
app.use((req, res, next) => {
  res.setHeader('X-Medical-Disclaimer', 'This is not medical advice. Always consult a healthcare professional.');
  next();
});

// Import and use routes
app.use('/api', require('../routes/symptoms')(medicalBrain, db, logger));
app.use('/api', require('../routes/lab-report')(medicalBrain, db, logger));
app.use('/api', require('../routes/pharmacy')(medicalBrain, db, logger));
app.use('/api', require('../routes/welfare')(medicalBrain, db, logger));
app.use('/api', require('../routes/remedies')(medicalBrain, db, logger));
app.use('/api', require('../routes/reminder')(medicalBrain, db, logger));
app.use('/api', require('../routes/doctor')(medicalBrain, db, logger));

// Basic Medical Information lookup
app.get('/api/medical-info/:condition', async (req, res) => {
  try {
    const condition = req.params.condition.toLowerCase();
    const medicalDatabase = {
        'migraine': {
            description: 'A neurological condition characterized by intense, debilitating headaches.',
            symptoms: ['Severe headache', 'Nausea', 'Sensitivity to light and sound', 'Visual disturbances'],
            treatments: ['Pain relievers', 'Triptans', 'Preventive medications', 'Lifestyle changes'],
            whenToSeeDoctor: 'If headaches are severe, frequent, or accompanied by other symptoms'
        },
        'flu': {
            description: 'A contagious respiratory illness caused by influenza viruses.',
            symptoms: ['Fever', 'Cough', 'Sore throat', 'Body aches', 'Fatigue'],
            treatments: ['Rest', 'Fluids', 'Antiviral medications', 'Pain relievers'],
            whenToSeeDoctor: 'If symptoms are severe or if you are in a high-risk group'
        },
        'common cold': {
            description: 'A mild viral infection of the nose and throat.',
            symptoms: ['Runny nose', 'Sore throat', 'Cough', 'Congestion', 'Mild fatigue'],
            treatments: ['Rest', 'Fluids', 'Over-the-counter cold medications'],
            whenToSeeDoctor: 'If symptoms last more than 10 days or worsen'
        }
    };
    
    const info = medicalDatabase[condition] || {
        description: 'Information not available in our database.',
        symptoms: [],
        treatments: [],
        whenToSeeDoctor: 'Consult a healthcare professional for accurate information'
    };
    
    res.json({
      ...info,
      disclaimer: 'This information is for educational purposes only. Always consult a healthcare professional.'
    });
  } catch (error) {
    logger.error('Error fetching medical info:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      disclaimer: 'This information is for educational purposes only. Always consult a healthcare professional.'
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    disclaimer: 'This is not medical advice. Always consult a healthcare professional.'
  });
});

// Twilio Setup and Cron Job for Real WhatsApp Reminders
// Note: Vercel serverless functions usually hibernate, making node-cron unreliable.
// For true serverless cron, Vercel Cron Jobs (vercel.json "crons") hitting an API endpoint is standard.
// For this phase, we keep the internal node-cron which works in local dev or persistent hosts.
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

cron.schedule('* * * * *', () => {
    logger.info('Running medication reminder check...');
    db.all(`SELECT * FROM medication_reminders WHERE active = 1`, [], async (err, rows) => {
        if (err) {
            logger.error('Failed to fetch reminders:', err);
            return;
        }

        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(/ AM| PM/i, (match) => match.toUpperCase());

        for (const reminder of rows) {
            try {
                const times = JSON.parse(reminder.times);
                if (times.some(t => t.toUpperCase().includes(currentTime) || currentTime.includes(t.toUpperCase()))) {
                    const messageBody = `*TABEEB AI Reminder*\nIt's time to take your medication:\n\n💊 Medicine: ${reminder.medication}\n🔢 Dosage: ${reminder.dosage}\n\nStay healthy!`;
                    
                    if (twilioClient) {
                        await twilioClient.messages.create({
                            body: messageBody,
                            from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
                            to: `whatsapp:${reminder.phone_number}`
                        });
                        logger.info(`WhatsApp reminder sent to ${reminder.phone_number} for ${reminder.medication}`);
                    } else {
                        logger.info(`[SIMULATED] WhatsApp reminder sent to ${reminder.phone_number} for ${reminder.medication} - No Twilio config found.`);
                    }
                }
            } catch (error) {
                logger.error(`Error processing reminder to ${reminder.phone_number}:`, error);
            }
        }
    });
});

module.exports = app;
