import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LEGACY_DIRS = [
  'F20', 'S20', 'F21', 'S21', 'F22', 'S22',
  'F23', 'S23', 'F24', 'S24', 'F25', 'S25',
  'S26', 'shared', 'exp', 'exp-updated'
];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.mp3': 'audio/mpeg',
  '.ipynb': 'application/x-ipynb+json',
  '.zip': 'application/zip',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function copyIncremental(srcDir, destDir, excludeFiles = []) {
  if (!fs.existsSync(srcDir)) return;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (excludeFiles.includes(entry.name)) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyIncremental(srcPath, destPath, []);
    } else {
      let needsCopy = true;
      if (fs.existsSync(destPath)) {
        try {
          const srcStat = fs.statSync(srcPath);
          const destStat = fs.statSync(destPath);
          if (srcStat.size === destStat.size && Math.abs(srcStat.mtimeMs - destStat.mtimeMs) < 1000) {
            needsCopy = false;
          }
        } catch (_) {}
      }
      if (needsCopy) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

function legacySemestersIntegration() {
  return {
    name: 'cmu-legacy-semesters',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'serve-legacy-static',
                configureServer(server) {
                  server.middlewares.use((req, res, next) => {
                    const url = req.url ? decodeURIComponent(req.url.split('?')[0]) : '';
                    if (
                      url.startsWith('/shared/') ||
                      url.match(/^\/[FS]\d\d\//)
                    ) {
                      // Do not intercept Astro routes
                      if (url === '/F26/' || url === '/F26/index.html') {
                        return next();
                      }
                      const localPath = path.join(process.cwd(), url.replace(/^\//, ''));
                      if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
                        const ext = path.extname(localPath).toLowerCase();
                        if (MIME_TYPES[ext]) {
                          res.setHeader('Content-Type', MIME_TYPES[ext]);
                        }
                        return fs.createReadStream(localPath).pipe(res);
                      }
                    }
                    next();
                  });
                },
              },
            ],
          },
        });
      },
      'astro:build:done': async ({ dir }) => {
        const outDir = fileURLToPath(dir);
        console.log('[legacy-semesters] Syncing historical semesters and assets to:', outDir);

        const contentSemestersDir = path.join(process.cwd(), 'content', 'semesters');
        const compiledSemesters = fs.existsSync(contentSemestersDir)
          ? fs.readdirSync(contentSemestersDir).filter((f) => fs.statSync(path.join(contentSemestersDir, f)).isDirectory())
          : [];

        // Copy legacy directories and assets
        for (const sem of LEGACY_DIRS) {
          const src = path.join(process.cwd(), sem);
          const dest = path.join(outDir, sem);
          const excludes = compiledSemesters.includes(sem) ? ['index.html'] : [];
          copyIncremental(src, dest, excludes);
        }

        // Copy static assets for any compiled semester (e.g. F26) without overwriting Astro index.html
        for (const sem of compiledSemesters) {
          const src = path.join(process.cwd(), sem);
          const dest = path.join(outDir, sem);
          copyIncremental(src, dest, ['index.html']);
        }

        console.log('[legacy-semesters] Sync complete.');
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://deeplearning.cs.cmu.edu',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  integrations: [legacySemestersIntegration()]
});
