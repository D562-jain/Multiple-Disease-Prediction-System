import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
import joblib
import os
import logging

logger = logging.getLogger(__name__)

class MLModelManager:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.load_or_train_models()
    
    def load_or_train_models(self):
        """Load existing models or train new ones if they don't exist"""
        model_files = {
            'diabetes': 'diabetes_model.pkl',
            'heart': 'heart_model.pkl',
            'parkinsons': 'parkinsons_model.pkl'
        }
        
        scaler_files = {
            'diabetes': 'diabetes_scaler.pkl',
            'heart': 'heart_scaler.pkl',
            'parkinsons': 'parkinsons_scaler.pkl'
        }
        
        for disease in ['diabetes', 'heart', 'parkinsons']:
            model_path = model_files[disease]
            scaler_path = scaler_files[disease]
            
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                # Load existing models
                self.models[disease] = joblib.load(model_path)
                self.scalers[disease] = joblib.load(scaler_path)
                logger.info(f"Loaded existing {disease} model")
            else:
                # Train new models
                self.train_model(disease)
    
    def train_model(self, disease_type):
        """Train a new model for the specified disease"""
        try:
            if disease_type == 'diabetes':
                self.train_diabetes_model()
            elif disease_type == 'heart':
                self.train_heart_model()
            elif disease_type == 'parkinsons':
                self.train_parkinsons_model()
            
            logger.info(f"Successfully trained {disease_type} model")
        except Exception as e:
            logger.error(f"Error training {disease_type} model: {str(e)}")
    
    def train_diabetes_model(self):
        """Train diabetes prediction model"""
        # Load diabetes dataset
        df = pd.read_csv('data/diabetes.csv')
        
        # Prepare features and target
        X = df.drop('Outcome', axis=1)
        y = df['Outcome']
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale the features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train the model
        model = SVC(kernel='linear', probability=True, random_state=42)
        model.fit(X_train_scaled, y_train)
        
        # Evaluate the model
        y_pred = model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        logger.info(f"Diabetes model accuracy: {accuracy:.4f}")
        
        # Save the model and scaler
        joblib.dump(model, 'diabetes_model.pkl')
        joblib.dump(scaler, 'diabetes_scaler.pkl')
        
        self.models['diabetes'] = model
        self.scalers['diabetes'] = scaler
    
    def train_heart_model(self):
        """Train heart disease prediction model"""
        # Load heart dataset
        df = pd.read_csv('data/heart.csv')
        
        # Prepare features and target
        X = df.drop('target', axis=1)
        y = df['target']
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale the features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train the model
        model = LogisticRegression(random_state=42)
        model.fit(X_train_scaled, y_train)
        
        # Evaluate the model
        y_pred = model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        logger.info(f"Heart disease model accuracy: {accuracy:.4f}")
        
        # Save the model and scaler
        joblib.dump(model, 'heart_model.pkl')
        joblib.dump(scaler, 'heart_scaler.pkl')
        
        self.models['heart'] = model
        self.scalers['heart'] = scaler
    
    def train_parkinsons_model(self):
        """Train Parkinson's disease prediction model"""
        # Load Parkinson's dataset
        df = pd.read_csv('data/parkinsons.csv')
        
        # Prepare features and target
        X = df.drop(['name', 'status'], axis=1)
        y = df['status']
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale the features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train the model
        model = SVC(kernel='linear', probability=True, random_state=42)
        model.fit(X_train_scaled, y_train)
        
        # Evaluate the model
        y_pred = model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        logger.info(f"Parkinson's model accuracy: {accuracy:.4f}")
        
        # Save the model and scaler
        joblib.dump(model, 'parkinsons_model.pkl')
        joblib.dump(scaler, 'parkinsons_scaler.pkl')
        
        self.models['parkinsons'] = model
        self.scalers['parkinsons'] = scaler
    
    def predict(self, disease_type, features):
        """Make a prediction for the specified disease"""
        if disease_type not in self.models:
            raise ValueError(f"Model for {disease_type} not found")
        
        model = self.models[disease_type]
        scaler = self.scalers[disease_type]
        
        # Scale the features
        features_scaled = scaler.transform([features])
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        probability = model.predict_proba(features_scaled)[0]
        
        # Get confidence (max probability)
        confidence = max(probability)
        
        return {
            'prediction': int(prediction),
            'confidence': float(confidence),
            'result': 'positive' if prediction == 1 else 'negative'
        }

# Global instance
ml_manager = MLModelManager()
