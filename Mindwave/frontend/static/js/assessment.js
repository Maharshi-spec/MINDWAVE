// Assessment Page - Behavioral Stress Matrix Engine
// Features: Quad-Factor Analysis (BPM, Micro-Jitter, Blocking, Tension)
class AssessmentEngine {
    constructor() {
        this.videoElement = document.getElementById('assessmentVideo');
        this.canvasElement = document.getElementById('meshCanvas');
        this.canvasCtx = this.canvasElement.getContext('2d');
        this.faceMesh = null;
        this.isRunning = false;

        // UI Elements
        this.faceDetectionStatus = document.getElementById('faceDetectionStatus');
        this.startBtn = document.getElementById('startAssessment');
        this.stopBtn = document.getElementById('stopAssessment');

        // Smoothing Data
        this.smoothedEmotions = { happiness: 0, sadness: 0, anger: 0, fear: 0, neutral: 100 };
        this.smoothedStress = 0;

        // --- QUAD-FACTOR STATE ---
        this.blinkHistory = [];      // Timestamps of blinks (Rolling 60s)
        this.blinkStartTime = 0;     // For tracking duration
        this.isEyeClosed = false;    // Current state
        this.jitterHistory = [];     // For variance calculation

        this.initialize();
    }

    async initialize() {
        this.setupEventListeners();
        await this.initializeFaceMesh();
        await this.startCamera();
    }

    setupEventListeners() {
        if (this.startBtn) this.startBtn.addEventListener('click', () => this.startAssessment());
        if (this.stopBtn) this.stopBtn.addEventListener('click', () => this.stopAssessment());
    }

