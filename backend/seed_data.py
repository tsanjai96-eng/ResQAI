from database import Base, SessionLocal, engine
from models import RescueTeam, Resource, Shelter, User


Base.metadata.create_all(bind=engine)
db = SessionLocal()

try:
    if db.query(User).count() == 0:
        db.add(User(
            id=1,
            name="Demo Citizen",
            language="en",
            role="citizen",
        ))

    if db.query(Shelter).count() == 0:
        db.add_all([
            Shelter(
                name="Emergency Relief Centre",
                latitude=11.7110,
                longitude=79.7660,
                capacity=500,
                occupied=120,
                medical_facility=True,
                flood_risk=10,
                status="OPEN",
            ),
            Shelter(
                name="Government Higher Secondary School",
                latitude=11.7140,
                longitude=79.7690,
                capacity=400,
                occupied=100,
                medical_facility=False,
                flood_risk=20,
                status="OPEN",
            ),
            Shelter(
                name="Community Emergency Shelter",
                latitude=11.7070,
                longitude=79.7610,
                capacity=300,
                occupied=50,
                medical_facility=True,
                flood_risk=5,
                status="OPEN",
            ),
        ])

    if db.query(RescueTeam).count() == 0:
        db.add_all([
            RescueTeam(
                name="Rescue Team Alpha",
                members=8,
                vehicle="Rescue Van",
                latitude=11.7100,
                longitude=79.7640,
                status="AVAILABLE",
            ),
            RescueTeam(
                name="Rescue Team Bravo",
                members=6,
                vehicle="Rescue Boat",
                latitude=11.7200,
                longitude=79.7700,
                status="AVAILABLE",
            ),
        ])

    if db.query(Resource).count() == 0:
        db.add_all([
            Resource(
                resource_type="Food",
                quantity=10000,
                available_quantity=10000,
                latitude=11.7110,
                longitude=79.7660,
            ),
            Resource(
                resource_type="Water",
                quantity=20000,
                available_quantity=20000,
                latitude=11.7110,
                longitude=79.7660,
            ),
            Resource(
                resource_type="Medical Kits",
                quantity=500,
                available_quantity=500,
                latitude=11.7110,
                longitude=79.7660,
            ),
        ])

    db.commit()
    print("ResQAI demo data seeded successfully.")
finally:
    db.close()
