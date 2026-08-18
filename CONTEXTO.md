# Antología — contexto del proyecto

> Documento de traspaso. Si sos un agente que recién llega: **leé esto entero antes de tocar nada**,
> sobre todo la sección "FASE 2 — El jardín de flores". Hay decisiones de diseño ya tomadas con el
> usuario que parecen arbitrarias y no lo son. Cambiarlas sin preguntar arruina el proyecto.

Última actualización: 18 de agosto de 2026 (Fase 2 en construcción en `feat/jardin`).

---

## Qué es esto

Un sitio personal que Santiago le hizo a su novia Nicole. Es un regalo, no un producto:
una antología de su relación con contadores de tiempo, un timeline de momentos importantes,
una galería de fotos y una to-do list compartida. La estética es **Stardew Valley** (madera,
pixel art, paleta cálida) con toques kawaii en rosa y celeste.

Se usa **sobre todo desde el celular**. El historial de commits está lleno de arreglos mobile.
Cualquier cosa que se vea bien en desktop pero mal en 360px es un fracaso, no un detalle.

- **Producción (nuevo)**: https://antologia-nico.netlify.app ← rama `rework`
- **Producción (viejo)**: https://hashernom.github.io/nico/ ← rama `main`, sin Supabase
- **Repo**: https://github.com/hashernom/nico (público)

---

## Estado: FASE 1 COMPLETA ✅

Se migró de un sitio estático con datos hardcodeados a Vite + Supabase, para que Nicole pueda
subir fotos y compartir la to-do list sin tocar código.

### Ramas

| Rama | Qué tiene | Dónde se ve |
|---|---|---|
| `main` | Versión original, datos hardcodeados en `script.js` | GitHub Pages |
| `rework` | **Rama de trabajo actual.** Vite + Supabase (Fase 1) | Netlify |
| `feat/supabase-coop` | Rama donde se hizo la Fase 1, ya mergeada a `rework` | — |
| `feat/jardin` | **Fase 2 en construcción.** El jardín, en paralelo al sitio de scroll | todavía sin desplegar |

**El usuario pidió explícitamente dejar `main` y GitHub Pages funcionando.** No los toques.
Todo el trabajo nuevo va sobre `rework`.

### Backend (Supabase)

Proyecto `antologia-nico`, ref `vmgcmrldqzhjerzenbum`, región us-east-1, **plan free**.

Cinco tablas, todas con RLS habilitado. Las tres primeras ya tienen UI; `letters` y `songs`
están vacías esperando la Fase 2:

| Tabla | Filas | Columnas propias |
|---|---|---|
| `photos` | 27 | `storage_path`, `caption`, `taken_on`, `sort_index` |
| `events` | 13 | `title`, `happened_on` (nullable) |
| `todos` | 0 | `text`, `done` |
| `letters` | 0 | `body`, `written_on` |
| `songs` | 0 | `title`, `url`, `note` |

Todas comparten `id uuid`, `created_at timestamptz`, `created_by uuid → auth.users`.

**Política de acceso** (idéntica en las 5 tablas y en el bucket `fotos`):
lectura para `anon` + `authenticated`, escritura solo `authenticated`.
Como el registro público está cerrado, "authenticated" = las cuentas de la pareja.

Verificado contra la API real, no solo leído:
- lectura anónima → `200`
- `insert` anónimo en las 5 tablas → `401`
- subida anónima a Storage → `"new row violates row-level security policy"`
- `get_advisors` (security) → **cero hallazgos**

**Realtime** habilitado en `todos`, `photos`, `events`.

**Storage**: bucket `fotos`, público para lectura. Las 27 fotos históricas viven en
`historicas/NN-imgN.jpg`. Las nuevas suben con nombre único al raíz del bucket.

### Frontend

`script.js` (681 líneas, un solo archivo) se partió en módulos:

