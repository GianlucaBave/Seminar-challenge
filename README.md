# CV Job Fit Checker

**Live demo: [seminar-challenge.vercel.app](https://seminar-challenge.vercel.app)**

Upload a CV, paste a job-offer URL, and get a compatibility score with AI suggestions to tailor the CV. Built with Node.js, Express and the Gemini API.

## 🚀 Features

- **CV Job Fit Checker**: Upload your CV/Resume (PDF) and paste a job offer URL to get an instant compatibility score
- **Smart Dashboard**: Visual analytics with overall score, skills match, experience match, technical skills, and keywords analysis
- **AI-Powered Recommendations**: Get personalized suggestions to improve your CV for specific job offers
- Responsive design
- Smooth animations
- SEO-friendly

## 📦 Installation

```bash
npm install
```

## 🏃 Run locally

```bash
npm start
```

The site runs at `http://localhost:3000`.

## 🌐 Deploy on Vercel

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: GitHub integration
1. Go to [vercel.com](https://vercel.com)
2. Import this repository
3. Vercel detects the configuration automatically
4. Click "Deploy"

## 📁 Project structure

```
.
├── index.js          # Express server
├── package.json      # Dependencies
├── vercel.json       # Vercel configuration
└── public/           # Static files
    ├── index.html    # Landing page
    ├── style.css     # Styles
    └── script.js     # JavaScript
```

## 🛠️ Tech stack

- Node.js
- Express
- HTML5
- CSS3
- JavaScript (Vanilla)
- Gemini API, pdf-parse, Multer

## 📄 License

MIT
