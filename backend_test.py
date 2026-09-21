#!/usr/bin/env python3
"""
ZAVO v1.1 Backend Test Suite
Tests auth, role protection, coupons, orders, and reports
"""
import requests
import json
import sys
from datetime import datetime

# Load backend URL from frontend/.env
with open('/app/frontend/.env') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BASE_URL = line.split('=', 1)[1].strip() + '/api'
            break

print(f"Testing backend at: {BASE_URL}\n")

# Test state
admin_token = None
customer_token = None
customer_user = None
coupon_percent_id = None
coupon_amount_id = None
test_order_id = None
courier_id = None

def test(name, fn):
    """Run a test and report result"""
    try:
        fn()
        print(f"✅ {name}")
        return True
    except AssertionError as e:
        print(f"❌ {name}: {e}")
        return False
    except Exception as e:
        print(f"❌ {name}: Unexpected error: {e}")
        return False

def assert_status(resp, expected, msg=""):
    """Assert response status code"""
    if resp.status_code != expected:
        raise AssertionError(f"Expected {expected}, got {resp.status_code}. {msg} Response: {resp.text[:200]}")

def assert_in(key, data, msg=""):
    """Assert key exists in data"""
    if key not in data:
        raise AssertionError(f"Key '{key}' not found in response. {msg}")

# ============= A) AUTH TESTS =============
print("=" * 60)
print("A) AUTH FLOW TESTS")
print("=" * 60)

def test_register():
    """Register a new customer"""
    global customer_token, customer_user
    email = f"test_{datetime.now().timestamp()}@example.com"
    resp = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": "test123",
        "name": "Kovács János",
        "phone": "+36 30 123 4567"
    })
    assert_status(resp, 200, "Register should return 200")
    data = resp.json()
    assert_in('token', data, "Register should return token")
    assert_in('user', data, "Register should return user")
    assert data['user']['role'] == 'customer', f"Role should be 'customer', got {data['user']['role']}"
    assert data['user']['email'] == email, f"Email mismatch"
    customer_token = data['token']
    customer_user = data['user']

def test_register_duplicate():
    """Register with duplicate email should fail"""
    resp = requests.post(f"{BASE_URL}/auth/register", json={
        "email": customer_user['email'],
        "password": "test123",
        "name": "Test",
        "phone": ""
    })
    assert_status(resp, 400, "Duplicate email should return 400")

def test_admin_login():
    """Login as admin"""
    global admin_token
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@zavo.hu",
        "password": "admin123"
    })
    assert_status(resp, 200, "Admin login should return 200")
    data = resp.json()
    assert_in('token', data, "Login should return token")
    assert_in('user', data, "Login should return user")
    assert data['user']['role'] == 'admin', f"Admin role expected, got {data['user']['role']}"
    admin_token = data['token']

def test_auth_me_customer():
    """GET /auth/me with customer token"""
    resp = requests.get(f"{BASE_URL}/auth/me", headers={"Authorization": f"Bearer {customer_token}"})
    assert_status(resp, 200, "/auth/me should return 200")
    data = resp.json()
    assert data['id'] == customer_user['id'], "User ID mismatch"
    assert data['role'] == 'customer', "Role should be customer"

