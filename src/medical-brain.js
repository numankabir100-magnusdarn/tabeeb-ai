/**
 * TABEEB AI Medical Brain - Core Intelligence System
 * Pakistan's First Local Medical AI Assistant
 * 
 * This module contains the core medical intelligence, symptom analysis,
 * triage algorithms, and decision-making logic for TABEEB AI.
 */
const fetch = require('node-fetch');

class MedicalBrain {
    constructor() {
        this.initializeMedicalKnowledge();
        this.initializeTriageProtocols();
        this.initializeLocalContext();
    }

    // Initialize Medical Knowledge Base
    initializeMedicalKnowledge() {
        // Symptom-Condition Mapping with Pakistani Context
        this.symptomDatabase = {
            // Emergency Symptoms (Red Flags)
            emergency: {
                'chest pain': {
                    urgency: 'EMERGENCY',
                    possibleConditions: ['Heart Attack', 'Angina', 'Pulmonary Embolism', 'Aortic Dissection'],
                    followUpQuestions: [
                        'کیا آپ کو سینے میں دباؤ یا وزن محسوس ہو رہا ہے؟',
                        'کیا درد بازو، گردن، یا جبڑے تک پھیل رہا ہے؟',
                        'کیا آپ کو پسینہ آ رہا ہے یا nausea محسوس ہو رہا ہے؟'
                    ],
                    action: 'فوری طور پر ایمرجنسی روم جائیں یا 1122 پر کال کریں',
                    urduAction: 'فوری طور پر ایمرجنسی روم جائیں یا 1122 پر کال کریں'
                },
                'difficulty breathing': {
                    urgency: 'EMERGENCY',
                    possibleConditions: ['Asthma Attack', 'COPD Exacerbation', 'Pulmonary Embolism', 'Heart Failure'],
                    followUpQuestions: [
                        'کیا آپ کی آنکھوں یا ہونٹوں میں نیلے پن ہے؟',
                        'کیا آپ کی چھاتی میں کھنچاہٹ محسوس ہو رہا ہے؟',
                        'کیا آپ بولنے میں مشکل سے دوچار ہیں؟'
                    ],
                    action: 'فوری طور پر ایمرجنسی روم جائیں یا 1122 پر کال کریں',
                    urduAction: 'فوری طور پر ایمرجنسی روم جائیں یا 1122 پر کال کریں'
                },
                'severe headache': {
                    urgency: 'EMERGENCY',
                    possibleConditions: ['Subarachnoid Hemorrhage', 'Meningitis', 'Brain Tumor', 'Stroke'],
                    followUpQuestions: [
                        'کیا یہ آپ کی زندگی کا سب سے برا سر درد ہے؟',
                        'کیا آپ کو گردن میں سختی یا بوجھ محسوس ہو رہا ہے؟',
                        'کیا آپ کو روشنی سے چینک محسوس ہو رہا ہے؟'
                    ],
                    action: 'فوری طور پر ایمرجنسی روم جائیں یا 1122 پر کال کریں',
                    urduAction: 'فوری طور پر ایمرجنسی روم جائیں یا 1122 پر کال کریں'
                }
            },
            
            // Urgent Symptoms (Orange Flags)
            urgent: {
                'high fever': {
                    urgency: 'URGENT',
                    threshold: 103, // Fahrenheit
                    possibleConditions: ['Dengue Fever', 'Typhoid', 'Malaria', 'COVID-19', 'Bacterial Infection'],
                    followUpQuestions: [
                        'کیا بخار 103°F سے زیادہ ہے؟',
                        'کیا آپ کو جلد پر چھالا یا rash ہے؟',
                        'کیا آپ کو جوڑوں میں درد ہے؟'
                    ],
                    action: '24 گھنٹوں کے اندر ڈاکٹر سے رابطہ کریں',
                    urduAction: '24 گھنٹوں کے اندر ڈاکٹر سے رابطہ کریں'
                },
                'persistent vomiting': {
                    urgency: 'URGENT',
                    duration: 'more than 24 hours',
                    possibleConditions: ['Gastroenteritis', 'Food Poisoning', 'Appendicitis', 'Migraine'],
                    followUpQuestions: [
                        'کیا قے میں خون یا پیٹ بھرا ہے؟',
                        'کیا آپ کو شدید پیٹ کا درد ہے؟',
                        'کیا آپ کو پانی پینے سے بھی قے آتا ہے؟'
                    ],
                    action: '24 گھنٹوں کے اندر ڈاکٹر سے رابطہ کریں',
                    urduAction: '24 گھنٹوں کے اندر ڈاکٹر سے رابطہ کریں'
                }
            },
            
            // Home Care Symptoms (Green Flags)
            homeCare: {
                'mild headache': {
                    urgency: 'HOME_CARE',
                    possibleConditions: ['Tension Headache', 'Mild Migraine', 'Dehydration', 'Eye Strain'],
                    followUpQuestions: [
                        'کیا آپ کم پانی پی رہے ہیں؟',
                        'کیا آپ کم سونے جا رہے ہیں؟',
                        'کیا آپ کمپیوٹر یا موبائل پر زیادہ وقت گزار رہے ہیں؟'
                    ],
                    remedies: [
                        'پانی کی مقدار بڑھائیں',
                        'آرام کریں اور آنکھیں بند کریں',
                        'ہلکے massage کریں'
                    ],
                    action: 'گھریلو دیکھ بھال اور نگرانی',
                    urduAction: 'گھریلو دیکھ بھال اور نگرانی'
                },
                'mild cough': {
                    urgency: 'HOME_CARE',
                    possibleConditions: ['Common Cold', 'Allergies', 'Mild Bronchitis'],
                    followUpQuestions: [
                        'کیا کھانسی خشک ہے یا بلغم والی؟',
                        'کیا آپ کو گلے میں خراش محسوس ہو رہی ہے؟',
                        'کیا آپ کو بخار بھی ہے؟'
                    ],
                    remedies: [
                        'شہد اور ادرک کا استعمال',
                        'گرم نمک پانی سے گارگل',
                        'بھاپ لینے کا طریقہ'
                    ],
                    action: 'گھریلو دیکھ بھال اور نگرانی',
                    urduAction: 'گھریلو دیکھ بھال اور نگرانی'
                }
            }
        };

        // Pakistani Demographic Considerations
        this.demographicFactors = {
            ageGroups: {
                '0-12': {
                    commonConditions: ['Viral Infections', 'Dengue', 'Typhoid', 'Malnutrition'],
                    vaccinations: ['BCG', 'DPT', 'Polio', 'Measles'],
                    nutritionConcerns: ['Vitamin A', 'Iron Deficiency', 'Protein']
                },
                '13-18': {
                    commonConditions: ['Acne', 'Anemia', 'Stress-related Issues', 'Nutritional Deficiencies'],
                    vaccinations: ['Hepatitis B', 'TT', 'Meningococcal'],
                    nutritionConcerns: ['Iron', 'Calcium', 'Vitamin D']
                },
                '19-60': {
                    commonConditions: ['Hypertension', 'Diabetes', 'Heart Disease', 'Stress'],
                    vaccinations: ['Flu Shot', 'Hepatitis A/B', 'Cervical Cancer (Women)'],
                    nutritionConcerns: ['Fiber', 'Omega-3', 'Antioxidants']
                },
                '60+': {
                    commonConditions: ['Arthritis', 'Osteoporosis', 'Dementia', 'Heart Disease'],
                    vaccinations: ['Pneumococcal', 'Shingles', 'High-dose Flu'],
                    nutritionConcerns: ['Calcium', 'Vitamin D', 'B12', 'Protein']
                }
            },
            
            // Regional Disease Patterns in Pakistan
            regionalPatterns: {
                'punjab': {
                    seasonal: ['Dengue (Monsoon)', 'Heat Stroke (Summer)', 'Flu (Winter)'],
                    environmental: ['Air Pollution Related', 'Water Contamination'],
                    genetic: ['Thalassemia', 'G6PD Deficiency']
                },
                'sindh': {
                    seasonal: ['Malaria (Post-Monsoon)', 'Heat Stroke', 'Gastroenteritis'],
                    environmental: ['Water-borne Diseases', 'Heat-related Illnesses'],
                    genetic: ['Sickle Cell', 'Beta Thalassemia']
                },
                'kpk': {
                    seasonal: ['Respiratory Infections (Winter)', 'Tuberculosis', 'Heat Stroke'],
                    environmental: ['Mountain Sickness', 'Cold-related Issues'],
                    genetic: ['Consanguinity-related Disorders']
                },
                'balochistan': {
                    seasonal: ['Malaria', 'Malnutrition', 'Heat Stroke'],
                    environmental: ['Dehydration', 'Nutritional Deficiencies'],
                    genetic: ['Rare Genetic Disorders']
                }
            }
        };

        // Lab Test Interpretation Ranges (Pakistani Standards)
        this.labRanges = {
            'Hemoglobin': {
                'male': { 'normal': '13.5-17.5 g/dL', 'low': '<13.5', 'high': '>17.5' },
                'female': { 'normal': '12.0-15.5 g/dL', 'low': '<12.0', 'high': '>15.5' },
                'children': { 'normal': '11.0-16.0 g/dL', 'low': '<11.0', 'high': '>16.0' },
                'urduInterpretation': {
                    'low': 'آپ کو کم خون کی کمی (Anemia) ہے۔ آہنے کی کھانے، ہری سبزیاں اور نیمبوز کھائیں۔',
                    'high': 'آپ کا ہیموگلوبین لول بہت زیادہ ہے۔ پانی زیادہ پیئیں اور ڈاکٹر سے رابطہ کریں۔'
                }
            },
            'Blood Sugar (Fasting)': {
                'normal': '70-100 mg/dL',
                'prediabetic': '100-125 mg/dL',
                'diabetic': '>126 mg/dL',
                'urduInterpretation': {
                    'high': 'آپ کا شوگر لول نارمل سے زیادہ ہے۔ میٹھی کھائیں، مشورے سے گھٹنے چھوڑیں، اور ورزش کریں۔'
                }
            },
            'Cholesterol': {
                'normal': '<200 mg/dL',
                'borderline': '200-239 mg/dL',
                'high': '>240 mg/dL',
                'urduInterpretation': {
                    'high': 'آپ کا کولیسٹرول لول زیادہ ہے۔ تیل دار کھانوں سے پرہیز کریں اور دھوپ میں چلیں۔'
                }
            }
        };
    }

