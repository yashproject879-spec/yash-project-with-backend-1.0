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
        """Initialize Google Sheets client using service account or OAuth credentials"""
        try:
            # Try to use service account key first
            service_account_key = os.getenv('GOOGLE_SERVICE_ACCOUNT_KEY')
            service_account_path = os.getenv('GOOGLE_SERVICE_ACCOUNT_PATH')
            
            if service_account_key:
                # Create a temporary service account file from the key
                import tempfile
                import json
                
                # Try to parse as JSON (full service account)
                try:
                    service_account_info = json.loads(service_account_key)
                    self.client = gspread.service_account_from_dict(service_account_info)
                    logger.info("Google Sheets client initialized with service account key (JSON)")
                except json.JSONDecodeError:
                    # If not JSON, try using OAuth with the key as additional auth
                    logger.warning("Service account key is not valid JSON, falling back to OAuth")
                    raise ValueError("Invalid service account key format")
                    
            elif service_account_path and os.path.exists(service_account_path):
                self.client = gspread.service_account(filename=service_account_path)
                logger.info("Google Sheets client initialized with service account file")
            else:
                # Fallback to OAuth credentials using Gmail setup
                from google.oauth2.credentials import Credentials as OAuthCreds
                
                creds = OAuthCreds(
                    token=None,
                    refresh_token=os.getenv('GMAIL_REFRESH_TOKEN'),
                    token_uri="https://oauth2.googleapis.com/token",
                    client_id=os.getenv('GMAIL_CLIENT_ID'),
                    client_secret=os.getenv('GMAIL_CLIENT_SECRET'),
                    scopes=[
                        'https://www.googleapis.com/auth/spreadsheets',
                        'https://www.googleapis.com/auth/drive.file'
                    ]
                )
                
                self.client = gspread.authorize(creds)
                logger.info("Google Sheets client initialized with OAuth credentials")
                
        except Exception as e:
            logger.error(f"Failed to initialize Google Sheets client: {str(e)}")
            self.client = None
    
    async def push_order_data(self, order_data: Dict[str, Any], payment_id: str) -> bool:
        """Push order data to Google Sheets"""
        try:
            if not self.client or not self.sheet_id or self.sheet_id == 'your_sheet_id_here':
                logger.warning(f"Google Sheets not configured. Would push order data for order {order_data['id']}")
                return True  # Return True for development/testing
            
            # Open the spreadsheet
            sheet = self.client.open_by_key(self.sheet_id)
            worksheet = sheet.get_worksheet(0)  # First worksheet
            
            # Prepare row data matching the expected sheet structure
            row_data = [
                datetime.now().strftime('%Y-%m-%d %H:%M:%S'),  # Timestamp
                order_data['id'],  # Order ID
                payment_id,  # Payment ID
                f"{order_data['customer_info']['first_name']} {order_data['customer_info']['last_name']}",  # Customer Name
                order_data['customer_info']['email'],  # Email
                order_data['customer_info'].get('phone', ''),  # Phone
                order_data['customer_info'].get('age', ''),  # Age
                order_data.get('product_selected', 'Premium Tailored Trousers'),  # Product
                order_data.get('quantity', 1),  # Quantity
                order_data.get('fabric_choice', ''),  # Fabric
                order_data.get('style_preferences', ''),  # Style Preferences
                order_data['measurements']['height'],  # Height
                order_data['measurements']['weight'],  # Weight
                order_data['measurements'].get('waist', ''),  # Waist
                order_data['measurements'].get('hip_seat', ''),  # Hip/Seat
                order_data['measurements'].get('thigh', ''),  # Thigh
                order_data['measurements'].get('crotch_rise', ''),  # Crotch Rise
                order_data['measurements'].get('outseam', ''),  # Outseam
                order_data['measurements'].get('bottom_opening', ''),  # Bottom Opening
                order_data['measurements'].get('unit', 'cm'),  # Unit
                order_data['customer_info'].get('body_type', ''),  # Body Type
                order_data['customer_info'].get('special_considerations', ''),  # Special Considerations
                order_data.get('notes', ''),  # Additional Notes
                order_data.get('order_status', 'Paid'),  # Order Status
                order_data.get('created_at', datetime.now().isoformat())  # Created At
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
    
    def create_test_sheet(self) -> str | None:
        """Create a test sheet for development (optional helper method)"""
        try:
            if not self.client:
                logger.error("Google Sheets client not initialized")
                return None
            
            # Create a new spreadsheet
            sheet = self.client.create('Stallion & Co. Orders - Test')
            
            # Set up headers
            worksheet = sheet.get_worksheet(0)
            headers = [
                'Timestamp', 'Order ID', 'Payment ID', 'Customer Name', 'Email', 'Phone', 'Age',
                'Product', 'Quantity', 'Fabric Choice', 'Style Preferences',
                'Height (cm)', 'Weight (kg)', 'Waist (cm)', 'Hip/Seat (cm)', 'Thigh (cm)',
                'Crotch Rise (cm)', 'Outseam (cm)', 'Bottom Opening (cm)', 'Unit',
                'Body Type', 'Special Considerations', 'Notes', 'Order Status', 'Created At'
            ]
            
            worksheet.insert_row(headers, 1)
            worksheet.format('1:1', {'textFormat': {'bold': True}})
            
            logger.info(f"Test sheet created with ID: {sheet.id}")
            return sheet.id
            
        except Exception as e:
            logger.error(f"Failed to create test sheet: {str(e)}")
            return None

# Create singleton instance
sheets_service = SheetsService()
