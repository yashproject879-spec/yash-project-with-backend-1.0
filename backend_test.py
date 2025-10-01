#!/usr/bin/env python3
"""
Backend API Testing for Stallion & Co. Luxury Tailoring
Tests all API endpoints for functionality, data validation, and error handling
"""

import requests
import json
import uuid
from datetime import datetime
import sys
import os

# Backend URL configuration
BACKEND_URL = "http://localhost:8001"
API_BASE = f"{BACKEND_URL}/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}Testing: {test_name}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

def test_api_health_check():
    """Test API health check and root endpoints"""
    print_test_header("API Health Check")
    
    # Test root endpoint
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "Stallion & Co." in data["message"]:
                print_success(f"Root endpoint working: {data['message']}")
            else:
                print_error(f"Root endpoint response unexpected: {data}")
        else:
            print_error(f"Root endpoint failed with status {response.status_code}")
    except Exception as e:
        print_error(f"Root endpoint connection failed: {str(e)}")
    
    # Test health check endpoint
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                print_success(f"Health check passed: {data}")
            else:
                print_error(f"Health check status not healthy: {data}")
        else:
            print_error(f"Health check failed with status {response.status_code}")
    except Exception as e:
        print_error(f"Health check connection failed: {str(e)}")

def test_product_catalog():
    """Test product catalog endpoint"""
    print_test_header("Product Catalog")
    
    try:
        response = requests.get(f"{API_BASE}/products", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "products" in data and len(data["products"]) > 0:
                product = data["products"][0]
                required_fields = ["id", "name", "description", "price", "currency"]
                missing_fields = [field for field in required_fields if field not in product]
                
                if not missing_fields:
                    print_success(f"Product catalog working with {len(data['products'])} products")
                    print_info(f"Sample product: {product['name']} - {product['price']} {product['currency']}")
                else:
                    print_error(f"Product missing required fields: {missing_fields}")
            else:
                print_error("No products found in catalog")
        else:
            print_error(f"Product catalog failed with status {response.status_code}")
    except Exception as e:
        print_error(f"Product catalog connection failed: {str(e)}")

def test_measurement_submission():
    """Test measurement submission with valid data"""
    print_test_header("Measurement Submission")
    
    # Valid measurement data
    valid_measurement = {
        "customer_info": {
            "first_name": "Alexander",
            "last_name": "Sterling",
            "email": "alexander.sterling@luxurymail.com",
            "phone": "+44 20 7123 4567",
            "age": 35,
            "body_type": "Athletic",
            "special_considerations": "Prefers slightly tapered fit"
        },
        "measurements": {
            "height": 180.5,
            "weight": 75.2,
            "outseam": 108.0,
            "waist": 84.0,
            "hip_seat": 98.0,
            "thigh": 58.0,
            "crotch_rise": 28.5,
            "bottom_opening": 18.0,
            "unit": "cm"
        },
        "product_selected": "Premium Tailored Trousers",
        "fabric_choice": "Wool",
        "style_preferences": "Classic fit with modern details",
        "notes": "Client prefers navy blue with subtle pinstripe pattern"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/measurements",
            json=valid_measurement,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success" and "submission_id" in data:
                print_success(f"Measurement submission successful: {data['submission_id']}")
                print_info(f"Customer: {data.get('customer_email', 'N/A')}")
                return data["submission_id"]  # Return ID for retrieval test
            else:
                print_error(f"Measurement submission response unexpected: {data}")
        else:
            print_error(f"Measurement submission failed with status {response.status_code}")
            try:
                error_data = response.json()
                print_error(f"Error details: {error_data}")
            except:
                print_error(f"Response text: {response.text}")
    except Exception as e:
        print_error(f"Measurement submission connection failed: {str(e)}")
    
    return None

def test_virtual_fitting():
    """Test virtual fitting booking"""
    print_test_header("Virtual Fitting Booking")
    
    # Valid virtual fitting request
    valid_fitting_request = {
        "customer_info": {
            "first_name": "Victoria",
            "last_name": "Pemberton",
            "email": "victoria.pemberton@elitemail.com",
            "phone": "+44 20 7987 6543",
            "age": 42,
            "body_type": "Petite",
            "special_considerations": "Requires alterations for formal events"
        },
        "preferred_date": "2024-02-15",
        "preferred_time": "14:30",
        "fitting_type": "virtual_consultation",
        "notes": "Interested in bespoke evening wear consultation"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/virtual-fitting",
            json=valid_fitting_request,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success" and "booking_id" in data:
                print_success(f"Virtual fitting booking successful: {data['booking_id']}")
                print_info(f"Customer: {data.get('customer_email', 'N/A')}")
                return data["booking_id"]
            else:
                print_error(f"Virtual fitting booking response unexpected: {data}")
        else:
            print_error(f"Virtual fitting booking failed with status {response.status_code}")
            try:
                error_data = response.json()
                print_error(f"Error details: {error_data}")
            except:
                print_error(f"Response text: {response.text}")
    except Exception as e:
        print_error(f"Virtual fitting booking connection failed: {str(e)}")
    
    return None

def test_data_retrieval(submission_id):
    """Test retrieving measurement data by ID"""
    print_test_header("Data Retrieval")
    
    if not submission_id:
        print_warning("No submission ID available for retrieval test")
        return
    
    try:
        response = requests.get(f"{API_BASE}/measurements/{submission_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "customer_info" in data and "measurements" in data:
                print_success(f"Data retrieval successful for ID: {submission_id}")
                print_info(f"Retrieved customer: {data['customer_info']['first_name']} {data['customer_info']['last_name']}")
            else:
                print_error(f"Retrieved data missing required fields: {list(data.keys())}")
        elif response.status_code == 404:
            print_error("Measurement not found (404) - possible database issue")
        else:
            print_error(f"Data retrieval failed with status {response.status_code}")
    except Exception as e:
        print_error(f"Data retrieval connection failed: {str(e)}")

def test_error_handling():
    """Test error handling with invalid data"""
    print_test_header("Error Handling")
    
    # Test invalid measurement data
    invalid_measurement = {
        "customer_info": {
            "first_name": "",  # Invalid: empty name
            "last_name": "Test",
            "email": "invalid-email",  # Invalid: bad email format
            "age": 15  # Invalid: under 18
        },
        "measurements": {
            "height": -10,  # Invalid: negative height
            "weight": 0,    # Invalid: zero weight
            "unit": "invalid_unit"  # Invalid: bad unit
        }
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/measurements",
            json=invalid_measurement,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 422:  # Validation error expected
            print_success("Validation errors properly handled (422)")
            try:
                error_data = response.json()
                print_info(f"Validation details: {len(error_data.get('detail', []))} errors found")
            except:
                pass
        elif response.status_code == 400:
            print_success("Bad request properly handled (400)")
        else:
            print_warning(f"Unexpected status code for invalid data: {response.status_code}")
    except Exception as e:
        print_error(f"Error handling test failed: {str(e)}")
    
    # Test non-existent measurement retrieval
    fake_id = str(uuid.uuid4())
    try:
        response = requests.get(f"{API_BASE}/measurements/{fake_id}", timeout=10)
        if response.status_code == 404:
            print_success("Non-existent measurement properly returns 404")
        else:
            print_warning(f"Non-existent measurement returned status: {response.status_code}")
    except Exception as e:
        print_error(f"Non-existent measurement test failed: {str(e)}")

def run_all_tests():
    """Run all backend API tests"""
    print(f"{Colors.BOLD}Stallion & Co. Backend API Test Suite{Colors.ENDC}")
    print(f"Testing backend at: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Run all tests
    test_api_health_check()
    test_product_catalog()
    submission_id = test_measurement_submission()
    test_virtual_fitting()
    test_data_retrieval(submission_id)
    test_error_handling()
    
    print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}Backend API Testing Complete{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}")

if __name__ == "__main__":
    run_all_tests()