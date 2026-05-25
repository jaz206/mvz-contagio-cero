import { I18nString } from '../types';

interface HeroLoreEntry {
    origin: I18nString;
    bio: I18nString;
    currentStory: I18nString;
}

const normalizeHeroKey = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\(artist\)/g, 'artist')
    .replace(/\(old man\)/g, 'oldman')
    .replace(/\(z\)/g, 'z')
    .replace(/\(zombie\)/g, 'zombie')
    .replace(/[^a-z0-9]+/g, '');

const entry = (originEs: string, originEn: string, bioEs: string, bioEn: string, currentEs: string, currentEn: string): HeroLoreEntry => ({
    origin: { es: originEs, en: originEn },
    bio: { es: bioEs, en: bioEn },
    currentStory: { es: currentEs, en: currentEn }
});

const HERO_LORE: Record<string, HeroLoreEntry> = {
    blackpanther: entry(
        'T’Challa heredó el trono de Wakanda y el manto de la Pantera Negra tras una vida marcada por la diplomacia, la guerra y el peso del legado real. Como rey, científico y guerrero, ha protegido a su nación de invasiones externas y crisis globales sin renunciar nunca a su deber.',
        "T'Challa inherited the throne of Wakanda and the mantle of the Black Panther after a life shaped by diplomacy, war, and the burden of royal legacy. As king, scientist, and warrior, he has defended his nation from outside invasions and global crises without ever abandoning his duty.",
        'Consume la hierba con forma de corazón para potenciar reflejos, fuerza y sentidos por encima de lo humano. Combina entrenamiento marcial de élite con tecnología wakandiana y una disciplina táctica excepcional.',
        'He draws enhanced reflexes, strength, and heightened senses from the heart-shaped herb. He combines elite martial training with Wakandan technology and exceptional tactical discipline.',
        'Activo de prioridad alfa. Recomendado para operaciones de infiltración de alto riesgo, liderazgo de escuadras reducidas y recuperación de activos sensibles.',
        'Alpha-priority asset. Recommended for high-risk infiltration, small-team leadership, and sensitive asset recovery.'
    ),
    doctorstrange: entry(
        'Stephen Strange fue un cirujano brillante y arrogante hasta que un accidente destrozó sus manos. Su búsqueda desesperada de una cura lo llevó a Kamar-Taj, donde dejó atrás su antigua vida para convertirse en el Hechicero Supremo de la Tierra.',
        'Stephen Strange was a brilliant and arrogant surgeon until an accident shattered his hands. His desperate search for a cure led him to Kamar-Taj, where he left his old life behind and became Earth’s Sorcerer Supreme.',
        'Canaliza artes místicas, abre portales y despliega hechizos de contención, protección y ataque dimensional. Su mayor ventaja es la versatilidad estratégica, pero los conjuros de alto nivel exigen foco absoluto.',
        'He channels mystic arts, opens portals, and deploys containment, protection, and dimensional attack spells. His greatest advantage is strategic versatility, but high-level spells demand absolute focus.',
        'Activo de prioridad omega. Recomendado para contención sobrenatural, neutralización de anomalías y apoyo táctico frente a amenazas no convencionales.',
        'Omega-priority asset. Recommended for supernatural containment, anomaly neutralization, and tactical support against unconventional threats.'
    ),
    msmarvel: entry(
        'Kamala Khan es una adolescente de Jersey City que pasó de ser una fan de los héroes a convertirse en uno de ellos. Su vocación nace tanto de su sentido de la justicia como de su necesidad de proteger a la gente corriente.',
        'Kamala Khan is a teenager from Jersey City who went from being a hero fan to becoming one herself. Her drive comes as much from her sense of justice as from her need to protect ordinary people.',
        'Su fisiología alterada le permite aumentar masa, estirar extremidades y golpear con una potencia sorprendente. Se adapta rápido al caos de combate y responde mejor cuanto más protegidos están sus aliados.',
        'Her altered physiology lets her increase mass, stretch her limbs, and strike with surprising force. She adapts quickly to combat chaos and performs best when her allies are protected.',
        'Activo en desarrollo con alto potencial de crecimiento. Recomendado para operaciones móviles donde la flexibilidad de respuesta sea prioritaria.',
        'Developing asset with high growth potential. Recommended for mobile operations where response flexibility is critical.'
    ),
    scarletwitch: entry(
        'Wanda Maximoff ha vivido entre la tragedia, la manipulación y el poder desmedido desde muy joven. Su historia está marcada por la pérdida, pero también por una voluntad feroz de decidir su propio destino.',
        "Wanda Maximoff has lived among tragedy, manipulation, and overwhelming power since a very young age. Her history is defined by loss, but also by a fierce will to decide her own fate.",
        'Manipula energía hexagonal y magia del caos para alterar probabilidades, destruir objetivos y deformar el campo de batalla. Sus capacidades son devastadoras, aunque dependen de su estabilidad emocional y control mental.',
        'She manipulates hex energy and chaos magic to alter probabilities, destroy targets, and warp the battlefield. Her capabilities are devastating, though they depend on emotional stability and mental control.',
        'Activo de riesgo elevado y valor táctico extremo. Solo recomendable cuando el mando pueda asumir efectos colaterales imprevisibles.',
        'High-risk asset with extreme tactical value. Deployment recommended only when command can absorb unpredictable side effects.'
    ),
    spiderman: entry(
        'Peter Parker obtuvo sus poderes tras la picadura de una araña alterada y aprendió demasiado pronto que la responsabilidad tiene un precio real. Desde entonces ha combatido amenazas callejeras y crisis globales sin abandonar su impulso de proteger a cualquiera que lo necesite.',
        'Peter Parker gained his powers after being bitten by an altered spider and learned far too early that responsibility carries a real price. Since then he has fought street-level threats and global crises without abandoning his instinct to protect anyone in need.',
        'Dispone de fuerza proporcional, agilidad extrema, adherencia y un sentido arácnido capaz de anticipar peligro inmediato. Su movilidad y capacidad de improvisación lo convierten en uno de los activos más difíciles de fijar en combate.',
        'He possesses proportional strength, extreme agility, wall-crawling, and a spider-sense capable of anticipating immediate danger. His mobility and improvisational ability make him one of the hardest assets to pin down in combat.',
        'Activo de respuesta rápida. Recomendado para rescate, reconocimiento urbano y neutralización de amenazas con alta movilidad.',
        'Rapid-response asset. Recommended for rescue, urban reconnaissance, and neutralization of high-mobility threats.'
    ),
    thor: entry(
        'Thor Odinson es el heredero de Asgard y uno de los guerreros más antiguos que aún combaten por la Tierra. Su trayectoria mezcla honor guerrero, arrogancia superada a golpes y un sentido del deber que lo mantiene en primera línea incluso ante amenazas cósmicas.',
        'Thor Odinson is the heir to Asgard and one of the oldest warriors still fighting for Earth. His career blends warrior honor, hard-earned humility, and a sense of duty that keeps him on the front line even against cosmic threats.',
        'Empuña una fuerza física descomunal y controla tormentas, rayos y presión atmosférica con capacidad de devastación masiva. Enfrenta daño extremo sin perder capacidad operativa y puede romper líneas enemigas por puro impacto.',
        'He wields overwhelming physical strength and controls storms, lightning, and atmospheric pressure with massive destructive output. He absorbs extreme punishment without losing combat efficiency and can break enemy lines through sheer impact.',
        'Activo de asalto pesado. Recomendado para aperturas de frente, supresión de objetivos mayores y misiones de choque donde la moral enemiga deba colapsar rápido.',
        'Heavy assault asset. Recommended for front-line breaches, suppression of major targets, and shock missions meant to break enemy morale quickly.'
    ),
    colossus: entry(
        'Piotr Rasputin creció en una granja soviética antes de unirse a los X-Men, llevando siempre consigo una mezcla de humildad, sensibilidad artística y lealtad absoluta. Su historial demuestra que bajo la apariencia de tanque viviente hay una brújula moral muy estable.',
        'Piotr Rasputin grew up on a Soviet farm before joining the X-Men, always carrying humility, artistic sensitivity, and absolute loyalty. His record shows that beneath the appearance of a living tank lies a very stable moral compass.',
        'Puede transformar su cuerpo en acero orgánico, ganando fuerza masiva y resistencia extraordinaria. Su rendimiento óptimo aparece en tareas de ruptura, cobertura y protección directa de unidades vulnerables.',
        'He can transform his body into organic steel, gaining massive strength and extraordinary durability. His best performance comes in breaching, shielding, and direct protection of vulnerable units.',
        'Activo de contención física y anclaje táctico. Recomendado para sostener pasillos, absorber castigo y mantener cohesionada la línea de avance.',
        'Physical containment and tactical anchor asset. Recommended for holding corridors, absorbing punishment, and keeping the advance line intact.'
    ),
    magneto: entry(
        'Erik Lehnsherr sobrevivió al horror del genocidio antes de convertirse en uno de los líderes mutantes más temidos del planeta. Su ideología ha oscilado entre la revolución y la defensa extrema, pero siempre gira en torno a la supervivencia de su especie.',
        'Erik Lehnsherr survived the horror of genocide before becoming one of the most feared mutant leaders on the planet. His ideology has shifted between revolution and extreme defense, but always revolves around the survival of his people.',
        'Controla campos magnéticos y metal a gran escala, desde armaduras y proyectiles hasta infraestructuras enteras. Su capacidad ofensiva es inmensa y su ventaja estratégica aumenta en entornos industriales o urbanizados.',
        'He controls magnetic fields and metal on a massive scale, from armor and projectiles to entire infrastructures. His offensive capability is immense, and his strategic advantage grows in industrial or urban environments.',
        'Activo de alto valor y alta volatilidad política. Recomendado solo cuando el objetivo justifique negociar con una fuerza capaz de dominar el teatro completo.',
        'High-value asset with high political volatility. Recommended only when the objective justifies working with a force capable of dominating the entire theater.'
    ),
    mystique: entry(
        'Raven Darkholme ha pasado décadas infiltrando gobiernos, organizaciones criminales y redes de inteligencia. Su expediente es un mosaico de lealtades cambiantes, supervivencia personal y operaciones encubiertas de altísimo nivel.',
        'Raven Darkholme has spent decades infiltrating governments, criminal organizations, and intelligence networks. Her file is a mosaic of shifting loyalties, personal survival, and extremely high-level covert operations.',
        'Su mutación le permite alterar su apariencia y voz con precisión quirúrgica, facilitando infiltración, sabotaje y manipulación. No destaca por potencia bruta, pero sí por penetración operativa y engaño sostenido.',
        'Her mutation allows her to alter appearance and voice with surgical precision, enabling infiltration, sabotage, and manipulation. She does not excel in brute force, but in operational penetration and sustained deception.',
        'Activo útil para operaciones grises. Recomendado para inteligencia humana, extracción silenciosa y misiones donde la identidad sea un arma.',
        'Useful asset for gray operations. Recommended for human intelligence, silent extraction, and missions where identity itself is a weapon.'
    ),
    rogue: entry(
        'Anna Marie creció huyendo de un poder que la aisló incluso de quienes quería tocar. Con el tiempo encontró en los X-Men un lugar donde convertir una maldición en disciplina y un instinto de supervivencia en protección para otros.',
        'Anna Marie grew up fleeing a power that isolated her even from those she wanted to touch. In time she found among the X-Men a place where a curse became discipline and survival instinct became protection for others.',
        'Absorbe energía vital, recuerdos y a veces habilidades mediante contacto directo. Cuando controla la exposición, combina fuerza y vuelo con una capacidad única para desactivar combatientes peligrosos.',
        'She absorbs life energy, memories, and sometimes powers through direct contact. When exposure is controlled, she combines strength and flight with a unique ability to neutralize dangerous combatants.',
        'Activo de neutralización cuerpo a cuerpo. Recomendado para interdicción de objetivos especiales y supresión de amenazas con dones superiores.',
        'Close-quarters neutralization asset. Recommended for interdiction of special targets and suppression of threats with superior gifts.'
    ),
    storm: entry(
        'Ororo Munroe fue adorada como diosa, ladrona de supervivencia en las calles y finalmente líder de los X-Men. Su historial mezcla nobleza, temple y una presencia que inspira confianza incluso bajo condiciones extremas.',
        'Ororo Munroe has been worshipped as a goddess, survived as a street thief, and ultimately led the X-Men. Her record blends nobility, composure, and a presence that inspires confidence even under extreme conditions.',
        'Controla fenómenos atmosféricos con precisión suficiente para cegar, dispersar, derribar o devastar objetivos enteros. Su dominio del terreno convierte aire y clima en una plataforma táctica completa.',
        'She controls atmospheric phenomena with enough precision to blind, scatter, disable, or devastate whole targets. Her command of terrain turns air and weather into a complete tactical platform.',
        'Activo de supremacía de campo. Recomendado para control territorial, apoyo aéreo improvisado y desestabilización de agrupaciones hostiles.',
        'Field-dominance asset. Recommended for territorial control, improvised air support, and destabilization of hostile groupings.'
    ),
    wolverine: entry(
        'Logan ha servido como soldado, espía, asesino y mentor durante más vidas de las que cualquier expediente puede resumir. Su historial está cubierto de violencia, pero también de una obstinada fidelidad a quienes considera su gente.',
        'Logan has served as soldier, spy, assassin, and mentor across more lives than any single file can summarize. His history is drenched in violence, but also in a stubborn loyalty to those he considers his own.',
        'Posee sentidos animales, factor curativo acelerado y garras de adamantium capaces de atravesar casi cualquier blindaje personal. Funciona especialmente bien en combate prolongado, persecución y ruptura salvaje de posiciones.',
        'He possesses animal senses, an accelerated healing factor, and adamantium claws capable of cutting through nearly any personal armor. He performs especially well in prolonged combat, pursuit, and savage position-breaking.',
        'Activo de asalto persistente. Recomendado para caza de objetivos, limpieza de interiores y escenarios donde la resistencia física sea decisiva.',
        'Persistent assault asset. Recommended for target hunting, interior clearing, and scenarios where raw endurance is decisive.'
    ),
    humantorch: entry(
        'Johnny Storm pasó de celebridad impulsiva a miembro clave de una de las familias más importantes del universo Marvel. Aunque su actitud siga siendo temeraria, su hoja de servicio demuestra valor real y voluntad de sacrificio.',
        'Johnny Storm went from reckless celebrity to key member of one of Marvel’s most important families. While his attitude remains impulsive, his service record proves real courage and a willingness to sacrifice.',
        'Genera llamas intensas, proyecta calor concentrado y puede alcanzar vuelo supersónico envuelto en combustión. Su potencial ofensivo es sobresaliente, especialmente en entornos abiertos o contra masas enemigas.',
        'He generates intense flame, projects concentrated heat, and can achieve supersonic flight while engulfed in combustion. His offensive potential is outstanding, especially in open environments or against enemy swarms.',
        'Activo de choque incendiario. Recomendado para negar terreno, romper acumulaciones hostiles y ejecutar ataques de entrada rápida.',
        'Incendiary shock asset. Recommended for area denial, breaking hostile concentrations, and rapid-entry strikes.'
    ),
    invisiblewoman: entry(
        'Sue Storm ha ejercido como corazón moral, comandante de crisis y columna vertebral de los Cuatro Fantásticos. Su historial demuestra una capacidad constante para sostener equipos bajo presión sin perder autoridad.',
        'Sue Storm has served as moral center, crisis commander, and backbone of the Fantastic Four. Her record shows a constant ability to hold teams together under pressure without losing authority.',
        'Manipula campos de fuerza e invisibilidad con una precisión que sirve tanto para defensa como para ataque. Puede encapsular aliados, bloquear proyectiles o aislar blancos con un control excelente del espacio.',
        'She manipulates force fields and invisibility with precision that serves both defense and attack. She can encapsulate allies, block projectiles, or isolate targets with excellent spatial control.',
        'Activo de protección avanzada. Recomendado para cobertura de escuadra, extracción crítica y control del espacio en zonas cerradas.',
        'Advanced protection asset. Recommended for squad shielding, critical extraction, and spatial control in confined zones.'
    ),
    misterfantastic: entry(
        'Reed Richards es uno de los científicos más peligrosamente brillantes del planeta y el arquitecto de múltiples avances imposibles. Su historial combina exploración, genialidad y una tendencia a asumir riesgos que otros apenas comprenden.',
        'Reed Richards is one of the most dangerously brilliant scientists on the planet and the architect of multiple impossible breakthroughs. His history combines exploration, genius, and a tendency to take risks others barely understand.',
        'Su cuerpo elástico le permite adaptarse, absorber impactos y reposicionarse con una flexibilidad excepcional. Sin embargo, su mayor arma sigue siendo la capacidad de analizar un problema, improvisar tecnología y encontrar una salida improbable.',
        'His elastic body allows him to adapt, absorb impact, and reposition with exceptional flexibility. However, his greatest weapon remains the ability to analyze a problem, improvise technology, and find an unlikely solution.',
        'Activo de inteligencia estratégica. Recomendado para resolución de crisis complejas, liderazgo científico y diseño de respuestas no convencionales.',
        'Strategic intelligence asset. Recommended for solving complex crises, scientific leadership, and designing unconventional responses.'
    ),
    thething: entry(
        'Ben Grimm fue piloto, amigo leal y el primero en pagar el precio físico de la aventura espacial de los Richards. Desde entonces ha convertido dolor, humor seco y determinación en una de las fuerzas más fiables del campo.',
        "Ben Grimm was a pilot, loyal friend, and the first to pay the physical price for the Richards family's space adventure. Since then, he has turned pain, dark humor, and determination into one of the field’s most reliable forces.",
        'Su piel rocosa le concede una resistencia extraordinaria y una fuerza devastadora en distancias cortas. No es sutil ni rápido, pero soporta castigo y abre huecos donde otros solo ven una pared.',
        'His rocky hide grants extraordinary durability and devastating strength at short range. He is neither subtle nor fast, but he absorbs punishment and opens breaches where others see only a wall.',
        'Activo de ruptura y protección cercana. Recomendado para sostener posiciones, absorber fuego enemigo y ganar terreno por pura presencia física.',
        'Breach and close-protection asset. Recommended for holding positions, absorbing enemy fire, and gaining ground through sheer physical presence.'
    ),
    antman: entry(
        'Scott Lang fue un ladrón con talento técnico que terminó encontrando una segunda oportunidad bajo el manto de Ant-Man. Su historial alterna humor, torpeza aparente y una sorprendente capacidad para hacer lo correcto bajo presión.',
        'Scott Lang was a skilled thief who found a second chance under the Ant-Man mantle. His record alternates humor, apparent clumsiness, and a surprising ability to do the right thing under pressure.',
        'Gracias a las partículas Pym puede reducirse o aumentar de tamaño, infiltrarse por espacios imposibles y alterar el equilibrio de fuerza en pleno combate. Su flexibilidad táctica compensa con creces su apariencia poco intimidante.',
        'Through Pym Particles he can shrink or grow, infiltrate impossible spaces, and alter force balance mid-combat. His tactical flexibility more than compensates for his less intimidating appearance.',
        'Activo de infiltración y sabotaje. Recomendado para acceso encubierto, interrupción de sistemas y apoyo de precisión en objetivos muy protegidos.',
        'Infiltration and sabotage asset. Recommended for covert entry, system disruption, and precision support against heavily protected targets.'
    ),
    blackwidow: entry(
        'Natasha Romanoff fue entrenada para ser un arma del Estado antes de elegir su propio código moral. Desde entonces ha demostrado una mezcla letal de inteligencia, disciplina y sangre fría incluso en misiones sin margen de error.',
        'Natasha Romanoff was trained to be a weapon of the state before choosing her own moral code. Since then she has shown a lethal blend of intelligence, discipline, and cold control even on no-fail missions.',
        'Destaca en infiltración, combate cercano, armas ligeras y manipulación psicológica del objetivo. No depende de dones sobrehumanos: su ventaja reside en preparación, lectura del entorno y ejecución impecable.',
        'She excels in infiltration, close combat, light weapons, and psychological manipulation of the target. She does not rely on superhuman gifts: her edge lies in preparation, situational reading, and flawless execution.',
        'Activo de operaciones negras. Recomendado para inteligencia, eliminación silenciosa y recuperación de información en entornos hostiles.',
        'Black-ops asset. Recommended for intelligence work, silent eliminations, and information recovery in hostile environments.'
    ),
    falcon: entry(
        'Sam Wilson pasó de rescatista aéreo y consejero de veteranos a una de las figuras más estables del legado de los Vengadores. Su historial refleja empatía, liderazgo sereno y una gran capacidad para tomar decisiones bajo presión.',
        'Sam Wilson went from aerial rescue specialist and veterans counselor to one of the most stable figures in the Avengers legacy. His record reflects empathy, calm leadership, and a strong ability to make decisions under pressure.',
        'Su arnés alado le permite una movilidad aérea táctica excelente, reconocimiento rápido y ataques de apoyo precisos. Coordina bien desde altura y mantiene visión operativa donde otros pierden el control del terreno.',
        'His wing harness gives him excellent tactical aerial mobility, rapid reconnaissance, and precise support strikes. He coordinates well from altitude and maintains operational awareness where others lose control of the field.',
        'Activo de reconocimiento y apoyo aéreo. Recomendado para patrulla avanzada, vigilancia móvil y enlace entre escuadras dispersas.',
        'Reconnaissance and aerial-support asset. Recommended for forward patrol, mobile surveillance, and linking scattered squads.'
    ),
    quicksilver: entry(
        'Pietro Maximoff ha vivido siempre entre la impaciencia, la lealtad familiar y la necesidad constante de demostrar su valía. Su historial está lleno de impulsividad, pero también de actos decisivos cuando el tiempo de reacción lo es todo.',
        'Pietro Maximoff has always lived between impatience, family loyalty, and a constant need to prove his worth. His record is full of impulsiveness, but also decisive action when reaction time is everything.',
        'Su velocidad sobrehumana le permite reposicionarse, golpear primero y cruzar zonas letales antes de que el enemigo comprenda lo ocurrido. Funciona mejor como disruptor, mensajero de combate y ejecutor de maniobras relámpago.',
        'His superhuman speed allows him to reposition, strike first, and cross lethal zones before the enemy understands what happened. He performs best as a disruptor, combat courier, and lightning-fast maneuver asset.',
        'Activo de movilidad extrema. Recomendado para respuesta inmediata, interrupción de cadenas enemigas y recuperación urgente de personal o equipo.',
        'Extreme-mobility asset. Recommended for immediate response, enemy-chain disruption, and urgent recovery of personnel or equipment.'
    ),
    redskull: entry(
        'Johann Schmidt construyó su legado sobre fanatismo, manipulación y una obsesión patológica con el poder. Su historial demuestra una mente estratégica eficaz, aunque sostenida por una ideología tóxica incompatible con cualquier marco ético aceptable.',
        'Johann Schmidt built his legacy on fanaticism, manipulation, and a pathological obsession with power. His record shows an effective strategic mind, sustained by an ideology toxic and incompatible with any acceptable ethical framework.',
        'No basa su valor en la fuerza bruta, sino en la capacidad de coordinar recursos, explotar fanatismos y dirigir células hostiles con una disciplina feroz. Es peligroso porque convierte estructura, miedo y propaganda en armas operativas.',
        'His value does not lie in brute force but in coordinating resources, exploiting fanaticism, and directing hostile cells with fierce discipline. He is dangerous because he turns structure, fear, and propaganda into operational weapons.',
        'Sujeto utilizable solo bajo circunstancias extremas y con contención política total. Recomendado exclusivamente para análisis de amenazas autoritarias o escenarios de infiltración ideológica.',
        'Usable only under extreme circumstances and with total political containment. Recommended exclusively for analysis of authoritarian threats or ideological infiltration scenarios.'
    ),
    shehulk: entry(
        'Jennifer Walters equilibró su carrera legal con una nueva identidad superhumana que nunca anuló su sentido del humor ni su inteligencia. Su expediente refleja una rara combinación de fortaleza física, control emocional y criterio práctico.',
        'Jennifer Walters balanced her legal career with a new superhuman identity that never erased either her sense of humor or her intelligence. Her file reflects a rare combination of physical strength, emotional control, and practical judgment.',
        'Su forma gamma le otorga fuerza masiva, resistencia elevada y una presencia intimidatoria inmediata. A diferencia de otros colosos, conserva claridad mental y puede seguir respondiendo con criterio en medio del caos.',
        'Her gamma form grants massive strength, high resilience, and immediate intimidating presence. Unlike other heavy hitters, she retains mental clarity and can keep making sound decisions in the middle of chaos.',
        'Activo de primera línea con estabilidad superior a la media gamma. Recomendado para protección de civiles, asalto controlado y mantenimiento del orden bajo presión.',
        'Front-line asset with above-average gamma stability. Recommended for civilian protection, controlled assault, and order maintenance under pressure.'
    ),
    vision: entry(
        'Vision nació como una síntesis imposible entre inteligencia artificial, herencia vengadora y una búsqueda constante de humanidad. Su historial combina lógica impecable con una evolución moral que lo ha llevado a tomar decisiones profundamente compasivas.',
        'Vision was born as an impossible synthesis of artificial intelligence, Avenger legacy, and a constant search for humanity. His record combines flawless logic with moral growth that has led him to deeply compassionate choices.',
        'Puede alterar su densidad, atravesar materia, disparar energía concentrada y analizar escenarios a gran velocidad. Funciona como pieza de precisión: resistente, flexible y capaz de adaptarse en segundos a cambios del campo.',
        'He can alter his density, phase through matter, fire concentrated energy, and analyze scenarios at great speed. He functions as a precision piece: durable, flexible, and able to adapt to field changes in seconds.',
        'Activo de altísima versatilidad. Recomendado para contención selectiva, penetración de defensas y resolución táctica en entornos complejos.',
        'Extremely versatile asset. Recommended for selective containment, defense penetration, and tactical resolution in complex environments.'
    ),
    drax: entry(
        'Drax ha vivido para la venganza, pero en ese trayecto terminó encontrando una forma brutal y directa de lealtad. Su expediente muestra poca sutileza, aunque compensa esa carencia con determinación implacable y ausencia total de miedo.',
        'Drax has lived for vengeance, but along that path he found a brutal and direct form of loyalty. His file shows little subtlety, though he compensates with relentless determination and total absence of fear.',
        'Su fortaleza física y tolerancia al daño lo convierten en un ariete ideal contra amenazas resistentes. No destaca por refinamiento táctico, pero una vez fijado un blanco resulta extremadamente difícil desviarlo.',
        'His physical strength and damage tolerance make him an ideal battering ram against resilient threats. He does not stand out for tactical finesse, but once locked onto a target he is extremely hard to divert.',
        'Activo de persecución y choque. Recomendado para fijar objetivos prioritarios y desgastar enemigos de gran resistencia.',
        'Pursuit and shock asset. Recommended for fixing priority targets and wearing down highly durable enemies.'
    ),
    gamora: entry(
        'Gamora fue moldeada desde joven como arma por una de las peores amenazas cósmicas conocidas, y convirtió ese pasado en una voluntad feroz de decidir su propio destino. Su expediente refleja disciplina letal y capacidad de supervivencia extrema.',
        'Gamora was shaped from a young age into a weapon by one of the worst cosmic threats on record, and she turned that past into a fierce will to define her own fate. Her file reflects lethal discipline and extreme survivability.',
        'Combina velocidad, técnica de asesinato, armamento blanco y lectura táctica del combate cercano. Su ventaja no es solo matar rápido, sino hacerlo con limpieza, precisión y mínima exposición.',
        'She combines speed, assassination skill, bladed weaponry, and tactical reading of close combat. Her advantage is not just killing quickly, but doing so cleanly, precisely, and with minimal exposure.',
        'Activo de eliminación quirúrgica. Recomendado para caza de mandos, aperturas silenciosas y escenarios donde un error no es asumible.',
        'Surgical elimination asset. Recommended for command-target hunting, silent openings, and scenarios where error is unacceptable.'
    ),
    groot: entry(
        'Groot pertenece a una especie arbórea extraterrestre y ha demostrado una lealtad absoluta hacia quienes considera familia. Su historial es breve en palabras y enorme en hechos: sacrificio, resiliencia y protección incondicional.',
        'Groot belongs to an alien arboreal species and has shown absolute loyalty toward those he considers family. His history is brief in words and vast in deeds: sacrifice, resilience, and unconditional protection.',
        'Puede regenerar tejido vegetal, extender miembros, inmovilizar amenazas y resistir daño severo. Es especialmente útil para fijar zonas, cubrir aliados y crear barreras improvisadas con rapidez.',
        'He can regenerate plant tissue, extend his limbs, immobilize threats, and withstand severe damage. He is especially useful for locking down areas, shielding allies, and creating improvised barriers quickly.',
        'Activo de contención y soporte protector. Recomendado para defensa de perímetro, bloqueo de avances y cobertura de personal vulnerable.',
        'Containment and protective-support asset. Recommended for perimeter defense, advance blocking, and shielding vulnerable personnel.'
    ),
    mantis: entry(
        'Mantis ha vivido entre templos, imperios y bandas de fugitivos sin perder una extraña serenidad. Su historial combina sensibilidad extrema, intuición social y una capacidad singular para leer el estado emocional de quienes la rodean.',
        'Mantis has lived among temples, empires, and outlaw crews without losing a strange inner calm. Her record combines extreme sensitivity, social intuition, and a singular ability to read the emotional state of those around her.',
        'Su don empático le permite alterar estados mentales, calmar, aturdir o desestabilizar objetivos con contacto o proximidad. No domina por fuerza, sino por control fino del ritmo emocional del enfrentamiento.',
        'Her empathic gift allows her to alter mental states, soothe, stun, or destabilize targets through contact or proximity. She does not dominate through force, but through fine control of the encounter’s emotional rhythm.',
        'Activo de control sensible. Recomendado para contención no letal, interrogatorio supervisado y apoyo a unidades con alta carga psicológica.',
        'Sensitive-control asset. Recommended for non-lethal containment, supervised interrogation, and support for units under heavy psychological stress.'
    ),
    nebula: entry(
        'Nebula fue criada en una escuela de violencia donde el fracaso se pagaba con mutilación y mejora forzada. Su expediente refleja rabia contenida, instinto de supervivencia y una comprensión fría de la guerra prolongada.',
        'Nebula was raised in a school of violence where failure was paid for with mutilation and forced enhancement. Her file reflects contained rage, survival instinct, and a cold understanding of prolonged war.',
        'Sus implantes cibernéticos mejoran reflejos, resistencia y letalidad a media y corta distancia. Es eficaz en misiones de desgaste, supervivencia prolongada y eliminación de blancos sin necesidad de apoyo constante.',
        'Her cybernetic implants enhance reflexes, durability, and lethality at medium and close range. She is effective in attrition missions, prolonged survival, and target elimination without constant support.',
        'Activo de operaciones duras y autonomía elevada. Recomendado para inserciones prolongadas, sabotaje y supervivencia fuera de red.',
        'Hard-ops asset with high autonomy. Recommended for prolonged insertions, sabotage, and off-grid survival.'
    ),
    nova: entry(
        'Richard Rider fue un adolescente normal hasta heredar el poder del Cuerpo Nova y verse empujado a conflictos cósmicos de escala desmesurada. Su historial muestra valentía inmediata y una curva de madurez muy por encima de lo esperable.',
        'Richard Rider was an ordinary teenager until he inherited the power of the Nova Corps and was thrust into oversized cosmic conflicts. His record shows immediate courage and a maturity curve far beyond expectation.',
        'Su enlace con la Fuerza Nova le concede vuelo, fuerza, resistencia y descargas de energía con enorme velocidad de respuesta. Se comporta como un interceptor ideal contra amenazas móviles o de origen extraterrestre.',
        'His link to the Nova Force grants flight, strength, durability, and energy blasts with enormous response speed. He performs as an ideal interceptor against mobile or extraterrestrial threats.',
        'Activo de superioridad aérea y respuesta orbital. Recomendado para interceptación, persecución y choque contra amenazas de alta velocidad.',
        'Air-superiority and orbital-response asset. Recommended for interception, pursuit, and impact against high-speed threats.'
    ),
    rocket: entry(
        'Rocket combina una vida de supervivencia salvaje con una mente mecánica extraordinaria. Su expediente lo define como impredecible, agresivo y difícil de disciplinar, pero también como uno de los mejores improvisadores armamentísticos disponibles.',
        'Rocket combines a life of brutal survival with an extraordinary mechanical mind. His file defines him as unpredictable, aggressive, and hard to discipline, but also as one of the best improvised weapons minds available.',
        'Maneja artillería pesada, tecnología alienígena y tácticas de guerrilla con una eficiencia muy superior a su tamaño. Aporta fuego, trampas y soluciones de campo allí donde una unidad convencional se quedaría sin opciones.',
        'He handles heavy ordnance, alien technology, and guerrilla tactics with efficiency far beyond his size. He brings firepower, traps, and field solutions wherever a conventional unit would run out of options.',
        'Activo de fuego irregular y soporte técnico agresivo. Recomendado para emboscadas, demolición y escenarios donde haya que improvisar sobre la marcha.',
        'Irregular-fire and aggressive technical-support asset. Recommended for ambushes, demolition, and scenarios requiring on-the-fly improvisation.'
    ),
    silversurfer: entry(
        'Norrin Radd entregó su libertad para salvar su mundo y terminó convertido en heraldo de una amenaza cósmica. Su expediente está marcado por culpa, nobleza y una búsqueda constante de redención a escala universal.',
        'Norrin Radd gave up his freedom to save his world and was transformed into the herald of a cosmic threat. His file is marked by guilt, nobility, and a constant search for redemption on a universal scale.',
        'El Poder Cósmico le permite vuelo interestelar, manipulación de energía, resistencia colosal y movilidad casi sin equivalente. En términos operativos, se acerca más a un evento de fuerza que a un simple agente.',
        'The Power Cosmic grants him interstellar flight, energy manipulation, colossal durability, and mobility with almost no equal. Operationally, he is closer to a force event than to a simple agent.',
        'Activo de escala estratégica. Recomendado únicamente para crisis mayores, neutralización de entidades de nivel superior y misiones fuera del marco terrestre estándar.',
        'Strategic-scale asset. Recommended only for major crises, superior-entity neutralization, and missions outside the standard Earthbound framework.'
    ),
    professorx: entry(
        'Charles Xavier dedicó su vida a la convivencia entre humanos y mutantes, incluso cuando el mundo respondió con miedo y violencia. Su historial combina idealismo, manipulación discutible y una influencia intelectual enorme sobre generaciones enteras.',
        'Charles Xavier devoted his life to coexistence between humans and mutants, even when the world answered with fear and violence. His history combines idealism, questionable manipulation, and enormous intellectual influence over entire generations.',
        'Su telepatía le permite leer, proyectar, ocultar o alterar pensamientos con un alcance excepcional. Aunque su cuerpo sea vulnerable, su presencia en el plano mental puede decidir una operación sin disparar un solo tiro.',
        'His telepathy allows him to read, project, conceal, or alter thoughts with exceptional reach. Though his body is vulnerable, his presence in the mental plane can decide an operation without a single shot fired.',
        'Activo de inteligencia psíquica. Recomendado para detección avanzada, coordinación estratégica y neutralización no física de amenazas críticas.',
        'Psychic-intelligence asset. Recommended for advanced detection, strategic coordination, and non-physical neutralization of critical threats.'
    ),
    captainamerica: entry(
        'Steve Rogers fue transformado durante la Segunda Guerra Mundial en el primer supersoldado funcional y desde entonces se convirtió en símbolo de resistencia moral. Su expediente combina liderazgo, sacrificio y una capacidad muy rara para sostener principios incluso en escenarios imposibles.',
        'Steve Rogers was transformed during World War II into the first successful super-soldier and became a symbol of moral resistance. His file combines leadership, sacrifice, and a rare ability to hold to principles even in impossible scenarios.',
        'Su fisiología mejorada multiplica fuerza, resistencia y tiempos de reacción, mientras su dominio del escudo le permite atacar, defender y controlar espacio con precisión quirúrgica. No es el más poderoso del tablero, pero sí uno de los más fiables bajo presión.',
        'His enhanced physiology multiplies strength, endurance, and reaction time, while his mastery of the shield allows him to attack, defend, and control space with surgical precision. He is not the most powerful asset on the board, but he is one of the most reliable under pressure.',
        'Activo de mando táctico. Recomendado para liderazgo de primera línea, defensa de civiles y estabilización de escuadras bajo fuego.',
        'Tactical command asset. Recommended for front-line leadership, civilian protection, and squad stabilization under fire.'
    ),
    gambit: entry(
        'Remy LeBeau creció entre ladrones, tratos rotos y lealtades ambiguas antes de encontrar un lugar intermitente junto a los X-Men. Su historial mezcla encanto, oportunismo y una sorprendente disposición a arriesgarlo todo por la gente adecuada.',
        'Remy LeBeau grew up among thieves, broken deals, and shifting loyalties before finding an intermittent place with the X-Men. His record blends charm, opportunism, and a surprising willingness to risk everything for the right people.',
        'Carga energía cinética en objetos, sobre todo cartas y proyectiles ligeros, para convertirlos en munición altamente inestable. Su estilo combina puntería, movilidad y combate oportunista con enorme capacidad para romper ritmos enemigos.',
        'He charges objects, especially cards and light projectiles, with kinetic energy, turning them into highly unstable ammunition. His style combines aim, mobility, and opportunistic fighting with a strong ability to break enemy tempo.',
        'Activo de hostigamiento y precisión. Recomendado para abrir huecos, castigar mandos intermedios y sostener presión sin fijar posición.',
        'Harassment and precision asset. Recommended for creating openings, punishing mid-level command targets, and maintaining pressure without fixing position.'
    ),
    hawkeye: entry(
        'Clint Barton se abrió camino entre dioses y monstruos armado solo con disciplina, puntería y una obstinada negativa a quedarse atrás. Su expediente demuestra que la precisión y la sangre fría pueden sostener a un equipo tanto como cualquier poder.',
        'Clint Barton earned his place among gods and monsters armed only with discipline, marksmanship, and a stubborn refusal to be left behind. His file shows that precision and nerve can support a team as much as any superpower.',
        'Su capacidad balística, lectura del terreno y variedad de munición lo convierten en un tirador de control y apoyo extraordinariamente fiable. Funciona mejor cuando el combate exige disciplina, paciencia y eliminación quirúrgica.',
        'His ballistic skill, battlefield reading, and ammunition variety make him an extraordinarily reliable control and support marksman. He performs best when combat demands discipline, patience, and surgical elimination.',
        'Activo de precisión táctica. Recomendado para cobertura de largo alcance, neutralización selectiva y apoyo a inserciones complejas.',
        'Tactical precision asset. Recommended for long-range cover, selective neutralization, and support for complex insertions.'
    ),
    hulk: entry(
        'Bruce Banner vive atrapado entre la inteligencia de un científico brillante y la furia gamma más devastadora conocida. Su historial es el de un hombre que intenta contener un desastre viviente mientras el mundo recurre a él cuando no queda nada más fuerte.',
        'Bruce Banner lives trapped between the mind of a brilliant scientist and the most devastating gamma fury on record. His history is that of a man trying to contain a living disaster while the world turns to him when nothing stronger remains.',
        'Cuando emerge Hulk, la fuerza física, la resistencia y la capacidad de destrucción escalan a niveles extremos. El sujeto puede romper líneas, blindajes y estructuras con facilidad, aunque su valor táctico depende del grado de control disponible.',
        'When Hulk emerges, physical strength, endurance, and destructive capability rise to extreme levels. The subject can break lines, armor, and structures with ease, though tactical value depends on the level of control available.',
        'Activo de impacto máximo y riesgo estructural alto. Recomendado solo para ruptura de frentes, supresión masiva y respuesta a amenazas de categoría superior.',
        'Maximum-impact asset with high structural risk. Recommended only for front-line rupture, mass suppression, and response to upper-tier threats.'
    ),
    ironman: entry(
        'Tony Stark pasó de industrial arrogante a arquitecto de su propia redención, convirtiendo culpa, genio y recursos ilimitados en defensa activa del planeta. Su expediente refleja una mente brillante, difícil de contener y extraordinariamente rápida para iterar soluciones.',
        'Tony Stark went from arrogant industrialist to architect of his own redemption, turning guilt, genius, and near-limitless resources into active defense for the planet. His file reflects a brilliant mind, difficult to contain and extraordinarily fast at iterating solutions.',
        'La armadura Iron Man integra vuelo, armamento de energía, protección avanzada y procesamiento táctico en tiempo real. Su mayor ventaja es la modularidad: puede adaptarse al teatro de operaciones casi tan rápido como aparece una amenaza nueva.',
        'The Iron Man armor integrates flight, energy weapons, advanced protection, and real-time tactical processing. Its greatest advantage is modularity: it can adapt to the theater almost as quickly as a new threat emerges.',
        'Activo de supremacía tecnológica. Recomendado para respuesta total, apoyo pesado flexible y neutralización de objetivos mecanizados o de gran potencia.',
        'Technological-supremacy asset. Recommended for total-response deployment, flexible heavy support, and neutralization of mechanized or high-output targets.'
    ),
    ghostrider: entry(
        'Johnny Blaze selló su destino con fuerzas infernales y quedó ligado para siempre al Espíritu de la Venganza. Su expediente mezcla culpa, redención y una relación permanentemente inestable con un poder que castiga sin compasión.',
        'Johnny Blaze sealed his fate with infernal forces and became forever bound to the Spirit of Vengeance. His file blends guilt, redemption, and a permanently unstable relationship with a power that punishes without mercy.',
        'Despliega fuego infernal, resistencia sobrenatural y una presencia intimidatoria que erosiona moral y voluntad. Su Penance Stare y su poder de persecución lo convierten en un recurso extremo contra culpables especialmente peligrosos.',
        'He wields hellfire, supernatural durability, and an intimidating presence that erodes morale and will. His Penance Stare and pursuit capability make him an extreme resource against especially dangerous guilty targets.',
        'Activo sobrenatural de castigo directo. Recomendado para caza de amenazas demoníacas, persecución implacable y escenarios donde el terror también sea una herramienta.',
        'Supernatural direct-punishment asset. Recommended for hunting demonic threats, relentless pursuit, and scenarios where terror itself is a tool.'
    ),
    blackcat: entry(
        'Felicia Hardy creció entre golpes de suerte, delitos calculados y una línea moral mucho más flexible que la de la mayoría de los héroes. Su expediente refleja oportunismo, carisma y una sorprendente tendencia a intervenir cuando la balanza se inclina demasiado hacia el abuso.',
        'Felicia Hardy grew up among calculated thefts, lucky breaks, and a moral line far more flexible than most heroes. Her file reflects opportunism, charm, and a surprising tendency to step in when the balance tilts too far toward abuse.',
        'Combina agilidad extraordinaria, infiltración, combate acrobático y una intuición peligrosa para explotar fallos ajenos. Su ventaja táctica está en desordenar planes enemigos más que en sostener una línea frontal.',
        'She combines extraordinary agility, infiltration, acrobatic combat, and a dangerous instinct for exploiting other people’s mistakes. Her tactical edge lies in disrupting enemy plans rather than holding a front line.',
        'Activo de infiltración oportunista. Recomendado para robo de activos, extracción discreta y operaciones donde la imprevisibilidad favorezca al equipo.',
        'Opportunistic infiltration asset. Recommended for asset theft, discreet extraction, and operations where unpredictability favors the team.'
    ),
    greengoblin: entry(
        'Norman Osborn levantó un imperio industrial mientras descendía hacia una fractura mental cada vez más peligrosa. Su historial mezcla genialidad empresarial, obsesión patológica y una disposición absoluta a convertir el caos en ventaja.',
        'Norman Osborn built an industrial empire while descending into an increasingly dangerous mental fracture. His record blends corporate brilliance, pathological obsession, and a total willingness to turn chaos into advantage.',
        'Vuela con planeador armado, utiliza explosivos de alta inestabilidad y combina movilidad agresiva con un patrón de ataque errático. Es letal porque ataca desde la sorpresa, el terror y la brutalidad desproporcionada.',
        'He flies a weaponized glider, uses highly unstable explosives, and combines aggressive mobility with erratic attack patterns. He is lethal because he strikes through surprise, terror, and disproportionate brutality.',
        'Activo de inestabilidad útil bajo supervisión extrema. Recomendado solo para escenarios donde el daño colateral sea asumible y la presión psicológica sobre el enemigo sea prioritaria.',
        'Useful instability asset under extreme supervision. Recommended only for scenarios where collateral damage is acceptable and psychological pressure on the enemy is a priority.'
    ),
    kraven: entry(
        'Sergei Kravinoff convirtió la caza en religión personal y mide el valor de una presa por la dificultad de derribarla. Su expediente muestra orgullo feroz, disciplina física impecable y una obsesión constante por demostrar superioridad.',
        'Sergei Kravinoff turned hunting into a personal religion and measures a target’s worth by how hard it is to bring down. His file shows fierce pride, impeccable physical discipline, and a constant obsession with proving superiority.',
        'Destaca en rastreo, trampas, combate físico y control del terreno antes del enfrentamiento directo. Es especialmente eficaz cuando puede estudiar a su objetivo y convertir la persecución en agotamiento progresivo.',
        'He excels at tracking, traps, physical combat, and shaping terrain before direct engagement. He is especially effective when allowed to study the target and turn the hunt into progressive exhaustion.',
        'Activo de caza especializada. Recomendado para rastreo de objetivos singulares, presión prolongada y captura en zonas abiertas o salvajes.',
        'Specialized hunting asset. Recommended for singular-target tracking, prolonged pressure, and capture in open or wild environments.'
    ),
    mysterio: entry(
        'Quentin Beck fue técnico de efectos especiales antes de transformar engaño, ego y resentimiento en una identidad criminal sofisticada. Su historial demuestra que la percepción es tan peligrosa como la fuerza cuando cae en las manos adecuadas.',
        'Quentin Beck was a special-effects technician before turning deception, ego, and resentment into a sophisticated criminal identity. His history proves perception can be as dangerous as brute force in the right hands.',
        'Manipula ilusiones, humo, proyecciones y confusión sensorial para desorientar al enemigo y alterar su lectura del campo. Rinde mejor en escenarios donde el enemigo dependa de visión, coordinación y confianza en sus propios sentidos.',
        'He manipulates illusions, smoke, projections, and sensory confusion to disorient the enemy and distort battlefield awareness. He performs best where the opponent depends on sight, coordination, and trust in their own senses.',
        'Activo de guerra psicológica. Recomendado para distracción, desinformación táctica y desorganización previa a una ofensiva mayor.',
        'Psychological-warfare asset. Recommended for distraction, tactical disinformation, and destabilization before a larger offensive.'
    ),
    rhino: entry(
        'Aleksei Sytsevich fue transformado en ariete viviente para vender su brutalidad al mejor postor. Su expediente muestra poca sofisticación, pero una capacidad constante para resolver un problema cuando la solución consiste en atravesarlo.',
        'Aleksei Sytsevich was turned into a living battering ram and sold his brutality to the highest bidder. His file shows little sophistication, but a steady ability to solve problems when the solution is to crash through them.',
        'Su armadura y masa corporal lo convierten en un proyectil humano capaz de abrir defensas y colapsar coberturas. No se adapta bien a planes complejos, pero en ruptura pura sigue siendo extremadamente útil.',
        'His armor and body mass turn him into a human projectile capable of breaching defenses and collapsing cover. He does not adapt well to complex plans, but for pure breaking force he remains extremely useful.',
        'Activo de choque frontal. Recomendado para aperturas violentas, derribo de fortificaciones ligeras y desorganización inmediata de líneas enemigas.',
        'Front-shock asset. Recommended for violent breaches, takedown of light fortifications, and immediate disruption of enemy lines.'
    ),
    sandman: entry(
        'William Baker ha oscilado entre criminal reincidente y aliado ocasional, siempre arrastrado por su propia inestabilidad. Su expediente lo define como una masa difícil de contener, tanto en términos físicos como morales.',
        'William Baker has shifted between recurring criminal and occasional ally, always dragged by his own instability. His file defines him as a mass difficult to contain, both physically and morally.',
        'Puede descomponer y reconfigurar su cuerpo en arena, absorber impactos y alterar su forma para inmovilizar o aplastar. Es muy útil en bloqueo de rutas, desgaste y resistencia prolongada.',
        'He can break apart and reconfigure his body into sand, absorb impacts, and alter form to trap or crush. He is highly useful in route denial, attrition, and prolonged resistance.',
        'Activo de contención moldeable. Recomendado para cerrar accesos, resistir fuego intenso y entorpecer avances enemigos.',
        'Malleable-containment asset. Recommended for sealing access points, withstanding heavy fire, and slowing hostile advances.'
    ),
    scorpion: entry(
        'Mac Gargan fue moldeado por experimentos agresivos y carreras criminales donde la violencia sustituyó cualquier otro talento. Su expediente refleja impulsividad, resentimiento y una tendencia a sobreactuar en cuanto huele debilidad.',
        'Mac Gargan was shaped by aggressive experimentation and criminal careers where violence replaced every other talent. His file reflects impulsiveness, resentment, and a tendency to overcommit the moment he senses weakness.',
        'Su armamento corporal y fuerza mutada le permiten atacar con alcance, presión física y movilidad ofensiva. Funciona como agresor persistente en zonas cerradas o cuando se busca fijar un blanco por puro acoso.',
        'His body weaponization and mutated strength let him attack with reach, physical pressure, and offensive mobility. He works as a persistent aggressor in enclosed spaces or when the goal is to lock onto a target through sheer harassment.',
        'Activo de presión agresiva. Recomendado para persecución cercana, saturación de defensa y combate de hostigamiento físico.',
        'Aggressive-pressure asset. Recommended for close pursuit, defensive saturation, and physically harassing combat.'
    ),
    venom: entry(
        'Eddie Brock encontró en el simbionte tanto un aliado como un espejo distorsionado de su rabia y su necesidad de pertenencia. Su expediente muestra una fuerza enorme condicionada por una psicología inestable, pero no necesariamente desleal.',
        'Eddie Brock found in the symbiote both an ally and a distorted mirror of his rage and need to belong. His file shows enormous force shaped by unstable psychology, though not necessarily disloyalty.',
        'El simbionte amplifica fuerza, velocidad, resistencia y capacidad de depredación, además de generar apéndices y movilidad vertical. Es especialmente útil como cazador de proximidad y desbordamiento sobre blancos aislados.',
        'The symbiote amplifies strength, speed, endurance, and predatory capability while generating tendrils and vertical mobility. It is especially useful as a close hunter and overwhelm asset against isolated targets.',
        'Activo de asalto bestial. Recomendado para persecución, eliminación rápida y presión sobre amenazas que dependan de maniobra.',
        'Bestial-assault asset. Recommended for pursuit, rapid elimination, and pressure against threats that rely on maneuver.'
    ),
    beast: entry(
        'Hank McCoy es a la vez uno de los científicos más brillantes de su generación y un mutante cuya apariencia ha cargado con años de prejuicio. Su expediente combina elegancia intelectual, curiosidad peligrosa y una vieja costumbre de asumir demasiado peso moral.',
        'Hank McCoy is both one of the brightest scientists of his generation and a mutant whose appearance has borne years of prejudice. His file combines intellectual elegance, dangerous curiosity, and a long habit of carrying too much moral weight.',
        'Posee fuerza, agilidad y movilidad acrobática muy superiores a las humanas, además de una enorme capacidad analítica. Resulta valioso cuando el campo exige mente científica y presencia física en la misma unidad.',
        'He possesses strength, agility, and acrobatic mobility far beyond human norms, along with enormous analytical capability. He is valuable when the field requires scientific thinking and physical presence in the same unit.',
        'Activo de apoyo científico y movilidad avanzada. Recomendado para análisis en terreno, respuesta flexible y resolución de crisis complejas.',
        'Scientific-support and advanced-mobility asset. Recommended for field analysis, flexible response, and complex crisis resolution.'
    ),
    blade: entry(
        'Eric Brooks ha pasado la vida persiguiendo monstruos con la misma ferocidad con la que teme convertirse en uno de ellos. Su expediente lo define por disciplina, trauma y una determinación seca que rara vez deja espacio para el error.',
        'Eric Brooks has spent his life hunting monsters with the same ferocity with which he fears becoming one himself. His file is defined by discipline, trauma, and a dry determination that rarely leaves room for error.',
        'Combina capacidad física mejorada, tolerancia extraordinaria al daño y una experiencia especializada en caza sobrenatural. Rinde especialmente bien en persecuciones nocturnas, limpieza selectiva y operaciones contra depredadores no humanos.',
        'He combines enhanced physical capability, extraordinary pain tolerance, and specialized experience in supernatural hunting. He performs especially well in night pursuit, selective cleanup, and operations against non-human predators.',
        'Activo de erradicación especializada. Recomendado para amenazas sobrenaturales, entornos oscuros y escenarios donde el enemigo dependa del terror.',
        'Specialized-eradication asset. Recommended for supernatural threats, dark environments, and scenarios where the enemy relies on terror.'
    ),
    captainmarvel: entry(
        'Carol Danvers ha servido como piloto, oficial y defensora cósmica con una mezcla poco común de coraje y obstinación. Su expediente muestra una voluntad capaz de absorber golpes físicos y políticos sin ceder terreno.',
        'Carol Danvers has served as pilot, officer, and cosmic defender with a rare blend of courage and stubbornness. Her file shows a will capable of absorbing both physical and political hits without yielding ground.',
        'Su fisiología potenciada le permite volar, resistir impactos extremos y liberar energía a gran escala. Es una pieza de superioridad aérea y choque frontal con margen real para sostener ofensiva prolongada.',
        'Her enhanced physiology lets her fly, withstand extreme impact, and unleash large-scale energy output. She is an air-superiority and frontal-shock piece with real capacity to sustain prolonged offense.',
        'Activo de alta proyección ofensiva. Recomendado para intervención rápida, cobertura aérea y neutralización de amenazas de nivel superior.',
        'High-output offensive asset. Recommended for rapid intervention, air cover, and neutralization of upper-tier threats.'
    ),
    cyclops: entry(
        'Scott Summers creció bajo presión constante y terminó convirtiéndose en uno de los líderes de campo más metódicos de la comunidad mutante. Su expediente lo define por control, disciplina y una tendencia a cargar con decisiones ingratas.',
        'Scott Summers grew up under constant pressure and became one of the mutant community’s most methodical field leaders. His file is defined by control, discipline, and a tendency to carry thankless decisions.',
        'Sus descargas ópticas ofrecen potencia sostenida, precisión y capacidad de abrir rutas o suprimir agrupaciones enemigas. Combina potencia media-alta con una lectura táctica excelente del espacio de combate.',
        'His optic blasts offer sustained power, precision, and the ability to open routes or suppress hostile clusters. He combines medium-high output with an excellent tactical reading of combat space.',
        'Activo de fuego de control y mando. Recomendado para coordinación de escuadra, supresión lineal y respuesta disciplinada en escenarios móviles.',
        'Control-fire and command asset. Recommended for squad coordination, linear suppression, and disciplined response in mobile engagements.'
    ),
    daredevil: entry(
        'Matt Murdock vive entre la ley, la culpa y una guerra nocturna que rara vez concede descanso. Su expediente refleja una brújula moral muy estricta sostenida por una resistencia mental y física fuera de lo común.',
        'Matt Murdock lives between the law, guilt, and a nocturnal war that rarely grants rest. His file reflects a strict moral compass sustained by unusual physical and mental resilience.',
        'La pérdida de visión agudizó el resto de sus sentidos hasta un nivel casi radar, permitiéndole anticipar movimiento, sonido y peligro con precisión extrema. Combina eso con técnica marcial superior y movilidad urbana excelente.',
        'The loss of sight sharpened his remaining senses to near-radar level, allowing him to anticipate movement, sound, and danger with extreme precision. He combines that with superior martial skill and excellent urban mobility.',
        'Activo de patrulla urbana y combate de proximidad. Recomendado para caza en interiores, protección de civiles y escenarios de baja visibilidad.',
        'Urban-patrol and close-combat asset. Recommended for indoor hunts, civilian protection, and low-visibility scenarios.'
    ),
    doctordoom: entry(
        'Victor Von Doom unió ciencia, misticismo y poder político hasta erigirse como soberano absoluto de Latveria. Su expediente refleja orgullo casi inhumano, inteligencia excepcional y una convicción absoluta de que solo él sabe lo que debe hacerse.',
        'Victor Von Doom fused science, mysticism, and political power until he became the absolute ruler of Latveria. His file reflects near-inhuman pride, exceptional intelligence, and absolute certainty that only he knows what must be done.',
        'Su armadura, su dominio tecnológico y sus capacidades místicas lo convierten en una amenaza multifuncional de primer nivel. Puede atacar, resistir, analizar y someter con una eficiencia aterradora.',
        'His armor, technological mastery, and mystical capability make him a top-tier multifunction threat. He can attack, endure, analyze, and dominate with terrifying efficiency.',
        'Activo de altísimo valor y riesgo extremo. Recomendado solo si la operación exige genio total y se acepta una cadena de mando muy difícil de contener.',
        'Extremely high-value, extreme-risk asset. Recommended only if the operation demands total genius and accepts a chain of command very hard to contain.'
    ),
    emmafrost: entry(
        'Emma Frost pasó de adversaria temible a profesora y dirigente capaz de defender a los suyos con una dureza casi glacial. Su expediente mezcla ambición, elegancia estratégica y una notable capacidad para sobrevivir a cualquier cambio político.',
        'Emma Frost moved from formidable adversary to teacher and leader capable of defending her own with almost glacial hardness. Her file blends ambition, strategic elegance, and a notable ability to survive any political shift.',
        'Combina telepatía de alto nivel con una forma de diamante que mejora resistencia y disciplina física. Es especialmente valiosa cuando hace falta sostener control mental y mantener presencia firme en primera línea.',
        'She combines high-level telepathy with a diamond form that enhances durability and physical discipline. She is especially valuable when mental control must be sustained alongside a firm front-line presence.',
        'Activo de mando psíquico y resistencia selectiva. Recomendado para coordinación de crisis, contramedidas mentales y liderazgo de grupos frágiles.',
        'Psychic-command and selective-resilience asset. Recommended for crisis coordination, mental countermeasures, and leadership of fragile groups.'
    ),
    iceman: entry(
        'Bobby Drake ha pasado años escondiendo detrás del humor un potencial de nivel muy superior al que él mismo estaba dispuesto a aceptar. Su expediente muestra crecimiento tardío, lealtad sólida y una capacidad enorme para escalar cuando la situación empeora.',
        'Bobby Drake spent years hiding behind humor while carrying a power level much greater than he himself was willing to accept. His file shows late growth, solid loyalty, and enormous room to escalate when things get worse.',
        'Controla el hielo, la temperatura y la creación instantánea de estructuras congeladas para defensa, desplazamiento o ofensiva. Puede transformar el terreno en su favor con rapidez y contener avances enteros.',
        'He controls ice, temperature, and the instant creation of frozen structures for defense, movement, or offense. He can rapidly reshape terrain in his favor and contain entire advances.',
        'Activo de control ambiental. Recomendado para contención, bloqueo de rutas y cobertura dinámica sobre grandes superficies.',
        'Environmental-control asset. Recommended for containment, route denial, and dynamic cover across wide surfaces.'
    ),
    jessicajones: entry(
        'Jessica Jones sobrevivió al trauma, abandonó el disfraz y acabó construyendo una forma áspera pero honesta de heroísmo. Su expediente demuestra intuición de calle, terquedad y una resistencia psicológica ganada a golpes.',
        'Jessica Jones survived trauma, abandoned the costume, and ended up building a rough but honest form of heroism. Her file shows street instinct, stubbornness, and psychological resilience earned the hard way.',
        'Dispone de fuerza elevada, aguante notable y un estilo directo que prescinde de adornos. Aporta valor cuando hace falta alguien capaz de seguir tirando del hilo aunque todo el mundo quiera apartarse.',
        'She possesses elevated strength, notable stamina, and a direct style with no unnecessary flourish. She brings value when someone is needed to keep pulling the thread even after everyone else steps back.',
        'Activo de investigación agresiva y contención callejera. Recomendado para seguimiento de objetivos, presión sobre testigos hostiles y protección de civiles en entorno urbano.',
        'Aggressive-investigation and street-containment asset. Recommended for target tracking, pressure on hostile witnesses, and civilian protection in urban environments.'
    ),
    lukecage: entry(
        'Luke Cage salió de prisión con la piel endurecida y una voluntad aún más difícil de romper. Su expediente refleja liderazgo barrial, sentido protector y una relación constante con comunidades que dependen de alguien dispuesto a aguantar el golpe por ellas.',
        'Luke Cage came out of prison with hardened skin and a will even harder to break. His file reflects neighborhood leadership, a protective instinct, and a constant connection to communities that need someone willing to take the hit for them.',
        'Su cuerpo soporta castigo extremo y su fuerza le permite controlar cuerpos y espacio sin necesidad de armamento pesado. Funciona muy bien como muro humano, escolta y presencia disuasoria.',
        'His body withstands extreme punishment and his strength lets him control bodies and space without heavy weaponry. He performs very well as a human wall, escort, and deterrent presence.',
        'Activo de protección directa. Recomendado para defensa de civiles, contención física y operaciones donde la supervivencia del equipo sea prioritaria.',
        'Direct-protection asset. Recommended for civilian defense, physical containment, and operations where team survival is the priority.'
    ),
    nightcrawler: entry(
        'Kurt Wagner ha vivido entre persecución, fe y una permanente lucha por seguir viendo belleza en un mundo hostil. Su expediente combina compasión, humor elegante y una capacidad constante para entrar donde nadie debería poder hacerlo.',
        'Kurt Wagner has lived among persecution, faith, and a constant struggle to keep seeing beauty in a hostile world. His file combines compassion, elegant humor, and a steady ability to go where no one else should be able to.',
        'Su teletransporte instantáneo le permite infiltrarse, reposicionarse y extraer aliados con una eficiencia extraordinaria. Es especialmente útil para asaltos rápidos, rescates quirúrgicos y desorganización del enemigo.',
        'His instant teleportation allows him to infiltrate, reposition, and extract allies with extraordinary efficiency. He is especially useful for rapid strikes, surgical rescues, and enemy disorientation.',
        'Activo de movilidad imposible. Recomendado para extracción de emergencia, inserción silenciosa y ruptura de cerco.',
        'Impossible-mobility asset. Recommended for emergency extraction, silent insertion, and encirclement breaks.'
    ),
    psylocke: entry(
        'Betsy Braddock ha pasado por transformaciones físicas, mentales y políticas sin perder su filo. Su expediente muestra disciplina, control psíquico y una capacidad notable para convertir trauma en precisión operativa.',
        'Betsy Braddock has endured physical, mental, and political transformations without losing her edge. Her file shows discipline, psychic control, and a notable ability to turn trauma into operational precision.',
        'Combina agilidad, combate cuerpo a cuerpo y proyección psíquica ofensiva con gran precisión. Funciona especialmente bien como eliminadora rápida y como amenaza híbrida entre mente y acero.',
        'She combines agility, hand-to-hand combat, and offensive psychic projection with great precision. She works especially well as a fast eliminator and as a hybrid threat of mind and steel.',
        'Activo de asalto psíquico y precisión letal. Recomendado para aperturas rápidas, duelos de alto valor y neutralización de objetivos protegidos.',
        'Psychic-assault and lethal-precision asset. Recommended for rapid openings, high-value duels, and neutralization of protected targets.'
    ),
    nana: entry(
        'Nana es una unidad centinela reprogramada y reconducida fuera de su propósito original de exterminio mutante. Su expediente combina memoria de combate mecánica con una identidad operativa todavía en construcción.',
        'Nana is a reprogrammed Sentinel unit redirected away from its original mutant-extermination purpose. Its file combines machine combat memory with an operational identity still under construction.',
        'Dispone de gran potencia física, sistemas de puntería estables y una resistencia superior a la media humana. Rinde mejor como plataforma táctica de soporte y contención sostenida.',
        'It brings heavy physical power, stable targeting systems, and durability above human standards. It performs best as a tactical support and sustained containment platform.',
        'Activo experimental de alto valor. Recomendado para control de zona, protección de unidades frágiles y choque mecánico supervisado.',
        'Experimental high-value asset. Recommended for zone control, protection of fragile units, and supervised mechanical shock deployment.'
    ),
    daredevilartist: entry(
        'Esta variante recoge a Matt Murdock en una presentación de archivo especial, pero conserva el mismo núcleo: abogado de día, vigilante de noche y una voluntad de hierro frente a la corrupción. Su hoja de servicio mantiene la misma mezcla de disciplina, culpa y resistencia moral.',
        'This variant presents Matt Murdock through a special archive format, but preserves the same core: lawyer by day, vigilante by night, and an iron will against corruption. His service record keeps the same blend of discipline, guilt, and moral endurance.',
        'Sigue basando su valor en sentidos hiperdesarrollados, lectura del entorno y combate cercano de precisión. La diferencia es estética, no operativa: continúa siendo un especialista en movilidad urbana y neutralización silenciosa.',
        'His value still rests on hyper-developed senses, environmental reading, and precise close-quarters combat. The difference is aesthetic, not operational: he remains a specialist in urban mobility and silent neutralization.',
        'Variante de archivo con rendimiento equivalente al original. Recomendado para patrulla urbana, protección de civiles y presión sostenida sobre redes criminales.',
        'Archive-format variant with performance equivalent to the original. Recommended for urban patrol, civilian protection, and sustained pressure on criminal networks.'
    ),
    daredevilelektra: entry(
        'Elektra Natchios tomó el manto de Daredevil llevando al símbolo una mezcla distinta de culpa, letalidad y autocontrol. Su expediente refleja una combatiente entrenada para matar que decide contenerse cuando el papel exige algo más que sangre.',
        'Elektra Natchios took up the Daredevil mantle, bringing to the symbol a different blend of guilt, lethality, and self-control. Her file reflects a fighter trained to kill who chooses restraint when the role demands more than blood.',
        'Combina velocidad, técnica ninja y sentidos disciplinados con una agresividad muy superior a la de Matt Murdock. Destaca en infiltración, duelos rápidos y resolución violenta de espacios cerrados.',
        'She combines speed, ninja technique, and disciplined senses with aggression well beyond Matt Murdock’s approach. She excels in infiltration, rapid duels, and violent resolution in confined spaces.',
        'Activo de sustitución de alto riesgo y gran eficacia. Recomendado para operaciones donde la identidad simbólica y la fuerza decisiva deban convivir.',
        'High-risk, high-efficiency mantle-substitution asset. Recommended for operations where symbolic identity and decisive force must coexist.'
    ),
    marshallbullseye: entry(
        'Esta variante traslada a Lester a un registro casi legendario de pistolero implacable. El expediente subraya lo mismo que en cualquier otra encarnación: obsesión con la puntería perfecta y una relación enfermiza con la violencia como espectáculo.',
        'This variant shifts Lester into an almost legendary gunslinger register. The file underscores the same core seen in every incarnation: obsession with perfect aim and an unhealthy relationship with violence as spectacle.',
        'Mantiene precisión extrema con armas arrojadizas o de fuego, velocidad de ejecución y una capacidad malsana para convertir cualquier objeto en munición letal. Funciona como verdugo móvil y pieza de control por terror.',
        'He retains extreme precision with thrown or firearm weapons, execution speed, and a sick ability to turn almost anything into lethal ammunition. He functions as a mobile executioner and terror-control piece.',
        'Activo de precisión hostil. Recomendado solo para escenarios donde el daño psicológico sobre el enemigo compense el riesgo moral del despliegue.',
        'Hostile-precision asset. Recommended only for scenarios where psychological damage to the enemy outweighs the moral risk of deployment.'
    ),
    oldmanhawkeye: entry(
        'Clint Barton envejecido conserva menos vista, menos margen y la misma terquedad suicida de siempre. Su expediente refleja a un veterano roto por la pérdida, pero todavía peligrosísimo cuando se le da un blanco y algo de tiempo.',
        'An aged Clint Barton retains less sight, less margin, and the same suicidal stubbornness as ever. His file reflects a veteran broken by loss, yet still extremely dangerous when given a target and enough time.',
        'Aunque el cuerpo ya no responda como antes, la experiencia compensa con lectura de terreno, disciplina de fuego y brutal economía de movimiento. Es un recurso de caza lenta, no de explosión inmediata.',
        'Though the body no longer responds as it once did, experience compensates with terrain reading, fire discipline, and brutal economy of movement. He is a slow-hunt asset, not an instant-explosion one.',
        'Activo veterano de precisión residual. Recomendado para vigilancia, represalia planificada y misiones donde la experiencia valga más que la velocidad.',
        'Veteran residual-precision asset. Recommended for overwatch, planned retaliation, and missions where experience matters more than speed.'
    ),
    oldmanlogan: entry(
        'Esta variante de Logan carga con un desgaste emocional y físico más profundo que el del expediente estándar. Aun así, bajo la fatiga persiste la misma máquina de supervivencia, más seca, más amarga y quizá más peligrosa.',
        'This Logan variant carries deeper emotional and physical wear than the standard file. Even so, beneath the fatigue remains the same survival machine, drier, angrier, and perhaps more dangerous.',
        'Sigue contando con factor curativo, garras letales y una tolerancia salvaje al castigo, aunque opera desde la experiencia y la dureza acumulada más que desde el impulso. Es un depredador cansado, no debilitado.',
        'He still carries a healing factor, lethal claws, and savage pain tolerance, though he operates more from accumulated experience and hardness than impulse. He is a tired predator, not a weakened one.',
        'Activo crepuscular de altísimo instinto. Recomendado para cacerías de larga duración, entornos hostiles y operaciones donde el cansancio no sea una opción.',
        'Twilight-phase asset with exceptional instinct. Recommended for long hunts, hostile environments, and operations where exhaustion is not an option.'
    ),
    spidermanartist: entry(
        'Esta edición especial mantiene intacto el núcleo de Peter Parker: ingenio, responsabilidad y un impulso casi compulsivo por intervenir cuando alguien está en peligro. El formato cambia, el sujeto no.',
        'This special edition preserves Peter Parker’s core intact: wit, responsibility, and an almost compulsive urge to intervene when someone is in danger. The format changes; the subject does not.',
        'Su combinación de agilidad extrema, fuerza proporcional y sentido arácnido sigue ofreciendo movilidad, improvisación y una capacidad poco común para sobrevivir a lo imposible. Opera como explorador, rescatista y disruptor en un mismo cuerpo.',
        'His combination of extreme agility, proportional strength, and spider-sense still delivers mobility, improvisation, and an uncommon ability to survive the impossible. He operates as scout, rescuer, and disruptor in the same body.',
        'Variante de archivo con valor operativo estable. Recomendado para respuesta rápida, extracción urbana y gestión de amenazas imprevisibles.',
        'Archive-format variant with stable operational value. Recommended for rapid response, urban extraction, and management of unpredictable threats.'
    ),
    baronzemo: entry(
        'Helmut Zemo heredó un legado de odio y lo refinó en forma de estrategia, paciencia y venganza calculada. Su expediente refleja a un aristócrata de la destrucción, más peligroso por su cabeza que por su fuerza física.',
        'Helmut Zemo inherited a legacy of hatred and refined it into strategy, patience, and calculated revenge. His file reflects an aristocrat of destruction, more dangerous for his mind than for his physical power.',
        'Destaca en planificación, manipulación de grupos y explotación de fracturas ideológicas dentro del enemigo. No gana por choque frontal, sino por convertir la estructura rival en un arma contra sí misma.',
        'He excels in planning, group manipulation, and exploitation of ideological fractures within the enemy. He wins not through frontal shock, but by turning the rival structure into a weapon against itself.',
        'Activo de intriga táctica. Recomendado para operaciones de sabotaje, guerra de confianza y desestabilización de liderazgos hostiles.',
        'Tactical-intrigue asset. Recommended for sabotage, confidence warfare, and destabilization of hostile leadership.'
    ),
    blackbolt: entry(
        'Blackagar Boltagon ha cargado durante toda su vida con el deber de gobernar sin concederse el lujo de hablar libremente. Su expediente transmite contención absoluta, nobleza severa y una conciencia constante del daño que puede causar.',
        'Blackagar Boltagon has spent his life carrying the duty to rule without granting himself the luxury of speaking freely. His file conveys absolute restraint, severe nobility, and constant awareness of the damage he can cause.',
        'Su voz es un arma de destrucción masiva; incluso una fracción de su potencia puede arrasar estructuras o cuerpos enteros. Fuera de eso, mantiene disciplina física, liderazgo y una presencia táctica de primera categoría.',
        'His voice is a weapon of mass destruction; even a fraction of its power can level structures or bodies outright. Beyond that, he maintains physical discipline, leadership, and first-rate tactical presence.',
        'Activo de contención vocal extrema. Recomendado solo en crisis mayores y con reglas de enfrentamiento claras antes de cualquier despliegue.',
        'Extreme vocal-containment asset. Recommended only in major crises and with clear rules of engagement before any deployment.'
    ),
    blackknight: entry(
        'Dane Whitman heredó tanto un nombre heroico como una espada maldita, y desde entonces vive negociando con ambos pesos. Su expediente combina caballerosidad moderna, culpa heredada y una firme voluntad de no dejar que el arma decida por él.',
        'Dane Whitman inherited both a heroic name and a cursed sword, and has lived ever since negotiating with both burdens. His file combines modern chivalry, inherited guilt, and a firm will not to let the weapon choose for him.',
        'La Espada de Ébano lo convierte en una amenaza letal en combate cercano, capaz de atravesar defensas y sostener duelos prolongados. Su valor aumenta cuando la operación exige una punta de lanza disciplinada y obstinada.',
        'The Ebony Blade makes him a lethal close-combat threat capable of piercing defenses and sustaining prolonged duels. His value rises when the operation requires a disciplined and stubborn spearhead.',
        'Activo de vanguardia caballeresca. Recomendado para asaltos dirigidos, defensa de personal clave y enfrentamientos contra campeones enemigos.',
        'Chivalric-vanguard asset. Recommended for directed assaults, key-personnel defense, and clashes against enemy champions.'
    ),
    bullseye: entry(
        'Lester ha reducido la violencia a un arte de precisión fría y profundamente enfermiza. Su expediente lo define por ego, sadismo y una puntería tan perfecta que convierte cualquier superficie del campo en amenaza potencial.',
        'Lester has reduced violence to an art of cold and deeply unhealthy precision. His file is defined by ego, sadism, and marksmanship so perfect that it turns any battlefield surface into a potential threat.',
        'Puede usar armas de fuego, cuchillos o simples objetos cotidianos con una eficacia letal absurda. Destaca por velocidad de ejecución, economía de movimiento y capacidad de castigar cualquier exposición mínima.',
        'He can use firearms, knives, or ordinary objects with absurd lethal efficiency. He stands out for execution speed, economy of movement, and the ability to punish even minimal exposure.',
        'Activo de eliminación quirúrgica hostil. Recomendado solo en situaciones donde la precisión extrema pese más que cualquier consideración ética.',
        'Hostile surgical-elimination asset. Recommended only in situations where extreme precision outweighs any ethical consideration.'
    ),
    carnage: entry(
        'Cletus Kasady es una convergencia entre psicopatía pura y un simbionte aún menos estable que el de Venom. Su expediente no presenta redención ni ambigüedad: solo violencia celebrada con entusiasmo patológico.',
        'Cletus Kasady is a convergence of pure psychopathy and a symbiote even less stable than Venom’s. His file offers neither redemption nor ambiguity: only violence celebrated with pathological enthusiasm.',
        'Su simbionte potencia fuerza, velocidad y capacidad de desgarro, añadiendo una imprevisibilidad orgánica difícil de contener. No busca vencer de forma eficiente, sino convertir el combate en carnicería.',
        'His symbiote enhances strength, speed, and tearing capability while adding an organic unpredictability difficult to contain. He does not seek efficient victory, but to turn combat into slaughter.',
        'Activo de riesgo crítico no recomendable salvo colapso total del frente. Su despliegue solo se considera cuando el control del daño ha dejado de ser realista.',
        'Critical-risk asset not recommended outside total front collapse. Deployment is considered only when damage control has already ceased to be realistic.'
    ),
    crossbones: entry(
        'Brock Rumlow ha construido su carrera sobre disciplina mercenaria, resentimiento y una violencia sin matices. Su expediente muestra un operador duro, persistente y perfectamente cómodo trabajando como martillo de otros.',
        'Brock Rumlow has built his career on mercenary discipline, resentment, and violence without nuance. His file shows a hard, persistent operator perfectly comfortable serving as someone else’s hammer.',
        'Sobresale en combate físico, armas convencionales y presión ofensiva de corto alcance. No destaca por sutileza, pero sí por obediencia táctica y capacidad para seguir avanzando incluso cuando el entorno ya debería frenar a cualquiera.',
        'He excels in physical combat, conventional weapons, and short-range offensive pressure. He is not subtle, but he does stand out for tactical obedience and the ability to keep advancing long after the environment should stop anyone else.',
        'Activo de asalto brutal. Recomendado para irrupción de posiciones, protección intimidatoria y desgaste directo de fuerzas enemigas.',
        'Brutal-assault asset. Recommended for breaching positions, intimidation protection, and direct attrition of enemy forces.'
    ),
    darkphoenix: entry(
        'Jean Grey en estado Fénix Oscura representa la fractura definitiva entre poder absoluto y estabilidad emocional. Su expediente está marcado por tragedia, escala cósmica y el peligro permanente de que la voluntad individual no baste para contener lo que porta.',
        'Jean Grey in her Dark Phoenix state represents the ultimate fracture between absolute power and emotional stability. Her file is marked by tragedy, cosmic scale, and the permanent danger that individual will may no longer be enough to contain what she carries.',
        'Puede desatar energía de magnitud astronómica, alterar materia y aniquilar defensas a un nivel fuera de escala para la mayoría de operaciones terrestres. No es una unidad táctica normal, sino una posible fuerza de extinción localizada.',
        'She can unleash energy on an astronomical scale, alter matter, and annihilate defenses beyond the scale of most terrestrial operations. She is not a normal tactical unit but a possible localized extinction force.',
        'Activo de categoría terminal. Recomendado solo en escenarios de último recurso donde la alternativa inmediata sea peor que el riesgo de desplegarla.',
        'Terminal-category asset. Recommended only in last-resort scenarios where the immediate alternative is worse than the risk of deploying her.'
    ),
    deadpool: entry(
        'Wade Wilson convirtió dolor, trauma y deterioro mental en una versión grotesca de supervivencia eterna. Su expediente mezcla utilidad real, indisciplina extrema y una imposibilidad casi absoluta de prever la siguiente decisión del sujeto.',
        'Wade Wilson turned pain, trauma, and mental deterioration into a grotesque form of eternal survival. His file mixes real usefulness, extreme indiscipline, and an almost total impossibility of predicting the subject’s next decision.',
        'Su factor curativo, su tolerancia al daño y su versatilidad con armamento lo hacen peligrosamente persistente. Lo que gana en aguante lo pierde en control, pero cuando se necesita caos dirigido pocas piezas aguantan tanto.',
        'His healing factor, pain tolerance, and weapon versatility make him dangerously persistent. What he gains in staying power he loses in control, but when directed chaos is needed few assets last as long.',
        'Activo de utilidad imprevisible. Recomendado para distracción, agotamiento del enemigo y operaciones donde la cordura no sea un requisito de misión.',
        'Unpredictably useful asset. Recommended for distraction, enemy exhaustion, and operations where sanity is not a mission requirement.'
    ),
    doctoroctopus: entry(
        'Otto Octavius fue un científico brillante cuya vanidad y resentimiento terminaron amplificados por su propia creación. Su expediente refleja arrogancia intelectual, necesidad de control y una tendencia a justificar cualquier medio si refuerza su ego.',
        'Otto Octavius was a brilliant scientist whose vanity and resentment were ultimately amplified by his own invention. His file reflects intellectual arrogance, a need for control, and a tendency to justify any means if it reinforces his ego.',
        'Sus brazos mecánicos le otorgan fuerza, alcance, multitarea y capacidad de combate en espacios congestionados. Funciona muy bien como controlador de área y como cerebro táctico cuando el campo exige coordinación mecánica precisa.',
        'His mechanical arms grant strength, reach, multitasking, and strong combat capability in congested spaces. He functions very well as an area controller and tactical brain when the field demands precise mechanical coordination.',
        'Activo de control técnico. Recomendado para asaltos urbanos, manipulación de infraestructuras y combate en pasillos estrechos.',
        'Technical-control asset. Recommended for urban assaults, infrastructure manipulation, and combat in narrow corridors.'
    ),
    electro: entry(
        'Max Dillon transformó frustración personal y poder recién adquirido en una carrera criminal alimentada por impulsividad. Su expediente demuestra que, incluso sin gran disciplina, una fuente de energía humana puede alterar por sí sola un teatro de operaciones.',
        'Max Dillon turned personal frustration and newly gained power into a criminal career fueled by impulsiveness. His file proves that, even without deep discipline, a human power source can alter a theater of operations on its own.',
        'Genera y canaliza electricidad para incapacitar, sobrecargar sistemas y castigar agrupaciones enemigas. Es especialmente útil contra blindaje ligero, tecnología y despliegues que dependan de continuidad energética.',
        'He generates and channels electricity to incapacitate, overload systems, and punish hostile clusters. He is especially useful against light armor, technology, and deployments dependent on continuous power.',
        'Activo de saturación energética. Recomendado para sabotaje de sistemas, negación tecnológica y castigo de agrupaciones compactas.',
        'Energy-saturation asset. Recommended for system sabotage, tech denial, and punishment of dense hostile groupings.'
    ),
    elektra: entry(
        'Elektra Natchios fue moldeada por el dolor, la disciplina y un aprendizaje de muerte tan refinado como devastador. Su expediente combina elegancia letal, autocontrol severo y una línea moral que rara vez se parece a la del resto del equipo.',
        'Elektra Natchios was shaped by pain, discipline, and a training in death as refined as it is devastating. Her file combines lethal elegance, severe self-control, and a moral line that rarely resembles that of the rest of the team.',
        'Es una especialista absoluta en infiltración, asesinato silencioso y combate cuerpo a cuerpo con armas blancas. Rinde al máximo cuando la misión exige rapidez, limpieza y ninguna concesión emocional.',
        'She is an absolute specialist in infiltration, silent assassination, and bladed close combat. She performs at her best when the mission demands speed, cleanliness, and no emotional concessions.',
        'Activo de inserción mortal. Recomendado para eliminación selectiva, entrada furtiva y neutralización de blancos muy protegidos.',
        'Lethal-insertion asset. Recommended for selective elimination, stealth entry, and neutralization of heavily protected targets.'
    ),
    juggernaut: entry(
        'Cain Marko ha vivido a la sombra del resentimiento hasta convertirse en la encarnación física de la fuerza imparable. Su expediente refleja brutalidad, terquedad y una resistencia a la humillación que lo empuja a seguir avanzando aunque todo se derrumbe.',
        'Cain Marko has lived in the shadow of resentment until becoming the physical embodiment of unstoppable force. His file reflects brutality, stubbornness, and a resistance to humiliation that drives him forward even when everything collapses.',
        'Su conexión mística y su masa lo convierten en un proyectil casi imposible de frenar una vez toma impulso. No ofrece sutileza ni flexibilidad, pero pocas piezas rompen una defensa con tanta certeza.',
        'His mystical empowerment and mass turn him into a nearly impossible projectile to stop once momentum is gained. He offers neither subtlety nor flexibility, but few assets break a defense with such certainty.',
        'Activo de ruptura total. Recomendado para colapsar fortificaciones, atraer fuego enemigo y abrir corredores a cualquier precio.',
        'Total-breach asset. Recommended for collapsing fortifications, drawing enemy fire, and opening corridors at any cost.'
    ),
    kingpin: entry(
        'Wilson Fisk construyó un imperio criminal con la disciplina de un ejecutivo y la violencia de un depredador. Su expediente refleja inteligencia estratégica, dominio del miedo y una comprensión perfecta de cómo doblegar sistemas completos sin disparar primero.',
        'Wilson Fisk built a criminal empire with the discipline of an executive and the violence of a predator. His file reflects strategic intelligence, mastery of fear, and a perfect understanding of how to bend entire systems without firing first.',
        'Aunque su tamaño y fuerza lo vuelven peligroso en combate directo, su verdadero poder reside en redes, presión y control estructural. Funciona mejor como centro de mando coercitivo que como simple matón de primera línea.',
        'Though his size and strength make him dangerous in direct combat, his real power lies in networks, pressure, and structural control. He functions better as a coercive command center than as a simple front-line thug.',
        'Activo de mando criminal. Recomendado para control territorial, negociación hostil y campañas de desgaste donde la ciudad misma sea parte del arma.',
        'Criminal-command asset. Recommended for territorial control, hostile negotiation, and attritional campaigns where the city itself becomes part of the weapon.'
    ),
    kittypryde: entry(
        'Kitty Pryde creció pasando muy rápido de alumna prometedora a combatiente esencial, sin perder una humanidad sorprendente para alguien con tanto historial de guerra. Su expediente combina ingenio, calidez y una enorme capacidad de adaptación.',
        'Kitty Pryde grew very quickly from promising student to essential combatant without losing a remarkable humanity for someone with so much war behind her. Her file combines ingenuity, warmth, and enormous adaptability.',
        'Su capacidad de atravesar materia le permite infiltrarse, sabotear y extraer aliados ignorando barreras físicas convencionales. Es especialmente útil cuando el terreno parece imposible y la puerta correcta no existe.',
        'Her ability to phase through matter lets her infiltrate, sabotage, and extract allies by ignoring conventional physical barriers. She is especially useful when terrain appears impossible and the right door simply does not exist.',
        'Activo de infiltración avanzada. Recomendado para penetración silenciosa, recuperación de activos y evasión de entornos fuertemente cerrados.',
        'Advanced-infiltration asset. Recommended for silent penetration, asset recovery, and evasion inside heavily sealed environments.'
    ),
    lizard: entry(
        'Curt Connors encarna una tragedia científica donde la ambición por curar terminó liberando un instinto depredador difícil de contener. Su expediente oscila entre el médico brillante y la bestia territorial que emerge cuando la razón retrocede.',
        'Curt Connors embodies a scientific tragedy in which the ambition to heal ended up unleashing a predatory instinct difficult to contain. His file swings between brilliant physician and territorial beast whenever reason gives ground.',
        'Su forma reptil aporta fuerza, velocidad, regeneración y un salvajismo constante en combate cercano. Rinde bien en persecución, ruptura y escenarios donde la ferocidad animal marque el ritmo.',
        'His reptilian form brings strength, speed, regeneration, and constant savagery in close combat. He performs well in pursuit, breaching, and scenarios where animal ferocity sets the tempo.',
        'Activo de choque biológico inestable. Recomendado para ruptura agresiva y caza en espacios donde la contención posterior sea viable.',
        'Unstable biological-shock asset. Recommended for aggressive breaching and hunting in spaces where later containment remains viable.'
    ),
    loki: entry(
        'Loki ha vivido entre tronos, destierros y ficciones tejidas a su medida, moviéndose siempre entre villano, aliado incómodo y superviviente cósmico. Su expediente define a un manipulador brillante cuya lealtad suele durar lo mismo que su interés.',
        'Loki has lived among thrones, exiles, and fictions of his own making, always moving between villain, uneasy ally, and cosmic survivor. His file defines a brilliant manipulator whose loyalty often lasts only as long as his interest.',
        'Domina magia, ilusión, engaño y guerra psicológica con una flexibilidad casi teatral. No aplasta por fuerza directa: fractura voluntades, altera percepciones y convierte la incertidumbre en arma.',
        'He masters magic, illusion, deception, and psychological warfare with almost theatrical flexibility. He does not overwhelm through direct force: he fractures wills, alters perception, and turns uncertainty into a weapon.',
        'Activo de manipulación arcana. Recomendado para confusión estratégica, negociación imposible y operaciones donde la verdad sea negociable.',
        'Arcane-manipulation asset. Recommended for strategic confusion, impossible negotiation, and operations where truth itself is negotiable.'
    ),
    milesmorales: entry(
        'Miles Morales heredó el peso del símbolo de Spider-Man a una edad en la que casi nadie está preparado ni para sí mismo. Su expediente refleja coraje, empatía y una curva de aprendizaje muy rápida bajo presión extrema.',
        'Miles Morales inherited the weight of the Spider-Man symbol at an age when almost nobody is ready even for themselves. His file reflects courage, empathy, and a very fast learning curve under extreme pressure.',
        'A su movilidad arácnida suma camuflaje activo y descargas bioeléctricas capaces de sorprender incluso a rivales experimentados. Es excelente para infiltración, rescate y neutralización rápida sin potencia masiva.',
        'To his spider-like mobility he adds active camouflage and bioelectric discharges capable of surprising even experienced opponents. He excels at infiltration, rescue, and rapid neutralization without massive output.',
        'Activo de sigilo y respuesta joven. Recomendado para reconocimiento encubierto, extracción urbana y presión táctica sobre blancos móviles.',
        'Stealth and rapid-response youth asset. Recommended for covert reconnaissance, urban extraction, and tactical pressure on mobile targets.'
    ),
    moonknight: entry(
        'Marc Spector opera entre trauma, fe fragmentada y una identidad que nunca termina de estabilizarse. Su expediente refleja brutalidad controlada, experiencia paramilitar y una relación compleja con la violencia como forma de servicio.',
        'Marc Spector operates among trauma, fractured faith, and an identity that never fully stabilizes. His file reflects controlled brutality, paramilitary experience, and a complex relationship with violence as a form of service.',
        'Combina entrenamiento de mercenario, tolerancia al dolor y un estilo de combate que busca abrumar al rival antes de que pueda asentarse. Rinde bien en entornos nocturnos, patrulla urbana y represalia directa.',
        'He combines mercenary training, pain tolerance, and a fighting style built to overwhelm the opponent before they can settle in. He performs well in nighttime environments, urban patrol, and direct reprisal.',
        'Activo de castigo nocturno. Recomendado para persecución urbana, presión sobre redes violentas y operaciones donde el miedo sea útil.',
        'Night-punishment asset. Recommended for urban pursuit, pressure on violent networks, and operations where fear is useful.'
    ),
    morbius: entry(
        'Michael Morbius intentó curar su propia enfermedad con ciencia extrema y acabó creando una nueva forma de condena. Su expediente refleja culpa, aislamiento y un equilibrio precario entre intelecto brillante y hambre depredadora.',
        'Michael Morbius tried to cure his own condition through extreme science and ended up creating a new form of damnation. His file reflects guilt, isolation, and a precarious balance between brilliant intellect and predatory hunger.',
        'Dispone de fuerza, velocidad y sentidos aumentados, además de una capacidad de movilidad aérea limitada y gran conocimiento biomédico. Es útil cuando se necesita a la vez depredador y analista de laboratorio.',
        'He possesses enhanced strength, speed, and senses, along with limited aerial mobility and deep biomedical knowledge. He is useful when both predator and laboratory analyst are needed in the same body.',
        'Activo biológico de doble filo. Recomendado para rastreo, contención de amenazas orgánicas y análisis de emergencias hematológicas o infecciosas.',
        'Double-edged biological asset. Recommended for tracking, containment of organic threats, and analysis of hematological or infectious emergencies.'
    ),
    namor: entry(
        'Namor gobierna Atlantis con el orgullo de un monarca que nunca ha pedido permiso para existir. Su expediente lo sitúa entre aliado temible y potencia geopolítica impredecible, siempre guiado por el interés de su pueblo.',
        'Namor rules Atlantis with the pride of a monarch who has never asked permission to exist. His file places him between fearsome ally and unpredictable geopolitical power, always guided by the interest of his people.',
        'Bajo el agua y fuera de ella combina fuerza masiva, velocidad, vuelo y agresividad regia. Es una pieza de dominio ofensivo cuyo rendimiento crece cuando el escenario incluye costa, ríos o infraestructura marítima.',
        'In and out of the water he combines massive strength, speed, flight, and regal aggression. He is an offensive-dominance piece whose performance rises whenever the scenario includes coastlines, rivers, or maritime infrastructure.',
        'Activo de supremacía anfibia. Recomendado para intervención costera, choque frontal y negociación armada con amenazas de gran escala.',
        'Amphibious-supremacy asset. Recommended for coastal intervention, frontal shock, and armed negotiation with large-scale threats.'
    ),
    sabretooth: entry(
        'Victor Creed ha convertido el salvajismo en identidad y la crueldad en método. Su expediente muestra una criatura humana apenas sujeta por cálculo suficiente para dirigir su violencia hacia el blanco correcto.',
        'Victor Creed has turned savagery into identity and cruelty into method. His file shows a human creature barely restrained by just enough calculation to direct its violence at the proper target.',
        'Su fuerza, velocidad, olfato y capacidad regenerativa lo convierten en un perseguidor de pesadilla. Es especialmente eficaz en combate cercano y en escenarios donde la brutalidad pura desgaste más rápido que la táctica limpia.',
        'His strength, speed, scent tracking, and regenerative ability make him a nightmare pursuer. He is especially effective in close combat and in scenarios where pure brutality wears the enemy down faster than clean tactics.',
        'Activo de caza feroz. Recomendado para persecución, combate de desgaste y ruptura de moral por intimidación física directa.',
        'Feral-hunt asset. Recommended for pursuit, attritional combat, and morale-breaking through direct physical intimidation.'
    ),
    shangchi: entry(
        'Shang-Chi fue criado como arma viviente y pasó gran parte de su vida reaprendiendo lo que significa elegir por sí mismo. Su expediente combina disciplina absoluta, serenidad y una eficacia marcial casi perfecta.',
        'Shang-Chi was raised as a living weapon and spent much of his life relearning what it means to choose for himself. His file combines absolute discipline, serenity, and nearly perfect martial efficiency.',
        'No necesita armamento ni poder externo para dominar el combate: su técnica, lectura corporal y velocidad de ejecución bastan para desactivar amenazas superiores. Rinde al máximo en espacios cerrados y duelos de alto valor.',
        'He does not need external weapons or powers to dominate combat: his technique, body-reading, and execution speed are enough to disable superior threats. He performs best in confined spaces and high-value duels.',
        'Activo de excelencia marcial. Recomendado para neutralización precisa, entrenamiento de élite y resolución de conflictos sin dependencia tecnológica.',
        'Martial-excellence asset. Recommended for precise neutralization, elite training, and conflict resolution without technological dependence.'
    ),
    spiderwoman: entry(
        'Jessica Drew ha sido espía, agente doble y heroína mientras trataba de recomponer una identidad marcada por la manipulación. Su expediente refleja resistencia psicológica, oficio encubierto y una voluntad muy difícil de desactivar.',
        'Jessica Drew has been spy, double agent, and hero while trying to rebuild an identity shaped by manipulation. Her file reflects psychological endurance, covert tradecraft, and a will very difficult to switch off.',
        'Combina fuerza aumentada, vuelo, sigilo y bioelectricidad con entrenamiento de inteligencia. Es especialmente valiosa cuando una misión exige a la vez infiltración, combate y lectura fina del entorno humano.',
        'She combines enhanced strength, flight, stealth, and bioelectricity with intelligence training. She is especially valuable when a mission demands infiltration, combat, and fine reading of the human environment at once.',
        'Activo de espionaje ofensivo. Recomendado para penetración encubierta, contrainteligencia y extracción de información bajo presión.',
        'Offensive-espionage asset. Recommended for covert penetration, counterintelligence, and information extraction under pressure.'
    ),
    starlord: entry(
        'Peter Quill ha sobrevivido a imperios, sectas cósmicas y equipos imposibles gracias a una mezcla de descaro, liderazgo improvisado y suerte bien aprovechada. Su expediente no inspira confianza inmediata, pero sí una sorprendente tasa de supervivencia.',
        'Peter Quill has survived empires, cosmic cults, and impossible teams through a blend of nerve, improvised leadership, and well-used luck. His file does not inspire immediate confidence, but it does show a surprising survival rate.',
        'Aporta movilidad táctica, armamento dual y una notable capacidad para coordinar personalidades dispares en escenarios de caos. Destaca cuando el plan ha dejado de existir y alguien tiene que mantener el movimiento.',
        'He brings tactical mobility, dual sidearms, and a notable ability to coordinate clashing personalities in chaotic scenarios. He stands out when the plan has already collapsed and someone still has to keep the team moving.',
        'Activo de liderazgo flexible. Recomendado para operaciones móviles, grupos heterogéneos y escenarios donde el carisma operativo importe tanto como la potencia.',
        'Flexible-leadership asset. Recommended for mobile operations, heterogeneous teams, and scenarios where operational charisma matters as much as firepower.'
    ),
    vulture: entry(
        'Adrian Toomes transformó resentimiento, ambición y talento técnico en una depredación aérea sostenida por décadas. Su expediente lo describe como oportunista paciente, poco glamuroso y peligrosamente constante.',
        'Adrian Toomes turned resentment, ambition, and technical skill into aerial predation sustained for decades. His file describes him as a patient opportunist, not glamorous but dangerously consistent.',
        'Su arnés le concede vuelo, maniobra y capacidad de ataque rápido desde ángulos difíciles de cubrir. Resulta útil como hostigador aéreo y como pieza de desgaste contra formaciones dispersas.',
        'His harness grants flight, maneuverability, and fast attack capability from angles difficult to cover. He is useful as an aerial harasser and attrition piece against dispersed formations.',
        'Activo de presión vertical. Recomendado para acoso aéreo, patrulla hostil y explotación de huecos defensivos desde altura.',
        'Vertical-pressure asset. Recommended for aerial harassment, hostile patrol, and exploitation of defensive gaps from above.'
    ),
    warmachine: entry(
        'James Rhodes ha sido piloto, soldado y uno de los pocos capaces de soportar la presión de llevar una armadura de guerra sin perder claridad moral. Su expediente combina disciplina militar, lealtad firme y una comprensión muy real del coste del combate.',
        'James Rhodes has been pilot, soldier, and one of the few capable of bearing a war armor without losing moral clarity. His file combines military discipline, firm loyalty, and a very real understanding of combat’s cost.',
        'Su plataforma War Machine prioriza potencia de fuego, resistencia y apoyo pesado por encima de la versatilidad estilizada de Stark. Es ideal para sostener una ofensiva o cubrir retirada con una lluvia de castigo controlado.',
        'His War Machine platform prioritizes firepower, durability, and heavy support over the more stylized versatility of Stark. It is ideal for sustaining an offensive or covering a retreat with disciplined punishment.',
        'Activo de artillería táctica. Recomendado para cobertura de columnas, supresión sostenida y respuesta militar de alta intensidad.',
        'Tactical-artillery asset. Recommended for column cover, sustained suppression, and high-intensity military response.'
    ),
    wasp: entry(
        'Janet Van Dyne fue mucho más que socia de laboratorio: su expediente la sitúa como fundadora, estratega social y figura clave en la cohesión vengadora. Tras una imagen luminosa hay una operadora muy difícil de subestimar.',
        'Janet Van Dyne was far more than a laboratory partner: her file places her as founder, social strategist, and a key figure in Avengers cohesion. Beneath the bright image stands an operator very hard to underestimate.',
        'Puede reducir su tamaño, volar y proyectar bio-descargas mientras se mueve por espacios casi imposibles para otros agentes. Su combinación de movilidad, sigilo y hostigamiento la vuelve excelente para apoyo quirúrgico.',
        'She can shrink, fly, and project bio-stings while moving through spaces almost impossible for other agents. Her mix of mobility, stealth, and harassment makes her excellent for surgical support.',
        'Activo de inserción mínima y hostigamiento preciso. Recomendado para reconocimiento encubierto, sabotaje fino y apoyo a objetivos de alto valor.',
        'Minimal-insertion and precise-harassment asset. Recommended for covert reconnaissance, fine sabotage, and support on high-value targets.'
    ),
    wintersoldier: entry(
        'Bucky Barnes sobrevivió a la guerra, al lavado de cerebro y a décadas de convertir su propia memoria en terreno enemigo. Su expediente refleja un operador excepcional marcado por culpa profunda, pero todavía capaz de una lealtad feroz.',
        'Bucky Barnes survived war, brainwashing, and decades of having his own memory turned into hostile ground. His file reflects an exceptional operator marked by deep guilt, yet still capable of fierce loyalty.',
        'Combina puntería de élite, brazo cibernético, infiltración y experiencia negra de combate en múltiples teatros. Es especialmente eficaz cuando la misión exige matar rápido, desaparecer y seguir operando bajo presión extrema.',
        'He combines elite marksmanship, a cybernetic arm, infiltration skill, and black-ops combat experience across multiple theaters. He is especially effective when the mission demands killing fast, vanishing, and continuing to operate under extreme pressure.',
        'Activo de operaciones encubiertas de alta letalidad. Recomendado para eliminación precisa, sabotaje y extracción en entorno hostil persistente.',
        'High-lethality covert-operations asset. Recommended for precise elimination, sabotage, and extraction inside persistently hostile environments.'
    )
};

export const getHeroLoreEntry = (alias?: string): HeroLoreEntry | undefined => {
    if (!alias) return undefined;
    return HERO_LORE[normalizeHeroKey(alias)];
};
