# Multiple Disease Prediction System

## Overview

This is a web-based medical prediction system that uses machine learning to predict three diseases: diabetes, heart disease, and Parkinson's disease. The application is built with Flask as the backend framework and provides a professional medical interface for users to input health parameters and receive predictions.

## System Architecture

### Backend Architecture
- **Framework**: Flask with Python 3.11
- **Database**: SQLAlchemy ORM with configurable database (SQLite by default, PostgreSQL for production)
- **Machine Learning**: scikit-learn with joblib for model persistence
- **Web Server**: Gunicorn for production deployment

### Frontend Architecture
- **Templates**: Jinja2 templating engine
- **Styling**: Bootstrap 5.3.0 with custom CSS
- **JavaScript**: Vanilla JavaScript for form handling and API communication
- **Icons**: Font Awesome for medical-themed icons

## Key Components

### 1. Application Core (`app.py`)
- Flask application initialization
- Database configuration with connection pooling
- SQLAlchemy setup with declarative base
- Environment-based configuration (development/production)

### 2. Machine Learning Models (`ml_models.py`)
- MLModelManager class for handling three disease prediction models
- Automatic model loading or training on startup
- Support for diabetes, heart disease, and Parkinson's prediction
- Model persistence using joblib

### 3. Database Models (`models.py`)
- Prediction model for storing user predictions
- Fields: user_name, age, disease_type, prediction_result, confidence, input_data, timestamp
- Automatic timestamp tracking for audit purposes

### 4. API Routes (`routes.py`)
- RESTful API endpoints for disease predictions
- Input validation and error handling
- Structured response format with confidence scores
- Database persistence of all predictions

### 5. Frontend Interface
- Professional medical application design
- Responsive Bootstrap-based layout
- Disease-specific prediction forms
- Real-time prediction results display

## Data Flow

1. **User Input**: User selects disease type and fills out specific health parameters
2. **Frontend Validation**: JavaScript validates form data before submission
3. **API Request**: AJAX POST request to `/api/predict/<disease_type>`
4. **Backend Processing**: 
   - Input validation and sanitization
   - Feature preparation specific to disease type
   - ML model prediction
   - Database storage of prediction
5. **Response**: JSON response with prediction result and confidence
6. **Display**: Frontend updates with prediction results

## External Dependencies

### Python Packages
- **Flask**: Web framework
- **Flask-SQLAlchemy**: ORM for database operations
- **scikit-learn**: Machine learning algorithms
- **pandas/numpy**: Data processing
- **joblib**: Model serialization
- **gunicorn**: WSGI server for production
- **psycopg2-binary**: PostgreSQL adapter

### Frontend Libraries
- **Bootstrap 5.3.0**: CSS framework
- **Font Awesome 6.4.0**: Icon library
- **jQuery**: JavaScript utilities (via Bootstrap)

### Dataset Sources
- **Diabetes**: Pima Indians Diabetes Dataset
- **Heart Disease**: UCI Heart Disease Dataset  
- **Parkinson's**: UCI Parkinson's Dataset

## Deployment Strategy

### Development Environment
- SQLite database for local development
- Flask development server with debug mode
- Hot reload enabled for rapid development

### Production Environment
- PostgreSQL database with connection pooling
- Gunicorn WSGI server with multiple workers
- Autoscale deployment target on Replit
- Environment variables for configuration
- ProxyFix middleware for proper header handling

### Database Migration
- Automatic table creation on startup
- Environment-based database URL configuration
- Support for both SQLite (dev) and PostgreSQL (production)

### Model Training Strategy
- Models are trained automatically if not found
- Pre-trained models can be loaded from disk
- Fallback training using provided datasets
- Model versioning through file timestamps

