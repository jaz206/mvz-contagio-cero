
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
    file: {
      title: "EXPEDIENTE TÁCTICO"
    },
    factions: {
      magneto: { name: "IMPERIO DE MAGNETO" },
      kingpin: { name: "TERRITORIO DE KINGPIN" },
      hulk: { name: "TIERRAS BALDÍAS DE HULK" },
      doom: { name: "LATVERIA (DR. DOOM)" }
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
      editorBtn: "ACCESO DE EDITOR (NIVEL 10)",
      editorPass: "CÓDIGO DE ACCESO MAESTRO",
      error: "ERROR DE AUTENTICACIÓN",
      passError: "CONTRASEÑA INCORRECTA"
    },
    missionModal: {
      title: "ARCHIVO DE MISIÓN",
      threat: "NIVEL DE AMENAZA",
      briefing: "INFORME DE MISIÓN",
      objectives: "OBJETIVOS PRIMARIOS",
      downloadPdf: "DESCARGAR INFORME TÁCTICO COMPLETO",
      cancel: "CERRAR",
      reactivate: "REACTIVAR",
      sending: "ENVIANDO...",
      sent: "REPORTE ENVIADO",
      complete: "REPORTAR ÉXITO",
      accept: "ACEPTAR MISIÓN"
    },
    bunker: {
      title: "PUESTO DE MANDO AVANZADO",
      hiveTitle: "NEXO DE LA COLMENA",
      return: "VOLVER AL MAPA TÁCTICO",
      roster: "LISTA DE ACTIVOS",
      recruit: "RECLUTAR",
      currentStory: "SITUACIÓN ACTUAL",
      objectives: "OBJETIVOS PERSONALES",
      status: "ESTADO OPERATIVO",
      unassign: "RETIRAR",
      assign: "ASIGNAR A MISIÓN",
      assignModalTitle: "SELECCIONAR MISIÓN",
      noMissions: "NO HAY MISIONES DISPONIBLES",
      cancel: "CANCELAR",
      maxHeroes: "CAPACIDAD MÁXIMA ALCANZADA"
    },
    recruit: {
      title: "RECLUTAMIENTO DE ACTIVO",
      selectDb: "SELECCIONAR DE LA BASE DE DATOS (NUBE)",
      loadingDb: "ACCEDIENDO A ARCHIVOS...",
      alias: "ALIAS / NOMBRE EN CLAVE",
      name: "NOMBRE REAL",
      adminSeed: "ADMIN: SUBIR DATOS INICIALES",
      seedSuccess: "DB SEMBRADA CON ÉXITO",
      submit: "REGISTRAR EN LA BASE DE DATOS"
    },
    missionEditor: {
      title: "EDITOR DE MISIONES",
      missionTitle: "TÍTULO DE LA MISIÓN",
      location: "UBICACIÓN (ESTADO)",
      threat: "NIVEL DE AMENAZA",
      type: "TIPO DE MISIÓN",
      pdfUrl: "URL DEL INFORME (OPCIONAL)",
      description: "DESCRIPCIÓN",
      objectives: "OBJETIVOS",
      addObjective: "AÑADIR OBJETIVO",
      objTitle: "Título del Objetivo",
      objDesc: "Descripción del Objetivo",
      cancel: "CANCELAR",
      save: "GUARDAR CAMBIOS"
    },
    events: {
      anomaly: {
          title: "ANOMALÍA CÓSMICA DETECTADA",
          desc: "LECTURAS DE ENERGÍA DESCONOCIDA EN EL ESPACIO PROFUNDO. REED RICHARDS CONFIRMA: UN PLANETA DEL SISTEMA VEGA HA DEJADO DE EXISTIR INSTANTÁNEAMENTE.",
          ack: "CONTINUAR MONITORIZACIÓN"
      },
      surfer: {
          title: "LA CAÍDA DEL HERALDO",
          desc: "OBJETO PLATEADO ENTRÓ EN LA ATMÓSFERA. INTERCEPTADO POR HULK EN KANSAS. VÍDEO CONFIRMA INFECCIÓN. SILVER SURFER HA CAÍDO ANTE EL HAMBRE. REPITO: TENEMOS A UN HERALDO ZOMBIE EN JUEGO.",
          ack: "ACTIVAR PROTOCOLO OMEGA",
          image: "https://i.pinimg.com/1200x/ed/22/4b/ed224b12777f7372e1a4b6ca74912cf9.jpg"
      },
      galactus: {
          title: "LLEGADA DE GALACTUS",
          desc: "EL DEVORADOR DE MUNDOS ESTÁ EN ÓRBITA. EL CIELO SE HA VUELTO PÚRPURA. NO VIENE A SALVARNOS. VIENE A COMER. LA ÚLTIMA BATALLA POR LA TIERRA HA COMENZADO.",
          ack: "PREPARARSE PARA EL JUICIO FINAL",
          image: "https://i.pinimg.com/736x/03/c7/6c/03c76c56fccbdc6bc57aff5c1b506089.jpg"
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
        },
        freshMeat: {
            title: "CARNE FRESCA",
            description: [
                "El Hambre quema. Olemos sangre caliente al sur. Un convoy de refugiados intenta cruzar la frontera del estado.",
                "Son lentos. Son débiles. Son comida.",
                "No dejes que ninguno escape. La Colmena necesita crecer."
            ],
            objectives: [
                { title: "Banquete", desc: "Devora a 15 civiles antes de que alcancen el refugio." },
                { title: "Sin Testigos", desc: "Destruye el vehículo de escolta blindado." }
            ]
        },
        breakSiege: {
            title: "ROMPER EL ASEDIO",
            description: [
                "La resistencia se ha hecho fuerte en una base militar de la costa. Creen que sus muros los protegerán.",
                "Ilusos. No saben que no necesitamos puertas.",
                "Lidera la horda. Trepad los muros. Inundad sus pasillos con dientes y garras."
            ],
            objectives: [
                { title: "Marea Muerta", desc: "Supera las defensas perimetrales y abre la puerta principal." },
                { title: "Asimilación", desc: "Infecta al Comandante de la base." }
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
            { text: "El estallido no fue de fuego, fue de contagio. Hulk rugió, y en ese rugido viajaba la extinción.", image: "https://i.pinimg.com/1200x/eb/db/e8/ebdbe8d5738acd105654dc8ddad8216f.jpg" },
            { text: "En cuestión de horas, Nueva York era un matadero. Los Vengadores cayeron primero, destrozados por los amigos que intentaban salvar.", image: "https://i.pinimg.com/1200x/b9/0a/18/b90a18369639b131f91273f019b699cd.jpg" },
            { text: "¿Y la Tríada? Doom, Magneto y Fisk fueron alcanzados por su propia creación. Pero el destino tiene un sentido del humor cruel.", image: "https://i.pinimg.com/1200x/e1/02/86/e102864e130bfa5b5f2ffc5a9d9ed9c0.jpg" },
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
        welcome: { title: "BIENVENIDO A S.H.I.E.L.D.", text: "El mundo ha caído, pero la resistencia continúa. Esta es tu interfaz de mando." },
        map_zones: { title: "ZONAS DE CONTROL", text: "El mapa muestra los territorios controlados por las facciones. Ten cuidado al desplegar tus agentes." },
        hulk: { title: "AMENAZA MÓVIL", text: "Hulk Zombie vaga por el mapa. Evita el contacto directo a menos que estés preparado." },
        missions: { title: "MISIONES ACTIVAS", text: "Aquí aparecerán las misiones disponibles. Complétalas para obtener recursos y avanzar en la historia." },
        bunker_entry: { title: "ACCESO AL BÚNKER", text: "Gestiona tu equipo, recluta nuevos héroes y revisa el estado de tus agentes aquí." },
        roster: { title: "LISTA DE AGENTES", text: "Tus héroes disponibles. Haz clic para ver detalles y asignar misiones." },
        file: { title: "EXPEDIENTE", text: "Información detallada del agente. Aquí puedes ver su historia y objetivos personales." },
        recruit: { title: "RECLUTAMIENTO", text: "Busca y recluta nuevos héroes de la base de datos de S.H.I.E.L.D." },
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
    file: {
      title: "TACTICAL DOSSIER"
    },
    factions: {
      magneto: { name: "MAGNETO'S EMPIRE" },
      kingpin: { name: "KINGPIN'S TERRITORY" },
      hulk: { name: "HULK'S WASTELAND" },
      doom: { name: "LATVERIA (DR. DOOM)" }
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
      accept: "ACCEPT MISSION"
    },
    bunker: {
      title: "FORWARD COMMAND POST",
      hiveTitle: "HIVE NEXUS",
      return: "RETURN TO TACTICAL MAP",
      roster: "ASSET LIST",
      recruit: "RECRUIT",
      currentStory: "CURRENT STATUS",
      objectives: "PERSONAL OBJECTIVES",
      status: "OPERATIONAL STATUS",
      unassign: "WITHDRAW",
      assign: "ASSIGN TO MISSION",
      assignModalTitle: "SELECT MISSION",
      noMissions: "NO MISSIONS AVAILABLE",
      cancel: "CANCEL",
      maxHeroes: "MAXIMUM CAPACITY REACHED"
    },
    recruit: {
      title: "ASSET RECRUITMENT",
      selectDb: "SELECT FROM S.H.I.E.L.D. DATABASE (CLOUD)",
      loadingDb: "ACCESSING FILES...",
      alias: "CODENAME",
      name: "REAL NAME",
      adminSeed: "ADMIN: SEED DB",
      seedSuccess: "DB SEEDED SUCCESSFULLY",
      submit: "REGISTER TO DATABASE"
    },
    missionEditor: {
      title: "MISSION EDITOR",
      missionTitle: "MISSION TITLE",
      location: "LOCATION (STATE)",
      threat: "THREAT LEVEL",
      type: "MISSION TYPE",
      pdfUrl: "PDF URL (OPTIONAL)",
      description: "DESCRIPTION",
      objectives: "OBJECTIVES",
      addObjective: "ADD OBJECTIVE",
      objTitle: "Objective Title",
      objDesc: "Objective Description",
      cancel: "CANCEL",
      save: "SAVE CHANGES"
    },
    events: {
      anomaly: {
          title: "COSMIC ANOMALY DETECTED",
          desc: "UNKNOWN ENERGY READINGS IN DEEP SPACE. REED RICHARDS CONFIRMA: A PLANETA IN THE VEGA SYSTEM CEASED TO EXIST INSTANTANEOUSLY.",
          ack: "CONTINUE MONITORING"
      },
      surfer: {
          title: "FALL OF THE HERALD",
          desc: "SILVER OBJECT ENTERED ATMOSPHERE. INTERCEPTED BY HULK IN KANSAS. FOOTAGE CONFIRMS INFECTION. SILVER SURFER HAS FALLEN TO THE HUNGER. REPEAT: WE HAVE A ZOMBIE HERALD IN PLAY.",
          ack: "ACTIVATE OMEGA PROTOCOL",
          image: "https://i.pinimg.com/1200x/ed/22/4b/ed224b12777f7372e1a4b6ca74912cf9.jpg"
      },
      galactus: {
          title: "ARRIVAL OF GALACTUS",
          desc: "THE DEVOURER OF WORLDS IS IN ORBIT. THE SKY HAS TURNED PURPLE. HE IS NOT HERE TO SAVE US. HE IS HERE TO EAT. THE FINAL BATTLE FOR EARTH HAS BEGUN.",
          ack: "PREPARE FOR JUDGMENT",
          image: "https://i.pinimg.com/736x/03/c7/6c/03c76c56fccbdc6bc57aff5c1b506089.jpg"
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
    story: {
        loading: {
            line1: "INITIALIZING...",
            line2: "LOADING FILES...",
            line3: "ACCESSING MEMORY...",
            line4: "SYSTEM READY"
        },
        slides: [
            { text: "There were no trumpets. No red skies. The end of the world didn't come from outer space.", image: "https://i.pinimg.com/1200x/18/99/ec/1899ec756f8731e015eb941d7122fbec.jpg" },
            { text: "We built it ourselves. Here. At home.\nOr rather, they built it.", image: "https://i.pinimg.com/1200x/71/06/7d/71067db72856dfd6ca03d0d51a679bd6.jpg" },
            { text: "It was in a sterile lab. Three men met there: Doom, Magneto, and Fisk.\nThey decided humanity was too chaotic. Their solution was cold science: The Nullifier Pulse.", image: "https://i.pinimg.com/1200x/71/06/7d/71067db72856dfd6ca03d0d51a679bd6.jpg" },
            { text: "They needed bodies to fine-tune the formula. They used Jamie Madrox. They used the Reavers. And it worked.", image: "https://i.pinimg.com/1200x/99/80/1e/99801e7603e4a770127ce29530f13f87.jpg" },
            { text: "But arrogance is a loaded gun that always points backward.", image: "https://i.pinimg.com/1200x/19/26/53/1926533335a2b27c4a79c9d2632ec83d.jpg" },
            { text: "They decided to test their masterpiece on Bruce Banner. They sought infinite energy; they got a biological bomb.", image: "https://i.pinimg.com/1200x/b2/06/15/b20615925dfa53cdf9622fb596cdd5e3.jpg" },
            { text: "When the virus touched the gamma blood, it didn't die. It raged. Banner didn't fall. The thing that woke up had no one at the wheel.", image: "https://i.pinimg.com/1200x/a8/e9/b7/a8e9b76d6a9a87de0cfba509d5fef534.jpg" },
            { text: "The outbreak wasn't fire, it was contagion. Hulk roared, and in that roar traveled extinction.", image: "https://i.pinimg.com/1200x/eb/db/e8/ebdbe8d5738acd105654dc8ddad8216f.jpg" },
            { text: "In hours, New York was a slaughterhouse. The Avengers fell first, torn apart by the friends they tried to save.", image: "https://i.pinimg.com/1200x/b9/0a/18/b90a18369639b131f91273f019b699cd.jpg" },
            { text: "And the Triad? Doom, Magneto, and Fisk were caught by their own creation. But fate has a cruel sense of humor.", image: "https://i.pinimg.com/1200x/e1/02/86/e102864e130bfa5b5f2ffc5a9d9ed9c0.jpg" },
            { text: "They didn't lose their minds. Their bodies rotted, but their intellect remained intact. Now they sit on thrones of bone.", image: "https://i.pinimg.com/1200x/e2/5c/3a/e25c3ac26e5fc65f9119b6073912e856.jpg" },
            { text: "But something else is out there. S.H.I.E.L.D. remains active. Not an agency, but a weaponized ghost. A paranoid AI.", image: "https://i.pinimg.com/1200x/39/c8/cd/39c8cde0a5b56acc78b41c4eecf91f0a.jpg" },
            { text: "So here you are. Standing on the ashes. It's no longer about saving the world. It's about who's left standing.", image: "https://i.pinimg.com/1200x/45/7d/c5/457dc515c61d470eb26cf1727ebd67ea.jpg" },
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