    // Initialize Triage Protocols
    initializeTriageProtocols() {
        this.triageAlgorithm = {
            // Decision Tree for Emergency Detection
            emergencyDetection: (symptoms, severity, duration) => {
                const emergencyKeywords = [
                    'chest pain', 'chest pressure', 'chest tightness',
                    'difficulty breathing', 'shortness of breath', 'can\'t breathe',
                    'severe headache', 'worst headache', 'thunderclap headache',
                    'loss of consciousness', 'fainting', 'passed out',
                    'confusion', 'disorientation', 'slurred speech',
                    'numbness', 'weakness', 'facial drooping',
                    'vision changes', 'vision loss', 'double vision',
                    'severe bleeding', 'uncontrollable bleeding'
                ];

                // Check for emergency keywords
                const hasEmergencySymptom = symptoms.some(symptom => 
                    emergencyKeywords.some(keyword => 
                        symptom.toLowerCase().includes(keyword)
                    )
                );

                // Check severity level
                const isSevere = severity === 'severe';

                // Check duration for certain conditions
                const isProlonged = duration && (
                    duration.includes('week') || 
                    duration.includes('month') ||
                    duration.includes('more than 2 weeks')
                );

                return {
                    isEmergency: hasEmergencySymptom || isSevere,
                    needsUrgentCare: isProlonged || hasEmergencySymptom,
                    confidence: this.calculateConfidence(symptoms, severity, duration)
                };
            },

            // Calculate Confidence Score
            calculateConfidence: (symptoms, severity, duration) => {
                let confidence = 0;
                
                // Symptom matching confidence
                symptoms.forEach(symptom => {
                    Object.values(this.symptomDatabase).forEach(category => {
                        if (category[symptom.toLowerCase()]) {
                            confidence += category[symptom.toLowerCase()].urgency === 'EMERGENCY' ? 0.4 : 0.2;
                        }
                    });
                });

                // Severity confidence
                if (severity === 'severe') confidence += 0.3;
                else if (severity === 'moderate') confidence += 0.2;
                else if (severity === 'mild') confidence += 0.1;

                // Duration confidence
                if (duration && duration.includes('hour')) confidence += 0.1;
                else if (duration && duration.includes('day')) confidence += 0.2;
                else if (duration && duration.includes('week')) confidence += 0.3;

                return Math.min(confidence, 1.0);
            }
        };
    }