    async initializeFaceMesh() {
        this.faceMesh = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });
        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        this.faceMesh.onResults((results) => this.onResults(results));
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
            this.videoElement.srcObject = stream;
            this.videoElement.onloadedmetadata = () => {
                this.canvasElement.width = this.videoElement.videoWidth;
                this.canvasElement.height = this.videoElement.videoHeight;
                this.startProcessing();
            };
        } catch (e) {
            console.error("Camera Error:", e);
            this.updateStatus("Camera Error", "error");
        }
    }

    startProcessing() {
        const sendFrame = async () => {
            if (this.videoElement.videoWidth) {
                // --- INSERT THIS BLOCK ---
                // Check brightness every 1 second
                if (!this.lastLightCheck || Date.now() - this.lastLightCheck > 1000) {
                    const ctx = this.canvasCtx;
                    ctx.drawImage(this.videoElement, 0, 0, 20, 20); // Sample small area
                    const p = ctx.getImageData(0, 0, 20, 20).data;
                    let total = 0;
                    for(let i=0; i<p.length; i+=4) total += p[i]; // Sum Red channel
                    this.isLowLight = (total / 400) < 40; // True if dark (< 40 brightness)
                    this.lastLightCheck = Date.now();
                }
                // --- END INSERTION ---
                await this.faceMesh.send({ image: this.videoElement });
            }
            requestAnimationFrame(sendFrame);
        };
        sendFrame();
    }

    onResults(results) {
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            drawConnectors(this.canvasCtx, landmarks, FACEMESH_TESSELATION, { color: '#66fcf1', lineWidth: 1 });
            this.calculateMetrics(landmarks);
            this.updateStatus("Tracking Face", "success");
        } else {
            this.resetEmotions();
            this.updateStatus(this.isLowLight ? "Low Light: Move to brighter area" : "Looking for face...", "warning");
        }
        this.canvasCtx.restore();
    }

    calculateMetrics(landmarks) {
        const width = this.canvasElement.width;
        const height = this.canvasElement.height;

        // 1. ANALYZE EYES (Blink Rate + Blocking)
        const eyes = this.analyzeEyes(landmarks);

        // 2. ANALYZE MOUTH (Tension)
        const lipHeight = this.getDistance(landmarks[13], landmarks[14], 1, 1);
        const mouthWidth = this.getDistance(landmarks[61], landmarks[291], 1, 1);
        const isTense = (lipHeight / mouthWidth) < 0.15; 

        // 3. ANALYZE JITTER (Micro-Tremors)
        let jitterScore = 0;
        if (landmarks[1]) {
            const nose = { x: landmarks[1].x * width, y: landmarks[1].y * height };
            this.jitterHistory.push(nose);
            if (this.jitterHistory.length > 10) this.jitterHistory.shift();

            if (this.jitterHistory.length > 5) {
                let variance = 0;
                for (let i = 1; i < this.jitterHistory.length; i++) {
                    const dx = this.jitterHistory[i].x - this.jitterHistory[i - 1].x;
                    const dy = this.jitterHistory[i].y - this.jitterHistory[i - 1].y;
                    variance += Math.sqrt(dx * dx + dy * dy);
                }
                jitterScore = Math.min(100, (variance / 10) * 50);
            }
        }

        // 4. STRESS CALCULATION
        let stress = 0;
        const bpm = eyes.blinkRate;

        if (bpm < 10) stress = 10;
        else if (bpm < 20) stress = 20;
        else if (bpm < 40) stress = 50;
        else if (bpm < 70) stress = 80;
        else stress = 100;

        if (jitterScore > 30) stress += 15;
        if (eyes.isBlocking) stress += 30;
        if (isTense) stress += 20;

        // 5. EMOTION CALCULATIONS
        const lipDist = this.getDistance(landmarks[61], landmarks[291], width, height);
        let happiness = Math.min(100, Math.max(0, (lipDist - 60) * 4));

        const browDist = this.getDistance(landmarks[105], landmarks[334], width, height);
        let anger = Math.min(100, Math.max(0, (50 - browDist) * 4));
        if (isTense) anger += 20;

        const eyeOpen = this.getDistance(landmarks[159], landmarks[145], width, height);
        let fear = Math.min(100, Math.max(0, (eyeOpen - 12) * 15));
        if (bpm > 40) fear += 30;

        const mouthCenterY = landmarks[13].y * height;
        const cornerY = (landmarks[61].y + landmarks[291].y) / 2 * height;
        const drop = cornerY - mouthCenterY;
        let sadness = Math.min(100, Math.max(0, (drop - 3) * 8));
        if (eyes.isBlocking) sadness += 40;

        const active = happiness + anger + fear + sadness;
        const neutral = Math.max(0, 100 - active);

        this.updateUI(
            { happiness, anger, fear, sadness, neutral },
            Math.min(100, stress)
        );
    }

    analyzeEyes(landmarks) {
        const leftOpen = this.getDistance(landmarks[159], landmarks[145], 1, 1);
        const rightOpen = this.getDistance(landmarks[386], landmarks[374], 1, 1);
        const avgOpen = (leftOpen + rightOpen) / 2;
        const THRESHOLD = 0.008;
        const now = Date.now();

        if (avgOpen < THRESHOLD) {
            if (!this.isEyeClosed) {
                this.blinkStartTime = now;
                this.isEyeClosed = true;
            }
        } else {
            if (this.isEyeClosed) {
                const duration = now - this.blinkStartTime;
                if (duration < 500) {
                    this.blinkHistory.push(now);
                }
                this.isEyeClosed = false;
            }
        }
        this.blinkHistory = this.blinkHistory.filter(t => now - t < 60000);

        return {
            blinkRate: this.blinkHistory.length,
            isBlocking: this.isEyeClosed && (now - this.blinkStartTime > 1000)
        };
    }

    updateUI(emotions, stressLevel) {
        for (let e in emotions) {
            this.smoothedEmotions[e] = (this.smoothedEmotions[e] * 0.85) + (emotions[e] * 0.15);
            const bar = document.querySelector(`[data-emotion="${e}"]`);
            if (bar) {
                bar.style.width = `${this.smoothedEmotions[e]}%`;
                const text = bar.parentElement.nextElementSibling;
                if (text) text.innerText = `${Math.round(this.smoothedEmotions[e])}%`;
            }
        }
        this.smoothedStress = (this.smoothedStress * 0.9) + (stressLevel * 0.1);
        const gauge = document.querySelector('.gauge-fill');
        if (gauge) gauge.style.strokeDashoffset = 205 - (this.smoothedStress * 2.05);

        const label = document.querySelector('.gauge-label');
        if (label) {
            if (this.smoothedStress < 25) label.innerText = "Calm";
            else if (this.smoothedStress < 50) label.innerText = "Alert";
            else if (this.smoothedStress < 75) label.innerText = "High";
            else label.innerText = "Severe";
        }
    }

    getDistance(p1, p2, w, h) {
        return Math.sqrt(Math.pow((p1.x * w) - (p2.x * w), 2) + Math.pow((p1.y * h) - (p2.y * h), 2));
    }

    resetEmotions() {
        this.updateUI({ happiness: 0, anger: 0, fear: 0, sadness: 0, neutral: 0 }, 0);
    }

    updateStatus(msg, type) {
        if (this.faceDetectionStatus) {
            this.faceDetectionStatus.innerText = msg;
            this.faceDetectionStatus.className = `status-${type}`;
        }
    }

    startAssessment() { this.isRunning = true; this.startBtn.disabled = true; this.stopBtn.disabled = false; }
    stopAssessment() { this.isRunning = false; this.startBtn.disabled = false; this.stopBtn.disabled = true; }
}

document.addEventListener('DOMContentLoaded', () => new AssessmentEngine());