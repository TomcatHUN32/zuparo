#!/usr/bin/env python3
"""
ZAVO Backend API Test Suite
Tests all backend endpoints at REACT_APP_BACKEND_URL/api
"""

import requests
import json
import re
from datetime import datetime

# Backend URL from frontend/.env
BASE_URL = "https://order-app-65.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_test(name, passed, details=""):
    status = f"{Colors.GREEN}✓ PASS{Colors.END}" if passed else f"{Colors.RED}✗ FAIL{Colors.END}"
    print(f"{status} - {name}")
    if details:
        print(f"  {details}")
    return passed

def test_seed_idempotent():
    """Test 1: POST /api/seed twice - second should return empty seeded map"""
    print(f"\n{Colors.BLUE}=== Test 1: Seed Endpoint (Idempotent) ==={Colors.END}")
    
    # First seed
    r1 = requests.post(f"{BASE_URL}/seed")
    if r1.status_code != 200:
        return log_test("Seed endpoint first call", False, f"Status: {r1.status_code}, Response: {r1.text}")
    
    data1 = r1.json()
    log_test("Seed endpoint first call", True, f"Seeded: {data1}")
    
    # Second seed (should be empty)
    r2 = requests.post(f"{BASE_URL}/seed")
    if r2.status_code != 200:
        return log_test("Seed endpoint second call", False, f"Status: {r2.status_code}, Response: {r2.text}")
    
    data2 = r2.json()
    is_empty = data2.get("seeded", {}) == {}
    return log_test("Seed idempotency", is_empty, f"Second seed returned: {data2}")

def test_list_endpoints():
    """Test 2: GET /api/menu, /api/zones, /api/couriers, /api/inventory - all return non-empty"""
    print(f"\n{Colors.BLUE}=== Test 2: List Endpoints (Non-Empty After Seed) ==={Colors.END}")
    
    results = []
    endpoints = ["menu", "zones", "couriers", "inventory"]
    
    for endpoint in endpoints:
        r = requests.get(f"{BASE_URL}/{endpoint}")
        if r.status_code != 200:
            results.append(log_test(f"GET /{endpoint}", False, f"Status: {r.status_code}"))
            continue
        
        data = r.json()
        is_non_empty = isinstance(data, list) and len(data) > 0
        results.append(log_test(f"GET /{endpoint} non-empty", is_non_empty, f"Count: {len(data)}"))
    
    return all(results)

def test_menu_crud():
    """Test 3: Menu CRUD - POST, PUT, DELETE"""
    print(f"\n{Colors.BLUE}=== Test 3: Menu CRUD ==={Colors.END}")
    
    results = []
    
    # CREATE
    new_item = {
        "category": "pizzak",
        "name": "Test Pizza",
        "description": "Teszt pizza leírás",
        "price": 2990
    }
    r = requests.post(f"{BASE_URL}/menu", json=new_item)
    if r.status_code != 200:
        results.append(log_test("POST /menu", False, f"Status: {r.status_code}, Response: {r.text}"))
        return False
    
    created = r.json()
    item_id = created.get("id")
    results.append(log_test("POST /menu", True, f"Created item with id: {item_id}"))
    
    # UPDATE
    update_data = {"price": 3190, "description": "Frissített leírás"}
    r = requests.put(f"{BASE_URL}/menu/{item_id}", json=update_data)
    if r.status_code != 200:
        results.append(log_test("PUT /menu/{id}", False, f"Status: {r.status_code}, Response: {r.text}"))
    else:
        updated = r.json()
        price_ok = updated.get("price") == 3190
        desc_ok = updated.get("description") == "Frissített leírás"
        results.append(log_test("PUT /menu/{id}", price_ok and desc_ok, f"Updated: {updated}"))
    
    # DELETE
    r = requests.delete(f"{BASE_URL}/menu/{item_id}")
    if r.status_code != 200:
        results.append(log_test("DELETE /menu/{id}", False, f"Status: {r.status_code}"))
    else:
        deleted = r.json()
        results.append(log_test("DELETE /menu/{id}", deleted.get("deleted") == 1, f"Deleted count: {deleted.get('deleted')}"))
    
    return all(results)

