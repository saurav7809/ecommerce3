# HomeNest — Wayfair-Style E-Commerce Platform

A production-grade, enterprise home furnishings e-commerce platform built to replicate the rich browsing, faceted search, interior design AI assistance, and checkout experience of **Wayfair**.

Designed and engineered to run **directly on Windows without Docker**, using native services.

---

## 🏗️ Complete Technology Stack

| Layer | Technology | Runs Without Docker? | Local Port |
| :--- | :--- | :---: | :--- |
| **Frontend** | React 19 + TypeScript (Vite) | ✅ Yes | `http://localhost:5173` |
| **UI & Styling** | Tailwind CSS v4 + Wayfair Theme Tokens | ✅ Yes | — |
| **State Management** | Redux Toolkit (RTK Query + Slices) | ✅ Yes | — |
| **Routing** | React Router v7 | ✅ Yes | — |
| **Icons** | Lucide React | ✅ Yes | — |
| **Backend Framework** | Java 21 + Spring Boot 3.5.16 | ✅ Yes | `http://localhost:8080` |
| **Persistence / ORM** | Spring Data JPA + Hibernate 6 | ✅ Yes | — |
| **Database** | PostgreSQL 16+ / 17+ / 18+ | ✅ Yes | `localhost:5432` |
| **DB Admin** | pgAdmin 4 or `psql` | ✅ Yes | Native Windows GUI |
| **Security & Auth** | Spring Security 6 + JWT (jjwt 0.12.6) | ✅ Yes | Stateless Token Filter |
| **API Documentation** | Swagger / OpenAPI 3 (SpringDoc 2.8.17) | ✅ Yes | `http://localhost:8080/swagger-ui.html` |
| **Payment Gateway** | Razorpay Test Mode (Cards, UPI, COD) | ✅ Yes | Embedded Client + Webhook/Verify |
| **Media Storage** | Cloudinary (Signed Direct Multipart Upload) | ✅ Yes | Hosted Cloud Service |
| **Caching** | Redis (Native Windows / WSL / Hosted Redis) | ⚡ Optional | Spring Cache defaults to memory if absent |
| **Search Engine** | Elasticsearch Cloud / JPA Multi-Match Search | ⚡ Optional | Native JPA Specifications + Fuzzy Search fallback |
| **Event Messaging** | RabbitMQ Cloud / CloudAMQP | ⚡ Optional | Conditional publisher with console event relay fallback |
| **AI Design Services** | Python 3.10+ & FastAPI + Uvicorn | ✅ Yes | `http://localhost:8001` |
| **API Testing** | Postman Collection | ✅ Yes | `postman/HomeNest-API.postman_collection.json` |

---

## 🏛️ Local Architecture Overview

```
                      +-----------------------------------------+
                      |           React Frontend (Vite)         |
                      |          http://localhost:5173          |
                      |   Redux Toolkit + RTK Query + Tailwind  |
                      +--------------------+--------------------+
                                           |
                    REST / JSON (8080)     |     AI Chat & Styling (8001)
                    +----------------------+--------------------+
                    |                                           |
                    v                                           v
+---------------------------------------+   +---------------------------------------+
|          Spring Boot 3 (API)          |   |       Python FastAPI AI Service       |
|         http://localhost:8080         |   |         http://localhost:8001         |
|   Java 21 • Spring Data JPA • JWT     |<--|  Style Matching • Room Blueprints     |
|   Razorpay • Cloudinary • Swagger     |   +---------------------------------------+
+-------------------+-------------------+
                    |
                    v JDBC (localhost:5432)
+---------------------------------------+
|          PostgreSQL Database          |
|            Database: homenest         |
|            User/Pass: postgres        |
+---------------------------------------+
```

---

## 🚀 Quick Start Guide (Windows Native — No Docker)

### 1. Prerequisites Checklist
- **Java 21 JDK** (`java -version`)
- **Node.js 20+** and **npm** (`node -v` / `npm -v`)
- **Python 3.10+** (`python --version`)
- **PostgreSQL** installed directly on Windows (or running on port 5432)

---

### 2. Database Setup (PostgreSQL)

Open **pgAdmin 4** (or Windows PowerShell with `psql`):

```sql
CREATE DATABASE homenest;
```

*Note: Default credentials configured in `backend/src/main/resources/application.yml` are `user: postgres`, `password: postgres`. If your local password differs, you can pass it via environment variable `DATABASE_PASSWORD=your_password`.*

---

### 3. Start the Spring Boot Backend (Port 8080)

