// CV Checker JavaScript

let uploadedFile = null;
let jobUrl = null;

// DOM Elements
const cvUpload = document.getElementById('cv-upload');
const fileName = document.getElementById('file-name');
const jobUrlInput = document.getElementById('job-url');
const checkFitBtn = document.getElementById('check-fit-btn');
const uploadSection = document.getElementById('upload-section');
const resultsSection = document.getElementById('results-section');
const loadingOverlay = document.getElementById('loading-overlay');
const resetBtn = document.getElementById('reset-btn');

// File Upload Handler
cvUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        uploadedFile = file;
        fileName.textContent = `✓ ${file.name}`;
        fileName.style.color = '#10b981';
        checkButtonState();
    } else {
        fileName.textContent = '⚠ Please select a PDF file';
        fileName.style.color = '#ef4444';
        uploadedFile = null;
        checkButtonState();
    }
});

// Job URL Input Handler
jobUrlInput.addEventListener('input', (e) => {
    jobUrl = e.target.value.trim();
    checkButtonState();
});

// Check if both inputs are filled
function checkButtonState() {
    if (uploadedFile && jobUrl && isValidUrl(jobUrl)) {
        checkFitBtn.disabled = false;
    } else {
        checkFitBtn.disabled = true;
    }
}

// Validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Check Fit Button Handler
checkFitBtn.addEventListener('click', async () => {
    // Show loading
    loadingOverlay.style.display = 'flex';
    document.querySelector('.loading-text').textContent = "Analyzing your CV against the job description...";

    try {
        const formData = new FormData();
        formData.append('cv', uploadedFile);
        formData.append('jobUrl', jobUrl);

        const response = await fetch('/api/analyze-cv', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(errorData.details || errorData.error || 'Unknown Server Error');
        }

        const data = await response.json();

        // Hide loading
        loadingOverlay.style.display = 'none';

        // Show results
        uploadSection.style.display = 'none';
        resultsSection.style.display = 'block';

        // Display Data
        displayResults(data);

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error('Error:', error);
        loadingOverlay.style.display = 'none';

        // Show detailed error in UI
        let errorMsg = error.message;
        if (error.response) {
            // If we have response details (from a fetch wrapper if we had one, but here we process raw fetch)
        }

        const errorDiv = document.createElement('div');
        errorDiv.style.backgroundColor = '#fee2e2';
        errorDiv.style.border = '1px solid #ef4444';
        errorDiv.style.color = '#b91c1c';
        errorDiv.style.padding = '1rem';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.marginTop = '1rem';
        errorDiv.style.fontFamily = 'monospace';
        errorDiv.style.whiteSpace = 'pre-wrap';
        errorDiv.innerHTML = `<strong>Error Analysis Failed:</strong><br>${errorMsg}`;

        // Remove existing error if any
        const existingError = uploadSection.querySelector('.error-box');
        if (existingError) existingError.remove();

        errorDiv.className = 'error-box';
        document.querySelector('.action-section').appendChild(errorDiv);
    }
});

// Reset Button Handler
resetBtn.addEventListener('click', () => {
    // Reset form
    cvUpload.value = '';
    fileName.textContent = '';
    jobUrlInput.value = '';
    uploadedFile = null;
    jobUrl = null;
    checkButtonState();

    // Show upload section
    uploadSection.style.display = 'block';
    resultsSection.style.display = 'none';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Display Results
function displayResults(data) {
    // Data structure: { scores: { overall, experience, education, skills }, strengths: [], improvements: [] }
    const { scores, strengths, improvements } = data;
    // 4. Update UI with results

    // 1. Overall Score (Circular Animation)
    const overallCircle = document.getElementById('overall-circle');
    const overallText = document.getElementById('overall-score');

    const offset = 100 - scores.overall;
    overallCircle.style.strokeDashoffset = offset;
    animateValue(overallText, 0, scores.overall, 1500);

    // 2. Detail Scores
    updateMiniBar('experience', scores.experience);
    updateMiniBar('education', scores.education);
    updateMiniBar('skills', scores.skills);

    // (Description removed as per request)

    // 3. Strengths
    const strengthsList = document.getElementById('strengths-list');
    strengthsList.innerHTML = '';
    (strengths || []).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        strengthsList.appendChild(li);
    });

    // 4. Improvements
    const improvementsList = document.getElementById('improvements-list');
    improvementsList.innerHTML = '';
    (improvements || []).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        improvementsList.appendChild(li);
    });

    // 5. Roadmap
    const roadmapContainer = document.getElementById('roadmap-container');
    if (data.roadmap && Array.isArray(data.roadmap)) {
        roadmapContainer.innerHTML = ''; // Clear loading text
        data.roadmap.forEach(step => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'roadmap-step';
            stepDiv.innerHTML = `
                <div class="step-month">${step.month}</div>
                <div class="step-title">${step.title}</div>
                <div class="step-action">${step.action}</div>
            `;
            roadmapContainer.appendChild(stepDiv);
        });
    } else {
        roadmapContainer.innerHTML = '<div class="roadmap-loading">No roadmap available.</div>';
    }
}

function updateMiniBar(idPrefix, value) {
    const scoreEl = document.getElementById(`${idPrefix}-score`);
    const barEl = document.getElementById(`${idPrefix}-bar`);

    animateValue(scoreEl, 0, value, 1000);
    setTimeout(() => {
        barEl.style.width = `${value}%`;
    }, 100);
}

// Animate Number Value
function animateValue(element, start, end, duration) {
    if (!element) return;
    const range = end - start;
    const startTime = new Date().getTime();
    const endTime = startTime + duration;

    const timer = setInterval(() => {
        const now = new Date().getTime();
        const remaining = Math.max((endTime - now) / duration, 0);
        const value = Math.round(end - (remaining * range));
        element.textContent = value;
        if (value == end) {
            clearInterval(timer);
        }
    }, 16);
}

// Initialize
console.log('CV Checker loaded! 🚀');
