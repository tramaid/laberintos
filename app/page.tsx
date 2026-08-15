import vinos from '../data/vinos.json';
import Umbral from '../components/Umbral';
import Vinos from '../components/Vinos';
import Fichas from '../components/Fichas';
import Origen from '../components/Origen';
import Donde from '../components/Donde';
import Pie from '../components/Pie';

/* El orden de las secciones ES la alternancia de fondos.
   Oscuro = el mundo · claro = el dato. Ver SPEC §2. */
export default function Page() {
  return (
    <main>
      <Umbral />                    {/* oscuro */}
      <Vinos vinos={vinos.vinos} /> {/* oscuro */}
      <Fichas vinos={vinos.vinos} />{/* CLARO  */}
      <Origen />                    {/* oscuro */}
      <Donde />                     {/* CLARO  */}
      <Pie />                       {/* oscuro */}
    </main>
  );
}
