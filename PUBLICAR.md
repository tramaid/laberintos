# Publicar

El sitio está construido en `docs/`. No hay que compilar nada.

## Dónde está hoy

- **URL:** <https://laberintos-wines.com.ar/> — responde igual con y sin `www`.
- **Repo:** `tramaid/laberintos` (público). Antes estaba en
  `matiasmercado88-debug/laberintos`.
- **Quién lo sirve:** Cloudflare, un Worker con los assets de `docs/`, conectado
  a la rama `main`. Ver "Cloudflare".
- **DNS:** la zona está en Cloudflare y el dominio está delegado ahí desde
  nic.ar. Ver "El dominio".

Hasta el 22/09/2026 vivió en `tramaid.github.io/laberintos/`, con GitHub Pages
publicando la misma carpeta. Ese camino **está apagado**: se borró el workflow.
Si alguna vez hace falta de vuelta, está en el historial del repo.

## Cómo publicar un cambio

```bash
git add docs/
git commit -m "que cambio"
git push
```

Listo. Cloudflare reconstruye solo en cada push a `main`; tarda menos de un
minuto. Se confirma abriendo el sitio, o desde el panel del Worker.

**Antes de pushear, correr las dos verificaciones:**

```bash
npm run capturas final    # código 0 y cero AVISOS
npm run contraste         # código 0 y "9 de 9 tokens desde el CSS"
```

## Cloudflare

Es donde va a vivir el sitio con el dominio propio. Es el mismo `docs/`: no
cambia nada del código ni del flujo de trabajo.

Va como **Worker con assets estáticos**, no como Pages: es el camino que ofrece
hoy el panel al importar un repositorio, y un Worker creado así sí se puede
conectar a Git después, cosa que un proyecto de Pages no.

**El `wrangler.toml` de la raíz no es opcional.** En el repo conviven el sitio
estático de `docs/` y el proyecto Next.js a medio hacer. Sin ese archivo, el
proyecto encuentra el `package.json` con Next, lo compila y publica el proyecto
incompleto —el umbral es un componente vacío— en vez del sitio. El archivo
declara `docs/` como carpeta de assets y el 404 propio del sitio; no hay código
de Worker.

### Conectarlo la primera vez

1. Cloudflare → **Workers & Pages** → Create → importar el repositorio
   `tramaid/laberintos`. Hay que darle acceso a la app de Cloudflare en GitHub
   si es la primera vez.
2. Nombre del proyecto **`laberintos`**, el mismo que declara el
   `wrangler.toml`.
3. **Comando de compilación: vacío.** Viene con `npm run build` puesto, que es
   justo lo que no hay que hacer. El comando de despliegue queda en
   `npx wrangler deploy`.
4. **Domains & Routes** → agregar `laberintos-wines.com.ar` y `www`. El DNS ya
   está en Cloudflare, así que crea los registros solo. Hay que aceptar que
   reemplace los `A` que apuntaban a otro lado.

Los registros del dominio van **proxied** (nube naranja): es así como funciona
cuando sirve Cloudflare, al revés que apuntando a un host externo.

Para verificar a mano desde esta carpeta: `npx wrangler deploy --dry-run` no
publica nada y avisa si la configuración está rota.

### Pendiente: lo que quedó de la vuelta por Vercel

El `vercel.json` de la raíz es de ese intento y hoy no se usa. **Mientras exista
el proyecto `laberintos` en Vercel conectado al repo, cada push también publica
allá**, en una URL `.vercel.app`. Dar de baja ese proyecto y borrar el archivo.

## Buscadores

El sitio **se indexa** desde el 22/09/2026 y cada página lleva su `canonical`
al dominio. Antes llevaba `noindex`, para que la URL provisoria no le compitiera
a la definitiva.

Si alguna vez hay que sacarlo de Google, va un `<meta name="robots"
content="noindex">` en cada página (`index.html`, `donde/` y `contacto/`), **no**
un `Disallow` en `robots.txt`: un `Disallow` impide *rastrear* pero no impide
*indexar* —la URL puede aparecer igual en los resultados, sin contenido— y
además frena a los robots que arman la vista previa cuando alguien comparte el
link. Está explicado en `robots.txt`.

## El dominio: laberintos-wines.com.ar

Registrado en NIC Argentina el 17/09/2026, vence el 17/09/2027. **Anotarlo en el
calendario: si vence, se cae el sitio y el dominio queda libre.**

Cómo está armado, de afuera hacia adentro:

1. **nic.ar** lo tiene delegado a los servidores de nombres de **Cloudflare**
   (`aron.ns.cloudflare.com` y `bjorn.ns.cloudflare.com`). La delegación se hace
   en Trámites a Distancia, con clave fiscal.
2. **Cloudflare** tiene la zona, en plan gratuito. Los registros del dominio y
   de `www` los creó solo al agregar el dominio al Worker, y van en **proxy**
   (nube naranja).
3. Los tres `CAA` de la zona permiten emitir a Let's Encrypt, Google y Sectigo:
   son las autoridades que usa Cloudflare, así que no bloquean nada. Si algún
   día el certificado no se emite, mirar ahí primero.

Para verificar a mano:

```powershell
Resolve-DnsName laberintos-wines.com.ar -Type NS   # los dos de Cloudflare
```

Si el dominio se muda de proveedor, cambian las tres URLs absolutas de cada
página (`canonical`, `og:url`, `og:image`).

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
