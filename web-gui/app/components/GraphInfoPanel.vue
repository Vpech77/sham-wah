<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-72"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-2 mb-3">
      <div class="flex items-center gap-2 min-w-0">
        <span
          class="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
          :style="{ backgroundColor: node.color }"
        />
        <h3
          class="font-semibold text-gray-900 dark:text-white text-sm leading-tight break-words"
        >
          {{ node.fullName }}
        </h3>
      </div>
      <button
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 transition-colors"
        @click="$emit('close')"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Type badge -->
    <span
      class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold text-white mb-3"
      :style="{ backgroundColor: node.color }"
    >
      {{ node.type }}
    </span>

    <!-- Selected node indicator -->
    <p
      v-if="node.isSelected"
      class="text-xs font-medium text-blue-500 dark:text-blue-400 mb-2"
    >
      ⬤ Resource Selected
    </p>

    <!-- Description -->
    <p
      v-if="hasDescription"
      class="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed"
    >
      {{ node.fullDescription }}
    </p>
    <p v-else class="text-xs text-gray-400 dark:text-gray-600 italic mb-3">
      No description available.
    </p>

    <!-- Concepts -->
    <div v-if="node.concepts?.length" class="flex flex-wrap gap-1 mb-3">
      <span
        v-for="concept in node.concepts"
        :key="concept"
        class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs"
      >
        {{ concept }}
      </span>
    </div>

    <!-- Stats -->
    <div
      class="border-t border-gray-100 dark:border-gray-700 pt-2 text-xs text-gray-500 dark:text-gray-400"
    >
      <p>
        <span class="font-medium">Connections:</span>
        {{ degree }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { NodeDatum } from "~/utils/graph/graphTypes";

const props = defineProps<{
  node: NodeDatum;
  degree: number;
}>();

defineEmits<{ close: [] }>();

const hasDescription = computed(
  () =>
    props.node.fullDescription &&
    !props.node.fullDescription.toLowerCase().includes("no description"),
);
</script>
