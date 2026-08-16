/* Capturas de verificación de docs/index.html.
   Uso: node scripts/capturas.mjs <etiqueta>
   Ej.: node scripts/capturas.mjs base

   Las esperas son por condición real (panel entrado, nada animando, imágenes cargadas)
   y no por reloj: una espera fija se queda corta en silencio cuando se agrega un
   [data-reveal] más y saca la captura a mitad de animación, que después se lee como
   bug de diseño.

   Códigos de salida: 0 todo bien · 1 el sitio tiró errores de consola · 2 falló el arnés.
   El 1 es siempre del sitio; el 2 es siempre nuestro. */
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/* pathToFileURL escapa espacios y # de la ruta, que la concatenación a mano rompía */
const sitio = pathToFileURL(path.join(raiz, 'docs', 'index.html')).href;
const etiqueta = process.argv[2] ?? 'actual';
const salida = path.join(raiz, 'capturas', etiqueta);

const ANCHOS = [390, 768, 1280, 1440];
const ALTO = 900;
/* El umbral es sticky y mide varias pantallas: no sirve una captura de página
   completa. Se fotografía en cuatro momentos del recorrido de cámara.

   OJO con umbral-0_36.png: cae dentro del fundido entre las dos tomas, o sea
   dos imágenes superpuestas a media opacidad. La composición de capas escaladas
   no es reproducible bit a bit entre corridas, así que ESA captura NO sirve como
   control por hash: se compara mirándola. Las otras tres sí son deterministas.
   Se sigue sacando igual porque el corte es el momento más frágil del umbral y
   hay que poder verlo. */
/* El quinto momento, 0.99, se agrego tarde y por una razon concreta: con solo
   cuatro, el ultimo caia en 0.92 y NADA fotografiaba el cierre del umbral. Ahi
   habia una pantalla negra entera —una capa de tinta que sobraba— y el arnes no
   la vio nunca; la encontro una persona mirando el sitio. El cierre es la union
   con la seccion siguiente y necesita guardia propia. */
const MOMENTOS = [0, 0.36, 0.68, 0.92, 0.99];
/* .indice va por clase, como .desvio/.familia/.pie: la sección es
   <section class="indice">, nunca tuvo id. */
const SECCIONES = ['.indice', '#malbec', '#reserva', '#gran-reserva',
                   '.desvio', '#syrah', '.familia', '.pie'];

/* Secciones más altas que el viewport, que además se fotografían enteras.
   .indice a 390px pasa a dos columnas y las dos últimas botellas caen debajo del
   fold: una de ellas lleva "EDICIÓN LIMITADA · 2022", el sublabel más largo del
   sitio. Sin esto, el ancho más apretado se verificaría sin ver justo la etiqueta
   con más riesgo de desbordar. */
const COMPLETAS = ['.indice'];

const TIEMPO_MAX = 5000;   /* techo de cada espera por condición */
const RESPALDO = 400;      /* si la condición no se cumple, respaldo corto y se sigue */

const errores = [];   /* errores del sitio: mandan el código 1 */
let fallaArnes = null; /* falla nuestra: manda el código 2 */

/* Espera una condición real de la página. Si se agota el tiempo lo avisa y sigue con un
   respaldo corto en vez de explotar: un timeout del arnés no es un error del sitio y no
   debe cambiar el código de salida. */
async function esperar(pag, fn, que, donde, arg) {
  try {
    await pag.waitForFunction(fn, arg, { timeout: TIEMPO_MAX });
  } catch (e) {
    /* solo el timeout es tolerable. Si el predicado se rompió (un TypeError adentro,
       por ejemplo) hay que enterarse: se propaga y termina en código 2, en vez de
       mentir diciendo que la condición "no se cumplió a tiempo". */
    if (e?.name !== 'TimeoutError') throw e;
    console.warn(`AVISO · ${donde} · no se cumplió "${que}" en ${TIEMPO_MAX}ms; sigo con respaldo de ${RESPALDO}ms`);
    await pag.waitForTimeout(RESPALDO);
  }
}

