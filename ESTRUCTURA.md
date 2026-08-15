# Qué hay en cada carpeta

```
laberintos-web/
├─ PUBLICAR.md          ← cómo subirlo a GitHub Pages. Ya está listo
├─ docs/                ← EL SITIO PUBLICADO. HTML plano, sin build
├─ CLAUDE.md            ← reglas de trabajo para Claude Code. Se lee primero
├─ PROTOTIPO.html       ← el umbral y los 4 vinos andando. Abrilo y scrolleálo
├─ SPEC.md              ← la especificación completa del sitio
├─ PROMPT_ARRANQUE.md   ← el prompt para pegar en la sesión 1
├─ ESTRUCTURA.md        ← este archivo
│
├─ data/vinos.json      ← FUENTE ÚNICA de datos. Incluye _conflictos
├─ lib/motion.js        ← el motor. 4 primitivas, 1 rAF. Ya escrito
├─ lib/tipos.ts         ← el tipo Vino
├─ styles/tokens.css    ← colores MEDIDOS de las etiquetas + tipografía + movimiento
├─ styles/globals.css
│
├─ app/                 ← Next.js App Router, export estático
│  ├─ layout.tsx
│  └─ page.tsx          ← el orden de las secciones ES la alternancia de fondos
│
├─ components/          ← una por sección, con TODO y las reglas en comentarios
│  ├─ Umbral.tsx        ← el travelling. Se construye ÚLTIMO
│  ├─ Vinos.tsx
│  ├─ Fichas.tsx        ← fondo claro
│  ├─ Origen.tsx
│  ├─ Donde.tsx         ← fondo claro
│  └─ Pie.tsx
│
└─ public/
   ├─ hero/             ← 8 capas del umbral, recortadas por caja de alfa
   │                      a*.webp = fachada (5) · b*.webp = corredor (3)
   ├─ img/botellas/     ← las 4 botellas recortadas
   ├─ img/escenas/      ← las 4 escenografías
   ├─ fichas/           ← los PDF originales para descarga
   └─ svg/laberinto.svg ← el laberinto monolineal, 4.5 KB, centro exacto
```

## Lo que ya está resuelto y no hay que rehacer

- **`lib/motion.js`** — el motor entero. Un solo rAF, dos sabores de progreso,
  reveal de disparo único y seguimiento de puntero. `prefers-reduced-motion`
  se chequea ahí adentro y en ningún otro lado.
- **`styles/tokens.css`** — los colores de las etiquetas están medidos de los
  renders, con su contraste real anotado al lado.
- **`public/hero/`** — las capas están recortadas a la caja donde su alfa no
  es cero. La del vano pesa 10 KB y está al triple de resolución que un
  recorte de cuadro completo. Los porcentajes de posición están en el SPEC.
- **`public/svg/laberinto.svg`** — monolineal, `fill:none` + `stroke`,
  centro exacto en el viewBox. El grosor es una sola propiedad de CSS.

## Lo que ya está probado en el prototipo

- El umbral entero: dos tomas, corte sin destello, blanco con la frase,
  apagón a negro. Los tiempos están en el SPEC §3.
- Los cuatro vinos con el texto alternado y el corrimiento de cada escena.
- La banda clara con las cuatro etiquetas.

## Lo que ya está publicable

`docs/` es el sitio entero funcionando: umbral, índice navegable, los cuatro
vinos, el desvío, el cierre y el pie. HTML plano de 40 KB más 3,3 MB de
imágenes. Ver `PUBLICAR.md`.

## Lo que falta construir en el proyecto Next.js

Fichas técnicas y Origen. El resto ya está resuelto en `docs/` y sirve de
referencia para portarlo a componentes.

## Lo que bloquea la publicación

1. **Confirmar las cosechas.** Etiquetas y fichas no coinciden.
2. **La ficha técnica del Syrah.** Es el único vino sin datos.
3. **El código postal de Escobar.** "01423" no tiene formato argentino.
