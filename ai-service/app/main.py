import re
from collections import Counter
from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Common Goods AI Services", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class CatalogItem(BaseModel):
    id: int
    name: Optional[str] = ""
    category: str
    price: Optional[float] = 0.0
    description: Optional[str] = ""
    variant: Optional[str] = ""
    featured: bool = False


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


@app.get("/health")
def health():
    return {"status": "ok", "service": "common-goods-ai-service"}


@app.post("/api/recommendations")
def recommend(request: RecommendationRequest):
    """Rank the catalog using cart-category affinity and curated picks."""
    by_id = {item.id: item for item in request.products}
    cart_categories = Counter(
        by_id[item_id].category for item_id in request.cart_ids if item_id in by_id
    )
    excluded = set(request.cart_ids)

    def score(item: CatalogItem) -> tuple[int, int]:
        affinity = cart_categories[item.category]
        return (affinity * 3 + (2 if item.featured else 0), -item.id)

    ranked = sorted(
        (item for item in request.products if item.id not in excluded),
        key=score,
        reverse=True,
    )
    return {
        "productIds": [item.id for item in ranked[: request.limit]],
        "reason": "Picked from your recent interests and our considered finds.",
    }


@app.post("/api/assistant")
def shopping_assistant(request: AssistantRequest):
    """AI shopping assistant that answers questions and recommends products based on intent."""
    query = request.message.lower().strip()
    words = set(re.findall(r"\w+", query))

    # Match products by relevance score
    scored_products = []
    for item in request.catalog:
        score = 0
        text = f"{item.name} {item.category} {item.description} {item.variant}".lower()
        for word in words:
            if len(word) > 2 and word in text:
                score += 2
        # Check budget keywords
        if "cheap" in query or "under" in query or "budget" in query:
            if item.price and item.price < 4000:
                score += 2
        if item.category.lower() in query:
            score += 4
        if item.featured:
            score += 1
        if score > 0:
            scored_products.append((score, item))

    scored_products.sort(key=lambda x: x[0], reverse=True)
    suggested = [item for _, item in scored_products[:3]]

    if not suggested:
        suggested = [item for item in request.catalog if item.featured][:3]
        reply = (
            "I'd love to help you find the right pieces. Here are some of our most loved "
            "everyday essentials from the collection:"
        )
    else:
        names = ", ".join(f"'{p.name}'" for p in suggested)
        reply = (
            f"Based on what you're looking for, I recommend exploring {names}. "
            "They are crafted with natural materials and designed for everyday living."
        )

    return {
        "reply": reply,
        "suggestedProductIds": [p.id for p in suggested],
    }
