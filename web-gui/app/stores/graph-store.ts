import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import type { DigitalAsset } from "./query-result-store";
import type { NodeDatum, LinkDatum } from "~/utils/graph/graphTypes";
import { buildGraphData, type RawEdge } from "~/utils/graph/graphAdapter";

interface NeighborGraph {
  nodes: DigitalAsset[];
  edges: RawEdge[];
}

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
    return MOCK_NEIGHBOR_GRAPHS[assetId] ?? { nodes: [], edges: [] };
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

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_NEIGHBOR_GRAPHS: Record<string, NeighborGraph> = {
  "ov-map-service": {
    nodes: [
      {
        id: "outdoorvision-catalog",
        type: "Catalog",
        name: "OutdoorVision",
        description:
          "The Outdoorvision platform aggregating GPS traces from connected outdoor apps.",
        concepts: ["Outdoorvision", "Catalog"],
      },
      {
        id: "ov-tracks-2024",
        type: "Dataset",
        name: "OVTracksMontBlancBauges2024",
        description: "GPS traces from Outdoorvision, cleaned and filtered.",
        concepts: ["Outdoorvision", "GPS Traces"],
      },
      {
        id: "paper-vandamme-2024",
        type: "ScientificPaper",
        name: "SIGSPATIAL24VanDammeEtAl2024",
        description:
          "A metrological analysis of a modular and iterative aggregation algorithm of GNSS trajectories.",
        concepts: ["GNSS", "Trajectories"],
      },
      {
        id: "feedback-hikersfoot",
        type: "UserFeedback",
        name: "User Feedback",
        description:
          "The process in this paper can probably be reproduced to generate HikersFootprint in Les Bauges and MontBlanc, using OutdoorVision data as an input",
        concepts: [],
      },
      {
        id: "feedback-artifacts",
        type: "UserFeedback",
        name: "User Feedback",
        description:
          "Artifacts exist in dense urban areas above a certain zoom level due to lower GPS accuracy in those areas",
        concepts: [],
      },
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
    nodes: [
      {
        id: "ov-map-service",
        type: "DataService",
        name: "OVRecreationalUserMapService",
        description:
          "Displays aggregated paths of GPS tracks from Outdoorvision.",
        concepts: ["Map Service", "Outdoorvision"],
      },
      {
        id: "paper-vandamme-2024",
        type: "ScientificPaper",
        name: "SIGSPATIAL24VanDammeEtAl2024",
        description: "A metrological analysis of GNSS trajectory aggregation.",
        concepts: ["GNSS", "Trajectories"],
      },
    ],
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
    nodes: [
      {
        id: "ov-tracks-2024",
        type: "Dataset",
        name: "OVTracksMontBlancBauges2024",
        description: "GPS traces from Outdoorvision, cleaned and filtered.",
        concepts: ["Outdoorvision", "GPS Traces"],
      },
      {
        id: "skilift-counters",
        type: "Dataset",
        name: "SkiLiftCountersMontBlanc2008To2024",
        description: "Counting data for each ski lift over a 10-year period.",
        concepts: ["Ski Lift", "Counting"],
      },
    ],
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
