import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const requestedPort = Number(process.env.PORT);
const previewPort = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : 4173;

function productionCspPlugin() {
  return {
    name: 'production-csp',
    apply: 'build' as const,
    transformIndexHtml(html: string) {
      const csp =
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com https://air-quality-api.open-meteo.com https://api.open-meteo.com; object-src 'none'; base-uri 'self'; form-action 'self';";
      return html.replace(
        '</head>',
        `    <meta http-equiv="Content-Security-Policy" content="${csp}" />\n  </head>`
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), productionCspPlugin()],
  preview: {
    host: '0.0.0.0',
    port: previewPort,
    strictPort: false,
    allowedHosts: true,
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor-icons',
              test: /node_modules[\\/]lucide-react[\\/]/,
              priority: 15,
            },
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
