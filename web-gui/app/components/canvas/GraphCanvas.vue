<template>
  <div
    class="relative w-full h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
  >
    <div class="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <!-- Zoom Controls card -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1"
      >
        <button
          @click="zoomIn"
          class="block w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Zoom in"
        >
          <svg
            class="w-5 h-5 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <div class="h-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
        <button
          @click="zoomOut"
          class="block w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Zoom out"
        >
          <svg
            class="w-5 h-5 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 12H4"
            />
          </svg>
        </button>
        <div class="h-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
        <button
          @click="resetView"
          class="block w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Reset view"
        >
          <svg
            class="w-5 h-5 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <!-- View Options card -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1"
      >
        <button
          @click="toggleLabels"
          class="block w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          :class="{ 'bg-blue-50 dark:bg-blue-900/20': showLabels }"
          title="Toggle labels"
        >
          <svg
            class="w-5 h-5 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- ── Info Node Panel ── -->
    <div
      v-if="selectedNode"
      class="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-xs"
    >
      <div class="flex items-start justify-between mb-2">
        <h3 class="font-semibold text-gray-900 dark:text-white">
          {{ selectedNode.label }}
        </h3>
        <button
          @click="selectedNode = null"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <p>
          <span class="font-medium">Connections:</span>
          {{ selectedNode.degree }}
        </p>
        <p><span class="font-medium">Type:</span> {{ selectedNode.type }}</p>
      </div>
    </div>

    <div ref="graphContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as d3 from "d3";

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  color: string;
  size: number;
  type?: string;
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  source: string | NodeDatum;
  target: string | NodeDatum;
}

const graphContainer = ref<HTMLDivElement | null>(null);
const showLabels = ref(true);
const selectedNode = ref<{
  label: string;
  degree: number;
  type: string;
} | null>(null);

let svgEl: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;
let simulation: d3.Simulation<NodeDatum, LinkDatum> | null = null;
let labelSelection: d3.Selection<
  SVGTextElement,
  NodeDatum,
  SVGGElement,
  unknown
> | null = null;
let themeObserver: MutationObserver | null = null; // watches for dark/light mode changes

// ─── Dark Mode Helper ─────────────────────────────────────────────────────────

const getLabelColor = (): string =>
  document.documentElement.classList.contains("dark") ? "#D1D5DB" : "#374151"; // gray-300 and gray-700

