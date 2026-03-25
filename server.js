const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import TABEEB AI Medical Brain
const MedicalBrain = require('./src/medical-brain');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Medical Brain
const medicalBrain = new MedicalBrain();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Medical disclaimer middleware
app.use((req, res, next) => {
  res.setHeader('X-Medical-Disclaimer', 'This is not medical advice. Always consult a healthcare professional.');
  next();
});

// Symptom analysis endpoint
app.post('/api/analyze-symptoms', async (req, res) => {
  try {
    const { symptoms, duration, severity } = req.body;
    
    // Validate input
    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ 
        error: 'Symptoms are required',
        disclaimer: 'This is not medical advice. Always consult a healthcare professional.'
      });
    }

    // Simulate AI analysis (in production, this would call a real AI service)
    const analysis = analyzeSymptoms(symptoms, duration, severity);
    
    res.json({
      ...analysis,
      disclaimer: 'This is not medical advice. Always consult a healthcare professional.',
      emergencyWarning: getEmergencyWarning(symptoms, severity)
    });
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      disclaimer: 'This is not medical advice. Always consult a healthcare professional.'
    });
  }
});

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
        const prices = await getPharmacyPrices(medicine);
        
        res.json({
            medicine,
            prices,
            disclaimer: 'Prices are approximate and may vary. Please verify with pharmacies.'
        });
    } catch (error) {
        console.error('Error fetching pharmacy prices:', error);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

// Welfare Hospitals Finder
app.get('/api/welfare-hospitals', async (req, res) => {
    try {
        const { city = 'rawalpindi' } = req.query;
        const hospitals = await getWelfareHospitals(city);
        
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
            return res.status(400).json({ error: 'Valid Pakistani phone number required' });
        }
        
        const reminder = await setMedicationReminder(phoneNumber, medicationName, dosage, frequency, times);
        
        res.json({
            ...reminder,
            disclaimer: 'Reminders are sent via WhatsApp. Standard messaging rates may apply.'
        });
    } catch (error) {
        console.error('Error setting medication reminder:', error);
        res.status(500).json({ error: 'Failed to set medication reminder' });
    }
});

// Find Specialist (Sehat Connect)
app.get('/api/find-specialist/:specialty', async (req, res) => {
    try {
        const { specialty } = req.params;
        const { city = 'rawalpindi' } = req.query;
        const specialists = await findSpecialists(specialty, city);
        
        res.json({
            specialty,
            city,
            specialists,
            disclaimer: 'Please verify doctor availability and credentials before booking appointments.'
        });
    } catch (error) {
        console.error('Error finding specialists:', error);
        res.status(500).json({ error: 'Failed to find specialists' });
    }
});

// Medical information lookup endpoint
app.get('/api/medical-info/:condition', async (req, res) => {
  try {
    const condition = req.params.condition;
    const info = getMedicalInfo(condition);
    
    res.json({
      ...info,
      disclaimer: 'This information is for educational purposes only. Always consult a healthcare professional.'
    });
  } catch (error) {
    console.error('Error fetching medical info:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      disclaimer: 'This information is for educational purposes only. Always consult a healthcare professional.'
    });
  }
});

// Serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Helper functions
function analyzeSymptoms(symptoms, duration, severity) {
  // This is a simplified analysis - in production, use a real medical AI service
  const commonConditions = {
    'headache': ['Migraine', 'Tension headache', 'Sinus infection', 'Dehydration'],
    'fever': ['Viral infection', 'Bacterial infection', 'Influenza', 'COVID-19'],
    'cough': ['Common cold', 'Flu', 'Bronchitis', 'Allergies'],
    'fatigue': ['Anemia', 'Thyroid issues', 'Depression', 'Sleep deprivation'],
    'nausea': ['Food poisoning', 'Gastroenteritis', 'Migraine', 'Pregnancy']
  };

  const possibleConditions = [];
  symptoms.forEach(symptom => {
    const lowerSymptom = symptom.toLowerCase();
    if (commonConditions[lowerSymptom]) {
      possibleConditions.push(...commonConditions[lowerSymptom]);
    }
  });

  // Remove duplicates and limit results
  const uniqueConditions = [...new Set(possibleConditions)].slice(0, 5);

  return {
    possibleConditions,
    recommendations: [
      'Rest and stay hydrated',
      'Monitor your symptoms',
      'Over-the-counter medications may help with mild symptoms',
      'Seek medical attention if symptoms worsen'
    ],
    severity: severity || 'moderate',
    duration: duration || 'unknown'
  };
}

