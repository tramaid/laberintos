# LABERINTOS — especificación del sitio

Sitio de marca para la bodega Laberintos (Mendoza / San Juan, Argentina).
Cuatro vinos. No es tienda: la conversión es WhatsApp y puntos de venta.

---

## 1. Qué es este sitio

Una marca que se llama Laberintos y cuyo símbolo es un laberinto tiene una
sola idea disponible: **entrar**. Todo el sitio es esa entrada y lo que hay
del otro lado.

El umbral no es decoración: es la promesa. Los vinos son lo que la cumple.
Si el umbral dura más que la paciencia del visitante, la promesa se rompe
antes de cobrarse.

**Regla de oro:** nadie llega para ver un laberinto. Llegan para ver un vino.

---

## 2. Estructura

Seis secciones. El fondo alterna, y la alternancia tiene una regla:

> **Oscuro = el mundo. Claro = el dato.**
> Se pasa a claro cuando cambia el modo de leer: de mirar a leer.

| # | Sección | Fondo | Qué hace |
|---|---------|-------|----------|
| 1 | Umbral | `--ink` | El travelling. Entrar. Termina en luz |
| 2 | Cuatro laberintos | `--papel` | Índice con las cuatro etiquetas |
| 2b | Los tres Malbec | `--ink` | Malbec → Reserva → Gran Reserva |
| 2c | Otro suelo, otra uva | `--papel` | El mapa: el recorrido de Mendoza a San Juan, animado |
| 2d | Syrah | `--papel` | **En claro.** Cambia de suelo, cambia de fondo |
| 2e | Cuatro caminos | `--ink` | Foto de familia. Devuelve el sitio al negro |
| 3 | Fichas técnicas | `--papel` | El dato duro. Tabla, no poesía |
| 4 | Origen | `--ink` | Viñedos, altitud, quién lo hace |
| 5 | Dónde conseguirlo | `--papel` | WhatsApp, puntos de venta, exportación |
| 6 | Pie | `--ink` | Conversión + contacto + legales |

El corte a claro se usa **tres veces**: el blanco de la frase, el índice de
las cuatro etiquetas, y las fichas técnicas. Regla operativa: **nunca más de
dos bloques oscuros seguidos**.

---

## 3. El umbral (sección 1)

### Estructura
Contenedor de **640vh** con hijo `position: sticky; top: 0; height: 100vh`.
El reparto interno importa más que el total:

| tramo | p | qué pasa |
|---|---|---|
| viaje de cámara | 0 → 0.72 | fachada, corte, corredor |
| corte entre tomas | 0.36 | ±0.05, sin destello |
| el papel sube | 0.60 → 0.71 | satura en `--papel` |
| la frase | 0.64 → 0.815 | tres líneas escalonadas |
| **el silencio** | 0.815 → 0.95 | **86vh con la frase quieta** |
| apagón a negro | 0.95 → 0.998 | entrega al primer vino |

Se llegó a estos números iterando con el cliente sobre el prototipo. El
error recurrente fue alargar el efecto de entrada en vez del silencio de
después: lo que hace falta es tiempo **con la frase ya puesta**.

### La entrada va sola
El umbral no se recorre a mano. El primer gesto hacia abajo —rueda, flecha,
barra espaciadora, deslizar el dedo o "Entrar"— reproduce la entrada sola
hasta la frase del manifiesto (p = 0.90) en **5,5 s**, con la curva `ease` de
CSS. Si arranca a mitad de camino, tarda la parte proporcional.

- Mueve el **scroll**, no la cámara: la cámara lo sigue leyendo en `frame()`
  como siempre. No hay un segundo motor.
- Mientras corre, los gestos hacia abajo se tragan. **Cualquier gesto hacia
  arriba la corta** y devuelve el control en el mismo gesto; también un link
  del nav, la barra de scroll o Escape.
- Pasada la frase, el scroll es normal: un gesto más apaga la frase y suelta
  el sticky.
- Con movimiento reducido no existe: el umbral mide una pantalla.

La duración es `ENTRADA` en `docs/index.html`. Los cortes de la tabla de abajo
siguen valiendo: están en p, y la entrada solo cambia a qué velocidad se pasa
por ellos.

### El destello del corte: NO va
Se probó un fogonazo para esconder el corte entre tomas y molestaba más de lo
que tapaba. El corte va a la vista, con un fundido de ±0.05, y se apoya en que
las dos tomas tienen el vano del mismo tamaño por cálculo. Medido cruzando el
corte: el peor paso es ×1.02.

