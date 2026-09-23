# docs/ — el sitio publicado

Esta carpeta **es** el sitio. HTML plano, sin build, sin dependencias.
Todo lo que hay adentro se sirve tal cual.

- `index.html` — la portada
- `donde/index.html` — dónde comprar: los siete puntos de venta
- `contacto/index.html` — WhatsApp, teléfono, mail e Instagram
- `assets/comun.css` y `assets/comun.js` — lo que comparten las tres páginas:
  tokens, nav, pie, puerta de edad y reveals. El markup del nav, del pie y de
  la puerta está repetido en las tres: si se cambia en una, se cambia en todas
- `assets/` — 17 imágenes WebP, el mapa del desvío, el laberinto SVG, los
  favicons (`favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`) y la
  imagen para compartir
- `404.html` — "Este camino no lleva a ningún lado". Es la única página con
  rutas absolutas, porque se sirve en cualquier ruta que no exista.
- `.nojekyll` — quedó de la etapa de GitHub Pages. No molesta.
- `robots.txt`

## Rutas relativas

Todos los `src` y `href` son **relativos** (`assets/...`, `./`), salvo los de
`404.html`. Vienen de cuando el sitio vivía en `usuario.github.io/laberintos/`,
donde las absolutas lo rompían. En el dominio propio funcionan igual, así que
se quedan como están: cambiarlas no arregla nada y toca las tres páginas.

## Estado

**El sitio está publicado** en https://laberintos-wines.com.ar/ y se indexa.
Lo sirve Cloudflare desde esta carpeta. Ver `../PUBLICAR.md`.

Resuelto: el canonical falso, los enlaces de Instagram y de la tienda, y las
cosechas (valen las de la ficha técnica: 2024 / 2023 / 2022).

### Lo que sigue abierto

1. **La contraetiqueta del Syrah.** Lo que hay publicado es un **borrador
   nuestro**, marcado como tal en el markup. La bodega tiene que aprobarlo o
   mandar el suyo.
2. **La crianza del Syrah.** Dice "7 meses" a secas porque el dato que llegó no
   especifica la vasija. Si es roble, es una línea.

Resuelto el 18/09: la dirección de la bodega **no se publica** (la de antes ya
no vale), así que el código postal y la duda con Villa uva dejaron de ser preguntas.
Villa uva sigue en Estrada 611: es un punto de venta, no la bodega.

### Notas que no caducan

- El crédito de TRAMA en el pie apunta a `tramaid.com.ar`, en una sola línea.
- Las tipografías vienen de Google Fonts: Special Elite, Barlow Condensed e IBM
  Plex Mono. Si se quieren sin dependencias externas, las tres son OFL y se
  pueden autoalojar.