```
index.html
vite.config.js          netlify.toml
src/
  main.js               orquesta el init
  lib/
    supabase.js         cliente único
    auth.js             sesión + modal de login. Exporta haySesion() y alCambiarSesion()
    imagen.js           comprime en el navegador antes de subir (máx 1600px, JPEG 0.82)
  features/
    timers.js           los 2 contadores. Fechas HARDCODEADAS a propósito
    eventos.js          timeline, CRUD contra tabla events
    galeria.js          galería + subida. Exporta fotosActuales() y urlPublica()
    todos.js            lista compartida con realtime
    lightbox.js         visor de fotos con swipe
    intro.js            pantalla de bienvenida con flores
    decorativo.js       partículas, estrellas, corazones, brillos. No toca datos
  styles/
    base.css            el styles.css original renombrado. NO se dividió (ver más abajo)
    flores.css          la animación de flores CSS 3D (el css/main.css original)
    coop.css            estilos nuevos: login, formularios, estados
scripts/migrar-fotos.mjs  migración única, ya ejecutada
img/                      27 fotos originales. Semilla de la migración, NO se despliega
public/img/fondo.jpg      lo único que sí se despliega como asset
```

Cómo funciona la sesión: `auth.js` mantiene el estado y los módulos se suscriben con
`alCambiarSesion(cb)`. Sin sesión el sitio se ve **igual que siempre** pero sin controles
de edición (formularios con clase `oculto`, inputs deshabilitados).

**Desviación consciente del plan**: el plan decía dividir `styles.css` en varios archivos por
sección. No se hizo. Son ~1600 líneas hechas a mano y la Fase 2 va a reescribir buena parte;
dividirlas ahora era churn con riesgo de regresión y cero ganancia. Solo se renombró a `base.css`.

### Infra

- **Netlify**: sitio `antologia-nico`, ID `d4c73213-1297-4fac-8716-9cf979f578a0`.
  Build `npm run build`, publish `dist`. Variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
  ya cargadas. **Deploy manual** con `netlify deploy --prod --build` — no hay auto-deploy en push
  porque conectar Git requiere que el usuario autorice OAuth y no lo hizo todavía.
- **Vercel**: se intentó primero y el conector devolvió `403 forbidden` al crear proyecto.
  Se abandonó a pedido del usuario, que prefiere Netlify porque ya tiene el CLI. Queda un
  `.vercel` en el `.gitignore`, inofensivo.
- **Keep-alive**: `.github/workflows/keep-alive.yml` pega un request diario a la API.
  Los proyectos free de Supabase se pausan tras ~7 días sin actividad y el sitio se caería.
  Los secrets `SUPABASE_URL` y `SUPABASE_ANON_KEY` ya están cargados en GitHub.

### Bugs arreglados en el camino

1. **El contenido principal podía quedar invisible tras el click de bienvenida.** El JS quitaba
   la clase `initial-hidden`, rompiendo la transición CSS pensada para eso; el reveal terminaba
   dependiendo de que una animación decorativa no relacionada hubiera terminado. En pestañas en
   segundo plano o dispositivos lentos la página entera quedaba en `opacity:0` para siempre.
   **Si tocás `intro.js`, no vuelvas a quitar `initial-hidden`.**
2. El lightbox capturaba los nodos del DOM con un `setTimeout` de 300ms, así que se
   desincronizaba al subir o borrar fotos. Ahora lee la lista al abrirse.
3. CSS duplicado y muerto (`.lightbox-nav` dos veces idéntico, `body.dark-mode .todo-footer`
   con valores en conflicto).
4. `script.js` no tenía cache-busting: los visitantes se quedaban con el JS viejo cacheado.
   Con Vite esto ya no aplica (los assets van con hash).

---

## Pendientes de la Fase 1

Son tareas del **usuario**, no de un agente:

1. ⚠️ **Rotar la `service_role` key.** Se pegó en texto plano en el chat para correr la migración.
   Esa clave saltea RLS por completo. Supabase → Project Settings → API Keys → Regenerate.
   El sitio nunca la usa, rotarla no rompe nada.
2. **Crear la cuenta de Nicole** en Supabase → Authentication → Users → Add user.
   (El registro público ya está cerrado: `disable_signup: true`, verificado.)
3. **Probar a mano el flujo con sesión**: login, subir una foto, agregar un evento.
   No se pudo verificar automáticamente porque hacerlo requería credenciales reales.
   La lógica es la misma que la de los to-dos, que sí se probó de punta a punta.

Opcional: conectar el repo a Netlify para auto-deploy, y decidir si en algún momento se
apaga GitHub Pages (por ahora el usuario quiere las dos versiones vivas).

