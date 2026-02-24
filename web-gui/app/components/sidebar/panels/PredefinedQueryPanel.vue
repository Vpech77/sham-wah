<template>
  <div class="space-y-2">
    <!-- NATURAL LANGUAGE STATEMENT + INLINE SELECTOR -->
    <!-- <div
      class="relative overflow-hidden rounded-xl border border-gold-200 dark:border-gold-800/50 bg-gradient-to-br from-white via-gold-50/30 to-amber-50/20 dark:from-gray-900 dark:via-gold-900/10 dark:to-amber-900/5 backdrop-blur-sm"
    > -->
    <!-- Decorative elements -->
    <!-- <div
      class="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 dark:bg-gold-400/5 rounded-full blur-3xl"
    ></div> -->
    <div
      class="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-2xl"
    ></div>
    <div class="relative">
      <!-- Sentence + selector on same line -->
      <div class="flex items-center gap-3 flex-wrap">
        <h3
          class="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap shrink-0"
        >
          I'm looking for data about
        </h3>
        <div class="flex-1 min-w-[200px]">
          <ConceptSelector
            ref="conceptSelectorRef"
            v-model="selectedConcepts"
          />
        </div>
      </div>
      <!-- </div> -->
    </div>

    <!-- FILTERS -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label
          class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5"
          >Limit</label
        >
        <input
          v-model.number="filters.limit"
          type="number"
          min="1"
          max="100"
          class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-gold-500 dark:focus:ring-gold-400 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label
          class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5"
          >Resource Type</label
        >
        <select
          v-model="filters.assetType"
          class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-gold-500 dark:focus:ring-gold-400 focus:border-transparent transition-all"
        >
          <option value="all">All Resource type</option>
          <option value="Dataset">Dataset</option>
          <option value="DataService">Data Service</option>
          <option value="ScientificPaper">Scientific Paper</option>
          <option value="ScientificSurvey">Scientific Survey</option>
          <option value="Process">Process</option>
        </select>
      </div>
    </div>

    <!-- EXECUTE AND DELETE BUTTONS -->
    <div class="flex gap-">
      <button
        @click="executeQuery"
        :disabled="isExecuting || !hasCategorySelected"
        class="flex-1 px-2 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="
          isExecuting
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
            : 'bg-gradient-to-r from-gold-500 via-gold-600 to-bronze-600 text-white hover:shadow-lg hover:shadow-gold-500/30 hover:scale-[1.02] active:scale-[0.98]'
        "
      >
        <svg
          v-if="isExecuting"
          class="w-5 h-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <svg
          v-else
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span>{{ isExecuting ? "Searching..." : "Search" }}</span>
      </button>

      <!-- <button
        @click="clearQuery"
        :disabled="isExecuting || !queryStore.results"
        class="px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="
          isExecuting || !queryStore.results
            ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-[1.02] active:scale-[0.98]'
        "
        title="Clear query and results"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button> -->
    </div>

    <!-- RESULTS SECTION -->
    <div v-if="queryStore.results || queryStore.error">
      <!-- ERROR STATE -->
      <div
        v-if="queryStore.error"
        class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
      >
        <div class="flex items-start gap-3">
          <svg
            class="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p class="text-sm font-medium text-red-800 dark:text-red-300">
              Error
            </p>
            <p class="text-sm text-red-700 dark:text-red-400 mt-1">
              {{ queryStore.error }}
            </p>
          </div>
        </div>
      </div>

      <!-- SUCCESS STATE -->
      <div v-else-if="queryStore.results">
        <!-- Results Header -->
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {{ queryStore.results.count }} result(s) ·
          <!-- {{ queryStore.results.executionTime }}ms -->
        </p>
        <!-- Compact cards grid -->
        <div class="flex flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-thin">
          <AssetCard
            v-for="asset in queryStore.results.data"
            :key="asset.id"
            :asset="asset"
            :selected="isAssetSelected(asset.id)"
            @toggle="toggleAssetSelection"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useHumanActivitiesStore } from "~/stores/humanActivityStore";
import ConceptSelector from "./predefinedQueryPanel/ConceptSelector.vue";
import AssetCard from "./predefinedQueryPanel/AssetCard.vue";

// Store
const queryStore = useHumanActivitiesStore();

// Local state
const conceptSelectorRef = ref<InstanceType<typeof ConceptSelector>>();
const selectedConcepts = ref<string[]>([]);
const selectedAssets = ref<any[]>([]);
const isExecuting = computed(() => queryStore.isExecuting);

const hasCategorySelected = computed(() => {
  return conceptSelectorRef.value?.selectedCategory ? true : false;
});

const filters = ref({
  limit: 15,
  assetType: "all",
});

// Watch for changes in selected concepts to clear results
watch(
  selectedConcepts,
  () => {
    queryStore.clearResults();
    selectedAssets.value = [];
  },
  { deep: true },
);

// Watch for changes in filters to clear results
watch(
  filters,
  () => {
    queryStore.clearResults();
    selectedAssets.value = [];
  },
  { deep: true },
);

const effectiveConceptsForQuery = computed(() => {
  if (conceptSelectorRef.value?.effectiveConcepts) {
    return conceptSelectorRef.value.effectiveConcepts;
  }
  return selectedConcepts.value;
});

const generatedQuery = computed(() => {
  const conceptsToUse = effectiveConceptsForQuery.value;
  let query = "MATCH ";

  if (filters.value.assetType === "all") {
    query +=
      "(asset:Dataset|DataService|ScientificPaper|ScientificSurvey|Process)";
  } else {
    query += `(asset:${filters.value.assetType})`;
  }

  if (conceptsToUse.length > 0) {
    const conceptLabels = conceptsToUse.join("|");
    query += `-[:REPRESENTS]->(concept:${conceptLabels})`;
    query += "\nRETURN asset, concept";
  } else {
    query += "\nRETURN asset";
  }

  query += `\nLIMIT ${filters.value.limit}`;
  return query;
});

// Methods
async function executeQuery() {
  if (!generatedQuery.value) return;
  selectedAssets.value = [];
  await queryStore.executeQuery({
    query: generatedQuery.value,
    concepts: effectiveConceptsForQuery.value,
    assetType: filters.value.assetType,
    limit: filters.value.limit,
  });
}

function clearQuery() {
  selectedConcepts.value = [];
  selectedAssets.value = [];
  queryStore.clearResults();
  filters.value = { limit: 15, assetType: "all" };
}

function isAssetSelected(assetId: string): boolean {
  return selectedAssets.value.some((a) => a.id === assetId);
}

function toggleAssetSelection(asset: any) {
  const isAlreadySelected = isAssetSelected(asset.id);
  selectedAssets.value = [];
  if (!isAlreadySelected) {
    selectedAssets.value = [asset];
  }
}

defineExpose({ selectedAssets, selectedConcepts });
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background: #4b5563;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
