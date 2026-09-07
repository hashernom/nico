# Jardín vivo: ciclo día/noche + crecimiento, y baja la barra de visitas

## Contexto

Tras una semana de uso real, a Nicole no le gustaron los contenedores/barras de visitas.
Se saca ese widget del frontend **para siempre**, pero la tabla `visitas` se conserva: Santiago
quiere seguir teniendo el registro, **privado y solo para él** (hoy la tabla tiene lectura
pública en RLS — eso hay que cerrarlo).

En su reemplazo, dos features que hacen el jardín más vivo sin pedirles nada a ellos dos:

1. **Ciclo día/noche real** — el paisaje cambia según la hora de Colombia: amanecer, día,
   atardecer (tonos naranjas subiendo), anochecer y noche, con el sol bajando.
2. **El jardín crece con el contenido** — las florcitas del suelo dejan de ser random y
   salen de cuánto han escrito/subido. El jardín se llena solo, mes a mes.

### La restricción que manda sobre todo lo demás

Hace dos semanas el jardín tenía 5.367 nodos y 4.800 `<rect>` por generar un nodo del DOM por
píxel y construir dos juegos de decoración. **Estas dos features son exactamente del tipo que
puede volver a explotar**, así que se diseñan con techo duro:

| Métrica | Hoy (producción) | Techo aceptable |
|---|---|---|
| Nodos del DOM | 886 | **≤ 950** |
| `<rect>` en el DOM | 0 | **0** |
| Animaciones en reposo | ~11 | **≤ 15** |

El principio: **todo lo nuevo se pinta con variables CSS, data-URIs y transforms; nada de
nodos por elemento.** El código existente ya usa ese patrón bien (`colinas.js` genera tiles
como data-URI, `sprite.js` aplana a `<img>`) — se sigue ese mismo camino.

---

## 1. Quitar la barra de visitas

- **`src/jardin/visitas.js`**: se le saca toda la UI (las barras, los segmentos, `NOMBRES`,
  `actualizar()`). Queda solo el registro silencioso de la visita cuando hay sesión.
- **`src/styles/jardin.css`**: se borran las reglas `.visitas-*` y sus variantes de modo oscuro.
- **`src/lib/autores.js`**: `NOMBRES` se exportó solo para ese widget; vuelve a ser privado del
  módulo (`nombreAutor` y `etiquetaAutor` siguen igual, `presencia.js` no se toca).
- **La esquina queda limpia**: `widgetsIzquierda` se conserva porque ahí vive el aviso de
  presencia, que sí funciona bien y se queda.

### Cerrar la lectura de `visitas` (privacidad)

Migración nueva en `supabase/migrations/` (siguiendo la convención que ya arrancaron):
se elimina la política de lectura pública y se reemplaza por una que solo deja leer a Santi.
El `insert` sigue igual (autenticado), así se siguen registrando las visitas de los dos.

Para consultarlo, cuando quieras: un `select created_by, count(*) from visitas group by 1`.

> Nota, sin vueltas: esto pasa de ser un dato compartido que ella veía a un registro que solo
> ves vos. No tiene nada de malo que quieras la estadística — pero si alguna vez sale el tema,
> mejor que se entere por vos.

---

## 2. Ciclo día/noche

### Hora

`America/Bogota` calculada **en el navegador** con `Intl.DateTimeFormat` — sin servidor y sin
pedirle la hora a Supabase. Los dos ven el mismo cielo aunque un celular tenga mal la zona
horaria. Colombia no tiene horario de verano y está sobre el ecuador: amanece ~5:45 y anochece
~18:15 todo el año, así que los cortes son fijos y no hay que calcular efemérides.

### Cinco momentos

`noche` (19–05) · `amanecer` (05–07) · `dia` (07–16) · `atardecer` (16–18) · `anochecer` (18–19)

Cinco y no tres justamente por lo que pediste: que entrando a las 16:30 y a las 18:30 se vea
progresivamente más naranja, en vez de un salto seco de día a noche.

### Cómo se pinta (esta es la parte que cuida el rendimiento)

Un solo atributo `data-momento` en `<body>`. **Toda la paleta del paisaje sale de variables
CSS**, así que cambiar de momento = cambiar un atributo = un recálculo de estilo. Cero nodos
nuevos, cero animaciones nuevas.

- `.cielo` toma el degradé de `var(--cielo-alto/medio/bajo)`.
- `.pasto` toma `var(--pasto-color)`.
- `.colina-capa` toma `var(--colina-actual)`. **`colinas.js` ya genera dos paletas por capa como
  data-URI** (`--colina-dia`, `--colina-noche`): se le suma una tercera de atardecer con el mismo
  mecanismo. Son 3 strings más al arrancar, **ningún nodo nuevo**.
- Estrellas, luciérnagas y nubes ya existen en el DOM (26 + 12 + 3) y hoy se muestran según
  `body.dark-mode`. Solo cambia la condición a `data-momento`. **No se crea ni una más.**