/* el panel de tinta del umbral entra al cargar llevando --pn de 0 a 1.
   Si no hay .panel (o no se anima) la condición da true igual, para no colgarse. */
const PANEL_ENTRADO = () => {
  const p = document.querySelector('.panel');
  return !p || getComputedStyle(p).getPropertyValue('--pn').trim() === '1.000';
};

/* en Chromium getAnimations() incluye las transiciones CSS, que es lo que usan los
   [data-reveal]: cubre los 900ms de duración más el stagger, sea cual sea la cantidad */
const NADA_ANIMANDO = () => document.getAnimations().every(a => a.playState !== 'running');

/* importa por el loading="lazy": una img sin cargar sale como hueco en la captura */
const IMAGENES_VISIBLES_LISTAS = () => [...document.querySelectorAll('img')].every(img => {
  const r = img.getBoundingClientRect();
  const visible = r.bottom > 0 && r.top < window.innerHeight &&
                  r.right > 0 && r.left < window.innerWidth;
  return !visible || (img.complete && img.naturalWidth > 0);
});

/* Espera a que la cámara del umbral haya leído el scroll nuevo. Antes eran dos
   frames fijos, y no alcanzaba: en el fundido entre tomas —donde --o cambia
   rápido— un frame de atraso se ve, y umbral-0_36.png salía distinto entre dos
   corridas del MISMO código. Eso arruina la captura como control de regresión.
   Ahora se espera a que --o se repita en dos frames seguidos. */
