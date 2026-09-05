from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime
)

from datetime import datetime

from database import Base


# ==========================================
# USER
# ==========================================

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


# ==========================================
# DISASTER
# ==========================================

class Disaster(Base):

    __tablename__ = "disasters"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    disaster_type = Column(String)

    risk_score = Column(Float)

    risk_level = Column(String)

    latitude = Column(Float)

    longitude = Column(Float)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==========================================
# PREDICTION
# ==========================================

class Prediction(Base):

    __tablename__ = "predictions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    disaster_type = Column(String)

    risk_score = Column(Float)

    risk_level = Column(String)

    rainfall = Column(Float)

    temperature = Column(Float)

    humidity = Column(Float)

    wind_speed = Column(Float)

    pressure = Column(Float)

    river_level = Column(Float)

    elevation = Column(Float)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==========================================
# SHELTER
# ==========================================

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

    flood_risk = Column(
        Float,
        default=0
    )

    status = Column(
        String,
        default="OPEN"
    )


# ==========================================
# SOS
# ==========================================

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
        default="PENDING"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==========================================
# RESCUE TEAM
# ==========================================

class RescueTeam(Base):

    __tablename__ = "rescue_teams"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(String)

    members = Column(
        Integer,
        default=0
    )

    vehicle = Column(String)

    latitude = Column(Float)

    longitude = Column(Float)

    status = Column(
        String,
        default="AVAILABLE"
    )

    current_sos_id = Column(
        Integer,
        nullable=True
    )


# ==========================================
# RESOURCE
# ==========================================

class Resource(Base):

    __tablename__ = "resources"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    resource_type = Column(String)

    quantity = Column(Integer)

    available_quantity = Column(Integer)

    latitude = Column(Float)

    longitude = Column(Float)

    status = Column(
        String,
        default="AVAILABLE"
    )
# ==========================================
# MESSAGE
# ==========================================

class Message(Base):

    __tablename__ = "messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    sender = Column(
        String,
        nullable=False
    )

    message = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="UNREAD"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    sender_id = Column(
        Integer,
        nullable=True
    )

    receiver_id = Column(
        Integer,
        nullable=True
    )

    language = Column(
        String,
        default="en"
    )

    priority = Column(
        String,
        default="normal"
    )

    is_read = Column(
        Boolean,
        default=False
    )    
