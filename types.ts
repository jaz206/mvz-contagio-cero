export type HeroClass = 'SCOUT' | 'BRAWLER' | 'TACTICIAN' | 'BLASTER';
export type HeroStatus = 'AVAILABLE' | 'DEPLOYED' | 'INJURED' | 'CAPTURED';
export type WorldStage = 'NORMAL' | 'ANOMALY' | 'SURFER' | 'GALACTUS';

export interface HeroStats {
  strength: number;
  agility: number;
  intellect: number;
}

// NUEVA INTERFAZ PARA EL ENCUADRE
export interface ImageParams {
  scale: number;
  x: number;
  y: number;
}

export type I18nString = string | { es: string; en: string };

export interface Hero {
  id: string;
  templateId?: string;
  name: string;
  alias: string;
  status: HeroStatus;
  class: HeroClass;
  bio: I18nString;
  origin?: I18nString;
  currentStory?: string;
  objectives?: string[];
  completedObjectiveIndices?: number[];
  imageUrl?: string;
  characterSheetUrl?: string;
  stats: HeroStats;
  assignedMissionId: string | null;
  expansionId?: string;
  relatedHeroId?: string;
  imageParams?: ImageParams;
}

export interface HeroTemplate {
  id: string;
  defaultName: string;
  defaultClass: HeroClass;
  defaultStats: HeroStats;
  imageUrl: string;
  characterSheetUrl?: string;
  bio?: I18nString;
  origin?: I18nString;
  alias: string;
  currentStory?: string;
  objectives?: string[];
  defaultAlignment?: 'ALIVE' | 'ZOMBIE';
  expansionId?: string;
  relatedHeroId?: string;
  imageParams?: ImageParams;
}

export interface Location {
  state: string;
  coordinates: [number, number];
}

export interface Objective {
  title: string;
  desc: string;
}

export type MissionType =
  | 'STANDARD'
  | 'INTRODUCTORY'
  | 'SHIELD_BASE'
  | 'BOSS'
  | 'BOSS_KINGPIN'
  | 'BOSS_MAGNETO'
  | 'BOSS_DOOM'
  | 'BOSS_HULK'
  | 'GALACTUS';

export interface Mission {
  id: string;
  title: string;
  description: string[];
  objectives: Objective[];
  location: Location;
  threatLevel: string;
  type?: MissionType;
  triggerStage?: WorldStage;
  prereq?: string;
  prereqs?: string[];
  pdfUrl?: string;
  alignment?: 'ALIVE' | 'ZOMBIE' | 'BOTH';
  requirements?: string[];
  specialRules?: string[];
  setupInstructions?: string[];
  layoutUrl?: string;
  outcomeText?: string;
  isIntroMission?: boolean;
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