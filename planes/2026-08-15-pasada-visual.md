# Pasada visual y de contenido sobre docs/ — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar `docs/index.html` publicable y con su sistema tipográfico y de color hecho de tokens, sin tocar el motor de scroll ni la geometría medida del umbral.

**Architecture:** El sitio es **un solo archivo de HTML plano** con el CSS y el JS embebidos. No hay build, no hay framework, no hay test runner. La verificación no es unitaria: es un script de Playwright que saca capturas a cuatro anchos y en dos modos de movimiento, más un script que calcula contrastes WCAG, más `grep` sobre el archivo. Las tareas van de menor a mayor riesgo: primero contenido y `<head>`, después color, y al final la tipografía, que es lo que más puede correr el layout.

**Tech Stack:** HTML/CSS/JS plano · Playwright (solo para verificar, no es dependencia del sitio) · Node 18+ para los scripts · Google Fonts

**Spec:** [`specs/2026-08-15-pasada-visual-design.md`](../specs/2026-08-15-pasada-visual-design.md)

---

## Nota sobre las rutas de este plan

La skill `writing-plans` guarda los planes en `docs/superpowers/plans/`. **Acá no se puede:** en este proyecto `docs/` es el sitio publicado en GitHub Pages, y cualquier cosa que caiga ahí se sube a internet. Por eso el spec vive en `specs/` y este plan en `planes/`.

## Los números de línea se corren

Todos los números de línea de este plan son del archivo **original**, antes de
empezar. En cuanto la tarea 2 borre dos líneas, todo lo que sigue se corre.

**Buscá siempre por contenido, no por número de línea.** Cada paso muestra el
texto exacto de antes y el de después justamente para eso. El número de línea
es una pista para encontrarlo rápido, no una dirección.

## Reglas que ninguna tarea puede romper

Salen de `CLAUDE.md` y del spec:

1. **No se inventa ningún dato de vino.** Cosecha, alcohol, crianza y origen son declaraciones legales. Si falta un dato va `—` explícito.
2. **No se toca `lib/motion.js`** ni el `<script>` del umbral, salvo la tarea 3, que solo agrega selectores a un listener que ya existe.
3. **No se tocan** los `left/top/width/height` ni los `transform-origin` de las ocho capas del umbral: están medidos sobre las fotos.
4. **No se tocan** los tiempos del umbral: corte 0.36, blanco 0.60→0.71, líneas del manifiesto, apagón 0.950→0.998.
5. **Sobre `--et-syrah` nunca va blanco.** Da 2.7:1.
6. Un commit por tarea.

---

## Estructura de archivos

| Archivo | Responsabilidad | Acción |
|---|---|---|
| `docs/index.html` | El sitio entero. Único archivo que cambia de verdad. | Modificar |
| `scripts/capturas.mjs` | Playwright: capturas a 4 anchos × 2 modos de movimiento, y recolección de errores de consola. | Crear |
| `scripts/contraste.mjs` | Cálculo WCAG 2.1 de los pares token/fondo. Sin dependencias. | Crear |
| `.gitignore` | Ignorar `capturas/`. | Modificar |
| `capturas/` | Salida de Playwright. No se versiona. | Crear (ignorado) |

`styles/tokens.css` y el proyecto Next.js **no se tocan**: el spec limita el alcance a `docs/`. La deriva entre los dos caminos ya está anotada como deuda aceptada.

---

## Task 1: Herramientas de verificación y línea de base

Sin esto no hay forma de saber si un cambio rompió algo. La línea de base se saca **antes** de tocar una sola línea del sitio.

**Files:**
- Create: `scripts/capturas.mjs`
- Create: `scripts/contraste.mjs`
- Modify: `.gitignore`

- [ ] **Step 1: Instalar Playwright**

```bash
cd "E:/EnDesarrollo/laberintos-web/laberintos-web"
npm install --save-dev playwright
npx playwright install chromium
```

Esperado: termina sin error y `node_modules/playwright` existe. `node_modules/` ya está en `.gitignore`, así que no ensucia el repo. Playwright entra como `devDependency`: es herramienta de verificación, no dependencia del sitio, que sigue sin build.

- [ ] **Step 2: Ignorar la carpeta de capturas**

Agregar al final de `.gitignore`:

```gitignore
capturas/
```

- [ ] **Step 3: Escribir el script de capturas**

Crear `scripts/capturas.mjs`:

