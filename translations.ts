export type Language = 'es' | 'en';

export const translations = {
  es: {
    header: {
      project: "PROYECTO: LÁZARO",
      failure: "FALLO DE CONTENCIÓN",
      biohazard: "PELIGRO BIOLÓGICO",
      clearance: "NIVEL DE ACCESO: OMEGA",
      saving: "GUARDANDO...",
      saved: "GUARDADO",
      logout: "SALIR"
    },
    sidebar: {
      threatLevelTitle: "NIVEL DE AMENAZA",
      threatLevelValue: "CRÍTICO",
      infectionRate: "TASA DE INFECCIÓN: 89%",
      hiveBtn: "ACCESO COLMENA",
      bunkerBtn: "ACCESO BÚNKER",
      campaignMode: "MODO CAMPAÑA",
      activeMissions: "MISIONES ACTIVAS",
      noMissions: "NO HAY MISIONES DISPONIBLES",
      replayStory: "REPETIR INTRO"
    },
    map: {
      sector: "SECTOR",
      loading: "CARGANDO DATOS SATELITALES...",
      error: "ERROR DE CONEXIÓN",
      hive: "COLMENA",
      bunker: "BÚNKER"
    },
    factions: {
      magneto: { name: "Edén Roto (Magneto)" },
      kingpin: { name: "Imperio de la Carne" },
      hulk: { name: "Tierras Baldías (Hulk)" },
      doom: { name: "Doomsberg (Latveria)" },
      neutral: { name: "Zona Neutral" }
    },
    login: {
      title: "SHIELD OS",
      subtitle: "SISTEMA DE RESPUESTA A ZOMBIES",
      clearance: "AUTORIZACIÓN REQUERIDA",
      idPrompt: "ESCANEAR IDENTIFICACIÓN BIOMÉTRICA",
      scanning: "ESCANEANDO...",
      granted: "ACCESO CONCEDIDO",
      scanBtn: "INICIAR ESCANEO DE RETINA",
      googleBtn: "ACCESO OFICIAL DE SHIELD (GOOGLE)",
      editorBtn: "ACCESO DE EDITOR",
      editorPass: "CONTRASEÑA DE MANDO",
      error: "ERROR DE AUTENTICACIÓN",
      passError: "CONTRASEÑA INCORRECTA"
    },
    missionModal: {
      title: "ARCHIVO DE MISIÓN",
      threat: "NIVEL DE AMENAZA",
      briefing: "INFORME DE MISIÓN",
      objectives: "OBJETIVOS PRIMARIOS",
      downloadPdf: "DESCARGAR INFORME TÁCTICO COMPLETO",
      cancel: "CANCELAR",
      reactivate: "REACTIVAR",
      sending: "ENVIANDO...",
      sent: "INFORME ENVIADO",
      complete: "REPORTAR ÉXITO",
      accept: "ACEPTAR MISIÓN",
      outcomeTitle: "INFORME DE DESENLACE",
      closeReport: "ARCHIVAR INFORME"
    },
    bunker: {
      title: "PUESTO DE MANDO AVANZADO",
      hiveTitle: "NEXO DE LA COLMENA",
      return: "VOLVER AL MAPA",
      roster: "LISTA DE ACTIVOS",
      recruit: "RECLUTAR",
      currentStory: "ESTADO ACTUAL",
      objectives: "OBJETIVOS PERSONALES",
      status: "ESTADO",
      unassign: "RETIRAR",
      assign: "ASIGNAR A MISIÓN",
      viewFile: "VER FICHA TÉCNICA",
      manageSquad: "GESTIONAR ESCUADRÓN",
      assignModalTitle: "SELECCIONAR MISIÓN",
      squadModalTitle: "ASIGNACIÓN DE ESCUADRÓN",
      addToMission: "AÑADIR A MISIÓN",
      removeFromMission: "RETIRAR DE MISIÓN",
      noMissions: "NO HAY MISIONES DISPONIBLES",
      cancel: "CANCELAR",
      maxHeroes: "CAPACIDAD MÁXIMA ALCANZADA",
      omega: {
          title: "CILINDROS OMEGA",
          desc: "Nanobots reprogramados capaces de revertir la infección.",
          empty: "RESERVAS AGOTADAS",
          find: "BUSCAR SUMINISTROS",
          found: "¡CILINDRO ENCONTRADO!",
          notFound: "BÚSQUEDA FALLIDA"
      },
      rooms: {
          command: "SALA DE GUERRA",
          commandDesc: "Misiones activas y despliegue táctico.",
          barracks: "BARRACONES",
          barracksDesc: "Agentes en reserva listos para el servicio.",
          medbay: "ALA MÉDICA / CONTENCIÓN",
          medbayDesc: "Tratamiento y escaneo de nuevos sujetos.",
          cerebro: "INTERFAZ CEREBRO",
          cerebroDesc: "Búsqueda y reclutamiento global."
      }
    },
    recruit: {
      title: "RECLUTAMIENTO DE HÉROES",
      selectDb: "BASE DE DATOS DE S.H.I.E.L.D.",
      loadingDb: "ACCEDIENDO A ARCHIVOS...",
      alias: "NOMBRE EN CLAVE",
      name: "NOMBRE REAL",
      fileUrl: "URL DE FICHA (IMAGEN/PDF)",
      scanZombie: "ESCANEAR: SEÑALES ZOMBIE (CURAR)",
      scanHuman: "ESCANEAR: CARNE FRESCA (INFECTAR)",
      adminSeed: "ADMIN: REINICIAR DB",
      seedSuccess: "DB REINICIADA",
      submit: "RECLUTAR AGENTE"
    },
    missionEditor: {
      title: "EDITOR DE MISIONES",
      missionTitle: "TÍTULO DE LA MISIÓN",
      location: "UBICACIÓN (ESTADO)",
      threat: "NIVEL DE AMENAZA",
      type: "TIPO DE MISIÓN",
      prereq: "CONTINUACIÓN DE (REQUISITO)",
      pdfUrl: "URL DEL PDF (OPCIONAL)",
      description: "DESCRIPCIÓN",
      outcome: "DESENLACE (OPCIONAL)",
      objectives: "OBJETIVOS",
      addObjective: "AÑADIR OBJETIVO",
      objTitle: "Título del Objetivo",
      objDesc: "Descripción del Objetivo",
      cancel: "CANCELAR",
      save: "GUARDAR CAMBIOS"
    },
    events: {
      anomaly: {
          alive: {
              title: "ANOMALÍA CÓSMICA DETECTADA",
              desc: "LECTURAS DE ENERGÍA DESCONOCIDA EN EL ESPACIO PROFUNDO. REED RICHARDS CONFIRMA: UN PLANETA DEL SISTEMA VEGA HA DEJADO DE EXISTIR INSTANTÁNEAMENTE.",
              ack: "CONTINUAR MONITORIZACIÓN"
          },
          zombie: {
              title: "COMPETENCIA DETECTADA",
              desc: "EL HAMBRE SIENTE UNA PERTURBACIÓN. HANK PYM (ZOMBIE) INFORMA: ALGO MÁS ESTÁ DEVORANDO PLANETAS EN EL ESPACIO PROFUNDO. ¿ES COMIDA O UN RIVAL?",
              ack: "RASTREAR PRESA"
          }
      },
      surfer: {
          alive: {
              title: "LA CAÍDA DEL HERALDO",
              desc: "OBJETO PLATEADO ENTRÓ EN LA ATMÓSFERA. INTERCEPTADO POR HULK EN KANSAS. VÍDEO CONFIRMA INFECCIÓN. SILVER SURFER HA CAÍDO ANTE EL HAMBRE. REPITO: TENEMOS A UN HERALDO ZOMBIE EN JUEGO.",
              ack: "ACTIVAR PROTOCOLO OMEGA",
              image: "https://i.pinimg.com/1200x/ed/22/4b/ed224b12777f7372e1a4b6ca74912cf9.jpg"
          },
          zombie: {
              title: "COMIDA A DOMICILIO",
              desc: "UN SER DE PLATA HA ENTRADO EN LA ATMÓSFERA. TIENE SABOR A PODER CÓSMICO. HULK YA LE HA DADO EL PRIMER MORDISCO. EL HERALDO ES NUESTRO.",
              ack: "CONSUMIR PODER",
              image: "https://i.pinimg.com/1200x/ed/22/4b/ed224b12777f7372e1a4b6ca74912cf9.jpg"
          }
      },
      galactus: {
          alive: {
              title: "LLEGADA DE GALACTUS",
              desc: "EL DEVORADOR DE MUNDOS ESTÁ EN ÓRBITA. EL CIELO SE HA VUELTO PÚRPURA. NO VIENE A SALVARNOS. VIENE A COMER. LA ÚLTIMA BATALLA POR LA TIERRA HA COMENZADO.",
              ack: "PREPARARSE PARA EL JUICIO FINAL",
              image: "https://i.pinimg.com/736x/03/c7/6c/03c76c56fccbdc6bc57aff5c1b506089.jpg"
          },
          zombie: {
              title: "EL PLATO PRINCIPAL",
              desc: "GALACTUS HA LLEGADO. ES GIGANTE. ESTÁ LLENO DE ENERGÍA. SI NOS COMEMOS A ESTE DIOS ESPACIAL, NUNCA MÁS TENDREMOS HAMBRE. ¡A LA MESA!",
              ack: "DEVORAR AL DEVORADOR",
              image: "https://i.pinimg.com/736x/03/c7/6c/03c76c56fccbdc6bc57aff5c1b506089.jpg"
          }
      }
    },
    missions: {
        kraven: {
            title: "LA CACERÍA DE KRAVEN",
            description: ["Kraven el Cazador ha establecido una zona de caza en Central Park. Está usando supervivientes como cebo.", "Debemos detenerlo antes de que mate a más inocentes."],
            objectives: [
                { title: "Localizar a Kraven", desc: "Rastrear sus movimientos en Central Park." },
                { title: "Neutralizar a Kraven", desc: "Acabar con la amenaza." }
            ]
        },
        fleshSleeps: {
            title: "DONDE DUERME LA CARNE",
            description: ["Hemos detectado una instalación subterránea donde Kingpin almacena 'carne fresca'.", "Es una granja de humanos. Debemos liberarlos."],
            objectives: [
                { title: "Infiltración", desc: "Entrar en la instalación sin ser detectados." },
                { title: "Liberación", desc: "Liberar a los prisioneros." }
            ]
        },
        bases: {
            alpha: "BASE ALPHA",
            beta: "BASE BETA",
            gamma: "BASE GAMMA",
            delta: "BASE DELTA",
            epsilon: "BASE EPSILON",
            zeta: "BASE ZETA",
            desc: "Antigua base de operaciones de S.H.I.E.L.D. Puede contener suministros vitales.",
            objSecure: "Asegurar el perímetro",
            objRetrieve: "Recuperar datos"
        },
        galactus: {
            title: "EL JUICIO FINAL",
            description: ["Galactus ha comenzado a alimentarse. Debemos detenerlo o la Tierra será destruida.", "Todos los héroes disponibles deben converger en su posición."],
            objectives: [
                { title: "Atacar a Galactus", desc: "Coordinar un ataque masivo." },
                { title: "Salvar la Tierra", desc: "Evitar la destrucción total." }
            ]
        }
    },
    heroes: {
        hawkeye: { alias: "HAWKEYE", bio: "Maestro arquero y asesino. Nunca falla." },
        lukecage: { alias: "LUKE CAGE", bio: "Piel impenetrable y fuerza sobrehumana." },
        daredevil: { alias: "DAREDEVIL", bio: "El hombre sin miedo. Sentidos aumentados." },
        thor: { alias: "THOR", bio: "Dios del Trueno. Posee el poder de Mjolnir." },
        storm: { alias: "STORM", bio: "Controla el clima. Una diosa entre mortales." }
    },
    
    // --- ESTRUCTURA ACTUALIZADA PARA INTRO ---
    introSequence: {
        alive: [
            {
                text: "El zumbido en tus oídos es lo único que ahoga los gritos de los moribundos. Sientes sabor a cobre; sangre. El transporte blindado de la Tríada, esa jaula con ruedas que os llevaba al matadero, es ahora un amasijo de metal retorcido y carne quemada. Iban a venderos, a usaros como cobayas o entretenimiento... pero el destino ha tirado los dados.",
                image: "https://i.postimg.cc/s2krL4L6/Video-con-humo-llamas-y-nubes-1.gif"
            },
            {
                text: "Te tocas el cuello. El piloto LED del collar inhibidor está apagado. El impacto ha frito los circuitos. Estáis libres. Pero en este mundo, la libertad tiene un precio: ahora sois presas. El humo negro es una baliza; el ruido del choque, una campana de cena para cada mordedor hambriento en cinco kilómetros a la redonda. Ya puedes oír sus gruñidos mezclándose con sirenas distantes.",
                image: "https://i.postimg.cc/FHdhNV6n/Image-to-Video.gif"
            },
            {
                text: "Una figura aparece recortada por las llamas. No lleva el uniforme de la Tríada. Os tiende una mano llena de cicatrices y grasa. “Podéis quedaros ahí tirados y ser el aperitivo, o podéis levantaros y ser los que aprietan el gatillo. El refugio está cerca… pero el asfalto se va a teñir de rojo antes de que lleguemos.”",
                image: "https://i.postimg.cc/4xpjWHtk/Mind-Video-20251212162510-850.gif"
            }
        ],
        zombie: [
            {
                text: "Nosotros no fuimos a pelear una guerra. Fuimos a terminar con una. Jennifer Walters (She-Hulk) nos había llamado a gritos. La Tríada (Doom, Magneto, Fisk) había secuestrado a Bruce Banner. Su plan: usar el 'Pulso Nulificador' para convertir a los superhumanos en esclavos. Nuestra misión era sencilla: infiltrarnos en ese laboratorio de hormigón, liberar a Bruce y desmantelar el arma. Estábamos allí, apretando los dientes, listos para la pelea... Pero no pudimos llegar. El Pulso se activó, y todo fue demasiado rápido. Un segundo de retraso fue nuestra condena. El arma falló.",
                image: "https://i.pinimg.com/736x/a8/4c/e3/a84ce31bf7d6eb9388981f219a720368.jpg"
            },
            {
                text: "Cuando las alarmas sonaron, ya estábamos en los pasillos, y el color verde lo inundó todo. El virus nos tocó. Y, en lugar de matarnos, nos despertó. El dolor se desvaneció, y en su lugar llegó el Hambre. No como un grito, sino como un frío constante, un vacío que ningún poder puede apagar. Éramos héroes, y ahora somos el error. El laboratorio es ahora nuestro matadero personal. Y en el corazón del complejo, lo oímos. Hulk no murió. El monstruo despertó. Sin alma, sin freno. Cada latido suyo extiende la plaga Gamma. Ahora entendemos: Hulk es el origen, y lo último que intentamos fue lo que desató la catástrofe.",
                // IMAGEN ACTUALIZADA SLIDE 2
                image: "https://i.pinimg.com/736x/31/a1/24/31a124c7e30411a4fe906723b7e5ff2d.jpg"
            },
            {
                text: "S.H.I.E.L.D. llegó tarde. Sellaron el complejo, bombardearon las coordenadas. Llaman a nuestra casa 'Zona Perdida'. El mundo exterior aún cree que puede contener esto, que puede revertirlo. No saben que el origen sigue rugiendo. No saben que el virus nos ha otorgado un poder que nunca conocimos. Ya no se trata de salvación. Se trata de expansión. Hemos aprendido a caminar con este vacío. Hemos aprendido a usar esta rabia. El virus aprendió a caminar. Y nosotros... vamos a cazarlo todo.",
                // IMAGEN ACTUALIZADA SLIDE 3
                image: "https://i.pinimg.com/736x/e9/82/23/e98223ab8a1251e8fe9fce826dd3385f.jpg"
            }
        ]
    },
    story: {
        loading: {
            line1: "INICIALIZANDO...",
            line2: "CARGANDO ARCHIVOS...",
            line3: "ACCEDIENDO A MEMORIA...",
            line4: "SISTEMA LISTO"
        },
        slides: [
            { text: "No hubo trompetas. No hubo cielos rojos ni profecías antiguas cumpliéndose. El fin del mundo no vino del espacio exterior, ni de una dimensión oscura.", image: "https://i.pinimg.com/1200x/18/99/ec/1899ec756f8731e015eb941d7122fbec.jpg" },
            { text: "Lo construimos nosotros. Aquí. En casa.\nO mejor dicho, lo construyeron ellos.", image: "https://i.pinimg.com/1200x/71/06/7d/71067db72856dfd6ca03d0d51a679bd6.jpg" },
            { text: "Fue en un laboratorio estéril. Tres hombres se reunieron allí: Victor Von Doom, Magneto y Wilson Fisk.\nDecidieron que la humanidad era demasiado caótica. Su solución fue la ciencia fría y dura: el Pulso Nulificador.", image: "https://i.pinimg.com/1200x/71/06/7d/71067db72856dfd6ca03d0d51a679bd6.jpg" },
            { text: "Necesitaban cuerpos para afinar la fórmula. Usaron a Jamie Madrox para ver cómo se multiplicaba la infección. Usaron a los Reavers para ver si el metal podía enfermar. Y funcionó.", image: "https://i.pinimg.com/1200x/99/80/1e/99801e7603e4a770127ce29530f13f87.jpg" },
            { text: "Pero la arrogancia es una pistola cargada que siempre apunta hacia atrás.", image: "https://i.pinimg.com/1200x/19/26/53/1926533335a2b27c4a79c9d2632ec83d.jpg" },
            { text: "Decidieron probar su obra maestra en Bruce Banner. Buscaban una fuente de energía infinita; lo que consiguieron fue una bomba biológica.", image: "https://i.pinimg.com/1200x/b2/06/15/b20615925dfa53cdf9622fb596cdd5e3.jpg" },
            { text: "Cuando el virus tocó la sangre gamma, no murió. Se enfureció. Banner no cayó. La cosa que despertó ya no tenía a nadie al volante.", image: "https://i.pinimg.com/1200x/a8/e9/b7/a8e9b76d6a9a87de0cfba509d5fef534.jpg" },
            { text: "El estallido no fue de fuego, fue de contagio. Hulk roared, y en ese rugido viajaba la extinción.", image: "https://i.pinimg.com/1200x/eb/db/e8/ebdbe8d5738acd105654dc8ddad8216f.jpg" },
            { text: "En cuestión de horas, Nueva York era un matadero. Los Vengadores cayeron primero, destrozados por los amigos que intentaban salvar.", image: "https://i.pinimg.com/1200x/b9/0a/18/b90a18369639b131f91273f019b699cd.jpg" },
            { text: "¿Y la Tríada? Doom, Magneto, y Fisk fueron alcanzados por su propia creación. Pero el destino tiene un sentido del humor cruel.", image: "https://i.pinimg.com/1200x/e1/02/86/e102864e130bfa5b5f2ffc5a9d9ed9c0.jpg" },
            { text: "No perdieron la mente. Sus cuerpos se pudrieron, pero su intelecto permaneció intacto. Ahora se sientan en tronos de huesos, gobernando facciones de pesadilla.", image: "https://i.pinimg.com/1200x/e2/5c/3a/e25c3ac26e5fc65f9119b6073912e856.jpg" },
            { text: "Pero hay algo más ahí fuera. S.H.I.E.L.D. sigue activo. No es una agencia; es un fantasma armado. Una IA paranoica que ha decidido que la única forma de mantener el orden es eliminar todo lo que se mueva.", image: "https://i.pinimg.com/1200x/39/c8/cd/39c8cde0a5b56acc78b41c4eecf91f0a.jpg" },
            { text: "Así que aquí estás. De pie sobre las cenizas. Ya no se trata de salvar el mundo. Se trata de ver quién queda en pie.", image: "https://i.pinimg.com/1200x/45/7d/c5/457dc515c61d470eb26cf1727ebd67ea.jpg" },
            { text: "Dime, superviviente... en esta nueva era de monstruos y máquinas: ¿QUÉ ERES TÚ?", image: "https://i.pinimg.com/1200x/18/85/ee/1885ee42132b6976d36896a81f33ad8c.jpg" }
        ],
        choose: "ELIGE TU DESTINO",
        optionA: "SUPERVIVIENTE",
        optionB: "ZOMBIE",
        skip: "OMITIR",
        prev: "ANTERIOR",
        next: "SIGUIENTE"
    },
    tutorial: {
        welcome: { title: "BIENVENIDO A SHIELD", text: "El mundo ha caído, pero la resistencia continúa. Esta es tu interfaz de mando." },
        map_zones: { title: "ZONAS DE CONTROL", text: "El mapa muestra los territorios controlados por las facciones. Ten cuidado al desplegar tus agentes." },
        hulk: { title: "AMENAZA MÓVIL", text: "Hulk Zombie vaga por el mapa. Evita el contacto directo a menos que estés preparado." },
        missions: { title: "MISIONES ACTIVAS", text: "Aquí aparecerán las misiones disponibles. Complétalas para obtener recursos y avanzar en la historia." },
        bunker_entry: { title: "ACCESO AL BÚNKER", text: "Gestiona tu equipo, recluta nuevos héroes y revisa el estado de tus agentes aquí." },
        roster: { title: "LISTA DE AGENTES", text: "Tus héroes disponibles. Haz clic para ver detalles y asignar misiones." },
        file: { title: "EXPEDIENTE", text: "Información detallada del agente. Aquí puedes ver su historia y objetivos personales." },
        recruit: { title: "RECLUTAMIENTO", text: "Busca y recluta nuevos héroes de la base de datos de SHIELD." },
        finish: { title: "LISTO PARA EL COMBATE", text: "Buena suerte, Comandante. La humanidad depende de ti." },
        finishBtn: "FINALIZAR",
        skip: "OMITIR",
        next: "SIGUIENTE"
    }
  },
  en: {
    header: {
      project: "PROJECT: LAZARUS",
      failure: "CONTAINMENT FAILURE",
      biohazard: "BIOHAZARD",
      clearance: "CLEARANCE: OMEGA",
      saving: "SAVING...",
      saved: "SAVED",
      logout: "LOGOUT"
    },
    sidebar: {
      threatLevelTitle: "THREAT LEVEL",
      threatLevelValue: "CRITICAL",
      infectionRate: "INFECTION RATE: 89%",
      hiveBtn: "HIVE ACCESS",
      bunkerBtn: "BUNKER ACCESS",
      campaignMode: "CAMPAIGN MODE",
      activeMissions: "ACTIVE MISSIONS",
      noMissions: "NO MISSIONS AVAILABLE",
      replayStory: "REPLAY INTRO"
    },
    map: {
      sector: "SECTOR",
      loading: "LOADING SATELLITE DATA...",
      error: "CONNECTION ERROR",
      hive: "HIVE",
      bunker: "BUNKER"
    },
    factions: {
      magneto: { name: "Broken Eden (Magneto)" },
      kingpin: { name: "Empire of Flesh" },
      hulk: { name: "Hulk's Wasteland" },
      doom: { name: "Doomsberg (Latveria)" },
      neutral: { name: "Neutral Zone" }
    },
    login: {
      title: "SHIELD OS",
      subtitle: "ZOMBIE RESPONSE SYSTEM",
      clearance: "AUTHORIZATION REQUIRED",
      idPrompt: "SCAN BIOMETRIC ID",
      scanning: "SCANNING...",
      granted: "ACCESS GRANTED",
      scanBtn: "INITIATE RETINA SCAN",
      googleBtn: "SHIELD OFFICIAL ACCESS (GOOGLE)",
      editorBtn: "EDITOR ACCESS",
      editorPass: "COMMAND PASSWORD",
      error: "AUTHENTICATION ERROR",
      passError: "INCORRECT PASSWORD"
    },
    missionModal: {
      title: "MISSION FILE",
      threat: "THREAT LEVEL",
      briefing: "MISSION BRIEFING",
      objectives: "PRIMARY OBJECTIVES",
      downloadPdf: "DOWNLOAD FULL TACTICAL REPORT",
      cancel: "CANCEL",
      reactivate: "REACTIVATE",
      sending: "SENDING...",
      sent: "REPORT SENT",
      complete: "REPORT SUCCESS",
      accept: "ACCEPT MISSION",
      outcomeTitle: "MISSION DEBRIEF",
      closeReport: "ARCHIVE REPORT"
    },
    bunker: {
      title: "FORWARD COMMAND POST",
      hiveTitle: "HIVE NEXUS",
      return: "RETURN TO MAP",
      roster: "ASSET LIST",
      recruit: "RECRUIT",
      currentStory: "CURRENT STATUS",
      objectives: "PERSONAL OBJECTIVES",
      status: "STATUS",
      unassign: "WITHDRAW",
      assign: "ASSIGN TO MISSION",
      viewFile: "VIEW PERSONNEL FILE",
      manageSquad: "MANAGE SQUAD",
      assignModalTitle: "SELECT MISSION",
      squadModalTitle: "SQUAD ASSIGNMENT",
      addToMission: "ADD TO MISSION",
      removeFromMission: "REMOVE FROM MISSION",
      noMissions: "NO MISSIONS AVAILABLE",
      cancel: "CANCEL",
      maxHeroes: "MAXIMUM CAPACITY REACHED",
      omega: {
          title: "OMEGA CYLINDERS",
          desc: "Reprogrammed nanobots capable of reversing the infection.",
          empty: "RESERVES DEPLETED",
          find: "SCAVENGE SUPPLIES",
          found: "CYLINDER FOUND!",
          notFound: "SEARCH FAILED"
      },
      rooms: {
          command: "WAR ROOM",
          commandDesc: "Active missions and tactical deployment.",
          barracks: "BARRACKS",
          barracksDesc: "Reserve agents ready for deployment.",
          medbay: "MEDBAY / CONTAINMENT",
          medbayDesc: "Treatment and scanning of new subjects.",
          cerebro: "CEREBRO INTERFACE",
          cerebroDesc: "Global search and recruitment."
      }
    },
    recruit: {
      title: "HERO RECRUITMENT",
      selectDb: "S.H.I.E.L.D. DATABASE",
      loadingDb: "ACCESSING FILES...",
      alias: "CODENAME",
      name: "REAL NAME",
      fileUrl: "FILE URL (IMAGE/PDF)",
      scanZombie: "SCAN: ZOMBIE SIGNALS (CURE)",
      scanHuman: "SCAN: FRESH MEAT (INFECT)",
      adminSeed: "ADMIN: RESET DB",
      seedSuccess: "DB RESET",
      submit: "RECLUTAR AGENTE"
    },
    missionEditor: {
      title: "MISSION EDITOR",
      missionTitle: "MISSION TITLE",
      location: "LOCATION (STATE)",
      threat: "THREAT LEVEL",
      type: "MISSION TYPE",
      prereq: "PREREQUISITE MISSION",
      pdfUrl: "PDF URL (OPTIONAL)",
      description: "DESCRIPTION",
      outcome: "OUTCOME TEXT (OPTIONAL)",
      objectives: "OBJECTIVES",
      addObjective: "ADD OBJECTIVE",
      objTitle: "Objective Title",
      objDesc: "Objective Description",
      cancel: "CANCEL",
      save: "SAVE CHANGES"
    },
    events: {
      anomaly: {
          alive: {
              title: "COSMIC ANOMALY DETECTED",
              desc: "UNKNOWN ENERGY READINGS IN DEEP SPACE. REED RICHARDS CONFIRMA: A PLANET IN THE VEGA SYSTEM CEASED TO EXIST INSTANTANEOUSLY.",
              ack: "CONTINUE MONITORING"
          },
          zombie: {
              title: "COMPETITION DETECTED",
              desc: "THE HUNGER SENSES A DISTURBANCE. ZOMBIE PYM REPORTS: SOMETHING ELSE IS DEVOURING PLANETS IN DEEP SPACE. IS IT FOOD OR A RIVAL?",
              ack: "TRACK PREY"
          }
      },
      surfer: {
          alive: {
              title: "FALL OF THE HERALD",
              desc: "SILVER OBJECT ENTERED ATMOSPHERE. INTERCEPTED BY HULK IN KANSAS. FOOTAGE CONFIRMS INFECTION. SILVER SURFER HAS FALLEN TO THE HUNGER.",
              ack: "ACTIVATE OMEGA PROTOCOL",
              image: "https://i.pinimg.com/1200x/ed/22/4b/ed224b12777f7372e1a4b6ca74912cf9.jpg"
          },
          zombie: {
              title: "FAST FOOD DELIVERY",
              desc: "A SILVER BEING HAS ENTERED THE ATMOSPHERE. TASTES LIKE COSMIC POWER. HULK HAS ALREADY TAKEN A BITE. THE HERALD IS OURS.",
              ack: "CONSUME POWER",
              image: "https://i.pinimg.com/1200x/ed/22/4b/ed224b12777f7372e1a4b6ca74912cf9.jpg"
          }
      },
      galactus: {
          alive: {
              title: "ARRIVAL OF GALACTUS",
              desc: "THE DEVOURER OF WORLDS IS IN ORBIT. THE SKY HAS TURNED PURPLE. HE IS NOT HERE TO SAVE US. HE IS HERE TO EAT. THE FINAL BATTLE FOR EARTH HAS BEGUN.",
              ack: "PREPARE FOR JUDGMENT",
              image: "https://i.pinimg.com/736x/03/c7/6c/03c76c56fccbdc6bc57aff5c1b506089.jpg"
          },
          zombie: {
              title: "THE MAIN COURSE",
              desc: "GALACTUS IS HERE. HE IS GIANT. HE IS FULL OF ENERGY. IF WE EAT THIS SPACE GOD, WE WILL NEVER HUNGER AGAIN. DINNER IS SERVED!",
              ack: "DEVOUR THE DEVOURER",
              image: "https://i.pinimg.com/736x/03/c7/6c/03c76c56fccbdc6bc57aff5c1b506089.jpg"
          }
      }
    },
    missions: {
        kraven: {
            title: "KRAVEN'S HUNT",
            description: ["Kraven the Hunter has established a hunting zone in Central Park. He is using survivors as bait.", "We must stop him before he kills more innocents."],
            objectives: [
                { title: "Locate Kraven", desc: "Track his movements in Central Park." },
                { title: "Neutralize Kraven", desc: "End the threat." }
            ]
        },
        fleshSleeps: {
            title: "WHERE FLESH SLEEPS",
            description: ["We have detected an underground facility where Kingpin stores 'fresh meat'.", "It's a human farm. We must liberate them."],
            objectives: [
                { title: "Infiltration", desc: "Enter the facility undetected." },
                { title: "Liberation", desc: "Free the prisoners." }
            ]
        },
        bases: {
            alpha: "BASE ALPHA",
            beta: "BASE BETA",
            gamma: "BASE GAMMA",
            delta: "BASE DELTA",
            epsilon: "BASE EPSILON",
            zeta: "BASE ZETA",
            desc: "Former S.H.I.E.L.D. operating base. May contain vital supplies.",
            objSecure: "Secure the perimeter",
            objRetrieve: "Retrieve data"
        },
        galactus: {
            title: "JUDGMENT DAY",
            description: ["Galactus has begun to feed. We must stop him or Earth will be destroyed.", "All available heroes must converge on his position."],
            objectives: [
                { title: "Attack Galactus", desc: "Coordinate a massive attack." },
                { title: "Save Earth", desc: "Prevent total destruction." }
            ]
        }
    },
    heroes: {
        hawkeye: { alias: "HAWKEYE", bio: "Master archer and assassin. Never misses." },
        lukecage: { alias: "LUKE CAGE", bio: "Unbreakable skin and superhuman strength." },
        daredevil: { alias: "DAREDEVIL", bio: "The Man Without Fear. Heightened senses." },
        thor: { alias: "THOR", bio: "God of Thunder. Wields the power of Mjolnir." },
        storm: { alias: "STORM", bio: "Controls the weather. A goddess among mortals." }
    },
    
    introSequence: {
        alive: [
            {
                text: "The ringing in your ears is the only thing drowning out the screams of the dying. You taste copper; blood. The Triad's armored transport, that cage on wheels taking you to the slaughterhouse, is now a twisted mass of metal and burnt flesh. They were going to sell you, use you as guinea pigs or entertainment... but fate has rolled the dice.",
                image: "https://i.postimg.cc/s2krL4L6/Video-con-humo-llamas-y-nubes-1.gif"
            },
            {
                text: "You touch your neck. The inhibitor collar's LED is off. The impact fried the circuits. You are free. But in this world, freedom comes at a price: now you are prey. The black smoke is a beacon; the crash noise, a dinner bell for every hungry biter within five kilometers. You can already hear their growls mixing with distant sirens.",
                image: "https://i.postimg.cc/FHdhNV6n/Image-to-Video.gif"
            },
            {
                text: "A figure appears silhouetted by the flames. She doesn't wear the Triad uniform. She extends a hand covered in scars and grease. 'You can stay there lying down and be the appetizer, or you can get up and be the ones pulling the trigger. The shelter is close... but the asphalt is going to run red before we get there.'",
                image: "https://i.postimg.cc/4xpjWHtk/Mind-Video-20251212162510-850.gif"
            }
        ],
        zombie: [
            {
                text: "We didn't go to fight a war. We went to end one. Jennifer Walters (She-Hulk) had screamed for us. The Triad (Doom, Magneto, Fisk) had kidnapped Bruce Banner. Their plan: use the 'Nullifier Pulse' to turn superhumans into slaves. Our mission was simple: infiltrate that concrete lab, free Bruce, and dismantle the weapon. We were there, gritting our teeth, ready for the fight... But we couldn't make it. The Pulse activated, and everything happened too fast. A second of delay was our doom. The weapon failed.",
                image: "https://i.pinimg.com/736x/a8/4c/e3/a84ce31bf7d6eb9388981f219a720368.jpg"
            },
            {
                text: "When the alarms rang, we were already in the hallways, and the green color flooded everything. The virus touched us. And, instead of killing us, it woke us up. The pain vanished, and in its place came the Hunger. Not like a scream, but like a constant cold, a void that no power can quench. We were heroes, and now we are the mistake. The lab is now our personal slaughterhouse. And in the heart of the complex, we hear him. Hulk didn't die. The monster woke up. Soulless, unrestrained. Every beat of his heart spreads the Gamma plague. Now we understand: Hulk is the origin, and the last thing we tried was what unleashed the catastrophe.",
                image: "https://i.pinimg.com/736x/31/a1/24/31a124c7e30411a4fe906723b7e5ff2d.jpg"
            },
            {
                text: "S.H.I.E.L.D. arrived too late. They sealed the complex, bombed the coordinates. They call our home 'Lost Zone'. The outside world still believes it can contain this, that it can reverse it. They don't know the origin is still roaring. They don't know the virus has granted us a power we never knew. It's no longer about salvation. It's about expansion. We have learned to walk with this void. We have learned to use this rage. The virus learned to walk. And we... are going to hunt it all.",
                image: "https://i.pinimg.com/736x/e9/82/23/e98223ab8a1251e8fe9fce826dd3385f.jpg"
            }
        ]
    },
    story: {
        loading: {
            line1: "INITIALIZING...",
            line2: "LOADING FILES...",
            line3: "ACCESSING MEMORY...",
            line4: "SYSTEM READY"
        },
        slides: [
            { text: "There were no trumpets. No red skies or ancient prophecies being fulfilled. The end of the world didn't come from outer space, nor from a dark dimension.", image: "https://i.pinimg.com/1200x/18/99/ec/1899ec756f8731e015eb941d7122fbec.jpg" },
            { text: "We built it. Here. At home.\nOr rather, *they* built it.", image: "https://i.pinimg.com/1200x/71/06/7d/71067db72856dfd6ca03d0d51a679bd6.jpg" },
            { text: "It happened in a sterile laboratory. Three men met there: Victor Von Doom, Magneto, and Wilson Fisk.\nThey decided that humanity was too chaotic. Their solution was cold, hard science: the Nullifier Pulse.", image: "https://i.pinimg.com/1200x/71/06/7d/71067db72856dfd6ca03d0d51a679bd6.jpg" },
            { text: "They needed bodies to fine-tune the formula. They used Jamie Madrox to see how the infection multiplied. They used the Reavers to see if metal could get sick. And it worked.", image: "https://i.pinimg.com/1200x/99/80/1e/99801e7603e4a770127ce29530f13f87.jpg" },
            { text: "But arrogance is a loaded gun that always points back at you.", image: "https://i.pinimg.com/1200x/19/26/53/1926533335a2b27c4a79c9d2632ec83d.jpg" },
            { text: "They decided to test their masterpiece on Bruce Banner. They sought an infinite power source; what they got was a biological bomb.", image: "https://i.pinimg.com/1200x/b2/06/15/b20615925dfa53cdf9622fb596cdd5e3.jpg" },
            { text: "When the virus touched the gamma blood, it didn't die. It became enraged. Banner didn't fall. The thing that woke up had no one at the wheel anymore.", image: "https://i.pinimg.com/1200x/a8/e9/b7/a8e9b76d6a9a87de0cfba509d5fef534.jpg" },
            { text: "The blast wasn't fire, it was contagion. Hulk roared, and extinction traveled in that roar.", image: "https://i.pinimg.com/1200x/eb/db/e8/ebdbe8d5738acd105654dc8ddad8216f.jpg" },
            { text: "In a matter of hours, New York was a slaughterhouse. The Avengers fell first, torn apart by the friends they were trying to save.", image: "https://i.pinimg.com/1200x/b9/0a/18/b90a18369639b131f91273f019b699cd.jpg" },
            { text: "And the Triad? Doom, Magneto, and Fisk were caught by their own creation. But fate has a cruel sense of humor.", image: "https://i.pinimg.com/1200x/e1/02/86/e102864e130bfa5b5f2ffc5a9d9ed9c0.jpg" },
            { text: "They didn't lose their minds. Their bodies rotted, but their intellect remained intact. Now they sit on thrones of bone, ruling nightmare factions.", image: "https://i.pinimg.com/1200x/e2/5c/3a/e25c3ac26e5fc65f9119b6073912e856.jpg" },
            { text: "But there is something else out there. S.H.I.E.L.D. is still active. It is not an agency; it is a weaponized ghost. A paranoid AI that has decided the only way to maintain order is to eliminate everything that moves.", image: "https://i.pinimg.com/1200x/39/c8/cd/39c8cde0a5b56acc78b41c4eecf91f0a.jpg" },
            { text: "So here you are. Standing on the ashes. It's no longer about saving the world. It's about seeing who is left standing.", image: "https://i.pinimg.com/1200x/45/7d/c5/457dc515c61d470eb26cf1727ebd67ea.jpg" },
            { text: "Tell me, survivor... in this new era of monsters and machines: WHAT ARE YOU?", image: "https://i.pinimg.com/1200x/18/85/ee/1885ee42132b6976d36896a81f33ad8c.jpg" }
        ],
        choose: "CHOOSE YOUR DESTINY",
        optionA: "SURVIVOR",
        optionB: "ZOMBIE",
        skip: "SKIP",
        prev: "PREV",
        next: "NEXT"
    },
    tutorial: {
        welcome: { title: "WELCOME TO SHIELD", text: "The world has fallen, but the resistance continues. This is your command interface." },
        map_zones: { title: "CONTROL ZONES", text: "The map shows territories controlled by factions. Be careful when deploying your agents." },
        hulk: { title: "MOBILE THREAT", text: "Zombie Hulk roams the map. Avoid direct contact unless you are prepared." },
        missions: { title: "ACTIVE MISSIONS", text: "Available missions will appear here. Complete them to gain resources and advance the story." },
        bunker_entry: { title: "BUNKER ACCESS", text: "Manage your team, recruit new heroes, and check the status of your agents here." },
        roster: { title: "AGENT LIST", text: "Your available heroes. Click to view details and assign missions." },
        file: { title: "DOSSIER", text: "Detailed agent information. Here you can view their history and personal objectives." },
        recruit: { title: "RECRUITMENT", text: "Search and recruit new heroes from the SHIELD database." },
        finish: { title: "READY FOR COMBAT", text: "Good luck, Commander. Humanity depends on you." },
        finishBtn: "FINISH",
        skip: "SKIP",
        next: "NEXT"
    }
  }
};