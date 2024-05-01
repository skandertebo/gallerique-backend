import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(1235, { namespace: 'websocket' })
export class WebSocketManagerGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients: Set<Socket> = new Set();

  handleConnection(client: Socket) {
    this.clients.add(client);
    this.server.emit('message', 'New client connected');
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, message: string) {
    client.emit('message', message);
    this.server.emit('message', message);
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client);
  }

  sendMessage(message: string) {
    this.server.emit('message', message);
  }

  sendAuctionBid(bid: string) {
    this.server.emit('auctionBid', bid);
  }
}