def test_auth_me_admin():
    """GET /auth/me with admin token"""
    resp = requests.get(f"{BASE_URL}/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert_status(resp, 200, "/auth/me should return 200")
    data = resp.json()
    assert data['role'] == 'admin', "Role should be admin"

def test_auth_me_no_token():
    """GET /auth/me without token should fail"""
    resp = requests.get(f"{BASE_URL}/auth/me")
    assert_status(resp, 401, "No token should return 401")

test("Register new customer", test_register)
test("Register duplicate email → 400", test_register_duplicate)
test("Admin login", test_admin_login)
test("GET /auth/me with customer token", test_auth_me_customer)
test("GET /auth/me with admin token", test_auth_me_admin)
test("GET /auth/me without token → 401", test_auth_me_no_token)

# ============= B) ROLE PROTECTION TESTS =============
print("\n" + "=" * 60)
print("B) ROLE PROTECTION TESTS")
print("=" * 60)

def test_public_reads():
    """Public endpoints should work without auth"""
    endpoints = ['/menu', '/zones', '/couriers', '/coupons']
    for ep in endpoints:
        resp = requests.get(f"{BASE_URL}{ep}")
        assert_status(resp, 200, f"Public GET {ep} should work without auth")

def test_admin_endpoints_no_auth():
    """Admin endpoints should return 401 without auth"""
    tests = [
        ('POST', '/menu', {"category": "test", "name": "test", "price": 1000}),
        ('POST', '/zones', {"zip": "1234", "city": "Test", "fee": 500}),
        ('POST', '/couriers', {"name": "Test"}),
        ('POST', '/inventory', {"name": "Test", "unit": "kg", "stock": 0, "minStock": 0}),
        ('POST', '/coupons', {"code": "TEST", "kind": "percent", "value": 10}),
        ('GET', '/customers', None),
        ('GET', '/inventory', None),
        ('GET', '/orders', None),
    ]
    for method, endpoint, payload in tests:
        if method == 'GET':
            resp = requests.get(f"{BASE_URL}{endpoint}")
        else:
            resp = requests.post(f"{BASE_URL}{endpoint}", json=payload)
        assert_status(resp, 401, f"{method} {endpoint} should return 401 without auth")

def test_admin_endpoints_customer_token():
    """Admin endpoints should return 403 with customer token"""
    headers = {"Authorization": f"Bearer {customer_token}"}
    tests = [
        ('POST', '/menu', {"category": "test", "name": "test", "price": 1000}),
        ('POST', '/zones', {"zip": "1234", "city": "Test", "fee": 500}),
        ('POST', '/couriers', {"name": "Test"}),
        ('POST', '/inventory', {"name": "Test", "unit": "kg", "stock": 0, "minStock": 0}),
        ('POST', '/coupons', {"code": "TEST", "kind": "percent", "value": 10}),
        ('GET', '/customers', None),
        ('GET', '/inventory', None),
        ('GET', '/orders', None),
    ]
    for method, endpoint, payload in tests:
        if method == 'GET':
            resp = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        else:
            resp = requests.post(f"{BASE_URL}{endpoint}", json=payload, headers=headers)
        assert_status(resp, 403, f"{method} {endpoint} should return 403 with customer token")

def test_reports_no_auth():
    """Reports endpoints should return 401 without auth"""
    endpoints = ['/reports/today', '/reports/history']
    for ep in endpoints:
        resp = requests.get(f"{BASE_URL}{ep}")
        assert_status(resp, 401, f"GET {ep} should return 401 without auth")

def test_reports_customer_token():
    """Reports endpoints should return 403 with customer token"""
    headers = {"Authorization": f"Bearer {customer_token}"}
    endpoints = ['/reports/today', '/reports/history']
    for ep in endpoints:
        resp = requests.get(f"{BASE_URL}{ep}", headers=headers)
        assert_status(resp, 403, f"GET {ep} should return 403 with customer token")

test("Public reads work without auth", test_public_reads)
test("Admin endpoints → 401 without auth", test_admin_endpoints_no_auth)
test("Admin endpoints → 403 with customer token", test_admin_endpoints_customer_token)
test("Reports → 401 without auth", test_reports_no_auth)
test("Reports → 403 with customer token", test_reports_customer_token)

# ============= C) COUPONS TESTS =============
print("\n" + "=" * 60)
print("C) COUPONS TESTS")
print("=" * 60)

def test_create_percent_coupon():
    """Create percent coupon as admin"""
    global coupon_percent_id
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.post(f"{BASE_URL}/coupons", json={
        "code": "ZAVO10",
        "kind": "percent",
        "value": 10
    }, headers=headers)
    assert_status(resp, 200, "Create coupon should return 200")
    data = resp.json()
    assert data['code'] == 'ZAVO10', "Code mismatch"
    assert data['kind'] == 'percent', "Kind should be percent"
    assert data['value'] == 10, "Value should be 10"
    assert data['active'] == True, "Should be active by default"
    coupon_percent_id = data['id']

def test_create_amount_coupon():
    """Create amount coupon as admin"""
    global coupon_amount_id
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.post(f"{BASE_URL}/coupons", json={
        "code": "VIP500",
        "kind": "amount",
        "value": 500
    }, headers=headers)
    assert_status(resp, 200, "Create coupon should return 200")
    data = resp.json()
    assert data['code'] == 'VIP500', "Code mismatch"
    assert data['kind'] == 'amount', "Kind should be amount"
    assert data['value'] == 500, "Value should be 500"
    coupon_amount_id = data['id']

def test_validate_active_coupon():
    """Validate active coupon"""
    resp = requests.post(f"{BASE_URL}/coupons/validate", json={"code": "ZAVO10"})
    assert_status(resp, 200, "Validate should return 200 for active coupon")
    data = resp.json()
    assert data['code'] == 'ZAVO10', "Code mismatch"
    assert data['active'] == True, "Should be active"

def test_deactivate_coupon():
    """Deactivate coupon and validate should fail"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Deactivate
    resp = requests.put(f"{BASE_URL}/coupons/{coupon_percent_id}", json={"active": False}, headers=headers)
    assert_status(resp, 200, "Update coupon should return 200")
    # Validate should now fail
    resp = requests.post(f"{BASE_URL}/coupons/validate", json={"code": "ZAVO10"})
    assert_status(resp, 404, "Validate should return 404 for inactive coupon")

test("Create percent coupon (ZAVO10)", test_create_percent_coupon)
test("Create amount coupon (VIP500)", test_create_amount_coupon)
test("Validate active coupon", test_validate_active_coupon)
test("Deactivate coupon → validate returns 404", test_deactivate_coupon)

# ============= D) ORDERS TESTS =============
print("\n" + "=" * 60)
print("D) ORDERS WITH AUTH TESTS")
print("=" * 60)

def test_order_min_validation():
    """Order with subtotal < 2500 for delivery+house should fail"""
    headers = {"Authorization": f"Bearer {customer_token}"}
    resp = requests.post(f"{BASE_URL}/orders", json={
        "customerName": "Kovács János",
        "phone": "+36 30 123 4567",
        "zip": "3600",
        "city": "Ózd",
        "street": "Fő utca 1",
        "floor": "2/3",
        "type": "delivery",
        "payment": "cash",
        "channel": "house",
        "items": [{"id": "1", "name": "Test Pizza", "price": 1000, "qty": 1, "note": ""}],
        "subtotal": 1000,
        "deliveryFee": 500,
        "total": 1500
    }, headers=headers)
    assert_status(resp, 400, "Order with subtotal < 2500 should return 400")
    assert "2500" in resp.text, "Error message should mention minimum order amount"

def test_order_success():
    """Order with subtotal >= 2500 should succeed"""
    global test_order_id
    headers = {"Authorization": f"Bearer {customer_token}"}
    resp = requests.post(f"{BASE_URL}/orders", json={
        "customerName": "Kovács János",
        "phone": "+36 30 123 4567",
        "zip": "3600",
        "city": "Ózd",
        "street": "Fő utca 1",
        "floor": "2/3",
        "type": "delivery",
        "payment": "cash",
        "channel": "house",
        "items": [
            {"id": "1", "name": "ZAVO Special Pizza", "price": 2890, "qty": 1, "note": "Extra sajt"}
        ],
        "subtotal": 3000,
        "deliveryFee": 500,
        "couponCode": "",
        "discountAmount": 0,
        "total": 3500
    }, headers=headers)
    assert_status(resp, 200, "Order with subtotal >= 2500 should return 200")
    data = resp.json()
    assert data['id'].startswith('ORD-'), f"Order ID should start with ORD-, got {data['id']}"
    assert data['channel'] == 'house', "Channel should be house"
    assert data['couponCode'] == '', "CouponCode should be empty"
    assert data['discountAmount'] == 0, "DiscountAmount should be 0"
    assert 'userId' in data, "userId should be set"
    assert data['userId'] == customer_user['id'], "userId should match customer"
    test_order_id = data['id']

def test_order_foodora_no_min():
    """Foodora channel with subtotal < 2500 should succeed"""
    headers = {"Authorization": f"Bearer {customer_token}"}
    resp = requests.post(f"{BASE_URL}/orders", json={
        "customerName": "Nagy Péter",
        "phone": "+36 30 999 8888",
        "zip": "3600",
        "city": "Ózd",
        "street": "Kossuth utca 5",
        "floor": "",
        "type": "delivery",
        "payment": "online",
        "channel": "foodora",
        "items": [{"id": "1", "name": "Margherita", "price": 1000, "qty": 1, "note": ""}],
        "subtotal": 1000,
        "deliveryFee": 0,
        "total": 1000
    }, headers=headers)
    assert_status(resp, 200, "Foodora channel should allow subtotal < 2500")

def test_order_update_admin():
    """Admin can update order status"""
    global courier_id
    # Get a courier first
    resp = requests.get(f"{BASE_URL}/couriers")
    couriers = resp.json()
    if couriers:
        courier_id = couriers[0]['id']
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.put(f"{BASE_URL}/orders/{test_order_id}", json={
        "status": "preparing",
        "courierId": courier_id
    }, headers=headers)
    assert_status(resp, 200, "Admin should be able to update order")
    data = resp.json()
    assert data['status'] == 'preparing', "Status should be updated"

def test_order_update_customer_forbidden():
    """Customer cannot update order"""
    headers = {"Authorization": f"Bearer {customer_token}"}
    resp = requests.put(f"{BASE_URL}/orders/{test_order_id}", json={
        "status": "cancelled"
    }, headers=headers)
    assert_status(resp, 403, "Customer should not be able to update order")

test("Order delivery+house subtotal < 2500 → 400", test_order_min_validation)
test("Order delivery+house subtotal >= 2500 → 200", test_order_success)
test("Order foodora subtotal < 2500 → 200 (no min)", test_order_foodora_no_min)
test("Admin can update order status", test_order_update_admin)
test("Customer cannot update order → 403", test_order_update_customer_forbidden)

# ============= E) REPORTS TESTS =============
print("\n" + "=" * 60)
print("E) REPORTS TESTS")
print("=" * 60)

def test_reports_today():
    """GET /reports/today returns stats"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.get(f"{BASE_URL}/reports/today", headers=headers)
    assert_status(resp, 200, "Reports today should return 200")
    data = resp.json()
    assert_in('orders', data, "Should have orders count")
    assert_in('revenue', data, "Should have revenue")
    assert_in('byPayment', data, "Should have byPayment")
    assert_in('byChannel', data, "Should have byChannel")
    assert_in('byCourier', data, "Should have byCourier")
    assert data['orders'] > 0, "Should have at least one order from previous tests"
    assert data['revenue'] > 0, "Should have non-zero revenue"

def test_reports_close_day():
    """POST /reports/close-day archives report"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.post(f"{BASE_URL}/reports/close-day", headers=headers)
    assert_status(resp, 200, "Close day should return 200")
    data = resp.json()
    assert_in('id', data, "Should have id")
    assert_in('closedAt', data, "Should have closedAt timestamp")
    assert_in('orders', data, "Should have orders count")

def test_reports_history():
    """GET /reports/history lists archived reports"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.get(f"{BASE_URL}/reports/history", headers=headers)
    assert_status(resp, 200, "Reports history should return 200")
    data = resp.json()
    assert isinstance(data, list), "Should return a list"
    assert len(data) > 0, "Should have at least one archived report from previous test"

def test_reports_courier():
    """GET /reports/courier/{id} returns courier metrics"""
    if not courier_id:
        print("⚠️  Skipping courier report test (no courier ID)")
        return
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.get(f"{BASE_URL}/reports/courier/{courier_id}", headers=headers)
    assert_status(resp, 200, "Courier report should return 200")
    data = resp.json()
    assert_in('courierId', data, "Should have courierId")
    assert_in('courierName', data, "Should have courierName")
    assert_in('orders', data, "Should have orders count")
    assert_in('revenue', data, "Should have revenue")
    assert_in('cash', data, "Should have cash")
    assert_in('card', data, "Should have card")
    assert_in('online', data, "Should have online")

test("GET /reports/today returns stats", test_reports_today)
test("POST /reports/close-day archives report", test_reports_close_day)
test("GET /reports/history lists reports", test_reports_history)
test("GET /reports/courier/{id} returns metrics", test_reports_courier)

print("\n" + "=" * 60)
print("TESTING COMPLETE")
print("=" * 60)
