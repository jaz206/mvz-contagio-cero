export type HeroClass = 'SCOUT' | 'BRAWLER' | 'TACTICIAN' | 'BLASTER';
export type HeroStatus = 'AVAILABLE' | 'DEPLOYED' | 'INJURED' | 'CAPTURED';
export type WorldStage = 'NORMAL' | 'ANOMALY' | 'SURFER' | 'GALACTUS';
export type StaffRole = 'admin' | 'editor';

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

export interface PermissionBlock {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface StaffPermissions {
  missions: PermissionBlock;
  characters: PermissionBlock;
}

export interface StaffAccount {
  uid: string;
  email: string;
  displayName: string;
  role: StaffRole;
  isActive: boolean;
  permissions: StaffPermissions;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface IntroSlide {
  id: string;
  textEs: string;
  textEn: string;
  image: string;
}

export interface IntroConfig {
  alive: IntroSlide[];
  zombie: IntroSlide[];
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
