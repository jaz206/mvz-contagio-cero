# Contagio Cero - Guia general del proyecto

Este documento resume como funciona la web para que pueda usarse como base de conocimiento en un GEM o en cualquier documento maestro del proyecto.

## 1. Que es la aplicacion

La aplicacion es un sistema de juego y gestion de campaña con estetica SHIELD para Marvel Zombies / Contagio Cero.

La web mezcla varias capas:

- Pantalla de acceso.
- Seleccion de historia, bando y expansiones.
- Secuencia de introduccion.
- Mapa tactico de EEUU con misiones y control de zonas.
- Bunker interior para gestionar heroes, misiones y avances.
- Paneles de admin para editar contenido, personajes, historias e intro.

La idea central es que el jugador avance por una campana guiada, mientras el admin puede cambiar contenido sin tocar el juego desde fuera.

## 2. Flujo principal del jugador

El flujo normal es este:

1. Entra en la pantalla de acceso.
2. Se identifica con Google o con acceso local, segun el modo.
3. Pasa por la historia inicial.
4. Elige bando.
5. Selecciona expansiones.
6. Ve la intro del bando.
7. Entra en la mision 0 si corresponde.
8. Pasa al tutorial o al mapa principal.
9. Desde el mapa puede abrir misiones, ver zonas, entrar al bunker y seguir la campana.

## 3. Pantalla de acceso

La pantalla inicial permite:

- Acceso con Google para cuentas autorizadas.
- Acceso local sin login para probar la web sin guardar progreso.
- Cambio de idioma.

Hay un modo de control de acceso para limitar quien puede entrar como editor o admin.

## 4. Historia inicial e intro

La web tiene dos capas narrativas separadas:

- Historia principal.
- Intro del bando.

La historia principal aparece antes de la seleccion de bando.

La intro cambia segun el bando elegido:

- Bando heroes.
- Bando zombies.

Ambas secuencias se editan desde el panel de admin.

## 5. Seleccion de bando y expansiones

Despues de la historia, el jugador elige:

- Bando.
- Expansiones que posee.

Esto es importante porque:

- Habilita o bloquea personajes.
- Habilita o bloquea reglas especiales.
- Determina si pueden aparecer ciertos eventos.
- Determina si algunas misiones son visibles o no.

Si el jugador no tiene una expansion necesaria, el juego debe adaptarse y quitar reglas que no pueda usar.

## 6. Mapa principal

El mapa es el centro de la partida.

Desde ahi el jugador ve:

- Las zonas de la Triada.
- Las misiones activas y completadas.
- Las misiones principales y secundarias.
- Los eventos especiales.
- El bunker.
- El estado global de control.

### 6.1 Zonas

Las zonas de la Triada cambian de aspecto cuando se conquistan.

Cuando una zona queda controlada:

- El interior pasa a cian brillante.
- El borde se dibuja como un perimetro holografico.
- El cambio entra desde el centro y se abre hacia fuera.
- La zona muestra un simbolo SHIELD en el centro.

### 6.2 Misiones

Las misiones se representan en el mapa y pueden ser:

- Principales.
- Secundarias.
- De jefe.
- De evento especial.

Al completar una mision:

- Se marca como terminada.
- Puede desbloquear otras misiones.
- Puede contribuir a controlar una zona.

Las misiones de jefe y los eventos grandes tambien deben quedar marcados como completados en verde cuando se terminan.

### 6.3 Control de zonas

El admin puede decidir que misiones deben completarse para que cada zona cambie de color.

Eso permite que:

- Cada zona tenga su propia lista de misiones necesarias.
- El cambio de control se vea claramente en el mapa.
- El mapa refleje el avance real de la campana.

## 7. Bunker

El bunker es la base de mando.

Dentro del bunker se gestionan cosas como:

- Heroes disponibles.
- Heroes desplegados.
- Misiones ligadas al bunker.
- Reclutamiento.
- Fichas de personaje.
- Registro de progreso.
- Recursos especiales.

El bunker no es solo un menu: es la sala de gestion principal de la campana.

### 7.1 Regreso al mapa

Desde el bunker se vuelve al mapa con un boton claro de salida.

Ese boton debe ser legible y directo, porque es una accion que el jugador usa mucho.

