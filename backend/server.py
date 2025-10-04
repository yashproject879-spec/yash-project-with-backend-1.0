from fastapi import FastAPI, APIRouter, HTTPException, Form, status, BackgroundTasks, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

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
    waist: Optional[float] = Field(None, ge=20, le=150, description="Waist measurement") 
    hip_seat: Optional[float] = Field(None, ge=20, le=180, description="Hip/Seat measurement")
    thigh: Optional[float] = Field(None, ge=15, le=100, description="Thigh measurement")
    crotch_rise: Optional[float] = Field(None, ge=15, le=50, description="Crotch/Rise measurement")
    bottom_opening: Optional[float] = Field(None, ge=10, le=40, description="Bottom opening/Hem")
    unit: MeasurementUnit = Field(default=MeasurementUnit.CENTIMETERS)
    
    @validator('height', 'weight', 'outseam', 'waist', 'hip_seat', 'thigh', 'crotch_rise', 'bottom_opening')
    def validate_positive_measurements(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Measurements must be positive numbers')
        return v

class ImageUpload(BaseModel):
    front_view: Optional[str] = Field(None, description="Front view photo URL")
    side_view: Optional[str] = Field(None, description="Side view photo URL")
    reference_fit: Optional[str] = Field(None, description="Reference fit photo URL")

class TailoringSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_info: CustomerInfo
    measurements: MeasurementData
    product_selected: str = Field(default="Premium Tailored Trousers")
    fabric_choice: Optional[str] = Field(None, description="Selected fabric type")
    style_preferences: Optional[str] = Field(None, description="Style preferences")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")
    quantity: int = Field(default=1, ge=1, le=10, description="Number of items")
    images: Optional[ImageUpload] = Field(None, description="Customer photos")
    session_id: Optional[str] = Field(None, description="Session tracking ID")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    order_status: str = Field(default="pending_payment")
    payment_id: Optional[str] = Field(None, description="Razorpay payment ID")
    razorpay_order_id: Optional[str] = Field(None, description="Razorpay order ID")
    total_amount: Optional[int] = Field(None, description="Total amount in paise")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class PaymentOrderRequest(BaseModel):
    submission_id: str
    quantity: int = Field(default=1, ge=1, le=10)

class PaymentVerificationRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    submission_id: str

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

@api_router.post("/create-payment-order")
async def create_payment_order(request: PaymentOrderRequest):
    """Create Razorpay order for payment"""
    try:
        # Get the submission data
        submission = await db.measurements.find_one({"id": request.submission_id})
        if not submission:
            raise HTTPException(
                status_code=404,
                detail="Submission not found"
            )
        
        # Calculate total amount
        total_amount = BASE_PRICE_PAISE * request.quantity
        
        # Mock Razorpay order for testing (replace with real Razorpay when keys are available)
        mock_order_id = f"order_test_{uuid.uuid4().hex[:8]}"
        
        try:
            # Try real Razorpay first
            razorpay_order = razorpay_client.order.create({
                "amount": total_amount,
                "currency": "INR",
                "receipt": f"order_{request.submission_id}",
                "notes": {
                    "submission_id": request.submission_id,
                    "customer_email": submission["customer_info"]["email"],
                    "quantity": str(request.quantity)
                }
            })
            order_id = razorpay_order["id"]
            logger.info(f"Real Razorpay order created: {order_id}")
            
        except Exception as razorpay_error:
            # Fallback to mock for testing
            logger.warning(f"Razorpay failed ({str(razorpay_error)}), using mock payment for testing")
            order_id = mock_order_id
        
        # Update submission with order details
        await db.measurements.update_one(
            {"id": request.submission_id},
            {
                "$set": {
                    "razorpay_order_id": order_id,
                    "quantity": request.quantity,
                    "total_amount": total_amount,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        logger.info(f"Payment order created for submission {request.submission_id}")
        
        return {
            "order_id": order_id,
            "amount": total_amount,
            "currency": "INR",
            "key": os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_mock'),
            "submission_id": request.submission_id,
            "is_mock": order_id.startswith("order_test_")
        }
        
    except Exception as e:
        logger.error(f"Error creating payment order: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create payment order"
        )

@api_router.post("/verify-payment")
async def verify_payment(request: PaymentVerificationRequest, background_tasks: BackgroundTasks):
    """Verify Razorpay payment and process order"""
    try:
        # Get submission data first
        submission = await db.measurements.find_one({"id": request.submission_id})
        if not submission:
            raise HTTPException(
                status_code=404,
                detail="Submission not found"
            )
        
        # Check if this is a mock payment (for testing)
        is_mock_payment = request.razorpay_order_id.startswith("order_test_")
        
        if not is_mock_payment:
            # Real Razorpay signature verification
            razorpay_key_secret = os.environ.get('RAZORPAY_KEY_SECRET')
            generated_signature = hmac.new(
                razorpay_key_secret.encode(),
                f"{request.razorpay_order_id}|{request.razorpay_payment_id}".encode(),
                hashlib.sha256
            ).hexdigest()
            
            if generated_signature != request.razorpay_signature:
                raise HTTPException(
                    status_code=400,
                    detail="Payment signature verification failed"
                )
        else:
            # Mock payment verification for testing
            logger.info(f"Mock payment verification for testing: {request.razorpay_payment_id}")
        
        # Update order status to paid
        await db.measurements.update_one(
            {"id": request.submission_id},
            {
                "$set": {
                    "order_status": "paid",
                    "payment_id": request.razorpay_payment_id,
                    "payment_verified_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Process order in background (email + sheets) - THIS IS WHERE DATA GOES TO SHEETS
        background_tasks.add_task(
            process_successful_payment,
            submission,
            request.razorpay_payment_id
        )
        
        logger.info(f"Payment verified successfully for order {request.submission_id}")
        
        return {
            "status": "success",
            "message": "Payment verified and order confirmed",
            "order_id": request.submission_id,
            "payment_id": request.razorpay_payment_id,
            "is_mock": is_mock_payment
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Payment verification failed"
        )

async def process_successful_payment(submission_data: dict, payment_id: str):
    """Background task to process successful payments"""
    try:
        logger.info(f"Processing successful payment for order {submission_data['id']}")
        
        # Send confirmation email to customer
        email_sent = await gmail_service.send_order_confirmation(submission_data)
        if not email_sent:
            logger.error(f"Failed to send confirmation email for order {submission_data['id']}")
        
        # Send internal notification
        notification_sent = await gmail_service.send_internal_notification(submission_data, payment_id)
        if not notification_sent:
            logger.error(f"Failed to send internal notification for order {submission_data['id']}")
        
        # Push to Google Sheets
        sheets_updated = await sheets_service.push_order_data(submission_data, payment_id)
        if not sheets_updated:
            logger.error(f"Failed to update Google Sheets for order {submission_data['id']}")
        
        logger.info(f"Order processing completed for {submission_data['id']}")
        
    except Exception as e:
        logger.error(f"Error in background order processing: {str(e)}")

@api_router.post("/test-payment-success/{submission_id}")
async def test_payment_success(submission_id: str, background_tasks: BackgroundTasks):
    """Test endpoint to simulate successful payment (for development/testing only)"""
    try:
        # Get submission data
        submission = await db.measurements.find_one({"id": submission_id})
        if not submission:
            raise HTTPException(
                status_code=404,
                detail="Submission not found"
            )
        
        # Generate mock payment ID
        mock_payment_id = f"pay_test_{uuid.uuid4().hex[:8]}"
        
        # Update order status to paid
        await db.measurements.update_one(
            {"id": submission_id},
            {
                "$set": {
                    "order_status": "paid",
                    "payment_id": mock_payment_id,
                    "payment_verified_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Process order in background (THIS WILL PUSH TO SHEETS & SEND EMAILS)
        background_tasks.add_task(
            process_successful_payment,
            submission,
            mock_payment_id
        )
        
        logger.info(f"TEST: Payment marked as successful for order {submission_id}")
        
        return {
            "status": "success",
            "message": "Test payment processed successfully",
            "order_id": submission_id,
            "payment_id": mock_payment_id,
            "note": "This is a test payment - data will be pushed to sheets and emails sent"
        }
        
    except Exception as e:
        logger.error(f"Error in test payment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Test payment failed"
        )

@api_router.post("/payment-failed")
async def handle_payment_failure(submission_id: str, background_tasks: BackgroundTasks):
    """Handle failed or abandoned payments"""
    try:
        # Update order status
        await db.measurements.update_one(
            {"id": submission_id},
            {
                "$set": {
                    "order_status": "payment_failed",
                    "payment_failed_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Optionally send reminder email
        submission = await db.measurements.find_one({"id": submission_id})
        if submission:
            # Create new payment link (you can implement this)
            payment_link = f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/payment/{submission_id}"
            
            background_tasks.add_task(
                gmail_service.send_payment_reminder,
                submission,
                payment_link
            )
        
        return {"status": "Payment failure recorded"}
        
    except Exception as e:
        logger.error(f"Error handling payment failure: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to handle payment failure"
        )

@api_router.get("/order-status/{submission_id}")
async def get_order_status(submission_id: str):
    """Get order status"""
    try:
        submission = await db.measurements.find_one({"id": submission_id})
        if not submission:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )
        
        return {
            "order_id": submission["id"],
            "status": submission.get("order_status", "unknown"),
            "created_at": submission.get("created_at"),
            "payment_id": submission.get("payment_id"),
            "customer_email": submission["customer_info"]["email"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving order status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve order status"
        )

@api_router.post("/setup-google-sheet")
async def setup_google_sheet():
    """Setup Google Sheet headers for order management"""
    try:
        # Try to set up headers in the existing sheet
        headers_setup = await sheets_service.setup_sheet_headers()
        
        if not headers_setup:
            raise HTTPException(
                status_code=500,
                detail="Failed to setup Google Sheet headers"
            )
        
        sheet_id = os.environ.get('GOOGLE_SHEET_ID')
        logger.info(f"Google Sheet headers set up successfully for sheet: {sheet_id}")
        
        return {
            "status": "success",
            "message": "Google Sheet headers configured successfully",
            "sheet_id": sheet_id,
            "sheet_url": f"https://docs.google.com/spreadsheets/d/{sheet_id}",
            "headers": [
                "Timestamp", "Order ID", "Payment ID", "Payment Status", "Order Status",
                "Customer Name", "First Name", "Last Name", "Email", "Phone", "Age",
                "Body Type", "Special Considerations", "Product", "Quantity", 
                "Fabric Choice", "Style Preferences", "Additional Notes",
                "Height", "Weight", "Waist", "Hip/Seat", "Thigh", "Crotch Rise",
                "Outseam", "Bottom Opening", "Measurement Unit", 
                "Total Amount", "Currency", "Created Date", "Updated Date"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error setting up Google Sheet: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to setup Google Sheet: {str(e)}"
        )

@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), image_type: str = Form(...)):
    """Upload customer image for measurements"""
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
            )
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"{uuid.uuid4()}_{image_type}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Return file URL
        file_url = f"/uploads/{unique_filename}"
        
        logger.info(f"Image uploaded successfully: {file_url}")
        
        return {
            "status": "success",
            "file_url": file_url,
            "filename": unique_filename,
            "image_type": image_type
        }
        
    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to upload image"
        )

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "Stallion & Co. API"
    }

# Include the router in the main app
app.include_router(api_router)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
