import express, { Request, Response } from 'express';
import path from 'path';
import app from './backend/app.js';

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// File chạy trên máy cá nhân / VPS. Trên Vercel dùng api/index.ts thay thế.
async function startServer() {
  if (!isProduction) {
    // In dev: mount Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve dist
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🌸 Wedding Invitation Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
