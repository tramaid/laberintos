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
- `404.html` — "Este camino no lleva a ningún lado"
- `.nojekyll` — **no borrar.** Sin este archivo GitHub Pages pasa todo por
  Jekyll, que ignora las carpetas que empiezan con guión bajo y agrega
  demoras al deploy sin ninguna ventaja para un sitio estático.
- `robots.txt`
- `CNAME` — el dominio para GitHub Pages. **No borrar.**

## Rutas relativas

Todos los `src` y `href` son **relativos** (`assets/...`, `./`). Eso hace que
el sitio funcione igual servido desde la raíz de un dominio propio que desde
`usuario.github.io/laberintos/`. Si se cambian por rutas absolutas (`/assets/`),
el sitio se rompe en la URL de proyecto de GitHub. Es el error clásico.

## Estado

**El sitio está publicado** en https://laberintos-wines.com.ar/ y se indexa.
`CNAME` fija el dominio en GitHub Pages: no borrarlo. Ver `../PUBLICAR.md`.

Resuelto: el canonical falso, los enlaces de Instagram y de la tienda, y las
cosechas (valen las de la ficha técnica: 2024 / 2023 / 2022).

### Lo que sigue abierto

1. **Enforce HTTPS** en Settings → Pages, apenas GitHub emita el certificado
   del dominio.
2. **La contraetiqueta del Syrah.** Lo que hay publicado es un **borrador
   nuestro**, marcado como tal en el markup. La bodega tiene que aprobarlo o
   mandar el suyo.
3. **La crianza del Syrah.** Dice "7 meses" a secas porque el dato que llegó no
   especifica la vasija. Si es roble, es una línea.

Resuelto el 18/09: la dirección de la bodega **no se publica** (la de antes ya
no vale), así que el código postal y la duda con Villa uva dejaron de ser preguntas.
Villa uva sigue en Estrada 611: es un punto de venta, no la bodega.

### Notas que no caducan

- El crédito de TRAMA en el pie apunta a `tramaid.com.ar`, en una sola línea.
- Las tipografías vienen de Google Fonts: Special Elite, Barlow Condensed e IBM
  Plex Mono. Si se quieren sin dependencias externas, las tres son OFL y se
  pueden autoalojar.
