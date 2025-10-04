import os
import base64
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from typing import Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class GmailService:
    def __init__(self):
        self.client_id = os.getenv('GMAIL_CLIENT_ID')
        self.client_secret = os.getenv('GMAIL_CLIENT_SECRET')
        self.redirect_uri = os.getenv('GMAIL_REDIRECT_URI')
        self.refresh_token = os.getenv('GMAIL_REFRESH_TOKEN')
        self.enabled = all([self.client_id, self.client_secret, self.refresh_token])
        
        if not self.enabled:
            logger.warning("Gmail credentials not fully configured. Email functionality will be disabled.")
            missing_creds = [name for name, val in [
                ('GMAIL_CLIENT_ID', self.client_id),
                ('GMAIL_CLIENT_SECRET', self.client_secret),
                ('GMAIL_REFRESH_TOKEN', self.refresh_token)
            ] if not val]
            logger.info(f"Missing credentials: {missing_creds}")
    
    def _get_credentials(self):
        """Get authenticated Gmail credentials"""
        creds = Credentials(
            token=None,
            refresh_token=self.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=self.client_id,
            client_secret=self.client_secret
        )
        return creds
    
    async def send_email(self, to_email: str, subject: str, body: str, is_html: bool = False) -> bool:
        """Send email using Gmail API"""
        if not self.enabled:
            logger.warning(f"Gmail not configured. Would send email to {to_email} with subject: {subject}")
            return True  # Return True for development/testing
            
        try:
            creds = self._get_credentials()
            service = build('gmail', 'v1', credentials=creds)
            
            message = MIMEMultipart()
            message['to'] = to_email
            message['from'] = os.getenv('COMPANY_EMAIL', 'orders@stallionandco.com')
            message['subject'] = subject
            
            if is_html:
                message.attach(MIMEText(body, 'html'))
            else:
                message.attach(MIMEText(body, 'plain'))
            
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            send_message = service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()
            
            logger.info(f"Email sent successfully to {to_email}. Message ID: {send_message['id']}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    async def send_order_confirmation(self, order_data: Dict[str, Any]) -> bool:
        """Send order confirmation email to customer"""
        try:
            customer_email = order_data['customer_info']['email']
            customer_name = f"{order_data['customer_info']['first_name']} {order_data['customer_info']['last_name']}"
            order_id = order_data['id']
            
            subject = f"Order Confirmation - {order_id} | Stallion & Co."
            
            body = f"""
            Dear {customer_name},
            
            Thank you for choosing Stallion & Co. for your luxury tailoring needs!
            
            Your order has been confirmed and payment has been successfully processed.
            
            ORDER DETAILS:
            Order ID: {order_id}
            Product: {order_data.get('product_selected', 'Premium Tailored Trousers')}
            Quantity: {order_data.get('quantity', 1)}
            
            MEASUREMENTS RECEIVED:
            Height: {order_data['measurements']['height']} cm
            Weight: {order_data['measurements']['weight']} kg
            Waist: {order_data['measurements'].get('waist', 'N/A')} cm
            Hip/Seat: {order_data['measurements'].get('hip_seat', 'N/A')} cm
            
            NEXT STEPS:
            Our master tailors will carefully review your measurements and begin crafting your bespoke garment. 
            We will contact you within 2-3 business days to confirm the details and provide an estimated completion timeline.
            
            If you have any questions, please don't hesitate to contact us.
            
            Best regards,
            The Stallion & Co. Team
            
            ---
            This is an automated confirmation. Please do not reply to this email.
            """
            
            return await self.send_email(customer_email, subject, body)
            
        except Exception as e:
            logger.error(f"Failed to send order confirmation: {str(e)}")
            return False
    
    async def send_internal_notification(self, order_data: Dict[str, Any], payment_id: str) -> bool:
        """Send internal notification to Stallion & Co. team"""
        try:
            notification_email = os.getenv('NOTIFICATION_EMAIL', 'tailors@stallionandco.com')
            order_id = order_data['id']
            customer_name = f"{order_data['customer_info']['first_name']} {order_data['customer_info']['last_name']}"
            
            subject = f"New Order Received - {order_id} | Payment Confirmed"
            
            # Create detailed order information
            measurements_info = "\n".join([
                f"{key.replace('_', ' ').title()}: {value} {order_data['measurements'].get('unit', 'cm')}"
                for key, value in order_data['measurements'].items()
                if key not in ['unit'] and value is not None
            ])
            
            body = f"""
            NEW TAILORING ORDER RECEIVED
            
            ORDER INFORMATION:
            Order ID: {order_id}
            Payment ID: {payment_id}
            Customer: {customer_name}
            Email: {order_data['customer_info']['email']}
            Phone: {order_data['customer_info'].get('phone', 'Not provided')}
            
            PRODUCT DETAILS:
            Product: {order_data.get('product_selected', 'Premium Tailored Trousers')}
            Quantity: {order_data.get('quantity', 1)}
            Fabric Choice: {order_data.get('fabric_choice', 'Not specified')}
            Style Preferences: {order_data.get('style_preferences', 'Not specified')}
            
            CUSTOMER MEASUREMENTS:
            {measurements_info}
            
            ADDITIONAL NOTES:
            {order_data.get('notes', 'No additional notes')}
            
            CUSTOMER PROFILE:
            Age: {order_data['customer_info'].get('age', 'Not provided')}
            Body Type: {order_data['customer_info'].get('body_type', 'Not specified')}
            Special Considerations: {order_data['customer_info'].get('special_considerations', 'None')}
            
            Order Status: {order_data.get('order_status', 'Paid')}
            Order Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            
            Please review the measurements and begin preparation for this custom order.
            
            ---
            Stallion & Co. Order Management System
            """
            
            return await self.send_email(notification_email, subject, body)
            
        except Exception as e:
            logger.error(f"Failed to send internal notification: {str(e)}")
            return False
    
    async def send_payment_reminder(self, order_data: Dict[str, Any], payment_link: str) -> bool:
        """Send payment reminder for abandoned orders"""
        try:
            customer_email = order_data['customer_info']['email']
            customer_name = f"{order_data['customer_info']['first_name']} {order_data['customer_info']['last_name']}"
            order_id = order_data['id']
            
            subject = f"Complete Your Order - {order_id} | Stallion & Co."
            
            body = f"""
            Dear {customer_name},
            
            We noticed that your recent order with Stallion & Co. is still pending payment.
            
            ORDER DETAILS:
            Order ID: {order_id}
            Product: {order_data.get('product_selected', 'Premium Tailored Trousers')}
            
            To complete your order and secure your spot in our crafting queue, please complete your payment using the link below:
            
            Complete Payment: {payment_link}
            
            If you have any questions or need assistance, please don't hesitate to contact us.
            
            We look forward to creating your perfect tailored garment!
            
            Best regards,
            The Stallion & Co. Team
            
            ---
            This reminder will expire in 48 hours.
            """
            
            return await self.send_email(customer_email, subject, body)
            
        except Exception as e:
            logger.error(f"Failed to send payment reminder: {str(e)}")
            return False

# Create singleton instance
gmail_service = GmailService()
