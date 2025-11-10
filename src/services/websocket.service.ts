import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { TokenData, WebSocketUpdate } from '../types';
import aggregationService from './aggregation.service';
import logger from '../utils/logger';
import { config } from '../config';

export class WebSocketService {
  private io: SocketIOServer | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private previousTokenData: Map<string, TokenData> = new Map();

  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
    this.startPeriodicUpdates();

    logger.info('WebSocket service initialized');
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('subscribe', (data: { tokens?: string[] }) => {
        if (data.tokens && data.tokens.length > 0) {
          socket.join('token-updates');
          logger.debug(`Client ${socket.id} subscribed to token updates`);
        }
      });

      socket.on('unsubscribe', () => {
        socket.leave('token-updates');
        logger.debug(`Client ${socket.id} unsubscribed from token updates`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });

      // Send initial data
      this.sendInitialData(socket);
    });
  }

  private async sendInitialData(socket: Socket): Promise<void> {
    try {
      const tokens = await aggregationService.aggregateTokenData();
      socket.emit('initial_data', {
        type: 'initial_data',
        data: tokens.slice(0, 30),
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error sending initial data:', error);
    }
  }

  private startPeriodicUpdates(): void {
    this.updateInterval = setInterval(async () => {
      await this.checkAndBroadcastUpdates();
    }, config.websocket.updateInterval);

    logger.info(`Periodic updates started (interval: ${config.websocket.updateInterval}ms)`);
  }

  private async checkAndBroadcastUpdates(): Promise<void> {
    try {
      const currentTokens = await aggregationService.aggregateTokenData();
      
      const updates: TokenData[] = [];
      const volumeSpikes: TokenData[] = [];

      for (const token of currentTokens) {
        const previous = this.previousTokenData.get(token.token_address);

        if (!previous) {
          this.previousTokenData.set(token.token_address, token);
          continue;
        }

        // Check for price changes
        const priceChangePct = Math.abs(
          ((token.price_sol - previous.price_sol) / previous.price_sol) * 100
        );

        if (priceChangePct > 1) {
          updates.push(token);
        }

        // Check for volume spikes (>50% increase)
        const volumeIncrease = 
          ((token.volume_sol - previous.volume_sol) / previous.volume_sol) * 100;

        if (volumeIncrease > 50) {
          volumeSpikes.push(token);
        }

        this.previousTokenData.set(token.token_address, token);
      }

      // Broadcast price updates
      if (updates.length > 0) {
        this.broadcast({
          type: 'price_update',
          data: updates,
          timestamp: Date.now(),
        });
        logger.debug(`Broadcasted ${updates.length} price updates`);
      }

      // Broadcast volume spikes
      if (volumeSpikes.length > 0) {
        this.broadcast({
          type: 'volume_spike',
          data: volumeSpikes,
          timestamp: Date.now(),
        });
        logger.debug(`Broadcasted ${volumeSpikes.length} volume spikes`);
      }
    } catch (error) {
      logger.error('Error checking for updates:', error);
    }
  }

  private broadcast(update: WebSocketUpdate): void {
    if (this.io) {
      this.io.to('token-updates').emit('update', update);
      this.io.emit('update', update); // Also broadcast to all connected clients
    }
  }

  broadcastNewTokens(tokens: TokenData[]): void {
    this.broadcast({
      type: 'new_token',
      data: tokens,
      timestamp: Date.now(),
    });
  }

  getConnectedClients(): number {
    return this.io?.sockets.sockets.size || 0;
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.io) {
      this.io.close();
      this.io = null;
    }

    logger.info('WebSocket service stopped');
  }
}

export default new WebSocketService();
