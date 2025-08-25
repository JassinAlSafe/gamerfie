import { ComponentType } from 'react';

export type RoadmapStatus = "completed" | "in-progress" | "planned" | "future";
export type RoadmapQuarter = "Q4 2024" | "Q1 2025" | "Q2 2025" | "Q3 2025" | "Future";
export type RoadmapCategory = "core" | "social" | "mobile" | "performance" | "security";
export type RoadmapImpact = "high" | "medium" | "low";

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  quarter: RoadmapQuarter;
  category: RoadmapCategory;
  impact: RoadmapImpact;
  features?: string[];
}

export interface RoadmapStatusConfig {
  icon: ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bgColor: string;
}

export type RoadmapCategoryIcons = {
  [key in RoadmapCategory]: ComponentType<{ className?: string }>;
}