```js
/* Capturas de verificación de docs/index.html.
   Uso: node scripts/capturas.mjs <etiqueta>
   Ej.: node scripts/capturas.mjs base
   Sale con código 1 si hubo cualquier error de consola. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sitio = 'file:///' + path.join(raiz, 'docs', 'index.html').replace(/\\/g, '/');
const etiqueta = process.argv[2] ?? 'actual';
const salida = path.join(raiz, 'capturas', etiqueta);

const ANCHOS = [390, 768, 1280, 1440];
/* El umbral mide 640vh y es sticky: no sirve una captura de página completa.
   Se fotografía en cuatro momentos del recorrido de cámara. */
const MOMENTOS = [0, 0.36, 0.68, 0.92];
const SECCIONES = ['#indice', '#malbec', '#reserva', '#gran-reserva',
                   '.desvio', '#syrah', '.familia', '.pie'];

const errores = [];
const navegador = await chromium.launch();

for (const ancho of ANCHOS) {
  for (const movimiento of ['normal', 'reduce']) {
    const ctx = await navegador.newContext({
      viewport: { width: ancho, height: 900 },
      reducedMotion: movimiento === 'reduce' ? 'reduce' : 'no-preference',
      deviceScaleFactor: 1,
    });
    const pag = await ctx.newPage();
    pag.on('console', m => {
      if (m.type() === 'error') errores.push(`${ancho}px/${movimiento} · consola · ${m.text()}`);
    });
    pag.on('pageerror', e => errores.push(`${ancho}px/${movimiento} · excepción · ${e.message}`));

    await pag.goto(sitio, { waitUntil: 'load' });
    /* el panel de tinta del umbral entra en 1100ms al cargar */
    await pag.waitForTimeout(1600);

    const dir = path.join(salida, `${ancho}-${movimiento}`);
    await fs.mkdir(dir, { recursive: true });

    const caja = await (await pag.$('#umbral')).boundingBox();
    for (const p of MOMENTOS) {
      await pag.evaluate(y => window.scrollTo(0, y), caja.y + p * (caja.height - 900));
      await pag.waitForTimeout(700);
      await pag.screenshot({ path: path.join(dir, `umbral-${String(p).replace('.', '_')}.png`) });
    }

    for (const sel of SECCIONES) {
      await pag.evaluate(s => document.querySelector(s)
        ?.scrollIntoView({ block: 'start', behavior: 'auto' }), sel);
      /* los reveals duran 900ms más 90ms de stagger por elemento */
      await pag.waitForTimeout(1500);
      await pag.screenshot({ path: path.join(dir, `${sel.replace(/[#.]/g, '')}.png`) });
    }

    await ctx.close();
  }
}
await navegador.close();

if (errores.length) {
  console.error(`\n${errores.length} error(es):`);
  for (const e of errores) console.error('  ' + e);
  process.exit(1);
}
console.log(`OK · capturas en capturas/${etiqueta}/ · cero errores de consola`);
```

- [ ] **Step 4: Escribir el script de contraste**

Crear `scripts/contraste.mjs`. Sin dependencias — la fórmula de WCAG 2.1 entra en veinte líneas:

```js
/* Contraste WCAG 2.1 de los pares token/fondo del sitio.
   Uso: node scripts/contraste.mjs
   Sale con código 1 si algún par marcado como texto no llega a 4.5:1. */
