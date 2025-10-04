import os
import gspread
from google.oauth2.service_account import Credentials
from typing import Dict, Any, List
import logging
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class SheetsService:
    def __init__(self):
        self.sheet_id = os.getenv('GOOGLE_SHEET_ID')
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Google Sheets client using service account"""
        try:
            service_account_path = os.getenv('GOOGLE_SERVICE_ACCOUNT_PATH')
            logger.info(f"Looking for service account at: {service_account_path}")
            
            # Hardcode the path as fallback
            if not service_account_path:
                service_account_path = '/app/backend/google_service_account.json'
                logger.info(f"Using hardcoded path: {service_account_path}")
            
            if os.path.exists(service_account_path):
                # Use the service account file
                self.client = gspread.service_account(filename=service_account_path)
                logger.info(f"✅ Google Sheets client initialized with service account: {service_account_path}")
            else:
                logger.error(f"❌ Service account file not found at: {service_account_path}")
                self.client = None
                
        except Exception as e:
            logger.error(f"Failed to initialize Google Sheets client: {str(e)}")
            self.client = None
    
    async def push_order_data(self, order_data: Dict[str, Any], payment_id: str) -> bool:
        """Push order data to Google Sheets"""
        try:
            if not self.client:
                logger.error("Google Sheets client not initialized")
                return False
                
            if not self.sheet_id or self.sheet_id == 'your_sheet_id_here':
                logger.error("Google Sheet ID not configured")
                return False
            
            # Open the spreadsheet
            sheet = self.client.open_by_key(self.sheet_id)
            worksheet = sheet.get_worksheet(0)  # First worksheet
            
            # Calculate total amount (assuming base price of 450 per item)
            base_price = 450
            quantity = order_data.get('quantity', 1)
            total_amount = base_price * quantity
            
            # Prepare row data matching the comprehensive sheet structure
            row_data = [
                # Order Information
                datetime.now().strftime('%Y-%m-%d %H:%M:%S'),  # Timestamp
                order_data['id'],  # Order ID
                payment_id,  # Payment ID
                'Paid',  # Payment Status
                order_data.get('order_status', 'Paid'),  # Order Status
                
                # Customer Information
                f"{order_data['customer_info']['first_name']} {order_data['customer_info']['last_name']}",  # Customer Name
                order_data['customer_info']['first_name'],  # First Name
                order_data['customer_info']['last_name'],  # Last Name
                order_data['customer_info']['email'],  # Email
                order_data['customer_info'].get('phone', ''),  # Phone
                order_data['customer_info'].get('age', ''),  # Age
                order_data['customer_info'].get('body_type', ''),  # Body Type
                order_data['customer_info'].get('special_considerations', ''),  # Special Considerations
                
                # Product Information
                order_data.get('product_selected', 'Premium Tailored Trousers'),  # Product
                quantity,  # Quantity
                order_data.get('fabric_choice', ''),  # Fabric Choice
                order_data.get('style_preferences', ''),  # Style Preferences
                order_data.get('notes', ''),  # Additional Notes
                
                # Measurements (all in cm)
                order_data['measurements']['height'],  # Height
                order_data['measurements']['weight'],  # Weight
                order_data['measurements'].get('waist', ''),  # Waist
                order_data['measurements'].get('hip_seat', ''),  # Hip/Seat
                order_data['measurements'].get('thigh', ''),  # Thigh
                order_data['measurements'].get('crotch_rise', ''),  # Crotch Rise
                order_data['measurements'].get('outseam', ''),  # Outseam
                order_data['measurements'].get('bottom_opening', ''),  # Bottom Opening
                order_data['measurements'].get('unit', 'cm'),  # Measurement Unit
                
                # Customer Images
                order_data.get('images', {}).get('front_view', '') if order_data.get('images') else '',  # Front View Photo
                order_data.get('images', {}).get('side_view', '') if order_data.get('images') else '',  # Side View Photo
                order_data.get('images', {}).get('reference_fit', '') if order_data.get('images') else '',  # Reference Fit Photo
                
                # Order Details
                f"₹{total_amount}",  # Total Amount
                'INR',  # Currency
                str(order_data.get('created_at', datetime.now().isoformat())),  # Created Date
                datetime.now().isoformat()  # Updated Date
            ]
            
            # Append the row to the sheet
            worksheet.append_row(row_data)
            
            logger.info(f"Order data pushed to Google Sheets successfully. Order ID: {order_data['id']}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to push order data to Google Sheets: {str(e)}")
            return False
    
    async def setup_sheet_headers(self) -> bool:
        """Set up the initial headers for the order tracking sheet"""
        try:
            if not self.client or not self.sheet_id:
                logger.error("Google Sheets client not initialized or Sheet ID not configured")
                return False
            
            sheet = self.client.open_by_key(self.sheet_id)
            worksheet = sheet.get_worksheet(0)
            
            # Check if headers already exist
            existing_headers = worksheet.row_values(1)
            if existing_headers:
                logger.info("Sheet headers already exist")
                return True
            
            # Define headers
            headers = [
                'Timestamp', 'Order ID', 'Payment ID', 'Customer Name', 'Email', 'Phone', 'Age',
                'Product', 'Quantity', 'Fabric Choice', 'Style Preferences',
                'Height (cm)', 'Weight (kg)', 'Waist (cm)', 'Hip/Seat (cm)', 'Thigh (cm)',
                'Crotch Rise (cm)', 'Outseam (cm)', 'Bottom Opening (cm)', 'Unit',
                'Body Type', 'Special Considerations', 'Notes', 'Order Status', 'Created At'
            ]
            
            # Insert headers
            worksheet.insert_row(headers, 1)
            
            # Format headers (make them bold)
            worksheet.format('1:1', {'textFormat': {'bold': True}})
            
            logger.info("Sheet headers set up successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to set up sheet headers: {str(e)}")
            return False
    
    async def get_order_by_id(self, order_id: str) -> Dict[str, Any] | None:
        """Retrieve order data from sheets by order ID"""
        try:
            if not self.client or not self.sheet_id:
                logger.error("Google Sheets client not initialized")
                return None
            
            sheet = self.client.open_by_key(self.sheet_id)
            worksheet = sheet.get_worksheet(0)
            
            # Find the order by ID (assuming Order ID is in column B)
            cell = worksheet.find(order_id)
            if not cell:
                logger.warning(f"Order {order_id} not found in sheets")
                return None
            
            # Get the entire row
            row_values = worksheet.row_values(cell.row)
            headers = worksheet.row_values(1)
            
            # Create dictionary from headers and values
            order_data = dict(zip(headers, row_values))
            
            logger.info(f"Order {order_id} retrieved from sheets")
            return order_data
            
        except Exception as e:
            logger.error(f"Failed to retrieve order from sheets: {str(e)}")
            return None
    
    def create_orders_sheet(self) -> str | None:
        """Create a new orders sheet with proper structure"""
        try:
            if not self.client:
                logger.error("Google Sheets client not initialized")
                return None
            
            # Create a new spreadsheet
            sheet = self.client.create('Stallion & Co. - Order Management')
            
            # Set up headers with comprehensive order information
            worksheet = sheet.get_worksheet(0)
            headers = [
                # Order Information
                'Timestamp', 'Order ID', 'Payment ID', 'Payment Status', 'Order Status',
                
                # Customer Information  
                'Customer Name', 'First Name', 'Last Name', 'Email', 'Phone', 'Age',
                'Body Type', 'Special Considerations',
                
                # Product Information
                'Product', 'Quantity', 'Fabric Choice', 'Style Preferences', 'Additional Notes',
                
                # Measurements (all in cm)
                'Height', 'Weight', 'Waist', 'Hip/Seat', 'Thigh', 'Crotch Rise', 
                'Outseam', 'Bottom Opening', 'Measurement Unit',
                
                # Customer Images
                'Front View Photo', 'Side View Photo', 'Reference Fit Photo',
                
                # Order Details
                'Total Amount', 'Currency', 'Created Date', 'Updated Date'
            ]
            
            worksheet.insert_row(headers, 1)
            
            # Format headers
            worksheet.format('1:1', {
                'textFormat': {'bold': True, 'fontSize': 11},
                'backgroundColor': {'red': 0.8, 'green': 0.8, 'blue': 0.8}
            })
            
            # Set column widths for better readability
            worksheet.columns_auto_resize(0, len(headers))
            
            # Share the sheet (make it accessible)
            sheet.share('', perm_type='anyone', role='reader')
            
            logger.info(f"Orders sheet created with ID: {sheet.id}")
            logger.info(f"Sheet URL: https://docs.google.com/spreadsheets/d/{sheet.id}")
            
            return sheet.id
            
        except Exception as e:
            logger.error(f"Failed to create orders sheet: {str(e)}")
            return None
    
    def create_test_sheet(self) -> str | None:
        """Create a test sheet for development (optional helper method)"""
        return self.create_orders_sheet()

# Create singleton instance
sheets_service = SheetsService()
