# Publicar

El sitio está construido en `docs/`. No hay que compilar nada.

## Dónde está hoy

- **URL:** https://matiasmercado88-debug.github.io/laberintos/
- **Repo:** `matiasmercado88-debug/laberintos` (público)
- **Fuente:** rama `main`, carpeta `/docs` — Settings → Pages
- **Es provisoria.** La cuenta se llama `-debug`. Ver "Cuando haya dominio".

## Cómo publicar un cambio

```bash
git add docs/
git commit -m "que cambio"
git push
```

Listo. GitHub Pages reconstruye solo en cada push a `main`; tarda unos 15
segundos. Para confirmar que salió:

```bash
gh api repos/matiasmercado88-debug/laberintos/pages/builds/latest | ConvertFrom-Json | Select-Object status
```

**Antes de pushear, correr las dos verificaciones:**

```bash
npm run capturas final    # código 0 y cero AVISOS
npm run contraste         # código 0 y "7 de 7 tokens desde el CSS"
```

## Por qué el sitio tiene `noindex`

Está fuera de los buscadores a propósito, para que esta versión provisoria no le
compita a la definitiva cuando exista el dominio.

El `noindex` va en un `<meta>` del `index.html`, **no** como `Disallow` en
`robots.txt`, y eso es deliberado: un `Disallow` impide *rastrear* pero no impide
*indexar* —la URL puede aparecer igual en los resultados, sin contenido— y
además frena a los robots que arman la vista previa cuando alguien comparte el
link. Con `robots.txt` abierto y `noindex` en la página, Google no la lista y
WhatsApp sigue mostrando la imagen. Está explicado en los dos archivos.

## Cuando haya dominio

1. **Sacar el `<meta name="robots" content="noindex">`** del `index.html`.
2. **Agregar** `<link rel="canonical" href="https://EL-DOMINIO/">`. Hoy no hay
   canonical a propósito: apuntar a una dirección que va a cambiar es peor que
   no tener ninguna.
3. **Cambiar las dos URLs absolutas** del `<head>`: `og:url` y `og:image`.
4. Crear `docs/CNAME` con una sola línea: el dominio.
5. En el DNS, cuatro registros `A` al apex:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   y un `CNAME` para `www` apuntando a `matiasmercado88-debug.github.io`.
6. En Settings → Pages, activar **Enforce HTTPS** cuando el certificado esté
   listo.

Los cuatro puntos del `<head>` están señalados con un comentario en el archivo.

## Qué NO subir

`node_modules/`, `.next/`, `out/`, `capturas/`. Ya están en `.gitignore`.

## Peso

`index.html` 47 KB + `assets/` 3,2 MB. Casi todo son las capas del umbral y las
escenas de los vinos, en WebP.

Las **cinco capas de la primera toma** del umbral van con `preload`, porque son
lo primero que se ve. Las de la segunda toma no: hay 600vh de scroll hasta que
aparecen. Cambiar esto trae de vuelta el destello al entrar — está explicado en
el `<head>`.
