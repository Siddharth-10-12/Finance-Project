import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.metrics import classification_report


np.random.seed(42)
sample_size = 1000

data = {
    'annual_income': np.random.randint(300000, 2000000, sample_size),  # ₹300,000 to ₹2,000,000
    'insurance_premium': np.random.randint(5000, 50000, sample_size),  # ₹5,000 to ₹50,000
    'bank_balance': np.random.randint(20000, 500000, sample_size),     # ₹20,000 to ₹500,000
    'tax_paid': np.random.randint(20000, 200000, sample_size),         # ₹20,000 to ₹200,000
    'rent_paid': np.random.randint(0, 200000, sample_size),            # ₹0 to ₹200,000
    'education_loan_interest': np.random.randint(0, 50000, sample_size)  # ₹0 to ₹50,000
}
df = pd.DataFrame(data)
csv_filename = 'synthetic_tax_data_300.csv'
df.to_csv(csv_filename, index=False)
print(f"Synthetic data with {sample_size} rows saved to '{csv_filename}'.")

df['suggest_ELSS'] = 1  # Always suggest ELSS (80C)
df['suggest_80D'] = (df['insurance_premium'] < 25000).astype(int)
df['suggest_NPS'] = 1  # Always suggest additional NPS contributions (80CCD(1B)).
df['suggest_HRA'] = (df['rent_paid'] > 0).astype(int)
df['suggest_FD'] = (df['bank_balance'] < 0.3 * df['annual_income']).astype(int)
df['suggest_80E'] = (df['education_loan_interest'] > 0).astype(int)


features = ['annual_income', 'insurance_premium', 'bank_balance', 'tax_paid', 'rent_paid', 'education_loan_interest']
target_labels = ['suggest_ELSS', 'suggest_80D', 'suggest_NPS', 'suggest_HRA', 'suggest_FD', 'suggest_80E']

X = df[features]
Y = df[target_labels]

X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

forest = RandomForestClassifier(n_estimators=200, max_depth=10,random_state=42)
multi_target_forest = MultiOutputClassifier(forest)
multi_target_forest.fit(X_train, Y_train)


Y_pred = multi_target_forest.predict(X_test)
print("Classification Report for Multi-Label Tax Saving Suggestions:")
print(classification_report(Y_test, Y_pred))

new_sample = pd.DataFrame({
    'annual_income': [8000],
    'insurance_premium': [1000],
    'bank_balance': [10000],
    'tax_paid': [5000],
    'rent_paid': [3000],
    'education_loan_interest': [1000]
})

new_prediction = multi_target_forest.predict(new_sample)

prediction_df = pd.DataFrame(new_prediction, columns=target_labels)
print("Tax Saving Suggestions for the new sample:")
prediction_df

print(df[['suggest_ELSS', 'suggest_80D', 'suggest_NPS', 'suggest_HRA', 'suggest_FD', 'suggest_80E']].sum())

new_sample = pd.DataFrame({
    'annual_income': [800000],
    'insurance_premium': [26000],  
    'bank_balance': [300000],
    'tax_paid': [50000],
    'rent_paid': [0],         
    'education_loan_interest': [0]  
})

new_prediction = multi_target_forest.predict(new_sample)
prediction_df = pd.DataFrame(new_prediction, columns=target_labels)
print("Tax Saving Suggestions for the new sample:")
prediction_df
