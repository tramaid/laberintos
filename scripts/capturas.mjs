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
