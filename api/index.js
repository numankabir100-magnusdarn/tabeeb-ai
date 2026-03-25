const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Import TABEEB AI Medical Brain
const MedicalBrain = require('../src/medical-brain');

// Initialize Medical Brain
const medicalBrain = new MedicalBrain();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Configure multer for memory storage (Vercel doesn't allow file system)
const upload = multer({ storage: multer.memoryStorage() });

// Smart Symptom Triage with TABEEB AI Medical Brain
app.post('/api/smart-triage', async (req, res) => {
    try {
        const { symptoms, duration, severity, answers = {}, age, region, gender } = req.body;
        
        if (!symptoms || symptoms.length === 0) {
            return res.status(400).json({ 
                error: 'Symptoms are required',
                disclaimer: medicalBrain.getMedicalDisclaimer()
            });
        }

        // Use Medical Brain for enhanced AI analysis
        const analysis = await medicalBrain.analyzeSymptomsWithAI(symptoms, {
            severity,
            duration,
            age,
            region,
            gender,
            answers
        });
        
        res.json({
            ...analysis,
            disclaimer: medicalBrain.getMedicalDisclaimer()
        });
    } catch (error) {
        console.error('Error in smart triage:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            disclaimer: medicalBrain.getMedicalDisclaimer()
        });
    }
});

// Lab Report Interpreter using TABEEB AI Medical Brain
app.post('/api/interpret-lab-report', upload.single('labReport'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Lab report image is required' });
        }

        // Simulate OCR extraction (in production, would use Tesseract.js)
        const extractedData = {
            'Hemoglobin': '12.5 g/dL',
            'WBC': '8000/μL',
            'Platelets': '250,000/μL',
            'Blood Sugar (Fasting)': '110 mg/dL',
            'Cholesterol': '220 mg/dL',
            'Triglycerides': '180 mg/dL'
        };

        // Use Medical Brain for analysis
        const interpretation = medicalBrain.analyzeLabReport(extractedData);
        
        res.json({
            ...interpretation,
            disclaimer: medicalBrain.getMedicalDisclaimer()
        });
    } catch (error) {
        console.error('Error interpreting lab report:', error);
        res.status(500).json({ 
            error: 'Failed to interpret lab report',
            disclaimer: medicalBrain.getMedicalDisclaimer()
        });
    }
});

// Pharmacy Price Comparison
app.get('/api/pharmacy-prices/:medicine', async (req, res) => {
    try {
        const medicine = req.params.medicine;
        const prices = medicalBrain.getPharmacyPrices(medicine);
        
        res.json({
            medicine,
            prices,
            disclaimer: medicalBrain.getMedicalDisclaimer()
        });
    } catch (error) {
        console.error('Error fetching pharmacy prices:', error);
        res.status(500).json({ error: 'Failed to fetch pharmacy prices' });
    }
});

// Welfare Hospitals Finder
app.get('/api/welfare-hospitals/:city', async (req, res) => {
    try {
        const city = req.params.city;
        const hospitals = medicalBrain.getWelfareHospitals(city);
        
        res.json({
            city,
            hospitals,
            disclaimer: 'Please verify hospital services and availability before visiting.'
        });
    } catch (error) {
        console.error('Error fetching welfare hospitals:', error);
        res.status(500).json({ error: 'Failed to fetch hospital information' });
    }
});

// Gharelu Totkay (Home Remedies) using TABEEB AI Medical Brain
app.get('/api/home-remedies/:condition', async (req, res) => {
    try {
        const condition = req.params.condition;
        
        // Use Medical Brain to get culturally appropriate remedies
        const remedies = medicalBrain.getHomeRemedies(condition);
        
        res.json({
            condition,
            remedies,
            disclaimer: medicalBrain.getMedicalDisclaimer()
        });
    } catch (error) {
        console.error('Error fetching home remedies:', error);
        res.status(500).json({ 
            error: 'Failed to fetch remedies',
            disclaimer: medicalBrain.getMedicalDisclaimer()
        });
    }
});

// WhatsApp Medication Reminder
app.post('/api/set-medication-reminder', async (req, res) => {
    try {
        const { phoneNumber, medicationName, dosage, frequency, times } = req.body;
        
        // Validate phone number (Pakistani format)
        if (!phoneNumber || !phoneNumber.match(/^(\+92|0)?3[0-9]{9}$/)) {
            return res.status(400).json({ error: 'Invalid Pakistani phone number format' });
        }

        // Use Medical Brain to set reminder
        const reminder = medicalBrain.setMedicationReminder(phoneNumber, medicationName, dosage, frequency, times);
        
        res.json({
            ...reminder,
            disclaimer: 'This is a demo. In production, actual WhatsApp messages would be sent.'
        });
    } catch (error) {
        console.error('Error setting medication reminder:', error);
        res.status(500).json({ error: 'Failed to set medication reminder' });
    }
});

// Find a Specialist (Sehat Connect)
app.get('/api/find-specialist/:specialty', async (req, res) => {
    try {
        const specialty = req.params.specialty;
        const city = req.query.city || 'rawalpindi';
        
        // Use Medical Brain to find specialists
        const specialists = medicalBrain.findSpecialists(specialty, city);
        
        res.json({
            specialty,
            city,
            specialists,
            disclaimer: 'Please verify doctor credentials and availability before booking.'
        });
    } catch (error) {
        console.error('Error finding specialists:', error);
        res.status(500).json({ error: 'Failed to find specialists' });
    }
});

// Serve static files (for frontend)
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all handler for frontend routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Export for Vercel
module.exports = app;
