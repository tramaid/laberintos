# docs/ — el sitio publicado

Esta carpeta **es** el sitio. HTML plano, sin build, sin dependencias.
Todo lo que hay adentro se sirve tal cual.

- `index.html` — la página entera, 40 KB
- `assets/` — 17 imágenes WebP, el laberinto SVG y la imagen para compartir
- `404.html` — "Este camino no lleva a ningún lado"
- `.nojekyll` — **no borrar.** Sin este archivo GitHub Pages pasa todo por
  Jekyll, que ignora las carpetas que empiezan con guión bajo y agrega
  demoras al deploy sin ninguna ventaja para un sitio estático.
- `robots.txt`

## Rutas relativas

Todos los `src` y `href` son **relativos** (`assets/...`, `./`). Eso hace que
el sitio funcione igual servido desde la raíz de un dominio propio que desde
`usuario.github.io/laberintos/`. Si se cambian por rutas absolutas (`/assets/`),
el sitio se rompe en la URL de proyecto de GitHub. Es el error clásico.

## Antes de publicar en serio

1. En `index.html`, reemplazar la URL de `<link rel="canonical">`.
2. Poner los enlaces reales de Instagram y de la tienda.
3. Confirmar las cosechas (ver `../data/vinos.json` → `_conflictos`).
4. Verificar el código postal de Escobar: está marcado en el markup.
5. El crédito de TRAMA en el pie apunta a `tramaid.com.ar`. Si algún día
   cambia el dominio, está en una sola línea del `index.html`.
6. Las tipografías vienen de Google Fonts. Si se quiere sin dependencias
   externas, se pueden autoalojar: Special Elite y Barlow Condensed son OFL.
