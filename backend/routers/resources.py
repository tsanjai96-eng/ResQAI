from fastapi import APIRouter
from database import SessionLocal
from models import Resource


router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)


# ==========================================
# GET ALL RESOURCES
# ==========================================

@router.get("/")
def get_resources():

    db = SessionLocal()

    try:

        resources = db.query(Resource).all()

        return {

            "count": len(resources),

            "resources": [

                {
                    "id": r.id,
                    "resource_type": r.resource_type,
                    "quantity": r.quantity,
                    "available_quantity":
                        r.available_quantity,
                    "latitude": r.latitude,
                    "longitude": r.longitude,
                    "status": r.status
                }

                for r in resources

            ]

        }

    finally:

        db.close()


# ==========================================
# ADD RESOURCE
# ==========================================

@router.post("/add")
def add_resource(

    resource_type: str,

    quantity: int,

    latitude: float,

    longitude: float,

    status: str = "AVAILABLE"

):

    db = SessionLocal()

    try:

        resource = Resource(

            resource_type=resource_type,

            quantity=quantity,

            available_quantity=quantity,

            latitude=latitude,

            longitude=longitude,

            status=status

        )

        db.add(resource)

        db.commit()

        db.refresh(resource)

        return {

            "message":
                "Resource added successfully",

            "resource_id":
                resource.id,

            "resource_type":
                resource.resource_type,

            "quantity":
                resource.quantity

        }

    finally:

        db.close()


# ==========================================
# ALLOCATE RESOURCE
# ==========================================

@router.post("/allocate")
def allocate_resource(

    resource_id: int,

    required_quantity: int

):

    db = SessionLocal()

    try:

        resource = db.query(
            Resource
        ).filter(
            Resource.id == resource_id
        ).first()

        if resource is None:

            return {

                "status":
                    "ERROR",

                "message":
                    "Resource not found"

            }

        if required_quantity <= 0:

            return {

                "status":
                    "ERROR",

                "message":
                    "Quantity must be greater than zero"

            }

        if resource.available_quantity < required_quantity:

            return {

                "status":
                    "INSUFFICIENT",

                "message":
                    "Not enough resource available",

                "available_quantity":
                    resource.available_quantity

            }

        # ----------------------------------
        # Deduct resource
        # ----------------------------------

        resource.available_quantity -= (
            required_quantity
        )

        if resource.available_quantity == 0:

            resource.status = "OUT_OF_STOCK"

        db.commit()

        return {

            "status":
                "ALLOCATED",

            "resource_id":
                resource.id,

            "resource_type":
                resource.resource_type,

            "allocated_quantity":
                required_quantity,

            "remaining_quantity":
                resource.available_quantity

        }

    finally:

        db.close()