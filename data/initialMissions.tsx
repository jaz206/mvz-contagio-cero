import { Mission } from '../types';

// Recibe `t` para mantener el resto de misiones en el idioma activo.
export const getInitialMissions = (t: any): Mission[] => [
    {
        id: 'm_intro_0',
        title: 'MH0: CADENAS ROTAS',
        description: [
            'El zumbido en vuestros oidos apenas logra tapar los gritos de los moribundos. El transporte blindado de la Triada que os llevaba al matadero es ahora un amasijo de metal ardiendo en la noche. Iban a venderos, a usaros como cobayas o como espectaculo. El impacto ha roto sus planes.',
            'Llevas la mano al cuello. El collar inhibidor sigue ahi, pero la luz roja se ha apagado. Por primera vez en mucho tiempo, estais libres. En este mundo roto, sin embargo, la libertad dura poco: habeis dejado de ser prisioneros para convertiros en presas.',
            'El humo del choque se alza como una baliza. El metal crujiendo y las sirenas de la Triada atraen a todo lo que se mueve en kilometros a la redonda. Los primeros gruñidos ya emergen de la oscuridad.',
            'Entonces una figura avanza entre las llamas, aparta restos del fuselaje y os tiende una mano manchada de grasa y polvora. Es Black Widow. El refugio esta cerca, pero antes habra que abrirse paso a tiros hasta el bunker.'
        ],
        objectives: [
            { title: 'Sobrevivir a la Ola Cero', desc: 'Salir del choque y estabilizar la posicion antes de quedar rodeados.' },
            { title: 'Avanzar hasta el bunker', desc: 'Abrir un camino hasta la entrada segura marcada por Black Widow.' },
            { title: 'Activar los generadores', desc: 'Poner en marcha los dos generadores para devolver energia al refugio.' },
            { title: 'Resistir la oleada final', desc: 'Aguantar tres rondas mientras la IA de S.H.I.E.L.D. completa el reinicio.' },
            { title: 'Reunir al equipo', desc: 'Meter a todos los heroes dentro del bunker para cerrar la mision.' }
        ],
        location: { state: 'Ohio', coordinates: [-82.5, 40.2] },
        threatLevel: 'INMINENTE',
        type: 'INTRODUCTORY',
        alignment: 'BOTH',
        outcomeText: 'Los generadores rugen. Las luces del bunker vuelven a la vida y la consola parpadea mientras la IA se estabiliza. HERCULES deja de lanzar alarmas y proyecta un mapa holografico: ciudades enteras marcadas en rojo, senal del dominio de la Triada.\n\nBlack Widow suelta por fin el aire.\n\n"Tenemos refugio. Tenemos datos. Y tenemos tiempo... aunque no mucho."\n\nSe gira hacia vosotros y asiente una sola vez.\n\n"Bienvenidos a la Iniciativa Revenants. Este es el primer paso para recuperar el mundo."'
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
        prereqs: ['m_intro_0']
    },
    {
        id: 'm_zombie_feast',
        title: 'EL FESTIN DE LOS MUTANTES',
        description: ['La Escuela de Xavier esta fortificada.', 'Cerebro detecta mucha carne fresca dentro.'],
        objectives: [{ title: 'Romper las defensas', desc: 'Destruir los muros.' }],
        location: { state: 'New York', coordinates: [-73.8, 41.0] },
        threatLevel: 'EXTREMA',
        type: 'STANDARD',
        alignment: 'ZOMBIE',
        prereqs: ['m_intro_0']
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
        prereqs: ['m_intro_0']
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
        objectives: [{ title: 'Interceptar', desc: 'Detener al Heraldo.' }],
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