### 7.2 Acceso al bunker

El acceso al bunker desde el mapa usa el icono de SHIELD.

No se usa ya un texto tipo HQ como elemento principal.

## 8. Personajes y fichas

Los heroes y personajes importantes tienen una ficha visual tipo expediente SHIELD.

Las fichas muestran:

- Foto principal.
- Nombre.
- Clase.
- Estado.
- Clave o nivel de acceso.
- Perfil de combate.
- Historia.
- Poderes.
- Evaluacion tactica.

### 8.1 Datos que se usan en la ficha

La ficha de juego muestra especialmente:

- Vida.
- Tipo.
- Dados.
- To Hit.
- Alcance.

La ficha no debe mostrar elementos que sobran o que duplican informacion.

### 8.2 Edicion de personajes

Los personajes se pueden editar desde el panel de admin.

La edicion debe permitir cambiar:

- Nombre.
- Imagen.
- Historia.
- Ficha.
- Poderes.
- Estado.
- Disponibilidad.

Los personajes jugables pueden bloquearse o desbloquearse desde admin.

## 9. Misiones

Las misiones tienen una parte narrativa y una parte visual.

Pueden incluir:

- Titulo.
- Texto narrativo.
- Objetivos.
- Relacion con otras misiones.
- PDFs.
- Imagen o enlace visual.
- Bando.
- Estado de publicacion.
- Clasificacion.

### 9.1 Tipos de mision

Hay misiones de:

- Historia principal.
- Ramificaciones.
- Jefes.
- Eventos especiales.
- Zonas concretas.

### 9.2 Relaciones entre misiones

Las misiones pueden encadenarse:

- Una puede desbloquear otra.
- Una puede depender de varias anteriores.
- Una puede ser para ambos bandos.

### 9.3 Misiones de Galactus

Los eventos de Galactus:

- Solo aparecen si el jugador tiene la expansion de Galactus.
- Se reparten de forma aleatoria.
- No deben ir pegados unos a otros.
- Deben poder salir temprano o tarde dentro de un grupo de misiones.

## 10. Panel de admin

El panel de admin es la herramienta de control principal.

Desde ahi se puede gestionar:

- Editores.
- Personajes.
- Misiones.
- Historia inicial.
- Intro.
- Control de zonas.
- Reglas de acceso.

### 10.1 Editores

El admin puede dar permisos por bloques.

Ejemplos:

- Misiones: ver, crear, editar, borrar.
- Personajes: ver, crear, editar, borrar.

### 10.2 Misiones

El panel de misiones permite:

- Ver todas las misiones.
- Filtrarlas por bando.
- Filtrarlas por estado.
- Verlas en lista o en mapa.
- Reordenarlas.
- Crear nuevas.
- Editarlas por completo.
- Conectar unas con otras.
- Marcar si son principales o secundarias.

### 10.3 Zonas

El panel de zonas permite decidir:

- Que misiones deben completarse para controlar cada zona.
- Que zonas ya estan controladas.
- Como se pinta cada zona en el mapa.

## 11. Documentacion y archivos externos

El proyecto usa varios archivos de apoyo:

- `Heroes_jugables_castellano.md` para la informacion de poderes y fichas.
- `Heroes_jugables_es.md` como apoyo de traduccion si hace falta.
- PDFs de misiones en el repositorio de GitHub.
- Imagenes de personajes y simbolos en GitHub.
- Hojas de calculo para revisar personajes y expansiones.

## 12. Reglas importantes de la aplicacion

- No se debe enseñar contenido que el jugador no pueda usar por expansiones.
- Lo que esta bloqueado por admin no debe aparecer como jugable.
- Lo completado debe verse claramente en verde.
- Las zonas controladas deben verse claramente en cian brillante.
- El mapa debe decir sin duda donde esta el control y donde no.

## 13. Resumen corto para el GEM

Si el GEM necesita una frase muy corta para orientarse:

> Contagio Cero es una web de juego y gestion SHIELD para Marvel Zombies, con login, historia, intro por bando, seleccion de expansiones, bunker, mapa tactico, misiones conectadas, control de zonas y paneles de admin para editar personajes, misiones, historia e intro.

