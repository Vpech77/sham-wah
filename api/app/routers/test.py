from fastapi import APIRouter, Depends
from neo4j import AsyncDriver
from app.dependencies import get_driver
from app.config import settings



router = APIRouter(prefix="/test", tags=["test"])

@router.get("/labels")
async def get_labels(driver: AsyncDriver = Depends(get_driver)):
    async with driver.session(database=settings.neo4j_database) as session:
        result = await session.run("CALL db.labels()")
        records = await result.data()
    return {"labels": [r["label"] for r in records]}