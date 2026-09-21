import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Historical semesters live under archive/ — they are read-only.
// Their assets are copied verbatim into dist/ at build time.
// Active semester content (F26, future semesters) lives in content/semesters/
// and is compiled by Astro through src/pages/[semester]/index.astro.
const ARCHIVE_DIRS = [
  'F20', 'S20', 'F21', 'S21', 'F22', 'S22',
  'F23', 'S23', 'F24', 'S24', 'F25', 'S25',
  'S26', 'shared',
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (!fs.existsSync(d)) {
      fs.copyFileSync(s, d);
    } else {
      const ss = fs.statSync(s);
      const ds = fs.statSync(d);
      if (ss.size !== ds.size || Math.abs(ss.mtimeMs - ds.mtimeMs) >= 1000) {
        fs.copyFileSync(s, d);
      }
    }
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.mp3': 'audio/mpeg',
};

function serveStaticFile(res, file) {
  const ext = path.extname(file).toLowerCase();
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
}

// First URL segment(s) served from archive/ or F26/ during `astro dev`.
// (The build-time copy step above only runs on `astro:build:done`.)
const DEV_STATIC_ROOTS = [...ARCHIVE_DIRS, 'F26'];

function resolveDevFile(urlPath) {
  const clean = urlPath.split('?')[0].split('#')[0];
  let decoded;
  try {
    decoded = decodeURIComponent(clean);
  } catch {
    return null;
  }
  const segments = decoded.replace(/^\/+/, '').split('/');
  if (segments.length === 0 || !DEV_STATIC_ROOTS.includes(segments[0])) return null;
  const [root, ...rest] = segments;
  if (rest.length === 0) return null; // Astro owns directory indexes
  const base = root === 'F26' ? path.join(process.cwd(), 'F26') : path.join(process.cwd(), 'archive', root);
  const file = path.join(base, ...rest);
  const relative = path.relative(base, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  try {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  } catch {
    return null;
  }
  return null;
}

function archiveIntegration() {
  return {
    name: 'cmu-archive',
    hooks: {
      'astro:server:setup': async ({ server }) => {
        server.middlewares.use((req, res, next) => {
          if (!req.url || (req.method !== 'GET' && req.method !== 'HEAD')) {
            next();
            return;
          }
          const file = resolveDevFile(req.url);
          if (!file) {
            next();
            return;
          }
          serveStaticFile(res, file);
        });
      },
      'astro:build:done': async ({ dir }) => {
        const outDir = fileURLToPath(dir);
        const archiveRoot = path.join(process.cwd(), 'archive');
        console.log('[archive] Copying historical semesters to:', outDir);
        for (const sem of ARCHIVE_DIRS) {
          copyDir(path.join(archiveRoot, sem), path.join(outDir, sem));
        }
        // Copy F26 assets (PDFs, slides, images) without overwriting Astro-generated index.html
        const f26src = path.join(process.cwd(), 'F26');
        const f26dest = path.join(outDir, 'F26');
        if (fs.existsSync(f26src)) {
          fs.mkdirSync(f26dest, { recursive: true });
          for (const entry of fs.readdirSync(f26src, { withFileTypes: true })) {
            if (entry.name === 'index.html') continue; // Astro owns this
            const s = path.join(f26src, entry.name);
            const d = path.join(f26dest, entry.name);
            entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
          }
        }
        console.log('[archive] Copy complete.');
      },
    },
  };
}

export default defineConfig({
  site: 'https://deeplearning.cs.cmu.edu',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [archiveIntegration()],
});