The backend includes a pre-configured Maven Wrapper (`mvnw.cmd`), so **no system-wide Maven installation is needed**.

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

- When the backend starts for the first time, the built-in `DataSeeder` automatically generates:
  - **10 Core Home Departments & Subcategories** (Furniture, Outdoor, Bedding & Bath, Rugs, Decor, Lighting, Kitchen, Storage, Baby & Kids)
  - **48+ High-Fidelity Furniture & Decor Pieces** complete with SKU, Unsplash photography, dimensions, weight, materials, and pricing
  - **Pre-computed Customer Reviews & Star Ratings**
  - **3 Default User Accounts**:
    - **Admin:** `admin@homenest.local` / `Admin@12345`
    - **Seller:** `seller@homenest.local` / `Seller@12345`
    - **Customer:** `customer@homenest.local` / `Customer@12345`
- Swagger UI will be available at: **`http://localhost:8080/swagger-ui.html`**
- OpenAPI 3 JSON docs at: **`http://localhost:8080/v3/api-docs`**

---

### 4. Start the AI Design Assistant (Port 8001)

The AI assistant provides natural-language room planning, budget filtering, and style matching (Scandinavian, Mid-Century Modern, Boho, Industrial, etc.).

```powershell
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8001 --reload
```

---

### 5. Start the React Frontend (Port 5173)

```powershell
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🎨 Wayfair-Style Feature Highlights

1. **Wayfair Purple & Gold Aesthetics:**
   - Brand purple (`#7b189f`), dark plum (`#581172`), soft lavender highlights, and gold deal badges.
2. **Interactive Department Mega-Menu:**
   - Hover over Furniture, Outdoor, Bedding, Rugs, Lighting, or Decor to browse subcategories and featured deals with instant count badges.
3. **Left-Rail Facet Filters:**
   - Multi-attribute filtering by Price brackets, Design Aesthetic pills, Color Swatches, Materials, Brands, and In-Stock status.
4. **Interactive Dual-Image Product Cards:**
   - Smooth hover transition from primary lifestyle shot to secondary detail photo, discount pill, favorite heart toggle, and instant Add-to-Cart.
5. **Product Detail Experience (PDP):**
   - Multi-angle gallery with thumbnail selector.
   - Comprehensive specifications accordion (Overview, Dimensions & Weights, Assembly & Care, Delivery & Returns).
   - Review distribution histogram (5-star breakdown) and verified buyer review submission modal.
6. **Free Shipping Progress Meter:**
   - Real-time cart calculation with free delivery unlocked at ₹5,000 threshold.
7. **Razorpay Test Mode & COD Checkout:**
   - Complete 2-step checkout with address memory and seamless test payment verification.
8. **AI Interior Designer Floating Drawer:**
   - Natural language conversational assistant suggesting specific catalog items with direct "Add to Cart" buttons inside the chat.
9. **Merchant & Admin Operations Portal (`/admin`):**
   - Live revenue metrics, total orders, product catalog management (create/edit/delete), and fulfillment workflow (Confirmed -> Shipped -> Delivered).

---

## 🧪 Postman API Collection

Import the included collection into Postman:
- File path: `postman/HomeNest-API.postman_collection.json`
- Includes pre-configured requests for Auth, Products, Categories, Cart, Orders, Razorpay, Reviews, Admin, and AI Assistant.

---

## 🔒 Optional Production Integrations

| Feature | Environment Variables | Description |
| :--- | :--- | :--- |
| **Razorpay Payments** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Live or test keys from Razorpay dashboard |
| **Cloudinary Media** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Direct signed media uploads for product management |
| **Redis Cache** | `SPRING_DATA_REDIS_HOST`, `SPRING_DATA_REDIS_PORT`, `SPRING_DATA_REDIS_PASSWORD` | Optional cache cluster. Defaults to in-memory caching if omitted |
| **Elasticsearch Cloud**| `APP_SEARCH_ELASTICSEARCH_ENABLED=true`, `ELASTICSEARCH_URIS`, `ELASTICSEARCH_API_KEY` | Optional full-text search cluster. Defaults to PostgreSQL full-text search |
| **RabbitMQ Cloud** | `APP_MESSAGING_ENABLED=true`, `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD` | Optional order event messaging queue. Defaults to logging event relay |

---

## 📦 Build Verification

To verify full compilation of both tiers:
- **Backend:** `cd backend && .\mvnw.cmd compile` -> `BUILD SUCCESS` (Java 21, 59 sources)
- **Frontend:** `cd frontend && npm run build` -> `built in 4.02s` (TypeScript + Vite)
