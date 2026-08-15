# Publicar en GitHub Pages

El sitio ya está construido en `docs/`. No hay que compilar nada.

## Camino corto (sin workflow)

```bash
git init
git add .
git commit -m "Laberintos — sitio"
git branch -M main
git remote add origin git@github.com:USUARIO/laberintos.git
git push -u origin main
```

Después, en GitHub: **Settings → Pages → Build and deployment**
→ Source: *Deploy from a branch* → Branch: `main` → Folder: `/docs` → Save.

En un par de minutos queda en `https://USUARIO.github.io/laberintos/`.

## Camino con workflow

El repo trae `.github/workflows/pages.yml`. Si preferís ese camino:
**Settings → Pages → Source: GitHub Actions**. Publica `docs/` en cada push
a `main`.

Con los dos a la vez no pasa nada malo, pero elegí uno.

## Dominio propio

1. Crear `docs/CNAME` con una sola línea: `laberintos.com.ar`
2. En el DNS del dominio, cuatro registros `A` al apex:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Y un `CNAME` para `www` apuntando a `USUARIO.github.io`
4. En Settings → Pages, activar **Enforce HTTPS** cuando el certificado esté listo.

## Qué NO subir

`node_modules/`, `.next/`, `out/`. Ya están en `.gitignore`.

## Peso

`index.html` 40 KB + `assets/` 3,3 MB. Casi todo son las capas del umbral y
las escenas de los vinos, en WebP. Las tres primeras capas van con `preload`
porque son lo primero que se ve; el resto se carga en diferido.
