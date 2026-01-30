require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const pdf = require('pdf-parse');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Serve static files from the public directory
app.use(express.static('public'));
app.use(express.json());

// API Endpoint for CV Analysis
app.post('/api/analyze-cv', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CV file uploaded' });
    }

    const jobUrl = req.body.jobUrl;
    if (!jobUrl) {
      return res.status(400).json({ error: 'No Job URL provided' });
    }

    // 1. Extract Text from PDF
    const pdfData = await pdf(req.file.buffer);
    const cvText = pdfData.text.substring(0, 10000); // Limit context window

    // 2. Prepare Prompt for OpenRouter
    // 2. Prepare Prompt for OpenRouter
    const prompt = `
        You are an expert CV Analyst. Analyze the following CV against the Job URL/Description provided.
        
        CV Text (Excerpts):
        "${cvText.replace(/\n/g, ' ')}"

        Job URL/Description: "${jobUrl}"

        **Goal**: Provide a structured JSON response matching strictly the following schema.

        **Scoring Definitions**:
        1. **Overall Match (%)**: A weighted average summarizing the compatibility. Weighted combination of Experience, Education, and Skills.
        2. **Experience Match (%)**: Measures alignment of years of experience, rules held, and level of responsibility.
        3. **Education Match (%)**: Measures alignment of degree level, field of study, and relevant certifications.
        4. **Skills Match (%)**: Measures match of explicitly required hard and soft skills.

        **Feedback Sections**:
        - **Strengths**: Dedicated section for what works well.
           - Rules: Only directly related to job description. Max 3-4 points. Clear, non-judgmental.
           - Purpose: Reinforce confidence.
        - **Areas to Improve**: Explains what limits the score.
           - Rules: Relate to lower score. No personal judgments. Max 3 points. Focus on gaps (e.g. missing tools, insufficient years).
           - Purpose: Explain match score limit and provide actionable direction.

        **Output Rules**:
        - Scores must be explainable.
        - Feedback must be constructive.
        - Return ONLY raw JSON. No markdown formatting.

        **JSON Schema**:
        {
            "scores": {
                "overall": number (0-100),
                "experience": number (0-100),
                "education": number (0-100),
                "skills": number (0-100)
            },
            "strengths": ["string", "string", ...],
            "improvements": ["string", "string", ...]
        }
        `;

    // 3. Call OpenRouter API
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: "You are a professional HR AI Analyst. Output strictly valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2, // Low temperature for consistent scoring
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://north-cv.vercel.app", // Optional, good practice
      }
    });

    const analysisResult = response.data.choices[0].message.content;

    // Parse JSON safely
    let structuredAnalysis;
    try {
      structuredAnalysis = JSON.parse(analysisResult);
    } catch (e) {
      // Fallback if model returns code block
      const cleanJson = analysisResult.replace(/```json/g, '').replace(/```/g, '');
      structuredAnalysis = JSON.parse(cleanJson);
    }

    res.json(structuredAnalysis);

  } catch (error) {
    if (error.response) {
      console.error('OpenRouter API Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Analysis Error:', error.message);
    }

    res.status(500).json({
      error: 'Analysis failed',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