onMounted(() => {
  if (!graphContainer.value) return;

  const nodes: NodeDatum[] = [
    { id: "n1", label: "Node 1", color: "#3B82F6", size: 10 },
    {
      id: "n2",
      label: "Node 2",
      color: "#8B5CF6",
      size: 10,
      type: "Secondary",
    },
    { id: "n3", label: "Node 3", color: "#10B981", size: 14, type: "Hub" },
    { id: "n4", label: "Node 4", color: "#F59E0B", size: 8 },
  ];

  const links: LinkDatum[] = [
    { source: "n1", target: "n2" },
    { source: "n1", target: "n3" },
    { source: "n2", target: "n3" },
    { source: "n3", target: "n4" },
  ];

  const { width, height } = graphContainer.value.getBoundingClientRect();

  svgEl = d3
    .select(graphContainer.value)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const g = svgEl.append("g").attr("class", "graph-root");

  // ── ZOOM & PAN ─────────────────────────────────────────────────────────

  zoomBehavior = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 8])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

  // Attaching the behavior to the SVG means the whole surface is pannable.
  svgEl.call(zoomBehavior);

  // ── ARROWHEAD MARKER (optional — for directed graphs) ──────────────────

  svgEl
    .append("defs")
    .append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "-0 -5 10 10")
    .attr("refX", 20) // how far back from the target the arrow sits
    .attr("refY", 0)
    .attr("orient", "auto") // rotates to follow the line direction
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .append("path")
    .attr("d", "M 0,-5 L 10,0 L 0,5") // a simple triangle
    .attr("fill", "#94A3B8");

  // ── LINKS (edges) ──────────────────────────────────────────────────────

  const link = g
    .append("g")
    .attr("class", "links")
    .selectAll<SVGLineElement, LinkDatum>("line")
    .data(links)
    .join("line")
    .attr("stroke", "#CBD5E1")
    .attr("stroke-width", 1.5)
    .attr("stroke-opacity", 0.8)
    .attr("marker-end", "url(#arrowhead)");

  // ── NODE GROUPS ────────────────────────────────────────────────────────

  const nodeGroup = g
    .append("g")
    .attr("class", "nodes")
    .selectAll<SVGGElement, NodeDatum>("g")
    .data(nodes)
    .join("g")
    .attr("class", "node")
    .style("cursor", "pointer")

    // ── DRAG BEHAVIOR ──────────────────────────────────────────────────────
    .call(
      d3
        .drag<SVGGElement, NodeDatum>()
        .on("start", (event, d) => {
          if (!event.active) simulation?.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation?.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }),
    );

  nodeGroup
    .append("circle")
    .attr("r", (d) => d.size)
    .attr("fill", (d) => d.color)
    .attr("stroke", "#fff")
    .attr("stroke-width", 2);

  // ── HOVER HIGHLIGHT ────────────────────────────────────────────────────

  nodeGroup
    .on("mouseenter", function () {
      d3.select(this)
        .select("circle")
        .attr("stroke", "#60A5FA")
        .attr("stroke-width", 3);
    })
    .on("mouseleave", function () {
      d3.select(this)
        .select("circle")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);
    });

  // ── NODE CLICK → INFO PANEL ────────────────────────────────────────────

  nodeGroup.on("click", (event, d) => {
    event.stopPropagation();
    const degree = links.filter(
      (l) =>
        (l.source as NodeDatum).id === d.id ||
        (l.target as NodeDatum).id === d.id,
    ).length;
    selectedNode.value = { label: d.label, degree, type: d.type ?? "Default" };
  });

  // Clicking empty SVG space deselects any highlighted node.
  svgEl.on("click", () => {
    selectedNode.value = null;
  });

  // ── LABELS ─────────────────────────────────────────────────────────────

  labelSelection = g
    .append("g")
    .attr("class", "labels")
    .selectAll<SVGTextElement, NodeDatum>("text")
    .data(nodes)
    .join("text")
    .text((d) => d.label)
    .attr("font-size", 11)
    .attr("fill", getLabelColor()) // dark-mode aware initial colour
    .attr("text-anchor", "middle")
    .attr("dy", (d) => d.size + 14)
    .attr("pointer-events", "none")
    .attr("display", showLabels.value ? null : "none");

  simulation = d3
    .forceSimulation<NodeDatum>(nodes)
    .force(
      "link",
      d3
        .forceLink<NodeDatum, LinkDatum>(links)
        .id((d) => d.id)
        .distance(100),
    )
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "collision",
      d3.forceCollide().radius((d) => (d as NodeDatum).size + 10),
    )
    // tick fires ~60 times/sec while the simulation is "hot" (alpha > alphaMin).
    // We imperatively update every SVG element's position here.
    .on("tick", () => {
      link
        .attr("x1", (d) => (d.source as NodeDatum).x ?? 0)
        .attr("y1", (d) => (d.source as NodeDatum).y ?? 0)
        .attr("x2", (d) => (d.target as NodeDatum).x ?? 0)
        .attr("y2", (d) => (d.target as NodeDatum).y ?? 0);

      // translate() moves the whole node group (circle + any future children)
      nodeGroup.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);

      // Labels get the same translation so they track their node
      labelSelection?.attr(
        "transform",
        (d) => `translate(${d.x ?? 0},${d.y ?? 0})`,
      );
    });

  // ── DARK MODE OBSERVER ─────────────────────────────────────────────────

  themeObserver = new MutationObserver(() => {
    labelSelection?.attr("fill", getLabelColor());
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onBeforeUnmount(() => {
  simulation?.stop();
  svgEl?.remove();
  themeObserver?.disconnect();
});

const zoomIn = () => {
  if (!svgEl || !zoomBehavior) return;
  svgEl.transition().duration(300).call(zoomBehavior.scaleBy, 1.4);
};

const zoomOut = () => {
  if (!svgEl || !zoomBehavior) return;
  svgEl
    .transition()
    .duration(300)
    .call(zoomBehavior.scaleBy, 1 / 1.4);
};

const resetView = () => {
  if (!svgEl || !zoomBehavior) return;
  svgEl
    .transition()
    .duration(500)
    .call(zoomBehavior.transform, d3.zoomIdentity);
};

const toggleLabels = () => {
  showLabels.value = !showLabels.value;
  labelSelection?.attr("display", showLabels.value ? null : "none");
};
</script>
