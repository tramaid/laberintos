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

## Estado

**El sitio está publicado** en https://tramaid.github.io/laberintos/
y lleva `noindex` a propósito, porque esa URL es provisoria. Ver `../PUBLICAR.md`.

Resuelto: el canonical falso, los enlaces de Instagram y de la tienda, y las
cosechas (valen las de la ficha técnica: 2024 / 2023 / 2022).

### Lo que sigue abierto

1. **El dominio.** `laberintos-wines.com.ar` está comprado pero sin delegar:
   todavía no resuelve. Es lo único que bloquea sacar el `noindex`. Los pasos y
   el orden están en `../PUBLICAR.md`; el cambio del repo ya está hecho en la
   rama `dominio`.
2. **La contraetiqueta del Syrah.** Lo que hay publicado es un **borrador
   nuestro**, marcado como tal en el markup. La bodega tiene que aprobarlo o
   mandar el suyo.
3. **La crianza del Syrah.** Dice "7 meses" a secas porque el dato que llegó no
   especifica la vasija. Si es roble, es una línea.
4. **El código postal de Escobar**, marcado en el markup.
5. **Estrada 411 vs 611.** El pie dice que la bodega está en Estrada 411, Belén
   de Escobar, y Villa uva está en Estrada 611, Escobar. Misma calle, mismo
   partido. Está marcado en el markup.

### Notas que no caducan

- El crédito de TRAMA en el pie apunta a `tramaid.com.ar`, en una sola línea.
- Las tipografías vienen de Google Fonts: Special Elite, Barlow Condensed e IBM
  Plex Mono. Si se quieren sin dependencias externas, las tres son OFL y se
  pueden autoalojar.
