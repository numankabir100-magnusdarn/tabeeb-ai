import './styles.css';

// Utility functions
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

window.showToast = function(message, type = 'error') {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '15px 25px';
    toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
    toast.style.color = 'white';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    toast.style.zIndex = '9999';
    toast.style.transition = 'opacity 0.3s';
    toast.innerHTML = `<strong>${type === 'error' ? 'Error' : 'Success'}:</strong> ${escapeHtml(message)}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const loading = document.getElementById('loading');

// Form elements
const smartTriageForm = document.getElementById('smart-triage-form');
const labReportForm = document.getElementById('lab-report-form');
const pharmacyForm = document.getElementById('pharmacy-form');
const welfareForm = document.getElementById('welfare-form');
const remediesForm = document.getElementById('remedies-form');
const reminderForm = document.getElementById('reminder-form');
const doctorForm = document.getElementById('doctor-form');

// Results sections
const followupQuestions = document.getElementById('followup-questions');
const questionsContent = document.getElementById('questions-content');
const triageResults = document.getElementById('triage-results');
const triageContent = document.getElementById('triage-content');
const labResults = document.getElementById('lab-results');
const labContent = document.getElementById('lab-content');
const pharmacyResults = document.getElementById('pharmacy-results');
const pharmacyContent = document.getElementById('pharmacy-content');
const welfareResults = document.getElementById('welfare-results');
const welfareContent = document.getElementById('welfare-content');
const remediesResults = document.getElementById('remedies-results');
const remediesContent = document.getElementById('remedies-content');
const reminderResults = document.getElementById('reminder-results');
const reminderContent = document.getElementById('reminder-content');
const doctorResults = document.getElementById('doctor-results');
const doctorContent = document.getElementById('doctor-content');

// Store triage answers
let triageAnswers = {};

// Language Management
let currentLanguage = 'english'; // 'english' or 'urdu'

// Language toggle functionality
const langToggleBtn = document.getElementById('langToggle');
if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'english' ? 'urdu' : 'english';
        updateLanguage();
    });
}

function updateLanguage() {
    const langBtn = document.getElementById('langToggle');
    const langText = langBtn.querySelector('.lang-text');
    const body = document.body;
    
    if (currentLanguage === 'urdu') {
        langText.textContent = 'اردو';
        body.classList.add('urdu');
        body.classList.remove('english');
    } else {
        langText.textContent = 'English';
        body.classList.add('english');
        body.classList.remove('urdu');
    }
    
    // Save preference to localStorage
    localStorage.setItem('tabeeb-language', currentLanguage);
}

// Load saved language preference
function loadLanguagePreference() {
    const savedLanguage = localStorage.getItem('tabeeb-language');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
        updateLanguage();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadLanguagePreference();
});

// Tab Navigation
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Update button states
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update content visibility
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === targetTab) {
                content.classList.add('active');
            }
        });
    });
});

// Smart Triage Form Handler
if (smartTriageForm) {
    smartTriageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const rawSymptoms = document.getElementById('smart-symptoms').value;
        const symptoms = escapeHtml(rawSymptoms)
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        
        const duration = escapeHtml(document.getElementById('smart-duration').value);
        const severity = escapeHtml(document.getElementById('smart-severity').value);
        
        if (symptoms.length === 0) {
            showToast('Please enter at least one symptom', 'error');
            return;
        }
        
        try {
            showLoading();
            
            let data;
            let retries = 3;
            let success = false;
            let lastError = null;
            
            while (retries > 0 && !success) {
                try {
                    const response = await fetch('/api/smart-triage', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            symptoms,
                            duration,
                            severity,
                            answers: triageAnswers
                        })
                    });
                    
                    data = await response.json();
                    
                    if (response.ok) {
                        success = true;
                        showToast('Analysis complete', 'success');
                        displayTriageResults(data);
                    } else {
                        throw new Error(data.error || 'An error occurred during triage');
                    }
                } catch (err) {
                    lastError = err;
                    retries--;
                    if (retries > 0) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))); // Exponential backoff: 1s, 2s, 3s
                    }
                }
            }
            
            if (!success && lastError) {
                throw lastError;
            }
        } catch (error) {
            showToast(error.message || 'Network error. Please try again.', 'error');
            console.error('Error:', error);
        } finally {
            hideLoading();
        }
    });
}

// Lab Report Form Handler
if (labReportForm) {
    labReportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('lab-report-file');
        const file = fileInput.files[0];
        
        if (!file) {
            window.showToast('Please select a lab report image');
            return;
        }
        
        try {
            showLoading();
            
            const formData = new FormData();
            formData.append('labReport', file);
            
            const response = await fetch('/api/interpret-lab-report', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                window.showToast('Report interpreted successfully', 'success');
                displayLabResults(data);
            } else {
                window.showToast(data.error || 'Failed to interpret lab report');
            }
        } catch (error) {
            window.showToast('Network error. Please try again.');
            console.error('Error:', error);
        } finally {
            hideLoading();
        }
    });
}

// Pharmacy Form Handler
if (pharmacyForm) {
    pharmacyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const rawMedicine = document.getElementById('medicine-name').value;
        const medicine = escapeHtml(rawMedicine).trim();
        
        if (!medicine) {
            window.showToast('Please enter a medicine name');
            return;
        }
        
        try {
            showLoading();
            
            const response = await fetch(`/api/pharmacy-prices/${encodeURIComponent(medicine)}`);
            const data = await response.json();
            
            if (response.ok) {
                window.showToast('Prices fetched successfully', 'success');
                displayPharmacyResults(data);
            } else {
                window.showToast(data.error || 'Failed to fetch pharmacy prices');
            }
        } catch (error) {
            window.showToast('Network error. Please try again.');
            console.error('Error:', error);
        } finally {
            hideLoading();
        }
    });
}

// Welfare Form Handler
if (welfareForm) {
    welfareForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const city = escapeHtml(document.getElementById('city-select').value);
        
        try {
            showLoading();
            
            const response = await fetch(`/api/welfare-hospitals?city=${encodeURIComponent(city)}`);
            const data = await response.json();
            
            if (response.ok) {
                window.showToast('Hospitals found', 'success');
                displayWelfareResults(data);
            } else {
                window.showToast(data.error || 'Failed to fetch welfare hospitals');
            }
        } catch (error) {
            window.showToast('Network error. Please try again.');
            console.error('Error:', error);
        } finally {
            hideLoading();
        }
    });
}

// Home Remedies Form Handler
if (remediesForm) {
    remediesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const rawCondition = document.getElementById('condition-input').value;
        const condition = escapeHtml(rawCondition).trim();
        
        if (!condition) {
            window.showToast('Please enter a condition');
            return;
        }
        
        try {
            showLoading();
            
            const response = await fetch(`/api/home-remedies/${encodeURIComponent(condition)}`);
            const data = await response.json();
            
            if (response.ok) {
                window.showToast('Remedies found', 'success');
                displayRemediesResults(data);
            } else {
                window.showToast(data.error || 'Failed to fetch home remedies');
            }
        } catch (error) {
            window.showToast('Network error. Please try again.');
            console.error('Error:', error);
        } finally {
            hideLoading();
        }
    });
}

// Medication Reminder Form Handler
if (reminderForm) {
    reminderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const phoneNumber = escapeHtml(document.getElementById('phone-number').value).trim();
        const medicationName = escapeHtml(document.getElementById('medication-name').value).trim();
        const dosage = escapeHtml(document.getElementById('dosage').value).trim();
        const frequency = escapeHtml(document.getElementById('frequency').value);
        const rawTimes = document.getElementById('reminder-times').value;
        const times = escapeHtml(rawTimes).split(',').map(t => t.trim());
        
        if (!phoneNumber || !medicationName || !dosage || !frequency || !rawTimes) {
            window.showToast('Please fill in all fields');
            return;
        }
        
        try {
            showLoading();
            
            const response = await fetch('/api/set-medication-reminder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber,
                    medicationName,
                    dosage,
                    frequency,
                    times
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                window.showToast('Reminder set successfully', 'success');
                displayReminderResults(data);
            } else {
                window.showToast(data.error || 'Failed to set medication reminder');
            }
        } catch (error) {
            window.showToast('Network error. Please try again.');
            console.error('Error:', error);
        } finally {
            hideLoading();
        }
    });
}

// Find Doctor Form Handler
if (doctorForm) {
    doctorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const specialty = escapeHtml(document.getElementById('specialty').value);
        const city = escapeHtml(document.getElementById('doctor-city').value);
        
        if (!specialty || !city) {
            window.showToast('Please select both specialty and city');
            return;
        }
        
        try {
            showLoading();
            
            const response = await fetch(`/api/find-specialist/${encodeURIComponent(specialty)}?city=${encodeURIComponent(city)}`);
            const data = await response.json();
            
            if (response.ok) {
                window.showToast('Specialists found', 'success');
                displayDoctorResults(data);
            } else {
                window.showToast(data.error || 'Failed to find specialists');
            }
        } catch (error) {
            window.showToast('Network error. Please try again.');
            console.error('Error:', error);
        } finally {
            hideLoading();
        }
    });
}

// Display Functions for New Features

// Display Triage Results
function displayTriageResults(data) {
    // Show follow-up questions if available
    if (data.followUpQuestions && data.followUpQuestions.length > 0) {
        displayFollowUpQuestions(data.followUpQuestions);
    } else {
        // Show triage results directly
        displayFinalTriageResults(data);
    }
}

// Display Follow-up Questions
function displayFollowUpQuestions(questions) {
    const html = questions.map((q, index) => `
        <div class="question-item">
            <h4>سوال ${index + 1}: ${q.question}</h4>
            <div class="options">
                ${q.options.map(option => `
                    <label class="option-label">
                        <input type="radio" name="${q.id}" value="${option}" onchange="saveTriageAnswer('${q.id}', this.value)">
                        ${option}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('') + `
        <button onclick="submitTriageAnswers()" class="btn btn-primary">جوابات جمع کروائیں (Submit Answers)</button>
    `;
    
    questionsContent.innerHTML = html;
    followupQuestions.style.display = 'block';
    followupQuestions.scrollIntoView({ behavior: 'smooth' });
}

// Save Triage Answer
window.saveTriageAnswer = function(questionId, answer) {
    triageAnswers[questionId] = answer;
}

// Submit Triage Answers
window.submitTriageAnswers = async function() {
    const rawSymptoms = document.getElementById('smart-symptoms').value;
    const symptoms = escapeHtml(rawSymptoms)
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    
    const duration = escapeHtml(document.getElementById('smart-duration').value);
    const severity = escapeHtml(document.getElementById('smart-severity').value);
    
    try {
        showLoading();
        
        const response = await fetch('/api/smart-triage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                symptoms,
                duration,
                severity,
                answers: triageAnswers
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            followupQuestions.style.display = 'none';
            displayFinalTriageResults(data);
        } else {
            window.showToast(data.error || 'An error occurred during triage');
        }
    } catch (error) {
        window.showToast('Network error. Please try again.');
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

// Display Final Triage Results
function displayFinalTriageResults(data) {
    const urgencyColors = {
        'EMERGENCY': '#dc2626',
        'URGENT': '#ea580c',
        'HOME_CARE': '#16a34a'
    };
    
    const html = `
        <div class="triage-result" style="border-left: 5px solid ${urgencyColors[data.triageLevel]}; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="color: ${urgencyColors[data.triageLevel]};">
                ${data.triageLevel === 'EMERGENCY' ? 'ہنگامی (EMERGENCY)' : 
                  data.triageLevel === 'URGENT' ? 'فوری (URGENT)' : 'گھریلو دیکھ بھال (HOME CARE)'}
            </h4>
            <p><strong>فوری کارروائی (Action):</strong> ${data.action}</p>
            <p><strong>شرح (Explanation):</strong> ${data.explanation}</p>
            <p><strong>اہمیت (Urgency):</strong> ${data.urgency}</p>
        </div>
        
        ${data.recommendations ? `
            <div class="analysis-item">
                <h4>تجاویز (Recommendations):</h4>
                <ul>
                    ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        
        <div class="disclaimer-box">
            <strong>⚠️ Important:</strong> ${data.disclaimer}
        </div>
    `;
    
    triageContent.innerHTML = html;
    triageResults.style.display = 'block';
    triageResults.scrollIntoView({ behavior: 'smooth' });
}

// Display Lab Results
function displayLabResults(data) {
    const html = `
        <div class="lab-summary">
            <h4>خلاصہ (Summary)</h4>
            <p>${data.summary}</p>
        </div>
        
        <div class="lab-details">
            <h4>ٹیسٹ نتائج (Test Results)</h4>
            ${Object.entries(data.extractedData).map(([category, tests]) => `
                <div class="test-category">
                    <h5>${category}</h5>
                    ${Object.entries(tests).map(([test, result]) => `
                        <div class="test-result ${result.status === 'high' ? 'high' : result.status === 'low' ? 'low' : 'normal'}">
                            <strong>${test}:</strong> ${result.value}
                            <span class="normal-range">(نارمل: ${result.normal})</span>
                            ${result.urdu ? `<span class="urdu-explanation">${result.urdu}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
        
        ${data.flaggedValues && data.flaggedValues.length > 0 ? `
            <div class="flagged-values">
                <h4>نشان زد قدرتیں (Flagged Values)</h4>
                <ul>
                    ${data.flaggedValues.map(val => `<li>${val}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        
        <div class="lab-recommendations">
            <h4>تجاویز (Recommendations)</h4>
            <ul>
                ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        
        <div class="disclaimer-box">
            <strong>⚠️ Important:</strong> ${data.disclaimer}
        </div>
    `;
    
    labContent.innerHTML = html;
    labResults.style.display = 'block';
    labResults.scrollIntoView({ behavior: 'smooth' });
}

// Display Pharmacy Results
function displayPharmacyResults(data) {
    const html = `
        <div class="medicine-info">
            <h4>${data.medicine} - قیمت کا موازنہ (Price Comparison)</h4>
        </div>
        
        <div class="price-comparison">
            ${Object.entries(data.prices).map(([pharmacy, price]) => `
                <div class="price-item">
                    <strong>${pharmacy}:</strong> ${price}
                </div>
            `).join('')}
        </div>
        
        <div class="price-note">
            <p><strong>سب سے سستا (Cheapest):</strong> ${Object.entries(data.prices).reduce((min, [pharmacy, price]) => 
                price.replace('Rs. ', '') < min.price.replace('Rs. ', '') ? 
                {pharmacy, price} : min, 
                {pharmacy: '', price: 'Rs. 999999'}).pharmacy}</p>
        </div>
        
        <div class="disclaimer-box">
            <strong>⚠️ Important:</strong> ${data.disclaimer}
        </div>
    `;
    
    pharmacyContent.innerHTML = html;
    pharmacyResults.style.display = 'block';
    pharmacyResults.scrollIntoView({ behavior: 'smooth' });
}

// Display Welfare Results
function displayWelfareResults(data) {
    const html = `
        <div class="city-info">
            <h4>${data.city} - ویلفیئر اسپتالیں (Welfare Hospitals)</h4>
        </div>
        
        <div class="hospitals-list">
            ${data.hospitals.map(hospital => `
                <div class="hospital-card">
                    <h5>${hospital.name}</h5>
                    <p><strong>پتہ (Address):</strong> ${hospital.address}</p>
                    <p><strong>فون (Phone):</strong> ${hospital.phone}</p>
                    <p><strong>وقت (Timing):</strong> ${hospital.timing}</p>
                    <div class="services">
                        <strong>خدمات (Services):</strong>
                        <ul>
                            ${hospital.services.map(service => `<li>${service}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="disclaimer-box">
            <strong>⚠️ Important:</strong> ${data.disclaimer}
        </div>
    `;
    
    welfareContent.innerHTML = html;
    welfareResults.style.display = 'block';
    welfareResults.scrollIntoView({ behavior: 'smooth' });
}

// Display Remedies Results
function displayRemediesResults(data) {
    const html = `
        <div class="condition-info">
            <h4>${data.condition} - گھریلو علاج (Home Remedies)</h4>
        </div>
        
        <div class="remedies-list">
            ${data.remedies.map((remedy, index) => `
                <div class="remedy-card">
                    <h5>${index + 1}. ${remedy.remedy} ${remedy.verified ? '✅ تصدیق شدہ' : ''}</h5>
                    <p><strong>طریقہ (Instructions):</strong> ${remedy.instructions}</p>
                    ${remedy.warning ? `
                        <div class="warning-box">
                            <strong>انتباہ (Warning):</strong> ${remedy.warning}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        
        <div class="disclaimer-box">
            <strong>⚠️ Important:</strong> ${data.disclaimer}
        </div>
    `;
    
    remediesContent.innerHTML = html;
    remediesResults.style.display = 'block';
    remediesResults.scrollIntoView({ behavior: 'smooth' });
}

// Display Reminder Results
function displayReminderResults(data) {
    const html = `
        <div class="reminder-success">
            <h4>✅ یاد دہانی سیٹ ہو گئی (Reminder Set Successfully)</h4>
        </div>
        
        <div class="reminder-details">
            <p><strong>دوا (Medicine):</strong> ${data.medicationName}</p>
            <p><strong>ڈوز (Dosage):</strong> ${data.dosage}</p>
            <p><strong>فریکوئنسی (Frequency):</strong> ${data.frequency}</p>
            <p><strong>اوقات (Times):</strong> ${data.times.join(', ')}</p>
            <p><strong>اگلی یاد دہانی (Next Reminder):</strong> ${data.nextReminder}</p>
            <p><strong>فون نمبر (Phone Number):</strong> ${data.phoneNumber}</p>
        </div>
        
        <div class="sample-message">
            <h5>نمک پیغام (Sample Message):</h5>
            <p>${data.message}</p>
        </div>
        
        <div class="disclaimer-box">
            <strong>⚠️ Important:</strong> ${data.disclaimer}
        </div>
    `;
    
    reminderContent.innerHTML = html;
    reminderResults.style.display = 'block';
    reminderResults.scrollIntoView({ behavior: 'smooth' });
}

// Display Doctor Results
function displayDoctorResults(data) {
    const html = `
        <div class="specialty-info">
            <h4>${data.specialty} in ${data.city} - ڈاکٹر (Doctors)</h4>
        </div>
        
        <div class="doctors-list">
            ${data.specialists.map(doctor => `
                <div class="doctor-card">
                    <h5>${doctor.name}</h5>
                    <p><strong>تعیلیف (Qualification):</strong> ${doctor.qualification}</p>
                    <p><strong>اسپتال (Hospital):</strong> ${doctor.hospital}</p>
                    <p><strong>تجربہ (Experience):</strong> ${doctor.experience}</p>
                    <p><strong>ریٹنگ (Rating):</strong> ${doctor.rating}</p>
                    <p><strong>مشاورت فیس (Consultation Fee):</strong> ${doctor.consultationFee}</p>
                    <p><strong>فون (Phone):</strong> ${doctor.phone}</p>
                </div>
            `).join('')}
        </div>
        
        <div class="disclaimer-box">
            <strong>⚠️ Important:</strong> ${data.disclaimer}
        </div>
    `;
    
    doctorContent.innerHTML = html;
    doctorResults.style.display = 'block';
    doctorResults.scrollIntoView({ behavior: 'smooth' });
}

// Loading Functions
function showLoading() {
    loading.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideLoading() {
    loading.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Error Display
window.showError = function(message) {
    window.showToast(message, 'error');
}

// Utility Functions
window.showDisclaimer = function() {
    const disclaimerText = `
        MEDICAL DISCLAIMER
        
        This AI Doctor Helper application is intended for informational and educational purposes only.
        It is NOT a substitute for professional medical advice, diagnosis, or treatment.
        
        • Always seek the advice of qualified healthcare professionals for any medical concerns
        • Do not disregard professional medical advice or delay in seeking it because of this application
        • If you think you may have a medical emergency, call 911 or go to the nearest emergency room immediately
        • This application does not provide medical diagnoses or treatment recommendations
        • The information provided may not be accurate, complete, or up-to-date
        
        By using this application, you agree to these terms and assume full responsibility for your health decisions.
    `;
    
    alert(disclaimerText);
}

window.showEmergencyInfo = function() {
    const emergencyText = `
        ہنگامی معلومات (EMERGENCY INFORMATION)
        
        فوری طور پر 1122 پر کال کریں اگر آپ کو یہ علامات ہیں:
        
        • سینے میں درد یا دباؤ (Chest pain or pressure)
        • سانس لینے میں مشکلات یا سانس کی قلت (Difficulty breathing)
        • شدید خون بہنا (Severe bleeding)
        • بے ہوشی (Loss of consciousness)
        • اچانک شدید سر درد (Sudden severe headache)
        • بولنے میں مشکلات یا لکنت (Slurred speech)
        • سنکن یا کمزوری، خاص طور پر ایک طرف (Numbness or weakness)
        • نظر میں تبدیلیاں (Vision changes)
        • پریشانی یا ذہنی حالت میں تبدیلی (Confusion)
        • فٹ (Seizures)
        • بلند بخار اور گردن میں سختی (High fever with stiff neck)
        • شاک کی علامات (Signs of shock)
        
        جب ایمرجنسی روم جانا چاہیے:
        • چوٹیں جس میں سلائی یا سرجری کی ضرورت ہو
        ٹوٹی ہوئی ہڈیاں
        شدید الرجک ریئیکشن
        زہر (Poisoning)
        اوور ڈوز
        
        غیر ہنگامی طبی مشورے کے لیے، اپنے پرائمری کیر ڈاکٹر سے رابطہ کریں یا ٹیلی میڈیسن سروسز استعمال کریں۔
        
        ---
        
        EMERGENCY INFORMATION
        
        Call 1122 immediately if you experience:
        
        • Chest pain or pressure
        • Difficulty breathing or shortness of breath
        • Severe bleeding
        • Loss of consciousness
        • Sudden severe headache
        • Slurred speech or difficulty speaking
        • Numbness or weakness, especially on one side of the body
        • Vision changes or loss of vision
        • Confusion or changes in mental state
        • Seizures
        • High fever with stiff neck
        • Signs of shock (pale, blue skin, rapid breathing)
        
        When to go to Emergency Room:
        • Injury that may require stitches or surgery
        • Broken bones
        • Severe allergic reaction
        • Poisoning
        • Overdose
        
        For non-emergency medical advice, contact your primary care physician or use telemedicine services.
    `;
    
    alert(emergencyText);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Add form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = 'var(--danger-color)';
                } else {
                    field.style.borderColor = '';
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showError('Please fill in all required fields');
            }
        });
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit forms
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.form) {
            activeElement.form.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to close loading overlay
    if (e.key === 'Escape' && loading.style.display === 'flex') {
        hideLoading();
    }
});
