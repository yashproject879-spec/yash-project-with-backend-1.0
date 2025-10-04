#!/usr/bin/env python3
"""
Google Sheets Setup Guide for Stallion & Co. Order Management
"""

def print_setup_instructions():
    """Print detailed setup instructions for Google Sheets"""
    
    print("=" * 80)
    print("🎯 STALLION & CO. - GOOGLE SHEETS SETUP GUIDE")
    print("=" * 80)
    
    print(f"\n📋 STEP 1: Create or Use Your Google Sheet")
    print(f"   • If '{sheet_id}' is your sheet ID, go to:")
    print(f"     https://docs.google.com/spreadsheets/d/{sheet_id}")
    print(f"   • Or create a new sheet at: https://sheets.google.com")
    
    print(f"\n📊 STEP 2: Set Up Column Headers (Row 1)")
    print(f"   Copy and paste these headers into the first row:")
    
    headers = [
        "Timestamp", "Order ID", "Payment ID", "Payment Status", "Order Status",
        "Customer Name", "First Name", "Last Name", "Email", "Phone", "Age",
        "Body Type", "Special Considerations", "Product", "Quantity", 
        "Fabric Choice", "Style Preferences", "Additional Notes",
        "Height (cm)", "Weight (kg)", "Waist (cm)", "Hip/Seat (cm)", "Thigh (cm)", 
        "Crotch Rise (cm)", "Outseam (cm)", "Bottom Opening (cm)", "Measurement Unit",
        "Total Amount", "Currency", "Created Date", "Updated Date"
    ]
    
    print(f"\n   Headers (33 columns total):")
    for i, header in enumerate(headers, 1):
        col_letter = chr(64 + i) if i <= 26 else f"A{chr(64 + i - 26)}"
        print(f"   {col_letter:2s}. {header}")
    
    print(f"\n🎨 STEP 3: Format the Headers")
    print(f"   • Select row 1 (the header row)")
    print(f"   • Make text bold: Ctrl+B")
    print(f"   • Add background color: Format → Fill color → Light gray")
    print(f"   • Freeze the header: View → Freeze → 1 row")
    
    print(f"\n🔐 STEP 4: Share the Sheet")
    print(f"   • Click 'Share' button (top right)")
    print(f"   • Add this email with Editor access:")
    print(f"     orders@stallionandco.com")
    print(f"   • Or change to 'Anyone with the link can edit'")
    
    print(f"\n⚙️  STEP 5: Update Backend Configuration")
    print(f"   • Copy your Google Sheet ID from the URL")
    print(f"   • Example: https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit")
    print(f"   • Add to /app/backend/.env:")
    print(f"     GOOGLE_SHEET_ID=your_actual_sheet_id_here")
    
    print(f"\n🔄 STEP 6: Restart Backend")
    print(f"   sudo supervisorctl restart backend")
    
    print(f"\n📝 SAMPLE DATA FORMAT:")
    print(f"   When orders come in, data will be added like this:")
    sample_row = [
        "2024-10-04 13:30:00", "ord_abc123", "pay_xyz789", "Paid", "Processing",
        "John Smith", "John", "Smith", "john@example.com", "+91-9876543210", "35",
        "Athletic", "Prefer slim fit", "Premium Tailored Trousers", "2", 
        "Premium Wool", "Slim fit, no cuffs", "Rush order please",
        "175", "70", "32", "36", "24", "28", "110", "18", "cm",
        "₹900", "INR", "2024-10-04T13:25:00", "2024-10-04T13:30:00"
    ]
    
    print(f"\n   Example row data:")
    for i, value in enumerate(sample_row[:10], 1):  # Show first 10 columns
        print(f"   {headers[i-1]}: {value}")
    print(f"   ... (and 23 more columns)")
    
    print(f"\n✅ VERIFICATION:")
    print(f"   • Test the integration by creating a test order")
    print(f"   • Check if data appears in your sheet")
    print(f"   • Monitor backend logs: tail -f /var/log/supervisor/backend.*.log")
    
    print(f"\n🎉 Once set up, the system will automatically:")
    print(f"   ✓ Add order data when payment is confirmed")
    print(f"   ✓ Send email confirmations to customers")
    print(f"   ✓ Send notifications to Stallion & Co.")
    print(f"   ✓ Track all measurements and preferences")
    
    print("=" * 80)

if __name__ == "__main__":
    sheet_id = "ac7c6462de16781758623392e76ef30d94b64892"
    print_setup_instructions()