import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import random

# 1. Generating Synthetic Data
def generate_synthetic_data(n_samples=1000, random_state=43):
    np.random.seed(random_state)
    random.seed(random_state)

    
    loan_types = ['home', 'auto', 'personal', 'education']
    occupations = ['salaried', 'self-employed', 'business', 'unemployed']
    banks = ['SBI', 'HDFC', 'ICIC', 'PNB', 'Axis Bank', 'IDFC']
    
    data = {
        'cibil_score': np.random.randint(300, 901, n_samples),  # cibil score ranges from 300 to 900
        'loan_type': [random.choice(loan_types) for _ in range(n_samples)],
        'loan_amount': np.random.randint(50000, 2500000, n_samples),
        'tenure': np.random.randint(1, 31, n_samples),  # tenure in years 1 to 30
        'monthly_income': np.random.randint(20000, 500000, n_samples),
        'occupation': [random.choice(occupations) for _ in range(n_samples)],
        'bank': [random.choice(banks) for _ in range(n_samples)]
    }
    
    df = pd.DataFrame(data)

    #Bank offsets to avoid overfitting
    bank_offsets = {
        'SBI': -0.5,
        'HDFC': -0.3,
        'ICIC': 0.0,
        'PNB': 0.2,
        'Axis Bank': 0.3,
        'IDFC': 0.5
    }
    
    df['interest_rate'] = (
        15 - (df['cibil_score'] - 300) * 0.005 +   
        (df['loan_amount'] / df['loan_amount'].max()) * 2 +  
        (-df['tenure'] * 0.1) +                     
        df['bank'].map(bank_offsets) +          
        np.random.normal(0, 0.5, n_samples)       
    )
    
    return df

df = generate_synthetic_data(n_samples=1000)
print("Sample synthetic data:")
df.head()
features = ['cibil_score', 'loan_type', 'loan_amount', 'tenure', 'monthly_income', 'occupation', 'bank']
target = 'interest_rate'
categorical_features = ['loan_type', 'occupation', 'bank']
numeric_features = ['cibil_score', 'loan_amount', 'tenure', 'monthly_income']

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(), categorical_features)
    ],
    remainder='passthrough'  # numeric columns
)

pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

x = df[features]
y = df[target]

xtrain, xtest, ytrain, ytest = train_test_split(x, y, test_size=0.2, random_state=42)

pipeline.fit(xtrain, ytrain)

ypred = pipeline.predict(xtest)
print(ypred)
def recommend_bank(customer_details, pipeline, banks=['SBI', 'HDFC', 'ICIC', 'PNB', 'Axis Bank', 'IDFC']):
    predictions = {}
    for bank in banks:
        input_data = customer_details.copy()
        input_data['bank'] = bank
        input_df = pd.DataFrame([input_data])
        pred_rate = pipeline.predict(input_df)[0]
        predictions[bank] = pred_rate
    best_bank = min(predictions, key=predictions.get)
    return best_bank, predictions
new_customer = {
    'cibil_score': 750,
    'loan_type': 'home',
    'loan_amount': 1000000,
    'tenure': 20,
    'monthly_income': 80000,
    'occupation': 'salaried'
}

best_bank, pred_rates = recommend_bank(new_customer, pipeline)
print("\nPredicted Interest Rates for New Customer by Bank:")
for bank, rate in pred_rates.items():
    print(f"{bank}: {rate:.2f}%")
print(f"\nRecommended Bank: {best_bank}")