function getEmergencyWarning(symptoms, severity) {
  const emergencySymptoms = [
    'chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness',
    'confusion', 'slurred speech', 'numbness', 'vision changes', 'severe bleeding'
  ];

  const hasEmergencySymptom = symptoms.some(symptom => 
    emergencySymptoms.some(emergency => 
      symptom.toLowerCase().includes(emergency.toLowerCase())
    )
  );

  if (hasEmergencySymptom || severity === 'severe') {
    return {
      level: 'high',
      message: 'Seek immediate medical attention or call emergency services.',
      reasons: ['Your symptoms may indicate a serious medical condition']
    };
  }

  return {
    level: 'low',
    message: 'Monitor your symptoms and seek medical care if they worsen.'
  };
}

function getMedicalInfo(condition) {
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

  return medicalDatabase[condition.toLowerCase()] || {
    description: 'Information not available in our database.',
    symptoms: [],
    treatments: [],
    whenToSeeDoctor: 'Consult a healthcare professional for accurate information'
  };
}

// Smart Triage Function
function performSmartTriage(symptoms, duration, severity, answers) {
    const emergencySymptoms = [
        'chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness',
        'confusion', 'slurred speech', 'numbness', 'vision changes', 'severe bleeding'
    ];

    const urgentSymptoms = [
        'high fever', 'persistent vomiting', 'severe abdominal pain', 'dehydration',
        'difficulty walking', 'dizziness', 'fainting'
    ];

    // Check for emergency symptoms
    const hasEmergencySymptom = symptoms.some(symptom => 
        emergencySymptoms.some(emergency => 
            symptom.toLowerCase().includes(emergency.toLowerCase())
        )
    );

    if (hasEmergencySymptom || severity === 'severe') {
        return {
            triageLevel: 'EMERGENCY',
            urgency: 'immediate',
            action: 'Go to Emergency Room or call 1122 immediately',
            followUpQuestions: [],
            explanation: 'Your symptoms may indicate a life-threatening condition requiring immediate medical attention.',
            color: 'red'
        };
    }

    // Check for urgent symptoms
    const hasUrgentSymptom = symptoms.some(symptom => 
        urgentSymptoms.some(urgent => 
            symptom.toLowerCase().includes(urgent.toLowerCase())
        )
    );

    if (hasUrgentSymptom || severity === 'moderate' || (duration && duration.includes('week'))) {
        return {
            triageLevel: 'URGENT',
            urgency: 'within 24 hours',
            action: 'See a doctor within 24 hours',
            followUpQuestions: getFollowUpQuestions(symptoms),
            explanation: 'Your symptoms require medical attention soon to prevent complications.',
            color: 'orange'
        };
    }

    // Home care with follow-up questions
    return {
        triageLevel: 'HOME_CARE',
        urgency: 'monitor',
        action: 'Home care with monitoring',
        followUpQuestions: getFollowUpQuestions(symptoms),
        explanation: 'Your symptoms can likely be managed at home, but monitor for changes.',
        color: 'green',
        recommendations: [
            'Rest and stay hydrated',
            'Monitor your symptoms',
            'Over-the-counter medications may help',
            'Seek medical care if symptoms worsen'
        ]
    };
}

// Get follow-up questions based on symptoms
function getFollowUpQuestions(symptoms) {
    const questions = [];
    
    symptoms.forEach(symptom => {
        const lowerSymptom = symptom.toLowerCase();
        
        if (lowerSymptom.includes('fever')) {
            questions.push({
                id: 'fever_stiff_neck',
                question: 'کیا آپ کو بخار کے ساتھ گردن میں سختی محسوس ہو رہی ہے؟ (Do you have a stiff neck with fever?)',
                options: ['ہاں (Yes)', 'نہیں (No)']
            });
            questions.push({
                id: 'fever_rash',
                question: 'کیا آپ کو جلد پر کوئی چھالا یا rash ہے؟ (Do you have any skin rashes?)',
                options: ['ہاں (Yes)', 'نہیں (No)']
            });
        }
        
        if (lowerSymptom.includes('headache')) {
            questions.push({
                id: 'headache_location',
                question: 'سر درد کہاں ہے؟ (Where is the headache located?)',
                options: ['فورہڈ (Forehead)', 'ایک طرف (One side)', 'پورے سر میں (Whole head)', 'پچھلی طرف (Back of head)']
            });
            questions.push({
                id: 'headache_vision',
                question: 'کیا آپ کو نظر میں کوئی تبدیلی محسوس ہو رہی ہے؟ (Are you experiencing vision changes?)',
                options: ['ہاں (Yes)', 'نہیں (No)']
            });
        }
        
        if (lowerSymptom.includes('cough')) {
            questions.push({
                id: 'cough_type',
                question: 'کھانسی کی قسم کیا ہے؟ (What type of cough do you have?)',
                options: ['خشک (Dry)', 'بلغم والی (With phlegm)', 'خون والی (With blood)', 'رات میں زیادہ (Worse at night)']
            });
            questions.push({
                id: 'cough_breath',
                question: 'کیا آپ کو سانس لینے میں تکلیف ہو رہی ہے؟ (Are you having difficulty breathing?)',
                options: ['ہاں (Yes)', 'نہیں (No)']
            });
        }
        
        if (lowerSymptom.includes('abdominal') || lowerSymptom.includes('stomach')) {
            questions.push({
                id: 'abdomen_location',
                question: 'پیٹ کے درد کہاں ہیں؟ (Where is the abdominal pain located?)',
                options: ['دائیں طرف (Right side)', 'بائیں طرف (Left side)', 'مرکز میں (Center)', 'تمام پیٹ میں (Entire abdomen)']
            });
            questions.push({
                id: 'abdomen_type',
                question: 'درد کی نوعیت کیا ہے؟ (What is the nature of the pain?)',
                options: ['جلن (Burning)', 'درد (Sharp)', 'کھچڑ (Cramping)', 'دباؤ (Pressure)']
            });
        }
    });
    
    return questions.slice(0, 5); // Limit to 5 questions
}

