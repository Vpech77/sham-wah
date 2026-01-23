<template>
  <div class="h-full p-6">
    <div class="h-full flex flex-col">
      <!-- Page Header -->
      <div class="mb-4">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Graph Exploration
        </h1>
      </div>

      <!-- Graph Canvas -->
      <div class="flex-1 min-h-0">
        <GraphCanvas />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GraphCanvas from "@/components/canvas/GraphCanvas.vue";
</script>