def test_zones_crud():
    """Test 4: Zones CRUD - POST, PUT, DELETE"""
    print(f"\n{Colors.BLUE}=== Test 4: Zones CRUD ==={Colors.END}")
    
    results = []
    
    # CREATE
    new_zone = {
        "zip": "1234",
        "city": "Teszt Város",
        "fee": 800
    }
    r = requests.post(f"{BASE_URL}/zones", json=new_zone)
    if r.status_code != 200:
        results.append(log_test("POST /zones", False, f"Status: {r.status_code}, Response: {r.text}"))
        return False
    
    created = r.json()
    zone_id = created.get("id")
    results.append(log_test("POST /zones", True, f"Created zone with id: {zone_id}"))
    
    # UPDATE
    update_data = {"fee": 950}
    r = requests.put(f"{BASE_URL}/zones/{zone_id}", json=update_data)
    if r.status_code != 200:
        results.append(log_test("PUT /zones/{id}", False, f"Status: {r.status_code}, Response: {r.text}"))
    else:
        updated = r.json()
        fee_ok = updated.get("fee") == 950
        results.append(log_test("PUT /zones/{id}", fee_ok, f"Updated fee: {updated.get('fee')}"))
    
    # DELETE
    r = requests.delete(f"{BASE_URL}/zones/{zone_id}")
    if r.status_code != 200:
        results.append(log_test("DELETE /zones/{id}", False, f"Status: {r.status_code}"))
    else:
        deleted = r.json()
        results.append(log_test("DELETE /zones/{id}", deleted.get("deleted") == 1, f"Deleted count: {deleted.get('deleted')}"))
    
    return all(results)

def test_couriers_crud():
    """Test 5: Couriers CRUD - POST, PUT, DELETE"""
    print(f"\n{Colors.BLUE}=== Test 5: Couriers CRUD ==={Colors.END}")
    
    results = []
    
    # CREATE
    new_courier = {
        "name": "Teszt Futár",
        "phone": "+36 30 999 8888",
        "active": True
    }
    r = requests.post(f"{BASE_URL}/couriers", json=new_courier)
    if r.status_code != 200:
        results.append(log_test("POST /couriers", False, f"Status: {r.status_code}, Response: {r.text}"))
        return False
    
    created = r.json()
    courier_id = created.get("id")
    results.append(log_test("POST /couriers", True, f"Created courier with id: {courier_id}"))
    
    # UPDATE
    update_data = {"active": False, "phone": "+36 30 999 7777"}
    r = requests.put(f"{BASE_URL}/couriers/{courier_id}", json=update_data)
    if r.status_code != 200:
        results.append(log_test("PUT /couriers/{id}", False, f"Status: {r.status_code}, Response: {r.text}"))
    else:
        updated = r.json()
        active_ok = updated.get("active") == False
        phone_ok = updated.get("phone") == "+36 30 999 7777"
        results.append(log_test("PUT /couriers/{id}", active_ok and phone_ok, f"Updated: {updated}"))
    
    # DELETE
    r = requests.delete(f"{BASE_URL}/couriers/{courier_id}")
    if r.status_code != 200:
        results.append(log_test("DELETE /couriers/{id}", False, f"Status: {r.status_code}"))
    else:
        deleted = r.json()
        results.append(log_test("DELETE /couriers/{id}", deleted.get("deleted") == 1, f"Deleted count: {deleted.get('deleted')}"))
    
    return all(results)

def test_inventory_crud():
    """Test 6: Inventory CRUD - POST, PUT, DELETE"""
    print(f"\n{Colors.BLUE}=== Test 6: Inventory CRUD ==={Colors.END}")
    
    results = []
    
    # CREATE
    new_item = {
        "name": "Teszt Alapanyag",
        "unit": "kg",
        "stock": 15.5,
        "minStock": 5.0
    }
    r = requests.post(f"{BASE_URL}/inventory", json=new_item)
    if r.status_code != 200:
        results.append(log_test("POST /inventory", False, f"Status: {r.status_code}, Response: {r.text}"))
        return False
    
    created = r.json()
    item_id = created.get("id")
    results.append(log_test("POST /inventory", True, f"Created item with id: {item_id}"))
    
    # UPDATE
    update_data = {"stock": 20.0, "minStock": 8.0}
    r = requests.put(f"{BASE_URL}/inventory/{item_id}", json=update_data)
    if r.status_code != 200:
        results.append(log_test("PUT /inventory/{id}", False, f"Status: {r.status_code}, Response: {r.text}"))
    else:
        updated = r.json()
        stock_ok = updated.get("stock") == 20.0
        min_ok = updated.get("minStock") == 8.0
        results.append(log_test("PUT /inventory/{id}", stock_ok and min_ok, f"Updated: {updated}"))
    
    # DELETE
    r = requests.delete(f"{BASE_URL}/inventory/{item_id}")
    if r.status_code != 200:
        results.append(log_test("DELETE /inventory/{id}", False, f"Status: {r.status_code}"))
    else:
        deleted = r.json()
        results.append(log_test("DELETE /inventory/{id}", deleted.get("deleted") == 1, f"Deleted count: {deleted.get('deleted')}"))
    
    return all(results)

