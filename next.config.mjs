/** Export estático: el sitio se sirve como archivos, sin servidor. */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },   // obligatorio con output:'export'
  trailingSlash: true,
  // En una URL de proyecto de GitHub Pages (usuario.github.io/laberintos) el
  // sitio NO vive en la raíz. Sin basePath, todos los assets dan 404.
  // Con dominio propio, dejar las dos líneas comentadas.
  // basePath: '/laberintos',
  // assetPrefix: '/laberintos/',
};
export default nextConfig;
