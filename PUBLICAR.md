# Publicar

El sitio está construido en `docs/`. No hay que compilar nada.

## Dónde está hoy

- **URL:** https://laberintos-wines.com.ar/ — `tramaid.github.io/laberintos/`
  redirige ahí sola.
- **Repo:** `tramaid/laberintos` (público). Antes estaba en
  `matiasmercado88-debug/laberintos`: esa URL de Pages da 404 desde el traslado.
- **Fuente:** rama `main`, carpeta `/docs` — Settings → Pages
- **El dominio lo fija `docs/CNAME`.** No borrarlo: sin ese archivo Pages
  vuelve a la URL de github.io.

## Cómo publicar un cambio

```bash
git add docs/
git commit -m "que cambio"
git push
```

Listo. GitHub Pages reconstruye solo en cada push a `main`; tarda unos 15
segundos. Para confirmar que salió:

```bash
gh api repos/tramaid/laberintos/pages/builds/latest | ConvertFrom-Json | Select-Object status
```

**Antes de pushear, correr las dos verificaciones:**

```bash
npm run capturas final    # código 0 y cero AVISOS
npm run contraste         # código 0 y "9 de 9 tokens desde el CSS"
```

## El `noindex` de la etapa provisoria

Ya no está: con el dominio el sitio se indexa y lleva canonical. Mientras vivió
en github.io estuvo fuera de los buscadores a propósito, para que esa versión
provisoria no le compitiera a la definitiva. Si alguna vez hace falta de nuevo:

El `noindex` va en un `<meta>` de cada página (`index.html`, `donde/` y
`contacto/`), **no** como `Disallow` en
`robots.txt`, y eso es deliberado: un `Disallow` impide *rastrear* pero no impide
*indexar* —la URL puede aparecer igual en los resultados, sin contenido— y
además frena a los robots que arman la vista previa cuando alguien comparte el
link. Con `robots.txt` abierto y `noindex` en la página, Google no la lista y
WhatsApp sigue mostrando la imagen. Está explicado en los dos archivos.

## El dominio: laberintos-wines.com.ar

Registrado en NIC Argentina el 17/09/2026, vence el 17/09/2027. Al 18/09 figura
**inactivo y sin delegar**: no tiene servidores DNS y no resuelve.

**El orden importa.** Si se le pone el dominio a Pages antes de que el DNS
resuelva, `tramaid.github.io/laberintos/` empieza a redirigir a un dominio que
no existe y el sitio queda caído. Primero el DNS, después el repo.

### 1. Delegar y cargar el DNS (fuera del repo)

1. En **nic.ar** (Trámites a Distancia, con clave fiscal) → el dominio →
   **Delegar**, con los servidores de nombres de un proveedor de DNS
   (Cloudflare en plan gratis, o el que se use en los otros sitios).
2. En ese proveedor, estos registros:

   | Tipo | Nombre | Valor |
   |------|--------|-------|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `tramaid.github.io` |

   Opcionales: los `AAAA` de IPv6 (`2606:50c0:8000::153` a `8003::153`). Si es
   Cloudflare, los registros van en **DNS only** (nube gris): con el proxy
   GitHub no puede emitir el certificado.
3. Recomendado: verificar el dominio en la organización `tramaid` (Settings →
   Pages → Add a domain). GitHub da un `TXT` para cargar en el DNS; evita que
   otra cuenta de GitHub pueda tomar el dominio.

Se sabe que está listo cuando `Resolve-DnsName laberintos-wines.com.ar` devuelve
las cuatro IP.

### 2. El cambio en el repo

Está preparado en la rama **`dominio`**, un solo commit. Está subida a GitHub
pero no se publica: Pages sale solo de `main`.

1. Saca el `<meta name="robots" content="noindex">` de las tres páginas.
2. Agrega el `<link rel="canonical">` de cada una: `https://laberintos-wines.com.ar/`,
   `/donde/` y `/contacto/`.
3. Pasa `og:url` y `og:image` al dominio.
4. Crea `docs/CNAME` con `laberintos-wines.com.ar`.

Con el DNS andando: `git merge dominio`, correr las dos verificaciones y
`git push`. Después, en Settings → Pages, activar **Enforce HTTPS** cuando el
certificado esté listo (puede tardar hasta una hora).

## Qué NO subir

`node_modules/`, `.next/`, `out/`, `capturas/`. Ya están en `.gitignore`.

## Peso

`index.html` 47 KB + `assets/` 3,2 MB. Casi todo son las capas del umbral y las
escenas de los vinos, en WebP.

Las **cinco capas de la primera toma** del umbral van con `preload`, porque son
lo primero que se ve. Las de la segunda toma no: se piden igual al leer el HTML,
y con prioridad alta le sacarían ancho de banda a la primera. Precargar la
segunda en vez de la primera trae de vuelta el destello al entrar — está
explicado en el `<head>`.
