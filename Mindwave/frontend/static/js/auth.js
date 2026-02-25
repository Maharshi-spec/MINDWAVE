// Authentication Logic for Login and Signup

document.addEventListener('DOMContentLoaded', function() {
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Handle signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Handle password confirmation validation
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword) {
        const password = document.getElementById('password');
        confirmPassword.addEventListener('input', function() {
            validatePasswordMatch(password, confirmPassword);
        });
        
        password.addEventListener('input', function() {
            validatePasswordMatch(password, confirmPassword);
        });
    }
});

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!username || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Show loading state
    showLoading(submitButton);
    
    try {
        // Make API request to login endpoint
        const response = await apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        // Handle successful login
        if (response.success) {
            // Store session token
            setSessionToken(response.token);
            
            // Show success message
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        }
    } catch (error) {
        // Handle login error
        showMessage(error.message || 'Login failed. Please try again.', 'error');
    } finally {
        // Hide loading state
        hideLoading(submitButton);
    }
}

// Signup Handler
async function handleSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!username || !password || !confirmPassword) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    // Show loading state
    showLoading(submitButton);
    
    try {
        // Make API request to signup endpoint
        const response = await apiRequest('/signup', {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        // Handle successful signup
        if (response.success) {
            // Store session token
            setSessionToken(response.token);
            
            showMessage('Account created successfully!', 'success');
            
            // Redirect to face registration
            setTimeout(() => {
                window.location.href = '/register-face';
            }, 1500);
        }
    } catch (error) {
        // Handle signup error
        showMessage(error.message || 'Signup failed. Please try again.', 'error');
    } finally {
        // Hide loading state
        hideLoading(submitButton);
    }
}

// Password Match Validation
function validatePasswordMatch(passwordInput, confirmPasswordInput) {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword === '') {
        markInputValid(confirmPasswordInput);
        return;
    }
    
    if (password === confirmPassword) {
        markInputValid(confirmPasswordInput);
    } else {
        markInputInvalid(confirmPasswordInput, 'Passwords do not match');
    }
}