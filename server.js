import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { initSocketIO } from './server/socket.js';
import authRoutes from './server/routes/authRoutes.js';
import postRoutes from './server/routes/postRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import messageRoutes from './server/routes/messageRoutes.js';
import notificationRoutes from './server/routes/notificationRoutes.js';
import { db } from './server/db.js';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

 
  initSocketIO(server);

 
  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      platform: 'Pulse Social Platform',
      stack: ['React', 'Node.js', 'Express.js', 'MongoDB Document Store', 'Socket.io', 'JWT', 'Axios'],
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/notifications', notificationRoutes);

  
  app.get('/api/architecture', (req, res) => {
    res.json({
      frameworks: {
        frontend: 'React 19 + TailwindCSS + Motion + Axios + Socket.io-client',
        backend: 'Node.js + Express.js + HTTP Server',
        database: 'MongoDB Document Engine (Embedded JSON Storage + Atlas / Mongoose Schema)',
        realtime: 'Socket.io WebSocket Server',
        authentication: 'JSON Web Token (JWT) + Bcrypt Password Hashing',
      },
      stats: db.getStats(),
    });
  });

  
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Pulse Social Server running at http://0.0.0.0:${PORT}`);
    
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
