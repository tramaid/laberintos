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
