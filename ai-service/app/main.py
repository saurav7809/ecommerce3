from collections import Counter
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Common Goods Recommendations", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


class CatalogItem(BaseModel):
    id: int
    category: str
    featured: bool = False


class RecommendationRequest(BaseModel):
    products: List[CatalogItem] = Field(default_factory=list)
    cart_ids: List[int] = Field(default_factory=list)
    limit: int = Field(default=4, ge=1, le=12)


@app.get("/health")
def health():
    return {"status": "ok", "service": "common-goods-recommendations"}


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
