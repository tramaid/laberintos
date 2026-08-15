# Pasada visual y de contenido sobre `docs/`

Fecha: 2026-08-15
Estado: aprobado. Cuatro de las seis entradas de la sección 4 están resueltas.
Las dos abiertas —las cosechas y la ficha del Syrah— no bloquean: tienen
comportamiento por defecto definido y ninguna de las dos cambia código.

## Qué es esto

Una pasada de sistema tipográfico y de color sobre el sitio publicado, más los
arreglos que hoy bloquean publicar. No es un rediseño: la dirección visual
aprobada queda como está.

## Alcance

**Se trabaja solo sobre `docs/index.html`.** Es HTML plano y es la versión
publicable. El proyecto Next.js queda como está: hoy son dos caminos
independientes y esta pasada no los unifica.

### Fuera de alcance — no se toca

- `lib/motion.js` y todo el motor de scroll.
- La geometría del umbral: los `left/top/width/height` y los `transform-origin`
  de las ocho capas están medidos sobre las fotos, no estimados.
- Los tiempos del umbral: corte en 0.36, blanco 0.60→0.71, las tres líneas del
  manifiesto, el apagón en 0.950→0.998.
- El enmascarado de las escenas de vino y el `--tx` de cada una.
- El ritmo oscuro/claro entre secciones.
- La sección Origen que falta: se decidió no construirla en esta pasada.

## 1. Sistema tipográfico

### 1.1 La tercera familia

`--dato` hoy es `ui-monospace, SFMono-Regular, Menlo, monospace`: la mono del
sistema, que se ve distinta en cada equipo. Pasa a ser **IBM Plex Mono 400**,
cargada desde Google Fonts junto a las dos que ya se cargan.

Los lugares donde se usa no cambian: `.etiqueta`, `.nav nav`, `.datos` (`dt` y
`dd`), `.linea-vino`, `.edicion`, `.pendiente`, `.cuatro span`,
`.pie__cols h3`, `.pie__cta`, `.pie__legal`.

Razón funcional además de la de marca, **corregida después de medirla**: el
borrador de este spec decía que los números de las fichas "hoy bailan". No es
cierto en cualquier equipo. En la máquina donde se midió, `ui-monospace` ya
resolvía a una mono y la columna —2024, 950 msnm, 13,4%, 24 meses— ya caía
alineada.

Lo que se gana no es que **ahora** alineen, sino que alineen **en todos lados**.
Antes eso dependía de a qué resolviera la mono del sistema en cada equipo, que
es exactamente lo que el token dejaba librado al azar. Es un argumento más
chico que el del borrador, pero es el verdadero.

Special Elite queda solo como display, que es de donde viene: la etiqueta de la
botella. Barlow Condensed queda solo como texto corrido.

### 1.2 La escala

Hoy hay siete `clamp()` distintos, inventados sección por sección, y los tokens
`--h1`/`--h2`/`--h3` están definidos pero casi no se usan. Se consolidan en
cuatro escalones:

| token  | valor                        | dónde                                  |
|--------|------------------------------|----------------------------------------|
| `--h1` | `clamp(38px, 6vw, 84px)`     | `.pie h2`                              |
| `--h2` | `clamp(34px, 5.4vw, 72px)`   | `.titulo h1` (umbral)                  |
| `--h3` | `clamp(34px, 4.2vw, 58px)`   | `.vino__texto h2`                      |
| `--h4` | `clamp(30px, 3.6vw, 50px)`   | `.indice h2`, `.desvio h2`, `.familia h2`, `.manifiesto h2` |

Cinco de los siete quedan **idénticos**, porque su valor viejo y su token nuevo
son el mismo `clamp()`: `.titulo h1`, `.vino__texto h2`, `.pie h2`,
`.desvio h2` y `.indice h2`. Verificado byte a byte y por computed style.

Los otros dos sí cambian, y **cambian en los cuatro anchos**, no solo en el
tope. Es fácil leer mal un `clamp()`: al cambiar `clamp(28px, 4.2vw, 56px)` por
`clamp(30px, 3.6vw, 50px)` se mueven el mínimo, la pendiente y el máximo a la
vez. Medido:

