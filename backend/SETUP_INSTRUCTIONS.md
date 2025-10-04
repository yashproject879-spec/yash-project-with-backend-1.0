# 🎯 Stallion & Co. Google Sheets Setup Instructions

## Your Google Sheet
**Sheet URL**: https://docs.google.com/spreadsheets/d/1EpJwAWELhi-I1APR31ym3rXjZYL79mKhe9UX774S7BM/edit?usp=sharing
**Sheet ID**: `1EpJwAWELhi-I1APR31ym3rXjZYL79mKhe9UX774S7BM` ✅ **Already configured in backend!**

## 📋 Step 1: Add Headers to Your Sheet

Copy and paste these headers into **Row 1** of your Google Sheet:

```
Timestamp,Order ID,Payment ID,Payment Status,Order Status,Customer Name,First Name,Last Name,Email,Phone,Age,Body Type,Special Considerations,Product,Quantity,Fabric Choice,Style Preferences,Additional Notes,Height (cm),Weight (kg),Waist (cm),Hip/Seat (cm),Thigh (cm),Crotch Rise (cm),Outseam (cm),Bottom Opening (cm),Measurement Unit,Total Amount,Currency,Created Date,Updated Date
```

### Option A: Quick Copy-Paste
1. Open your Google Sheet
2. Click on cell **A1**
3. Copy the entire line above (all headers)
4. Paste into A1 - it will automatically fill columns A through AE

### Option B: Individual Columns
If copy-paste doesn't work, add these headers one by one:

| Col | Header | Col | Header | Col | Header |
|-----|--------|-----|--------|-----|--------|
| A | Timestamp | L | Body Type | W | Thigh (cm) |
| B | Order ID | M | Special Considerations | X | Crotch Rise (cm) |
| C | Payment ID | N | Product | Y | Outseam (cm) |
| D | Payment Status | O | Quantity | Z | Bottom Opening (cm) |
| E | Order Status | P | Fabric Choice | AA | Measurement Unit |
| F | Customer Name | Q | Style Preferences | AB | Total Amount |
| G | First Name | R | Additional Notes | AC | Currency |
| H | Last Name | S | Height (cm) | AD | Created Date |
| I | Email | T | Weight (kg) | AE | Updated Date |
| J | Phone | U | Waist (cm) | | |
| K | Age | V | Hip/Seat (cm) | | |

## 🎨 Step 2: Format Headers
1. Select **Row 1** (click on the row number "1")
2. Make it **bold**: Ctrl+B (or Format → Text → Bold)
3. Add background color: Format → Fill color → Light gray
4. Freeze header row: View → Freeze → 1 row

## 🔐 Step 3: Set Permissions
Your sheet needs to be accessible for the system to write data:

**Option A - Specific Access** (Recommended):
1. Click **Share** (top right)
2. Add these emails with **Editor** access:
   - `orders@stallionandco.com`
   - Your own email address

**Option B - Link Access** (Easier):
1. Click **Share** (top right)
2. Change to **"Anyone with the link can edit"**

## 📝 Step 4: Test Data
After setting up headers, your sheet will receive data like this when orders are processed:

| Timestamp | Order ID | Customer Name | Email | Product | Quantity | Fabric Choice | Height (cm) | Weight (kg) | Total Amount |
|-----------|----------|---------------|-------|---------|----------|---------------|-------------|-------------|--------------|
| 2024-10-04 13:48:23 | 5f813c6e | Jane Doe | jane.doe@example.com | Premium Tailored Trousers | 2 | Italian Linen | 168 | 58 | ₹840 |

## ✅ Verification
Once set up:
1. Go to your website: http://localhost:3000
2. Create a test order through the measurement flow
3. Complete payment (test mode)
4. Check if data appears in your Google Sheet

## 🔧 Backend Status
- ✅ Backend configured with your Sheet ID
- ✅ Order processing system ready
- ✅ Email notifications configured
- ✅ Payment integration ready (needs Razorpay keys)

## 🚀 Next Steps
1. Add the headers to your sheet (steps above)
2. Test with a sample order
3. Add your Razorpay payment credentials when ready for live payments

---
**Need help?** Check the backend logs: `tail -f /var/log/supervisor/backend.*.log`