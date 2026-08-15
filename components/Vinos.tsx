'use client';
import type { Vino } from '../lib/tipos';

/* SECCIÓN 2 — LOS VINOS · fondo oscuro
   Cuatro bloques a pantalla completa. Escena de fondo con parallax interno,
   botella recortada, y el acento de la etiqueta MEDIDA de cada vino.

   OJO con el Syrah: sobre #c07d74 siempre tinta, nunca blanco (2.7:1). */
const ACENTO: Record<string, string> = {
  'varietal-malbec': 'var(--et-malbec)',
  'varietal-syrah': 'var(--et-syrah)',
  'reserva-malbec': 'var(--et-reserva)',
  'gran-reserva-malbec': 'var(--et-gran)',
};

export default function Vinos({ vinos }: { vinos: Vino[] }) {
  return (
    <section id="vinos" aria-label="Los vinos">
      {vinos.map(v => (
        <article key={v.id} className="vino" style={{ ['--acento' as string]: ACENTO[v.id] }}>
          <div className="vino__escena">
            {/* TODO parallax interno: img al 130%, translateY((--pv - .5) * -17%) */}
            <img src={`/img/escenas/${v.imagen_escena}`} alt="" loading="lazy" />
          </div>
          <div className="canal vino__texto">
            <p className="etiqueta" style={{ color: 'var(--acento)' }}>{v.linea}</p>
            <h2>{v.nombre}</h2>
            {v.descripcion && <p className="muted">{v.descripcion}</p>}
            <dl className="vino__datos">
              <dt className="etiqueta">Cosecha</dt><dd>{v.cosecha ?? '—'}</dd>
              <dt className="etiqueta">Origen</dt><dd>{v.vinedo ?? '—'}</dd>
              {v.crianza_roble && (<><dt className="etiqueta">Crianza</dt><dd>{v.crianza_roble}</dd></>)}
            </dl>
          </div>
          <img className="vino__botella" src={`/img/botellas/${v.imagen_botella}`}
               alt={`Botella ${v.nombre}`} loading="lazy" />
        </article>
      ))}
    </section>
  );
}