const asentar = pag => pag.evaluate(() => new Promise(r => {
  const toma = document.getElementById('tomaA');
  if (!toma) return requestAnimationFrame(() => requestAnimationFrame(r));
  const leer = () => getComputedStyle(toma).opacity;
  let previo = leer(), iguales = 0, vueltas = 0;
  const paso = () => {
    const ahora = leer();
    iguales = ahora === previo ? iguales + 1 : 0;
    previo = ahora;
    /* el tope de 30 frames es un seguro: media cámara lenta no debe colgar la corrida */
    if (iguales >= 2 || ++vueltas > 30) return r();
    requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}));

let navegador;
try {
  navegador = await chromium.launch();
} catch (e) {
  console.error(`ARNÉS · no se pudo lanzar Chromium: ${e.message}`);
  process.exit(2);
}

try {
  for (const ancho of ANCHOS) {
    for (const movimiento of ['normal', 'reduce']) {
      const donde = `${ancho}px/${movimiento}`;
      const ctx = await navegador.newContext({
        viewport: { width: ancho, height: ALTO },
        reducedMotion: movimiento === 'reduce' ? 'reduce' : 'no-preference',
        deviceScaleFactor: 1,
      });
      const pag = await ctx.newPage();
      pag.on('console', m => {
        if (m.type() === 'error') errores.push(`${donde} · consola · ${m.text()}`);
      });
      pag.on('pageerror', e => errores.push(`${donde} · excepción · ${e.message}`));

      await pag.goto(sitio, { waitUntil: 'load' });
      await esperar(pag, PANEL_ENTRADO, 'panel del umbral entrado (--pn = 1.000)', donde);

      const dir = path.join(salida, `${ancho}-${movimiento}`);
      await fs.mkdir(dir, { recursive: true });

      const nodo = await pag.$('#umbral');
      if (!nodo) throw new Error(`${donde} · no se encontró #umbral: cambió la estructura del sitio`);
      const caja = await nodo.boundingBox();
      if (!caja) throw new Error(`${donde} · #umbral no tiene caja visible`);
      /* boundingBox() es relativo al viewport y acá hace falta la coordenada de
         documento: se le suma el scroll actual en vez de confiar en que esté en 0. */
      const desplazado = await pag.evaluate(() => window.scrollY);
      const tope = caja.y + desplazado;

      /* Con prefers-reduced-motion el sitio achica .umbral a 100vh: como el viewport
         también mide ALTO, los cuatro momentos caen en el mismo scroll y darían cuatro
         PNG idénticos. Ahí se saca una sola captura, y se llama umbral.png para que
         nadie crea estar viendo el último fotograma de un recorrido que no ocurre. */
      const momentos = movimiento === 'reduce' ? [null] : MOMENTOS;
      for (const p of momentos) {
        const y = p === null ? tope : tope + p * (caja.height - ALTO);
        await pag.evaluate(v => window.scrollTo(0, v), y);
        await asentar(pag);
        await esperar(pag, NADA_ANIMANDO, 'ninguna animación corriendo', `${donde} · umbral ${p ?? 'único'}`);
        const nombre = p === null ? 'umbral.png' : `umbral-${String(p).replace('.', '_')}.png`;
        await pag.screenshot({ path: path.join(dir, nombre) });
      }

      for (const sel of SECCIONES) {
        const hay = await pag.evaluate(s => {
          const el = document.querySelector(s);
          el?.scrollIntoView({ block: 'start', behavior: 'auto' });
          return !!el;
        }, sel);
        /* un selector que no matchea deja la captura repetida de la anterior sin avisar:
           no es error del sitio, pero hay que verlo */
        if (!hay) console.warn(`AVISO · ${donde} · el selector ${sel} no matchea nada: la captura repite la anterior`);
        await asentar(pag);
        await esperar(pag, IMAGENES_VISIBLES_LISTAS, 'imágenes visibles cargadas', `${donde} · ${sel}`);
        await esperar(pag, NADA_ANIMANDO, 'ninguna animación corriendo', `${donde} · ${sel}`);
        await pag.screenshot({ path: path.join(dir, `${sel.replace(/[#.]/g, '')}.png`) });

        if (hay && COMPLETAS.includes(sel)) {
          /* Para la captura de sección entera hay que forzar dos cosas que solo pasan
             cuando algo entra al viewport: el loading="lazy" de las imágenes de abajo
             y el .is-in que el IntersectionObserver le pone a los [data-reveal]. Sin
             esto la mitad inferior sale en blanco y con huecos.
             Que el reveal FUNCIONE se verifica en las capturas de viewport de arriba;
             esta otra existe para revisar tipografía y maquetado, o sea el estado ya
             asentado. La página se descarta al cerrar el contexto. */
          await pag.evaluate(s => {
            for (const img of document.querySelectorAll(`${s} img`)) img.loading = 'eager';
            for (const el of document.querySelectorAll(`${s} [data-reveal]`)) el.classList.add('is-in');
          }, sel);
          await esperar(pag,
            s => [...document.querySelectorAll(`${s} img`)].every(i => i.complete && i.naturalWidth > 0),
            'imágenes de la sección entera cargadas', `${donde} · ${sel} completa`, sel);
          await esperar(pag, NADA_ANIMANDO, 'ninguna animación corriendo', `${donde} · ${sel} completa`);
          await pag.locator(sel).screenshot({
            path: path.join(dir, `${sel.replace(/[#.]/g, '')}-completa.png`),
          });
        }
      }

      await ctx.close();
    }
  }
} catch (e) {
  fallaArnes = e;
} finally {
  /* en finally para no dejar un Chromium huérfano cuando algo tira: en Windows se
     acumulan entre corridas */
  await navegador.close().catch(() => {});
}

/* los errores del sitio se imprimen siempre, incluso si el arnés se rompió después,
   para no perder lo que se juntó hasta ahí */
if (errores.length) {
  console.error(`\n${errores.length} error(es) del sitio:`);
  for (const e of errores) console.error('  ' + e);
}

if (fallaArnes) {
  console.error(`\nARNÉS · la corrida se cortó: ${fallaArnes.message}`);
  process.exit(2);
}
if (errores.length) process.exit(1);

console.log(`OK · capturas en capturas/${etiqueta}/ · cero errores de consola`);
