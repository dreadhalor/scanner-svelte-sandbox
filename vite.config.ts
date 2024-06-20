import { ConfigEnv, defineConfig, ViteDevServer, UserConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import dotenv from 'dotenv';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import mkcert from 'vite-plugin-mkcert';

dotenv.config();

interface VitePluginScanditOptions {
  licenseKey: string;
  licenseKeyPlaceholder: string;
}

function scandit(options: VitePluginScanditOptions) {
  let config: ConfigEnv;

  function setupDevServer(server: ViteDevServer): void {
    server.config.preview.port = 8888;
    server.config.server.port = 8888;
    server.middlewares.use((_req: any, res: any, next: any) => {
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      next();
    });
  }

  return {
    name: 'vite-plugin-scandit',
    configResolved(resolvedConfig: ConfigEnv) {
      config = resolvedConfig;
    },
    transform(code: string) {
      const shouldReplaceLicenseKey =
        config.command === 'serve' || !process.env.SKIP_LICENSE_KEY_REPLACEMENT;
      if (shouldReplaceLicenseKey) {
        return {
          code: code.replace(options.licenseKeyPlaceholder, options.licenseKey),
        };
      }
    },
    configureServer: setupDevServer,
  };
}

export default defineConfig({
  base: './',
  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].[ext]',
        entryFileNames: '[name].js',
      },
    },
  },
  envPrefix: 'SCANDIT',
  plugins: [
    svelte(),
    mkcert(),
    viteStaticCopy({
      targets: ['core', 'barcode'].map((module) => ({
        src: `./node_modules/scandit-web-datacapture-${module}/build/engine/*`,
        dest: './library/engine',
      })),
    }),
    scandit({
      licenseKey: process.env.SCANDIT_LICENSE_KEY ?? '',
      licenseKeyPlaceholder: '-- ENTER YOUR SCANDIT LICENSE KEY HERE --',
    }),
  ],
} as UserConfig);
