export type HeroClass = 'SCOUT' | 'BRAWLER' | 'TACTICIAN' | 'BLASTER';
export type HeroStatus = 'AVAILABLE' | 'DEPLOYED' | 'INJURED';
export type WorldStage = 'NORMAL' | 'ANOMALY' | 'SURFER' | 'GALACTUS';

export interface HeroStats {
    strength: number;
    agility: number;
    intellect: number;
}

export interface Hero {
    id: string;
    templateId?: string;
    name: string;
    alias: string;
    status: HeroStatus;
    class: HeroClass;
    bio: string;
    currentStory?: string;
    objectives?: string[];
    completedObjectiveIndices?: number[];
    imageUrl?: string;
    characterSheetUrl?: string;
    stats: HeroStats;
    assignedMissionId: string | null;
}

export interface HeroTemplate {
    id: string;
    defaultName: string;
    defaultClass: HeroClass;
    defaultStats: HeroStats;
    imageUrl: string;
    bio?: string;
    alias?: string;
    currentStory?: string;
    objectives?: string[];
    characterSheetUrl?: string;
}

export interface Location {
    state: string;
    coordinates: [number, number]; // [Longitude, Latitude]
}

export interface Objective {
    title: string;
    desc: string;
}

export interface Mission {
    id: string;
    title: string;
    description: string[];
    objectives: Objective[];
    location: Location;
    threatLevel: string;
    type?: 'STANDARD' | 'SHIELD_BASE' | 'BOSS';
    prereq?: string;
    pdfUrl?: string;
    // NUEVO CAMPO: Define si la misión es para Humanos, Zombies o Ambos
    alignment?: 'ALIVE' | 'ZOMBIE' | 'BOTH'; 
}

export interface GlobalEvent {
    stage: WorldStage;
    title: string;
    description: string;
    image?: string;
}

export interface USATopoJSON {
  type: "Topology";
  objects: {
    states: {
      type: "GeometryCollection";
      geometries: Array<{
        type: "Polygon" | "MultiPolygon";
        properties: {
          name: string;
        };
        id?: string | number;
        arcs: number[][];
      }>;
    };
    counties?: {
      type: "GeometryCollection";
      geometries: Array<any>;
    };
  };
  arcs: number[][][];
  transform?: {
    scale: number[];
    translate: number[];
  };
}