---

# FASE 2 — El jardín de flores

**Esta es la parte que importa. Todo lo de abajo se decidió con el usuario pregunta por pregunta.
No son sugerencias: son decisiones tomadas.**

## Estado: ESQUELETO COMPLETO, FALTA PULIDO VISUAL 🌱

Está todo construido y funcionando en la rama `feat/jardin`, **en paralelo** al sitio de scroll:
el jardín vive en `jardin.html` y el sitio de siempre sigue intacto en `index.html`. Vite quedó
configurado como multipágina y las dos compilan.

Lo que ya anda, verificado contra el sitio corriendo:

- Las seis flores se plantan, abren su panel, y las seis secciones traen datos reales
  (27 fotos, 13 eventos, y las tablas nuevas respondiendo).
- Intro de floración, transición de cámara, zoom sobre la flor, panel que crece desde ella.
- Cartas y Música: UI nueva completa con alta, borrado y realtime.
- Modo oscuro cubierto en toda la escena y el panel.
- Responsive verificado a 360×640, 375×812 y desktop: las seis flores entran sin scroll
  horizontal y los seis paneles entran en pantalla.
- Teclado: cada flor es un `<button>` con `aria-label`; Escape cierra; el botón "atrás"
  del celular vuelve al jardín en vez de salir del sitio.

**Lo que falta es mirarlo con ojos humanos.** El agente que lo construyó no pudo tomar
capturas de pantalla (el panel del navegador no estaba abierto), así que verificó geometría,
datos y accesibilidad por código, y las flores rasterizándolas con `sharp`. Nadie vio todavía
la página entera renderizada. Antes de mergear a `rework`: abrir `jardin.html`, recorrerla en
celular de verdad, y ajustar lo que se vea feo.

Archivos nuevos:

```
jardin.html               entrada paralela (el sitio viejo sigue en index.html)
src/jardin.js             orquesta el init del jardín
src/jardin/
  sprite.js               genera las flores pixel art en SVG
  secciones.js            las 6 flores: forma, paleta, ícono, posición
  jardin.js               cantero, cámara y panel
  intro-jardin.js         la floración de entrada
src/features/cartas.js    tabla letters
src/features/musica.js    tabla songs
src/styles/jardin.css     todo lo visual del jardín
```

### Decisiones que se tomaron durante la construcción

- **Tres siluetas × seis paletas** (el usuario eligió esto sobre "una sola forma" y sobre
  "seis especies distintas"). Las tres formas salen de `SILUETAS` en `sprite.js`.
- **Hay dos maneras de definir una silueta**: curva rosa (`tipo: 'rosa'`) y pétalos como
  discos (`tipo: 'discos'`). La curva sola no alcanzaba: por más que se ajusten los números
  siempre termina en punta y la flor se lee como un destello. Los discos dan el pétalo
  redondo del pixel art clásico. Si vas a agregar una flor, mirá los dos modos antes.
- **La flor verde es menta, no verde hoja.** Un verde pasto sobre un cantero de pasto
  desaparece. Se probó y se cambió por eso, no por gusto.
- **Cartas = sobres que se abren** y **Música = cassettes con link**, ambas elegidas por
  el usuario. Música **no** embebe iframes de Spotify/YouTube a propósito: rompen la
  estética y meten scripts de terceros.
- `sprite.js` arma el SVG **como string** y recién después lo parsea. Es para que el
  generador ande también en Node y se puedan rasterizar las flores sin levantar el sitio.
  Si lo volvés a `createElementNS`, perdés esa posibilidad.

### Bugs encontrados y arreglados en el camino

1. **El panel se quedaba invisible en pestañas en segundo plano.** Su aparición dependía de
   un `requestAnimationFrame`, que no dispara si la pestaña no está componiendo frames. Es
   exactamente el mismo bug que ya había tenido la animación de bienvenida en la Fase 1.
   Ahora el estado de reposo del panel es **visible** y la entrada es una animación CSS:
   si la animación no corre, el panel igual se ve. **No lo vuelvas a atar a un rAF.**
