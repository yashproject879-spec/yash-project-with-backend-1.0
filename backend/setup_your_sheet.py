#!/usr/bin/env python3
"""
Set up headers in the user's Google Sheet
"""
import os
import sys
sys.path.append('/app/backend')

from google.oauth2.credentials import Credentials
import gspread
from dotenv import load_dotenv

# Load environment variables  
load_dotenv('/app/backend/.env')

def setup_user_sheet():
    """Set up headers in the user's Google Sheet"""
    try:
        sheet_id = "1EpJwAWELhi-I1APR31ym3rXjZYL79mKhe9UX774S7BM"
        
        print(f"🔍 Setting up Google Sheet: {sheet_id}")
        print(f"Sheet URL: https://docs.google.com/spreadsheets/d/{sheet_id}")
        
        # Try with Gmail OAuth credentials
        creds = Credentials(
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
        
        client = gspread.authorize(creds)
        
        # Try to open the sheet
        sheet = client.open_by_key(sheet_id)
        worksheet = sheet.get_worksheet(0)
        
        print(f"✅ Successfully accessed sheet: {sheet.title}")
        print(f"Worksheet title: {worksheet.title}")
        
        # Check if headers exist
        existing_headers = worksheet.row_values(1)
        if existing_headers:
            print(f"⚠️  Existing headers found: {len(existing_headers)} columns")
            print(f"First few headers: {existing_headers[:5]}")
        else:
            print("📋 No headers found. Adding comprehensive headers...")
        
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
        
        # Clear existing content and add headers
        worksheet.clear()
        worksheet.insert_row(headers, 1)
        
        # Format headers
        worksheet.format('1:1', {
            'textFormat': {'bold': True, 'fontSize': 11},
            'backgroundColor': {'red': 0.85, 'green': 0.85, 'blue': 0.85}
        })
        
        # Auto-resize columns
        worksheet.columns_auto_resize(0, len(headers))
        
        print(f"✅ Headers added successfully! ({len(headers)} columns)")
        print(f"\n📊 Column structure:")
        for i, header in enumerate(headers, 1):
            col_letter = chr(64 + i) if i <= 26 else f"A{chr(64 + i - 26)}"
            print(f"   {col_letter:2s}. {header}")
        
        # Add a sample row for reference
        sample_row = [
            "2024-10-04 13:30:00", "ORD-001", "PAY-001", "Paid", "Processing",
            "John Smith", "John", "Smith", "john@example.com", "+91-9876543210", "35",
            "Athletic", "Prefer slim fit", "Premium Tailored Trousers", "1", 
            "Premium Wool", "Slim fit, tapered legs", "Rush order",
            "175", "70", "32", "36", "24", "28", "110", "18", "cm",
            "₹450", "INR", "2024-10-04T13:25:00", "2024-10-04T13:30:00"
        ]
        
        worksheet.insert_row(sample_row, 2)
        
        # Format sample row
        worksheet.format('2:2', {
            'textFormat': {'italic': True},
            'backgroundColor': {'red': 0.95, 'green': 0.95, 'blue': 1.0}
        })
        
        print(f"✅ Sample data row added for reference")
        print(f"\n🎉 Sheet setup complete!")
        print(f"🔗 View your sheet: https://docs.google.com/spreadsheets/d/{sheet_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up sheet: {str(e)}")
        
        if "insufficient authentication scopes" in str(e).lower():
            print(f"\n💡 The Gmail OAuth credentials don't have Sheets access.")
            print(f"   Please manually add the headers to your sheet using this structure:")
            print(f"   Copy from: /app/backend/sheet_headers.csv")
        
        return False

if __name__ == "__main__":
    setup_user_sheet()