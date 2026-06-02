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
        guaranteedCureVial: true,
        pdfUrl: '/docs/mh0-cadenas-rotas.docx',
        outcomeText: 'El pesado porton blindado choca contra el marco y los cerrojos encajan con un ruido sordo. El silencio que sigue es ensordecedor. Ya no hay gruñidos, solo vuestra propia respiracion agitada y el hedor a sudor y sangre reseca.\n\nBlack Widow no lo celebra. Camina hacia la consola central, dejando marcas de sangre en el teclado al conectar un cable desde su munequera.\n\n"La red principal lleva dias muerta", escupe, tecleando a toda velocidad. "Voy a forzar el arranque."\n\nUna voz sintetica, desprovista de cualquier calidez, inunda el bunker:\n\n"Protocolo de Sucesion de Emergencia. Escaneando biometria... Director Fury: baja confirmada. Subdirectora Hill: baja confirmada. Cadena de mando destruida. Identidad reconocida: Natasha Romanoff. Sistema ARGUS en linea."\n\nEl centro de la sala cobra vida. Un inmenso mapa holografico tine vuestros rostros de un rojo enfermizo. No hay puntos de resistencia. El mundo entero es de la Triada.\n\nBlack Widow se queda mirando el mapa. Sus hombros caen una fraccion de segundo antes de volver a tensarse, endurecidos. Se gira hacia vosotros. La mirada de la espia ha desaparecido; ahora solo hay una superviviente acorralada.\n\n"No va a venir nadie", dice, con una voz mas fria que el acero del porton. "Los salvadores que debian sacarnos de esta estan ahi fuera, intentando comernos."\n\nPulsa un boton en la consola y la pantalla parpadea, abriendo un archivo clasificado en negro y rojo.\n\n"S.H.I.E.L.D. tenia un ultimo plan de contingencia para el fin de todo. El Proyecto Cero. Un equipo tactico disenado para operar sin apoyo, sin reglas y en medio del infierno. El nombre en clave del escuadron era Aesir."\n\nCoge un cargador, lo golpea contra la mesa para asentar las balas y lo mete en su arma. El chasquido metalico corta el aire.\n\n"Se suponia que los Aesir iban a ser los heroes mas grandes del planeta. Leyendas de poster y semidioses. Pero ahora solo son estomagos vacios buscando carne fresca. Asi que me conformo con lo que tengo delante. A partir de hoy, vosotros sois los Aesir. Limpiaos la sangre y recargad las armas. Solo acabamos de empezar."'
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
