"""
Scanner router — barcode product lookup for CO2e estimation.
Data sources: Open Food Facts (food), Climatiq PCF (general goods).
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx

router = APIRouter()


class ProductCarbonResponse(BaseModel):
    barcode: str
    product_name: Optional[str]
    co2e_kg_per_100g: Optional[float]
    co2e_kg_estimated: Optional[float]  # for a 'typical' quantity
    eco_score: Optional[str]  # A–E grade
    source: str
    alternatives: list[dict] = []
    data_quality: str  # 'high' | 'medium' | 'estimate'


@router.get("/{barcode}", response_model=ProductCarbonResponse)
async def scan_barcode(barcode: str, quantity_g: float = 200.0):
    """
    Look up product carbon footprint by barcode (EAN/UPC/GTIN).
    1. Try Open Food Facts (3M+ food products, free).
    2. Return category-average estimate if not found.
    """
    # Try Open Food Facts
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                f"https://world.openfoodfacts.org/api/v2/product/{barcode}",
                params={"fields": "product_name,ecoscore_grade,ecoscore_data,categories_tags"},
                headers={"User-Agent": "Terraprint/0.1 (contact@terraprint.io)"},
            )
            if resp.status_code == 200:
                data = resp.json()
                product = data.get("product", {})
                if product:
                    # Extract EcoScore CO2e data
                    eco_data = product.get("ecoscore_data", {})
                    agribalyse = eco_data.get("agribalyse", {})
                    co2e_100g = agribalyse.get("co2_total")  # kg CO2e per kg → per 100g
                    if co2e_100g:
                        co2e_100g = co2e_100g / 10  # convert to per 100g

                    return ProductCarbonResponse(
                        barcode=barcode,
                        product_name=product.get("product_name"),
                        co2e_kg_per_100g=co2e_100g,
                        co2e_kg_estimated=round(co2e_100g * quantity_g / 100, 3) if co2e_100g else None,
                        eco_score=product.get("ecoscore_grade"),
                        source="open_food_facts",
                        data_quality="high" if co2e_100g else "medium",
                        alternatives=_get_lower_carbon_alternatives(product.get("categories_tags", [])),
                    )
    except Exception:
        pass

    # Fallback: category-average estimate
    return ProductCarbonResponse(
        barcode=barcode,
        product_name=None,
        co2e_kg_per_100g=None,
        co2e_kg_estimated=0.35,  # rough consumer goods average
        eco_score=None,
        source="category_average",
        data_quality="estimate",
        alternatives=[],
    )


def _get_lower_carbon_alternatives(category_tags: list[str]) -> list[dict]:
    """Return hardcoded lower-carbon alternatives by food category."""
    alternatives_map = {
        "en:beef":    [{"name": "Chicken", "co2e_reduction": "75%"}, {"name": "Lentils", "co2e_reduction": "96%"}],
        "en:dairy":   [{"name": "Oat milk", "co2e_reduction": "73%"}, {"name": "Almond milk", "co2e_reduction": "61%"}],
        "en:fish":    [{"name": "Canned sardines", "co2e_reduction": "40%"}],
    }
    for tag in category_tags:
        for key, alts in alternatives_map.items():
            if key in tag:
                return alts
    return []
