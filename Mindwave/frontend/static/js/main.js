// Global JavaScript Functions for Mindwave

// DOM Ready Function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize global features
    initializeTooltips();
    setupGlobalEventListeners();
    initializeDashboard();
});

// Dashboard Initialization
function initializeDashboard() {
    // Set username if available
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        // In a real app, this would come from session data
        usernameElement.textContent = 'Alex'; // Placeholder
    }
    
    // Initialize charts
    initializeActivityChart();
    
    // Animate emotion bars
    animateEmotionBars();
    
    // Animate stress gauge
    animateStressGauge();
}

// Initialize Activity Chart
function initializeActivityChart() {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    
    // Dummy data for demonstration
    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Mood Score',
            data: [65, 72, 68, 74, 80, 76, 78],
            borderColor: '#66fcf1',
            backgroundColor: 'rgba(102, 252, 241, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: '#66fcf1',
            pointBorderColor: '#0b0c10',
            pointBorderWidth: 2,
            pointRadius: 5,
            tension: 0.4,
            fill: true
        }]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(102, 252, 241, 0.1)'
                    },
                    ticks: {
                        color: '#c5c6c7'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(102, 252, 241, 0.1)'
                    },
                    ticks: {
                        color: '#c5c6c7'
                    }
                }
            }
        }
    };
    
    new Chart(ctx, config);
}

// Animate Emotion Bars
function animateEmotionBars() {
    const bars = document.querySelectorAll('.progress-bar');
    bars.forEach((bar, index) => {
        // Stagger the animations
        setTimeout(() => {
            bar.style.width = '0%';
        }, index * 200);
    });
}

// Animate Stress Gauge
function animateStressGauge() {
    const gaugeFill = document.querySelector('.gauge-fill');
    if (gaugeFill) {
        // Animate from 0% to current value (0% for calm)
        setTimeout(() => {
            gaugeFill.style.strokeDashoffset = '220'; // 0% = full offset
        }, 500);
    }
}

// Tooltip Initialization
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', showTooltip);
        tooltip.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltipText = e.target.getAttribute('data-tooltip');
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '5px 10px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '1000';
    tooltip.style.top = (e.clientY - 30) + 'px';
    tooltip.style.left = e.clientX + 'px';
    document.body.appendChild(tooltip);
}

function hideTooltip() {
    const tooltips = document.querySelectorAll('.tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
}

// Global Event Listeners
function setupGlobalEventListeners() {
    // Handle form submissions globally
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form.classList.contains('needs-validation')) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        }
    });

    // Handle navigation link clicks
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-navigate]')) {
            e.preventDefault();
            const url = e.target.getAttribute('data-navigate');
            navigateTo(url);
        }
    });
}

// Navigation Helper
function navigateTo(url) {
    window.location.href = url;
}

// Show Loading State
function showLoading(element) {
    if (element) {
        element.classList.add('btn-loading');
    }
}

// Hide Loading State
function hideLoading(element) {
    if (element) {
        element.classList.remove('btn-loading');
    }
}

// Display Message
function showMessage(message, type = 'info', container = null) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    if (container) {
        container.insertBefore(messageEl, container.firstChild);
    } else {
        document.body.appendChild(messageEl);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

// API Request Helper
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const config = Object.assign(defaultOptions, options);
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        showMessage(error.message, 'error');
        throw error;
    }
}

// Form Validation Helper
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            markInputInvalid(input, 'This field is required');
        } else {
            markInputValid(input);
        }
    });
    
    return isValid;
}

function markInputInvalid(input, message) {
    input.classList.add('input-invalid');
    input.classList.remove('input-valid');
    
    // Remove existing validation message
    const existingMsg = input.parentNode.querySelector('.validation-message');
    if (existingMsg) existingMsg.remove();
    
    // Add validation message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'validation-message error';
    errorMsg.textContent = message;
    input.parentNode.appendChild(errorMsg);
}

function markInputValid(input) {
    input.classList.add('input-valid');
    input.classList.remove('input-invalid');
    
    // Remove validation message
    const errorMsg = input.parentNode.querySelector('.validation-message.error');
    if (errorMsg) errorMsg.remove();
}

// Local Storage Helpers
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error setting localStorage:', error);
    }
}

function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error getting localStorage:', error);
        return defaultValue;
    }
}

function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing localStorage:', error);
    }
}

// Session Management
function setSessionToken(token) {
    setLocalStorage('session_token', token);
}

function getSessionToken() {
    return getLocalStorage('session_token');
}

function clearSession() {
    removeLocalStorage('session_token');
    removeLocalStorage('user_data');
}

// Utility Functions
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for use in other modules
window.Mindwave = {
    showMessage,
    apiRequest,
    validateForm,
    setSessionToken,
    getSessionToken,
    clearSession,
    navigateTo,
    showLoading,
    hideLoading
};