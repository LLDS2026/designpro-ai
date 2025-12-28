
export enum ProjectType {
  ARCHITECTURAL = 'Architectural',
  INTERIOR = 'Interior',
  GRAPHIC = 'Graphic',
  MEDIA = 'Media'
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  status: string;
  progress: number;
  lastUpdate: string;
  efficiencyScore?: number;
  phases: string[]; // Added: Dynamic workflow phases
}

export interface ToolAction {
  type: 'calendar' | 'drive' | 'finance' | 'search' | 'photos' | 'system' | 'workflow' | 'creative';
  action: string;
  details: string;
  timestamp: string;
}

export interface AIInsight {
  id: string;
  type: 'optimization' | 'warning' | 'learning';
  title: string;
  description: string;
  impact: string;
  actionLabel: string;
}
