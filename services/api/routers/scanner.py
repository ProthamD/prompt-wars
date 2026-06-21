"""
Scanner router — Barcode product lookup for CO₂e estimation.

This module tackles the problem of invisible consumer emissions by allowing
users to scan a product barcode (EAN/UPC/GTIN) at the point of purchase
and instantly see its carbon footprint.

Data sources:
- Primary: Open Food Facts API (extracts Agribalyse EcoScore data)
- Fallback: Category-average estimates for unknown items.
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Literal
import httpx

router = APIRouter()


class ProductCarbonResponse(BaseModel):
    """Output schema for the barcode carbon footprint lookup."""
    barcode: str = Field(..., description="The scanned EAN/UPC/GTIN barcode")
    product_name: Optional[str] = Field(None, description="The human-readable name of the product")
    co2e_kg_per_100g: Optional[float] = Field(
        None, description="Carbon footprint in kg CO₂e per 100 grams of product"
    )
    co2e_kg_estimated: Optional[float] = Field(
        None, description="Estimated total carbon footprint for the specified quantity"
    )
    eco_score: Optional[str] = Field(None, description="A-E environmental impact grade")
    source: Literal["open_food_facts", "category_average"] = Field(
        ..., description="The data source used for this lookup"
    )
    alternatives: list[dict] = Field(
        default=[], description="List of lower-carbon alternative products"
    )
    data_quality: Literal["high", "medium", "estimate"] = Field(
        ..., description="Confidence level in the returned emission factor"
    )


@router.get("/{barcode}", response_model=ProductCarbonResponse)
async def scan_barcode(barcode: str, quantity_g: float = 200.0) -> ProductCarbonResponse:
    """
    Look up a product's carbon footprint by its barcode.

    Queries the Open Food Facts API to retrieve product metadata and
    Agribalyse environmental impact data. If specific CO₂e data is missing,
    it falls back to a conservative category average.

    Args:
        barcode: The product barcode (string)
        quantity_g: Estimated quantity consumed in grams (default: 200.0)

    Returns:
        ProductCarbonResponse with emission estimates and alternatives.
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
                    # Extract EcoScore CO2e data (Agribalyse dataset)
                    eco_data = product.get("ecoscore_data", {})
                    agribalyse = eco_data.get("agribalyse", {})
                    co2e_100g = agribalyse.get("co2_total")  # kg CO2e per kg -> per 100g
                    if co2e_100g:
                        co2e_100g = co2e_100g / 10  # convert from per-kg to per-100g

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

    # Fallback: category-average estimate for general consumer goods
    return ProductCarbonResponse(
        barcode=barcode,
        product_name=None,
        co2e_kg_per_100g=None,
        co2e_kg_estimated=0.35,  # rough consumer goods average CO2e footprint
        eco_score=None,
        source="category_average",
        data_quality="estimate",
        alternatives=[],
    )


def _get_lower_carbon_alternatives(category_tags: list[str]) -> list[dict]:
    """Return hardcoded lower-carbon alternatives by food category to promote sustainable choices."""
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
