// Global variables
let currentDisease = '';
let loadingOverlay;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize loading overlay
    loadingOverlay = document.getElementById('loadingOverlay');

    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize form handlers
    initializeFormHandlers();
    
    // Add intersection observer for animations
    initializeAnimations();
}

function initializeFormHandlers() {
    // Diabetes form
    const diabetesForm = document.getElementById('diabetesForm');
    if (diabetesForm) {
        diabetesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handlePrediction('diabetes', this);
        });
    }

    // Heart disease form
    const heartForm = document.getElementById('heartForm');
    if (heartForm) {
        heartForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handlePrediction('heart', this);
        });
    }

    // Parkinson's form
    const parkinsonsForm = document.getElementById('parkinsonsForm');
    if (parkinsonsForm) {
        parkinsonsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handlePrediction('parkinsons', this);
        });
    }
}

function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe cards and sections
    document.querySelectorAll('.card, .hero-section, section').forEach(el => {
        observer.observe(el);
    });
}

function showPredictionForm(diseaseType) {
    currentDisease = diseaseType;
    
    // Hide disease selection
    document.getElementById('disease-selection').style.display = 'none';
    
    // Show prediction forms container
    document.getElementById('prediction-forms').style.display = 'block';
    
    // Hide all forms first
    document.querySelectorAll('.prediction-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Show specific form
    const formId = `${diseaseType}-form`;
    const form = document.getElementById(formId);
    if (form) {
        form.style.display = 'block';
        form.classList.add('slide-up');
    }
    
    // Hide any previous results
    document.getElementById('prediction-result').style.display = 'none';
    
    // Scroll to the form
    setTimeout(() => {
        document.getElementById('prediction-forms').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

function hidePredictionForm() {
    // Show disease selection
    document.getElementById('disease-selection').style.display = 'flex';
    
    // Hide prediction forms
    document.getElementById('prediction-forms').style.display = 'none';
    
    // Reset current disease
    currentDisease = '';
    
    // Clear any previous results
    document.getElementById('prediction-result').style.display = 'none';
    
    // Scroll back to prediction section
    document.getElementById('prediction').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function handlePrediction(diseaseType, form) {
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Show loading overlay
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    // Collect form data
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        // Convert numeric fields
        if (key !== 'user_name') {
            data[key] = parseFloat(value) || 0;
        } else {
            data[key] = value;
        }
    }

    // Send prediction request
    fetch(`/api/predict/${diseaseType}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        displayPredictionResult(result, data.user_name);
    })
    .catch(error => {
        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        console.error('Error:', error);
        displayError('An error occurred while processing your request. Please try again.');
    });
}

function displayPredictionResult(result, userName) {
    const resultDiv = document.getElementById('prediction-result');
    const contentDiv = document.getElementById('result-content');
    
    if (result.success) {
        const isPositive = result.prediction === 'positive';
        const diseaseNames = {
            'diabetes': 'Diabetes',
            'heart': 'Heart Disease',
            'parkinsons': "Parkinson's Disease"
        };
        
        const resultClass = isPositive ? 'result-positive' : 'result-negative';
        const icon = isPositive ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
        const iconColor = isPositive ? 'text-danger' : 'text-success';
        
        contentDiv.innerHTML = `
            <div class="alert ${resultClass} border-0 mb-4">
                <div class="d-flex align-items-center">
                    <i class="${icon} ${iconColor} me-3" style="font-size: 2rem;"></i>
                    <div class="flex-grow-1 text-start">
                        <h5 class="alert-heading mb-2">Prediction Results for ${userName}</h5>
                        <p class="mb-2">
                            <strong>${diseaseNames[currentDisease]} Risk: 
                            ${isPositive ? 'HIGH RISK' : 'LOW RISK'}</strong>
                        </p>
                        <div class="confidence-meter">
                            <div class="confidence-bar" style="width: ${result.confidence}%"></div>
                        </div>
                        <small>Confidence Level: ${result.confidence}%</small>
                    </div>
                </div>
            </div>
            
            <div class="row g-3">
                <div class="col-md-6">
                    <div class="card border-0 bg-light">
                        <div class="card-body text-center">
                            <h6 class="card-title">Prediction</h6>
                            <p class="h4 mb-0 ${isPositive ? 'text-danger' : 'text-success'}">
                                ${result.prediction.toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card border-0 bg-light">
                        <div class="card-body text-center">
                            <h6 class="card-title">Confidence</h6>
                            <p class="h4 mb-0 text-primary">${result.confidence}%</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4">
                <div class="alert alert-info border-0">
                    <div class="d-flex">
                        <i class="fas fa-info-circle me-3 mt-1"></i>
                        <div>
                            <h6 class="alert-heading">Important Note</h6>
                            <p class="mb-0">
                                This prediction is based on machine learning analysis and should not be considered 
                                as a definitive medical diagnosis. Please consult with a qualified healthcare 
                                professional for proper medical evaluation and treatment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 d-flex gap-3 justify-content-center">
                <button class="btn btn-primary" onclick="generateReport()">
                    <i class="fas fa-file-pdf me-2"></i>Generate Report
                </button>
                <button class="btn btn-secondary" onclick="startNewPrediction()">
                    <i class="fas fa-redo me-2"></i>New Prediction
                </button>
                <button class="btn btn-outline-primary" onclick="goBack()">
                    <i class="fas fa-arrow-left me-2"></i>Back to Selection
                </button>
            </div>
        `;
    } else {
        contentDiv.innerHTML = `
            <div class="alert alert-danger border-0">
                <div class="d-flex">
                    <i class="fas fa-exclamation-triangle me-3 mt-1"></i>
                    <div>
                        <h6 class="alert-heading">Prediction Error</h6>
                        <p class="mb-0">${result.error || 'An error occurred during prediction.'}</p>
                    </div>
                </div>
            </div>
            <div class="mt-3">
                <button class="btn btn-primary" onclick="retryPrediction()">
                    <i class="fas fa-redo me-2"></i>Try Again
                </button>
            </div>
        `;
    }
    
    resultDiv.style.display = 'block';
    resultDiv.classList.add('fade-in');
    
    // Scroll to results
    setTimeout(() => {
        resultDiv.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

function displayError(message) {
    const resultDiv = document.getElementById('prediction-result');
    const contentDiv = document.getElementById('result-content');
    
    contentDiv.innerHTML = `
        <div class="alert alert-danger border-0">
            <div class="d-flex">
                <i class="fas fa-exclamation-triangle me-3 mt-1"></i>
                <div>
                    <h6 class="alert-heading">Error</h6>
                    <p class="mb-0">${message}</p>
                </div>
            </div>
        </div>
        <div class="mt-3">
            <button class="btn btn-primary" onclick="retryPrediction()">
                <i class="fas fa-redo me-2"></i>Try Again
            </button>
        </div>
    `;
    
    resultDiv.style.display = 'block';
    resultDiv.classList.add('fade-in');
}

function generateReport() {
    // This would generate a PDF report of the prediction
    alert('Report generation feature coming soon!');
}

function startNewPrediction() {
    // Clear the current form
    const currentForm = document.querySelector(`#${currentDisease}Form`);
    if (currentForm) {
        currentForm.reset();
    }
    
    // Hide results
    document.getElementById('prediction-result').style.display = 'none';
    
    // Scroll back to form
    document.querySelector(`#${currentDisease}-form`).scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function goBack() {
    hidePredictionForm();
}

function retryPrediction() {
    // Hide results and scroll back to form
    document.getElementById('prediction-result').style.display = 'none';
    
    document.querySelector(`#${currentDisease}-form`).scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Utility functions
function validateNumericInput(input) {
    const value = parseFloat(input.value);
    if (isNaN(value)) {
        input.setCustomValidity('Please enter a valid number');
    } else {
        input.setCustomValidity('');
    }
}

// Add input validation for numeric fields
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function() {
            validateNumericInput(this);
        });
    });
});

// Handle form submission with Enter key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        const form = e.target.closest('form');
        if (form) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    }
});

// Add loading states to buttons
function addLoadingState(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
    button.disabled = true;
    
    return function removeLoadingState() {
        button.innerHTML = originalText;
        button.disabled = false;
    };
}

// Performance optimization: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add error boundary for JavaScript errors
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could send error to logging service
});

// Service worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