| elemento | 390 | 768 | 1280 | 1440 |
|---|---|---|---|---|
| `.manifiesto h2` antes | 28 | 32,26 | 53,76 | 56 |
| `.manifiesto h2` después | **30** | 30 | 46,08 | 50 |
| `.familia h2` antes | 30 | 30 | 48,64 | 54 |
| `.familia h2` después | 30 | 30 | 46,08 | 50 |

A 390 el manifiesto **crece** 2 px: es lo único de toda la pasada que crece.
Se verificó que los quiebres de línea no cambian y que no desborda.

Ningún otro título cambia de tamaño.

`.titulo h1` conserva su `letter-spacing: -.01em` y su `max-width: 13ch`;
`.pie h2` conserva su `letter-spacing: -.03em`. La escala unifica el tamaño,
no el tratamiento.

## 2. Sistema de color

Los colores sueltos fuera de `:root` se consolidan en cinco tokens. Cada uno
lleva su contraste real anotado al lado, calculado —no estimado—, siguiendo la
convención que ya usan los sustratos y los colores de etiqueta.

| token              | valor     | reemplaza a                | rol                          |
|--------------------|-----------|----------------------------|------------------------------|
| `--texto-2`        | `#a9a297` | `#a9a297`                  | párrafo de vino sobre tinta  |
| `--muted-2`        | `#7d766b` | `#7d766b`, `#6f685e`       | labels `dt` y `.edicion` sobre tinta |
| `--linea-2`        | `#1c1916` | `#1c1916`, `#23211f`       | separadores sobre tinta      |
| `--muted-claro-2`  | `#8a8377` | `#8a8377`                  | labels `dt` sobre papel      |
| `--et-syrah-texto` | `#7a3f37` | `#7a3f37`                  | terracota legible sobre papel |

`#2a2622` ya existe como `--linea` y solo hay que usarlo donde hoy está escrito
a mano.

`#6f685e` desaparece: contra `#7d766b` la diferencia es imperceptible en el
tamaño y contexto en que se usa, y no justifica un token propio.

`--linea-2` unifica `#1c1916` (separador entre vinos) y `#23211f` (separadores
del pie). Se adopta el valor más oscuro de los dos.

**Regla que se mantiene:** sobre `--et-syrah` nunca va blanco. Para texto va
siempre `--et-syrah-texto`.

Si al calcular el contraste alguno de los tokens **de texto** —`--texto-2`,
`--muted-2`, `--muted-claro-2`, `--et-syrah-texto`— queda por debajo de 4.5:1
sobre su fondo, se ajusta el valor hasta alcanzarlo y se anota el cambio. La
regla manda sobre la fidelidad al valor actual.

`--linea-2` queda exento: es un separador de 1 px, no texto, y el mínimo de
contraste para texto no le aplica.

## 3. Arreglos que bloquean publicar

1. **Canonical.** `docs/index.html:7` dice
   `https://REEMPLAZAR.github.io/laberintos/`.
2. **`<title>` duplicado.** Hay dos, en la línea 3 y en la 20. Queda el
   primero: `Laberintos — Vinos de Mendoza y San Juan`. Se borra
   `Laberintos — umbral`.
3. **Open Graph.** `og:image` es relativo (`assets/og.jpg`) y al compartir el
   link no se renderiza. Pasa a URL absoluta. Se agrega `og:url`.
4. **El nav no navega.** `docs/index.html:375` usa `<span>`. Pasan a `<a>` con
   ancla real y el mismo scroll suave que ya usan las botellas del índice, con
   el chequeo de `prefers-reduced-motion` que ese código ya tiene.
5. **Carga de las escenas.** Las cuatro imágenes de escena (~1,5 MB) no tienen
   `loading="lazy"` y compiten con el umbral, que es lo primero que se ve. Se
   agrega. Las del índice ya lo tienen.
6. **Copy del Syrah.** Hoy es "Tinto de San Juan. Cosecha 2023.", una línea
   seca al lado de los párrafos trabajados de los otros tres. Se reescribe
   **sin inventar datos de vinificación**: solo se puede apoyar en lo que ya
   está confirmado —provincia, variedad, cosecha— y en el argumento editorial
   que ya existe en el desvío ("el único camino que sale del mapa").