// Lab Report Interpreter (Simplified version)
async function interpretLabReport(imagePath) {
    try {
        // In a real implementation, this would use OCR to extract text from the image
        // For now, we'll simulate the interpretation
        
        const sampleResults = {
            'CBC': {
                'Hemoglobin': { value: '12.5 g/dL', normal: '12-16 g/dL', status: 'normal' },
                'WBC': { value: '8000/μL', normal: '4000-11000/μL', status: 'normal' },
                'Platelets': { value: '250,000/μL', normal: '150,000-450,000/μL', status: 'normal' }
            },
            'Blood Sugar': {
                'Fasting': { value: '110 mg/dL', normal: '70-100 mg/dL', status: 'high', urdu: 'آپ کا فاسٹنگ شوگر لول نارمل سے زیادہ ہے' },
                'Random': { value: '145 mg/dL', normal: '70-140 mg/dL', status: 'normal' }
            },
            'Lipid Profile': {
                'Cholesterol': { value: '220 mg/dL', normal: '<200 mg/dL', status: 'high', urdu: 'آپ کا کولیسٹرول لول زیادہ ہے' },
                'Triglycerides': { value: '180 mg/dL', normal: '<150 mg/dL', status: 'high', urdu: 'آپ کی ٹرائیگلائسرائیڈ لول زیادہ ہے' }
            }
        };

        return {
            extractedData: sampleResults,
            summary: 'آپ کے کچھ ٹیسٹ نارمل ہیں، لیکن شوگر اور کولیسٹرول لول کنٹرول میں رکھنے کی ضرورت ہے۔',
            recommendations: [
                'ڈاکٹر سے مشورہ کریں',
                'ڈائیٹ میں تبدیلی کریں',
                'ریگولر چیک اپ کروائیں'
            ],
            flaggedValues: ['Fasting Blood Sugar', 'Total Cholesterol', 'Triglycerides']
        };
    } catch (error) {
        throw new Error('Failed to interpret lab report');
    }
}

// Pharmacy Price Comparison
async function getPharmacyPrices(medicine) {
    // Simulated pharmacy prices in Pakistan
    const pharmacyData = {
        'panadol': {
            'D. Watson': 'Rs. 120',
            'Shaheen Pharmacy': 'Rs. 115',
            'Fazal Din': 'Rs. 125',
            'Servaid': 'Rs. 130'
        },
        'disprin': {
            'D. Watson': 'Rs. 45',
            'Shaheen Pharmacy': 'Rs. 42',
            'Fazal Din': 'Rs. 48',
            'Servaid': 'Rs. 50'
        },
        'augmentin': {
            'D. Watson': 'Rs. 450',
            'Shaheen Pharmacy': 'Rs. 440',
            'Fazal Din': 'Rs. 460',
            'Servaid': 'Rs. 470'
        }
    };

    const medicineKey = medicine.toLowerCase();
    return pharmacyData[medicineKey] || {
        'D. Watson': 'Rs. 100',
        'Shaheen Pharmacy': 'Rs. 95',
        'Fazal Din': 'Rs. 105',
        'Servaid': 'Rs. 110'
    };
}

