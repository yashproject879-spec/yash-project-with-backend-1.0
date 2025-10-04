#!/usr/bin/env python3
"""
Manual Google Sheets setup script using Gmail OAuth credentials
"""
import os
import sys
sys.path.append('/app/backend')

from google.oauth2.credentials import Credentials
import gspread
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

def create_orders_sheet():
    """Create a Google Sheet manually using OAuth credentials"""
    try:
        # Use Gmail OAuth credentials with expanded scopes
        creds = Credentials(
            token=None,
            refresh_token=os.getenv('GMAIL_REFRESH_TOKEN'),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.getenv('GMAIL_CLIENT_ID'),
            client_secret=os.getenv('GMAIL_CLIENT_SECRET'),
            scopes=[
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/gmail.readonly'
            ]
        )
        
        # Initialize gspread client
        client = gspread.authorize(creds)
        
        # Create a new spreadsheet
        sheet = client.create('Stallion & Co. - Order Management System')
        
        # Get the first worksheet
        worksheet = sheet.get_worksheet(0)
        
        # Define comprehensive headers
        headers = [
            # Order Information
            'Timestamp', 'Order ID', 'Payment ID', 'Payment Status', 'Order Status',
            
            # Customer Information  
            'Customer Name', 'First Name', 'Last Name', 'Email', 'Phone', 'Age',
            'Body Type', 'Special Considerations',
            
            # Product Information
            'Product', 'Quantity', 'Fabric Choice', 'Style Preferences', 'Additional Notes',
            
            # Measurements (all in cm)
            'Height (cm)', 'Weight (kg)', 'Waist (cm)', 'Hip/Seat (cm)', 'Thigh (cm)', 
            'Crotch Rise (cm)', 'Outseam (cm)', 'Bottom Opening (cm)', 'Measurement Unit',
            
            # Order Details
            'Total Amount', 'Currency', 'Created Date', 'Updated Date'
        ]
        
        # Insert headers
        worksheet.insert_row(headers, 1)
        
        # Format headers
        worksheet.format('1:1', {
            'textFormat': {'bold': True, 'fontSize': 11},
            'backgroundColor': {'red': 0.9, 'green': 0.9, 'blue': 0.9}
        })
        
        # Auto-resize columns
        worksheet.columns_auto_resize(0, len(headers))
        
        # Make sheet accessible (view-only for anyone with link)
        sheet.share('', perm_type='anyone', role='reader')
        
        print(f"✅ Google Sheet created successfully!")
        print(f"Sheet ID: {sheet.id}")
        print(f"Sheet URL: https://docs.google.com/spreadsheets/d/{sheet.id}")
        print(f"\nHeaders added:")
        for i, header in enumerate(headers, 1):
            print(f"  {i:2d}. {header}")
        
        print(f"\n🔧 Next steps:")
        print(f"1. Copy this Sheet ID: {sheet.id}")
        print(f"2. Add it to your .env file as GOOGLE_SHEET_ID={sheet.id}")
        print(f"3. Restart the backend: sudo supervisorctl restart backend")
        
        return sheet.id
        
    except Exception as e:
        print(f"❌ Error creating Google Sheet: {str(e)}")
        return None

if __name__ == "__main__":
    create_orders_sheet()