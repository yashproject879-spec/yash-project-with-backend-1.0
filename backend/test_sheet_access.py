#!/usr/bin/env python3
"""
Test Google Sheets access with the provided ID
"""
import os
import sys
sys.path.append('/app/backend')

from google.oauth2.credentials import Credentials
import gspread
from dotenv import load_dotenv

# Load environment variables  
load_dotenv('/app/backend/.env')

def test_sheet_access():
    """Test access to the provided Google Sheet ID"""
    try:
        sheet_id = "ac7c6462de16781758623392e76ef30d94b64892"
        
        print(f"🔍 Testing access to Google Sheet ID: {sheet_id}")
        print(f"Sheet URL: https://docs.google.com/spreadsheets/d/{sheet_id}")
        
        # Try with Gmail OAuth credentials (limited scopes)
        creds = Credentials(
            token=None,
            refresh_token=os.getenv('GMAIL_REFRESH_TOKEN'),
            token_uri="https://oauth2.googleapis.com/token", 
            client_id=os.getenv('GMAIL_CLIENT_ID'),
            client_secret=os.getenv('GMAIL_CLIENT_SECRET'),
            scopes=['https://www.googleapis.com/auth/gmail.readonly']
        )
        
        client = gspread.authorize(creds)
        
        # Try to open the sheet
        sheet = client.open_by_key(sheet_id)
        worksheet = sheet.get_worksheet(0)
        
        print(f"✅ Successfully accessed sheet: {sheet.title}")
        print(f"Worksheet title: {worksheet.title}")
        print(f"Rows: {worksheet.row_count}, Cols: {worksheet.col_count}")
        
        # Check if headers exist
        headers = worksheet.row_values(1)
        if headers:
            print(f"Existing headers: {headers}")
        else:
            print("No headers found - we can add them")
            
        return True
        
    except Exception as e:
        print(f"❌ Error accessing sheet: {str(e)}")
        print(f"This might not be a valid Google Sheets ID or might require different permissions")
        return False

if __name__ == "__main__":
    test_sheet_access()