## 4. Entradas requeridas y comportamiento por defecto

Estos seis puntos dependen de información que solo tiene el cliente. Cada uno
tiene un comportamiento definido si el dato no llega, para que la
implementación nunca quede bloqueada ni tenga que adivinar.

| # | Entrada | Si no llega |
|---|---------|-------------|
| 1 | ~~Dominio final del sitio~~ | **Confirmado 2026-08-15: todavía no hay dominio.** Se **elimina** la etiqueta canonical en vez de publicar `REEMPLAZAR`, y no se agrega `og:url`. `og:image` queda relativo, con un comentario en el HTML que explica qué hay que cambiar el día que haya dominio. |
| 2 | Cosechas confirmadas | Se mantienen las de las fichas técnicas (2024 / 2023 / 2022), que es lo que el sitio publica hoy. **No se tocan.** Queda anotado como riesgo abierto: las etiquetas de las botellas dicen 2022 / 2019 / 2019. |
| 3 | ~~URLs de Instagram y Tienda online~~ | **Resuelto.** Ver 4.1. |
| 4 | ~~Qué hacer con "Origen" en el nav~~ | **Confirmado 2026-08-15: se quita del nav.** Quedan "Vinos" y "Encontralo", que sí llevan a una sección real. Construir Origen queda para otra pasada. |
| 5 | ~~La foto de `.desvio__foto`~~ | **Confirmado 2026-08-15: se borra el CSS muerto** (`docs/index.html:325-329`). El desvío queda como está: solo texto sobre papel. |
| 6 | ~~Ficha técnica del Syrah~~ | **Parcialmente resuelto 2026-08-15.** Ver 4.2. |

### 4.1 Resuelto — el pie, columna "Seguinos"

Confirmado el 2026-08-15:

- **Instagram** apunta a `https://www.instagram.com/laberintosvinos`, con
  `target="_blank" rel="noopener"`, igual que la firma del estudio.
- **Tienda online** apunta a `https://laberintosvinos.mitiendanube.com/`, la
  tienda que ya está en línea, también con `target="_blank" rel="noopener"`.

La tienda actual está en TiendaNube. Se va a **rehacer** como theme de la
tienda PepperLabs, igual que Inyesoft y Materiales Matheu, pero eso queda
fuera del alcance de esta pasada: el día que pase, lo único que cambia en
este sitio es la URL de ese `<a>`.

### 4.2 Parcialmente resuelto — los datos del Syrah

El 2026-08-15 el cliente pasó cuatro datos que antes no existían:

```
Terroir: Valle del Zonda, San Juan
Cosecha: 23
Crianza: 7 meses
Partida Especial: 300 botellas
```

Qué cambió en el sitio:

- **`Origen` gana precisión**: "Valle del Zonda, San Juan" reemplaza al
  "San Juan, Argentina" que se publicaba.
- **`Crianza` es una fila nueva** de la tabla, con el valor **"7 meses" y nada
  más**. El dato que llegó **no dice en qué vasija**, y los otros vinos sí
  ("12 meses en roble", "24 meses, roble francés"). Escribir "en roble" sería
  inventar una declaración legal. En `data/vinos.json` la clave
  `crianza_roble` queda en `null` a propósito y se agregó `crianza`.
- **La partida limitada** entra como `<p class="edicion">`, reutilizando el
  tratamiento que el Gran Reserva ya tiene. Sin CSS nuevo.
- **El párrafo de cata se eliminó.** Ver 4.3.
- **El aviso pasa de "pendiente" a "parcial"**: decir que falta la crianza
  cuando ya la tenemos sería falso.

**Sigue faltando**, y por eso el aviso se queda: vinificación, maceración,
fermentaciones, altitud, suelo, vendimia, guardas y el análisis —alcohol,
acidez y azúcar—. El alcohol es declaración legal y no lo tenemos.

### 4.3 Corrección al §3.6 — el párrafo del Syrah no se reescribe: se elimina

El spec §3.6 pedía **reescribir** el párrafo. Se reescribió, y una revisión lo
desarmó proposición por proposición: las cinco cosas que decía ya estaban
dichas en la sección del desvío, dos pantallas antes, y una de ellas —"otro
suelo y otra uva"— era el `<h2>` de esa sección **copiado palabra por
palabra**.

