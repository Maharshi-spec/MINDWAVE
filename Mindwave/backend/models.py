from database import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    reference_face = db.Column(db.Text, nullable=True)  # Store base64 encoded face image
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    sessions = db.relationship('Session', backref='user', lazy=True)
    emotion_logs = db.relationship('EmotionLog', backref='user', lazy=True)
    
    def __repr__(self):
        return f'<User {self.username}>'

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    duration = db.Column(db.Integer)  # in minutes
    session_type = db.Column(db.String(50))  # meditation, therapy, etc.
    
    def __repr__(self):
        return f'<Session {self.id} for User {self.user_id}>'

class EmotionLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    emotion = db.Column(db.String(50), nullable=False)
    intensity = db.Column(db.Integer)  # 1-10 scale
    notes = db.Column(db.Text)
    
    def __repr__(self):
        return f'<EmotionLog {self.emotion} for User {self.user_id}>'