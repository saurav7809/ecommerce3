import os
import re
from collections import Counter
from typing import List, Optional

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8080")

app = FastAPI(
    title="HomeNest AI Design & Shopping Assistant",
    description="Intelligent recommendations, room style matching, and furniture pairing for HomeNest (Wayfair-style)",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class CatalogItem(BaseModel):
    id: int
    name: Optional[str] = ""
    category: Optional[str] = ""
    brand: Optional[str] = ""
    price: Optional[float] = 0.0
    compareAtPrice: Optional[float] = None
    description: Optional[str] = ""
    room: Optional[str] = ""
    style: Optional[str] = ""
    color: Optional[str] = ""
    material: Optional[str] = ""
    rating: Optional[float] = 0.0
    featured: bool = False
    imageUrl: Optional[str] = ""


class RecommendationRequest(BaseModel):
    products: List[CatalogItem] = Field(default_factory=list)
    cart_ids: List[int] = Field(default_factory=list)
    limit: int = Field(default=4, ge=1, le=12)


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class AssistantRequest(BaseModel):
    message: str
    catalog: List[CatalogItem] = Field(default_factory=list)
    history: List[ChatMessage] = Field(default_factory=list)


async def fetch_catalog_from_backend() -> List[CatalogItem]:
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(f"{BACKEND_API_URL}/api/products", params={"size": 100})
            if resp.status_code == 200:
                data = resp.json()
                items = data.get("content", [])
                catalog = []
                for p in items:
                    catalog.append(
                        CatalogItem(
                            id=p.get("id", 0),
                            name=p.get("name", ""),
                            category=p.get("categoryName") or p.get("categorySlug", ""),
                            brand=p.get("brand", ""),
                            price=p.get("price", 0.0),
                            compareAtPrice=p.get("compareAtPrice"),
                            description=p.get("description", ""),
                            room=p.get("room", ""),
                            style=p.get("style", ""),
                            color=p.get("color", ""),
                            material=p.get("material", ""),
                            rating=p.get("rating", 0.0),
                            featured=p.get("featured", False),
                            imageUrl=p.get("primaryImage", ""),
                        )
                    )
                return catalog
    except Exception:
        pass
    return []


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "homenest-ai-service",
        "version": "2.0.0",
        "backend": BACKEND_API_URL,
    }


@app.post("/api/recommendations")
async def recommend(request: RecommendationRequest):
    """Rank the catalog using cart/category affinity, room pairings, and curated featured picks."""
    products = request.products
    if not products:
        products = await fetch_catalog_from_backend()

    by_id = {item.id: item for item in products}
    cart_items = [by_id[item_id] for item_id in request.cart_ids if item_id in by_id]
    cart_categories = Counter(item.category for item_id, item in by_id.items() if item_id in request.cart_ids)
    cart_rooms = Counter(item.room for item in cart_items if item.room)
    cart_styles = Counter(item.style for item in cart_items if item.style)
    excluded = set(request.cart_ids)

    def score(item: CatalogItem) -> tuple[float, int]:
        cat_score = cart_categories.get(item.category, 0) * 3
        room_score = cart_rooms.get(item.room, 0) * 2
        style_score = cart_styles.get(item.style, 0) * 2
        rating_score = (item.rating or 0.0) * 0.5
        featured_score = 3 if item.featured else 0
        return (cat_score + room_score + style_score + rating_score + featured_score, -item.id)

    ranked = sorted(
        (item for item in products if item.id not in excluded),
        key=score,
        reverse=True,
    )
    selected = ranked[: request.limit]
    return {
        "productIds": [item.id for item in selected],
        "products": selected,
        "reason": "Personalized design pairings based on your room style, preferences, and top-rated home picks.",
    }


@app.post("/api/assistant")
async def shopping_assistant(request: AssistantRequest):
    """AI interior design & shopping assistant that understands rooms, design aesthetics, furniture types, and budget."""
    catalog = request.catalog
    if not catalog:
        catalog = await fetch_catalog_from_backend()

    query = request.message.lower().strip()
    words = set(re.findall(r"\w+", query))

    # Detect budget constraints e.g. "under 15000", "below 20000"
    budget_match = re.search(r"(?:under|below|less than|within)\s*(?:rs\.?|inr|₹)?\s*(\d+)", query)
    max_budget = float(budget_match.group(1)) if budget_match else None

    # Detect room intentions
    rooms = ["living room", "bedroom", "dining", "office", "outdoor", "kitchen", "bathroom", "entryway", "patio"]
    detected_rooms = [r for r in rooms if r in query]

    # Detect style intentions
    styles = ["mid-century", "boho", "scandinavian", "industrial", "farmhouse", "modern", "contemporary", "classic", "minimalist"]
    detected_styles = [s for s in styles if s in query]

    # Score catalog items
    scored_products = []
    for item in catalog:
        score = 0.0
        text = f"{item.name} {item.category} {item.brand} {item.room} {item.style} {item.color} {item.material} {item.description}".lower()

        # Word matching
        for word in words:
            if len(word) > 2 and word in text:
                score += 2.0

        # Room match bonus
        for r in detected_rooms:
            if r in (item.room or "").lower():
                score += 4.0

        # Style match bonus
        for s in detected_styles:
            if s in (item.style or "").lower():
                score += 4.0

        # Budget match
        if max_budget is not None and item.price:
            if item.price <= max_budget:
                score += 3.0
            else:
                score -= 5.0
        elif ("cheap" in query or "budget" in query or "affordable" in query) and item.price:
            if item.price < 10000:
                score += 2.5

        # Quality bonus
        if item.rating and item.rating >= 4.5:
            score += 1.5
        if item.featured:
            score += 1.0

        if score > 0:
            scored_products.append((score, item))

    scored_products.sort(key=lambda x: x[0], reverse=True)
    suggested = [item for _, item in scored_products[:4]]

    if not suggested:
        suggested = [item for item in catalog if item.featured][:4]
        if not suggested:
            suggested = catalog[:4]
        reply = (
            "I'd love to help you furnish your space! Here are some of our most celebrated "
            "Wayfair-style home collections and customer favorites to inspire your room:"
        )
    else:
        names = ", ".join(f"**{p.name}** ({p.brand or 'HomeNest'})" for p in suggested[:3])
        style_mention = f" for your {detected_styles[0]} aesthetic" if detected_styles else ""
        room_mention = f" {detected_rooms[0]}" if detected_rooms else " space"
        reply = (
            f"Here are my top designer recommendations{style_mention} in your{room_mention}: {names}. "
            f"These pieces feature premium craftsmanship, harmonious palettes, and fast direct shipping."
        )

    return {
        "reply": reply,
        "suggestedProductIds": [p.id for p in suggested],
        "suggestedProducts": suggested,
    }
