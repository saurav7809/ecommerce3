# Common Goods — ecommerce platform

This repository now includes a standalone React and Spring Boot platform under `frontend/` and `backend/`. The existing Laravel marketplace remains in the repository as the original implementation; the new full stack is isolated so it can be developed and run independently.

## Local run

Requirements: Docker Desktop with Compose.

```sh
cp .env.ecommerce.example .env.ecommerce
docker compose --env-file .env.ecommerce up --build
```

Open the storefront at [http://localhost:5173](http://localhost:5173). The API health endpoint is [http://localhost:8080/api/health](http://localhost:8080/api/health). PostgreSQL, Redis, RabbitMQ, and the FastAPI recommendations service start with the application. The API seeds a small starter catalog the first time the database is empty.

To run the frontend outside Docker, use Node.js 20 or newer:

```sh
cd frontend
npm install
npm run dev
```

Optional: copy `frontend/.env.example` to `frontend/.env` to override service URLs or provide the public Razorpay test Key ID.

To run the API outside Docker, use Java 17 and Maven 3.9 or newer, and start PostgreSQL, Redis, and RabbitMQ first:

```sh
cd backend
mvn spring-boot:run
```

## What is implemented

- Responsive React + TypeScript + Tailwind storefront with category filters, search, cart, quantity controls, account registration/sign-in, and checkout.
- Spring Boot REST API for product search, JWT registration and login, and order creation/status.
- PostgreSQL persistence for accounts, products, orders, and order lines. Prices are calculated by the API and inventory is checked under a row lock at checkout.
- Redis-backed catalog response cache and RabbitMQ order-created events.
- FastAPI recommendations service ranks the catalog using cart-category affinity and featured picks; the storefront shows results in its “For you” category.
- Razorpay Test Mode checkout with server-created payment orders and HMAC signature verification. Without test keys, checkout still records an unpaid pending order and does not attempt to charge.
- Cloudinary server-side environment settings are ready for product image hosting; starter products use public demo images.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/products?q=ceramic&category=Home` | Search/filter catalog |
| GET | `/api/products/{id}` | Product detail |
| POST | `/api/auth/register` | Create customer account; returns a JWT |
| POST | `/api/auth/login` | Sign in; returns a JWT |
| POST | `/api/orders` | Place an order; server validates catalog price and stock |
| GET | `/api/orders/{reference}` | Read order status |
| GET | `/api/orders` | Read recent orders for the authenticated customer |
| POST | `/api/payments/razorpay/order` | Create a Razorpay test payment order |
| POST | `/api/payments/razorpay/verify` | Verify the payment signature and confirm the order |
| POST | `http://localhost:8001/api/recommendations` | Rank the current catalog for a shopper |

Order request example:

```json
{
  "email": "shopper@example.com",
  "fullName": "Alex Morgan",
  "deliveryAddress": "10 Market Street, Portland, OR 97201",
  "items": [{ "productId": 1, "quantity": 1 }]
}
```

For Razorpay test payments, set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`, and set the same public key ID as `VITE_RAZORPAY_KEY_ID` in `frontend/.env` when developing locally. Rebuild the storefront container after changing its Vite build arguments. For a production deployment, set a unique long `JWT_SECRET`, strong database credentials, a trusted `FRONTEND_ORIGIN`, and provider credentials from secret storage. The local defaults are for development only.

Import `postman/Common-Goods.postman_collection.json` into Postman for request examples.
