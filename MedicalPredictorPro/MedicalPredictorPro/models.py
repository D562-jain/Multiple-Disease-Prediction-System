from app import db
from datetime import datetime

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    disease_type = db.Column(db.String(50), nullable=False)  # 'diabetes', 'heart', 'parkinsons'
    prediction_result = db.Column(db.String(20), nullable=False)  # 'positive', 'negative'
    confidence = db.Column(db.Float)
    input_data = db.Column(db.Text)  # JSON string of input parameters
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Prediction {self.user_name} - {self.disease_type}: {self.prediction_result}>'
