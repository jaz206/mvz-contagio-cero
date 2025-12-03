"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { translations, type Language } from "../translations"
import type { Hero, Mission, HeroClass, HeroTemplate } from "../types"
import { getHeroTemplates, seedHeroTemplates, updateHeroTemplate } from "../services/dbService"

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

// ... CerebroScanner ...
const CerebroScanner = ({ status }: { status: "SEARCHING" | "LOCKED" }) => {
  return (
    <div
      className={`w-full h-24 bg-slate-950 border relative overflow-hidden flex items-center justify-center p-2 transition-all duration-500 ${status === "LOCKED" ? "border-emerald-600 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]" : "border-cyan-900"}`}
    >
      <div
        className={`absolute inset-0 border rounded-full m-1 opacity-30 ${status === "LOCKED" ? "border-emerald-500" : "border-cyan-900"}`}
      ></div>
      <div
        className={`absolute inset-0 border rounded-full m-6 opacity-20 ${status === "LOCKED" ? "border-emerald-500" : "border-cyan-800"}`}
      ></div>
      {status === "SEARCHING" ? (
        <div className="absolute w-full h-[2px] bg-cyan-500/50 top-1/2 left-0 animate-[spin_3s_linear_infinite] shadow-[0_0_10px_#06b6d4]"></div>
      ) : (
        <>
          <div className="absolute w-full h-[1px] bg-emerald-500/50 top-1/2 left-0"></div>
          <div className="absolute h-full w-[1px] bg-emerald-500/50 top-0 left-1/2"></div>
          <div className="absolute w-12 h-12 border-2 border-emerald-500 rounded-full animate-pulse"></div>
        </>
      )}
      <div
        className={`text-[8px] font-mono z-10 flex flex-col items-center ${status === "LOCKED" ? "text-emerald-400" : "text-cyan-600"}`}
      >
        <div className="tracking-widest font-bold">CEREBRO SCANNER</div>
        <div className={`mt-1 ${status === "SEARCHING" ? "animate-pulse" : ""}`}>
          {status === "SEARCHING" ? "SEARCHING GLOBAL FEED..." : "SIGNAL LOCKED // CONFIRMED"}
        </div>
      </div>
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, ${status === "LOCKED" ? "#10b981" : "#06b6d4"} 1px, transparent 1px)`,
          backgroundSize: "10px 10px",
        }}
      ></div>
    </div>
  )
}

// Hero Token on the Map
const HeroToken: React.FC<{ hero: Hero; onClick: () => void }> = ({ hero, onClick }) => {
  // FIX: Initialize position at center to ensure visibility before effect runs
  const [pos, setPos] = useState({ top: 50, left: 50 })
  const [animationDuration] = useState(Math.random() * 2 + 2)
  const [idleDuration] = useState(Math.random() * 3 + 1)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    let minX = 0,
      maxX = 100,
      minY = 0,
      maxY = 100

    switch (hero.status) {
      case "AVAILABLE":
        minX = 10
        maxX = 25
        minY = 20
        maxY = 80
        break
      case "DEPLOYED":
        minX = 75
        maxX = 90
        minY = 10
        maxY = 40
        break
      case "INJURED":
        minX = 75
        maxX = 90
        minY = 60
        maxY = 90
        break
      default:
        return
    }

    const moveToken = () => {
      const nextPos = {
        left: Math.random() * (maxX - minX) + minX,
        top: Math.random() * (maxY - minY) + minY,
      }
      setPos(nextPos)
    }

    const initialTimer = setTimeout(() => {
      moveToken()
    }, 100)

    const interval = setInterval(
      () => {
        moveToken()
      },
      (animationDuration + idleDuration) * 1000,
    )

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [hero.status, animationDuration, idleDuration])

  if (hero.status === "MIA") return null

  let colorClass = "border-cyan-500 shadow-cyan-500/50"
  if (hero.status === "INJURED") colorClass = "border-red-500 shadow-red-500/50"
  if (hero.status === "DEPLOYED") colorClass = "border-yellow-500 shadow-yellow-500/50"

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`absolute w-12 h-12 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform duration-300 z-50 flex items-center justify-center shadow-[0_0_15px] ${colorClass} pointer-events-auto bg-slate-900`}
      style={{
        left: `${pos.left}%`,
        top: `${pos.top}%`,
        transform: `translate(-50%, -50%)`,
        transition: `all ${animationDuration}s ease-in-out ${idleDuration}s`,
        display: "flex",
      }}
      title={`${hero.alias} [${hero.status}]`}
    >
      {hero.imageUrl && !imageError ? (
        <img
          src={hero.imageUrl || "/placeholder.svg"}
          alt={hero.alias}
          className={`w-full h-full rounded-full object-cover pointer-events-none relative z-10 transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => {
            console.log("[v0] Image loaded successfully:", hero.alias)
            setImageLoaded(true)
          }}
          onError={(e) => {
            console.log("[v0] Image failed to load:", hero.imageUrl, "for hero:", hero.alias)
            setImageError(true)
            e.currentTarget.style.display = "none"
          }}
        />
      ) : null}

      <span
        className={`text-[10px] font-bold text-white pointer-events-none z-0 transition-opacity duration-300 ${imageLoaded ? "opacity-0" : "opacity-100"}`}
      >
        {hero.alias ? hero.alias.substring(0, 2) : "??"}
      </span>

      <div
        className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-black pointer-events-none z-20 ${hero.status === "AVAILABLE" ? "bg-emerald-500" : hero.status === "INJURED" ? "bg-red-600" : "bg-yellow-400"}`}
      ></div>
    </div>
  )
}

export const BunkerInterior: React.FC<BunkerInteriorProps> = ({
  heroes,
  missions,
  onAssign,
  onUnassign,
  onAddHero,
  onToggleObjective,
  onBack,
  language,
  playerAlignment,
  isEditorMode,
}) => {
  // ... (State declarations same as before) ...
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showRecruitModal, setShowRecruitModal] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

  const [dbTemplates, setDbTemplates] = useState<HeroTemplate[]>([])
  const [isLoadingDb, setIsLoadingDb] = useState(false)
  const [seedStatus, setSeedStatus] = useState<"idle" | "success" | "error">("idle")
  const [isEditingExisting, setIsEditingExisting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [recruitForm, setRecruitForm] = useState({
    templateId: "",
    name: "",
    alias: "",
    class: "BRAWLER" as HeroClass,
    bio: "",
    currentStory: "",
    objectives: [] as string[],
    imageUrl: "",
    str: 5,
    agi: 5,
    int: 5,
  })

  const t = translations[language]
  const selectedHero = heroes.find((h) => h.id === selectedHeroId)

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingDb(true)
      const templates = await getHeroTemplates()
      setDbTemplates(templates)
      setIsLoadingDb(false)
    }
    fetchTemplates()
  }, [])

  const handleSelectTemplate = (templateId: string) => {
    const template = dbTemplates.find((h) => h.id === templateId)
    if (template) {
      const tHero = t.heroes[templateId as keyof typeof t.heroes]
      setRecruitForm({
        templateId: templateId,
        name: template.defaultName,
        alias: tHero ? tHero.alias : template.alias || template.defaultName.toUpperCase(),
        class: template.defaultClass,
        bio: tHero ? tHero.bio : template.bio || "No bio available",
        currentStory: template.currentStory || "",
        objectives: template.objectives || [],
        imageUrl: template.imageUrl,
        str: template.defaultStats.strength,
        agi: template.defaultStats.agility,
        int: template.defaultStats.intellect,
      })
    }
  }

  const handleEditClick = () => {
    if (!selectedHero) return
    setRecruitForm({
      templateId: selectedHero.templateId || "",
      name: selectedHero.name,
      alias: selectedHero.alias,
      class: selectedHero.class,
      bio: selectedHero.bio,
      currentStory: selectedHero.currentStory || "",
      objectives: selectedHero.objectives || [],
      imageUrl: selectedHero.imageUrl || "",
      str: selectedHero.stats.strength,
      agi: selectedHero.stats.agility,
      int: selectedHero.stats.intellect,
    })
    setIsEditingExisting(true)
    setShowRecruitModal(true)
    setSelectedHeroId(null)
  }

  const handleRecruitSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditingExisting && recruitForm.templateId) {
      const updateData: Partial<HeroTemplate> = {
        defaultName: recruitForm.name,
        alias: recruitForm.alias,
        defaultClass: recruitForm.class,
        bio: recruitForm.bio,
        currentStory: recruitForm.currentStory,
        objectives: recruitForm.objectives,
        imageUrl: recruitForm.imageUrl,
        defaultStats: { strength: recruitForm.str, agility: recruitForm.agi, intellect: recruitForm.int },
      }
      await updateHeroTemplate(recruitForm.templateId, updateData)
      alert("DATABASE UPDATED.")
    } else {
      const newHero: Hero = {
        id: `custom_${Date.now()}`,
        templateId: recruitForm.templateId || undefined,
        name: recruitForm.name || "UNKNOWN",
        alias: recruitForm.alias || "AGENT",
        class: recruitForm.class,
        bio: recruitForm.bio,
        currentStory: recruitForm.currentStory,
        objectives: recruitForm.objectives,
        completedObjectiveIndices: [],
        imageUrl: recruitForm.imageUrl,
        status: "AVAILABLE",
        stats: { strength: recruitForm.str, agility: recruitForm.agi, intellect: recruitForm.int },
        assignedMissionId: null,
      }
      onAddHero(newHero)
    }
    setShowRecruitModal(false)
    setIsEditingExisting(false)
    setSearchTerm("")
  }

  const handleSeedDatabase = async () => {
    try {
      setSeedStatus("idle")
      await seedHeroTemplates()
      setSeedStatus("success")
      const templates = await getHeroTemplates()
      setDbTemplates(templates)
    } catch (e) {
      console.error(e)
      setSeedStatus("error")
    }
  }

  const handleAssignClick = (missionId: string) => {
    if (!selectedHero) return
    const success = onAssign(selectedHero.id, missionId)
    if (success) {
      setShowAssignModal(false)
      setAssignError(null)
    } else {
      setAssignError(t.bunker.maxHeroes)
    }
  }

  const assignedMissionName = selectedHero?.assignedMissionId
    ? missions.find((m) => m.id === selectedHero.assignedMissionId)?.title
    : null
  const availableTemplates = dbTemplates.filter((template) => {
    if (!isEditingExisting) {
      const exists = heroes.some((h) => h.templateId === template.id)
      if (exists) return false
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (template.alias || template.defaultName).toLowerCase().includes(term)
    }
    return true
  })

  return (
    <div className="w-full h-full bg-slate-950 font-mono relative overflow-hidden select-none">
      {/* BUNKER BLUEPRINT SVG BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid slice"
          className="opacity-40"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0e7490" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* ROOMS... */}
          <path d="M 50 100 L 300 100 L 300 500 L 50 500 Z" fill="none" stroke="#06b6d4" strokeWidth="2" />
          <text x="175" y="530" textAnchor="middle" fill="#06b6d4" fontSize="14" fontWeight="bold" letterSpacing="2">
            BARRACKS
          </text>

          <path d="M 350 50 L 650 50 L 650 300 L 350 300 Z" fill="none" stroke="#06b6d4" strokeWidth="2" />
          <text x="500" y="320" textAnchor="middle" fill="#06b6d4" fontSize="14" fontWeight="bold" letterSpacing="2">
            COMMAND
          </text>

          <g className="cursor-pointer hover:opacity-80 transition-opacity" onClick={onBack}>
            <rect x="380" y="70" width="240" height="120" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
            <path
              d="M 390 100 L 410 90 L 450 90 L 470 100 L 580 100 L 600 80 L 610 90 L 600 130 L 580 150 L 550 160 L 530 150 L 500 170 L 480 160 L 450 160 L 430 140 L 400 140 L 390 120 Z"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
              opacity="0.7"
            />
          </g>

          <path d="M 700 50 L 950 50 L 950 300 L 700 300 Z" fill="none" stroke="#eab308" strokeWidth="2" />
          <text x="825" y="320" textAnchor="middle" fill="#eab308" fontSize="14" fontWeight="bold" letterSpacing="2">
            HANGAR
          </text>

          <path d="M 700 350 L 950 350 L 950 550 L 700 550 Z" fill="none" stroke="#ef4444" strokeWidth="2" />
          <text x="825" y="570" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold" letterSpacing="2">
            MEDBAY
          </text>

          <g
            className="cursor-pointer hover:opacity-80"
            onClick={() => {
              setIsEditingExisting(false)
              setShowRecruitModal(true)
            }}
          >
            <rect x="450" y="450" width="100" height="60" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
            <text x="500" y="485" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold">
              DATABASE
            </text>
          </g>
        </svg>
      </div>

      {/* HERO TOKENS LAYER - Ensure High Z-Index and explicit placement */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        <div className="w-full h-full relative pointer-events-none">
          {heroes.map((hero) => (
            <HeroToken key={hero.id} hero={hero} onClick={() => setSelectedHeroId(hero.id)} />
          ))}
        </div>
      </div>

      {/* HERO DETAIL MODAL (Overlay) */}
      {selectedHeroId && selectedHero && (
        <div
          className="absolute inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 animate-fade-in"
          onClick={() => setSelectedHeroId(null)}
        >
          <div
            className="w-full max-w-4xl bg-slate-900 border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col max-h-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-cyan-800 bg-cyan-900/20 flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-[0.2em] text-cyan-200 uppercase">
                {t.file.title} // {selectedHero.alias}
              </h2>
              <button onClick={() => setSelectedHeroId(null)} className="text-cyan-500 hover:text-white">
                ✕
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-64 flex flex-col gap-4 shrink-0">
                  <div
                    className="w-full aspect-[3/4] bg-slate-950 border-2 border-cyan-700 relative group overflow-hidden shadow-inner cursor-zoom-in"
                    onClick={() => setZoomedImage(selectedHero.imageUrl || "")}
                  >
                    {selectedHero.imageUrl ? (
                      <img src={selectedHero.imageUrl || "/placeholder.svg"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cyan-900 flex-col gap-2">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <CerebroScanner status="LOCKED" />
                  {isEditorMode && selectedHero.templateId && (
                    <button
                      onClick={handleEditClick}
                      className="w-full py-2 bg-blue-900/50 hover:bg-blue-800 text-blue-300 text-xs font-bold border border-blue-700 uppercase tracking-wider"
                    >
                      EDIT DATA (DB)
                    </button>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-6">
                  <div className="flex justify-between items-end border-b border-cyan-900 pb-2">
                    <div>
                      <div className="text-xs text-cyan-600 font-bold uppercase">{t.recruit.name}</div>
                      <div className="text-2xl text-white font-bold tracking-tight leading-none">
                        {selectedHero.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-cyan-600 font-bold uppercase">{t.bunker.status}</div>
                      <div
                        className={`text-lg font-bold ${selectedHero.status === "AVAILABLE" ? "text-emerald-400" : selectedHero.status === "INJURED" ? "text-red-500" : "text-yellow-400"}`}
                      >
                        {selectedHero.status}
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-4 border border-cyan-900 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-800">
                    <p className="text-sm text-gray-300 leading-relaxed italic">"{selectedHero.bio}"</p>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-yellow-900/10 border border-yellow-900/30 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-900">
                      <h4 className="text-xs font-bold text-yellow-500 mb-2 border-b border-yellow-900/30 pb-1">
                        {t.bunker.currentStory}
                      </h4>
                      <p className="text-xs text-yellow-100/80 leading-relaxed">
                        {selectedHero.currentStory || "CLASSIFIED"}
                      </p>
                    </div>
                    <div className="bg-emerald-900/10 border border-emerald-900/30 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-900">
                      <h4 className="text-xs font-bold text-emerald-500 mb-2 border-b border-emerald-900/30 pb-1">
                        {t.bunker.objectives}
                      </h4>
                      {selectedHero.objectives && selectedHero.objectives.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedHero.objectives.map((obj, i) => (
                            <li key={i} className="flex gap-2 items-start">
                              <input
                                type="checkbox"
                                checked={selectedHero.completedObjectiveIndices?.includes(i)}
                                onChange={() => onToggleObjective(selectedHero.id, i)}
                                className="mt-0.5 h-3 w-3 appearance-none border border-emerald-500 bg-slate-900 checked:bg-emerald-500 cursor-pointer shrink-0"
                              />
                              <span
                                className={`text-xs ${selectedHero.completedObjectiveIndices?.includes(i) ? "text-emerald-500 line-through" : "text-emerald-100/90"}`}
                              >
                                {obj}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-xs text-gray-500 italic">NONE</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            <div className="p-4 border-t border-cyan-800 bg-cyan-900/20 flex justify-between items-center">
              <div className="text-xs text-cyan-600">ID: {selectedHero.id}</div>
              <div>
                {selectedHero.status === "DEPLOYED" ? (
                  <button
                    onClick={() => onUnassign(selectedHero.id)}
                    className="px-6 py-2 bg-red-900/50 border border-red-900 text-red-500 hover:bg-red-900/20 text-xs font-bold tracking-widest"
                  >
                    {t.bunker.unassign}
                  </button>
                ) : (
                  <button
                    disabled={selectedHero.status === "INJURED"}
                    onClick={() => {
                      setAssignError(null)
                      setShowAssignModal(true)
                    }}
                    className={`px-6 py-2 font-bold text-xs tracking-widest border transition-all ${selectedHero.status === "INJURED" ? "bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed" : "bg-cyan-700 border-cyan-500 text-white hover:bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.4)]"} disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                  >
                    {t.bunker.assign}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )

      {/* ASSIGN MODAL & RECRUIT MODAL ... */}
      {/* ... (Keep existing modals unchanged) ... */}
      {showAssignModal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <div className="bg-cyan-900/30 p-4 border-b border-cyan-700 flex justify-between items-center">
              <h3 className="text-cyan-300 font-bold tracking-widest">{t.bunker.assignModalTitle}</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-cyan-500 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {assignError && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 text-xs p-2 text-center mb-2 font-bold animate-pulse">
                  {assignError}
                </div>
              )}
              {missions.length === 0 ? (
                <div className="text-center text-gray-500 py-8 italic">{t.bunker.noMissions}</div>
              ) : (
                missions.map((mission) => (
                  <div
                    key={mission.id}
                    onClick={() => handleAssignClick(mission.id)}
                    className="border border-cyan-900/50 bg-slate-950/50 hover:bg-cyan-900/20 hover:border-cyan-500 cursor-pointer p-3 group transition-all"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-bold text-cyan-200 group-hover:text-white text-sm">{mission.title}</div>
                      <div className="text-[10px] text-red-500 border border-red-900 px-1">{mission.threatLevel}</div>
                    </div>
                    <div className="text-[10px] text-gray-400">LOC: {mission.location.state}</div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-cyan-900 bg-slate-900 flex justify-end">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-xs text-gray-400 hover:text-white"
              >
                {t.bunker.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRecruitModal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-5xl bg-slate-900 border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col">
            <div className="bg-cyan-900/40 p-4 border-b border-cyan-600 flex justify-between items-center shrink-0">
              <h3 className="text-cyan-300 font-bold tracking-widest text-lg">
                {isEditingExisting ? "EDITING DATABASE ENTRY" : t.recruit.title}
              </h3>
              <button onClick={() => setShowRecruitModal(false)} className="text-cyan-500 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecruitSubmit} className="flex-1 p-6 flex flex-col gap-4 overflow-hidden">
              {!isEditingExisting && (
                <div className="w-full pb-4 border-b border-cyan-900 shrink-0 space-y-2">
                  <label className="block text-[10px] text-cyan-400 font-bold tracking-widest">
                    {t.recruit.selectDb}
                  </label>
                  <input
                    type="text"
                    placeholder="SEARCH DATABASE (TYPE NAME OR ALIAS)..."
                    className="w-full bg-slate-950 border border-cyan-700 p-2 text-cyan-300 font-mono text-xs focus:border-cyan-400 focus:outline-none mb-2 placeholder-cyan-800 uppercase"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="w-full max-h-40 bg-slate-950 border border-cyan-800 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-700">
                    {isLoadingDb ? (
                      <div className="p-2 text-xs text-cyan-700 animate-pulse">{t.recruit.loadingDb}</div>
                    ) : availableTemplates.length === 0 ? (
                      <div className="p-2 text-xs text-gray-600 italic">NO MATCHES FOUND</div>
                    ) : (
                      availableTemplates.map((h) => {
                        const translation = t.heroes[h.id as keyof typeof t.heroes]
                        const displayName = translation?.alias || h.alias || h.defaultName
                        const realName = h.defaultName
                        const isSelected = recruitForm.templateId === h.id
                        return (
                          <div
                            key={h.id}
                            onClick={() => handleSelectTemplate(h.id)}
                            className={`p-2 text-xs cursor-pointer flex justify-between items-center border-b border-cyan-900/30 last:border-0 hover:bg-cyan-900/30 transition-colors ${isSelected ? "bg-cyan-900/50 text-white" : "text-cyan-400"}`}
                          >
                            <span className="font-bold tracking-wide uppercase">{displayName}</span>
                            <span className="text-[10px] opacity-70">{realName}</span>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
                <div className="w-full md:w-[200px] flex flex-col gap-3 shrink-0">
                  <div
                    className="w-full aspect-[3/4] bg-slate-950 border-2 border-cyan-800 relative group cursor-zoom-in overflow-hidden shadow-inner"
                    onClick={() => recruitForm.imageUrl && setZoomedImage(recruitForm.imageUrl)}
                  >
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-500 z-10"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-500 z-10"></div>
                    {recruitForm.imageUrl ? (
                      <img
                        src={recruitForm.imageUrl || "/placeholder.svg"}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500"
                        alt="Preview"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cyan-900 flex-col gap-2">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <CerebroScanner status="SEARCHING" />
                </div>

                <div className="flex-1 flex flex-col gap-4 min-h-0">
                  <div className="flex gap-4 border-b border-cyan-900 pb-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-cyan-700 font-bold uppercase">{t.recruit.alias}</label>
                      <div className="text-2xl text-white font-bold tracking-tight leading-none">
                        {recruitForm.alias || "---"}
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <label className="text-[10px] text-cyan-700 font-bold uppercase">{t.recruit.name}</label>
                      <div className="text-lg text-cyan-500 leading-none">{recruitForm.name || "---"}</div>
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-3 border border-cyan-900/50 flex-none h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900">
                    <p className="text-xs text-gray-400 leading-relaxed">{recruitForm.bio || "NO DATA AVAILABLE"}</p>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                    <div className="bg-yellow-900/5 border border-yellow-900/30 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-900">
                      <h4 className="text-[10px] text-yellow-600 font-bold uppercase mb-1 border-b border-yellow-900/30 pb-1">
                        {t.bunker.currentStory}
                      </h4>
                      <p className="text-[10px] text-yellow-100/70 leading-relaxed">
                        {recruitForm.currentStory || "PENDING UPDATE..."}
                      </p>
                    </div>
                    <div className="bg-emerald-900/5 border border-emerald-900/30 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-900">
                      <h4 className="text-[10px] text-emerald-600 font-bold uppercase mb-1 border-b border-emerald-900/30 pb-1">
                        {t.bunker.objectives}
                      </h4>
                      {recruitForm.objectives.length > 0 ? (
                        <ul className="space-y-1">
                          {recruitForm.objectives.map((obj, i) => (
                            <li key={i} className="text-[10px] text-emerald-100/70 flex gap-1 items-start">
                              <span className="text-emerald-500/50">›</span> {obj}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-[10px] text-emerald-900/50 italic">NO OBJECTIVES ASSIGNED</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-cyan-800 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={handleSeedDatabase}
                  className="text-[9px] text-cyan-900 hover:text-cyan-600 uppercase transition-colors"
                >
                  {seedStatus === "idle"
                    ? t.recruit.adminSeed
                    : seedStatus === "success"
                      ? t.recruit.seedSuccess
                      : "ERROR"}
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRecruitModal(false)}
                    className="px-4 py-2 border border-red-900 text-red-500 hover:bg-red-900/20 text-xs font-bold tracking-widest"
                  >
                    {t.bunker.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={!recruitForm.name || !recruitForm.alias}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-widest text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isEditingExisting ? "UPDATE DB" : t.recruit.submit}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-md"
          onClick={() => setZoomedImage(null)}
        >
          <img
            src={zoomedImage || "/placeholder.svg"}
            alt="Zoomed Asset"
            className="max-h-[90vh] max-w-[90vw] border-4 border-cyan-500 shadow-[0_0_100px_rgba(6,182,212,0.5)] object-contain"
          />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-cyan-500 text-xs tracking-[0.5em] animate-pulse">
            CLICK TO CLOSE
          </div>
        </div>
      )}
    </div>
  )
}
