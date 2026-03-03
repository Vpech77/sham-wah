import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import { MOCK_ASSETS, type DigitalAsset } from "./query-result-store"; // ← import shared mock
import type { NodeDatum, LinkDatum } from "~/utils/graph/graphTypes";
import { buildGraphData, type RawEdge } from "~/utils/graph/graphAdapter";

interface NeighborGraph {
  nodes: DigitalAsset[];
  edges: RawEdge[];
}

const ASSET_BY_ID = Object.fromEntries(MOCK_ASSETS.map((a) => [a.id, a]));

const FEEDBACK_ASSETS: DigitalAsset[] = [
  {
    id: "feedback-hikersfoot",
    type: "UserFeedback",
    name: "User Feedback",
    comment:
      "The process in this paper can probably be reproduced to generate HikersFootprint in Les Bauges and MontBlanc, using OutdoorVision data as an input",
    concepts: [],
  },
  {
    id: "feedback-artifacts",
    type: "UserFeedback",
    name: "User Feedback",
    comment:
      "Artifacts exist in dense urban areas above a certain zoom level due to lower GPS accuracy in those areas",
    concepts: [],
  },
];
const FEEDBACK_BY_ID = Object.fromEntries(
  FEEDBACK_ASSETS.map((a) => [a.id, a]),
);

// ─── Mock topology — only ids + edges, no duplicated asset data ───────────────

const MOCK_NEIGHBOR_GRAPHS: Record<
  string,
  { nodeIds: string[]; edges: RawEdge[] }
> = {
  "ov-map-service": {
    nodeIds: [
      "outdoorvision-catalog",
      "ov-tracks-2024",
      "paper-vandamme-2024",
      "feedback-hikersfoot",
      "feedback-artifacts",
    ],
    edges: [
      {
        source: "outdoorvision-catalog",
        target: "ov-map-service",
        label: "PROVIDES",
      },
      {
        source: "outdoorvision-catalog",
        target: "ov-tracks-2024",
        label: "PROVIDES",
      },
      {
        source: "feedback-hikersfoot",
        target: "paper-vandamme-2024",
        label: "REFERENCES",
      },
      {
        source: "feedback-hikersfoot",
        target: "ov-tracks-2024",
        label: "REFERENCES",
      },
      {
        source: "feedback-artifacts",
        target: "ov-map-service",
        label: "ANNOTATES",
      },
    ],
  },

  "ov-tracks-2024": {
    nodeIds: ["ov-map-service", "paper-vandamme-2024"],
    edges: [
      { source: "ov-tracks-2024", target: "ov-map-service", label: "FEEDS" },
      {
        source: "paper-vandamme-2024",
        target: "ov-tracks-2024",
        label: "REFERENCES",
      },
    ],
  },

  "paper-marchand-2025": {
    nodeIds: ["ov-tracks-2024", "skilift-counters"],
    edges: [
      {
        source: "paper-marchand-2025",
        target: "ov-tracks-2024",
        label: "USES",
      },
      {
        source: "paper-marchand-2025",
        target: "skilift-counters",
        label: "USES",
      },
    ],
  },
};

const EXTRA_ASSETS: DigitalAsset[] = [
  {
    id: "outdoorvision-catalog",
    type: "Catalog",
    name: "OutdoorVision",
    comment:
      "The Outdoorvision platform aggregating GPS traces from connected outdoor apps.",
    concepts: ["Outdoorvision", "Catalog"],
  },
];
const EXTRA_BY_ID = Object.fromEntries(EXTRA_ASSETS.map((a) => [a.id, a]));

function resolveAll(ids: string[]): DigitalAsset[] {
  return ids
    .map((id) => ASSET_BY_ID[id] ?? FEEDBACK_BY_ID[id] ?? EXTRA_BY_ID[id])
    .filter((a): a is DigitalAsset => a !== undefined);
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGraphStore = defineStore("graph", () => {
  const selectedAsset = ref<DigitalAsset | null>(null);
  const graphNodes = shallowRef<NodeDatum[]>([]);
  const graphEdges = shallowRef<LinkDatum[]>([]);
  const isLoadingNeighbors = ref(false);
  const error = ref<string | null>(null);

  async function selectAsset(asset: DigitalAsset) {
    selectedAsset.value = asset;
    isLoadingNeighbors.value = true;
    error.value = null;
    try {
      const { nodes, edges } = await fetchNeighborGraph(asset.id);
      const { nodes: graphN, links } = buildGraphData(asset, nodes, edges);
      graphNodes.value = graphN;
      graphEdges.value = links;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load neighbors";
    } finally {
      isLoadingNeighbors.value = false;
    }
  }

  function clearGraph() {
    selectedAsset.value = null;
    graphNodes.value = [];
    graphEdges.value = [];
    error.value = null;
  }

  // Replace with: fetch(`/api/neo4j/neighbors/${assetId}`).then(r => r.json())
  async function fetchNeighborGraph(assetId: string): Promise<NeighborGraph> {
    await new Promise((r) => setTimeout(r, 400));
    const mock = MOCK_NEIGHBOR_GRAPHS[assetId];
    if (!mock) return { nodes: [], edges: [] };
    return { nodes: resolveAll(mock.nodeIds), edges: mock.edges };
  }

  return {
    selectedAsset,
    graphNodes,
    graphEdges,
    isLoadingNeighbors,
    error,
    selectAsset,
    clearGraph,
  };
});
