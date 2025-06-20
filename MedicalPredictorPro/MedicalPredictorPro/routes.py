from flask import render_template, request, jsonify, flash, redirect, url_for
from app import app, db
from models import Prediction
from ml_models import ml_manager
import json
import logging

logger = logging.getLogger(__name__)

@app.route('/')
def index():
    """Main page with navigation to different sections"""
    return render_template('index.html')

@app.route('/api/predict/<disease_type>', methods=['POST'])
def predict_disease(disease_type):
    """API endpoint for disease prediction"""
    try:
        if disease_type not in ['diabetes', 'heart', 'parkinsons']:
            return jsonify({'error': 'Invalid disease type'}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract common fields
        user_name = data.get('user_name', '').strip()
        age = data.get('age')
        
        if not user_name:
            return jsonify({'error': 'User name is required'}), 400
        
        if not age or not isinstance(age, (int, float)) or age <= 0:
            return jsonify({'error': 'Valid age is required'}), 400
        
        # Prepare features based on disease type
        try:
            if disease_type == 'diabetes':
                features = prepare_diabetes_features(data)
            elif disease_type == 'heart':
                features = prepare_heart_features(data)
            elif disease_type == 'parkinsons':
                features = prepare_parkinsons_features(data)
            else:
                return jsonify({'error': 'Invalid disease type'}), 400
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
        # Make prediction
        result = ml_manager.predict(disease_type, features)
        
        # Save prediction to database
        prediction = Prediction(
            user_name=user_name,
            age=int(age),
            disease_type=disease_type,
            prediction_result=result['result'],
            confidence=result['confidence'],
            input_data=json.dumps(data)
        )
        db.session.add(prediction)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'prediction': result['result'],
            'confidence': round(result['confidence'] * 100, 2),
            'message': f'Prediction completed for {user_name}'
        })
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

def prepare_diabetes_features(data):
    """Prepare features for diabetes prediction"""
    required_fields = [
        'pregnancies', 'glucose', 'blood_pressure', 'skin_thickness',
        'insulin', 'bmi', 'diabetes_pedigree_function', 'age'
    ]
    
    features = []
    for field in required_fields:
        value = data.get(field)
        if value is None:
            raise ValueError(f'Missing required field: {field}')
        features.append(float(value))
    
    return features

def prepare_heart_features(data):
    """Prepare features for heart disease prediction"""
    required_fields = [
        'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
        'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
    ]
    
    features = []
    for field in required_fields:
        value = data.get(field)
        if value is None:
            raise ValueError(f'Missing required field: {field}')
        features.append(float(value))
    
    return features

def prepare_parkinsons_features(data):
    """Prepare features for Parkinson's disease prediction"""
    required_fields = [
        'mdvp_fo', 'mdvp_fhi', 'mdvp_flo', 'mdvp_jitter_percent',
        'mdvp_jitter_abs', 'mdvp_rap', 'mdvp_ppq', 'jitter_ddp',
        'mdvp_shimmer', 'mdvp_shimmer_db', 'shimmer_apq3', 'shimmer_apq5',
        'mdvp_apq', 'shimmer_dda', 'nhr', 'hnr', 'rpde', 'dfa',
        'spread1', 'spread2', 'd2', 'ppe'
    ]
    
    features = []
    for field in required_fields:
        value = data.get(field)
        if value is None:
            raise ValueError(f'Missing required field: {field}')
        features.append(float(value))
    
    return features

@app.route('/history')
def prediction_history():
    """View prediction history"""
    predictions = Prediction.query.order_by(Prediction.created_at.desc()).limit(50).all()
    return render_template('history.html', predictions=predictions)

@app.errorhandler(404)
def not_found(error):
    return render_template('index.html'), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500
