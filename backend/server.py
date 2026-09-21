from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, logging, uuid, jwt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta, date
from passlib.hash import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'zuparo-secret-change-me')
JWT_ALG = 'HS256'
JWT_EXPIRE_HOURS = 24 * 7

app = FastAPI(title="ZUPARO Ordering API")
api = APIRouter(prefix="/api")

# =============== Auth ===============
class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = ""

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    phone: str = ""
    role: str

def make_token(user_id: str, role: str) -> str:
    payload = {"sub": user_id, "role": role, "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.lower().startswith('bearer '):
        raise HTTPException(401, "Missing token")
    token = authorization.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": payload.get('sub')})
    if not user:
        raise HTTPException(401, "User not found")
    user.pop('_id', None); user.pop('password_hash', None)
    return user

async def require_admin(user=Depends(get_current_user)):
    if user.get('role') != 'admin':
        raise HTTPException(403, "Admin only")
    return user

@api.post('/auth/register')
async def register(data: RegisterIn):
    if await db.users.find_one({"email": data.email.lower()}):
        raise HTTPException(400, "Ez az email már regisztrálva van")
    uid = str(uuid.uuid4())
    doc = {
        "id": uid, "email": data.email.lower(), "name": data.name,
        "phone": data.phone or "", "role": "customer",
        "password_hash": bcrypt.hash(data.password),
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = make_token(uid, "customer")
    return {"token": token, "user": {"id": uid, "email": data.email.lower(), "name": data.name, "phone": data.phone or "", "role": "customer"}}

@api.post('/auth/login')
async def login(data: LoginIn):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not bcrypt.verify(data.password, user.get('password_hash', '')):
        raise HTTPException(401, "Hibás email vagy jelszó")
    token = make_token(user['id'], user['role'])
    return {"token": token, "user": {"id": user['id'], "email": user['email'], "name": user['name'], "phone": user.get('phone', ''), "role": user['role']}}

@api.get('/auth/me')
async def me(user=Depends(get_current_user)):
    return user

# =============== Models ===============
class RecipeEntry(BaseModel):
    inventoryId: str
    qty: float

class MenuItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    name: str
    description: str = ""
    price: int
    priceFoodora: Optional[int] = None
    priceFalatozz: Optional[int] = None
    available: bool = True
    recipe: List[RecipeEntry] = []

class MenuItemIn(BaseModel):
    category: str
    name: str
    description: Optional[str] = ""
    price: int
    priceFoodora: Optional[int] = None
    priceFalatozz: Optional[int] = None
    available: Optional[bool] = True
    recipe: Optional[List[RecipeEntry]] = []

class MenuItemUpdate(BaseModel):
    category: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    priceFoodora: Optional[int] = None
    priceFalatozz: Optional[int] = None
    available: Optional[bool] = None
    recipe: Optional[List[RecipeEntry]] = None

class Zone(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    zip: str
    city: str
    fee: int

class ZoneIn(BaseModel):
    zip: str; city: str; fee: int

class ZoneUpdate(BaseModel):
    zip: Optional[str] = None; city: Optional[str] = None; fee: Optional[int] = None

class Courier(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str = ""
    active: bool = True

class CourierIn(BaseModel):
    name: str; phone: Optional[str] = ""; active: Optional[bool] = True

class CourierUpdate(BaseModel):
    name: Optional[str] = None; phone: Optional[str] = None; active: Optional[bool] = None

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str; phone: str
    zip: str = ""; city: str = ""; street: str = ""; floor: str = ""
    orderCount: int = 0

class InventoryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str; unit: str; stock: float = 0; minStock: float = 0

class InventoryIn(BaseModel):
    name: str; unit: str; stock: float = 0; minStock: float = 0

class InventoryUpdate(BaseModel):
    name: Optional[str] = None; unit: Optional[str] = None; stock: Optional[float] = None; minStock: Optional[float] = None

class OrderItem(BaseModel):
    id: str; name: str; price: int; qty: int; note: str = ""

class OrderIn(BaseModel):
    customerName: str
    phone: str
    zip: str = ""; city: str = ""; street: str = ""; floor: str = ""
    type: str  # delivery|pickup|dinein
    payment: str  # cash|card|online
    channel: str = "house"  # house|foodora|falatozz
    items: List[OrderItem]
    subtotal: int
    deliveryFee: int = 0
    discountPct: int = 0
    discountAmount: int = 0
    couponCode: Optional[str] = ""
    total: int
    note: Optional[str] = ""

class Order(OrderIn):
    id: str
    status: str = "new"
    courierId: Optional[str] = None
    createdAt: str
    userId: Optional[str] = None

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    courierId: Optional[str] = None
    items: Optional[List[OrderItem]] = None
    subtotal: Optional[int] = None
    deliveryFee: Optional[int] = None
    discountAmount: Optional[int] = None
    discountPct: Optional[int] = None
    couponCode: Optional[str] = None
    total: Optional[int] = None
    note: Optional[str] = None
    zip: Optional[str] = None
    city: Optional[str] = None
    street: Optional[str] = None
    floor: Optional[str] = None
    payment: Optional[str] = None

class Coupon(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    kind: str  # 'percent' | 'amount'
    value: int
    active: bool = True

class CouponIn(BaseModel):
    code: str; kind: str; value: int; active: Optional[bool] = True

class CouponUpdate(BaseModel):
    code: Optional[str] = None; kind: Optional[str] = None; value: Optional[int] = None; active: Optional[bool] = None

# =============== Helpers ===============
def _clean(doc):
    if doc is None: return None
    doc.pop("_id", None); return doc

async def _list(col):
    return [_clean(d) async for d in db[col].find({})]

# =============== Menu ===============
@api.get("/menu")
async def list_menu():
    return await _list("menu_items")

@api.post("/menu", response_model=MenuItem)
async def create_menu(m: MenuItemIn, _admin=Depends(require_admin)):
    item = MenuItem(**m.dict())
    await db.menu_items.insert_one(item.dict()); return item

@api.put("/menu/{id}")
async def update_menu(id: str, patch: MenuItemUpdate, _admin=Depends(require_admin)):
    p = {k: v for k, v in patch.dict().items() if v is not None}
    if not p: raise HTTPException(400, "Empty update")
    r = await db.menu_items.update_one({"id": id}, {"$set": p})
    if r.matched_count == 0: raise HTTPException(404, "Not found")
    return _clean(await db.menu_items.find_one({"id": id}))

@api.delete("/menu/{id}")
async def delete_menu(id: str, _admin=Depends(require_admin)):
    r = await db.menu_items.delete_one({"id": id}); return {"deleted": r.deleted_count}

# =============== Zones ===============
@api.get("/zones")
async def list_zones():
    return await _list("delivery_zones")

@api.post("/zones", response_model=Zone)
async def create_zone(z: ZoneIn, _admin=Depends(require_admin)):
    zone = Zone(**z.dict()); await db.delivery_zones.insert_one(zone.dict()); return zone

@api.put("/zones/{id}")
async def update_zone(id: str, patch: ZoneUpdate, _admin=Depends(require_admin)):
    p = {k: v for k, v in patch.dict().items() if v is not None}
    r = await db.delivery_zones.update_one({"id": id}, {"$set": p})
    if r.matched_count == 0: raise HTTPException(404, "Not found")
    return _clean(await db.delivery_zones.find_one({"id": id}))

@api.delete("/zones/{id}")
async def delete_zone(id: str, _admin=Depends(require_admin)):
    r = await db.delivery_zones.delete_one({"id": id}); return {"deleted": r.deleted_count}

# =============== Couriers ===============
@api.get("/couriers")
async def list_couriers():
    return await _list("couriers")

@api.post("/couriers", response_model=Courier)
async def create_courier(c: CourierIn, _admin=Depends(require_admin)):
    courier = Courier(**c.dict()); await db.couriers.insert_one(courier.dict()); return courier

@api.put("/couriers/{id}")
async def update_courier(id: str, patch: CourierUpdate, _admin=Depends(require_admin)):
    p = {k: v for k, v in patch.dict().items() if v is not None}
    r = await db.couriers.update_one({"id": id}, {"$set": p})
    if r.matched_count == 0: raise HTTPException(404, "Not found")
    return _clean(await db.couriers.find_one({"id": id}))

@api.delete("/couriers/{id}")
async def delete_courier(id: str, _admin=Depends(require_admin)):
    r = await db.couriers.delete_one({"id": id}); return {"deleted": r.deleted_count}

# =============== Customers ===============
@api.get("/customers")
async def list_customers(_admin=Depends(require_admin)):
    return await _list("customers")

@api.delete("/customers/{id}")
async def delete_customer(id: str, _admin=Depends(require_admin)):
    r = await db.customers.delete_one({"id": id}); return {"deleted": r.deleted_count}

# =============== Inventory ===============
@api.get("/inventory")
async def list_inventory(_admin=Depends(require_admin)):
    return await _list("inventory")

@api.post("/inventory", response_model=InventoryItem)
async def create_inv(i: InventoryIn, _admin=Depends(require_admin)):
    item = InventoryItem(**i.dict()); await db.inventory.insert_one(item.dict()); return item

@api.put("/inventory/{id}")
async def update_inv(id: str, patch: InventoryUpdate, _admin=Depends(require_admin)):
    p = {k: v for k, v in patch.dict().items() if v is not None}
    r = await db.inventory.update_one({"id": id}, {"$set": p})
    if r.matched_count == 0: raise HTTPException(404, "Not found")
    return _clean(await db.inventory.find_one({"id": id}))

@api.delete("/inventory/{id}")
async def delete_inv(id: str, _admin=Depends(require_admin)):
    r = await db.inventory.delete_one({"id": id}); return {"deleted": r.deleted_count}

# =============== Coupons ===============
@api.get("/coupons")
async def list_coupons():
    return await _list("coupons")

@api.post("/coupons", response_model=Coupon)
async def create_coupon(c: CouponIn, _admin=Depends(require_admin)):
    coupon = Coupon(**c.dict()); await db.coupons.insert_one(coupon.dict()); return coupon

@api.put("/coupons/{id}")
async def update_coupon(id: str, patch: CouponUpdate, _admin=Depends(require_admin)):
    p = {k: v for k, v in patch.dict().items() if v is not None}
    r = await db.coupons.update_one({"id": id}, {"$set": p})
    if r.matched_count == 0: raise HTTPException(404, "Not found")
    return _clean(await db.coupons.find_one({"id": id}))

@api.delete("/coupons/{id}")
async def delete_coupon(id: str, _admin=Depends(require_admin)):
    r = await db.coupons.delete_one({"id": id}); return {"deleted": r.deleted_count}

@api.post("/coupons/validate")
async def validate_coupon(payload: Dict[str, Any]):
    code = (payload.get('code') or '').strip().upper()
    if not code:
        raise HTTPException(400, "Kód szükséges")
    c = await db.coupons.find_one({"code": code, "active": True})
    if not c: raise HTTPException(404, "Érvénytelen kupon")
    return _clean(c)

# =============== Orders ===============
async def _next_order_id():
    year = datetime.now(timezone.utc).year
    count = await db.orders.count_documents({})
    return f"ORD-{year}-{str(count + 125).zfill(4)}"

@api.get("/orders")
async def list_orders(_admin=Depends(require_admin)):
    return [_clean(d) async for d in db.orders.find({}).sort("createdAt", -1)]

@api.get("/orders/mine")
async def my_orders(user=Depends(get_current_user)):
    return [_clean(d) async for d in db.orders.find({"userId": user['id']}).sort("createdAt", -1)]

@api.post("/orders")
async def create_order(o: OrderIn, user=Depends(get_current_user)):
    # Only enforce min-order for customer-submitted online orders (not POS/admin)
    if user.get('role') != 'admin' and o.type == 'delivery' and o.subtotal < 2500 and o.channel == 'house':
        raise HTTPException(400, "A minimum rendelési összeg 2500 Ft (szállításnál)")
    oid = await _next_order_id()
    doc = Order(**o.dict(), id=oid, status="new", courierId=None,
                createdAt=datetime.now(timezone.utc).isoformat(),
                userId=user['id']).dict()
    await db.orders.insert_one(doc)
    # Auto-consume inventory based on menu item recipes
    try:
        for it in o.items:
            m = await db.menu_items.find_one({"id": it.id})
            if not m: continue
            for r in (m.get('recipe') or []):
                await db.inventory.update_one(
                    {"id": r.get('inventoryId')},
                    {"$inc": {"stock": -float(r.get('qty', 0)) * int(it.qty)}}
                )
    except Exception as e:
        logger.error(f"Inventory consumption error: {e}")
    # Upsert customer (by phone)
    existing = await db.customers.find_one({"phone": o.phone})
    if existing:
        await db.customers.update_one(
            {"phone": o.phone},
            {"$set": {"name": o.customerName, "zip": o.zip, "city": o.city, "street": o.street, "floor": o.floor},
             "$inc": {"orderCount": 1}})
    else:
        cust = Customer(name=o.customerName, phone=o.phone, zip=o.zip, city=o.city, street=o.street, floor=o.floor, orderCount=1)
        await db.customers.insert_one(cust.dict())
    return _clean(doc)

@api.put("/orders/{id}")
async def update_order(id: str, patch: OrderUpdate, _admin=Depends(require_admin)):
    p = {k: v for k, v in patch.dict().items() if v is not None}
    if not p: raise HTTPException(400, "Empty update")
    r = await db.orders.update_one({"id": id}, {"$set": p})
    if r.matched_count == 0: raise HTTPException(404, "Not found")
    return _clean(await db.orders.find_one({"id": id}))

@api.delete("/orders/{id}")
async def delete_order(id: str, _admin=Depends(require_admin)):
    r = await db.orders.delete_one({"id": id}); return {"deleted": r.deleted_count}

# =============== Reports (Day close / Courier close) ===============
def _sod(dt: datetime) -> datetime:
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)

@api.get('/reports/today')
async def report_today(_admin=Depends(require_admin)):
    now = datetime.now(timezone.utc)
    start = _sod(now).isoformat()
    docs = [d async for d in db.orders.find({"createdAt": {"$gte": start}, "status": {"$ne": "cancelled"}})]
    revenue = sum(d.get('total', 0) for d in docs)
    by_payment = {}
    by_channel = {}
    by_courier = {}
    couriers = {c['id']: c['name'] async for c in db.couriers.find({})}
    for d in docs:
        by_payment[d.get('payment', 'cash')] = by_payment.get(d.get('payment', 'cash'), 0) + d.get('total', 0)
        by_channel[d.get('channel', 'house')] = by_channel.get(d.get('channel', 'house'), 0) + d.get('total', 0)
        cid = d.get('courierId')
        if cid:
            name = couriers.get(cid, 'Ismeretlen')
            by_courier.setdefault(cid, {"name": name, "orders": 0, "revenue": 0})
            by_courier[cid]["orders"] += 1
            by_courier[cid]["revenue"] += d.get('total', 0)
    return {
        "date": now.date().isoformat(),
        "orders": len(docs),
        "revenue": revenue,
        "byPayment": by_payment,
        "byChannel": by_channel,
        "byCourier": list(by_courier.values()),
    }

@api.post('/reports/close-day')
async def close_day(_admin=Depends(require_admin)):
    r = await report_today()  # type: ignore
    entry = {"id": str(uuid.uuid4()), **r, "closedAt": datetime.now(timezone.utc).isoformat()}
    await db.day_closes.insert_one(entry)
    entry.pop('_id', None)
    return entry

@api.get('/reports/history')
async def report_history(_admin=Depends(require_admin)):
    return [_clean(d) async for d in db.day_closes.find({}).sort('closedAt', -1)]

@api.get('/reports/courier/{courier_id}')
async def courier_report(courier_id: str, _admin=Depends(require_admin)):
    now = datetime.now(timezone.utc)
    start = _sod(now).isoformat()
    docs = [d async for d in db.orders.find({"courierId": courier_id, "createdAt": {"$gte": start}})]
    delivered = [d for d in docs if d.get('status') == 'delivered']
    revenue = sum(d.get('total', 0) for d in delivered)
    cash = sum(d.get('total', 0) for d in delivered if d.get('payment') == 'cash')
    card = sum(d.get('total', 0) for d in delivered if d.get('payment') == 'card')
    online = sum(d.get('total', 0) for d in delivered if d.get('payment') == 'online')
    courier = await db.couriers.find_one({"id": courier_id})
    return {
        "courierId": courier_id,
        "courierName": courier.get('name') if courier else None,
        "orders": len(delivered),
        "revenue": revenue,
        "cash": cash, "card": card, "online": online,
    }

# =============== Seed ===============
SEED_MENU = [
    ("pizzak", "Margherita", "Paradicsomszósz, mozzarella", 2190),
    ("pizzak", "Sonkás", "Paradicsomszósz, sonka, mozzarella", 2390),
    ("pizzak", "Szalámis", "Paradicsomszósz, szalámi, mozzarella", 2490),
    ("pizzak", "Hawaii", "Paradicsomszósz, sonka, ananász, mozzarella", 2490),
    ("pizzak", "Négysajtos", "Paradicsomszósz, négyféle sajt", 2590),
    ("pizzak", "Diavolo", "Paradicsomszósz, szalámi, chili, mozzarella", 2590),
    ("pizzak", "BBQ Csirke", "BBQ szósz, csirke, lilahagyma, mozzarella", 2690),
    ("pizzak", "Tonhalas", "Paradicsomszósz, tonhal, lilahagyma, mozzarella", 2690),
    ("pizzak", "ZUPARO Special", "Paradicsomszósz, sonka, szalámi, gomba, kukorica, mozzarella", 2890),
    ("hamburgerek", "ZUPARO Burger menü", "Marhahús, cheddar, friss zöldségek, ZUPARO szósz + hasáb + üdítő", 2890),
    ("hamburgerek", "Cheeseburger", "Marhahús, cheddar, saláta, uborka", 2190),
    ("hamburgerek", "Dupla Burger", "Dupla marhahús, dupla sajt, ZUPARO szósz", 2990),
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
SEED_ZONES = [("3734","Szuhogy",500),("3733","Rudabánya",700),("3600","Ózd",900),("3700","Kazincbarcika",1200),("3780","Edelény",1000)]
SEED_COURIERS = [("Dávid","+36 30 111 2222", True),("Márk","+36 30 333 4444", True),("Tamás","+36 30 555 6666", False)]
SEED_INVENTORY = [("Mozzarella sajt","kg",12,5),("Paradicsomszósz","l",8,3),("Pizza tészta","db",45,20),("Csirkemell","kg",6,4),("Marhahús","kg",3,5),("Hamburger zsemle","db",30,15),("Coca-Cola 0,5l","db",24,12)]

@api.post("/seed")
async def seed():
    result = {}
    if await db.menu_items.count_documents({}) == 0:
        docs = [MenuItem(category=c, name=n, description=d, price=p, priceFoodora=int(p*1.25), priceFalatozz=int(p*1.20)).dict() for c, n, d, p in SEED_MENU]
        await db.menu_items.insert_many(docs); result["menu"] = len(docs)
    if await db.delivery_zones.count_documents({}) == 0:
        docs = [Zone(zip=z, city=c, fee=f).dict() for z, c, f in SEED_ZONES]
        await db.delivery_zones.insert_many(docs); result["zones"] = len(docs)
    if await db.couriers.count_documents({}) == 0:
        docs = [Courier(name=n, phone=p, active=a).dict() for n, p, a in SEED_COURIERS]
        await db.couriers.insert_many(docs); result["couriers"] = len(docs)
    if await db.inventory.count_documents({}) == 0:
        docs = [InventoryItem(name=n, unit=u, stock=s, minStock=m).dict() for n, u, s, m in SEED_INVENTORY]
        await db.inventory.insert_many(docs); result["inventory"] = len(docs)
    # Seed default admin (idempotent per email)
    if not await db.users.find_one({"email": "admin@zuparo.hu"}):
        uid = str(uuid.uuid4())
        await db.users.insert_one({
            "id": uid, "email": "admin@zuparo.hu", "name": "Sári Roland", "phone": "",
            "role": "admin", "password_hash": bcrypt.hash("admin123"),
            "createdAt": datetime.now(timezone.utc).isoformat(),
        })
        result["admin"] = "admin@zuparo.hu / admin123"
    return {"seeded": result}

@api.get("/")
async def root():
    return {"service": "ZUPARO Ordering API", "status": "ok"}

app.include_router(api)

app.add_middleware(
    CORSMiddleware, allow_credentials=True, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def _startup_seed():
    try:
        # Rename any legacy ZAVO/Zavo items to ZUPARO/Zuparo
        async for m in db.menu_items.find({"$or": [{"name": {"$regex": "ZAVO"}}, {"description": {"$regex": "ZAVO"}}]}):
            new_name = (m.get("name") or "").replace("ZAVO", "ZUPARO").replace("Zavo", "Zuparo")
            new_desc = (m.get("description") or "").replace("ZAVO", "ZUPARO").replace("Zavo", "Zuparo")
            await db.menu_items.update_one({"id": m["id"]}, {"$set": {"name": new_name, "description": new_desc}})
        # Ensure default admin@zuparo.hu exists
        if not await db.users.find_one({"email": "admin@zuparo.hu"}):
            await seed()
    except Exception as e:
        logger.error(f"Startup seed/migration failed: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
