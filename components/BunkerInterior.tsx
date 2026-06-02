import React, { useState, useMemo, useEffect } from "react";
import { getHeroLoreEntry } from "../data/heroLore";
import { translations, Language } from "../translations";
import { Hero, Mission, HeroClass, HeroTemplate, I18nString } from "../types";
import { hasAnyHeroWithTransformRule } from "../services/heroVariantRuleService";
import { preferGithubCharacterImage } from "../services/characterGithubImageService";
import { getLocalizedPlayableHeroSheetForHero, getLocalizedPlayableHeroSheetsForHero } from "../services/playableHeroSheetService";

// ... utilities ...
const resolveI18n = (text: I18nString | undefined, lang: Language): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[lang] || text['es'] || '';
};
const isSpanishLanguage = (language: Language | string) => String(language).toLowerCase().startsWith('es');
import { getHeroTemplates } from "../services/heroService";
import { RecruitModal } from "./RecruitModal";
import { ConfirmationModal } from "./ConfirmationModal";

interface BunkerInteriorProps {
    heroes: Hero[];
    missions: Mission[];
    completedMissions?: Mission[];
    completedMissionIds?: Set<string>;
    onAssign: (heroId: string, missionId: string) => boolean;
    onUnassign: (heroId: string) => void;
    onAddHero: (hero: Hero) => void;
    onToggleObjective: (heroId: string, objectiveIndex: number) => void;
    onBack: () => void;
    language: Language;
    playerAlignment?: "ALIVE" | "ZOMBIE" | null;
    isEditorMode?: boolean;
    onTransformHero?: (heroId: string, targetAlignment: 'ALIVE' | 'ZOMBIE') => void;
    onTickerUpdate?: (message: string) => void;
    omegaCylinders?: number;
    onSearchAllies?: () => void;
    ownedExpansions: Set<string>;
}

// --- UTILIDADES ---
const normalizeAlias = (alias: string) => {
    return alias.toLowerCase()
        .replace(/\(z\)/g, '')
        .replace(/\(zombie\)/g, '')
        .replace(/\(artist\)/g, '')
        .replace(/\(old man\)/g, '')
        .trim();
};

const getSafeDossierText = (value: string | undefined, fallback: string) => {
    const normalized = (value || '').trim();
    return normalized || fallback;
};

const getPreferredDossierText = (
    primary: I18nString | undefined,
    lore: I18nString | undefined,
    language: Language,
    fallback: string
) => {
    const primaryText = resolveI18n(primary, language).trim();
    const loreText = resolveI18n(lore, language).trim();

    if (primaryText.length > 80) return primaryText;
    if (loreText.length > 80) return loreText;

    return primaryText || loreText || fallback;
};

const getHeroStatusLabel = (status: Hero['status'], language: Language) => {
    const labels = {
        AVAILABLE: language === 'es' ? 'DISPONIBLE' : 'AVAILABLE',
        DEPLOYED: language === 'es' ? 'DESPLEGADO' : 'DEPLOYED',
        INJURED: language === 'es' ? 'HERIDO' : 'INJURED',
        CAPTURED: language === 'es' ? 'CAPTURADO' : 'CAPTURED'
    };

    return labels[status] || status;
};

