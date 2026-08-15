/* Contraste WCAG 2.1 de los pares token/fondo del sitio.
   Uso: node scripts/contraste.mjs

   Los hexadecimales NO se copian a mano: se leen del bloque :root de docs/index.html.
   Si el token ya existe en el CSS manda el CSS ("css"); si todavía no existe se usa el
   hex propuesto por el plan ("propuesto"). Así el script no puede dar verde sobre un
   color que el sitio ya no usa, que es el falso positivo que más caro sale acá.

   Códigos de salida: 0 pasa todo · 1 algún texto no llega a 4.5:1 · 2 no se pudo leer el CSS. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HTML = path.join(raiz, 'docs', 'index.html');

/* Falla ruidosa con código 2: un contraste calculado sobre valores que no son los
   del sitio es peor que no calcular nada. */
const morir = msg => { console.error(`ERROR · ${msg}`); process.exit(2); };

/* #abc y #aabbcc son el mismo color. Se normaliza a 6 dígitos porque parseInt sobre
   un hex de 3 daría NaN y la fila se ignoraría en silencio. */
const normalizarHex = valor => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(valor).trim());
  if (!m) return null;
  const c = m[1].toLowerCase();
  return '#' + (c.length === 3 ? [...c].map(d => d + d).join('') : c);
};

/* Lee las declaraciones del bloque :root de docs/index.html. */
function tokensDeCss(archivo) {
  let texto;
  try {
    texto = readFileSync(archivo, 'utf8');
  } catch (e) {
    return morir(`no se pudo leer ${archivo}: ${e.message}`);
  }
  /* Se quitan los comentarios antes de parsear: las notas del CSS mencionan nombres de
     token y si no se limpian se confunden con declaraciones reales. */
  const limpio = texto.replace(/\/\*[\s\S]*?\*\//g, '');
  const abre = limpio.search(/:root\s*\{/);
  if (abre === -1) return morir(`no se encontró el bloque :root en ${archivo}`);
  const desde = limpio.indexOf('{', abre) + 1;
  const hasta = limpio.indexOf('}', desde);
  if (hasta === -1) return morir(`el bloque :root de ${archivo} no cierra con }`);

  const mapa = new Map();
  for (const m of limpio.slice(desde, hasta).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    mapa.set(m[1], m[2].trim());
  }
  if (mapa.size === 0) return morir(`el bloque :root de ${archivo} no tiene declaraciones legibles`);
  return mapa;
}

const CSS = tokensDeCss(HTML);

/* Los fondos tienen que existir sí o sí: todo el cálculo cuelga de ellos. */
const fondoDeCss = nombre => {
  const crudo = CSS.get(nombre);
  if (crudo === undefined) return morir(`falta el token de fondo ${nombre} en :root`);
  return normalizarHex(crudo) ?? morir(`el token de fondo ${nombre} no es un hex: ${crudo}`);
};

/* Devuelve [hex, origen]. origen es 'css' si el token ya está en :root y 'propuesto'
   si todavía lo tiene que crear el plan. */
const colorDeToken = (nombre, propuesto) => {
  const crudo = CSS.get(nombre);
  const respaldo = () =>
    normalizarHex(propuesto) ?? morir(`el hex propuesto de ${nombre} no es válido: ${propuesto}`);
  if (crudo === undefined) return [respaldo(), 'propuesto'];
  const hex = normalizarHex(crudo);
  if (!hex) {
    console.warn(`AVISO · ${nombre} existe en :root pero su valor no es un hex (${crudo}); se usa el propuesto`);
    return [respaldo(), 'propuesto'];
  }
  return [hex, 'css'];
};

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

const FONDOS = { '--ink': fondoDeCss('--ink'), '--papel': fondoDeCss('--papel') };

/* [token, hex propuesto si el token todavía no existe, token de fondo, exige 4.5:1, rol]
   texto:true exige 4.5:1. Los separadores de 1px no son texto y quedan exentos.
   Todos los tokens de texto del sitio son cuerpo o labels chicos, así que 4.5:1 aplica a todos. */
const PARES = [
  ['--texto-2',        '#a9a297', '--ink',   true,  'párrafo de vino sobre tinta'],
  ['--muted-2',        '#7d766b', '--ink',   true,  'labels dt y .edicion sobre tinta'],
  ['--muted-claro',    '#6b6459', '--papel', true,  'labels sobre papel (ya existe)'],
  ['--et-syrah-texto', '#7a3f37', '--papel', true,  'terracota legible sobre papel'],
  ['--muted',          '#8a8479', '--ink',   true,  'texto atenuado sobre tinta (ya existe)'],
  ['--linea-2',        '#1c1916', '--ink',   false, 'separadores de 1px sobre tinta'],
  ['--linea',          '#2a2622', '--ink',   false, 'separadores de 1px sobre tinta'],
];

console.log(`fuente de los colores: ${path.relative(raiz, HTML).replace(/\\/g, '/')} · :root`);
console.log(`fondos: --ink ${FONDOS['--ink']} · --papel ${FONDOS['--papel']}\n`);

let fallo = false;
for (const [nombre, propuesto, tokenFondo, texto, rol] of PARES) {
  const [color, origen] = colorDeToken(nombre, propuesto);
  const r = contraste(color, FONDOS[tokenFondo]);
  const estado = !texto ? 'n/a ' : r >= 4.5 ? 'PASA' : 'FALLA';
  if (texto && r < 4.5) fallo = true;
  console.log(`${estado}  ${r.toFixed(2).padStart(6)}:1  ${nombre.padEnd(18)} ${color}  ${origen.padEnd(9)} ${rol}`);
}
process.exit(fallo ? 1 : 0);
