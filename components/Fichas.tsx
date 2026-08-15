import type { Vino } from '../lib/tipos';

/* SECCIÓN 3 — FICHAS TÉCNICAS · FONDO CLARO
   La única sección donde el sitio se calla y muestra datos.
   El Syrah no tiene ficha: sus celdas van con "—" explícito.
   Una celda vacía se lee como error; un guión se lee como dato faltante. */
const FILAS: [string, (v: Vino) => string | number | null][] = [
  ['Varietal', v => v.varietal],
  ['Cosecha', v => v.cosecha],
  ['Viñedo', v => v.vinedo],
  ['Altitud', v => v.altitud_msnm ? `${v.altitud_msnm} msnm` : null],
  ['Suelo', v => v.suelo],
  ['Vendimia', v => v.vendimia],
  ['Vinificación', v => v.vinificacion],
  ['Maceración', v => v.maceracion],
  ['Ferm. alcohólica', v => v.fermentacion_alcoholica],
  ['Ferm. maloláctica', v => v.fermentacion_malolactica],
  ['Crianza en roble', v => v.crianza_roble ?? 'Sin roble'],
  ['Guarda en botella', v => v.guarda_botella_meses ? `${v.guarda_botella_meses} meses` : null],
  ['Guarda recomendada', v => v.guarda_recomendada_anios ? `${v.guarda_recomendada_anios} años` : null],
  ['Alcohol', v => v.alcohol ? `${v.alcohol}%` : null],
  ['Acidez total', v => v.acidez_total ? `${v.acidez_total} g/L` : null],
  ['Acidez volátil', v => v.acidez_volatil ? `${v.acidez_volatil} g/L` : null],
  ['Azúcar', v => v.azucar ? `${v.azucar} g/L` : null],
];

export default function Fichas({ vinos }: { vinos: Vino[] }) {
  return (
    <section id="fichas" className="claro seccion" aria-label="Fichas técnicas">
      <div className="canal">
        <p className="etiqueta muted">Ficha técnica</p>
        <h2>Los números.</h2>
        <table className="fichas">
          <thead>
            <tr><th /> {vinos.map(v => <th key={v.id}>{v.nombre}</th>)}</tr>
          </thead>
          <tbody>
            {FILAS.map(([label, get]) => (
              <tr key={label}>
                <th scope="row" className="etiqueta muted">{label}</th>
                {vinos.map(v => <td key={v.id}>{get(v) ?? '—'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {/* TODO: enlaces de descarga a public/fichas/ por vino */}
      </div>
    </section>
  );
}
