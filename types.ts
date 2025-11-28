
// types.ts

export interface USATopoJSON {
  type: "Topology";
  objects: {
    states: {
      type: "GeometryCollection";
      geometries: Array<{
        type: "Polygon" | "MultiPolygon";
        properties: {
          name: string;
          // Add other properties if available in your TopoJSON, e.g., id: number;
        };
        arcs: number[][];
      }>;
    };
    counties: { // Add counties to the type, as us-atlas also contains them
      type: "GeometryCollection";
      geometries: Array<{
        type: "Polygon" | "MultiPolygon";
        properties: {
          name: string;
          // Add other properties if available in your TopoJSON, e.g., id: number;
        };
        arcs: number[][];
      }>;
    };
  };
  arcs: number[][][];
  transform: {
    scale: number[];
    translate: number[];
  };
}

export interface Objective {
  title: string;
  desc: string;
}

export interface Mission {
  id: string;
  type?: 'STANDARD' | 'SHIELD_BASE'; // Distinguish between standard missions and hidden bases
  prereq?: string; // ID of the mission that must be completed before this one appears
  title: string;
  description: string[]; // Array of paragraphs
  objectives: Objective[];
  location: {
    state: string;
    coordinates: [number, number]; // [Longitude, Latitude]
  };
  threatLevel: string;
}

export type HeroStatus = 'AVAILABLE' | 'DEPLOYED' | 'INJURED' | 'MIA';
export type HeroClass = 'BRAWLER' | 'TACTICIAN' | 'SCOUT' | 'BLASTER';

export interface Hero {
  id: string;
  templateId?: string; // Key to look up translations (if a preset hero)
  name: string;
  alias: string;
  status: HeroStatus;
  class: HeroClass;
  bio: string;
  // Nuevos campos
  currentStory?: string; // historia_actual
  objectives?: string[]; // array de objetivos personales
  completedObjectiveIndices?: number[]; // Índices de los objetivos cumplidos
  imageUrl?: string; // Optional URL for hero portrait
  stats: {
    strength: number;
    agility: number;
    intellect: number;
  };
  assignedMissionId?: string | null;
}

export interface HeroTemplate {
  id: string; // Matches translation key
  defaultName: string;
  defaultClass: HeroClass;
  defaultStats: {
    strength: number;
    agility: number;
    intellect: number;
  };
  imageUrl: string;
  // Optional fields for dynamic data from DB (if no translation exists)
  bio?: string;
  alias?: string;
  currentStory?: string;
  objectives?: string[];
}
