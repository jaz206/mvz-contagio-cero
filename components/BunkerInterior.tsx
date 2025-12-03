"use client"

import type React from "react"
import { useState, useEffect } from "react"
// Ajusta tus imports según corresponda
import { translations, type Language } from "../translations"
import type { Hero, Mission, HeroClass, HeroTemplate } from "../types"
import { getHeroTemplates, seedHeroTemplates, updateHeroTemplate } from "../services/dbService"

// --- COMPONENTE DEPURACIÓN: VISUALIZADOR DE ESTADO ---
// Este componente muestra en pantalla qué está recibiendo el Bunker
const DebugOverlay = ({ heroesCount, containerSize }: { heroesCount: number, containerSize: string }) => (
  <div className="absolute top-20 left-4 z-[9999] bg-black/80 border border-red-500 p-4 text-red-500 font-mono text-xs pointer-events-none">
    <h3 className="font-bold border-b border-red-500 mb-2">DEBUG MODE</h3>
    <p>Héroes recibidos: <span className="text-white font-bold">{heroesCount}</span></p>
    <p>Estado Contenedor: {containerSize}</p>
    <p>Si ves esto, React está renderizando.</p>
    <p>Si 'Héroes' es 0, revisa tu base de datos o props.</p>
  </div>
)

// --- TYPES ---
interface BunkerInteriorProps {
  heroes: Hero[]
  missions: Mission[]
  onAssign: (heroId: string, missionId: string) => boolean
  onUnassign: (heroId: string) => void
  onAddHero: (hero: Hero) => void
  onToggleObjective: (heroId: string, objectiveIndex: number) => void
  onBack: () => void
  language: Language
  playerAlignment?: "ALIVE" | "ZOMBIE" | null
  isEditorMode?: boolean
}

// --- SUB-COMPONENT: SCANNER (Estético) ---
const CerebroScanner = ({ status }: { status: "SEARCHING" | "LOCKED" }) => {
  const isLocked = status === "LOCKED"
  return (
    <div className={`w-full h-24 bg-slate-950 border relative overflow-hidden flex items-center justify-center p-2 ${isLocked ? "border-emerald-600" : "border-cyan-900"}`}>
       <div className="text-[8px] font-mono text-cyan-500">SCANNER ACTIVE</div>
    </div>
  )
}

// --- SUB-COMPONENT: HERO TOKEN (SIMPLIFICADO PARA TEST) ---
const HeroToken: React.FC<{ hero: Hero; onClick: () => void }> = ({ hero, onClick }) => {
  // Eliminamos lógica compleja de movimiento temporalmente para asegurar renderizado
  const [pos] = useState({ 
    top: Math.random() * 60 + 20, // Entre 20% y 80%
    left: Math.random() * 60 + 20 
  })

  // LOG PARA VER SI SE MONTA EL TOKEN INDIVIDUALMENTE
  useEffect(() => {
    console.log(`[TOKEN MOUNT] Renderizando token para: ${hero.alias}`);
  }, [hero.alias]);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="absolute w-12 h-12 rounded-full border-2 border-white bg-blue-600 z-50 flex items-center justify-center cursor-pointer hover:scale-125 transition-transform"
      style={{
        left: `${pos.left}%`,
        top: `${pos.top}%`,
        transform: `translate(-50%, -50%)`,
        boxShadow: "0 0 20px rgba(255,255,255,0.8)" // Brillo exagerado para verlo
      }}
    >
      {/* Texto forzado en blanco grande */}
      <span className="text-[10px] font-bold text-white z-10">
        {hero.alias?.substring(0, 3) || "???"}
      </span>
    </div>
  )
}

// --- SUB-COMPONENT: MAP SVG ---
const BunkerMapSVG: React.FC<{ onBack: () => void; onOpenDatabase: () => void }> = ({ onBack, onOpenDatabase }) => (
  <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className="opacity-40">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0e7490" strokeWidth="0.5" opacity="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
    {/* Estructura básica para referencia */}
    <rect x="50" y="50" width="900" height="500" fill="none" stroke="cyan" strokeWidth="2" />
    <text x="500" y="300" textAnchor="middle" fill="cyan" fontSize="20">MAPA RENDERIZADO</text>
  </svg>
)

// --- MAIN COMPONENT ---
export const BunkerInterior: React.FC<BunkerInteriorProps> = ({
  heroes = [], // Default a array vacío para evitar crash
  missions,
  onAssign,
  onUnassign,
  onAddHero,
  onToggleObjective,
  onBack,
  language,
  isEditorMode,
}) => {
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null)
  
  // LOG CRÍTICO: ¿Qué datos están llegando realmente?
  console.log("--- BUNKER RENDER LOOP ---");
  console.log("Cantidad de Héroes:", heroes.length);
  if (heroes.length > 0) {
    console.log("Primer Héroe:", heroes[0]);
  }

  // --- HÉROE DE PRUEBA FORZADO ---
  // Este héroe se insertará manualmente para comprobar si el sistema gráfico funciona
  const testHero: Hero = {
    id: "TEST_999",
    name: "TEST HERO",
    alias: "TEST",
    status: "AVAILABLE",
    class: "BRAWLER",
    stats: { strength: 10, agility: 10, intellect: 10 },
    bio: "I am a test.",
    objectives: [],
    completedObjectiveIndices: [],
    assignedMissionId: null
  };

  // Combinamos los héroes reales con el de prueba para ver si AL MENOS sale el de prueba
  const displayHeroes = [...heroes, testHero];

  return (
    // AÑADIDO: min-h-screen y borde rojo para ver si el contenedor colapsa
    <div className="w-full h-full min-h-[600px] bg-slate-950 font-mono relative overflow-hidden select-none border-4 border-dashed border-red-900/30">
      
      {/* DEBUG OVERLAY: Muestra info en pantalla */}
      <DebugOverlay heroesCount={heroes.length} containerSize="min-h-600px forced" />

      {/* CAPA 1: MAPA (z-0) */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <BunkerMapSVG onBack={onBack} onOpenDatabase={() => {}} />
      </div>

      {/* CAPA 2: TOKENS (z-10) - Borde VERDE para depurar área de tokens */}
      <div className="absolute inset-0 z-10 pointer-events-none border-2 border-green-500/20">
        {displayHeroes.map((hero) => (
          <HeroToken 
            key={hero.id} 
            hero={hero} 
            onClick={() => {
              console.log("Click en héroe:", hero.id);
              setSelectedHeroId(hero.id);
            }} 
          />
        ))}
      </div>

      {/* CAPA 3: MODAL (Solo para probar click) */}
      {selectedHeroId && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80">
          <div className="bg-slate-900 p-8 border border-cyan-500 text-white">
            <h2 className="text-2xl font-bold mb-4">¡FUNCIONA!</h2>
            <p>Has seleccionado al ID: {selectedHeroId}</p>
            <button 
              className="mt-4 px-4 py-2 bg-red-600 rounded"
              onClick={() => setSelectedHeroId(null)}
            >
              CERRAR
            </button>
          </div>
        </div>
      )}
    </div>
  )
}