# TABEEB AI

**TABEEB AI** - Pakistan's first local AI-powered medical assistant and symptom checker designed to help users understand their symptoms and provide general medical information in both Urdu and English.

## 🚨 ہنگامی طبی انتباہ (Important Medical Disclaimer)

**یہ ایپلیکیشن پیشہ ورانہ طبی مشورے کا متبادل نہیں ہے۔** ہمیشہ اہل صحت کی دیکھ بھال سے اپنے طبی حالات کے بارے میں مشورہ کریں۔

**This application is NOT a substitute for professional medical advice, diagnosis, or treatment.** Always seek the advice of qualified healthcare providers with any questions you may have regarding a medical condition.

## Features (خصوصیات)

- **علامات کا تجزیہ (Symptom Analysis)**: اپنی علامات درج کریں اور AI سے تجزیہ حاصل کریں
- **طبی معلومات (Medical Information)**: عام طبی حالات کے بارے میں معلومات حاصل کریں
- **ہنگامی انتباہ نظام (Emergency Warnings)**: ممکنہ سنگین علامات کے لیے الرٹس حاصل کریں
- **دو زبانی انٹرفیس (Bilingual Interface)**: اردو اور انگریزی میں آسان استعمال
- **سیفٹی اولینیت (Safety First)**: بلٹ ان ڈسکلیمرز اور ہنگامی سفارشات
- **مقامی پاکستانی کنٹیکسٹ (Local Pakistani Context)**: پاکستانی ہنگامی خدمات (1122) کے لیے مخصوص معلومات

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Development Mode

Start both the backend server and frontend development server:

```bash
# Terminal 1: Start backend server
npm run dev

# Terminal 2: Start frontend development server
npm run dev:client
```

The application will be available at `http://localhost:8080`

### Production Mode

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## API Endpoints

### POST /api/analyze-symptoms
Analyze symptoms and get potential conditions and recommendations.

**Request Body:**
```json
{
  "symptoms": ["headache", "fever"],
  "duration": "2 days",
  "severity": "moderate"
}
```

### GET /api/medical-info/:condition
Get general information about a medical condition.

**Example:**
```
GET /api/medical-info/migraine
```

## Safety Features

- Rate limiting to prevent abuse
- Medical disclaimers on all responses
- Emergency symptom detection
- Input validation and sanitization
- Secure headers with Helmet.js

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tools**: Webpack
- **Security**: Helmet.js, CORS, Rate Limiting

## Contributing

When contributing to this project, please ensure:
1. All medical information is accurate and sourced
2. Disclaimers are maintained and prominent
3. Safety features are not bypassed
4. Code follows best practices for security and performance

## License

MIT License - see LICENSE file for details

## Support

For technical support or issues, please create an issue in the repository.

---

**Remember: This tool is for informational purposes only and should never replace professional medical advice.**
