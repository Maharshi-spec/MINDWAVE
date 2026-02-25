from flask import Flask, render_template, request, jsonify, session, redirect
from database import db
from models import User
import os
import hashlib
import binascii

def create_app():
    app = Flask(__name__, 
                template_folder='../frontend/templates',
                static_folder='../frontend/static')
    
    # Configuration
    app.config['SECRET_KEY'] = 'your-secret-key-here-change-in-production'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database
    db.init_app(app)
    
    # Routes
    @app.route('/')
    def landing():
        return render_template('landing.html')
    
    @app.route('/login')
    def login_page():
        return render_template('login.html')
    
    @app.route('/signup')
    def signup_page():
        return render_template('signup.html')
    
    @app.route('/register-face')
    def register_face_page():
        return render_template('face_register.html')
    
    @app.route('/assessment')
    def assessment():
        # Check if user is logged in
        if 'user_id' not in session:
            return redirect('/login')
        
        return render_template('assessment.html')
    
    @app.route('/dashboard')
    def dashboard():
        # Check if user is logged in
        if 'user_id' not in session:
            return redirect('/login')
        
        # In a real app, you'd fetch user data here
        username = session.get('username', 'User')
        return render_template('dashboard.html', username=username)
    
    # API Routes
    @app.route('/signup', methods=['POST'])
    def signup():
        try:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
            
            # Validate input
            if not username or not password:
                return jsonify({'success': False, 'message': 'Username and password required'}), 400
            
            # Check if user already exists
            if User.query.filter_by(username=username).first():
                return jsonify({'success': False, 'message': 'Username already exists'}), 400
            
            # Hash password
            salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
            pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt, 100000)
            pwdhash = binascii.hexlify(pwdhash)
            password_hash = (salt + pwdhash).decode('ascii')
            
            # Create user
            user = User(username=username, password_hash=password_hash)
            db.session.add(user)
            db.session.commit()
            
            # Create session
            session['user_id'] = user.id
            session['username'] = user.username
            
            return jsonify({
                'success': True, 
                'message': 'User created successfully',
                'token': str(user.id)  # Simple token for now
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 500
    
    @app.route('/login', methods=['POST'])
    def login():
        try:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
            
            # Validate input
            if not username or not password:
                return jsonify({'success': False, 'message': 'Username and password required'}), 400
            
            # Find user
            user = User.query.filter_by(username=username).first()
            if not user:
                return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
            
            # Verify password
            salt = user.password_hash[:64]
            stored_password = user.password_hash[64:]
            pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt.encode('ascii'), 100000)
            pwdhash = binascii.hexlify(pwdhash).decode('ascii')
            
            if pwdhash != stored_password:
                return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
            
            # Update last login
            from datetime import datetime
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            # Create session
            session['user_id'] = user.id
            session['username'] = user.username
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'token': str(user.id)
            }), 200
            
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
    
    @app.route('/register-face', methods=['POST'])
    def register_face():
        try:
            # Check if user is logged in
            if 'user_id' not in session:
                return jsonify({'success': False, 'message': 'Not authenticated'}), 401
            
            data = request.get_json()
            face_image = data.get('face_image')
            
            if not face_image:
                return jsonify({'success': False, 'message': 'Face image required'}), 400
            
            # Get current user
            user = User.query.get(session['user_id'])
            if not user:
                return jsonify({'success': False, 'message': 'User not found'}), 404
            
            # Save face image (store base64 string)
            user.reference_face = face_image
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Face registered successfully'
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 500
    
    return app

def create_db():
    """Create database tables if they don't exist"""
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created successfully!")

if __name__ == '__main__':
    app = create_app()
    create_db()
    app.run(debug=True)