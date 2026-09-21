from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="ZAVO Ordering API")
api = APIRouter(prefix="/api")

# ---------- Models ----------
class MenuItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    name: str
    description: str = ""
    price: int
    available: bool = True

class MenuItemIn(BaseModel):
    category: str
    name: str
    description: Optional[str] = ""
    price: int
    available: Optional[bool] = True

class MenuItemUpdate(BaseModel):
    category: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    available: Optional[bool] = None

class Zone(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    zip: str
    city: str
    fee: int

class ZoneIn(BaseModel):
    zip: str
    city: str
    fee: int

class ZoneUpdate(BaseModel):
    zip: Optional[str] = None
    city: Optional[str] = None
    fee: Optional[int] = None

class Courier(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str = ""
    active: bool = True

class CourierIn(BaseModel):
    name: str
    phone: Optional[str] = ""
    active: Optional[bool] = True

class CourierUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    active: Optional[bool] = None

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    zip: str = ""
    city: str = ""
    street: str = ""
    floor: str = ""
    orderCount: int = 0

class InventoryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    unit: str
    stock: float = 0
    minStock: float = 0

class InventoryIn(BaseModel):
    name: str
    unit: str
    stock: float = 0
    minStock: float = 0

class InventoryUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    stock: Optional[float] = None
    minStock: Optional[float] = None

class OrderItem(BaseModel):
    id: str
    name: str
    price: int
    qty: int
    note: str = ""

class OrderIn(BaseModel):
    customerName: str
    phone: str
    zip: str = ""
    city: str = ""
    street: str = ""
    floor: str = ""
    type: str  # delivery|pickup|dinein
    payment: str  # cash|card
    items: List[OrderItem]
    subtotal: int
    deliveryFee: int = 0
    discountPct: int = 0
    total: int
    note: Optional[str] = ""

class Order(OrderIn):
    id: str
    status: str = "new"
    courierId: Optional[str] = None
    createdAt: str

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    courierId: Optional[str] = None

# ---------- Helpers ----------
def _clean(doc):
    if doc is None:
        return None
    doc.pop("_id", None)
    return doc

async def _list(col):
    return [_clean(d) async for d in db[col].find({})]

# ---------- Menu ----------
@api.get("/menu")
async def list_menu():
    return await _list("menu_items")

@api.post("/menu", response_model=MenuItem)
async def create_menu(m: MenuItemIn):
    item = MenuItem(**m.dict())
    await db.menu_items.insert_one(item.dict())
    return item

@api.put("/menu/{id}")
async def update_menu(id: str, patch: MenuItemUpdate):
    p = {k: v for k, v in patch.dict().items() if v is not None}
    if not p:
        raise HTTPException(400, "Empty update")
    r = await db.menu_items.update_one({"id": id}, {"$set": p})
    if r.matched_count == 0:
        raise HTTPException(404, "Menu item not found")
    doc = await db.menu_items.find_one({"id": id})
    return _clean(doc)

@api.delete("/menu/{id}")
async def delete_menu(id: str):
    r = await db.menu_items.delete_one({"id": id})
    return {"deleted": r.deleted_count}

# ---------- Zones ----------
@api.get("/zones")
async def list_zones():
    return await _list("delivery_zones")

@api.post("/zones", response_model=Zone)
async def create_zone(z: ZoneIn):
    zone = Zone(**z.dict())
    await db.delivery_zones.insert_one(zone.dict())
    return zone

@api.put("/zones/{id}")
async def update_zone(id: str, patch: ZoneUpdate):
    p = {k: v for k, v in patch.dict().items() if v is not None}
    r = await db.delivery_zones.update_one({"id": id}, {"$set": p})
    if r.matched_count == 0:
        raise HTTPException(404, "Zone not found")
    return _clean(await db.delivery_zones.find_one({"id": id}))

@api.delete("/zones/{id}")
async def delete_zone(id: str):
    r = await db.delivery_zones.delete_one({"id": id})
    return {"deleted": r.deleted_count}

# ---------- Couriers ----------
@api.get("/couriers")
async def list_couriers():
    return await _list("couriers")

@api.post("/couriers", response_model=Courier)
async def create_courier(c: CourierIn):
    courier = Courier(**c.dict())
    await db.couriers.insert_one(courier.dict())
    return courier

@api.put("/couriers/{id}")
async def update_courier(id: str, patch: CourierUpdate):
    p = {k: v for k, v in patch.dict().items() if v is not None}
    r = await db.couriers.update_one({"id": id}, {"$set": p})
    if r.matched_count == 0:
        raise HTTPException(404, "Courier not found")
    return _clean(await db.couriers.find_one({"id": id}))

@api.delete("/couriers/{id}")
async def delete_courier(id: str):
    r = await db.couriers.delete_one({"id": id})
    return {"deleted": r.deleted_count}

# ---------- Customers ----------
@api.get("/customers")
async def list_customers():
    return await _list("customers")

@api.delete("/customers/{id}")
async def delete_customer(id: str):
    r = await db.customers.delete_one({"id": id})
    return {"deleted": r.deleted_count}

# ---------- Inventory ----------
@api.get("/inventory")
async def list_inventory():
    return await _list("inventory")

@api.post("/inventory", response_model=InventoryItem)
async def create_inv(i: InventoryIn):
    item = InventoryItem(**i.dict())
    await db.inventory.insert_one(item.dict())
    return item

@api.put("/inventory/{id}")
async def update_inv(id: str, patch: InventoryUpdate):
    p = {k: v for k, v in patch.dict().items() if v is not None}
    r = await db.inventory.update_one({"id": id}, {"$set": p})
    if r.matched_count == 0:
        raise HTTPException(404, "Item not found")
    return _clean(await db.inventory.find_one({"id": id}))

@api.delete("/inventory/{id}")
async def delete_inv(id: str):
    r = await db.inventory.delete_one({"id": id})
    return {"deleted": r.deleted_count}

# ---------- Orders ----------
async def _next_order_id():
    year = datetime.now(timezone.utc).year
    count = await db.orders.count_documents({})
    return f"ORD-{year}-{str(count + 125).zfill(4)}"

@api.get("/orders")
async def list_orders():
    docs = [_clean(d) async for d in db.orders.find({}).sort("createdAt", -1)]
    return docs

@api.post("/orders")
async def create_order(o: OrderIn):
    oid = await _next_order_id()
    order = Order(
        **o.dict(),
        id=oid,
        status="new",
        courierId=None,
        createdAt=datetime.now(timezone.utc).isoformat(),
    )
    await db.orders.insert_one(order.dict())
    # Upsert customer
    existing = await db.customers.find_one({"phone": o.phone})
    if existing:
        await db.customers.update_one(
            {"phone": o.phone},
            {"$set": {"name": o.customerName, "zip": o.zip, "city": o.city, "street": o.street, "floor": o.floor},
             "$inc": {"orderCount": 1}},
        )
    else:
        cust = Customer(name=o.customerName, phone=o.phone, zip=o.zip, city=o.city, street=o.street, floor=o.floor, orderCount=1)
        await db.customers.insert_one(cust.dict())
    return order

@api.put("/orders/{id}")
async def update_order(id: str, patch: OrderUpdate):
    p = {k: v for k, v in patch.dict().items() if v is not None}
    if not p:
        raise HTTPException(400, "Empty update")
    r = await db.orders.update_one({"id": id}, {"$set": p})
    if r.matched_count == 0:
        raise HTTPException(404, "Order not found")
    return _clean(await db.orders.find_one({"id": id}))

@api.delete("/orders/{id}")
async def delete_order(id: str):
    r = await db.orders.delete_one({"id": id})
    return {"deleted": r.deleted_count}

# ---------- Seed ----------
SEED_MENU = [
    ("pizzak", "Margherita", "Paradicsomszósz, mozzarella", 2190),
    ("pizzak", "Sonkás", "Paradicsomszósz, sonka, mozzarella", 2390),
    ("pizzak", "Szalámis", "Paradicsomszósz, szalámi, mozzarella", 2490),
    ("pizzak", "Hawaii", "Paradicsomszósz, sonka, ananász, mozzarella", 2490),
    ("pizzak", "Négysajtos", "Paradicsomszósz, négyféle sajt", 2590),
    ("pizzak", "Diavolo", "Paradicsomszósz, szalámi, chili, mozzarella", 2590),
    ("pizzak", "BBQ Csirke", "BBQ szósz, csirke, lilahagyma, mozzarella", 2690),
    ("pizzak", "Tonhalas", "Paradicsomszósz, tonhal, lilahagyma, mozzarella", 2690),
    ("pizzak", "ZAVO Special", "Paradicsomszósz, sonka, szalámi, gomba, kukorica, mozzarella", 2890),
    ("hamburgerek", "ZAVO Burger menü", "Marhahús, cheddar, friss zöldségek, ZAVO szósz + hasáb + üdítő", 2890),
    ("hamburgerek", "Cheeseburger", "Marhahús, cheddar, saláta, uborka", 2190),
    ("hamburgerek", "Dupla Burger", "Dupla marhahús, dupla sajt, ZAVO szósz", 2990),
    ("hamburgerek", "Csirke Burger", "Rántott csirke, saláta, majonéz", 2290),
    ("gyros", "Gyros tál", "Szaftos hús, friss saláta, hasábburgonya, öntet", 2490),
    ("gyros", "Gyros pita", "Pita, hús, zöldség, tzatziki", 1990),
    ("gyros", "Csirke Gyros tál", "Csirkehús, saláta, hasáb, öntet", 2390),
    ("tortillak", "Csirkés tortilla", "Grillezett csirke, zöldségek, szósz", 2390),
    ("tortillak", "Marhás tortilla", "Marhahús, saláta, cheddar, BBQ", 2490),
    ("tortillak", "Vega tortilla", "Zöldségek, hummusz, saláta", 1990),
    ("salatak", "Cézár saláta", "Csirke, jégsaláta, parmezán, cézár öntet", 2190),
    ("salatak", "Görög saláta", "Paradicsom, uborka, feta, olivabogyó", 1990),
    ("koretek", "Hasábburgonya", "Ropogósra sütve", 890),
    ("koretek", "Édesburgonya", "Sült édesburgonya", 1190),
    ("koretek", "Rántott hagymakarika", "6 db", 990),
    ("desszertek", "Somlói galuska", "Klasszikus házi somlói", 1290),
    ("desszertek", "Tiramisu", "Olasz kávés desszert", 1490),
    ("italok", "Coca-Cola 0,5l", "", 590),
    ("italok", "Fuze Tea 0,5l", "", 590),
    ("italok", "Ásványvíz 0,5l", "", 390),
    ("italok", "Fanta 0,5l", "", 590),
]

SEED_ZONES = [
    ("3734", "Szuhogy", 500),
    ("3733", "Rudabánya", 700),
    ("3600", "Ózd", 900),
    ("3700", "Kazincbarcika", 1200),
    ("3780", "Edelény", 1000),
]

SEED_COURIERS = [
    ("Dávid", "+36 30 111 2222", True),
    ("Márk", "+36 30 333 4444", True),
    ("Tamás", "+36 30 555 6666", False),
]

SEED_INVENTORY = [
    ("Mozzarella sajt", "kg", 12, 5),
    ("Paradicsomszósz", "l", 8, 3),
    ("Pizza tészta", "db", 45, 20),
    ("Csirkemell", "kg", 6, 4),
    ("Marhahús", "kg", 3, 5),
    ("Hamburger zsemle", "db", 30, 15),
    ("Coca-Cola 0,5l", "db", 24, 12),
]

@api.post("/seed")
async def seed():
    result = {}
    if await db.menu_items.count_documents({}) == 0:
        docs = [MenuItem(category=c, name=n, description=d, price=p).dict() for c, n, d, p in SEED_MENU]
        await db.menu_items.insert_many(docs)
        result["menu"] = len(docs)
    if await db.delivery_zones.count_documents({}) == 0:
        docs = [Zone(zip=z, city=c, fee=f).dict() for z, c, f in SEED_ZONES]
        await db.delivery_zones.insert_many(docs)
        result["zones"] = len(docs)
    if await db.couriers.count_documents({}) == 0:
        docs = [Courier(name=n, phone=p, active=a).dict() for n, p, a in SEED_COURIERS]
        await db.couriers.insert_many(docs)
        result["couriers"] = len(docs)
    if await db.inventory.count_documents({}) == 0:
        docs = [InventoryItem(name=n, unit=u, stock=s, minStock=m).dict() for n, u, s, m in SEED_INVENTORY]
        await db.inventory.insert_many(docs)
        result["inventory"] = len(docs)
    return {"seeded": result}

@api.get("/")
async def root():
    return {"service": "ZAVO Ordering API", "status": "ok"}

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
