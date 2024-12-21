try:
    import numpy as np
    import pandas as pd
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.preprocessing import StandardScaler
    from datetime import datetime, timedelta
    from typing import Dict, List, TypedDict, Optional, Union

    class PerformanceMetrics(TypedDict):
        rating: float
        completedTrips: int
        onTimePercentage: float
        totalPoints: int
        currentStreak: int
        hour_of_day: int
        day_of_week: int
        month: int
        temperature: Optional[float]
        precipitation: Optional[float]
except ImportError as e:
    print(f"Error importing required modules: {str(e)}")
    raise

class DriverPerformancePredictor:
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            random_state=42,
            n_jobs=-1  # Use all available cores
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = [
            'rating', 'completed_trips', 'ontime_percentage',
            'total_points', 'current_streak', 'hour_of_day',
            'day_of_week', 'month', 'temperature', 'precipitation'
        ]

    def _prepare_features(self, historical_data: List[Dict]) -> np.ndarray:
        try:
            features = []
            for data in historical_data:
                # Extract relevant features with proper type conversion
                feature_vector = [
                    float(data.get('rating', 0)),
                    int(data.get('completedTrips', 0)),
                    float(data.get('onTimePercentage', 0)),
                    int(data.get('totalPoints', 0)),
                    int(data.get('currentStreak', 0)),
                    # Time-based features
                    int(data.get('hour_of_day', 0)),
                    int(data.get('day_of_week', 0)),
                    int(data.get('month', 0)),
                    # Weather conditions (if available)
                    float(data.get('temperature', 20)),  # default temp
                    float(data.get('precipitation', 0)),  # default no rain
                ]
                features.append(feature_vector)
            
            # Convert to numpy array with proper shape checking
            features_array = np.array(features)
            if features_array.shape[1] != len(self.feature_names):
                raise ValueError(f"Feature vector length mismatch. Expected {len(self.feature_names)}, got {features_array.shape[1]}")
            
            return features_array
        except (ValueError, TypeError) as e:
            raise ValueError(f"Error preparing features: {str(e)}")

    def train(self, historical_data: List[Dict], target_metric: str) -> None:
        """Train the model on historical driver performance data"""
        try:
            if not historical_data:
                raise ValueError("No historical data provided for training")

            X = self._prepare_features(historical_data)
            y = np.array([float(d.get(target_metric, 0)) for d in historical_data])

            if len(X) != len(y):
                raise ValueError("Feature and target arrays must have the same length")

            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model.fit(X_scaled, y)
            self.is_trained = True
        except Exception as e:
            self.is_trained = False
            raise ValueError(f"Error training model: {str(e)}")

    def predict(self, current_data: Dict, prediction_hours: int = 24) -> List[Dict]:
        """Predict driver performance metrics for the next N hours"""
        try:
            if not self.is_trained:
                raise ValueError("Model needs to be trained before making predictions")

            predictions = []
            current_time = datetime.now()

            # Validate prediction hours
            prediction_hours = max(1, min(prediction_hours, 168))  # Limit to 1 week max

            # Generate predictions for each hour
            for hour in range(prediction_hours):
                prediction_time = current_time + timedelta(hours=hour)
                
                # Prepare feature vector for prediction with safe type conversion
                feature_vector = np.array([[
                    float(current_data.get('rating', 0)),
                    int(current_data.get('completedTrips', 0)),
                    float(current_data.get('onTimePercentage', 0)),
                    int(current_data.get('totalPoints', 0)),
                    int(current_data.get('currentStreak', 0)),
                    prediction_time.hour,
                    prediction_time.weekday(),
                    prediction_time.month,
                    float(current_data.get('temperature', 20)),
                    float(current_data.get('precipitation', 0)),
                ]])

                # Scale features
                feature_vector_scaled = self.scaler.transform(feature_vector)
                
                # Make prediction
                predicted_value = self.model.predict(feature_vector_scaled)[0]

                # Calculate confidence score
                confidence_features = self._prepare_features([current_data])
                if len(confidence_features) > 0:
                    confidence = max(0.0, min(1.0, float(self.model.score(
                        self.scaler.transform(confidence_features),
                        [float(current_data.get('rating', 0))]
                    ))))
                else:
                    confidence = 0.0

                predictions.append({
                    'timestamp': prediction_time.isoformat(),
                    'predicted_value': float(predicted_value),
                    'confidence': confidence
                })

            return predictions
        except Exception as e:
            raise ValueError(f"Error making predictions: {str(e)}")

    def get_feature_importance(self) -> Dict[str, float]:
        """Get the importance of each feature in making predictions"""
        if not self.is_trained:
            raise ValueError("Model needs to be trained before getting feature importance")

        feature_names = [
            'rating', 'completed_trips', 'ontime_percentage',
            'total_points', 'current_streak', 'hour_of_day',
            'day_of_week', 'month', 'temperature', 'precipitation'
        ]

        importance_dict = dict(zip(feature_names, self.model.feature_importances_))
        return dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
