import '../styles/globals.css';

export const metadata = {
  title: 'Laberintos — Vinos',
  description: 'No todos los caminos buscan una salida. Malbec y Syrah de Mendoza y San Juan.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