2. **Escape cerraba el lightbox y el panel juntos.** Los dos escuchan `keydown` en
   `document` y el lightbox corre primero, así que la guarda "¿hay lightbox abierto?" ya lo
   veía cerrado. Se resolvió marcando el evento (`e.tomadoPorLightbox`) **y** mirando el
   estado, para que funcione sin importar el orden de registro.
3. En móvil las flores empujaban la tercera fila fuera de pantalla. Se achicaron a 108px
   (96px bajo 360px) y se le dio más alto al cantero.

### Lo que queda por hacer

- Revisión visual real en celular y desktop, en claro y en oscuro.
- Probar con sesión iniciada: subir foto, agregar evento, escribir carta, agregar canción.
  (Sigue sin poder verificarse automáticamente: hace falta la cuenta de Nicole.)
- Decidir cuándo `jardin.html` pasa a ser la home. Hasta entonces el sitio de scroll manda.

## La idea

Reemplazar la página de scroll por un **menú-jardín interactivo estilo videojuego**.

1. **Intro**: varias flores de colores distintos floreciendo, pixeladas, estilo Stardew.
   Similar en espíritu a la animación actual, pero multicolor y en pixel art.
2. **Transición**: al terminar de florecer, la cámara sube.
3. **Jardín aéreo**: plano semi-aéreo con pasto pixelado y las flores repartidas.
   Cada flor es una sección.
4. **Entrar a una sección**: tocás una flor → la cámara hace zoom hacia ella → el contenido
   se abre en un panel de madera Stardew que crece desde el centro de la flor.

La magia buscada, en palabras del usuario: *"que sea muy interactivo y visual, como un menú
de un juego, que sea inmersivo y hermoso"*.

## Las 6 flores

| Flor | Color | Sección | Datos |
|---|---|---|---|
| 1 | Rosa | **Tiempo** | Los **dos** contadores juntos (se conocieron / casados) |
| 2 | Celeste | **Galería** | Tabla `photos` + subir |
| 3 | Amarilla | **Eventos** | Tabla `events` |
| 4 | Violeta | **To-Do** | Tabla `todos` |
| 5 | Blanca | **Cartas** | Tabla `letters` — **UI nueva, no existe todavía** |
| 6 | Verde | **Música** | Tabla `songs` — **UI nueva, no existe todavía** |

Los timers hoy son dos tarjetas separadas: **en la Fase 2 se fusionan en una sola flor**.
Fue una decisión explícita del usuario para dejar el jardín más limpio.

`letters` (notas con fecha entre ellos) y `songs` (canciones con link y por qué) ya tienen
tabla creada y RLS puesto. Falta solo la UI.

## Decisiones de diseño — LEER ANTES DE TOCAR

### 1. El contenido NO va en los pétalos

El usuario originalmente pidió que *"cada flor tenga una sección propia en sus pétalos
repartidos o centro"*. Se le planteó el problema y **aceptó el cambio**:

> Texto y fotos sobre pétalos rotados e inclinados son muy difíciles de leer, sobre todo
> en celular a 360px.

**Solución acordada**: los pétalos son **la navegación** (se iluminan al hover/tap, con ícono
y etiqueta). El contenido se abre en un panel de madera aparte.

Si un agente futuro lee la petición original y decide "cumplirla mejor" poniendo el contenido
en los pétalos, está **deshaciendo una decisión ya tomada**. No lo hagas.

### 2. Jardín de varias flores, NO una flor gigante

Se le ofrecieron tres layouts y eligió **jardín**:

- ✅ **Jardín**: varias flores repartidas, cada una una sección. Escala bien a celular y permite
  agregar secciones después sin rediseñar.
- ❌ Una flor gigante con pétalos = secciones. Más espectacular pero entran menos secciones y
  en celular vertical queda apretado.
- ❌ Híbrido (jardín → la flor crece y sus pétalos son sub-pestañas).

### 3. Pixel art dibujado en código, NO archivos de imagen

Eligió **sprites pixel art en SVG/CSS**: la flor se define como una grilla de píxeles y los
seis colores salen de **una sola definición con paletas intercambiables**.

Por qué importa: pesa casi nada, es nítido de verdad (`image-rendering: pixelated`), se puede
animar el florecer píxel por píxel, y no depende de assets externos que haya que generar.

