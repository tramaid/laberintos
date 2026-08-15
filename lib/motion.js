/* ==========================================================================
   lib/motion.js — el motor de movimiento del sitio.
   Cuatro primitivas. Todo efecto del sitio es una configuración de estas
   cuatro; ninguna sección escribe su propio requestAnimationFrame ni su
   propio chequeo de prefers-reduced-motion.
   ========================================================================== */
const MQ = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false };

export const clamp  = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp   = (a, b, t) => a + (b - a) * t;
export const sub    = (p, a, b) => clamp((p - a) / (b - a));
export const smooth = q => q * q * (3 - 2 * q);
export const reducido = () => MQ.matches;

/* ---- 1. TICKER ÚNICO -----------------------------------------------------
   Un solo rAF para el documento entero. Cada efecto continuo se suscribe.  */
const subs = new Set();
let raf = 0, lastY = 0, vel = 0;

function frame() {
  const y = window.scrollY;
  vel = lerp(vel, clamp((y - lastY) / 42, -1, 1), .22);
  lastY = y;
  for (const fn of subs) fn({ y, vel });
  raf = requestAnimationFrame(frame);
}

export function onTick(fn) {
  subs.add(fn);
  if (!raf) { lastY = window.scrollY; raf = requestAnimationFrame(frame); }
  return () => {                       // devolver siempre: React lo necesita
    subs.delete(fn);
    if (!subs.size && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
}

/* ---- 2. PROGRESO ---------------------------------------------------------
   `pin`:  0 cuando la sección toca el techo, 1 cuando termina de recorrerse.
   `view`: 0 cuando el elemento asoma por abajo, 1 cuando sale por arriba.   */
export function onProgress(el, cb, target = el) {
  if (reducido()) { target.style.setProperty('--p', 1); cb && cb(1); return () => {}; }
  return onTick(() => {
    const r = el.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const p = total <= 0 ? 0 : clamp(-r.top / total);
    target.style.setProperty('--p', p.toFixed(4));
    cb && cb(p);
  });
}

export function onViewProgress(el, cb, varName = '--pv') {
  if (reducido()) { el.style.setProperty(varName, .5); cb && cb(.5); return () => {}; }
  return onTick(() => {
    const r = el.getBoundingClientRect();
    const p = clamp((window.innerHeight - r.top) / (window.innerHeight + r.height));
    el.style.setProperty(varName, p.toFixed(4));
    cb && cb(p);
  });
}

/* ---- 3. REVEAL DE DISPARO ÚNICO ------------------------------------------ */
export function revealOnce(root = document, sel = '[data-reveal]', stagger = 90) {
  const els = [...root.querySelectorAll(sel)];
  if (reducido()) { els.forEach(e => e.classList.add('is-in')); return () => {}; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    if (!e.target.style.getPropertyValue('--d') && e.target.parentElement) {
      const g = [...e.target.parentElement.querySelectorAll(sel)];
      const i = g.indexOf(e.target);
      if (i > 0) e.target.style.setProperty('--d', i * stagger + 'ms');
    }
    e.target.classList.add('is-in');
    io.unobserve(e.target);
  }), { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
  return () => io.disconnect();
}

/* ---- 4. PUNTERO CON LERP -------------------------------------------------
   pointermove fija el objetivo; el ticker interpola. Al revés queda pegado
   al cursor y se ve barato.                                                 */
export function follow(el, ease = .14) {
  if (reducido() || !window.matchMedia('(hover:hover)').matches) return { to() {}, off() {} };
  let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty;
  const off = onTick(() => {
    x = lerp(x, tx, ease); y = lerp(y, ty, ease);
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%,-50%)`;
  });
  return { to(nx, ny) { tx = nx; ty = ny; }, off };
}

/* ---- utilidades del umbral ----------------------------------------------
   Perspectiva calculada, NO CSS `perspective`. Todas las capas del hero son
   planos frontales: `translateZ` dentro de un contexto 3D obliga al navegador
   a rasterizar una vez y estirar el bitmap, y la imagen se pixela. Un
   `scale` 2D da el mismo resultado geométrico y se vuelve a rasterizar.     */
export const PERSP = 1000;
export const escala = (z, avance) => (PERSP + z) / (PERSP + z - avance);