### Las dos tomas
| toma | archivo | punto de fuga | vano | vive en |
|---|---|---|---|---|
| A · fachada | `public/hero/a*.webp` (5 capas) | 49.67% / 49.63% | 1.94% | p 0.00 → 0.58 |
| B · corredor | `public/hero/b*.webp` (3 capas) | 49.52% / 39.11% | 2.84% | p 0.40 → 0.92 |

### Reglas no negociables del umbral

1. **Nada de `perspective` ni `translateZ`.** Las capas son planos frontales.
   El 3D obliga a rasterizar una vez y estirar el bitmap: se pixela. Se calcula
   `escala(z, avance)` en JS y se aplica `transform: scale()`. Medido: entre
   2 y 3,5 veces más nítido.
2. **Cada imagen se ancla por SU punto de fuga**, no por el centro del div:
   `left/top: 49.63%` + `translate(-vx%, -vy%)` en porcentaje del propio
   tamaño de la imagen. Un `translateY` sobre el contenedor usa el porcentaje
   del viewport y corre el vano ~100 px durante la transición.
3. **El overscan sale de la geometría**, no del ojo: `max(1, 49.63 / vy) * 1.03`.
   Anclar por un punto descentrado destapa el borde superior.
4. **El corte es seco (±0.012) y va escondido en un destello** que nace en el
   vano. Un fundido largo deja ver las paredes de una toma encima de la otra.
5. **La toma de abajo no se funde**: está opaca todo el tiempo y solo se
   destapa la de arriba. Cruzar dos capas al 50% sobre negro apaga el vano.
6. **La escala de entrada se despeja, no se elige:**
   `baseA = vanoB · overscanB · escala(zB, avB) / (vanoA · overscanA · escala(zA, avA))`
   evaluado en el corte. Da ≈1.53. Si cambia una foto, se recalcula sola.

### Criterio de aceptación
Recorriendo el umbral, el ancho del vano en pantalla crece **monotónicamente
y sin escalones mayores a ×1.10**, y su centro no se desplaza más de 15 px
sobre 780. Se verifica con capturas a p = 0.20 / 0.40 / 0.47 / 0.50 / 0.55 / 0.70.

### Mobile
En ≤700 px el pin se apaga: la fachada quieta con un reveal corto y listo.
Un pin de 240vh en un teléfono se come la batería y no aporta.

### El túnel infinito — NO va en este sitio
Existe, funciona y está documentado, pero es lo más caro que se construyó y
lo menos necesario acá. Guardarlo para pantalla de carga o para otro proyecto.

---

## 4. Los vinos (sección 2)

Cuatro bloques a pantalla completa, uno por vino, sobre `--ink`.
Cada uno: escena de fondo (`public/img/escenas/`), botella recortada
(`public/img/botellas/`), nombre, línea, cosecha, origen y descripción corta.

- La botella entra con `translateY` + `opacity`, 900 ms, `--ease`. Nada más.
- La escena hace **parallax interno**: contenedor con `overflow:hidden`, imagen
  al **112%** con `top:-8%`, y `translateY(calc((var(--pv) - .5) * -9%))`.
  Empezó en 130% / 17% y era demasiado: con esa caja el `object-fit: cover`
  recortaba tanto que se veía apenas el **69% del ancho** de la foto, la
  botella quedaba pegada al borde inferior y se perdía el piso. El overscan
  del parallax es zoom: cuanto más alto, menos escena se ve.
- `object-position: center 56%` baja el encuadre para que quede aire de piso
  debajo del pedestal. Los bloques van a `104vh`, no a `100vh`.
- En vertical el encuadre es otro: `object-position: center 78%` y el texto
  anclado arriba, porque si no la botella se le mete detrás a la tabla de datos.
  Ojo: sobre una foto sin detalle el parallax no se percibe aunque se mueva.
  Estas escenas tienen textura de piedra, así que sí se lee.

### El recorrido
**Malbec → Reserva → Gran Reserva → Syrah.** Los tres Malbec en ascenso —el
mismo viñedo, más crianza en cada paso, hasta Altamira— y el Syrah al final
porque es el que cambia de provincia y de variedad. El orden está en
`vinos.json` como `orden`, no en el markup.

El desvío **"Otro suelo, otra uva, otro LABERINTO"** presenta al Syrah como
desvío en vez de como cuarto de la lista. Y el Syrah **va sobre `--papel`**, con su render de
fondo claro: si el vino cambia de provincia y de variedad, que cambie de
mundo. El desvío y el bloque son **un solo momento claro** —sin costura entre
los dos— y el corte de color es el argumento, no una decoración.

El desvío es un mapa de Mendoza y San Juan con el recorrido dibujado:
Luján de Cuyo (Malbec, Reserva) → Valle de Uco (Gran Reserva) → Valle del
Zonda (Syrah). Arranca cuando la sección entra en pantalla, dura 4,8 s y cada
parada se nombra cuando el viajero pasa por ella. Con movimiento reducido
queda dibujado y quieto.

