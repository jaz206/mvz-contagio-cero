import { Mission } from '../types';

// Recibe 't' (las traducciones) para que los textos estén en el idioma correcto al subirlo
export const getInitialMissions = (t: any): Mission[] => [
    {
        id: 'm_intro_0',
        title: "MH0: CADENAS ROTAS",
        description: [
            "SITUACIÓN CRÍTICA: El transporte ha sido neutralizado. Estamos heridos, desorientados y en territorio hostil.",
            "Black Widow ha establecido un perímetro temporal, pero el humo del accidente es una baliza para los infectados.",
            "OBJETIVO: No morir hoy. Debemos movernos hacia el búnker de seguridad antes de que la horda converja en nuestra posición."
        ],
        objectives: [
            { title: "Sobrevivir al Impacto", desc: "Recuperar el conocimiento y evaluar heridas." },
            { title: "Romper el Cerco", desc: "Abrirse paso a través de la primera oleada de infectados." },
            { title: "Llegar al Búnker", desc: "Alcanzar las coordenadas seguras en Ohio." }
        ],
        location: { state: 'Ohio', coordinates: [-82.5, 40.2] },
        threatLevel: "INMINENTE",
        type: 'INTRODUCTORY', // Tipo actualizado
        alignment: 'BOTH',
        outcomeText: "Lo logramos. Las puertas del búnker se han sellado tras nosotros. Estamos a salvo... por ahora. S.H.I.E.L.D. OS se está reiniciando."
    },
    {
        id: 'm_kraven',
        title: t.missions.kraven.title,
        description: t.missions.kraven.description,
        objectives: t.missions.kraven.objectives,
        location: { state: 'New York', coordinates: [-74.006, 40.7128] },
        threatLevel: 'ALTA',
        type: 'STANDARD',
        alignment: 'ALIVE',
        prereqs: ['m_intro_0'] // CONEXIÓN CRÍTICA
    },
    {
        id: 'm_zombie_feast',
        title: "EL FESTÍN DE LOS MUTANTES",
        description: ["La Escuela de Xavier está fortificada.", "Cerebro detecta mucha carne fresca dentro."],
        objectives: [{ title: "Romper las defensas", desc: "Destruir los muros." }],
        location: { state: 'New York', coordinates: [-73.8, 41.0] },
        threatLevel: 'EXTREMA',
        type: 'STANDARD',
        alignment: 'ZOMBIE',
        prereqs: ['m_intro_0'] // CONEXIÓN CRÍTICA
    },
    {
        id: 'm_flesh',
        title: t.missions.fleshSleeps.title,
        description: t.missions.fleshSleeps.description,
        objectives: t.missions.fleshSleeps.objectives,
        location: { state: 'Nevada', coordinates: [-115.1398, 36.1699] },
        threatLevel: 'MEDIA',
        type: 'STANDARD',
        alignment: 'BOTH',
        prereqs: ['m_intro_0'] // CONEXIÓN CRÍTICA
    },
    {
        id: 'm_base_alpha',
        title: t.missions.bases.alpha,
        description: [t.missions.bases.desc],
        objectives: [{ title: t.missions.bases.objSecure, desc: t.missions.bases.objRetrieve }],
        location: { state: 'Colorado', coordinates: [-104.9903, 39.7392] },
        threatLevel: 'BAJA',
        type: 'SHIELD_BASE',
        alignment: 'BOTH'
    },
    {
        id: 'm_surfer',
        type: 'GALACTUS',
        triggerStage: 'SURFER',
        title: t.events.surfer.alive.title,
        description: [t.events.surfer.alive.desc],
        objectives: [{ title: "Interceptar", desc: "Detener al Heraldo." }],
        location: { state: 'Kansas', coordinates: [-98.0, 38.0] },
        threatLevel: 'OMEGA',
        alignment: 'BOTH'
    },
    {
        id: 'boss-galactus',
        type: 'GALACTUS',
        triggerStage: 'GALACTUS',
        title: t.missions.galactus.title,
        description: t.missions.galactus.description,
        objectives: t.missions.galactus.objectives,
        location: { state: 'Kansas', coordinates: [-98.0, 38.0] },
        threatLevel: 'OMEGA++',
        alignment: 'BOTH'
    }
];