def test_orders_lifecycle():
    """Test 7: Orders lifecycle - POST, customer upsert, PUT, DELETE"""
    print(f"\n{Colors.BLUE}=== Test 7: Orders Lifecycle ==={Colors.END}")
    
    results = []
    test_phone = "+36 30 123 4567"
    
    # Get a courier ID for assignment later
    r = requests.get(f"{BASE_URL}/couriers")
    couriers = r.json()
    courier_id = couriers[0]["id"] if couriers else None
    
    # CREATE ORDER 1
    order1 = {
        "customerName": "Kovács János",
        "phone": test_phone,
        "zip": "3734",
        "city": "Szuhogy",
        "street": "Fő utca 12",
        "floor": "2. emelet",
        "type": "delivery",
        "payment": "cash",
        "items": [
            {"id": "1", "name": "Margherita pizza", "price": 2190, "qty": 2, "note": "Extra sajt kérem"},
            {"id": "2", "name": "Coca-Cola 0,5l", "price": 590, "qty": 2, "note": ""}
        ],
        "subtotal": 5560,
        "deliveryFee": 500,
        "discountPct": 0,
        "total": 6060,
        "note": "Kérem csengessen!"
    }
    
    r = requests.post(f"{BASE_URL}/orders", json=order1)
    if r.status_code != 200:
        results.append(log_test("POST /orders (first)", False, f"Status: {r.status_code}, Response: {r.text}"))
        return False
    
    created_order = r.json()
    order_id = created_order.get("id")
    
    # Verify order ID format ORD-YYYY-####
    id_pattern = r'^ORD-\d{4}-\d{4}$'
    id_match = re.match(id_pattern, order_id) is not None
    results.append(log_test("Order ID format ORD-YYYY-####", id_match, f"Order ID: {order_id}"))
    
    # Verify status='new'
    status_ok = created_order.get("status") == "new"
    results.append(log_test("Order status='new'", status_ok, f"Status: {created_order.get('status')}"))
    
    # Verify createdAt exists
    created_at = created_order.get("createdAt")
    created_at_ok = created_at is not None and len(created_at) > 0
    results.append(log_test("Order has createdAt", created_at_ok, f"createdAt: {created_at}"))
    
    # GET CUSTOMERS - verify customer exists with orderCount >= 1
    r = requests.get(f"{BASE_URL}/customers")
    if r.status_code != 200:
        results.append(log_test("GET /customers", False, f"Status: {r.status_code}"))
    else:
        customers = r.json()
        customer = next((c for c in customers if c["phone"] == test_phone), None)
        if customer:
            order_count_1 = customer.get("orderCount", 0)
            results.append(log_test("Customer exists with orderCount >= 1", order_count_1 >= 1, 
                                   f"Customer: {customer['name']}, orderCount: {order_count_1}"))
        else:
            results.append(log_test("Customer exists", False, "Customer not found"))
    
    # CREATE ORDER 2 with same phone - verify orderCount increments
    order2 = {
        "customerName": "Kovács János",
        "phone": test_phone,
        "zip": "3734",
        "city": "Szuhogy",
        "street": "Fő utca 12",
        "floor": "2. emelet",
        "type": "delivery",
        "payment": "card",
        "items": [
            {"id": "3", "name": "Sonkás pizza", "price": 2390, "qty": 1, "note": ""}
        ],
        "subtotal": 2390,
        "deliveryFee": 500,
        "discountPct": 10,
        "total": 2601,
        "note": ""
    }
    
    r = requests.post(f"{BASE_URL}/orders", json=order2)
    if r.status_code != 200:
        results.append(log_test("POST /orders (second)", False, f"Status: {r.status_code}"))
    else:
        order2_id = r.json().get("id")
        results.append(log_test("POST /orders (second)", True, f"Order ID: {order2_id}"))
        
        # Verify orderCount incremented
        r = requests.get(f"{BASE_URL}/customers")
        customers = r.json()
        customer = next((c for c in customers if c["phone"] == test_phone), None)
        if customer:
            order_count_2 = customer.get("orderCount", 0)
            incremented = order_count_2 >= 2
            results.append(log_test("Customer orderCount incremented", incremented, 
                                   f"orderCount: {order_count_2}"))
        else:
            results.append(log_test("Customer orderCount check", False, "Customer not found"))
    
    # UPDATE ORDER - set status='on_route' and courierId
    if courier_id:
        update_data = {
            "status": "on_route",
            "courierId": courier_id
        }
        r = requests.put(f"{BASE_URL}/orders/{order_id}", json=update_data)
        if r.status_code != 200:
            results.append(log_test("PUT /orders/{id}", False, f"Status: {r.status_code}, Response: {r.text}"))
        else:
            updated_order = r.json()
            status_updated = updated_order.get("status") == "on_route"
            courier_updated = updated_order.get("courierId") == courier_id
            results.append(log_test("PUT /orders/{id} status & courier", status_updated and courier_updated, 
                                   f"Status: {updated_order.get('status')}, Courier: {updated_order.get('courierId')}"))
        
        # GET ORDERS - confirm update
        r = requests.get(f"{BASE_URL}/orders")
        if r.status_code != 200:
            results.append(log_test("GET /orders", False, f"Status: {r.status_code}"))
        else:
            orders = r.json()
            order = next((o for o in orders if o["id"] == order_id), None)
            if order:
                confirmed = order.get("status") == "on_route" and order.get("courierId") == courier_id
                results.append(log_test("GET /orders confirms update", confirmed, 
                                       f"Status: {order.get('status')}, Courier: {order.get('courierId')}"))
            else:
                results.append(log_test("GET /orders confirms update", False, "Order not found"))
    else:
        results.append(log_test("PUT /orders/{id}", False, "No courier available for assignment"))
    
    # DELETE ORDER
    r = requests.delete(f"{BASE_URL}/orders/{order_id}")
    if r.status_code != 200:
        results.append(log_test("DELETE /orders/{id}", False, f"Status: {r.status_code}"))
    else:
        deleted = r.json()
        results.append(log_test("DELETE /orders/{id}", deleted.get("deleted") == 1, 
                               f"Deleted count: {deleted.get('deleted')}"))
    
    return all(results)