- **Las paradas van en su lugar real.** El mapa es una proyección
  equirectangular y las coordenadas salen de latitud y longitud; la fórmula
  está en el comentario del markup. Son los orígenes de las fichas: si cambia
  uno, cambia el mapa.
- **El texto es texto.** La lámina original traía titular, bajada y nombres
  de provincia en curvas. Pasaron a HTML y el SVG quedó en 31 KB.
- **Las etiquetas miden 11px a todos los anchos** y no pisan límites ni
  trazo. Por eso el mapa tiene un piso de 400px y se apila debajo del texto
  abajo de 900px.

Sobre ese muro el terracota de la etiqueta (`#c07d74`) da **1,91:1** y no
sirve para texto. El acento del bloque claro es `#7a3f37`, que da 4,73:1.
Medido, no elegido.

**El bloque claro no lleva degradado en horizontal.** Se le puso uno por
inercia —copiado de los bloques oscuros— y lo único que hacía era velar la
escena con una capa de papel encima de la botella. El muro del render ya es
claro: la tinta da **9,7:1 en su peor punto**, medido sobre el muro pelado.
En vertical sí va, porque ahí la botella queda debajo del texto.

Regla general: el degradado existe para que el texto se lea. Si el fondo ya
lo permite, sobra. Se verifica midiendo, no mirando.

`todos.webp` cierra la sección en oscuro con "Cuatro caminos. Un solo
laberinto." y devuelve el sitio al negro para lo que sigue.

### La alternancia de lados
Los cuatro textos NO van del mismo lado. Cada vino trae en `vinos.json` un
bloque `composicion` con `texto` (izquierda/derecha) y `tx` (cuánto correr la
escena en horizontal, en %). Los valores salen de medir el brillo por cuartos
de cada render y ubicar dónde empieza y termina el contenido.

**No espejar la imagen para cambiar de lado**: daría vuelta la etiqueta. Se
corre con `translateX`: Malbec +25% · Reserva +6% · Gran Reserva +4% · Syrah 0%.

Al correrla queda a la vista el canto de la foto. Va con una máscara
(`mask-image` con degradado al 9% de cada lado) que lo disuelve contra el
fondo de tinta, y `background: var(--ink)` en el contenedor. Sin eso se ve
una línea vertical recta donde termina la imagen.

### El índice (sección 2)
Sobre `--papel`, con las cuatro botellas recortadas y sus nombres, **en el
orden del recorrido**: Malbec, Reserva, Gran Reserva, Syrah.

**Es navegable.** Cada botella es un enlace al ancla de su vino (`ancla` en
`vinos.json`), con scroll suave y `behavior:'auto'` si el sistema pide
reduced-motion. Si es tocable tiene que parecerlo: la botella se levanta
10 px al pasar, el nombre se subraya, y arriba de cada uno dice VER. Un
elemento clickeable que no se anuncia no se toca. Cumple tres funciones: **es la navegación de la sección**, corta la racha de
negro, y muestra las cuatro etiquetas juntas, que es donde se lee que el sistema gráfico es un laberinto
por línea: circular los varietales, cuadrado el Reserva, triangular la
edición limitada. De a una eso no se percibe.

Las botellas van con `max-height`: los renders vienen a resolución completa y
sin tope la grilla los estira hasta comerse la sección.
- El color de acento de cada bloque es el de **su etiqueta medida**
  (`--et-malbec`, `--et-reserva`, `--et-gran`, `--et-syrah`).
