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


@router.get("/sample", include_in_schema=False)
async def sample_node(driver: AsyncDriver = Depends(get_driver)):
    async with driver.session(database=settings.neo4j_database) as session:
        result = await session.run(
            "MATCH (n:Resource)-[:ns6__represents]-(m:ns2__HumanActivity) RETURN n "
        )
        record = await result.single()
    return dict(record["n"]) if record else {}


@router.get("/all", include_in_schema=False)
async def all_nodes(driver: AsyncDriver = Depends(get_driver)):
    async with driver.session(database=settings.neo4j_database) as session:
        result = await session.run(
            """
            MATCH (n:Resource)-[:ns6__represents]-(m:ns2__HumanActivity)
            RETURN DISTINCT n
            """
        )

        nodes = []
        async for record in result:
            nodes.append(dict(record["n"]))

    return nodes
