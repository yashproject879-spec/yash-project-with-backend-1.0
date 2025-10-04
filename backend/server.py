from fastapi import FastAPI, APIRouter, HTTPException, Form, status, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import uuid
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
import razorpay
import hmac
import hashlib
import json
from services.gmail_service import gmail_service
from services.sheets_service import sheets_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Razorpay configuration
razorpay_client = razorpay.Client(auth=(
    os.environ.get('RAZORPAY_KEY_ID'),
    os.environ.get('RAZORPAY_KEY_SECRET')
))

# Business configuration
BASE_PRICE_PAISE = int(os.environ.get('BASE_PRICE_PAISE', '45000'))  # Default ₹450

# Create the main app
app = FastAPI(title="Stallion & Co. Luxury Tailoring API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Data Models
class MeasurementUnit(str, Enum):
    CENTIMETERS = "cm"
    INCHES = "in"

class CustomerInfo(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, pattern=r'^\+?[\d\s\-\(\)]+$')
    age: Optional[int] = Field(None, ge=18, le=120)
    body_type: Optional[str] = Field(None, description="Body type preference")
    special_considerations: Optional[str] = Field(None, description="Special fitting considerations")
    
    @validator('email')
    def validate_email_format(cls, v):
        if '@' not in v or '.' not in v.split('@')[1]:
            raise ValueError('Invalid email format')
        return v.lower()

class MeasurementData(BaseModel):
    height: float = Field(..., ge=100, le=250, description="Height in cm")
    weight: float = Field(..., ge=30, le=300, description="Weight in kg")
    outseam: Optional[float] = Field(None, ge=50, le=150, description="Outseam length")
    waist: Optional[float] = Field(None, ge=50, le=150, description="Waist measurement")
    hip_seat: Optional[float] = Field(None, ge=60, le=180, description="Hip/Seat measurement")
    thigh: Optional[float] = Field(None, ge=30, le=100, description="Thigh measurement")
    crotch_rise: Optional[float] = Field(None, ge=15, le=50, description="Crotch/Rise measurement")
    bottom_opening: Optional[float] = Field(None, ge=10, le=40, description="Bottom opening/Hem")
    unit: MeasurementUnit = Field(default=MeasurementUnit.CENTIMETERS)
    
    @validator('height', 'weight', 'outseam', 'waist', 'hip_seat', 'thigh', 'crotch_rise', 'bottom_opening')
    def validate_positive_measurements(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Measurements must be positive numbers')
        return v

class TailoringSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_info: CustomerInfo
    measurements: MeasurementData
    product_selected: str = Field(default="Premium Tailored Trousers")
    fabric_choice: Optional[str] = Field(None, description="Selected fabric type")
    style_preferences: Optional[str] = Field(None, description="Style preferences")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")
    session_id: Optional[str] = Field(None, description="Session tracking ID")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    order_status: str = Field(default="pending_payment")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class VirtualFittingRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_info: CustomerInfo
    preferred_date: Optional[str] = Field(None, description="Preferred fitting date")
    preferred_time: Optional[str] = Field(None, description="Preferred fitting time")
    fitting_type: str = Field(default="virtual_consultation", description="Type of fitting")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="pending")

# API Endpoints
@api_router.get("/")
async def root():
    return {"message": "Stallion & Co. Luxury Tailoring API", "status": "active"}

@api_router.get("/products")
async def get_products():
    """Get available products"""
    return {
        "products": [
            {
                "id": "premium-trousers-001",
                "name": "Premium Tailored Trousers",
                "description": "Handcrafted luxury trousers made from the finest fabrics",
                "price": 45000,  # Price in paise (INR 450)
                "currency": "INR",
                "fabrics": ["Wool", "Cotton", "Linen", "Silk Blend"],
                "available": True
            }
        ]
    }

@api_router.post("/measurements", response_model=Dict[str, Any])
async def submit_measurements(submission: TailoringSubmission):
    """Submit customer measurements for tailoring"""
    try:
        # Store in MongoDB
        submission_dict = submission.dict()
        result = await db.measurements.insert_one(submission_dict)
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=500,
                detail="Failed to store measurement data"
            )
        
        logger.info(f"Measurements submitted for customer: {submission.customer_info.email}")
        
        return {
            "status": "success",
            "message": "Measurements submitted successfully",
            "submission_id": submission.id,
            "timestamp": submission.created_at.isoformat(),
            "customer_email": submission.customer_info.email
        }
        
    except Exception as e:
        logger.error(f"Error submitting measurements: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error occurred"
        )

@api_router.post("/virtual-fitting", response_model=Dict[str, Any])
async def book_virtual_fitting(request: VirtualFittingRequest):
    """Book a virtual fitting consultation"""
    try:
        # Store in MongoDB
        request_dict = request.dict()
        result = await db.virtual_fittings.insert_one(request_dict)
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=500,
                detail="Failed to book virtual fitting"
            )
        
        logger.info(f"Virtual fitting booked for customer: {request.customer_info.email}")
        
        return {
            "status": "success",
            "message": "Virtual fitting consultation booked successfully",
            "booking_id": request.id,
            "timestamp": request.created_at.isoformat(),
            "customer_email": request.customer_info.email
        }
        
    except Exception as e:
        logger.error(f"Error booking virtual fitting: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error occurred"
        )

@api_router.get("/measurements/{submission_id}")
async def get_measurement(submission_id: str):
    """Get measurement data by ID"""
    try:
        measurement = await db.measurements.find_one({"id": submission_id})
        if not measurement:
            raise HTTPException(
                status_code=404,
                detail="Measurement not found"
            )
        
        # Remove MongoDB _id field
        measurement.pop('_id', None)
        return measurement
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving measurement: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error occurred"
        )

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "Stallion & Co. API"
    }

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
