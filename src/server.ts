import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import { config } from './config';
import routes from './routes';
import websocketService from './services/websocket.service';
import cacheService from './services/cache.service';
import logger from './utils/logger';

class Server {
  private app: Application;
  private httpServer: http.Server;

  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
    this.initializeServices();
  }

  private setupMiddlewares(): void {
    // CORS
    this.app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    }));

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
      });
      next();
    });
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Root route
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Meme Coin Aggregator API',
        version: '1.0.0',
        endpoints: {
          tokens: '/api/tokens',
          health: '/api/health',
          metrics: '/api/metrics',
          websocket: 'ws://localhost:' + config.port,
        },
        documentation: '/api/docs',
      });
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        timestamp: Date.now(),
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error('Unhandled error:', err);
      
      res.status(500).json({
        success: false,
        error: config.nodeEnv === 'development' ? err.message : 'Internal server error',
        timestamp: Date.now(),
      });
    });
  }

  private initializeServices(): void {
    // Initialize WebSocket
    websocketService.initialize(this.httpServer);

    // Wait for Redis to connect
    setTimeout(() => {
      if (!cacheService.isReady()) {
        logger.warn('Redis not connected, running without cache');
      }
    }, 2000);
  }

  public start(): void {
    this.httpServer.listen(config.port, () => {
      logger.info(`
╔═══════════════════════════════════════════════════╗
║  Meme Coin Aggregator Service                     ║
║  Port: ${config.port}                                      ║
║  Environment: ${config.nodeEnv}                       ║
║  WebSocket: Enabled                               ║
║  Cache TTL: ${config.redis.cacheTTL}s                             ║
╚═══════════════════════════════════════════════════╝
      `);
      logger.info('Server is running and ready to accept connections');
    });
  }

  public async stop(): Promise<void> {
    logger.info('Shutting down server...');
    
    websocketService.stop();
    await cacheService.disconnect();
    
    return new Promise((resolve) => {
      this.httpServer.close(() => {
        logger.info('Server stopped successfully');
        resolve();
      });
    });
  }
}

// Create and start server
const server = new Server();
server.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received');
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received');
  await server.stop();
  process.exit(0);
});

export default server;