// --- COMPONENTE: BARRA TÃCTICA ---
const TacticalBar = ({ label, shieldVal, enemyVal, enemyColor }: { label: string, shieldVal: number, enemyVal: number, enemyColor: string }) => {
    const total = shieldVal + enemyVal;
    const shieldPct = total === 0 ? 50 : (shieldVal / total) * 100;
    const enemyBg = enemyColor.replace('text-', 'bg-');
    return (
        <div className="mb-4 group">
            <div className="flex justify-between text-[9px] font-black mb-1 uppercase tracking-wider px-1">
                <span className="text-cyan-400 drop-shadow-[0_0_3px_rgba(6,182,212,0.8)]">S.H.I.E.L.D. <span className="text-xs">[{shieldVal}]</span></span>
                <span className={`${enemyColor} drop-shadow-[0_0_3px_currentColor]`}>{label} <span className="text-xs">[{enemyVal}]</span></span>
            </div>
            <div className="h-4 w-full bg-slate-950 border border-slate-700 relative overflow-hidden flex skew-x-[-10deg]">
                <div className="h-full bg-gradient-to-r from-cyan-900 to-cyan-500 transition-all duration-1000 ease-out relative border-r-2 border-white" style={{ width: `${shieldPct}%` }}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30"></div>
                </div>
                <div className={`flex-1 h-full bg-gradient-to-l from-slate-900 to-${enemyBg.split('-')[1]}-600 opacity-80 relative`}>
                    <div className={`absolute inset-0 ${enemyBg} opacity-40`}></div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE: CARTA DE HÃ‰ROE ---
const HeroCard = ({ hero, onClick, actionIcon, onAction, actionMuted = false }: { hero: Hero, onClick: () => void, actionIcon?: string, onAction?: () => void, actionMuted?: boolean }) => {
    const statusColors = {
        AVAILABLE: 'border-emerald-500 shadow-emerald-500/20',
        DEPLOYED: 'border-yellow-500 shadow-yellow-500/20',
        INJURED: 'border-red-500 shadow-red-500/20',
        CAPTURED: 'border-red-900 shadow-red-900/20 grayscale'
    };
    const colorClass = statusColors[hero.status] || 'border-slate-600';

    // Estilo dinÃ¡mico para la imagen
    const imgStyle = hero.imageParams ? {
        transform: `scale(${hero.imageParams.scale}) translate(${hero.imageParams.x}%, ${hero.imageParams.y}%)`
    } : {};

    return (
        <div onClick={onClick} className={`group relative h-28 w-full cursor-pointer overflow-hidden border-l-4 bg-slate-900/50 transition-all duration-300 hover:bg-slate-800 hover:scale-[1.02] hover:z-10 ${colorClass} border-b border-slate-800`}>
            <div className="absolute inset-0 overflow-hidden">
                <img
                    src={hero.imageUrl}
                    alt={hero.alias}
                    className="w-full h-full object-cover object-top opacity-50 group-hover:opacity-80 transition-all duration-500"
                    style={imgStyle}
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none"></div>
            </div>
            <div className="absolute inset-0 p-4 flex flex-col justify-center z-10 pl-6 pointer-events-none">
                <h3 className="text-lg font-black uppercase tracking-wider truncate text-white group-hover:text-cyan-400 drop-shadow-md" style={{ fontFamily: 'Impact, sans-serif' }}>{hero.alias}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-bold bg-black/80 px-2 py-0.5 border border-slate-700 text-cyan-500 tracking-widest uppercase">{hero.class}</span>
                    {hero.status !== 'AVAILABLE' && (<span className={`text-[8px] font-bold px-2 py-0.5 border uppercase tracking-widest ${hero.status === 'DEPLOYED' ? 'bg-yellow-900/50 text-yellow-500 border-yellow-700' : 'bg-red-900/50 text-red-500 border-red-700'}`}>{hero.status}</span>)}
                </div>
            </div>
            {actionIcon && onAction && (
                <button
                    onClick={(e) => { e.stopPropagation(); onAction(); }}
                    className={`absolute right-2 top-2 w-8 h-8 flex items-center justify-center border text-white transition-all rounded-sm z-20 backdrop-blur-sm pointer-events-auto ${actionMuted ? 'bg-slate-900/80 border-amber-700/60 text-amber-300 hover:bg-amber-900/40' : 'bg-black/50 border-white/20 hover:bg-red-600 hover:border-red-500'}`}
                >
                    {actionIcon}
                </button>
            )}
            <div className="absolute inset-0 bg-scan opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity"></div>
        </div>
    );
};

// --- COMPONENTE: MONITOR BIOMÃ‰TRICO ---
const BiometricMonitor = ({ alignment, compact = false }: { alignment: 'ALIVE' | 'ZOMBIE', compact?: boolean }) => {
    const isZombie = alignment === 'ZOMBIE';
    const color = isZombie ? '#84cc16' : '#06b6d4';

    return (
        <div className={`flex flex-col gap-${compact ? '2' : '4'} bg-black/40 ${compact ? 'p-2.5' : 'p-4'} border border-slate-800 rounded relative overflow-hidden`}>
            <div className="flex justify-between items-center mb-1">
                <span className={`text-[9px] font-bold ${isZombie ? 'text-lime-500' : 'text-cyan-500'} tracking-widest uppercase`}>
                    {isZombie ? 'CORRUPTION_LEVEL' : 'BIOMETRIC_STABILITY'}
                </span>
                <span className={`text-[10px] text-white font-mono animate-pulse ${compact ? 'hidden sm:inline' : ''}`}>
                    {isZombie ? 'STABLE_DECAY' : 'SIGNALS_OPTIMAL'}
                </span>
            </div>

            {/* ECG Pulse SVG */}
            <div className={`${compact ? 'h-10' : 'h-16'} w-full relative`}>
                <svg viewBox="0 0 100 40" className="w-full h-full opacity-60">
                    <path
                        d="M 0 20 L 20 20 L 25 10 L 30 30 L 35 20 L 50 20 L 55 5 L 60 35 L 65 20 L 80 20 L 85 10 L 90 30 L 95 20 L 100 20"
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        className="animate-ecg"
                    />
                </svg>
                <div className={`absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40`}></div>
            </div>

            {/* Diagnostic Bars */}
            <div className={`grid grid-cols-2 ${compact ? 'gap-2' : 'gap-4'}`}>
                <div className="space-y-1">
                    <div className="flex justify-between text-[8px] text-gray-500">
                        <span>{isZombie ? 'NECROSIS' : 'ANTIBODIES'}</span>
                        <span>{isZombie ? '88%' : '94%'}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${isZombie ? 'bg-lime-600' : 'bg-cyan-600'} animate-pulse`} style={{ width: isZombie ? '88%' : '94%' }}></div>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[8px] text-gray-500">
                        <span>DNA_STABILITY</span>
                        <span>{isZombie ? 'ERRATIC' : '99.9%'}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${isZombie ? 'bg-yellow-600' : 'bg-emerald-600'} animate-pulse`} style={{ width: '90%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BunkerInterior: React.FC<BunkerInteriorProps> = ({
    heroes, missions, completedMissions = [], completedMissionIds = new Set(), onAssign, onUnassign, onAddHero, onToggleObjective, onBack, language, playerAlignment, onTransformHero, onTickerUpdate, omegaCylinders = 0, onSearchAllies, ownedExpansions
}) => {
    const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
    const [heroDossierTab, setHeroDossierTab] = useState<'EXPEDIENTE' | 'HISTORIA' | 'PODERES'>('EXPEDIENTE');
    const [selectedHeroSheetIndex, setSelectedHeroSheetIndex] = useState(0);
    const [showRecruitModal, setShowRecruitModal] = useState(false);
    const [recruitModalMode, setRecruitModalMode] = useState<'RECRUIT' | 'CAPTURE'>('RECRUIT');
    const [dbTemplates, setDbTemplates] = useState<HeroTemplate[]>([]);
    const [viewingSheet, setViewingSheet] = useState<string | null>(null);
    const [canLeaveBunker, setCanLeaveBunker] = useState(false);
    const [selectedCampaignMissionId, setSelectedCampaignMissionId] = useState<string | null>(null);

    // ESTADO PARA EL MODAL DE CONFIRMACIÃ“N
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        type: 'CURE' | 'INFECT' | 'WARNING';
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', confirmText: '', type: 'WARNING', onConfirm: () => { } });

    const t = translations[language];
    const selectedHero = heroes.find(h => h.id === selectedHeroId);
    const selectedHeroLore = selectedHero ? getHeroLoreEntry(selectedHero.alias) : undefined;
    const selectedHeroImageUrl = selectedHero ? preferGithubCharacterImage(selectedHero.alias, selectedHero.alignment || 'ALIVE', selectedHero.imageUrl) : '';
    const selectedHeroSheets = selectedHero ? getLocalizedPlayableHeroSheetsForHero(selectedHero, language) : [];
    const selectedHeroPreferredSheet = selectedHero ? getLocalizedPlayableHeroSheetForHero(selectedHero, language) : undefined;
    const selectedHeroSheet = selectedHeroSheets[selectedHeroSheetIndex] || selectedHeroPreferredSheet || selectedHeroSheets[0];
    const heroDossierUi = {
        combatProfile: isSpanishLanguage(language) ? 'PERFIL DE COMBATE' : 'COMBAT PROFILE',
        fieldDossier: isSpanishLanguage(language) ? 'EXPEDIENTE DE CAMPO' : 'FIELD DOSSIER',
        series: isSpanishLanguage(language) ? 'Serie' : 'Series',
        class: isSpanishLanguage(language) ? 'CLASE' : 'CLASS',
        status: isSpanishLanguage(language) ? 'ESTADO' : 'STATUS',
        key: isSpanishLanguage(language) ? 'CLAVE' : 'CLEARANCE',
        evaluation: isSpanishLanguage(language) ? 'EVALUACION DE S.H.I.E.L.D.' : 'S.H.I.E.L.D. EVALUATION',
        access: isSpanishLanguage(language) ? 'ACCESO' : 'ACCESS',
        tabs: {
            dossier: isSpanishLanguage(language) ? 'Expediente' : 'Dossier',
            history: isSpanishLanguage(language) ? 'Historia' : 'History',
            powers: isSpanishLanguage(language) ? 'Poderes' : 'Powers'
        },
        abilityLabels: {
            blue: isSpanishLanguage(language) ? 'AZUL' : 'BLUE',
            yellow: isSpanishLanguage(language) ? 'AMARILLA' : 'YELLOW',
            orange: isSpanishLanguage(language) ? 'NARANJA' : 'ORANGE',
            red: isSpanishLanguage(language) ? 'ROJA' : 'RED'
        }
    };
    const dossierIsZombie = playerAlignment === 'ZOMBIE';
    const dossierAccentClass = dossierIsZombie ? 'text-lime-400' : 'text-cyan-400';
    const dossierBorderClass = dossierIsZombie ? 'border-lime-600' : 'border-cyan-600';
    const dossierPanelClass = dossierIsZombie ? 'border-lime-900/50 bg-lime-950/10' : 'border-cyan-900/50 bg-cyan-950/10';
    const dossierStamp = dossierIsZombie ? 'BIOHAZARD DOSSIER' : 'S.H.I.E.L.D. DOSSIER';
    const dossierHeader = dossierIsZombie ? 'ARCHIVO CONTAMINADO' : 'EXPEDIENTE OPERATIVO';
    const selectedHeroHistory = selectedHero ? getPreferredDossierText(
        selectedHero.origin,
        selectedHeroLore?.origin,
        language,
        isSpanishLanguage(language)
            ? 'Sin historial ampliado. Pendiente de revision por el Helitransporte.'
            : 'No extended history available. Pending Helicarrier review.'
    ) : '';
    const selectedHeroPowers = selectedHero ? getPreferredDossierText(
        selectedHero.bio,
        selectedHeroLore?.bio,
        language,
        isSpanishLanguage(language)
            ? 'No hay datos completos sobre habilidades activas. Expediente en revision.'
            : 'No complete data on active abilities. File under review.'
    ) : '';
    const selectedHeroAssessment = selectedHero ? getPreferredDossierText(
        selectedHero.currentStory,
        selectedHeroLore?.currentStory,
        language,
        dossierIsZombie
            ? (isSpanishLanguage(language)
                ? 'Riesgo de contaminacion extrema. Requiere vigilancia constante y protocolos de contencion reforzados.'
                : 'Extreme contamination risk. Constant surveillance and reinforced containment required.')
            : (isSpanishLanguage(language)
                ? 'Activo con valor tactico confirmado. Recomendado para operaciones de alto impacto y respuesta rapida.'
                : 'Confirmed tactical asset. Recommended for high-impact and rapid-response operations.')
    ) : '';

    const heroDossierAbilityCards = selectedHeroSheet ? [
        { key: 'blue', label: heroDossierUi.abilityLabels.blue, title: selectedHeroSheet.blueSkillName, text: selectedHeroSheet.blueSkillDescription, accent: 'text-cyan-300', border: 'border-cyan-900/60', glow: 'shadow-cyan-900/10' },
        { key: 'yellow', label: heroDossierUi.abilityLabels.yellow, title: selectedHeroSheet.yellowSkillName, text: selectedHeroSheet.yellowSkillDescription, accent: 'text-amber-300', border: 'border-amber-900/60', glow: 'shadow-amber-900/10' },
        { key: 'orange', label: heroDossierUi.abilityLabels.orange, title: selectedHeroSheet.orangeSkillName, text: selectedHeroSheet.orangeSkillDescription, accent: 'text-orange-300', border: 'border-orange-900/60', glow: 'shadow-orange-900/10' },
        { key: 'red', label: heroDossierUi.abilityLabels.red, title: selectedHeroSheet.redSkillName, text: selectedHeroSheet.redSkillDescription, accent: 'text-red-300', border: 'border-red-900/60', glow: 'shadow-red-900/10' },
    ] : [];

    const availableHeroes = heroes.filter((hero) => hero.status === 'AVAILABLE');
    const deployedHeroes = heroes.filter((hero) => hero.status === 'DEPLOYED');
    const capturedHeroes = heroes.filter((hero) => hero.status === 'CAPTURED');
    const completedCampaignMissions = useMemo(
        () => completedMissions,
        [completedMissions]
    );
    const selectedCampaignMission = useMemo(
        () => completedCampaignMissions.find((mission) => mission.id === selectedCampaignMissionId) || completedCampaignMissions[completedCampaignMissions.length - 1] || null,
        [completedCampaignMissions, selectedCampaignMissionId]
    );
    const selectedCampaignNarrative = selectedCampaignMission
        ? getPreferredDossierText(
            selectedCampaignMission.outcomeText ? { es: selectedCampaignMission.outcomeText, en: selectedCampaignMission.outcomeText } : undefined,
            undefined,
            language,
            selectedCampaignMission.description?.join('\n\n') || (isSpanishLanguage(language) ? 'Sin cronica disponible.' : 'No campaign chronicle available.')
        )
        : (isSpanishLanguage(language) ? 'Aun no hay misiones completadas.' : 'No completed missions yet.');
    const selectedCampaignObjectives = selectedCampaignMission?.objectives || [];

    useEffect(() => {
        if (selectedHeroId) {
            setHeroDossierTab('EXPEDIENTE');
            const nextIndex = selectedHeroPreferredSheet
                ? selectedHeroSheets.findIndex((sheet) => sheet.characterName === selectedHeroPreferredSheet.characterName && sheet.set === selectedHeroPreferredSheet.set)
                : 0;
            setSelectedHeroSheetIndex(nextIndex >= 0 ? nextIndex : 0);
        }
    }, [selectedHeroId, language, selectedHeroPreferredSheet?.characterName, selectedHeroPreferredSheet?.set, selectedHeroSheets.length]);

    useEffect(() => {
        if (!completedCampaignMissions.length) {
            setSelectedCampaignMissionId(null);
            return;
        }

        if (!selectedCampaignMissionId || !completedCampaignMissions.some((mission) => mission.id === selectedCampaignMissionId)) {
            setSelectedCampaignMissionId(completedCampaignMissions[completedCampaignMissions.length - 1].id);
        }
    }, [completedCampaignMissions, selectedCampaignMissionId]);

    const existingAliases = useMemo(() => {
        const aliases = new Set<string>();
        heroes.forEach(h => {
            aliases.add(normalizeAlias(h.alias));
        });
        return aliases;
    }, [heroes]);

    const threatAnalysis = {
        magneto: { shield: 2, enemy: 5, color: 'text-red-500' },
        kingpin: { shield: 4, enemy: 3, color: 'text-purple-500' },
        hulk: { shield: 1, enemy: 8, color: 'text-lime-500' },
        doom: { shield: 3, enemy: 4, color: 'text-cyan-500' }
    };

    const transformTargetAlignment = playerAlignment === 'ZOMBIE' ? 'ALIVE' : 'ZOMBIE';
    const hasTransformRuleAvailable = useMemo(
        () => hasAnyHeroWithTransformRule(heroes, transformTargetAlignment, dbTemplates, ownedExpansions),
        [dbTemplates, heroes, ownedExpansions, transformTargetAlignment]
    );

    const handleOpenRecruit = async (mode: 'RECRUIT' | 'CAPTURE' = 'RECRUIT') => {
        const templates = await getHeroTemplates();
        setDbTemplates(templates);
        setShowRecruitModal(true);
        setRecruitModalMode(mode);
    };

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const templates = await getHeroTemplates();
                setDbTemplates(templates);
            } catch (error) {
                console.error(error);
            }
        };

        loadTemplates();
    }, []);

    useEffect(() => {
        setCanLeaveBunker(false);
        const timer = setTimeout(() => setCanLeaveBunker(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const openConfirm = (config: typeof confirmModal) => {
        setConfirmModal(config);
    };

    const handleSearchAllies = () => {
        if (!onSearchAllies) return;
        if (omegaCylinders <= 0) {
            openConfirm({
                isOpen: true,
                title: isSpanishLanguage(language) ? 'RECURSOS INSUFICIENTES' : 'INSUFFICIENT RESOURCES',
                message: isSpanishLanguage(language)
                    ? 'NO QUEDAN VIALES DE CURA PARA ACTIVAR EL RASTREO CEREBRO.'
                    : 'NO CURE VIALS REMAIN TO ACTIVATE CEREBRO TRACKING.',
                confirmText: isSpanishLanguage(language) ? 'ENTENDIDO' : 'UNDERSTOOD',
                type: 'WARNING',
                onConfirm: () => { }
            });
            return;
        }

        openConfirm({
            isOpen: true,
            title: isSpanishLanguage(language) ? 'RASTREO CEREBRO' : 'CEREBRO TRACKING',
            message: isSpanishLanguage(language)
                ? 'SE CONSUMIRA 1 VIAL DE CURA PARA LOCALIZAR ALIADOS VIVOS EN EL MAPA.'
                : '1 CURE VIAL WILL BE CONSUMED TO LOCATE LIVING ALLIES ON THE MAP.',
            confirmText: isSpanishLanguage(language) ? 'ACTIVAR' : 'ACTIVATE',
            type: 'WARNING',
            onConfirm: () => onSearchAllies()
        });
    };

    const handlePrisonAction = (hero: Hero) => {
        if (!onTransformHero) return;

        const targetAlignment = playerAlignment === 'ZOMBIE' ? 'ZOMBIE' : 'ALIVE';
        if (targetAlignment === 'ALIVE' && omegaCylinders <= 0) {
            openConfirm({
                isOpen: true,
                title: isSpanishLanguage(language) ? 'RECURSOS INSUFICIENTES' : 'INSUFFICIENT RESOURCES',
                message: isSpanishLanguage(language)
                    ? `NO HAY VIALES DE CURA DISPONIBLES PARA PURIFICAR A ${hero.alias}.`
                    : `NO CURE VIALS AVAILABLE TO PURIFY ${hero.alias}.`,
                confirmText: isSpanishLanguage(language) ? 'ENTENDIDO' : 'UNDERSTOOD',
                type: 'WARNING',
                onConfirm: () => { }
            });
            return;
        }

        openConfirm({
            isOpen: true,
            title: targetAlignment === 'ALIVE'
                ? (isSpanishLanguage(language) ? 'PROTOCOLO DE CURA' : 'CURE PROTOCOL')
                : (isSpanishLanguage(language) ? 'PROTOCOLO DE CONTENCION' : 'CONTAINMENT PROTOCOL'),
            message: targetAlignment === 'ALIVE'
                ? (isSpanishLanguage(language)
                    ? `INYECTAR VIAL DE CURA A ${hero.alias}. EL SUJETO PASARA AL PANEL IZQUIERDO COMO HÉROE ACTIVO.`
                    : `INJECT A CURE VIAL INTO ${hero.alias}. THE SUBJECT WILL MOVE TO THE LEFT PANEL AS AN ACTIVE HERO.`)
                : (isSpanishLanguage(language)
                    ? `REINTEGRAR A ${hero.alias} A LA HORDA.`
                    : `REINTEGRATE ${hero.alias} INTO THE HORDE.`),
            confirmText: targetAlignment === 'ALIVE'
                ? (isSpanishLanguage(language) ? 'INYECTAR VIAL' : 'INJECT VIAL')
                : (isSpanishLanguage(language) ? 'INFECTAR' : 'INFECT'),
            type: targetAlignment === 'ALIVE' ? 'CURE' : 'INFECT',
            onConfirm: () => onTransformHero(hero.id, targetAlignment)
        });
    };

    return (
        <div className="w-full h-full bg-slate-950 text-cyan-400 font-mono flex flex-col overflow-hidden relative">

            {/* TOP BAR */}
            <div className="h-16 border-b border-cyan-900 bg-slate-900/95 flex items-center justify-between px-6 shrink-0 z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <button onClick={() => { if (canLeaveBunker) onBack(); }} disabled={!canLeaveBunker} className={`flex items-center gap-3 text-sm font-black border px-4 py-2.5 tracking-[0.18em] transition-all clip-tactical ${canLeaveBunker ? 'border-cyan-700 hover:bg-cyan-500 hover:text-black text-cyan-200' : 'border-slate-700 text-slate-500 cursor-wait'}`}>
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-current bg-cyan-950/40 text-base">
                            ←
                        </span>
                        <span>MAPA</span>
                    </button>
                    <div className="h-8 w-px bg-cyan-800/50"></div>
                    <h1 className="text-xl font-black tracking-[0.2em] text-white uppercase text-shadow-neon">
                        CENTRO DE MANDO // <span className={playerAlignment === 'ZOMBIE' ? 'text-lime-500' : 'text-cyan-400'}>{playerAlignment}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-8 text-[10px] font-bold tracking-widest">
                    <div className="text-right">
                        <div className="text-gray-500">FECHA</div>
                        <div className="text-white">OCT 31, 2025</div>
                    </div>
                    <div className="text-right">
                        <div className="text-gray-500">ESTADO</div>
                        <div className="text-emerald-400 animate-pulse">OPERATIVO</div>
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden h-full">

                {/* LEFT COLUMN: ROSTER */}
                <div className="col-span-3 border-r border-cyan-900 bg-slate-900/30 flex flex-col min-w-[300px] h-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>

                    <div className="shrink-0 border-b border-cyan-900 bg-slate-900 px-4 py-4">
                        <div className="text-[9px] font-black uppercase tracking-[0.28em] text-cyan-500">
                            ROSTER DE HÉROES Y ALIADOS
                        </div>
                        <div className="mt-1 flex items-end justify-between gap-3">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                Aliados rescatados y héroes activos en la campaña
                            </div>
                            <button
                                onClick={() => handleOpenRecruit('RECRUIT')}
                                className="shrink-0 border border-cyan-600 bg-cyan-950/30 px-3 py-2 text-[8px] font-black uppercase tracking-[0.24em] text-cyan-200 transition-all hover:bg-cyan-500 hover:text-black"
                            >
                                {isSpanishLanguage(language) ? 'AÑADIR ALIADO' : 'ADD ALLY'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900 pb-24 relative">
                        <div className="px-3 py-3 space-y-3">
                            <div className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-400 border-b border-cyan-900/30 pb-1">
                                ACTIVOS ({availableHeroes.length})
                            </div>
                            {availableHeroes.map((hero) => (
                                <RosterHeroCard
                                    key={hero.id}
                                    hero={hero}
                                    language={language}
                                    onClick={() => setSelectedHeroId(hero.id)}
                                />
                            ))}

                            {deployedHeroes.length > 0 && (
                                <div className="pt-3">
                                    <div className="text-[9px] font-black uppercase tracking-[0.25em] text-yellow-400 border-b border-yellow-900/30 pb-1 mb-3">
                                        DESPLEGADOS ({deployedHeroes.length})
                                    </div>
                                    <div className="space-y-3">
                                        {deployedHeroes.map((hero) => (
                                            <RosterHeroCard
                                                key={hero.id}
                                                hero={hero}
                                                language={language}
                                                onClick={() => setSelectedHeroId(hero.id)}
                                                actionIcon="×"
                                                onAction={() => onUnassign(hero.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* CENTER COLUMN: INTEL */}
                <div className="col-span-6 flex flex-col bg-slate-950 relative h-full overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)] bg-[length:30px_30px]"></div>

                    {/* THREAT MONITOR */}
                    <div className="h-2/5 border-b border-cyan-900 p-6 flex gap-6 shrink-0 bg-slate-900/20">
                        <div className="flex-1 border border-cyan-800/50 bg-slate-900/50 p-4 relative shadow-[0_0_30px_rgba(0,0,0,0.5)] clip-tactical">
                            <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-4 border-b border-cyan-900/50 pb-2">CONTROL TERRITORIAL GLOBAL</h3>
                            <TacticalBar label="MAGNETO" shieldVal={threatAnalysis.magneto.shield} enemyVal={threatAnalysis.magneto.enemy} enemyColor={threatAnalysis.magneto.color} />
                            <TacticalBar label="KINGPIN" shieldVal={threatAnalysis.kingpin.shield} enemyVal={threatAnalysis.kingpin.enemy} enemyColor={threatAnalysis.kingpin.color} />
                            <TacticalBar label="HULK" shieldVal={threatAnalysis.hulk.shield} enemyVal={threatAnalysis.hulk.enemy} enemyColor={threatAnalysis.hulk.color} />
                            <TacticalBar label="DOOM" shieldVal={threatAnalysis.doom.shield} enemyVal={threatAnalysis.doom.enemy} enemyColor={threatAnalysis.doom.color} />
                        </div>

                        <div className="w-1/3 flex flex-col gap-4">
                            <div className="flex-1 bg-slate-900/50 border border-cyan-800/50 p-4 flex flex-col items-center justify-center text-center clip-tactical">
                                <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">MISIONES ACTIVAS</div>
                                <div className="text-5xl font-black text-white text-shadow-neon">{missions.length}</div>
                                <div className="text-[9px] text-cyan-400 mt-2 bg-cyan-900/30 px-2 py-1 rounded border border-cyan-800">PRIORIDAD ALTA</div>
                            </div>
                        </div>
                    </div>

                    {/* CAMPAIGN LOG */}
                    <div className="flex-1 p-6 overflow-y-auto pb-24 relative flex flex-col">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5 pointer-events-none"></div>
                        <div className="flex items-end justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.28em] flex items-center gap-2">
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                                    BITÁCORA DE OPERACIONES
                                </h3>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                    Cronica de campaña y consecuencias narrativas
                                </p>
                            </div>
                            <div className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-400 border border-emerald-900/40 bg-emerald-950/20 px-3 py-1">
                                {completedCampaignMissions.length} ENTRADAS
                            </div>
                        </div>

                        {completedCampaignMissions.length > 0 ? (
                            <div className="grid min-h-0 flex-1 grid-cols-[minmax(240px,0.42fr)_minmax(0,0.58fr)] gap-4">
                                <div className="min-h-0 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-emerald-900">
                                    {completedCampaignMissions.map((mission) => {
                                        const isSelected = selectedCampaignMission?.id === mission.id;
                                        return (
                                            <button
                                                key={mission.id}
                                                type="button"
                                                onClick={() => setSelectedCampaignMissionId(mission.id)}
                                                className={`w-full text-left border-l-4 p-4 transition-all relative overflow-hidden ${isSelected
                                                    ? 'border-emerald-400 bg-emerald-950/30 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                                                    : 'border-emerald-900/60 bg-slate-900/70 hover:bg-emerald-950/20 hover:border-emerald-500'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="text-[8px] font-black uppercase tracking-[0.28em] text-emerald-300">
                                                            MISIÓN COMPLETADA
                                                        </div>
                                                        <div className="mt-1 text-sm font-black uppercase tracking-wider text-white">
                                                            {mission.title}
                                                        </div>
                                                        <div className="mt-1 text-[10px] font-mono text-slate-400">
                                                            {mission.location.state} // {mission.threatLevel}
                                                        </div>
                                                    </div>
                                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300 border border-emerald-800/60 px-2 py-1">
                                                        VER
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="min-h-0 border border-slate-800 bg-slate-950/80 p-4 flex flex-col">
                                    <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
                                        <div>
                                            <div className="text-[8px] font-black uppercase tracking-[0.28em] text-emerald-300">
                                                CRÓNICA DE CAMPAÑA
                                            </div>
                                            <div className="mt-1 text-lg font-black uppercase tracking-wider text-white">
                                                {selectedCampaignMission?.title || (isSpanishLanguage(language) ? 'Sin entrada seleccionada' : 'No entry selected')}
                                            </div>
                                        </div>
                                        {selectedCampaignMission && (
                                            <div className="text-right">
                                                <div className="text-[8px] font-bold uppercase tracking-[0.22em] text-slate-500">
                                                    {selectedCampaignMission.location.state}
                                                </div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                                                    {selectedCampaignMission.threatLevel}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 space-y-4">
                                        <div className="border-l-2 border-emerald-500 pl-4">
                                            <div className="text-[8px] font-black uppercase tracking-[0.28em] text-emerald-400 mb-2">
                                                RESUMEN NARRATIVO
                                            </div>
                                            <div className="text-[12px] leading-[1.65] text-slate-100 whitespace-pre-line">
                                                {selectedCampaignNarrative}
                                            </div>
                                        </div>

                                        {selectedCampaignObjectives.length > 0 && (
                                            <div className="border border-slate-800 bg-black/30 p-3">
                                                <div className="text-[8px] font-black uppercase tracking-[0.28em] text-cyan-400 mb-2">
                                                    CONSECUENCIAS / OBJETIVOS
                                                </div>
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    {selectedCampaignObjectives.map((objective, index) => (
                                                        <div key={`${selectedCampaignMission?.id || 'objective'}-${index}`} className="border border-slate-800 bg-slate-950/60 p-3">
                                                            <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                                                {language === 'es' ? 'OBJETIVO' : 'OBJECTIVE'} {index + 1}
                                                            </div>
                                                            <div className="mt-1 text-[12px] font-black uppercase text-emerald-300">
                                                                {objective.title}
                                                            </div>
                                                            <div className="mt-1 text-[11px] leading-[1.45] text-slate-300">
                                                                {objective.desc}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center border border-dashed border-slate-800 bg-black/20 text-center">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                                        {isSpanishLanguage(language) ? 'AUN NO HAY ENTRADAS' : 'NO ENTRIES YET'}
                                    </div>
                                    <div className="mt-2 text-[12px] text-slate-400 max-w-md">
                                        {isSpanishLanguage(language)
                                            ? 'Cuando completes misiones, aqui apareceran sus cronicas y consecuencias narrativas.'
                                            : 'Once missions are completed, their chronicles and narrative consequences will appear here.'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: RESOURCES */}
                <div className="col-span-3 border-l border-cyan-900 bg-slate-900/30 flex flex-col h-full overflow-hidden">
                    <div className="p-5 border-b border-cyan-900 shrink-0 bg-slate-950/40">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-[9px] font-black uppercase tracking-[0.28em] text-cyan-500">
                                    {playerAlignment === 'ZOMBIE' ? 'ALA DE CONTENCIÓN ZOMBI' : 'CÁRCEL DE ALTA SEGURIDAD'}
                                </div>
                                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                    Sujetos capturados y listos para contención o purificación
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-fuchsia-400 border border-fuchsia-900/40 bg-fuchsia-950/20 px-2 py-1">
                                    {capturedHeroes.length} PRISIONEROS
                                </div>
                                <button
                                    onClick={() => handleOpenRecruit('CAPTURE')}
                                    className="border border-fuchsia-600 bg-fuchsia-950/30 px-3 py-2 text-[8px] font-black uppercase tracking-[0.24em] text-fuchsia-200 transition-all hover:bg-fuchsia-500 hover:text-black"
                                >
                                    {isSpanishLanguage(language) ? 'INGRESAR PRISIONERO' : 'ADD PRISONER'}
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            {capturedHeroes.length > 0 ? (
                                capturedHeroes.map((hero) => {
                                    const isAlivePlayer = playerAlignment === 'ALIVE';
                                    const actionLabel = isAlivePlayer
                                        ? (isSpanishLanguage(language) ? 'INYECTAR VIAL DE CURA' : 'INJECT CURE VIAL')
                                        : (isSpanishLanguage(language) ? 'INFECTAR SUJETO' : 'INFECT SUBJECT');
                                    return (
                                        <RosterHeroCard
                                            key={hero.id}
                                            hero={hero}
                                            language={language}
                                            onClick={() => setSelectedHeroId(hero.id)}
                                            actionIcon={isAlivePlayer ? '💉' : '🧟'}
                                            actionLabel={actionLabel}
                                            actionMuted={isAlivePlayer && omegaCylinders <= 0}
                                            onAction={() => handlePrisonAction(hero)}
                                        />
                                    );
                                })
                            ) : (
                                <div className="border border-dashed border-slate-800 bg-black/20 p-4 text-center">
                                    <div className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-500">
                                        {isSpanishLanguage(language) ? 'SIN PRISIONEROS' : 'NO PRISONERS'}
                                    </div>
                                    <div className="mt-2 text-[11px] text-slate-400">
                                        {isSpanishLanguage(language)
                                            ? 'Cuando captures un sujeto, aparecerá aquí con su acción de contención.'
                                            : 'When a subject is captured, it will appear here with its containment action.'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-5 border-b border-cyan-900 bg-slate-900/50 shrink-0">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.28em]">
                                NEVERA OMEGA
                            </h3>
                            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">
                                <span className="inline-flex h-5 w-5 items-center justify-center border border-cyan-800 bg-cyan-950/60 text-cyan-300">💉</span>
                                {isSpanishLanguage(language) ? 'VIALES DE CURA' : 'CURE VIALS'}
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4 bg-black/40 p-3 rounded border border-blue-900/30">
                            <div className="flex gap-1.5">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-10 skew-x-[-10deg] border border-slate-700 ${i < omegaCylinders ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' : 'bg-slate-800/50'}`}
                                    ></div>
                                ))}
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-white leading-none">{omegaCylinders}</div>
                                <div className="text-[8px] text-gray-500 uppercase">
                                    {isSpanishLanguage(language) ? 'DISPONIBLES' : 'AVAILABLE'}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSearchAllies}
                            disabled={!onSearchAllies || omegaCylinders <= 0}
                            className={`mt-4 w-full border px-4 py-3 text-[9px] font-black uppercase tracking-[0.22em] transition-all clip-tactical-inv ${!onSearchAllies || omegaCylinders <= 0
                                ? 'cursor-not-allowed border-slate-700 bg-slate-900/40 text-slate-500'
                                : 'border-cyan-600 bg-cyan-950/30 text-cyan-200 hover:bg-cyan-500 hover:text-black'
                                }`}
                        >
                            {isSpanishLanguage(language)
                                ? 'ACTIVAR RASTREO CEREBRO: BUSCAR ALIADOS VIVOS'
                                : 'ACTIVATE CEREBRO TRACKING: SEARCH LIVING ALLIES'}
                        </button>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto pb-24">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                            {isSpanishLanguage(language) ? 'REGISTRO DE CONTENCIÓN' : 'CONTAINMENT LOG'}
                        </h3>
                        <div className="space-y-4">
                            <div className="border-l-2 border-emerald-500 pl-3 py-1 relative">
                                <div className="absolute w-2 h-2 bg-emerald-500 rounded-full -left-[5px] top-1.5 shadow-[0_0_10px_#10b981]"></div>
                                <div className="text-[9px] text-emerald-400 font-bold uppercase mb-1">
                                    {isSpanishLanguage(language) ? 'SISTEMA OPERATIVO' : 'SYSTEM ONLINE'}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {isSpanishLanguage(language)
                                        ? 'Los viales de cura y el rastreo Cerebro comparten el mismo circuito de logística.'
                                        : 'Cure vials and Cerebro tracking share the same logistics circuit.'}
                                </div>
                            </div>
                            <div className="border-l-2 border-cyan-500 pl-3 py-1 relative">
                                <div className="absolute w-2 h-2 bg-cyan-500 rounded-full -left-[5px] top-1.5 shadow-[0_0_10px_#06b6d4]"></div>
                                <div className="text-[9px] text-cyan-400 font-bold uppercase mb-1">
                                    {isSpanishLanguage(language) ? 'RASTREO LISTO' : 'TRACKING READY'}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {isSpanishLanguage(language)
                                        ? 'Usa la nevera para buscar supervivientes vivos o para purificar capturados.'
                                        : 'Use the fridge to search for living survivors or to purify captives.'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALES Y OVERLAYS */}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                type={confirmModal.type}
            />

            {showRecruitModal && (
                <RecruitModal
                    isOpen={showRecruitModal}
                    onClose={() => setShowRecruitModal(false)}
                    onRecruit={onAddHero}
                    templates={dbTemplates}
                    existingAliases={existingAliases}
                    language={language}
                    playerAlignment={playerAlignment || 'ALIVE'}
                    initialMode={recruitModalMode}
                />
            )}

            {/* --- VISOR DE FICHA DE JUEGO (NUEVO) --- */}
            {viewingSheet && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setViewingSheet(null)}>
                    <div className="relative flex flex-col items-center justify-center w-full h-full">
                        {/* IMAGEN AJUSTADA PARA TAMAÃ‘O UNIFORME */}
                        <img
                            src={viewingSheet}
                            alt="Tactical Sheet"
                            className="h-[85vh] w-auto max-w-[95vw] object-contain border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.5)] rounded-xl bg-black"
                            onClick={(e) => e.stopPropagation()}
                            referrerPolicy="no-referrer"
                        />

                        {/* BotÃ³n cerrar */}
                        <button
                            onClick={() => setViewingSheet(null)}
                            className="mt-4 px-8 py-2 bg-red-900/80 text-white font-bold tracking-widest border border-red-600 hover:bg-red-800 uppercase text-xs shadow-lg rounded"
                        >
                            CERRAR
                        </button>
                    </div>
                </div>
            )}

            {selectedHero && (
                <div className="fixed inset-0 z-[150] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 md:p-12 animate-fade-in" onClick={() => setSelectedHeroId(null)}>
                                        <div className={`bg-slate-900 border-2 ${playerAlignment === 'ZOMBIE' ? 'border-lime-600 shadow-lime-900/20' : 'border-cyan-600 shadow-cyan-900/20'} w-full max-w-6xl h-[85vh] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden relative group`} onClick={e => e.stopPropagation()}>

                        {/* DECORATIVE GRID */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-5 animate-grid-pulse pointer-events-none"></div>

                        {/* LEFT: PORTRAIT & SCANNER */}
                        <div className="w-full md:w-[34%] h-64 md:h-full relative border-b md:border-b-0 md:border-r border-slate-800 shrink-0 overflow-hidden">
                            <img src={selectedHeroImageUrl} className="w-full h-full object-cover object-top filter contrast-110 saturate-90 brightness-95" referrerPolicy="no-referrer" />

                            {/* SCANNING BEAM */}
                            <div className={`absolute left-0 right-0 h-0.5 ${playerAlignment === 'ZOMBIE' ? 'bg-lime-500 shadow-[0_0_15px_#84cc16]' : 'bg-cyan-500 shadow-[0_0_15px_#06b6d4]'} z-10 animate-scanning-beam`}></div>

                            {/* BIO DATA OVERLAY */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                            <div className="absolute left-4 right-4 bottom-[92px] sm:bottom-[100px] z-20">
                                <BiometricMonitor alignment={playerAlignment || 'ALIVE'} compact />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20">
                                <div className={`text-[10px] font-bold ${playerAlignment === 'ZOMBIE' ? 'text-lime-500' : 'text-cyan-500'} tracking-[0.4em] mb-2`}>
                                    {dossierIsZombie ? 'ARCHIVO CONTAMINADO' : 'EXPEDIENTE OPERATIVO'}
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-1 drop-shadow-2xl" style={{ fontFamily: 'Impact, sans-serif' }}>
                                    {selectedHero.alias}
                                </h2>
                                <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">{selectedHero.name}</p>
                            </div>

                            {/* Faction Seal (Transparent back) */}
                            <div className="absolute top-4 left-4 opacity-10 pointer-events-none">
                                <span className="text-6xl font-black text-white">{playerAlignment === 'ZOMBIE' ? 'BIOHAZARD' : 'S.H.I.E.L.D.'}</span>
                            </div>
                        </div>

                        {/* RIGHT: BIOMETRICS & REPORT */}
                        <div className="flex-1 p-6 md:p-10 bg-slate-950/50 relative overflow-hidden flex flex-col min-h-0">
                            <div className="absolute top-0 right-0 p-6 flex items-center gap-4 z-20">
                                <div className={`px-3 py-1 border ${playerAlignment === 'ZOMBIE' ? 'border-lime-900 text-lime-500' : 'border-cyan-900 text-cyan-500'} text-[9px] font-bold tracking-[0.2em] bg-black/50`}>
                                    REPORT_REF: {selectedHero.id.substring(0, 8).toUpperCase()}
                                </div>
                                <button onClick={() => setSelectedHeroId(null)} className="text-slate-500 hover:text-white transition-colors text-2xl font-light">×</button>
                            </div>

                            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
                                <div className="flex items-start justify-between gap-4 border-b border-cyan-900/40 pb-2">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500">{heroDossierUi.combatProfile}</span>
                                    <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-slate-500">{selectedHeroSheet?.set || heroDossierUi.series}</span>
                                </div>

                                {selectedHeroSheets.length > 1 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedHeroSheets.map((sheet, index) => (
                                            <button
                                                key={`${sheet.characterName}-${sheet.set}-${index}`}
                                                type="button"
                                                onClick={() => setSelectedHeroSheetIndex(index)}
                                                className={`border px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.22em] transition-colors ${selectedHeroSheetIndex === index
                                                    ? 'border-cyan-500 bg-cyan-950/50 text-cyan-200'
                                                    : 'border-slate-800 bg-black/30 text-slate-400 hover:text-white'}`}
                                            >
                                                {sheet.set}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,0.86fr)_minmax(0,1.38fr)_minmax(0,0.86fr)_minmax(0,0.86fr)_minmax(0,0.86fr)]">
                                    <div className="border border-red-900/70 bg-slate-950/80 p-2.5 min-w-0">
                                        <div className="text-[7px] text-red-500 font-bold uppercase tracking-[0.24em] mb-1">{language === 'es' ? 'VIDA' : 'LIFE'}</div>
                                        <div className="text-[28px] sm:text-[30px] font-black text-white leading-none">{selectedHeroSheet?.life || 'N/D'}</div>
                                    </div>
                                    <div className="border border-cyan-900/70 bg-slate-950/80 p-2.5 min-w-0 flex flex-col justify-between min-h-[88px] overflow-hidden">
                                        <div className="text-[7px] text-cyan-400 font-bold uppercase tracking-[0.24em] mb-1">{language === 'es' ? 'TIPO' : 'TYPE'}</div>
                                        <div className="text-[12px] sm:text-[15px] font-black text-white uppercase leading-tight break-words">{selectedHeroSheet?.type || selectedHero.class}</div>
                                        <div className="mt-1 text-[7px] uppercase tracking-[0.22em] text-slate-500 leading-none">{selectedHeroSheet?.attack || 'ATK'}</div>
                                    </div>
                                    <div className="border border-emerald-900/70 bg-slate-950/80 p-2.5 min-w-0">
                                        <div className="text-[7px] text-emerald-400 font-bold uppercase tracking-[0.24em] mb-1">{language === 'es' ? 'DADOS' : 'DICE'}</div>
                                        <div className="text-[28px] sm:text-[30px] font-black text-white leading-none">{selectedHeroSheet?.dice || 'N/D'}</div>
                                    </div>
                                    <div className="border border-blue-900/70 bg-slate-950/80 p-2.5 min-w-0">
                                        <div className="text-[7px] text-blue-400 font-bold uppercase tracking-[0.24em] mb-1">TO HIT</div>
                                        <div className="text-[28px] sm:text-[30px] font-black text-white leading-none">{selectedHeroSheet?.toHit || 'N/D'}</div>
                                    </div>
                                    <div className="border border-violet-900/70 bg-slate-950/80 p-2.5 min-w-0">
                                        <div className="text-[7px] text-violet-400 font-bold uppercase tracking-[0.24em] mb-1">{language === 'es' ? 'ALCANCE' : 'RANGE'}</div>
                                        <div className="text-[28px] sm:text-[30px] font-black text-white leading-none">{selectedHeroSheet?.range || 'N/D'}</div>
                                    </div>
                                </div>

                                <div className="rounded border border-slate-800 bg-black/30 p-3 md:p-3.5">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.28em] text-gray-500">{heroDossierUi.fieldDossier}</h4>
                                        <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-slate-500">{selectedHeroSheet?.set || heroDossierUi.series}</span>
                                    </div>

                                    <div className="mt-3 grid grid-cols-3 gap-2">
                                        <div className="border border-slate-800 bg-slate-950/70 p-2.5">
                                            <div className="text-[7px] font-bold uppercase text-gray-500">{heroDossierUi.class}</div>
                                            <div className="mt-1 text-[13px] font-black uppercase leading-tight text-cyan-300">{selectedHero.class}</div>
                                        </div>
                                        <div className="border border-slate-800 bg-slate-950/70 p-2.5">
                                            <div className="text-[7px] font-bold uppercase text-gray-500">{heroDossierUi.status}</div>
                                            <div className="mt-1 text-[13px] font-black uppercase leading-tight text-white">{getHeroStatusLabel(selectedHero.status, language)}</div>
                                        </div>
                                        <div className="border border-slate-800 bg-slate-950/70 p-2.5">
                                            <div className="text-[7px] font-bold uppercase text-gray-500">{heroDossierUi.key}</div>
                                            <div className="mt-1 text-[13px] font-black uppercase leading-tight text-yellow-300">{dossierIsZombie ? 'BIOHAZARD' : 'OMEGA'}</div>
                                        </div>
                                    </div>

                                    <div className="mt-3 border-l-2 border-violet-900/70 pl-3">
                                        <div className={`mb-1 text-[8px] font-bold uppercase tracking-[0.25em] ${dossierAccentClass}`}>{heroDossierUi.evaluation}</div>
                                        <div className="text-[10px] leading-[1.45] text-slate-200">{selectedHeroAssessment}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <button type="button" onClick={() => setHeroDossierTab('EXPEDIENTE')} className={`border px-3 py-2 text-[8px] font-black uppercase tracking-[0.24em] transition-colors ${heroDossierTab === 'EXPEDIENTE' ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200' : 'border-slate-800 bg-black/30 text-slate-400 hover:text-white'}`}>{heroDossierUi.tabs.dossier}</button>
                                    <button type="button" onClick={() => setHeroDossierTab('HISTORIA')} className={`border px-3 py-2 text-[8px] font-black uppercase tracking-[0.24em] transition-colors ${heroDossierTab === 'HISTORIA' ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200' : 'border-slate-800 bg-black/30 text-slate-400 hover:text-white'}`}>{heroDossierUi.tabs.history}</button>
                                    <button type="button" onClick={() => setHeroDossierTab('PODERES')} className={`border px-3 py-2 text-[8px] font-black uppercase tracking-[0.24em] transition-colors ${heroDossierTab === 'PODERES' ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200' : 'border-slate-800 bg-black/30 text-slate-400 hover:text-white'}`}>{heroDossierUi.tabs.powers}</button>
                                </div>

                                <div className="min-h-0 flex-1 overflow-y-auto border border-slate-800 bg-black/40 p-4">
                                        {heroDossierTab === 'EXPEDIENTE' && (
                                            <div className="space-y-4 text-[11px] leading-[1.5] text-slate-300">
                                                <div className="border border-slate-800 bg-slate-950/70 p-3">
                                                    <div className="text-[8px] font-bold uppercase tracking-[0.25em] text-gray-500">{heroDossierUi.series}</div>
                                                    <div className="mt-1 text-sm font-black uppercase text-white">{selectedHeroSheet?.set || heroDossierUi.series}</div>
                                                </div>
                                        </div>
                                    )}

                                    {heroDossierTab === 'HISTORIA' && (
                                        <div className="space-y-4 text-[11px] leading-[1.6] text-cyan-50/90 whitespace-pre-line">
                                            {selectedHeroHistory}
                                        </div>
                                    )}

                                    {heroDossierTab === 'PODERES' && (
                                        <div className="space-y-4">
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {heroDossierAbilityCards.map((ability) => (
                                                    <div key={ability.key} className={`border ${ability.border} bg-slate-950/80 p-3`}>
                                                        <div className={`text-[8px] font-bold uppercase tracking-[0.28em] ${ability.accent}`}>{ability.label}</div>
                                                        <div className="mt-2 text-sm font-black uppercase text-white">{ability.title || 'N/D'}</div>
                                                        <div className="mt-2 text-[11px] leading-[1.55] text-slate-200">{ability.text || 'Sin información registrada.'}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* DECORATIVE CORNER DATA */}
                        <div className="absolute top-2 left-2 text-[7px] text-slate-700 font-mono tracking-widest hidden lg:block">
                            SHIELD_OS_V.4.02 // CLASSIFIED // {new Date().toISOString()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const RosterHeroCard = ({ hero, language, onClick, actionIcon, actionLabel, onAction, actionMuted = false }: { hero: Hero, language: Language, onClick: () => void, actionIcon?: string, actionLabel?: string, onAction?: () => void, actionMuted?: boolean }) => {
    const statusColors = {
        AVAILABLE: 'border-emerald-500 shadow-emerald-500/20',
        DEPLOYED: 'border-yellow-500 shadow-yellow-500/20',
        INJURED: 'border-red-500 shadow-red-500/20',
        CAPTURED: 'border-red-900 shadow-red-900/20 grayscale'
    };
    const colorClass = statusColors[hero.status] || 'border-slate-600';
    const displayImageUrl = preferGithubCharacterImage(hero.alias, hero.status === 'CAPTURED' ? 'ZOMBIE' : (hero.alignment || 'ALIVE'), hero.imageUrl);
    const dossierSummary = getSafeDossierText(resolveI18n(hero.currentStory, language), hero.name || '');
    const imgStyle = hero.imageParams ? {
        transform: `scale(${hero.imageParams.scale}) translate(${hero.imageParams.x}%, ${hero.imageParams.y}%)`
    } : {};

    return (
        <div onClick={onClick} className={`group relative w-full cursor-pointer overflow-hidden border-l-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-900/95 p-3 transition-all duration-300 hover:bg-slate-900 hover:scale-[1.01] hover:z-10 ${colorClass}`}>
            <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden border border-slate-700 bg-slate-950">
                    <img
                        src={displayImageUrl}
                        alt={hero.alias}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                        style={imgStyle}
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>
                </div>

                <div className="min-w-0 flex-1 pr-10">
                    <div className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-500">
                        Registro operativo
                    </div>
                    <h3 className="mt-1 truncate text-lg font-black uppercase tracking-wider text-white group-hover:text-cyan-300" style={{ fontFamily: 'Impact, sans-serif' }}>
                        {hero.alias}
                    </h3>
                    <div className="truncate text-[11px] uppercase tracking-[0.25em] text-slate-400">
                        {hero.name}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="border border-cyan-900 bg-cyan-950/30 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-cyan-300">
                            {hero.class}
                        </span>
                        {hero.status !== 'AVAILABLE' && (
                            <span className={`border px-2 py-1 text-[8px] font-bold uppercase tracking-widest ${hero.status === 'DEPLOYED' ? 'border-yellow-700 bg-yellow-950/40 text-yellow-300' : 'border-red-800 bg-red-950/40 text-red-300'}`}>
                                {hero.status}
                            </span>
                        )}
                    </div>

                    {dossierSummary && (
                        <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                            {dossierSummary}
                        </p>
                    )}
                </div>
            </div>

            {actionIcon && onAction && (
                <button
                    onClick={(e) => { e.stopPropagation(); onAction(); }}
                    className={`absolute ${actionLabel ? 'left-3 right-3 bottom-3 h-auto px-3 py-2 justify-center' : 'right-2 top-2 h-8 w-8'} z-20 flex items-center rounded-sm border text-white transition-all backdrop-blur-sm ${actionMuted ? 'border-amber-700/60 bg-slate-900/80 text-amber-300 hover:bg-amber-900/40' : 'border-white/20 bg-black/50 hover:border-red-500 hover:bg-red-600'}`}
                >
                    <span className={`font-black ${actionLabel ? 'text-[9px] uppercase tracking-[0.22em] text-center leading-tight' : 'text-base'}`}>
                        {actionLabel || actionIcon}
                    </span>
                </button>
            )}
            <div className="absolute inset-0 bg-scan opacity-0 transition-opacity pointer-events-none group-hover:opacity-10"></div>
        </div>
    );
};




