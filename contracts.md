# ZAVO Backend Integration Contract

## Scope
Full-stack ordering platform. Backend provides CRUD for all entities, replacing localStorage mock data.

## MongoDB Collections
- `menu_items` – { id, category, name, description, price, available }
- `delivery_zones` – { id, zip, city, fee }
- `couriers` – { id, name, phone, active }
- `customers` – { id, name, phone, zip, city, street, floor, orderCount }
- `inventory` – { id, name, unit, stock, minStock }
- `orders` – { id (ORD-YYYY-####), customerName, phone, zip, city, street, floor, type, payment, items[], subtotal, deliveryFee, discountPct, total, note, courierId, status, createdAt }

All ids are UUID strings except orders which use human-readable `ORD-YYYY-####`.

## API Endpoints (all prefixed with `/api`)
- `GET /menu`, `POST /menu`, `PUT /menu/{id}`, `DELETE /menu/{id}`
- `GET /zones`, `POST /zones`, `PUT /zones/{id}`, `DELETE /zones/{id}`
- `GET /couriers`, `POST /couriers`, `PUT /couriers/{id}`, `DELETE /couriers/{id}`
- `GET /customers`, `DELETE /customers/{id}`
- `GET /inventory`, `POST /inventory`, `PUT /inventory/{id}`, `DELETE /inventory/{id}`
- `GET /orders`, `POST /orders` (auto-generates id, upserts customer), `PUT /orders/{id}`, `DELETE /orders/{id}`
- `POST /seed` – idempotent seeder for initial data

## Mock replacement
- `DataContext.jsx` currently uses localStorage. Rewritten to call `${API}/...`.
- On mount: load all collections. If empty menu, call `/seed`.

## Frontend↔Backend integration
- axios base = REACT_APP_BACKEND_URL + '/api'
- CRUD helpers become async, update state after success.
