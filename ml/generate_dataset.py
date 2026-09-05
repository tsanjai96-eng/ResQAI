import numpy as np
import pandas as pd

np.random.seed(42)

N = 1000


# ==========================================
# Generate environmental data
# ==========================================

rainfall = np.random.uniform(
    0, 200, N
)

temperature = np.random.uniform(
    20, 40, N
)

humidity = np.random.uniform(
    40, 100, N
)

wind_speed = np.random.uniform(
    0, 80, N
)

pressure = np.random.uniform(
    990, 1025, N
)

river_level = np.random.uniform(
    0.5, 6.0, N
)

elevation = np.random.uniform(
    2, 100, N
)


# ==========================================
# Create flood risk score
# ==========================================

risk_score = (

    rainfall * 0.35

    + humidity * 0.10

    + wind_speed * 0.05

    + river_level * 8

    + (1015 - pressure) * 0.5

    - elevation * 0.08
)


# Add random variation

risk_score += np.random.normal(
    0,
    8,
    N
)


# ==========================================
# Convert risk into flood label
# ==========================================

flood = (
    risk_score > 65
).astype(int)


# ==========================================
# Create dataframe
# ==========================================

df = pd.DataFrame({

    "rainfall": rainfall,

    "temperature": temperature,

    "humidity": humidity,

    "wind_speed": wind_speed,

    "pressure": pressure,

    "river_level": river_level,

    "elevation": elevation,

    "flood": flood

})


# ==========================================
# Save
# ==========================================

df.to_csv(
    "data/flood_dataset.csv",
    index=False
)


print("Dataset generated successfully!")

print(
    "Dataset shape:",
    df.shape
)

print("\nFlood distribution:")

print(
    df["flood"].value_counts()
)

print("\nFirst 5 rows:")

print(
    df.head()
)