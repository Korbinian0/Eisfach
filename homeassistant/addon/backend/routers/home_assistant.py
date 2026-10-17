from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import LagerItem

router = APIRouter(prefix="/api/ha", tags=["Home Assistant"])

@router.get("/inventory")
def home_assistant_inventory(token: str = Query(..., description="API Token or secret"), db: Session = Depends(get_db)):
    """
    Endpoint for Home Assistant integration.
    Returns active inventory items in JSON format.
    """
    # Simple token check or public endpoint as requested
    items = db.query(LagerItem).filter(LagerItem.status == 1).all()
    
    result = []
    for item in items:
        result.append({
            "id": item.id,
            "barcode": item.barcode,
            "name": item.name,
            "lagerort": item.lagerort,
            "menge": item.menge,
            "einlager_datum": item.einlager_datum.isoformat()
        })
    return {"items": result, "count": len(result)}