// Welfare Hospitals Finder
async function getWelfareHospitals(city) {
    const hospitals = {
        'rawalpindi': [
            {
                name: 'Benazir Bhutto Hospital',
                address: 'Saddar, Rawalpindi',
                services: ['Sehat Insaf Card', 'Emergency', 'General Medicine'],
                phone: '051-9290200',
                timing: '24/7 Emergency'
            },
            {
                name: 'Holy Family Hospital',
                address: 'Satellite Town, Rawalpindi',
                services: ['Sehat Insaf Card', 'Bait-ul-Maal', 'Surgery', 'Maternity'],
                phone: '051-9290300',
                timing: '24/7 Emergency'
            },
            {
                name: 'District Headquarters Hospital',
                address: 'Rawalpindi Cantonment',
                services: ['Sehat Insaf Card', 'Emergency', 'Specialist OPD'],
                phone: '051-9270500',
                timing: '24/7 Emergency'
            }
        ],
        'islamabad': [
            {
                name: 'Pakistan Institute of Medical Sciences (PIMS)',
                address: 'G-8/3, Islamabad',
                services: ['Sehat Insaf Card', 'Emergency', 'All Specialties'],
                phone: '051-9265500',
                timing: '24/7 Emergency'
            },
            {
                name: 'Polyclinic Hospital',
                address: 'G-8 Markaz, Islamabad',
                services: ['Sehat Insaf Card', 'General Medicine', 'Pediatrics'],
                phone: '051-9255500',
                timing: '24/7 Emergency'
            }
        ]
    };

    return hospitals[city.toLowerCase()] || hospitals['rawalpindi'];
}

// Home Remedies (Gharelu Totkay)
async function getHomeRemedies(condition) {
    const remedies = {
        'cough': [
            {
                remedy: 'شہد اور ادرک (Honey and Ginger)',
                instructions: 'ایک چمچ شہد میں ادرک کا رس ملا کر روزانہ دو بار لیں',
                warning: 'بچوں کو 1 سال سے کم عمر میں شہد نہ دیں',
                verified: true
            },
            {
                remedy: 'گرم پانی میں نمک (Warm Salt Water)',
                instructions: 'گارگل کرنے سے گلے کی خراش سے ریلیف ملتا ہے',
                warning: 'زیادہ استعمال نہ کریں',
                verified: true
            }
        ],
        'headache': [
            {
                remedy: 'لیموں کا رس (Lemon Juice)',
                instructions: 'لیموں کا رس پانی میں ملا کر پیئیں',
                warning: 'خالی پیٹ نہ پیئیں اگر آپ کو ایسڈیٹی ہے',
                verified: true
            },
            {
                remedy: ' آرام کرنا (Rest)',
                instructions: 'ہلکے روشنی میں آرام کریں اور آنکھیں بند کریں',
                warning: 'اگر سر درد شدید ہو تو ڈاکٹر سے رابطہ کریں',
                verified: true
            }
        ],
        'fever': [
            {
                remedy: 'پانی زیادہ پیئیں (Increase Fluid Intake)',
                instructions: 'پانی، نیمبو پانی، یا اورانج جوس پیئیں',
                warning: 'ڈیہائیڈریشن سے بچنے کے لیے ضروری ہے',
                verified: true
            },
            {
                remedy: 'کمپریس (Cold Compress)',
                instructions: 'سر اور ہاتھ پاؤں پر ٹھنڈا پانی کا پٹا رکھیں',
                warning: 'بہت ٹھنڈا پانی نہ استعمال کریں',
                verified: true
            }
        ]
    };

    return remedies[condition.toLowerCase()] || [];
}

// WhatsApp Medication Reminder
async function setMedicationReminder(phoneNumber, medicationName, dosage, frequency, times) {
    // In a real implementation, this would integrate with Twilio WhatsApp API
    // For now, we'll simulate the reminder setup
    
    const reminder = {
        id: Date.now(),
        phoneNumber: phoneNumber,
        medicationName: medicationName,
        dosage: dosage,
        frequency: frequency,
        times: times,
        status: 'active',
        nextReminder: times[0] || 'Not specified',
        message: `آپ کی دوا ${medicationName} (${dosage}) کا وقت ہو گیا ہے۔ براہ کرم دوا لیں۔`
    };

    return reminder;
}

// Find Specialist (Sehat Connect)
async function findSpecialists(specialty, city) {
    const specialists = {
        'cardiologist': [
            {
                name: 'Dr. Ahmed Khan',
                qualification: 'MBBS, FCPS (Cardiology)',
                hospital: 'Rawalpindi Institute of Cardiology',
                experience: '15 years',
                rating: '4.8/5',
                consultationFee: 'Rs. 2000',
                phone: '051-1234567'
            },
            {
                name: 'Dr. Sara Ahmed',
                qualification: 'MBBS, MRCP (UK)',
                hospital: 'Benazir Bhutto Hospital',
                experience: '10 years',
                rating: '4.7/5',
                consultationFee: 'Rs. 1500',
                phone: '051-7654321'
            }
        ],
        'general physician': [
            {
                name: 'Dr. Muhammad Ali',
                qualification: 'MBBS, FCPS (Medicine)',
                hospital: 'District Headquarters Hospital',
                experience: '12 years',
                rating: '4.6/5',
                consultationFee: 'Rs. 800',
                phone: '051-9876543'
            }
        ]
    };

    return specialists[specialty.toLowerCase()] || [];
}

app.listen(PORT, () => {
  console.log(`TABEEB AI server running on port ${PORT}`);
});