- Sobre `--et-syrah` (#c07d74) **siempre tinta, nunca blanco**: blanco da
  2.7:1 y no pasa ningún estándar.

---

## 5. Fichas técnicas (sección 3) — fondo claro

La única sección donde el sitio se calla y muestra datos.
Tabla comparativa de los cuatro vinos con: varietal, cosecha, viñedo, altitud,
suelo, vendimia, vinificación, maceración, fermentaciones, crianza, guarda,
alcohol, acidez y azúcar. Fuente: `data/vinos.json`.

- Tipografía `--dato` (monoespaciada) para los números. Alineados a la derecha.
- Enlace de descarga al PDF de cada ficha (`public/fichas/`).
- **El Syrah no tiene ficha.** Su columna va con "—" explícitos, no vacía.
  Una celda vacía se lee como error; un guión se lee como dato faltante.

---

## 6. Origen (sección 4)

Dos viñedos, no uno, y eso es una historia:
- **Ugarteche, Luján de Cuyo** — 950 msnm. Varietal y Reserva.
- **Altamira, Valle de Uco** — 1200 msnm. Solo el Gran Reserva.

Altamira es un nombre que quien compra vino reconoce. Los mockups decían
"Mendoza" a secas: eso es menos preciso que la realidad y hay que corregirlo.

---

## 7. El pie (sección 6) — fondo oscuro

El pie **es** la conversión: no hay una sección "dónde conseguirlo" separada.
Después del cierre en oscuro de "Cuatro caminos", el pie sigue en `--ink` y el
recorrido termina donde empezó.

Contiene, en este orden:
1. **Escribinos** con WhatsApp como acción principal, en cuerpo grande.
2. La firma de marca: *La vida tiene LABERINTOS…*
3. Cuatro columnas: contacto · dónde estamos · seguinos · exportamos.
4. Los legales, y con ellos el crédito de estudio: **Diseño TRAMA**,
   enlazado a `tramaid.com.ar` con `target="_blank"` y `rel="noopener"`.
   Va en la misma línea y el mismo peso que los legales: firmar más fuerte
   que el cliente en su propio sitio es de mal gusto.

El laberinto en SVG va de marca de agua al 5,5% de opacidad, saliendo por el
borde derecho. Son 4,5 KB y es la única vez que el símbolo aparece solo, sin
botella: cierra el sitio con el mismo dibujo con el que abre.

**Pendiente:** verificar el código postal. "01423" no tiene formato argentino
válido para Belén de Escobar. Está marcado con un comentario en el markup.

La acción tiene que ser alcanzable desde la nav, no solo desde el final.

---

## 8. Reglas de movimiento del sitio entero

1. Animar **solo** `transform` y `opacity`.
2. **Nunca** `transition` en algo atado al scroll. La suavidad la da el scrub.
3. Lo continuo va sin transition; lo discreto va con transition.
4. Cada reveal ocurre **una sola vez** (`unobserve` después de disparar).
5. `prefers-reduced-motion` desde el primer commit, resuelto **dentro de
   `lib/motion.js`** y en ningún otro lado.
6. **Un solo `requestAnimationFrame`** para todo el sitio.
7. Cualquier ancestro con `overflow: hidden` mata el `sticky`. Es el 90% de
   los "no me funciona".
8. `will-change: transform` solo mientras el elemento anima, nunca permanente.

Tokens de movimiento: duración 900 ms · distancia 40 px · stagger 90 ms ·
easing `cubic-bezier(.16,1,.3,1)` para todo, incluidos los hovers.

---

## 9. Tipografía

- **Display**: la de la etiqueta es una máquina de escribir con carácter
  (tipo Special Elite / American Typewriter). Se usa para el logotipo y los
  títulos de vino. Con restricción: es una voz fuerte.
- **Texto**: condensada de palo seco para lectura.
- **Dato**: monoespaciada para números, fichas y labels.
- **Sin itálicas como acento** en ningún lugar del sitio. El énfasis se
  resuelve con peso, color o tracking.
- Sin `border-radius` y sin sombras: la marca es piedra tallada.

---

## 10. Datos — leer antes de construir

`data/vinos.json` es la **fuente única**. Los mockups no lo son.

Seis conflictos detectados, listados en `_conflictos` dentro del JSON.
Los dos que bloquean:

1. **Las cosechas no coinciden.** Etiquetas dicen 2022 / 2019 / 2019;
   fichas dicen 2024 / 2023 / 2022. Publicar la añada equivocada en un sitio
   de vino es un problema real. **Preguntar al cliente cuál está en venta
   antes de publicar.**
2. **El mockup en inglés tiene datos inventados**: dice "12 meses en roble"
   y "14.0% vol" para el Varietal Malbec. La ficha dice **sin roble** y 13,4%.

Menores: falta la ficha del Syrah; el suelo de Ugarteche suma 99%; las fichas
escriben la acidez como "6,6% g/L" y el signo de porcentaje sobra.

---

## 11. El prototipo

`PROTOTIPO.html` es el umbral y los cuatro vinos funcionando, autocontenido,
con las imágenes en base64. **No es el código de producción** —está todo en
un archivo— pero sí es la referencia de comportamiento: los tiempos, los
corrimientos y la alternancia salieron de ahí y están medidos.

Cuando algo del SPEC no se entienda, abrí el prototipo y miralo.

Lo que el prototipo todavía no tiene: fichas técnicas, origen, dónde
conseguirlo, pie. Y `public/img/escenas/todos.webp` está sin usar: es la foto
de familia, candidata a cerrar la sección de vinos o a abrir las fichas.

---

## 12. Legales (Argentina)

- "Beber con moderación. Prohibida su venta a menores de 18 años."
- Puerta de edad o, como mínimo, la leyenda visible en el pie.
- Sin promesas de salud ni de efectos del consumo.
