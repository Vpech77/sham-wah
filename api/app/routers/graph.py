from fastapi import APIRouter, Depends, HTTPException
from neo4j import AsyncDriver
from app.dependencies import get_driver
from app.models.assets import NeighborGraph, DigitalAsset, RawEdge
from app.config import settings

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("/neighbors/{asset_id}", response_model=NeighborGraph)
async def get_neighbors(
    asset_id: str,
    depth: int = 1,
    driver: AsyncDriver = Depends(get_driver),
):
    cypher = """
        MATCH (center {uri: $uri})
        CALL apoc.path.subgraphNodes(center, {maxLevel: $depth}) YIELD node AS neighbor
        WITH center, collect(DISTINCT neighbor) AS neighbors
        UNWIND neighbors AS n
        MATCH (a)-[r]->(b)
        WHERE (a = center OR a IN neighbors)
          AND (b = center OR b IN neighbors)
        RETURN
            collect(DISTINCT {
                id:        n.uri,
                type:      labels(n)[0],
                name:      coalesce(n.name, n.`rdfs__label`, ''),
                comment:   coalesce(n.comment, n.`rdfs__comment`, ''),
                concepts:  []
            }) AS nodes,
            collect(DISTINCT {
                source: a.uri,
                target: b.uri,
                label:  type(r)
            }) AS edges
    """
    async with driver.session(database=settings.neo4j_database) as session:
        result = await session.run(cypher, {"uri": asset_id, "depth": depth})
        record = await result.single()

    if not record:
        raise HTTPException(status_code=404, detail="Asset not found")

    nodes = [DigitalAsset(**n) for n in record["nodes"]]
    edges = [RawEdge(**e) for e in record["edges"]]
    return NeighborGraph(nodes=nodes, edges=edges)