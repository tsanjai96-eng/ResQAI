import os
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "datasets",
    "heatwave_data.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "heatwave_model.pkl"
)


print("Loading heatwave dataset...")

df = pd.read_csv(DATA_PATH)

print("Dataset shape:", df.shape)


FEATURES = [
    "temperature",
    "humidity",
    "wind_speed",
    "rainfall",
    "pressure"
]

TARGET = "heatwave"


X = df[FEATURES]

y = df[TARGET]


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)


model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    class_weight="balanced"
)


print("Training Heatwave AI model...")

model.fit(
    X_train,
    y_train
)


predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print(
    "Heatwave model accuracy:",
    round(accuracy * 100, 2),
    "%"
)


os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

joblib.dump(
    model,
    MODEL_PATH
)


print()
print("================================")
print("Heatwave model trained successfully")
print("================================")
print("Saved:", MODEL_PATH)
print("Features:", model.n_features_in_)