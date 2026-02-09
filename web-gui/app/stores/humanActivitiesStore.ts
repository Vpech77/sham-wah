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
  description: string;
  concepts: string[];
  metadata?: Record<string, any>;
}

export interface QueryParams {
  query: string;
  concepts: string[];
  assetType: string;
  limit: number;
}

export const useHumanActivitiesStore = defineStore("humanActivities", () => {
  // State
  const isExecuting = ref(false);
  const results = ref<QueryResult | null>(null);
  const error = ref<string | null>(null);
  const queryHistory = ref<QueryParams[]>([]);

  // Actions
  async function executeQuery(params: QueryParams) {
    isExecuting.value = true;
    error.value = null;
    results.value = null;

    try {
      // Store query in history
      queryHistory.value.unshift(params);
      if (queryHistory.value.length > 10) {
        queryHistory.value = queryHistory.value.slice(0, 10);
      }

      // Call Neo4j API
      const response = await callNeo4jAPI(params);
      results.value = response;
      console.log(params);
      console.log(results);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Query execution error:", err);
    } finally {
      isExecuting.value = false;
    }
  }

  async function callNeo4jAPI(params: QueryParams): Promise<QueryResult> {
    // TODO: Replace with actual Neo4j API endpoint
    // Example implementation:
    //
    // const response = await fetch('/api/neo4j/query', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     query: params.query,
    //     parameters: {
    //       concepts: params.concepts,
    //       limit: params.limit,
    //     },
    //   }),
    // })
    //
    // if (!response.ok) {
    //   throw new Error(`Neo4j API error: ${response.statusText}`)
    // }
    //
    // const data = await response.json()
    // return transformNeo4jResponse(data)

    // Mock implementation for development
    return mockNeo4jQuery(params);
  }

  function mockNeo4jQuery(params: QueryParams): Promise<QueryResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockAssets = generateMockAssets(params);
        resolve({
          count: mockAssets.length,
          executionTime: Math.floor(Math.random() * 300) + 50,
          data: mockAssets,
        });
      }, 800);
    });
  }

  function generateMockAssets(params: QueryParams): DigitalAsset[] {
    const assetTypes =
      params.assetType === "all"
        ? ["Dataset", "ScientificPaper", "ScientificSurvey"]
        : [params.assetType];

    const count = Math.min(Math.floor(Math.random() * 10) + 3, params.limit);

    return Array.from({ length: count }, (_, i) => {
      const type = assetTypes[Math.floor(Math.random() * assetTypes.length)]!;
      const conceptSubset = params.concepts
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * params.concepts.length) + 1);

      const mainConcept = conceptSubset[0]!;

      return {
        id: `asset-${Date.now()}-${i}`,
        type,
        name: generateAssetName(type, mainConcept),
        description: generateAssetDescription(type, conceptSubset),
        concepts: conceptSubset,
        metadata: {
          dateCreated: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
          )
            .toISOString()
            .split("T")[0],
          author: generateRandomAuthor(),
          location: generateRandomLocation(),
        },
      };
    });
  }

  function generateAssetName(type: string, concept: string): string {
    const templates = {
      Dataset: [
        `Chamois encounters area`,
        `Outdoor Vision Export`,
        `Parc des Bauges Sentiers BDTopo`,
        `Tracks MultiSensors Vincennes`,
      ],
      ScientificPaper: [
        `Analysis of ${concept} in Sensitive Areas`,
        `Kerouaton 2024`,
        `Ecological Impact of ${concept}`,
        `Marchand et al. 2025`,
      ],
      ScientificSurvey: [
        `Kerouatan Survey 2024`,
        `${concept} Environmental Impact Survey`,
        `${concept} Seasonal Variation Assessment`,
      ],
    };

    const typeTemplates =
      templates[type as keyof typeof templates] || templates.Dataset;
    return typeTemplates[Math.floor(Math.random() * typeTemplates.length)]!;
  }

  function generateAssetDescription(type: string, concepts: string[]): string {
    const templates = {
      Dataset:
        "185 real encounters. Only included real encounters as they are likely enough to work with and potential encounters drastically increase amount of data",
      ScientificPaper:
        "Eye-catching or breath-catching: Role and landscape attributes of pauses differs among hikers’ profile when rambling in a French mountainous area",
      ScientificSurvey:
        "Systematic survey collecting empirical data from field observations and measurements.",
    };

    return (
      templates[type as keyof typeof templates] ||
      "Digital asset containing relevant research data."
    );
  }

  function generateRandomAuthor(): string {
    const authors = [
      "Smith et al.",
      "Johnson Research Group",
      "Wildlife Conservation Institute",
      "National Park Service",
      "University Environmental Lab",
      "Forest Service Research",
    ];
    return authors[Math.floor(Math.random() * authors.length)]!;
  }

  function generateRandomLocation(): string {
    const locations = [
      "Rocky Mountains, CO",
      "Yellowstone National Park",
      "Pacific Northwest Region",
      "Appalachian Trail Corridor",
      "Sierra Nevada, CA",
      "Great Smoky Mountains",
    ];
    return locations[Math.floor(Math.random() * locations.length)]!;
  }

  function transformNeo4jResponse(neo4jData: any): QueryResult {
    // Transform Neo4j response format to our application format
    // This will depend on your actual Neo4j response structure
    //
    // Example transformation:
    // const assets = neo4jData.records.map((record: any) => ({
    //   id: record.get('asset').identity.toString(),
    //   type: record.get('asset').labels[0],
    //   name: record.get('asset').properties.name,
    //   description: record.get('asset').properties.description,
    //   concepts: record.get('concept') ? [record.get('concept').labels[0]] : [],
    //   metadata: record.get('asset').properties.metadata,
    // }))
    //
    // return {
    //   count: assets.length,
    //   executionTime: neo4jData.summary.resultAvailableAfter,
    //   data: assets,
    // }

    return {
      count: 0,
      executionTime: 0,
      data: [],
    };
  }

  function clearResults() {
    results.value = null;
    error.value = null;
  }

  function clearHistory() {
    queryHistory.value = [];
  }

  // Getters
  function getLastQuery(): QueryParams | null {
    return queryHistory.value[0] || null;
  }

  return {
    // State
    isExecuting,
    results,
    error,
    queryHistory,

    // Actions
    executeQuery,
    clearResults,
    clearHistory,

    // Getters
    getLastQuery,
  };
});
