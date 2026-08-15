/* SECCIÓN 5 — DÓNDE CONSEGUIRLO · FONDO CLARO
   La conversión. Nunca se esconde al final: tiene que ser alcanzable
   desde la navegación. */
export default function Donde() {
  return (
    <section id="donde" className="claro seccion" aria-label="Dónde conseguirlo">
      <div className="canal">
        <p className="etiqueta muted">Encontralo</p>
        <h2>Escribinos.</h2>
        {/* TODO: WhatsApp (acción principal), punto de venta, exportación */}
        {/* PENDIENTE: verificar el código postal. "01423" no tiene formato argentino */}
      </div>
    </section>
  );
}