def test_customers_delete():
    """Test 8: DELETE /customers/{id}"""
    print(f"\n{Colors.BLUE}=== Test 8: Customers Delete ==={Colors.END}")
    
    # Get a customer to delete
    r = requests.get(f"{BASE_URL}/customers")
    if r.status_code != 200:
        return log_test("GET /customers", False, f"Status: {r.status_code}")
    
    customers = r.json()
    if not customers:
        return log_test("DELETE /customers/{id}", False, "No customers available to delete")
    
    customer_id = customers[0]["id"]
    r = requests.delete(f"{BASE_URL}/customers/{customer_id}")
    if r.status_code != 200:
        return log_test("DELETE /customers/{id}", False, f"Status: {r.status_code}")
    
    deleted = r.json()
    return log_test("DELETE /customers/{id}", deleted.get("deleted") == 1, 
                   f"Deleted customer {customer_id}, count: {deleted.get('deleted')}")

def main():
    print(f"\n{Colors.YELLOW}{'='*60}{Colors.END}")
    print(f"{Colors.YELLOW}ZAVO Backend API Test Suite{Colors.END}")
    print(f"{Colors.YELLOW}Testing: {BASE_URL}{Colors.END}")
    print(f"{Colors.YELLOW}{'='*60}{Colors.END}")
    
    all_results = []
    
    # Run all tests in order
    all_results.append(test_seed_idempotent())
    all_results.append(test_list_endpoints())
    all_results.append(test_menu_crud())
    all_results.append(test_zones_crud())
    all_results.append(test_couriers_crud())
    all_results.append(test_inventory_crud())
    all_results.append(test_orders_lifecycle())
    all_results.append(test_customers_delete())
    
    # Summary
    print(f"\n{Colors.YELLOW}{'='*60}{Colors.END}")
    passed = sum(all_results)
    total = len(all_results)
    
    if passed == total:
        print(f"{Colors.GREEN}✓ ALL TESTS PASSED ({passed}/{total}){Colors.END}")
    else:
        print(f"{Colors.RED}✗ SOME TESTS FAILED ({passed}/{total} passed){Colors.END}")
    
    print(f"{Colors.YELLOW}{'='*60}{Colors.END}\n")
    
    return passed == total

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
