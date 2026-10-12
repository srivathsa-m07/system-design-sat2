import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/scores',
  cors: { origin: '*' },
})
export class ScoresGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ScoresGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { matchId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `match-${data.matchId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { event: 'subscribed', data: { room } };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { matchId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `match-${data.matchId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { event: 'unsubscribed', data: { room } };
  }

  broadcastScoreUpdate(matchId: number, score: any) {
    const room = `match-${matchId}`;
    this.server.to(room).emit('scoreUpdate', {
      matchId,
      homeScore: score.homeScore,
      awayScore: score.awayScore,
      updatedAt: score.updatedAt,
    });
    this.logger.log(`Score update broadcast to room ${room}`);
  }
}