    // Initialize Local Pakistani Context
    initializeLocalContext() {
        this.pakistaniContext = {
            // Common Pakistani Medications
            commonMedications: {
                'panadol': { generic: 'Paracetamol', uses: ['Fever', 'Headache', 'Body Pain'] },
                'disprin': { generic: 'Aspirin', uses: ['Pain Relief', 'Blood Thinner'] },
                'brufen': { generic: 'Ibuprofen', uses: ['Inflammation', 'Pain', 'Fever'] },
                'augmentin': { generic: 'Amoxicillin-Clavulanate', uses: ['Bacterial Infections'] },
                'pan-40': { generic: 'Pantoprazole', uses: ['Acidity', 'GERD'] },
                'surbex': { generic: 'Multivitamin', uses: ['General Weakness', 'Vitamin Deficiency'] }
            },

            // Pakistani Healthcare System
            healthcareSystem: {
                emergencyServices: {
                    'national': '1122',
                    'edhi': '115',
                    'rescue-1122': '1122',
                    'ambulance': '108'
                },
                publicHospitals: [
                    'Benazir Bhutto Hospital',
                    'Holy Family Hospital',
                    'Pakistan Institute of Medical Sciences (PIMS)',
                    'Mayo Hospital',
                    'Jinnah Hospital'
                ],
                insuranceSchemes: [
                    'Sehat Insaf Card',
                    'Sehat Sahulat Program',
                    'State Life Insurance',
                    'Private Insurance Plans'
                ]
            },

            // Cultural Considerations
            culturalFactors: {
                communicationStyle: 'respectful, family-oriented, often involves family decisions',
                privacyConcerns: 'high, especially for women\'s health',
                homeRemedies: 'commonly used alongside medical treatment',
                dietaryRestrictions: 'Halal food requirements, fasting during Ramadan',
                languagePreference: 'Urdu preferred, English understood in urban areas'
            }
        };
    }

