from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime

from database import Base


# --------------------------------
# USER TABLE
# --------------------------------

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(String)

    language = Column(
        String,
        default="en"
    )

    role = Column(
        String,
        default="citizen"
    )

    latitude = Column(Float)

    longitude = Column(Float)


# --------------------------------
# DISASTER TABLE
# --------------------------------

class Disaster(Base):

    __tablename__ = "disasters"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    disaster_type = Column(String)

    risk_score = Column(Float)

    severity = Column(String)

    latitude = Column(Float)

    longitude = Column(Float)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# --------------------------------
# SOS TABLE
# --------------------------------

class SOSRequest(Base):

    __tablename__ = "sos_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(Integer)

    latitude = Column(Float)

    longitude = Column(Float)

    people_count = Column(Integer)

    children = Column(
        Integer,
        default=0
    )

    elderly = Column(
        Integer,
        default=0
    )

    medical_emergency = Column(
        Boolean,
        default=False
    )

    description = Column(String)

    priority_score = Column(
        Float,
        default=0
    )

    status = Column(
        String,
        default="pending"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# --------------------------------
# SHELTER TABLE
# --------------------------------

class Shelter(Base):

    __tablename__ = "shelters"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(String)

    latitude = Column(Float)

    longitude = Column(Float)

    capacity = Column(Integer)

    occupied = Column(
        Integer,
        default=0
    )

    medical_facility = Column(
        Boolean,
        default=False
    )

    status = Column(
        String,
        default="open"
    )