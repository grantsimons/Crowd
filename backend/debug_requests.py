#!/usr/bin/env python3
"""
Debug script to test different request scenarios and see FastAPI error handling
"""
import requests
import json

API_BASE = "http://localhost:8000/api/v1"

def test_valid_request():
    """Test with valid data"""
    print("🧪 Testing VALID request...")
    data = {
        "user_id": "test123",
        "first_name": "John",
        "last_name": "Doe",
        "age": 25,
        "email": "john@example.com"
    }
    
    response = requests.post(f"{API_BASE}/userCreate", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_invalid_field_types():
    """Test with wrong field types"""
    print("🧪 Testing INVALID field types...")
    data = {
        "user_id": 123,  # Should be string
        "first_name": "John",
        "last_name": "Doe", 
        "age": "not_a_number",  # Should be integer
        "email": "invalid-email"  # Invalid email format
    }
    
    response = requests.post(f"{API_BASE}/userCreate", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_missing_required_fields():
    """Test with missing required fields"""
    print("🧪 Testing MISSING required fields...")
    data = {
        "user_id": "test456",
        # Missing first_name, last_name, age
        "email": "test@example.com"
    }
    
    response = requests.post(f"{API_BASE}/userCreate", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_field_length_validation():
    """Test field length validation"""
    print("🧪 Testing FIELD LENGTH validation...")
    data = {
        "user_id": "a",  # Too short (min 3 chars)
        "first_name": "x" * 200,  # Too long (max 120 chars)
        "last_name": "Doe",
        "age": 25
    }
    
    response = requests.post(f"{API_BASE}/userCreate", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_debug_endpoint():
    """Test the debug endpoint"""
    print("🧪 Testing DEBUG endpoint...")
    data = {"test": "data", "number": 123}
    
    response = requests.post(f"{API_BASE}/debug/raw-request", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

if __name__ == "__main__":
    print("🚀 FastAPI Request Debugging Tests")
    print("=" * 50)
    print("Make sure your FastAPI server is running on localhost:8000")
    print("=" * 50)
    
    try:
        test_valid_request()
        test_invalid_field_types()
        test_missing_required_fields()
        test_field_length_validation()
        test_debug_endpoint()
        
        print("✅ All tests completed! Check your FastAPI server console for detailed logs.")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to FastAPI server.")
        print("Make sure it's running with: cd backend && python -m uvicorn app.main:app --reload")
