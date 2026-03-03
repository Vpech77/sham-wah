import type * as d3 from "d3";

export type NodeShape = "circle" | "rect";

export interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  label: string; // short truncated label shown outside the node
  fullName: string; // original camelCase name shown in the info panel
  description: string; // truncated, shown inside rect nodes
  fullDescription: string; // original, shown in the info panel
  color: string;
  size: number; // circle radius (ignored for rect)
  shape: NodeShape;
  width?: number; // rect only
  height?: number; // rect only
  type: string;
  concepts: string[];
  isSelected?: boolean; // true for the focused / origin node
}

export interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  source: string | NodeDatum;
  target: string | NodeDatum;
  label?: string;
}
