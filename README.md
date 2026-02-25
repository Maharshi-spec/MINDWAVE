# Mindwave 2.0

A comprehensive mental health and emotional well-being monitoring application that uses facial recognition and real-time emotion detection to assess and track user stress levels and emotional states.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Frontend Features](#frontend-features)
10. [Usage Guide](#usage-guide)
11. [Key Components](#key-components)
12. [Development](#development)
13. [Troubleshooting](#troubleshooting)
14. [Future Improvements](#future-improvements)
15. [License](#license)

## Overview

Mindwave 2.0 is an advanced mental health monitoring system designed to help users track their emotional well-being and stress levels in real-time. The application combines facial recognition technology with behavioral analysis to provide insights into emotional states and stress patterns. Users can register with facial biometrics, undergo stress assessments, and maintain a dashboard of their emotional logs.

The application is built with a Flask backend and vanilla JavaScript frontend, utilizing MediaPipe for face detection and analysis, and SQLite for data persistence.

## Features

### Core Features

1. **User Authentication System**
   - Secure user registration with username and password
   - Login authentication with session management
   - Password hashing using PBKDF2-SHA512 with salt
   - Last login tracking
   - Session persistence

2. **Facial Recognition & Registration**
   - Real-time camera access and face capture
   - Base64 encoded face image storage
   - Face registration for biometric authentication
   - User-friendly face registration interface with circular preview

3. **Emotional Assessment Engine**
   - Real-time emotion detection using MediaPipe Face Mesh
   - Multi-factor behavioral stress analysis
   - Quad-Factor Analysis:
     - **BPM (Blink Per Minute)**: Tracks eye blinks for stress indicators
     - **Micro-Jitter**: Analyzes subtle facial micro-movements
     - **Blocking**: Detects facial tensioning and blockages
     - **Tension**: Measures overall facial muscle tension
   - Emotion categories: Happiness, Sadness, Anger, Fear, Neutral
   - Real-time emotion smoothing for accuracy

4. **Session Management**
   - Track meditation, therapy, and assessment sessions
   - Record session duration
   - Session type categorization
   - Start and end time logging

5. **Emotion Logging**
   - Log emotions with intensity levels (1-10 scale)
   - Timestamp automatic recording
   - Personal notes for each emotion entry
   - Historical emotion tracking
   - Emotion correlation analysis

6. **User Dashboard**
   - Personalized user greeting
   - View emotional history
   - Session statistics
   - Stress trend visualization
   - Quick access to assessment features

## Technology Stack

### Backend
- **Framework**: Flask 2.3.3
- **Database ORM**: Flask-SQLAlchemy 3.0.5
- **Database**: SQLite3
- **Language**: Python 3.x
- **Password Hashing**: PBKDF2-SHA512 with salt
- **Server**: Development server (Flask built-in)

### Frontend
- **HTML5**: Semantic markup for responsive design
- **CSS3**: Custom styling with animations
- **JavaScript**: Vanilla JavaScript (No frameworks)
- **Face Detection**: MediaPipe Face Mesh
- **Camera Access**: WebRTC getUserMedia API
- **Canvas API**: Real-time video rendering and face mesh visualization

### Architecture
- **Pattern**: Model-View-Controller (MVC)
- **Authentication**: Session-based
- **API**: RESTful JSON API
- **Database**: Relational (SQLite)

## Project Structure

```
Mindwave 2.0/
├── Mindwave/
│   ├── backend/
│   │   ├── app.py                 # Flask application with routes
│   │   ├── config.py              # Configuration management
│   │   ├── database.py            # SQLAlchemy database initialization
│   │   ├── models.py              # Database models (User, Session, EmotionLog)
│   │   ├── requirements.txt       # Python dependencies
│   │   ├── __pycache__/           # Python cache
│   │   └── instance/              # Instance-specific data
│   │
│   └── frontend/
│       ├── static/
│       │   ├── assets/            # Images and media files
│       │   ├── css/
│       │   │   ├── animations.css # Animation styles
│       │   │   ├── auth.css       # Authentication page styles
│       │   │   └── style.css      # Main stylesheet
│       │   └── js/
│       │       ├── assessment.js       # Assessment engine (248 lines)
│       │       ├── assessment_backup.js # Backup assessment logic
│       │       ├── auth.js            # Authentication logic
│       │       ├── camera.js          # Camera and face registration
│       │       └── main.js            # Main application logic
│       │
│       └── templates/
│           ├── landing.html       # Home/landing page
│           ├── login.html         # User login form
│           ├── signup.html        # User registration form
│           ├── face_register.html # Facial registration page
│           ├── assessment.html    # Stress assessment interface
│           └── dashboard.html     # User dashboard
│
└── README.md                       # This file
```

## Installation

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)
- Modern web browser with camera access (Chrome, Firefox, Edge, Safari)
- Windows/Mac/Linux operating system

### Backend Setup

1. **Navigate to project directory**
   ```bash
   cd "d:\programing\Mindwave 2.0\Mindwave\backend"
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create the database**
   ```bash
   python app.py
   ```
   This will create the SQLite database and all necessary tables.

4. **Start the Flask server**
   ```bash
   python app.py
   ```
   The server will run on `http://localhost:5000` by default.

### Frontend Setup

The frontend is served by Flask and requires no additional installation. Simply open your browser and navigate to:

```
http://localhost:5000
```

## Configuration

### Backend Configuration

Edit [config.py](Mindwave/backend/config.py) to customize application settings:

```python
class Config:
    SECRET_KEY = 'your-secret-key-here'  # Change in production
    SQLALCHEMY_DATABASE_URI = 'sqlite:///site.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
```

### Environment Variables

Set these environment variables to override default configuration:

- `SECRET_KEY`: Flask session encryption key (required for production)
- `DATABASE_URL`: Database connection string (default: sqlite:///site.db)
- `MAIL_SERVER`: SMTP server for email notifications (optional)
- `MAIL_PORT`: SMTP port (optional)
- `MAIL_USERNAME`: SMTP username (optional)
- `MAIL_PASSWORD`: SMTP password (optional)

### Security Configuration

For production deployment:

1. **Change the SECRET_KEY**:
   - Use a cryptographically secure random string
   - Minimum 32 characters recommended
   - Store in environment variables

2. **Update SQLALCHEMY_TRACK_MODIFICATIONS**:
   - Set to `False` for performance

3. **Enable HTTPS**:
   - Use a reverse proxy like Nginx
   - Install SSL certificates

## Database Schema

### User Model

```python
class User(db.Model):
    id                  : Integer (Primary Key)
    username            : String(80) - Unique, Required
    password_hash       : String(120) - Required (PBKDF2-SHA512)
    email               : String(120) - Optional, Unique
    reference_face      : Text - Base64 encoded face image (Optional)
    created_at          : DateTime - Auto-generated
    last_login          : DateTime - Updated on login
    
    Relationships:
    - sessions          : One-to-Many with Session
    - emotion_logs      : One-to-Many with EmotionLog
```

### Session Model

```python
class Session(db.Model):
    id                  : Integer (Primary Key)
    user_id             : Integer (Foreign Key to User)
    start_time          : DateTime - Auto-generated
    end_time            : DateTime - Optional
    duration            : Integer - In minutes (Optional)
    session_type        : String(50) - meditation/therapy/assessment
    
    Relationships:
    - user              : Many-to-One with User
```

### EmotionLog Model

```python
class EmotionLog(db.Model):
    id                  : Integer (Primary Key)
    user_id             : Integer (Foreign Key to User)
    timestamp           : DateTime - Auto-generated
    emotion             : String(50) - Required
    intensity           : Integer - 1-10 scale (Optional)
    notes               : Text - User notes (Optional)
    
    Relationships:
    - user              : Many-to-One with User
```

### Password Hashing

The application uses PBKDF2-HMAC-SHA512 with 100,000 iterations:

```python
salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt, 100000)
password_hash = (salt + pwdhash).decode('ascii')
```

## API Endpoints

### Authentication Routes

#### GET `/`
- **Description**: Landing page
- **Response**: HTML landing page
- **Authentication**: Not required

#### GET `/login`
- **Description**: Login page
- **Response**: HTML login form
- **Authentication**: Not required

#### POST `/login`
- **Description**: User login
- **Content-Type**: application/json
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "user_id"
  }
  ```
- **Error Response (401)**:
  ```json
  {
    "success": false,
    "message": "Invalid credentials"
  }
  ```
- **Authentication**: Not required

#### GET `/signup`
- **Description**: Signup page
- **Response**: HTML signup form
- **Authentication**: Not required

#### POST `/signup`
- **Description**: User registration
- **Content-Type**: application/json
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "message": "User created successfully",
    "token": "user_id"
  }
  ```
- **Error Response (400)**:
  ```json
  {
    "success": false,
    "message": "Username and password required"
  }
  ```
- **Authentication**: Not required

### Face Registration Routes

#### GET `/register-face`
- **Description**: Face registration page
- **Response**: HTML face registration form with camera
- **Authentication**: Required (user_id in session)

#### POST `/register-face`
- **Description**: Register user's face biometric
- **Content-Type**: application/json
- **Request Body**:
  ```json
  {
    "face_image": "base64_encoded_image_string"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Face registered successfully"
  }
  ```
- **Error Response (401)**:
  ```json
  {
    "success": false,
    "message": "Not authenticated"
  }
  ```
- **Authentication**: Required

### Assessment Routes

#### GET `/assessment`
- **Description**: Stress assessment page
- **Response**: HTML assessment interface with video/canvas
- **Authentication**: Required (redirects to login if not authenticated)
- **Features**:
  - Real-time video capture
  - Face mesh detection
  - Emotion detection
  - Stress analysis
  - Behavioral metrics (BPM, Jitter, Blocking, Tension)

#### GET `/dashboard`
- **Description**: User dashboard
- **Response**: HTML dashboard with user data
- **Authentication**: Required (redirects to login if not authenticated)
- **Features**:
  - Personalized greeting with username
  - Session history
  - Emotion logs display
  - Stress trends
  - Assessment results

## Frontend Features

### Landing Page (`landing.html`)
- Welcome message and application overview
- Feature highlights
- Call-to-action buttons (Login/Signup)
- Responsive design
- Modern animations

### Authentication Pages (`login.html`, `signup.html`)
- Clean, intuitive form design
- Real-time form validation
- Error message display
- Success notifications
- Responsive forms
- User-friendly input fields

### Face Registration (`face_register.html`)
- Real-time camera preview
- Circular face detection frame
- Capture button for face image
- Visual feedback for camera status
- Loading indicators
- Success/error messages

### Assessment Interface (`assessment.html`)
- Real-time video streaming
- Canvas overlay for face mesh visualization
- Start/Stop assessment buttons
- Emotion detection display
- Stress level indicators
- Real-time metrics:
  - Blink rate (BPM)
  - Facial jitter measurements
  - Tension levels
  - Mental state analysis
- Session history
- Downloadable reports

### User Dashboard (`dashboard.html`)
- Personalized greeting
- Quick stats overview
- Recent emotion logs
- Session history
- Stress trend charts
- Export functionality
- Settings access

### Styling (`css/`)
- **style.css**: Main stylesheet with component styles
- **auth.css**: Authentication specific styles
- **animations.css**: CSS animations and transitions

### JavaScript Modules

#### assessment.js (248 lines)
The core assessment engine implementing quad-factor behavioral stress analysis:

**Key Features**:
- `AssessmentEngine` class for managing assessment lifecycle
- Face mesh detection and tracking
- Emotion classification system
- Blink history tracking (60-second rolling window)
- Micro-jitter capture and analysis
- Facial blocking detection
- Tension measurement
- Real-time data smoothing
- Canvas rendering of face mesh
- Start/Stop assessment controls
- Result compilation and display

**Key Methods**:
- `initialize()`: Setup and initialization
- `initializeFaceMesh()`: Load MediaPipe Face Mesh model
- `startCamera()`: Access user's webcam
- `startAssessment()`: Begin stress assessment
- `stopAssessment()`: End assessment and compile results
- `onResults()`: MediaPipe detection results handler
- `detectBlinks()`: Track eye closure patterns
- `calculateJitter()`: Analyze facial micro-movements
- `detectBlocking()`: Identify facial tension blockages
- `calculateTension()`: Measure facial muscle tension

#### camera.js (129 lines)
Facial registration and camera management:

**Key Features**:
- Real-time camera access
- Canvas-based face capture
- Image encoding (Base64)
- Camera stream management
- Visual feedback on camera status
- Circular preview for face alignment
- Client-side image processing

**Key Methods**:
- `startCamera()`: Initialize camera stream
- `captureAndComplete()`: Capture face image and send to server
- `getImageFromVideo()`: Extract current frame from video stream
- `showLoading()` / `hideLoading()`: Loading state management
- `showMessage()` / `clearMessage()`: User feedback

#### auth.js
Authentication flow management:

**Key Features**:
- Login form submission handling
- Signup form validation
- Session management
- Token storage (localStorage/sessionStorage)
- Redirect on authentication
- Error handling
- Success notifications

#### main.js
Application initialization and main logic:

**Key Features**:
- Page initialization
- Navigation handling
- Global event listeners
- Utility functions
- API request handling
- User session verification

## Usage Guide

### For New Users

1. **Access the Application**
   - Open your browser and navigate to `http://localhost:5000`
   - You'll see the landing page with application overview

2. **Create an Account**
   - Click "Sign Up" button
   - Enter your username and password
   - Click "Create Account"
   - You'll be automatically logged in

3. **Register Your Face**
   - After signup, navigate to "Face Registration"
   - Click "Start Camera" to activate your webcam
   - Position your face in the circular frame
   - Click "Capture Complete" to save your face biometric
   - You'll see a success message

4. **Perform Stress Assessment**
   - Go to "Assessment" section
   - Click "Start Assessment"
   - Position your face in front of camera
   - The system will analyze your emotional state for the specified duration
   - Stop the assessment when complete
   - View your results and metrics

5. **View Dashboard**
   - Access your personalized dashboard
   - See your emotional history
   - Review session statistics
   - Track stress trends

### For Returning Users

1. **Login**
   - Click "Login"
   - Enter your credentials
   - System will authenticate and create session

2. **Continue Assessment**
   - Access assessment page directly
   - Previous sessions and emotions are preserved

3. **Track Progress**
   - Review historical emotion logs
   - Analyze stress patterns over time
   - Compare assessment results

## Key Components

### SecurityFeatures

- **Password Hashing**: PBKDF2-HMAC-SHA512 with 100,000 iterations
- **Salt Generation**: Cryptographic random salt for each password
- **Session Management**: Flask session-based authentication
- **Input Validation**: Server-side validation of all inputs
- **SQL Injection Prevention**: SQLAlchemy parameterized queries
- **CORS**: Should be configured for production

### Real-Time Processing

- **MediaPipe Integration**: Fast face detection and landmark tracking
- **Canvas Rendering**: Real-time visualization of face mesh
- **Data Smoothing**: Exponential moving average for emotion metrics
- **Event-Driven**: Efficient event listener architecture

### Database Features

- **ORM**: SQLAlchemy for type-safe queries
- **Relationships**: Configured foreign key relationships
- **Timestamps**: Automatic datetime tracking
- **Indexing**: Implicit indexing on primary/foreign keys

## Development

### Running in Development Mode

```bash
cd "d:\programing\Mindwave 2.0\Mindwave\backend"
python app.py
```

The Flask development server includes:
- Auto-reload on code changes
- Debugger enabled
- Detailed error pages
- Request/response logging

### Debugging

1. **Backend Debugging**:
   - Flask debug messages printed to console
   - Enable verbose logging in app.py
   - Use Python debugger (pdb) for breakpoints

2. **Frontend Debugging**:
   - Browser Developer Tools (F12)
   - Console for JavaScript errors
   - Network tab for API requests
   - Application tab for session storage

3. **Database Debugging**:
   - Query logging with SQLAlchemy echo
   - SQLite browser tools for direct inspection

### Testing Recommendations

1. **Manual Testing**:
   - Test signup/login flow
   - Verify face registration
   - Run multiple assessments
   - Check emotion logging

2. **Integration Testing**:
   - Test session persistence
   - Verify authentication flow
   - Check data relationships

3. **Performance Testing**:
   - Monitor assessment CPU usage
   - Check memory consumption
   - Measure response times

### Code Style

- **Backend**: PEP 8 Python style guide
- **Frontend**: Consistent JavaScript conventions
- **HTML**: Semantic markup
- **CSS**: BEM-like naming conventions

## Troubleshooting

### Common Issues and Solutions

#### 1. Camera Access Denied

**Problem**: "Camera permission denied" error

**Solutions**:
- Check browser camera permissions
- Allow camera access in OS settings
- Use HTTPS for production (browsers require HTTPS for camera)
- Try a different browser

#### 2. Face Detection Not Working

**Problem**: "Face not detected" in assessment

**Solutions**:
- Ensure good lighting
- Position face directly toward camera
- Remove sunglasses or hats
- Move closer to camera
- Check MediaPipe initialization

#### 3. Database Errors

**Problem**: "Database is locked" or connection errors

**Solutions**:
```bash
# Delete old database and recreate
del instance\site.db
python app.py
```

#### 4. Flask Server Won't Start

**Problem**: "Address already in use" or port conflicts

**Solutions**:
```bash
# Change port in app.py
app.run(debug=True, port=5001)

# Or kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

#### 5. Missing Dependencies

**Problem**: "ModuleNotFoundError" when running app

**Solutions**:
```bash
pip install -r requirements.txt
pip install --upgrade --force-reinstall Flask Flask-SQLAlchemy
```

#### 6. Session Expires on Page Reload

**Problem**: User logged out when refreshing page

**Solutions**:
- Check browser cookie settings
- Verify SESSION_PERMANENT in config
- Increase SESSION_TIMEOUT_HOURS
- Clear browser cache

#### 7. CORS Issues (Production)

**Problem**: Frontend blocked by CORS policy

**Solutions**:
- Install Flask-CORS:
  ```bash
  pip install Flask-CORS
  ```
- Add to app.py:
  ```python
  from flask_cors import CORS
  CORS(app)
  ```

### Performance Issues

#### High CPU Usage During Assessment

**Solutions**:
- Reduce video resolution
- Disable continuous face mesh rendering
- Increase analysis interval
- Use browser hardware acceleration

#### Slow Database Queries

**Solutions**:
- Add indexes to frequently queried columns
- Limit result set with pagination
- Archive old emotion logs
- Use database query optimization

#### Memory Leaks

**Solutions**:
- Properly close video streams
- Clear canvas contexts
- Release MediaPipe resources
- Monitor browser memory in DevTools

### Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebRTC | ✅ | ✅ | ✅ | ✅ |
| Canvas | ✅ | ✅ | ✅ | ✅ |
| MediaPipe | ✅ | ✅ | ✅ | ✅ |
| LocalStorage | ✅ | ✅ | ✅ | ✅ |

## Future Improvements

### Planned Features

1. **Enhanced Emotion Detection**
   - Multi-face detection for group sessions
   - Facial expression intensity measurement
   - Micro-expression analysis
   - Heart rate estimation from video

2. **Advanced Analytics**
   - Long-term trend analysis
   - Predictive stress forecasting
   - Emotion correlation patterns
   - Personalized recommendations

3. **Social Features**
   - Group meditation sessions
   - Shared progress tracking
   - Community challenges
   - Expert consultation booking

4. **Integration**
   - Wearable device integration (Apple Watch, Fitbit)
   - Calendar integration for stress periods
   - Email notifications
   - Mobile app version

5. **Security Enhancements**
   - Two-factor authentication
   - Biometric login
   - Encryption of stored face images
   - GDPR compliance features
   - Data export functionality

6. **Performance**
   - React/Vue frontend migration
   - WebSocket real-time updates
   - Database query optimization
   - Caching layer (Redis)
   - Load balancing

7. **Admin Features**
   - User management dashboard
   - Analytics for admins
   - System monitoring
   - Backup and recovery tools

8. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - High contrast mode
   - Multiple language support

9. **Testing**
   - Unit tests with pytest
   - Integration tests
   - E2E tests with Selenium
   - Load testing

10. **Deployment**
    - Docker containerization
    - CI/CD pipeline (GitHub Actions)
    - Cloud deployment options (AWS, Azure, GCP)
    - Kubernetes orchestration

### Potential Improvements

- **Database**: Migrate to PostgreSQL for scalability
- **API**: Transition to GraphQL
- **Frontend**: Implement TypeScript and React
- **Authentication**: OAuth2/OpenID Connect
- **Monitoring**: Application performance monitoring (APM)
- **Logging**: Centralized logging system (ELK Stack)

## License

This project is proprietary software. All rights reserved.

For questions regarding usage rights, contact the development team.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Code Style**:
   - Follow PEP 8 for Python
   - Use consistent JavaScript conventions
   - Document complex functions

2. **Commits**:
   - Write descriptive commit messages
   - Keep commits atomic
   - Reference issues when applicable

3. **Pull Requests**:
   - Provide clear description of changes
   - Include before/after for UI changes
   - Test thoroughly before submitting
   - Ensure backward compatibility

4. **Testing**:
   - Add tests for new features
   - Ensure all tests pass
   - Maintain code coverage

## Support

For issues, questions, or feature requests:

1. Check this README for solutions
2. Review the troubleshooting section
3. Check browser console for errors
4. Contact the development team

## Changelog

### Version 2.0 (Current)
- Face recognition with biometric registration
- Quad-factor behavioral stress analysis
- Real-time emotion detection
- Session management
- User authentication system
- Emotion logging system
- User dashboard
- Responsive design

### Version 1.0 (Previous)
- Basic user authentication
- Initial emotion detection
- Simple session tracking
