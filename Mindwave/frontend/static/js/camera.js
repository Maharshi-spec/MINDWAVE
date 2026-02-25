// Camera and Face Registration Logic

document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const startCameraBtn = document.getElementById('startCamera');
    const captureCompleteBtn = document.getElementById('captureComplete');
    
    let stream = null;
    
    // Event listeners
    if (startCameraBtn) {
        startCameraBtn.addEventListener('click', startCamera);
    }
    
    if (captureCompleteBtn) {
        captureCompleteBtn.addEventListener('click', captureAndComplete);
    }
});

// Start camera function
async function startCamera() {
    const startCameraBtn = document.getElementById('startCamera');
    const captureCompleteBtn = document.getElementById('captureComplete');
    const video = document.getElementById('video');
    
    try {
        showLoading(startCameraBtn);
        
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 1280 },
                facingMode: 'user'
            } 
        });
        
        video.srcObject = stream;
        
        // Enable capture button when video loads
        video.onloadedmetadata = function() {
            hideLoading(startCameraBtn);
            startCameraBtn.disabled = true;
            captureCompleteBtn.disabled = false;
            
            // Set canvas to fixed 400x400 size to match circular container
            canvas.width = 400;
            canvas.height = 400;
            
            showMessage('Camera ready! Position your face in the circle.', 'success');
        };
        
    } catch (error) {
        hideLoading(startCameraBtn);
        console.error('Error accessing camera:', error);
        showMessage('Could not access camera. Please check permissions.', 'error');
    }
}

// Capture and complete registration
async function captureAndComplete() {
    const captureCompleteBtn = document.getElementById('captureComplete');
    const video = document.getElementById('video');
    
    if (!video || !stream) {
        showMessage('Please start the camera first', 'error');
        return;
    }
    
    showLoading(captureCompleteBtn);
    
    try {
        // Create canvas to capture the image
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 data URL
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Send to backend
        const response = await apiRequest('/register-face', {
            method: 'POST',
            body: JSON.stringify({
                face_image: imageData
            })
        });
        
        if (response.success) {
            showMessage('Face registered successfully!', 'success');
            
            // Stop camera stream
            stopCamera();
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        }
    } catch (error) {
        showMessage(error.message || 'Failed to register face', 'error');
    } finally {
        hideLoading(captureCompleteBtn);
    }
}

// Stop camera function
function stopCamera() {
    const startCameraBtn = document.getElementById('startCamera');
    const captureCompleteBtn = document.getElementById('captureComplete');
    const video = document.getElementById('video');
    
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    if (video) {
        video.srcObject = null;
    }
    
    // Reset buttons
    if (startCameraBtn) startCameraBtn.disabled = false;
    if (captureCompleteBtn) captureCompleteBtn.disabled = true;
}