El diagnóstico de fondo: los otros tres párrafos describen el vino en la copa
—aromas, barrica, estructura— y de este no hay ficha de cata. Dentro de la
regla de no inventar, **cualquier** párrafo ahí repite o el desvío o la tabla.

Los datos de 4.2 resolvieron el problema por otro lado: la tabla pasó de tres
filas a cuatro y apareció la línea de edición, así que la sección se sostiene
con el mismo peso que las otras tres **sin párrafo**.

**Regla dura heredada de `CLAUDE.md`, que esta pasada no relaja:** no se
inventa ningún dato de vino. Cosecha, alcohol, crianza y origen son
declaraciones legales. Si un dato falta, va `—` explícito.

## 5. Verificación

Obligatoria antes de dar la pasada por terminada:

- Capturas a **390, 768, 1280 y 1440 px** de ancho.
- **Cero errores en consola.**
- Con `prefers-reduced-motion: reduce`: todo el contenido visible y quieto.
- **Chequeo específico del umbral:** que el panel de tinta siga cubriendo el
  ancho completo del título después del cambio de escala tipográfica. El CSS
  advierte que con el degradado arrancando antes, el borde derecho del titular
  caía a 2:1 contra la piedra clara. El cambio de `--h2` es de tope 72 a tope
  72 —no cambia—, pero el cambio de familia en los elementos vecinos puede
  correr el bloque, así que se verifica igual.
- **Contraste medido** de los cinco tokens nuevos, anotado en el CSS.
- `grep` de colores hexadecimales fuera del bloque `:root`. Tiene que dar cero,
  con estas tres excepciones legítimas que **no** se tokenizan:
  - `.camara { background:#000 }` — el negro absoluto del fondo de cámara. No
    es el negro de marca: es la ausencia de imagen detrás de las capas.
  - `.pie__marca { color:#ffffff }` — blanco puro al 5,5% de opacidad. El valor
    que importa es la opacidad, no el color.
  - Los `#000` dentro de `mask-image` / `-webkit-mask-image`. No son color:
    son el canal de la máscara.

  Los `rgba(0,0,0,…)` de los `drop-shadow` quedan fuera del grep por la misma
  razón que se explica abajo.

## 6. Riesgos

- **IBM Plex Mono suma una tercera petición de fuente.** Se carga solo el peso
  400 y en el mismo `<link>` que ya existe, para no agregar una conexión nueva.
- **`docs/` y el proyecto Next.js se separan más.** Ya estaban desincronizados;
  esta pasada aumenta la distancia. Es una deuda conocida y aceptada, no un
  descuido.
- **Las cosechas quedan sin resolver** si no llega la confirmación. Es el único
  riesgo legal abierto.

## 7. Observado, deliberadamente fuera de alcance

Cosas que aparecieron al revisar y que **no** se tocan en esta pasada, anotadas
para que no se pierdan.

- **Las botellas del índice llevan sombra.** `.cuatro img` tiene
  `drop-shadow(0 18px 30px rgba(0,0,0,.18))` y en hover sube a
  `0 26px 34px rgba(0,0,0,.24)`. `CLAUDE.md` dice "sin sombras" como regla de
  marca —"la marca es piedra tallada"— así que el sitio publicado contradice su
  propia regla. Puede ser una excepción deliberada, porque una botella recortada
  flotando sin sombra sobre papel se ve pegada, o puede ser un descuido.
  **Requiere una decisión de diseño que no se tomó en este spec.**
- **Tres bloques oscuros seguidos.** Malbec, Reserva y Gran Reserva. `CLAUDE.md`
  lo prohíbe explícitamente. Puede ser que los tres Malbec cuenten como una
  serie única y la regla no aplique. Queda para la pasada de ritmo.
- **La sección Origen no existe.** Está en el SPEC como una de las seis
  secciones y en el nav, pero no en el sitio.
- **`.familia` ocupa 100vh para sostener un solo título.**
- **`docs/` y el proyecto Next.js siguen separados**, con Fichas y Origen sin
  construir del lado de Next.
