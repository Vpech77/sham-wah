import time
from fastapi import APIRouter, Depends
from neo4j import AsyncDriver
from app.dependencies import get_driver
from app.models.assets import QueryParams, QueryResult, DigitalAsset
from app.config import settings

router = APIRouter(prefix="/assets", tags=["assets"])


def _row_to_asset(row: dict) -> DigitalAsset:
    """Map a Neo4j record to DigitalAsset."""
    node = row["a"]
    props = dict(node)
    return DigitalAsset(
        id=props.get("uri", props.get("id", "")),
        type=row.get("type", list(node.labels)[0] if node.labels else "Unknown"),
        name=props.get("name", props.get("rdfs__label", "Unnamed")),
        comment=props.get("comment", props.get("rdfs__comment", "")),
        publisher=props.get("publisher"),
        location=props.get("location"),
        concepts=row.get("concepts", []),
    )

@router.post("/query", response_model=QueryResult)
async def query_assets(
    params: QueryParams,
    driver: AsyncDriver = Depends(get_driver),
):
    start = time.monotonic()

    cypher, query_params = _build_cypher(params)

    async with driver.session(database=settings.neo4j_database) as session:
        result = await session.run(cypher, query_params)
        records = await result.data()

    assets = [_row_to_asset(r) for r in records]
    elapsed_ms = int((time.monotonic() - start) * 1000)

    return QueryResult(count=len(assets), executionTime=elapsed_ms, data=assets)


def _build_cypher(params: QueryParams) -> tuple[str, dict]:
    """
    Build a parameterised Cypher query.
    """
    conditions: list[str] = []
    p: dict = {"limit": params.limit}

    # Filter by concept
    if params.concepts:
        conditions.append(
            "ANY(c IN $concepts WHERE c IN a.concepts)"
        )
        p["concepts"] = params.concepts

    # Filter by asset type
    type_clause = ""
    if params.assetType != "all":
        type_clause = f":{params.assetType}"

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    cypher = f"""
        MATCH (a{type_clause})
        {where_clause}
        OPTIONAL MATCH (a)-[:RELATED_TO]->(concept)
        WITH a, collect(DISTINCT concept.name) AS concepts,
             labels(a)[0] AS type
        RETURN a, type, concepts
        LIMIT $limit
    """
    return cypher, p