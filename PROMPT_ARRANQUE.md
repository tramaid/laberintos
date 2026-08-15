# Prompt de arranque

Pegar esto en una sesión nueva de Claude Code, dentro de la carpeta del proyecto.

---

Vas a construir el sitio de LABERINTOS, una bodega argentina.

Leé primero, en este orden: `CLAUDE.md`, `SPEC.md` y `data/vinos.json`
(incluida la clave `_conflictos`). Después mirá `lib/motion.js` y
`styles/tokens.css`: los dos ya están escritos y no se reimplementan.

Y abrí `PROTOTIPO.html`: el umbral y los cuatro vinos ya están resueltos ahí,
con los tiempos y las medidas aprobadas. Es la referencia de comportamiento.

**Sesión 1 — solo esto:**
Maquetá las seis secciones del SPEC con los datos reales de `vinos.json` y
las imágenes de `public/`. **Sin una sola animación.** Todo estático.
Respetá la alternancia de fondos (oscuro = el mundo, claro = el dato) y los
tokens de `tokens.css`.

Cuando termines, corré Playwright y sacá capturas a 390, 768, 1280 y 1440 px.
Mostrámelas antes de seguir.

No animes nada hasta que yo apruebe el layout.
