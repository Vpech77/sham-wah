import { defineStore } from "pinia";
import { ref } from "vue";

export interface QueryResult {
  count: number;
  executionTime: number;
  data: DigitalAsset[];
}

export interface DigitalAsset {
  id: string;
  type: string;
  name: string;
  comment: string; // ← was description
  publisher?: string; // ← new
  location?: string[]; // ← new
  concepts: string[];
  metadata?: Record<string, unknown>;
}

export interface QueryParams {
  query: string;
  concepts: string[];
  assetType: string;
  limit: number;
}

// ─── Mock data — exported so graph-store can reference by id ─────────────────

export const MOCK_ASSETS: DigitalAsset[] = [
  // ← was const (unexported)
  {
    id: "ov-tracks-2024",
    type: "Dataset",
    name: "OVTracksMontBlancBauges2024",
    comment:
      "A set of tracks issued from Outdoorvision. GPS traces from Outdoorvision are cleaned and filtered.",
    concepts: ["Human Activity"],
  },
  {
    id: "strava-tracks-2014",
    type: "Dataset",
    name: "StravaTracksBauges2014",
    comment: "No description available.",
    concepts: ["Human Activity"],
  },
  {
    id: "ov-map-service",
    type: "DataService",
    name: "OVRecreationalUserMapService",
    comment:
      "This data feed enables visualization in the Outdoorvision application of aggregated GPS tracks obtained from services and connected devices used by outdoor sports and recreational users.",
    publisher: "Pôle ressources national sports de nature (PRNSN)",
    location: [
      "La Réserve nationale de chasse et de faune sauvage des Bauges",
      "Massif du Mont Blanc, côté France",
    ],
    concepts: ["Human Activity"],
  },
  {
    id: "strava-map-service",
    type: "DataService",
    name: "StravaRecreationalUserMapService",
    comment: "Shows aggregated public activities from the past year on Strava.",
    concepts: ["Human Activity"],
  },
  {
    id: "c2c-routes-2025",
    type: "Dataset",
    name: "CampToCampRoutesBauges2025",
    comment: "A set of routes issued from Camptocamp.org API.",
    concepts: ["Human Activity"],
  },
  {
    id: "altirando-2025",
    type: "Dataset",
    name: "AltitudeRandoRoutesBauges2025",
    comment: "A set of routes issued from altituderando.com.",
    concepts: ["Human Activity"],
  },
  {
    id: "c2c-poi-2025",
    type: "Dataset",
    name: "CampToCampPOIBauges2025",
    comment: "A set of waypoints issued from Camptocamp.org API.",
    concepts: ["Human Activity"],
  },
  {
    id: "skilift-counters",
    type: "Dataset",
    name: "SkiLiftCountersMontBlanc2008To2024",
    comment:
      "Counting data for each ski lift, including their locations (start and end points), over a 10-year period.",
    concepts: ["Human Activity"],
  },
  {
    id: "bdtopo-2025",
    type: "Dataset",
    name: "BDTopoSentiersBauges2025",
    comment:
      "La BD TOPO® version 3.5 contient une description vectorielle 3D des éléments du territoire.",
    concepts: ["Human Activity"],
  },
  {
    id: "paper-marchand-2025",
    type: "ScientificPaper",
    name: "JournalOfPeopleAndNatureMarchandEtAl2025",
    comment:
      "Disturbance by massive sporting events in mountain areas: When and where matters for the protected Alpine ibex Capra ibex.",
    concepts: ["Human Activity"],
  },
  {
    id: "paper-vandamme-2024",
    type: "ScientificPaper",
    name: "SIGSPATIAL24VandDammeEtAl2024",
    comment:
      "A metrological analysis of a modular and iterative aggregation algorithm of GNSS trajectories.",
    concepts: ["Human Activity"],
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useHumanActivitiesStore = defineStore("humanActivities", () => {
  const isExecuting = ref(false);
  const results = ref<QueryResult | null>(null);
  const error = ref<string | null>(null);
  const queryHistory = ref<QueryParams[]>([]);

  async function executeQuery(params: QueryParams) {
    isExecuting.value = true;
    error.value = null;
    results.value = null;
    queryHistory.value = [params, ...queryHistory.value].slice(0, 10);
    try {
      results.value = await fetchFromNeo4j(params);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "An unexpected error occurred";
    } finally {
      isExecuting.value = false;
    }
  }

  function fetchFromNeo4j(params: QueryParams): Promise<QueryResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered =
          params.assetType === "all"
            ? MOCK_ASSETS
            : MOCK_ASSETS.filter(
                (a) => a.type.toLowerCase() === params.assetType.toLowerCase(),
              );
        resolve({
          count: Math.min(filtered.length, params.limit),
          executionTime: Math.floor(Math.random() * 300) + 50,
          data: filtered.slice(0, params.limit),
        });
      }, 800);
    });
  }

  function clearResults() {
    results.value = null;
    error.value = null;
  }
  function clearHistory() {
    queryHistory.value = [];
  }
  function getLastQuery(): QueryParams | null {
    return queryHistory.value[0] ?? null;
  }

  return {
    isExecuting,
    results,
    error,
    queryHistory,
    executeQuery,
    clearResults,
    clearHistory,
    getLastQuery,
  };
});