**No** salgas a buscar PNGs ni generes sprite sheets rasterizados.

### 4. Kawaii original, NO Hello Kitty

El usuario mencionó Hello Kitty como referencia de vibe. Se acordó hacer **motivos kawaii
originales** en ese espíritu: moñitos, caritas de gatito, corazones, estrellitas, fresas.

Hello Kitty es marca registrada de Sanrio. **No copies personajes oficiales.** El vibe
kawaii-pastel se consigue igual y queda coherente con Stardew.

### 5. Mobile: el jardín se reacomoda, no se achica

En pantallas chicas las flores pasan a un grid de 2 columnas. **No** escalar el jardín entero
hacia abajo hasta que las flores sean ilegibles. Breakpoints que ya usa el proyecto:
600px, 480px, 360px, y 481–768px.

### 6. Accesibilidad

- `prefers-reduced-motion`: saltear la intro y las animaciones largas. Ya hay un bloque en
  `coop.css` que neutraliza animaciones, y `intro.js` / `decorativo.js` ya lo respetan.
- La intro debería verse **una vez por sesión**, no en cada recarga (hoy aparece siempre).
- Navegación por teclado y foco visible en las flores.

## Paleta (ya definida en `base.css`)

```css
--wood-dark: #5C4033;    --wood-light: #8B6F47;   --wood-medium: #6F4E37;
--grass-green: #8BC34A;  --dirt-brown: #A67C52;   --sky-blue: #87CEEB;
--soft-pink: #FFB7C5;    --soft-blue: #A8D8EA;    --rose-accent: #FF9AA2;
--bg-paper: #F5E6D3;     --text-dark: #3E2723;    --text-light: #6D4C41;
--shadow-pixel: 4px 4px 0px rgba(0,0,0,0.3);
```

Los seis colores de flores deberían derivar de esta paleta o convivir con ella. Hay modo
oscuro implementado (`body.dark-mode`) que también hay que cubrir.

## Qué NO romper de la Fase 1

El backend, la sesión y los módulos de datos ya funcionan y están verificados. La Fase 2 es
un rework **de presentación**. Reusá:

- `lib/supabase.js`, `lib/auth.js`, `lib/imagen.js` — sin cambios
- `features/todos.js`, `eventos.js`, `galeria.js` — la lógica de datos y realtime sirve;
  lo que cambia es dónde se pinta
- `features/lightbox.js` — funciona bien, con swipe y teclado
- El patrón `alCambiarSesion()` para mostrar/ocultar controles de edición

Construí el jardín **en paralelo** al sitio actual y cambiá recién cuando esté completo,
para no dejar el sitio a medias. Es un regalo en uso, no un entorno de staging.

---

## Cómo levantar el proyecto

```bash
npm install
npm run dev
```

Necesitás un `.env.local` (está gitignoreado) con:

```
VITE_SUPABASE_URL=https://vmgcmrldqzhjerzenbum.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_fKdBeryRFo30dRuHsNWQ3Q_lEXUZ0XI
```

Esa clave es **pública a propósito**: solo habilita lo que permiten las políticas RLS.
La que nunca puede tocar el repo ni un chat es la `service_role`.

Deploy:

```bash
netlify deploy --prod --build
```

## Verificación antes de dar algo por hecho

1. `npm run dev` y recorrer el sitio: consola sin errores.
2. **Sin sesión**: se ve todo, no aparece ningún control de edición, y un `insert` directo
   contra la API devuelve `401`.
3. **Con sesión**: subir foto (verificar que sale comprimida), CRUD de eventos, agregar to-do.
4. **Co-op**: dos pestañas abiertas, un to-do marcado en una aparece en la otra sin recargar.
5. `get_advisors` de Supabase sin hallazgos de seguridad.
6. Responsive real en 360 / 430 / 1280 px.

---

## Notas sobre cómo trabaja el usuario

- Escribe en español rioplatense/colombiano informal. Respondé igual.
- Prefiere que se avance sin pedirle permiso por cada paso, pero **sí** quiere que se le
  pregunten las decisiones de diseño antes de construir.
- Ya rechazó una vez que se le pidan credenciales: no se las pidas. Si algo requiere
  credenciales reales, dejáselo a él y seguí con el resto.