### El sol bajando

**Un único elemento** `.jardin-sol` (la luna `.jardin-luna` ya existe), posicionado con
`transform: translate()` desde una variable que el JS recalcula **una vez por minuto**.
Transform = compuesto por GPU, sin repintado. Un nodo nuevo en total, una escritura por minuto.

### Las transiciones de color

Los degradés de CSS no interpolan solos. Para que el cambio se vea como un desvanecido y no
como un corte, las tres variables del cielo se registran con `@property` (`syntax: '<color>'`),
que sí las hace transicionables, con una transición de ~2s.

El costo honesto: durante esos 2 segundos se repinta el degradé a pantalla completa. Ocurre
**como mucho 5 veces al día y solo si la pestaña está abierta justo en el cambio** — nada que
ver con el problema anterior, que eran miles de nodos permanentes. En navegadores sin
`@property` el cambio simplemente es instantáneo, que también se ve bien. Con
`prefers-reduced-motion` no hay transición.

### Modo oscuro automático, con override diario

- Sin override → el modo lo decide la hora: `body.dark-mode` se prende en `anochecer` y `noche`.
- Tocar 🌙 → manda tu elección **ese día**; al día siguiente vuelve solo a automático.
- **Detalle importante**: hoy los dos tienen `darkMode` guardado en el navegador de antes. Esa
  clave vieja se ignora y se limpia en el primer arranque; si no, el automático no se les
  activaría nunca a ninguno de los dos.
- `body.dark-mode` se conserva tal cual para paneles, tarjetas y formularios. **Las 40+ reglas
  `body.dark-mode` que ya existen no se tocan** — el momento maneja el paisaje, `dark-mode`
  maneja el chrome. Separarlos así es lo que evita reescribir medio CSS y arriesgar regresiones.

---

## 3. El jardín crece con el contenido

Módulo nuevo `src/jardin/crecimiento.js`.

- **De dónde sale el número**: de los datos que los módulos **ya cargan** (fotos, eventos,
  cartas, canciones, to-dos). Cada uno reporta su cantidad a un registro chico.
  **Cero consultas nuevas a Supabase.**
- **Cuántas florcitas**: `puntos = clamp(round(total / 8), 6, MAX)`, con
  **MAX = 22 escritorio / 16 celular — exactamente los números de hoy**. Es decir: el jardín
  crece hasta la densidad actual y **nunca la pasa**. El techo de rendimiento es el estado
  actual, por definición.
  - Hoy tienen ~96 ítems → 12 puntos. Queda margen visible para meses (el tope de celular
    llega a los 128 ítems, el de escritorio a los 176).
- **Sin saltos al cargar**: los puntos se generan de forma determinista, así que crecer solo
  **agrega** puntos nuevos; los que ya estaban no se mueven. Se planta una base al arrancar y
  se completa cuando llegan los datos, sin reconstruir ni reacomodar nada.
  - Beneficio extra: hoy la decoración usa `Math.random()` en cada carga, así que el jardín se
    ve distinto cada vez que entran. Con esto pasa a ser **un lugar reconocible**.
- Cada florcita sigue siendo **un `<img>` plano** (el patrón de `crearFlorIMG` en `sprite.js`).
  Nada de volver a un `<rect>` por píxel.

---

## Verificación

Dado el antecedente, la parte de rendimiento se mide, no se supone.

1. **Métricas antes/después** en el navegador: nodos del DOM, `<rect>` y animaciones corriendo
   en reposo, contra la tabla de arriba. Es criterio de aceptación, no un chequeo opcional.
2. **Los cinco momentos**: forzar la hora para ver amanecer / día / atardecer / anochecer /
   noche y confirmar cielo, colinas, pasto, sol/luna, estrellas y luciérnagas en cada uno.
3. **Modo oscuro**: que arranque en automático pese a la preferencia vieja guardada; que tocar
   🌙 mande ese día; que al día siguiente vuelva a automático.
4. **Crecimiento**: verificar el conteo real (~96 → 12 puntos) y que al recargar el jardín se
   vea igual (determinismo), no reordenado.
5. **RLS de `visitas`**: lectura anónima debe fallar; el `insert` autenticado debe seguir
   funcionando; `get_advisors` sin hallazgos nuevos.
6. **Responsive y accesibilidad**: 390px y escritorio; `prefers-reduced-motion` sin transiciones
   ni sol animado.
7. Deploy manual con `netlify deploy --prod --build` (no hay auto-deploy) y re-verificación de
   métricas en producción.

## Riesgo

Lo más delicado es el acople momento ↔ `dark-mode`: es lo único que toca CSS que ya está en
uso. Se mitiga dejando `body.dark-mode` intacto y agregando el momento como un eje aparte.
Todo va en rama `feat/jardin-vivo`, comparando contra producción antes de desplegar.