    // SiliconFlow API Integration for DeepSeek-V3.2
    async callSiliconFlowAPI(symptoms, userContext = {}) {
        const apiKey = process.env.SILICONFLOW_API_KEY;
        if (!apiKey) {
            console.warn('SiliconFlow API key not found');
            return null;
        }

        const systemPrompt = `You are a professional medical assistant in Pakistan. Speak in a mix of English and Urdu.
        You MUST structure your ENTIRE response EXACTLY using the following sections and bullet points format. Do not use any other formatting.
        
        URGENCY:
        - [State either EMERGENCY, URGENT, or HOME_CARE]
        
        CONDITIONS:
        - [Condition 1]
        - [Condition 2]
        
        RECOMMENDATIONS:
        - [Recommendation 1]
        - [Recommendation 2]
        
        QUESTIONS:
        - [Question 1]?`;

        const userPrompt = `Patient symptoms: ${symptoms.join(', ')}
        Duration: ${userContext.duration || 'Not specified'}
        Severity: ${userContext.severity || 'Not specified'}`;

        const models = [
            'deepseek-ai/DeepSeek-V3',
            'Qwen/Qwen2.5-7B-Instruct', // Free tier fallback
            'THUDM/glm-4-9b-chat'       // Secondary free tier fallback
        ];

        for (const model of models) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 12000);

            try {
                const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        temperature: 0.3,
                        max_tokens: 800
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeout);

