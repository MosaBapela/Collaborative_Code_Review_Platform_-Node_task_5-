import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { verifyToken } from './jwt';

interface WSClient extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<number, Set<WSClient>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.init();
  }

  private init() {
    this.wss.on('connection', (ws: WSClient, req) => {
      const token = new URL(req.url!, `http://${req.headers.host}`).searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'Token required');
        return;
      }

      try {
        const payload = verifyToken(token);
        ws.userId = payload.id;
        ws.isAlive = true;

        if (!this.clients.has(payload.id)) {
          this.clients.set(payload.id, new Set());
        }
        this.clients.get(payload.id)!.add(ws);

        ws.on('pong', () => { ws.isAlive = true; });
        ws.on('close', () => {
          if (ws.userId) {
            this.clients.get(ws.userId)?.delete(ws);
          }
        });

      } catch (err) {
        ws.close(1008, 'Invalid token');
      }
    });

    setInterval(() => {
      this.wss.clients.forEach((ws: WSClient) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  sendToUser(userId: number, data: any) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const message = JSON.stringify(data);
      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  broadcast(data: any) {
    const message = JSON.stringify(data);
    this.wss.clients.forEach((client: WSClient) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}