const canal = v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const luminancia = hex => {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => canal(parseInt(c.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => {
  const [alta, baja] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (alta + 0.05) / (baja + 0.05);
};

const INK = '#0b0a09';
const PAPEL = '#efe9df';

/* texto:true exige 4.5:1. Los separadores de 1px no son texto y quedan exentos. */
const PARES = [
  ['--texto-2',        '#a9a297', INK,   true,  'párrafo de vino sobre tinta'],
  ['--muted-2',        '#7d766b', INK,   true,  'labels dt y .edicion sobre tinta'],
  ['--muted-claro',    '#6b6459', PAPEL, true,  'labels sobre papel (ya existe)'],
  ['--et-syrah-texto', '#7a3f37', PAPEL, true,  'terracota legible sobre papel'],
  ['--muted',          '#8a8479', INK,   true,  'texto atenuado sobre tinta (ya existe)'],
  ['--linea-2',        '#1c1916', INK,   false, 'separadores de 1px sobre tinta'],
  ['--linea',          '#2a2622', INK,   false, 'separadores de 1px sobre tinta'],
];

let fallo = false;
for (const [nombre, color, fondo, texto, rol] of PARES) {
  const r = contraste(color, fondo);
  const estado = !texto ? 'n/a ' : r >= 4.5 ? 'PASA' : 'FALLA';
  if (texto && r < 4.5) fallo = true;
  console.log(`${estado}  ${r.toFixed(2).padStart(6)}:1  ${nombre.padEnd(18)} ${color}  ${rol}`);
}
process.exit(fallo ? 1 : 0);
```

- [ ] **Step 5: Correr el contraste y confirmar los dos fallos previstos**

```bash
node scripts/contraste.mjs
```

Esperado: **sale con código 1.** `--texto-2` (~7.8:1), `--muted-claro` (~4.8:1), `--et-syrah-texto` (~6.7:1) y `--muted` (~5.3:1) pasan; **`--muted-2` con `#7d766b` da ~4.4:1 y FALLA.**

Si algún número se aparta más de 0.1 de estos, **el script manda, no el plan**: anotar el valor real y seguir. Los de este plan están calculados a mano y pueden tener deriva en el último decimal.

- [ ] **Step 6: Sacar la línea de base**

```bash
node scripts/capturas.mjs base
```

Esperado: `OK · capturas en capturas/base/ · cero errores de consola`.

Si sale con código 1, **parar acá y avisar**: hay un error de consola que ya existía antes de esta pasada y hay que entenderlo antes de cambiar nada.

- [ ] **Step 7: Mirar las capturas de base**

Abrir `capturas/base/1280-normal/` y confirmar a ojo que el sitio se ve como debe: el umbral con el título sobre el panel de tinta, el manifiesto blanco, las cuatro escenas de vino, el bloque claro del Syrah, el pie. Esta carpeta es la referencia contra la que se compara todo lo que sigue.

- [ ] **Step 8: Commit**

```bash
git add scripts/ .gitignore
git commit -m "Herramientas de verificacion: capturas y contraste"
```

---

## Task 2: Arreglar el `<head>`

Tres cosas rotas que no cambian un pixel pero bloquean publicar.

**Files:**
- Modify: `docs/index.html:3`, `docs/index.html:7`, `docs/index.html:13`, `docs/index.html:20`

- [ ] **Step 1: Borrar el `<title>` duplicado**

Hay dos. El de la línea 3 es el bueno. Borrar **la línea 20 entera**:

```html
<title>Laberintos — umbral</title>
```

El de la línea 3 queda intacto:

```html
<title>Laberintos — Vinos de Mendoza y San Juan</title>
```

Razón: cuando hay dos `<title>`, el navegador y los buscadores toman el último. Hoy el sitio se llama "Laberintos — umbral" en la pestaña y en Google.

- [ ] **Step 2: Sacar el canonical falso**

Borrar la línea 7 entera:

```html
<link rel="canonical" href="https://REEMPLAZAR.github.io/laberintos/">
```

Confirmado con el cliente el 2026-08-15: todavía no hay dominio. Publicar `REEMPLAZAR.github.io` es peor que no tener canonical.

- [ ] **Step 3: Dejar anotado qué falta el día que haya dominio**

Reemplazar la línea 13:

```html
<meta property="og:image" content="assets/og.jpg">
```

por:

```html
<!-- PENDIENTE (dominio): og:image tiene que ser URL ABSOLUTA o al compartir el
     link no aparece la imagen. El dia que haya dominio, poner acá la URL
     completa, sumar <meta property="og:url"> y volver a poner el
     <link rel="canonical"> que se saco por no tener dominio. -->
<meta property="og:image" content="assets/og.jpg">
```

- [ ] **Step 4: Verificar que quedó un solo title y ningún REEMPLAZAR**

```bash
grep -c "<title>" docs/index.html
grep -c "REEMPLAZAR" docs/index.html
```

Esperado: `1` y `0`.

- [ ] **Step 5: Commit**

```bash
git add docs/index.html
git commit -m "Head: un solo title, sin canonical falso, og:image anotado"
```

---

## Task 3: Hacer que el nav navegue

**Files:**
- Modify: `docs/index.html:374-375` (markup), `docs/index.html:621` (el selector del listener)

- [ ] **Step 1: Convertir los `<span>` en links reales**

Reemplazar las líneas 374-375:

```html
<header class="nav"><b>LABERINTOS</b>
  <nav><span>Vinos</span><span>Origen</span><span>Encontralo</span></nav></header>
```

por:

```html
<header class="nav"><b>LABERINTOS</b>
  <!-- "Origen" se saco: esa seccion no existe en el sitio. Cuando se construya,
       vuelve acá como <a href="#origen">Origen</a>. -->
  <nav><a href="#indice">Vinos</a><a href="#pie">Encontralo</a></nav></header>

```

- [ ] **Step 2: Darle un `id` a las dos secciones destino**

`#indice` y `#pie` todavía no existen como anclas. En la línea 422:

```html
<section class="indice" aria-label="Los cuatro vinos">
```

pasa a:

```html
<section class="indice" id="indice" aria-label="Los cuatro vinos">
```

Y en la línea 499:

```html
<footer class="pie" aria-label="Contacto">
```

pasa a:

```html
<footer class="pie" id="pie" aria-label="Contacto">
```

- [ ] **Step 3: Sumar el nav al scroll suave que ya existe**

El sitio ya tiene el listener con el chequeo de `prefers-reduced-motion` resuelto. **No se escribe uno nuevo**: se le agrega el selector del nav. En la línea 621:

```js
document.querySelectorAll('.cuatro .ir').forEach(a=>{
```

pasa a:

```js
document.querySelectorAll('.cuatro .ir, .nav nav a').forEach(a=>{
```

- [ ] **Step 4: Verificar**

```bash
node scripts/capturas.mjs nav
```

Esperado: `OK · cero errores de consola`. Comparar `capturas/nav/1280-normal/umbral-0.png` contra `capturas/base/1280-normal/umbral-0.png`: el nav tiene que verse **idéntico**. Es `mix-blend-mode: difference` sobre `<b>` y `<a>` igual que sobre `<span>`; si cambió de color o de posición, algo salió mal.

- [ ] **Step 5: Commit**

```bash
git add docs/index.html
git commit -m "Nav navegable: links reales, sin Origen, con el scroll suave que ya existia"
```

---

## Task 4: El pie — Instagram real y la tienda como lugar reservado

**Files:**
- Modify: `docs/index.html:520-526`

- [ ] **Step 1: Reemplazar la columna "Seguinos"**

Reemplazar las líneas 520-526:

```html
      <div data-reveal>
        <h3>Seguinos</h3>
        <ul>
          <li><a href="#">Instagram</a></li>
          <li><a href="#">Tienda online</a></li>
        </ul>
      </div>
```

por:

```html
      <div data-reveal>
        <h3>Seguinos</h3>
        <ul>
          <li><a href="https://www.instagram.com/laberintosvinos" target="_blank" rel="noopener">Instagram</a></li>
          <!-- Tienda actual en TiendaNube. Se va a rehacer como theme de PepperLabs,
               igual que Inyesoft y Materiales Matheu; cuando eso pase, cambia la URL
               de acá y nada mas. -->
          <li><a href="https://laberintosvinos.mitiendanube.com/" target="_blank" rel="noopener">Tienda online</a></li>
        </ul>
      </div>
```

- [ ] **Step 2: Nada de CSS**

Los dos ítems son links normales y ya heredan `.pie__cols a`, que les da el subrayado en hover. **No se agrega ninguna regla.**

- [ ] **Step 3: Verificar que no quedó ningún link vacío**

```bash
grep -n 'href="#"' docs/index.html
```

Esperado: **sin resultados** (código de salida 1).

- [ ] **Step 4: Capturas**

```bash
node scripts/capturas.mjs pie
```

Esperado: cero errores. Mirar `capturas/pie/1280-normal/pie.png` y `capturas/pie/390-normal/pie.png`: la columna "Seguinos" tiene dos ítems y los dos se subrayan al pasar el mouse.

- [ ] **Step 5: Commit**

```bash
git add docs/index.html
git commit -m "Pie: Instagram y tienda apuntan a las URLs reales"
```

---

## Task 5: Carga de imágenes y borrar el CSS muerto

**Files:**
- Modify: `docs/index.html:436`, `:452`, `:461`, `:480` (escenas)
- Modify: `docs/index.html:325-329` (CSS muerto)

- [ ] **Step 1: `loading="lazy"` en las cuatro escenas**

Las cuatro imágenes de escena suman ~1,5 MB y hoy compiten con el umbral, que es lo primero que se ve. Las del índice ya tienen `lazy`.

Línea 436:
```html
  <div class="vino__escena"><img src="assets/escena-62e6ed3e.webp" alt=""></div>
```
pasa a:
```html
  <div class="vino__escena"><img src="assets/escena-62e6ed3e.webp" alt="" loading="lazy"></div>
```

Línea 452:
```html
  <div class="vino__escena"><img src="assets/escena-00df0e6c.webp" alt=""></div>
```
pasa a:
```html
  <div class="vino__escena"><img src="assets/escena-00df0e6c.webp" alt="" loading="lazy"></div>
```

Línea 461:
```html
  <div class="vino__escena"><img src="assets/escena-5c39331c.webp" alt=""></div>
```
pasa a:
```html
  <div class="vino__escena"><img src="assets/escena-5c39331c.webp" alt="" loading="lazy"></div>
```

Línea 480:
```html
  <div class="vino__escena"><img src="assets/escena-c10573db.webp" alt=""></div>
```
pasa a:
```html
  <div class="vino__escena"><img src="assets/escena-c10573db.webp" alt="" loading="lazy"></div>
```

**No tocar** las tres del `<link rel="preload">` del umbral (líneas 369-371): esas tienen que cargar primero, es a propósito.

- [ ] **Step 2: Borrar el CSS de `.desvio__foto`**

Confirmado con el cliente: no hay foto y no va. Borrar las líneas 325-329 enteras:

```css
.desvio__foto{margin-top:clamp(40px,6vh,70px);line-height:0;position:relative}
/* el borde superior de la foto cortaba seco contra el papel: se funde */
.desvio__foto::before{content:"";position:absolute;inset:0 0 auto 0;height:26%;z-index:1;
 background:linear-gradient(180deg, var(--papel) 0%, transparent 100%)}
.desvio__foto img{width:100%;height:auto;display:block}
```

- [ ] **Step 3: Verificar**

```bash
grep -c "desvio__foto" docs/index.html
grep -c 'class="vino__escena"><img[^>]*loading="lazy"' docs/index.html
```

Esperado: `0` y `4`.

- [ ] **Step 4: Capturas**

```bash
node scripts/capturas.mjs carga
```

Esperado: cero errores. Comparar `capturas/carga/1280-normal/malbec.png` contra la base: las escenas tienen que verse **igual**. Si alguna sale en negro, el `lazy` disparó tarde y hay que subir el `waitForTimeout` del script, no sacar el `lazy`.

- [ ] **Step 5: Commit**

```bash
git add docs/index.html
git commit -m "Escenas con lazy loading y CSS muerto de .desvio__foto borrado"
```

---

## Task 6: El copy del Syrah

**Files:**
- Modify: `docs/index.html:485`

- [ ] **Step 1: Reescribir el párrafo**

Hoy la línea 485 dice:

```html
    <p data-reveal>Tinto de San Juan. Cosecha 2023.</p>
```

pasa a:

```html
    <p data-reveal>El único que cruza la provincia. Deja Mendoza y el Malbec para
      buscar otro suelo y otra uva: un Syrah de San Juan, cosecha 2023.</p>
```

**Regla dura:** no se inventa nada. El texto se apoya solo en lo confirmado —provincia, variedad, cosecha— y en el argumento editorial que ya está escrito arriba, en el desvío ("Es el único camino que sale del mapa"). **No se menciona crianza, ni barrica, ni notas de cata, ni alcohol**: de este vino no hay ficha técnica. El aviso de "Ficha técnica pendiente" que ya está en la línea 486 **se queda tal cual**.

- [ ] **Step 2: Confirmar que no se coló ningún dato inventado**

```bash
grep -n -iE "barrica|roble|crianza|vainilla|taninos|% *vol|msnm" docs/index.html | grep -i syrah
```

Esperado: **sin resultados**. Si aparece algo, se inventó un dato y hay que sacarlo.

- [ ] **Step 3: Capturas**

```bash
node scripts/capturas.mjs syrah
```

Mirar `capturas/syrah/390-normal/syrah.png`: el párrafo son dos líneas más largo que antes y el bloque claro en mobile es el más apretado del sitio. Confirmar que **no empuja la tabla de datos ni el aviso de pendiente fuera de la pantalla**.

- [ ] **Step 4: Commit**

```bash
git add docs/index.html
git commit -m "Copy del Syrah: apoyado solo en datos confirmados"
```

---

## Task 7: Los tokens de color

Acá aparecen los dos arreglos de contraste. La regla del spec —"si un token de texto no llega a 4.5:1 se ajusta y se anota"— manda sobre la fidelidad al valor actual.

**Files:**
- Modify: `docs/index.html:44-47` (bloque `:root`)
- Modify: `scripts/contraste.mjs`

- [ ] **Step 1: Corregir `--muted-2`**

`#7d766b` da ~4.4:1 sobre tinta: no pasa. Se aclara a `#837c70`, que da ~4.8:1.

En `scripts/contraste.mjs`, cambiar la línea de `--muted-2`:

```js
  ['--muted-2',        '#7d766b', INK,   true,  'labels dt y .edicion sobre tinta'],
```

por:

```js
  ['--muted-2',        '#837c70', INK,   true,  'labels dt y .edicion sobre tinta'],
```

- [ ] **Step 2: Correr el contraste y confirmar que ahora pasa todo**

```bash
node scripts/contraste.mjs
```

Esperado: **código de salida 0**, todas las filas de texto en `PASA`. `--muted-2` con `#837c70` alrededor de 4.8:1.

Si `#837c70` todavía no llegara a 4.5, subir de a un escalón (`#888176`, `#8d867b`) y volver a correr hasta que pase. Anotar el valor final.

- [ ] **Step 3: Agregar los tokens al `:root`**

Reemplazar las líneas 44-47:

```css
  --linea:      #2a2622;
  --linea-clara:#cfc6b6;
  --muted:      #8a8479;
  --muted-claro:#6b6459;
```

por:

```css
  --linea:      #2a2622;
  --linea-clara:#cfc6b6;
  --muted:      #8a8479;   /* sobre ink · 5.33:1 */
  --muted-claro:#6b6459;   /* sobre papel · 4.84:1 */

  /* --- tokens de esta pasada. Contrastes calculados con
         scripts/contraste.mjs, no estimados. --- */
  --texto-2:        #a9a297;  /* parrafo de vino sobre ink · 7.82:1 */
  --muted-2:        #837c70;  /* labels dt y .edicion sobre ink · 4.79:1
                                 Venia de #7d766b, que daba 4.40:1 y no pasaba. */
  --linea-2:        #1c1916;  /* separadores de 1px. No es texto: exento del 4.5:1 */
  --et-syrah-texto: #7a3f37;  /* terracota legible sobre papel · 6.71:1 */

  /* #8a8377 se descarto: daba 3.11:1 sobre papel. Para llegar a 4.5 habia que
     oscurecerlo hasta --muted-claro, asi que no era un token nuevo, sobraba.
     #6f685e tambien se descarto: 3.60:1 sobre ink. Va --muted-2. */
```

**Ajustar los números** a lo que haya impreso el script en el Step 2 si difieren.

- [ ] **Step 4: Reemplazar los colores sueltos**

Once reemplazos en el CSS. Ninguno cambia una medida, solo el color:

| Línea | Antes | Después |
|---|---|---|
| 206 | `color:#a9a297` | `color:var(--texto-2)` |
| 209 | `border-top:1px solid #2a2622` | `border-top:1px solid var(--linea)` |
| 210 | `color:#7d766b` | `color:var(--muted-2)` |
| 228 | `border-top:1px solid #1c1916` | `border-top:1px solid var(--linea-2)` |
| 232 | `color:#7d766b` | `color:var(--muted-2)` |
| 233 | `color:#6f685e` | `color:var(--muted-2)` |
| 234 | `border-top:1px solid #2a2622` | `border-top:1px solid var(--linea)` |
| 246 | `--acento:#7a3f37` | `--acento:var(--et-syrah-texto)` |
| 261 | `color:#8a8377` | `color:var(--muted-claro)` |
| 262 | `color:#8a8377` | `color:var(--muted-claro)` |
| 288 | `border-top:1px solid #23211f` | `border-top:1px solid var(--linea-2)` |
| 302 | `border-top:1px solid #23211f` | `border-top:1px solid var(--linea-2)` |

Las líneas 261 y 262 son las que **cambian visiblemente**: los labels del bloque claro del Syrah se oscurecen de `#8a8377` (3.11:1) a `#6b6459` (4.84:1). Es el arreglo de accesibilidad, no un capricho.

- [ ] **Step 5: Verificar que no quedó ningún hexadecimal fuera de `:root`**

Un `sed` por rango de líneas no sirve: las líneas ya se corrieron. La búsqueda va por contenido, descartando las líneas que **definen** un token (las que tienen `--algo:`):

```bash
grep -nE '#[0-9a-fA-F]{3,6}' docs/index.html | grep -vE ':\s*--[a-z]'
```

Esperado: **exactamente cinco líneas**, todas legítimas y documentadas en el spec §5:

1. `<meta name="theme-color" content="#0b0a09">` — va en el `<head>`, no puede ser una variable CSS.
2. `.camara{...background:#000}` — el negro absoluto detrás de las capas. No es el negro de marca: es la ausencia de imagen.
3. `-webkit-mask-image:...#000 9%, #000 91%...` — canal de máscara, no color.
4. `mask-image:...#000 9%, #000 91%...` — la misma máscara, la línea siguiente.
5. `.pie__marca{...color:#ffffff}` — blanco puro al 5,5% de opacidad; lo que importa ahí es la opacidad.

Si aparece una sexta, es un color que se escapó del reemplazo.

- [ ] **Step 6: Capturas**

```bash
node scripts/capturas.mjs color
```

Esperado: cero errores. Comparar contra la base:
- `syrah.png` — los labels de la tabla se ven **más oscuros**. Es lo buscado.
- `malbec.png`, `reserva.png`, `gran-reserva.png` — los labels apenas más claros (`#7d766b` → `#837c70`).
- Todo lo demás, **idéntico**.

- [ ] **Step 7: Commit**

```bash
git add docs/index.html scripts/contraste.mjs
git commit -m "Color en tokens, con dos arreglos de contraste

--muted-2 pasa de #7d766b (4.40:1) a #837c70 (4.79:1). #8a8377 se descarta:
daba 3.11:1 sobre papel y para llegar a 4.5 quedaba igual que --muted-claro.
#6f685e tambien se descarta, 3.60:1. Los labels del bloque claro del Syrah
se oscurecen: es un arreglo de accesibilidad, no un cambio estetico."
```

---

## Task 8: La escala tipográfica

Siete `clamp()` inventados sección por sección pasan a cuatro escalones nombrados. **Los valores son los que ya están en pantalla**, salvo dos topes que bajan.

**Files:**
- Modify: `docs/index.html:55-57` (tokens)
- Modify: `docs/index.html:138`, `:149`, `:203`, `:280`, `:316`, `:322`, `:332`

- [ ] **Step 1: Redefinir la escala en `:root`**

Reemplazar las líneas 55-57:

```css
  --h1: clamp(38px, 7vw, 92px);
  --h2: clamp(28px, 4.2vw, 56px);
  --h3: clamp(20px, 2.4vw, 30px);
```

por:

```css
  /* Cuatro escalones, uno por voz. Los valores son los que ya estaban en
     pantalla: esto no cambia tamanios, deja de repetirlos siete veces. */
  --h1: clamp(38px, 6vw, 84px);    /* el cierre del pie */
  --h2: clamp(34px, 5.4vw, 72px);  /* el titulo del umbral */
  --h3: clamp(34px, 4.2vw, 58px);  /* los cuatro vinos */
  --h4: clamp(30px, 3.6vw, 50px);  /* indice, desvio, familia, manifiesto */
```

- [ ] **Step 2: Aplicar los siete**

Línea 138:
```css
.titulo h1{font-size:clamp(34px,5.4vw,72px);letter-spacing:-.01em;max-width:13ch}
```
pasa a:
```css
.titulo h1{font-size:var(--h2);letter-spacing:-.01em;max-width:13ch}
```

Línea 149:
```css
.manifiesto h2{font-size:var(--h2);max-width:20ch}
```
pasa a:
```css
.manifiesto h2{font-size:var(--h4);max-width:20ch}
```

Línea 203:
```css
.vino__texto h2{font-size:clamp(34px,4.2vw,58px);margin-top:12px;max-width:11ch}
```
pasa a:
```css
.vino__texto h2{font-size:var(--h3);margin-top:12px;max-width:11ch}
```

Línea 280:
```css
.pie h2{font-size:clamp(38px,6vw,84px);letter-spacing:-.03em}
```
pasa a:
```css
.pie h2{font-size:var(--h1);letter-spacing:-.03em}
```

Línea 316:
```css
.familia h2{font-size:clamp(30px,3.8vw,54px)}
```
pasa a:
```css
.familia h2{font-size:var(--h4)}
```

Línea 322:
```css
.desvio h2{font-size:clamp(30px,3.6vw,50px);margin-top:14px}
```
pasa a:
```css
.desvio h2{font-size:var(--h4);margin-top:14px}
```

Línea 332:
```css
.indice h2{font-size:clamp(30px,3.6vw,50px);max-width:16ch}
```
pasa a:
```css
.indice h2{font-size:var(--h4);max-width:16ch}
```

Los `letter-spacing` y los `max-width` **se conservan**: la escala unifica el tamaño, no el tratamiento.

- [ ] **Step 3: Verificar que no quedó ningún `clamp()` de título suelto**

```bash
grep -nE 'font-size:clamp\((3[0-9]|4[0-9])px' docs/index.html
```

Esperado: **sin resultados**. Los `clamp()` que quedan son de cuerpo y de datos (`16px`, `15px`, `14px`), que no son parte de la escala de títulos.

- [ ] **Step 4: Capturas**

```bash
node scripts/capturas.mjs escala
```

Comparar contra la base. Los **dos únicos** cambios permitidos:
- `capturas/escala/1440-normal/umbral-0_68.png` — el manifiesto baja su tope de 56 a 50 px. Solo se nota a 1280 y 1440.
- `capturas/escala/1440-normal/familia.png` — el título baja de 54 a 50 px.

**Todo lo demás tiene que verse idéntico.** Si `.pie h2`, `.titulo h1`, `.vino__texto h2`, `.indice h2` o `.desvio h2` cambiaron de tamaño, un valor se copió mal.

- [ ] **Step 5: Commit**

```bash
git add docs/index.html
git commit -m "Escala tipografica: siete clamp sueltos pasan a cuatro escalones"
```

---

## Task 9: IBM Plex Mono

La tarea de mayor riesgo, y por eso va última: cambia la métrica de todos los eyebrows, labels y tablas del sitio a la vez.

**Files:**
- Modify: `docs/index.html:19` (carga de fuentes)
- Modify: `docs/index.html:52` (token `--dato`)

- [ ] **Step 1: Sumar la fuente al `<link>` que ya existe**

Reemplazar la línea 19:

```html
<link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Barlow+Condensed:wght@300;400;500&display=swap" rel="stylesheet">
```

por:

```html
<link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Barlow+Condensed:wght@300;400;500&family=IBM+Plex+Mono:wght@400&display=swap" rel="stylesheet">
```

Va en el **mismo `<link>`**, no en uno nuevo: los `preconnect` de las líneas 17-18 ya están y así no se abre una conexión más. Solo el peso 400, que es el único que usa el rol.

- [ ] **Step 2: Cambiar el token**

Reemplazar la línea 52:

```css
  --dato:    ui-monospace, SFMono-Regular, Menlo, monospace;
```

por:

```css
  /* IBM Plex Mono: la mono del sistema se veia distinta en cada equipo y no
     compartia nada con la marca. Ademas alinea en columna los numeros de las
     fichas. El fallback queda por si la fuente no carga. */
  --dato:    "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
```

**No se toca `--display`** (Special Elite, que viene de la etiqueta) ni `--texto` (Barlow Condensed).

- [ ] **Step 3: Capturas**

```bash
node scripts/capturas.mjs mono
```

Esperado: cero errores.

- [ ] **Step 4: El chequeo del umbral, que es lo frágil**

Este es el motivo por el que esta tarea va última. Abrir `capturas/mono/1280-normal/umbral-0.png` y `capturas/mono/1440-normal/umbral-0.png`.

El CSS del `.panel` advierte que **la parte sólida del degradado tiene que cubrir todo el ancho del título**, y que con el degradado arrancando antes el borde derecho del titular caía a 2:1 contra la piedra clara.

`.titulo h1` no cambia de familia —es `--display`— pero **el "Entrar →" de abajo sí**: es `.etiqueta`, o sea `--dato`. Confirmar que:
- El bloque del título entero sigue dentro de la parte sólida del panel.
- El "Entrar →" no se estiró hasta salirse del degradado.

Si se sale, **no se mueve el panel**: se acorta el tracking del `.entrar` o se achica un punto. La geometría del panel está medida y no se toca.

- [ ] **Step 5: Confirmar que los números de las fichas quedaron alineados**

Abrir `capturas/mono/1280-normal/gran-reserva.png`. Es el vino con más filas. Los valores de la columna derecha —2022, 1200 msnm, 24 meses, 14 años, 14,2%— tienen que empezar todos a la misma altura de x. Eso es lo que la mono del sistema no garantizaba entre equipos.

- [ ] **Step 6: Mirar los cuatro anchos y los dos modos**

Recorrer `capturas/mono/` entera. La mono nueva es **más ancha** que muchas monos de sistema: los lugares donde puede desbordar son el nav (`.nav nav`, dos ítems ahora), los `dt` de las tablas, y `.pie__legal`, que a 390px ya viene apretado.

Si algo desborda, se corrige **con el `font-size` o el `letter-spacing` de ese elemento**, no cambiando la fuente.

- [ ] **Step 7: Commit**

```bash
git add docs/index.html
git commit -m "IBM Plex Mono como --dato

La mono del sistema se veia distinta en cada equipo. Ademas ahora los numeros
de las fichas alinean en columna."
```

---

## Task 10: Verificación final

**Files:** ninguno — solo se verifica.

- [ ] **Step 1: Capturas finales**

```bash
node scripts/capturas.mjs final
```

Esperado: `OK · capturas en capturas/final/ · cero errores de consola`, código de salida 0.

- [ ] **Step 2: Contraste**

```bash
node scripts/contraste.mjs
```

Esperado: código de salida 0, todas las filas de texto en `PASA`.

- [ ] **Step 3: Movimiento reducido**

Recorrer las carpetas `*-reduce` de `capturas/final/`. Con `prefers-reduced-motion: reduce`, la regla de la línea 366-368 apaga el umbral entero. Confirmar en los cuatro anchos:
- Todo el contenido **visible** — ningún bloque en `opacity: 0`, que es el modo en que los `[data-reveal]` fallan.
- Nada en movimiento.
- El umbral colapsado a `100vh` con la toma A quieta y el título visible.

- [ ] **Step 4: Los cuatro grep de cierre**

```bash
grep -c "<title>" docs/index.html          # 1
grep -c "REEMPLAZAR" docs/index.html       # 0
grep -c 'href="#"' docs/index.html         # 0
grep -c "desvio__foto" docs/index.html     # 0
```

- [ ] **Step 5: Hexadecimales fuera de `:root`**

```bash
grep -cE '#[0-9a-fA-F]{3,6}' docs/index.html
grep -nE '#[0-9a-fA-F]{3,6}' docs/index.html | grep -vE ':\s*--[a-z]' | wc -l
```

Esperado del segundo: `5`, las cinco líneas legítimas enumeradas en la tarea 7, paso 5. Ninguna más.

- [ ] **Step 6: Comparar final contra base, sección por sección**

Poner `capturas/base/1280-normal/` al lado de `capturas/final/1280-normal/`. La lista **completa** de lo que puede haber cambiado:

| Dónde | Cambio esperado |
|---|---|
| nav | Dos ítems en vez de tres. Sin "Origen". |
| umbral | El "Entrar →" en IBM Plex Mono. |
| manifiesto | Tope de 56 a 50 px. |
| índice | Eyebrow y los `span` de las botellas en IBM Plex Mono. |
| los cuatro vinos | Labels en mono y apenas más claros. Números alineados en columna. |
| Syrah | Párrafo nuevo. Labels **más oscuros** (arreglo de contraste). |
| familia | Título de 54 a 50 px. |
| pie | "Seguinos" con Instagram y Tienda online apuntando a URLs reales. Legales en mono. |

**Cualquier otra diferencia es un error y hay que rastrearla**, no aceptarla.

- [ ] **Step 7: Actualizar el estado del spec**

En `specs/2026-08-15-pasada-visual-design.md`, cambiar la cabecera `Estado:` a implementado, con la fecha y el hash del último commit. Anotar los valores de contraste reales que imprimió el script, si difieren de los del spec.

- [ ] **Step 8: Commit final**

```bash
git add specs/
git commit -m "Spec: pasada visual implementada y verificada"
```

---

## Lo que queda abierto al terminar

Nada de esto bloquea, pero conviene no perderlo:

1. **Las cosechas.** Etiquetas dicen 2022/2019/2019, fichas dicen 2024/2023/2022. El sitio publica las de las fichas y esta pasada no las tocó. **Es el único riesgo legal abierto.**
2. **La ficha técnica del Syrah.** Sigue el aviso de "pendiente".
3. **El dominio.** Cuando exista: canonical, `og:url` y `og:image` absoluto. El HTML tiene el comentario con la lista.
4. **Las sombras de las botellas del índice.** `CLAUDE.md` dice "sin sombras" y el índice tiene `drop-shadow`. Requiere una decisión de diseño que no se tomó.
5. **Tres bloques oscuros seguidos** (Malbec, Reserva, Gran Reserva), que `CLAUDE.md` también prohíbe.
6. **La sección Origen** no existe. Se sacó del nav; construirla es otra pasada.
7. **`docs/` y el proyecto Next.js** siguen separados, y esta pasada los separó un poco más. `styles/tokens.css` no recibió ninguno de los tokens nuevos.