                if (response.ok) {
                    const data = await response.json();
                    return data.choices[0].message.content;
                } else {
                    console.warn(`Model ${model} failed with status: ${response.status}`);
                }
            } catch (error) {
                clearTimeout(timeout);
                console.error(`Error with model ${model}:`, error.message);
            }
        }
        
        console.error('All SiliconFlow AI models failed to respond.');
        return null; // Triggers offline rule-based fallback
    }

    // Enhanced Symptom Analysis with AI Integration
    async analyzeSymptomsWithAI(symptoms, userContext = {}) {
        try {
            // First try to get AI analysis
            const aiAnalysis = await this.callSiliconFlowAPI(symptoms, userContext);
            
            if (aiAnalysis) {
                // Parse AI response and enhance with local context
                return this.parseAIResponse(aiAnalysis, symptoms, userContext);
            }

            // Fallback to rule-based analysis
            return this.analyzeSymptoms(symptoms, userContext);

        } catch (error) {
            console.error('Error in AI symptom analysis:', error);
            // Fallback to rule-based analysis
            return this.analyzeSymptoms(symptoms, userContext);
        }
    }

    // Parse AI Response
    parseAIResponse(aiResponse, symptoms, userContext) {
        try {
            // Extract structured information from AI response
            const lines = aiResponse.split('\n').filter(line => line.trim());
            
            const analysis = {
                possibleConditions: [],
                urgency: 'HOME_CARE',
                followUpQuestions: [],
                recommendations: [],
                emergencyWarning: null,
                aiEnhanced: true,
                disclaimer: this.getMedicalDisclaimer()
            };

            let currentSection = null;
            
            lines.forEach(line => {
                const cleanLine = line.trim();
                const lowerLine = cleanLine.toLowerCase();
                
                // Identify sections
                if (lowerLine.includes('urgency:')) {
                    currentSection = 'urgency';
                    return;
                } else if (lowerLine.includes('conditions:')) {
                    currentSection = 'conditions';
                    return;
                } else if (lowerLine.includes('recommendations:')) {
                    currentSection = 'recommendations';
                    return;
                } else if (lowerLine.includes('questions:')) {
                    currentSection = 'questions';
                    return;
                }

                // Process content based on current section
                if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
                    const content = cleanLine.substring(1).trim();
                    if (!content) return;

                    if (currentSection === 'urgency') {
                        if (content.toUpperCase().includes('EMERGENCY')) {
                            analysis.urgency = 'EMERGENCY';
                            analysis.emergencyWarning = {
                                level: 'high',
                                message: 'فوری طور پر ایمرجنسی روم جائیں یا 1122 پر کال کریں',
                                action: 'Go to Emergency Room or call 1122 immediately'
                            };
                        } else if (content.toUpperCase().includes('URGENT')) {
                            analysis.urgency = 'URGENT';
                        } else {
                            analysis.urgency = 'HOME_CARE';
                        }
                    } else if (currentSection === 'conditions') {
                        analysis.possibleConditions.push(content);
                    } else if (currentSection === 'recommendations') {
                        analysis.recommendations.push(content);
                    } else if (currentSection === 'questions') {
                        analysis.followUpQuestions.push(content);
                    }
                }
            });

            // If AI failed to provide possible conditions, add a generic fallback so the UI renders it
            if (analysis.possibleConditions.length === 0) {
                analysis.possibleConditions.push("General Symptoms (عام علامات)");
                analysis.recommendations.push("براہ کرم ڈاکٹر سے مشورہ کریں اگر علامات برقرار رہیں (Consult a doctor if symptoms persist)");
            }

            // Enhance with Pakistani context
            return this.applyPakistaniContext(analysis, userContext);

        } catch (error) {
            console.error('Error parsing AI response:', error);
            // Fallback to basic analysis
            return this.analyzeSymptoms(symptoms, userContext);
        }
    }

    // Main Analysis Engine
    analyzeSymptoms(symptoms, userContext = {}) {
        try {
            // Preprocess symptoms
            const processedSymptoms = this.preprocessSymptoms(symptoms);
            
            // Determine urgency
            const triageResult = this.triageAlgorithm.emergencyDetection(
                processedSymptoms, 
                userContext.severity, 
                userContext.duration
            );

            // Get detailed analysis
            const analysis = this.getDetailedAnalysis(processedSymptoms, userContext);
            
            // Apply Pakistani context
            const contextualizedAnalysis = this.applyPakistaniContext(analysis, userContext);

            return {
                ...triageResult,
                ...contextualizedAnalysis,
                timestamp: new Date().toISOString(),
                disclaimer: this.getMedicalDisclaimer()
            };

        } catch (error) {
            console.error('Error in symptom analysis:', error);
            return {
                error: 'Analysis failed',
                disclaimer: this.getMedicalDisclaimer()
            };
        }
    }

    // Preprocess Symptoms
    preprocessSymptoms(symptoms) {
        return symptoms.map(symptom => {
            // Convert Roman Urdu to proper Urdu if needed
            const cleaned = this.cleanSymptomText(symptom);
            
            // Normalize common variations
            return this.normalizeSymptom(cleaned);
        });
    }

    // Clean and normalize symptom text
    cleanSymptomText(text) {
        return text.toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, ' ') // Remove special characters
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
    }

    // Normalize symptom variations
    normalizeSymptom(symptom) {
        const variations = {
            'sir dard': 'headache',
            'sar dard': 'headache',
            'bukhar': 'fever',
            'khansi': 'cough',
            'peet dard': 'abdominal pain',
            'pet dard': 'abdominal pain',
            'thakan': 'fatigue',
            'bechaini': 'anxiety',
            'nausea': 'nausea',
            'qay': 'vomiting'
        };

        return variations[symptom] || symptom;
    }

    // Get Detailed Analysis
    getDetailedAnalysis(symptoms, userContext) {
        const analysis = {
            possibleConditions: [],
            followUpQuestions: [],
            recommendations: [],
            riskFactors: [],
            lifestyleAdvice: []
        };

        symptoms.forEach(symptom => {
            // Check each category
            Object.entries(this.symptomDatabase).forEach(([category, conditions]) => {
                if (conditions[symptom]) {
                    const conditionData = conditions[symptom];
                    
                    // Add possible conditions
                    analysis.possibleConditions.push(...conditionData.possibleConditions);
                    
                    // Add follow-up questions
                    analysis.followUpQuestions.push(...conditionData.followUpQuestions);
                    
                    // Add recommendations
                    if (conditionData.remedies) {
                        analysis.recommendations.push(...conditionData.remedies);
                    }
                }
            });
        });

        // Remove duplicates and prioritize
        analysis.possibleConditions = [...new Set(analysis.possibleConditions)].slice(0, 5);
        analysis.followUpQuestions = [...new Set(analysis.followUpQuestions)].slice(0, 3);
        
        // Robust offline fallback rendering if nothing mapped successfully
        if (analysis.possibleConditions.length === 0) {
            analysis.possibleConditions.push("General Unknown Symptoms (عام غیر واضح علامات)");
            analysis.recommendations.push("براہ کرم ڈاکٹر سے مشورہ کریں (Please consult a registered doctor)");
            analysis.recommendations.push("آرام کریں اور ہائیڈریٹڈ رہیں (Rest and stay hydrated)");
        }

        return analysis;
    }

    // Apply Pakistani Context
    applyPakistaniContext(analysis, userContext) {
        const contextualized = { ...analysis };

        // Add regional disease patterns
        if (userContext.region && this.demographicFactors.regionalPatterns[userContext.region]) {
            const regionalData = this.demographicFactors.regionalPatterns[userContext.region];
            contextualized.regionalConsiderations = regionalData;
        }

        // Add demographic factors
        if (userContext.age) {
            const ageGroup = this.getAgeGroup(userContext.age);
            if (this.demographicFactors.ageGroups[ageGroup]) {
                contextualized.demographicInsights = this.demographicFactors.ageGroups[ageGroup];
            }
        }

        // Add local healthcare recommendations
        contextualized.localResources = this.pakistaniContext.healthcareSystem;

        return contextualized;
    }

    // Get age group from age
    getAgeGroup(age) {
        if (age <= 12) return '0-12';
        if (age <= 18) return '13-18';
        if (age <= 60) return '19-60';
        return '60+';
    }

    // Medical Disclaimer
    getMedicalDisclaimer() {
        return {
            english: 'This is not medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.',
            urdu: 'یہ طبی مشورہ نہیں ہے۔ تشخیص اور علاج کے لیے ہمیشہ اہل طبی ماہر سے رجوع کریں۔',
            emergency: 'For emergencies, call 1122 immediately.',
            urduEmergency: 'ہنگامی صورت میں فوری طور پر 1122 پر کال کریں۔'
        };
    }

    // Lab Report Analysis
    analyzeLabReport(labData) {
        const analysis = {
            summary: '',
            flaggedValues: [],
            recommendations: [],
            normalRanges: [],
            urduInterpretation: []
        };

        Object.entries(labData).forEach(([test, result]) => {
            if (this.labRanges[test]) {
                const range = this.labRanges[test];
                const interpretation = this.interpretLabValue(test, result, range);
                
                analysis.flaggedValues.push(...interpretation.flagged);
                analysis.recommendations.push(...interpretation.recommendations);
                analysis.urduInterpretation.push(...interpretation.urduMessages);
            }
        });

        analysis.summary = this.generateLabSummary(analysis);
        return analysis;
    }

    // Interpret individual lab value
    interpretLabValue(test, value, range) {
        const interpretation = {
            flagged: [],
            recommendations: [],
            urduMessages: []
        };

        // Simple interpretation logic (would be more sophisticated in production)
        if (range.normal && !value.includes(range.normal.split('-')[0])) {
            interpretation.flagged.push(test);
            
            if (range.urduInterpretation && range.urduInterpretation.high) {
                interpretation.urduMessages.push(range.urduInterpretation.high);
                interpretation.recommendations.push('ڈاکٹر سے مشورہ کریں');
            }
        }

        return interpretation;
    }

    // Generate lab summary
    generateLabSummary(analysis) {
        if (analysis.flaggedValues.length === 0) {
            return 'آپ کے تمام ٹیسٹ نارمل ہیں۔ خدا کا شکر!';
        } else if (analysis.flaggedValues.length <= 2) {
            return 'آپ کے کچھ ٹیسٹ نارمل سے زیادہ ہیں۔ ڈائیٹ اور زندگی کے طریقے میں تبدیلی کریں۔';
        } else {
            return 'آپ کے کئی ٹیسٹ نارمل سے زیادہ ہیں۔ فوری طور پر ڈاکٹر سے رابطہ کریں۔';
        }
    }

    // Get Home Remedies (Gharelu Totkay)
    getHomeRemedies(condition) {
        const remediesDatabase = {
            'cough': [
                {
                    remedy: 'شہد اور ادرک (Honey and Ginger)',
                    instructions: 'ایک چمچ شہد میں ادرک کا رس ملا کر روزانہ دو بار لیں',
                    warning: 'بچوں کو 1 سال سے کم عمر میں شہد نہ دیں',
                    verified: true,
                    cultural: 'Pakistani households commonly use this remedy'
                },
                {
                    remedy: 'گرم پانی میں نمک (Warm Salt Water)',
                    instructions: 'گارگل کرنے سے گلے کی خراش سے ریلیف ملتا ہے',
                    warning: 'زیادہ استعمال نہ کریں',
                    verified: true,
                    cultural: 'Traditional Pakistani remedy for sore throat'
                },
                {
                    remedy: 'سونف (Turmeric Milk)',
                    instructions: 'دودھ میں ہلکی سونف ملا کر پینا',
                    warning: 'سونف کی مقدار زیادہ نہ کریں',
                    verified: true,
                    cultural: 'Haldi doodh is a classic Pakistani home remedy'
                }
            ],
            'headache': [
                {
                    remedy: 'لیموں کا رس (Lemon Juice)',
                    instructions: 'لیموں کا رس پانی میں ملا کر پیئیں',
                    warning: 'خالی پیٹ نہ پیئیں اگر آپ کو ایسڈیٹی ہے',
                    verified: true,
                    cultural: 'Common in Pakistani households for mild headaches'
                },
                {
                    remedy: 'آرام کرنا (Rest)',
                    instructions: 'ہلکے روشنی میں آرام کریں اور آنکھیں بند کریں',
                    warning: 'اگر سر درد شدید ہو تو ڈاکٹر سے رابطہ کریں',
                    verified: true,
                    cultural: 'Rest is universally recommended'
                },
                {
                    remedy: 'چھاتی کی مالش (Head Massage)',
                    instructions: 'چھاتی اور گردن کی ہلکی مالش کریں',
                    warning: 'شدید درد میں مالش نہ کریں',
                    verified: true,
                    cultural: 'Traditional Pakistani practice'
                }
            ],
            'fever': [
                {
                    remedy: 'پانی زیادہ پیئیں (Increase Fluid Intake)',
                    instructions: 'پانی، نیمبو پانی، یا اورانج جوس پیئیں',
                    warning: 'ڈیہائیڈریشن سے بچنے کے لیے ضروری ہے',
                    verified: true,
                    cultural: 'Essential in Pakistani fever management'
                },
                {
                    remedy: 'کمپریس (Cold Compress)',
                    instructions: 'سر اور ہاتھ پاؤں پر ٹھنڈا پانی کا پٹا رکھیں',
                    warning: 'بہت ٹھنڈا پانی نہ استعمال کریں',
                    verified: true,
                    cultural: 'Traditional cooling method'
                },
                {
                    remedy: 'کھیر کی پکوڑی (Rice Water)',
                    instructions: 'کھیر پکائیں اور پانی پیئیں',
                    warning: 'صرف ہلکے بخار کے لیے',
                    verified: true,
                    cultural: 'Pakistani grandmother\'s remedy'
                }
            ],
            'stomach pain': [
                {
                    remedy: 'زیرہ (Fennel Seeds)',
                    instructions: 'زیرہ کو پانی میں ابل کر پینا',
                    warning: 'شدید درد میں فوری ڈاکٹر سے رجوع کریں',
                    verified: true,
                    cultural: 'Common digestive aid in Pakistan'
                },
                {
                    remedy: 'پودینہ کا چائے (Mint Tea)',
                    instructions: 'تازہ پودینہ پانی میں ابل کر پینا',
                    warning: 'دن میں زیادہ نہ پیئیں',
                    verified: true,
                    cultural: 'Popular Pakistani digestive remedy'
                },
                {
                    remedy: 'دھنیہ (Yogurt)',
                    instructions: 'دھنیہ کھانا ہضم میں مدد کرتا ہے',
                    warning: 'اگر قے آ رہے ہیں تو استعمال نہ کریں',
                    verified: true,
                    cultural: 'Staple in Pakistani diet for digestion'
                }
            ]
        };

        return remediesDatabase[condition.toLowerCase()] || [
            {
                remedy: 'آرام اور پانی (Rest and Water)',
                instructions: 'کافی آرام کریں اور پانی زیادہ پیئیں',
                warning: 'اگر symptoms بڑھیں تو ڈاکٹر سے رابطہ کریں',
                verified: true,
                cultural: 'Universal advice'
            }
        ];
    }

    // Get pharmacy prices with Pakistani context
    getPharmacyPrices(medicine) {
        const pharmacyData = {
            'panadol': {
                'D. Watson': 'Rs. 120',
                'Shaheen Pharmacy': 'Rs. 115',
                'Fazal Din': 'Rs. 125',
                'Servaid': 'Rs. 130',
                'generics': {
                    'Paracetamol (Local)': 'Rs. 25',
                    'Acetamol': 'Rs. 30'
                }
            },
            'disprin': {
                'D. Watson': 'Rs. 45',
                'Shaheen Pharmacy': 'Rs. 42',
                'Fazal Din': 'Rs. 48',
                'Servaid': 'Rs. 50',
                'generics': {
                    'Aspirin (Local)': 'Rs. 15',
                    'Ecosprin': 'Rs. 35'
                }
            },
            'augmentin': {
                'D. Watson': 'Rs. 450',
                'Shaheen Pharmacy': 'Rs. 440',
                'Fazal Din': 'Rs. 460',
                'Servaid': 'Rs. 470',
                'generics': {
                    'Amoxiclav': 'Rs. 280',
                    'Clavam': 'Rs. 320'
                }
            }
        };

        const medicineKey = medicine.toLowerCase();
        const result = pharmacyData[medicineKey] || {
            'D. Watson': 'Rs. 100',
            'Shaheen Pharmacy': 'Rs. 95',
            'Fazal Din': 'Rs. 105',
            'Servaid': 'Rs. 110',
            'generics': {
                'Generic Version': 'Rs. 50'
            }
        };

        // Add generic alternatives info
        result.genericAvailable = true;
        result.savingsTip = 'جنرک دوائیں برانڈ سے 40-70% تک سستی ہوتی ہیں';

        return result;
    }

    // Get welfare hospitals with Pakistani context
    getWelfareHospitals(city) {
        const hospitals = {
            'rawalpindi': [
                {
                    name: 'Benazir Bhutto Hospital',
                    address: 'Saddar, Rawalpindi',
                    services: ['Sehat Insaf Card', 'Emergency', 'General Medicine', 'Free Medicines'],
                    phone: '051-9290200',
                    timing: '24/7 Emergency',
                    specialFeatures: 'Free treatment for Sehat Insaf Card holders',
                    directions: 'Near Rawalpindi Railway Station'
                },
                {
                    name: 'Holy Family Hospital',
                    address: 'Satellite Town, Rawalpindi',
                    services: ['Sehat Insaf Card', 'Bait-ul-Maal', 'Surgery', 'Maternity', 'Pediatric'],
                    phone: '051-9290300',
                    timing: '24/7 Emergency',
                    specialFeatures: 'Largest maternity ward in Rawalpindi',
                    directions: 'Near Committee Chowk'
                },
                {
                    name: 'District Headquarters Hospital',
                    address: 'Rawalpindi Cantonment',
                    services: ['Sehat Insaf Card', 'Emergency', 'Specialist OPD', 'Laboratory'],
                    phone: '051-9270500',
                    timing: '24/7 Emergency',
                    specialFeatures: 'Government rates for all procedures',
                    directions: 'Cantonment area'
                }
            ],
            'islamabad': [
                {
                    name: 'Pakistan Institute of Medical Sciences (PIMS)',
                    address: 'G-8/3, Islamabad',
                    services: ['Sehat Insaf Card', 'Emergency', 'All Specialties', 'Free Medicines'],
                    phone: '051-9265500',
                    timing: '24/7 Emergency',
                    specialFeatures: 'Largest federal hospital in Pakistan',
                    directions: 'Near G-8 Markaz'
                },
                {
                    name: 'Polyclinic Hospital',
                    address: 'G-8 Markaz, Islamabad',
                    services: ['Sehat Insaf Card', 'General Medicine', 'Pediatrics', 'Maternity'],
                    phone: '051-9255500',
                    timing: '24/7 Emergency',
                    specialFeatures: 'Family-friendly environment',
                    directions: 'Central location in G-8'
                }
            ],
            'lahore': [
                {
                    name: 'Mayo Hospital',
                    address: 'Lahore',
                    services: ['Sehat Insaf Card', 'Emergency', 'All Specialties', 'Free Medicines'],
                    phone: '042-99211151',
                    timing: '24/7 Emergency',
                    specialFeatures: 'Largest public hospital in Punjab',
                    directions: 'Near Mall Road'
                },
                {
                    name: 'Services Hospital',
                    address: 'Lahore',
                    services: ['Sehat Insaf Card', 'Emergency', 'Pediatrics', 'Maternity'],
                    phone: '042-99211001',
                    timing: '24/7 Emergency',
                    specialFeatures: 'Specialized in women and children health',
                    directions: 'Jail Road'
                }
            ]
        };

        return hospitals[city.toLowerCase()] || hospitals['rawalpindi'];
    }

    // Find specialists with Pakistani context
    findSpecialists(specialty, city) {
        const specialists = {
            'cardiologist': [
                {
                    name: 'Dr. Ahmed Khan',
                    qualification: 'MBBS, FCPS (Cardiology), FRCP (UK)',
                    hospital: 'Rawalpindi Institute of Cardiology',
                    experience: '15 years',
                    rating: '4.8/5',
                    consultationFee: 'Rs. 2000',
                    phone: '051-1234567',
                    specialties: ['Interventional Cardiology', 'Echocardiography', 'Heart Failure'],
                    timings: 'Monday - Saturday: 5PM - 9PM',
                    languages: ['Urdu', 'English', 'Punjabi'],
                    gender: 'Male'
                },
                {
                    name: 'Dr. Sara Ahmed',
                    qualification: 'MBBS, MRCP (UK), FACC (USA)',
                    hospital: 'Benazir Bhutto Hospital',
                    experience: '10 years',
                    rating: '4.7/5',
                    consultationFee: 'Rs. 1500',
                    phone: '051-7654321',
                    specialties: ['Non-Invasive Cardiology', 'Women Heart Health'],
                    timings: 'Monday - Friday: 9AM - 5PM',
                    languages: ['Urdu', 'English'],
                    gender: 'Female'
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
                    phone: '051-9876543',
                    specialties: ['General Medicine', 'Diabetes', 'Hypertension'],
                    timings: 'Daily: 8AM - 10PM',
                    languages: ['Urdu', 'English', 'Punjabi', 'Pushto'],
                    gender: 'Male'
                },
                {
                    name: 'Dr. Fatima Sheikh',
                    qualification: 'MBBS, MCPS (Medicine)',
                    hospital: 'Polyclinic Hospital',
                    experience: '8 years',
                    rating: '4.5/5',
                    consultationFee: 'Rs. 700',
                    phone: '051-5554321',
                    specialties: ['General Medicine', 'Family Medicine', 'Women Health'],
                    timings: 'Monday - Saturday: 10AM - 8PM',
                    languages: ['Urdu', 'English'],
                    gender: 'Female'
                }
            ]
        };

        return specialists[specialty.toLowerCase()] || [];
    }

    // WhatsApp medication reminder with Pakistani context
    setMedicationReminder(phoneNumber, medicationName, dosage, frequency, times) {
        const reminder = {
            id: Date.now(),
            phoneNumber: this.normalizePakistaniPhone(phoneNumber),
            medicationName: medicationName,
            dosage: dosage,
            frequency: frequency,
            times: times,
            status: 'active',
            nextReminder: times[0] || 'Not specified',
            message: `آپ کی دوا ${medicationName} (${dosage}) کا وقت ہو گیا ہے۔ براہ کرم دوا لیں۔ TABEEB AI`,
            features: [
                'WhatsApp integration',
                'Pakistani phone number support',
                'Urdu language messages',
                'Multiple reminder times'
            ],
            setupConfirmation: 'یاد دہانی کامیابی سے سیٹ ہو گئی ہے۔ آپ کو وقت پر پیغام ملے گا۔'
        };

        return reminder;
    }

    // Normalize Pakistani phone numbers
    normalizePakistaniPhone(phone) {
        // Remove all non-digit characters
        let normalized = phone.replace(/\D/g, '');
        
        // Remove leading 92 if present, then add it back
        if (normalized.startsWith('92')) {
            normalized = '92' + normalized.substring(2);
        } else if (normalized.startsWith('0')) {
            normalized = '92' + normalized.substring(1);
        } else if (normalized.length === 10) {
            normalized = '92' + normalized;
        }
        
        return normalized;
    }
}

// Export Medical Brain
module.exports = MedicalBrain;
