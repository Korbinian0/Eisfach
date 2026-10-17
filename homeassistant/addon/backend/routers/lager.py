from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from database import get_db
from models import LagerItem, User
from schemas import LagerItemCreate, LagerItemResponse, LinkBarcodeRequest
from auth import get_current_user

router = APIRouter(prefix="/api/lager", tags=["Lager"])

def generate_next_id(db: Session) -> str:
    now = datetime.now()
    year_month = f"{now.year}-{now.month:02d}"
    prefix = f"{year_month}-"
    items = db.query(LagerItem).filter(LagerItem.id.like(f"{prefix}%")).all()
    max_num = 0
    for item in items:
        try:
            parts = item.id.split("-")
            if len(parts) == 3:
                num = int(parts[2])
                if num > max_num:
                    max_num = num
        except ValueError:
            continue
    return f"{year_month}-{max_num + 1}"

@router.get("/", response_model=list[LagerItemResponse])
def get_lager_items(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    threshold = datetime.now() - timedelta(days=30)
    db.query(LagerItem).filter(LagerItem.status == 0, LagerItem.hidden_date <= threshold).delete()
    db.commit()
    return db.query(LagerItem).filter(LagerItem.status == 1).all()

@router.get("/barcode/{barcode}", response_model=LagerItemResponse)
def get_by_barcode(barcode: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(LagerItem).filter(LagerItem.barcode == barcode, LagerItem.status == 1).first()
    if not item:
        raise HTTPException(status_code=404, detail="Barcode nicht gefunden")
    return item

@router.post("/scan", response_model=LagerItemResponse)
def scan_barcode(data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    barcode = data.get("barcode")
    if not barcode:
        raise HTTPException(status_code=400, detail="Barcode ist erforderlich")
    item = db.query(LagerItem).filter(LagerItem.barcode == barcode, LagerItem.status == 1).first()
    if not item:
        raise HTTPException(status_code=404, detail="Produkt existiert nicht")
    return item

@router.post("/item/{item_id}/entnahme", response_model=LagerItemResponse)
def entnahme_item(item_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(LagerItem).filter(LagerItem.id == item_id, LagerItem.status == 1).first()
    if not item:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden")
    if item.menge <= 1:
        item.menge = 0
        item.status = 0
        item.hidden_date = datetime.now()
    else:
        item.menge -= 1
    db.commit()
    db.refresh(item)
    return item

@router.post("/item/{item_id}/weiteres", response_model=LagerItemResponse)
def weiteres_teil(item_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(LagerItem).filter(LagerItem.id == item_id, LagerItem.status == 1).first()
    if not item:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden")
    item.menge += 1
    db.commit()
    db.refresh(item)
    return item

@router.post("/create", response_model=LagerItemResponse)
def create_lager_item(item_in: LagerItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing_bc = db.query(LagerItem).filter(LagerItem.barcode == item_in.barcode, LagerItem.status == 1).first()
    if existing_bc:
        raise HTTPException(status_code=400, detail="Barcode ist bereits vergeben")
    new_id = generate_next_id(db)
    item = LagerItem(
        id=new_id,
        barcode=item_in.barcode,
        lagerort=item_in.lagerort,
        name=item_in.name,
        menge=item_in.menge,
        einlager_datum=date.today(),
        status=1
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.post("/link", response_model=LagerItemResponse)
def link_existing_product(data: LinkBarcodeRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing_bc = db.query(LagerItem).filter(LagerItem.barcode == data.new_barcode).first()
    if existing_bc:
        raise HTTPException(status_code=400, detail="Barcode bereits verwendet")
    target_item = db.query(LagerItem).filter(LagerItem.id == data.existing_id).first()
    if not target_item:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden")
    target_item.menge += data.additional_menge
    db.commit()
    db.refresh(target_item)
    return target_item

@router.delete("/{item_id}")
def delete_item(item_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(LagerItem).filter(LagerItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Produkt nicht gefunden")
    db.delete(item)
    db.commit()
    return {"message": "Gelöscht"}
