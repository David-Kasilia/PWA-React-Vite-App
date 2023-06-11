import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import { generateSW } from "workbox-build";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "none",
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "assets",
              expiration: {
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
            },
          },
          {
            urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "fonts",
              expiration: {
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/api.example.com/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api",
              expiration: {
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
          {
            urlPattern: /^https:\/\/cdn.example.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "cdn",
              expiration: {
                maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
              },
            },
          },
          {
            urlPattern: /\/api\/data/,
            handler: "NetworkOnly",
            options: {
              cacheName: "dynamic-api",
            },
          },
          // Add more caching strategies as needed
        ],
      },
      injectRegister: false,
      injectManifest: false,
      customInjectManifestGenerator: async (manifestEntries) => {
        const { count, size } = await generateSW({
          swDest: "dist/service-worker.js",
          globDirectory: "dist",
          globPatterns: ["**/*.{html,js,css,json}"],
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          additionalManifestEntries: manifestEntries,
        });

        console.log(
          `Generated service worker with ${count} files, totaling ${size} bytes.`
        );
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "[name]-[hash][extname]",
      },
    },
  },
  server: {
    middleware: [
      (req, res, next) => {
        if (req.url.endsWith(".js") || req.url.endsWith(".css")) {
          res.setHeader("Cache-Control", "public, max-age=31536000");
        } else if (
          req.url.endsWith(".png") ||
          req.url.endsWith(".jpg") ||
          req.url.endsWith(".jpeg") ||
          req.url.endsWith(".gif") ||
          req.url.endsWith(".svg")
        ) {
          res.setHeader("Cache-Control", "public, max-age=31536000");
        }
        next();
      },
    ],
  },
});
