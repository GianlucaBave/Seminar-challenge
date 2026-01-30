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

    // Simulate API call (replace with actual backend call)
    await simulateAnalysis();

    // Hide loading
    loadingOverlay.style.display = 'none';

    // Show results
    uploadSection.style.display = 'none';
    resultsSection.style.display = 'block';

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// Simulate Analysis (Replace with actual API call)
async function simulateAnalysis() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Generate mock scores
            const scores = {
                overall: Math.floor(Math.random() * 30) + 65, // 65-95
                skills: Math.floor(Math.random() * 25) + 70,
                experience: Math.floor(Math.random() * 25) + 65,
                technical: Math.floor(Math.random() * 30) + 60,
                keywords: Math.floor(Math.random() * 20) + 75
            };

            displayResults(scores);
            resolve();
        }, 2500);
    });
}

// Display Results
function displayResults(scores) {
    // Overall Score
    const overallScore = document.getElementById('overall-score');
    const scoreProgress = document.getElementById('score-progress');
    const scoreDescription = document.getElementById('score-description');

    // Animate overall score
    animateValue(overallScore, 0, scores.overall, 1500);

    // Animate circle
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (scores.overall / 100) * circumference;
    scoreProgress.style.strokeDashoffset = offset;

    // Score description
    if (scores.overall >= 80) {
        scoreDescription.textContent = 'Excellent match! You\'re a strong candidate for this position.';
    } else if (scores.overall >= 65) {
        scoreDescription.textContent = 'Good match! Consider highlighting relevant skills.';
    } else {
        scoreDescription.textContent = 'Moderate match. Review recommendations below.';
    }

    // Individual Metrics
    updateMetric('skills', scores.skills, [
        'Project Management',
        'Team Leadership',
        'Agile Methodologies'
    ]);

    updateMetric('experience', scores.experience, [
        '5+ years in relevant field',
        'Similar industry experience',
        'Leadership roles'
    ]);

    updateMetric('technical', scores.technical, [
        'JavaScript/Node.js',
        'React/Frontend frameworks',
        'Database management'
    ]);

    updateMetric('keywords', scores.keywords, [
        'Strategic planning',
        'Cross-functional collaboration',
        'Data-driven decision making'
    ]);

    // Recommendations
    displayRecommendations(scores);
}

// Update Individual Metric
function updateMetric(metricName, score, details) {
    const bar = document.getElementById(`${metricName}-bar`);
    const scoreElement = document.getElementById(`${metricName}-score`);
    const detailsList = document.getElementById(`${metricName}-details`);

    // Animate bar
    setTimeout(() => {
        bar.style.width = `${score}%`;
    }, 300);

    // Animate score
    animateValue(scoreElement, 0, score, 1000, '%');

    // Add details
    detailsList.innerHTML = '';
    details.forEach(detail => {
        const li = document.createElement('li');
        li.textContent = detail;
        detailsList.appendChild(li);
    });
}

// Animate Number Value
function animateValue(element, start, end, duration, suffix = '') {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 16);
}

// Display Recommendations
function displayRecommendations(scores) {
    const recommendationsList = document.getElementById('recommendations-list');
    recommendationsList.innerHTML = '';

    const recommendations = [];

    if (scores.skills < 75) {
        recommendations.push('Consider adding more relevant skills mentioned in the job description to your CV');
    }

    if (scores.technical < 70) {
        recommendations.push('Highlight your technical proficiencies more prominently, especially those matching the job requirements');
    }

    if (scores.experience < 70) {
        recommendations.push('Emphasize your relevant work experience and quantify your achievements');
    }

    if (scores.keywords < 80) {
        recommendations.push('Include more industry-specific keywords from the job posting in your CV');
    }

    if (scores.overall >= 80) {
        recommendations.push('Your CV is well-aligned! Consider tailoring your cover letter to highlight your top matching skills');
    }

    recommendations.push('Proofread your CV for any typos or formatting inconsistencies');
    recommendations.push('Consider adding a brief summary section at the top highlighting your key qualifications');

    recommendations.forEach(rec => {
        const div = document.createElement('div');
        div.className = 'recommendation-item';
        div.textContent = rec;
        recommendationsList.appendChild(div);
    });
}

// Initialize
console.log('CV Checker loaded! 🚀');
