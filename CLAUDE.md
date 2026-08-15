# CLAUDE.md — cómo trabajar en este repo

## Qué es
Sitio de marca de LABERINTOS, bodega argentina. Next.js App Router con
**export estático** (`output: 'export'`). Sin backend, sin base de datos.

## Antes de escribir una línea
1. Leé `SPEC.md` entero.
2. Leé `data/vinos.json`, incluida la clave `_conflictos`.
3. Mirá `lib/motion.js`. **Ya está escrito.** No lo reimplementes.
4. **Abrí `PROTOTIPO.html` en el navegador y scrolleálo.** Es el umbral y los
   cuatro vinos funcionando. Cuando el SPEC no alcance, la respuesta está ahí.

## Orden de trabajo — no lo alteres
1. **Layout completo y quieto.** Las seis secciones maquetadas, con datos
   reales, sin una sola animación. Se revisa así antes de seguir.
2. Recién después, **una sección animada por sesión**.
3. El umbral **va último**, aunque sea lo primero que se ve. Es lo más
   frágil y lo que más se rehace.

## Reglas duras

- **Todo movimiento pasa por `lib/motion.js`.** Ningún componente escribe su
  propio `requestAnimationFrame` ni su propio chequeo de
  `prefers-reduced-motion`. Si necesitás algo que el motor no tiene, se
  agrega al motor, no al componente.
- **Un solo `requestAnimationFrame` en todo el sitio.** Es verificable:
  buscá `requestAnimationFrame` en el repo y tiene que aparecer solo en
  `lib/motion.js`.
- **Nada de `perspective` ni `translateZ`** en el umbral. Ver SPEC §3.
- **Solo `transform` y `opacity`.** Nunca `width`, `height`, `top`, `left`
  ni `filter` en algo animado.
- **Los valores van como tokens** de `styles/tokens.css`, nunca hardcodeados.
- **Sin `border-radius`, sin sombras, sin itálicas** como acento.
- Los datos salen de `data/vinos.json`. Si un dato no está, va `—` explícito
  y se anota como pendiente. **No inventes datos de vino jamás**: cosecha,
  alcohol, crianza y origen son declaraciones legales.

## Verificación — obligatoria, no opcional
Después de cada sección animada, con Playwright:
- Capturas a 390, 768, 1280 y 1440 px de ancho.
- Cero errores en consola.
- Con `prefers-reduced-motion: reduce` el contenido está **todo visible** y
  quieto.
- Para el umbral, además: la medición del vano descrita en SPEC §3.

## Lo que NO hay que hacer
- No agregar librerías de animación. GSAP entra **solo** si aparece un pin
  real que `position: sticky` no resuelva, y se discute antes.
- No convertir esto en una landing convencional. La escenografía es la marca.
- No tocar los recortes de `public/hero/`: están calculados con la caja de
  alfa de cada capa y sus porcentajes están en el SPEC.
- No agregar un destello para tapar el corte del umbral. Se probó y se sacó.
- No espejar las escenas de vino para cambiar el texto de lado: daría vuelta
  la etiqueta. Se corre con `translateX` y el valor está en `vinos.json`.
- No poner tres bloques oscuros seguidos. Ver SPEC §2.
- No poner el túnel infinito de laberintos. Está fuera de alcance.

## El sitio publicado

`docs/` es la versión estática que se publica en GitHub Pages. Cuando cambies
algo en el proyecto Next.js, **acordate de regenerar `docs/`**: hoy los dos
caminos son independientes y se pueden desincronizar.

Las rutas de `docs/` son **relativas** a propósito, para que funcione tanto en
un dominio propio como en `usuario.github.io/laberintos/`. No las pases a
absolutas.

## Comandos
```
npm install
npm run dev      # localhost:3000
npm run build    # export estático a ./out
```
