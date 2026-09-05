from database import SessionLocal
from models import User, Shelter


db = SessionLocal()


# -----------------------------
# SAMPLE USERS
# -----------------------------

users = [
    User(
        name="Sanjai",
        language="ta",
        role="citizen",
        latitude=11.7447,
        longitude=79.7680
    ),

    User(
        name="Emergency Officer",
        language="en",
        role="officer",
        latitude=11.7500,
        longitude=79.7700
    )
]


# -----------------------------
# SAMPLE SHELTERS
# -----------------------------

shelters = [

    Shelter(
        name="Government Higher Secondary School",
        latitude=11.7500,
        longitude=79.7600,
        capacity=500,
        occupied=100,
        medical_facility=True,
        status="open"
    ),

    Shelter(
        name="Community Hall",
        latitude=11.7600,
        longitude=79.7800,
        capacity=300,
        occupied=50,
        medical_facility=False,
        status="open"
    ),

    Shelter(
        name="Government College Shelter",
        latitude=11.7300,
        longitude=79.7500,
        capacity=800,
        occupied=250,
        medical_facility=True,
        status="open"
    )
]


db.add_all(users)
db.add_all(shelters)

db.commit()

db.close()

print("Sample data inserted successfully!")