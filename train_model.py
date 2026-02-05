import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib

def main():
    # Load dataset
    print("Loading dataset...")
    df = pd.read_csv('happiness_data.csv')

    # Preprocessing
    # Features used for prediction
    features = ['economy_(gdp_per_capita)', 'family', 'health_(life_expectancy)', 'freedom', 'trust_(government_corruption)', 'generosity']
    target = 'happiness_score'

    X = df[features]
    y = df[target]

    # Handle missing values if any
    X = X.fillna(X.mean())

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train Linear Regression
    print("Training Linear Regression...")
    lr_model = LinearRegression()
    lr_model.fit(X_train_scaled, y_train)
    lr_pred = lr_model.predict(X_test_scaled)
    lr_r2 = r2_score(y_test, lr_pred)
    print(f"Linear Regression R² Score: {lr_r2:.4f}")

    # Train Random Forest
    print("Training Random Forest Regressor...")
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_model.fit(X_train_scaled, y_train)
    rf_pred = rf_model.predict(X_test_scaled)
    rf_r2 = r2_score(y_test, rf_pred)
    print(f"Random Forest R² Score: {rf_r2:.4f}")

    # Select best model (usually RF for this kind of data)
    best_model = rf_model if rf_r2 > lr_r2 else lr_model
    print(f"Best model selected: {'Random Forest' if best_model == rf_model else 'Linear Regression'}")

    # Save best model and scaler
    print("Saving model and scaler...")
    joblib.dump(best_model, 'model.pkl')
    joblib.dump(scaler, 'scaler.pkl')
    print("Successfully saved 'model.pkl' and 'scaler.pkl'")

if __name__ == "__main__":
    main()
