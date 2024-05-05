import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Subscription, filter } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { MessageService } from 'src/chat/message.service';
import { UserService } from 'src/user/user.service';

interface WebsocketClient {
  socket: Socket;
  userId: number;
  observableSubscriptions: Subscription[];
}
@WebSocketGateway({ namespace: 'websocket' })
export class WebSocketManagerGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  private clients: Set<WebsocketClient> = new Set();

  async handleConnection(client: Socket) {
    const authToken = client.handshake.headers.authorization;
    if (!authToken) {
      client.disconnect();
    }
    try {
      const res = await this.authService.validateToken(authToken);
      if (!res) {
        client.disconnect();
        return;
      }
      const user = await this.userService.findOne(res.sub);
      if (!user) {
        client.disconnect();
        return;
      }
      const subscription = this.messageService.observable
        .pipe(
          filter(
            (message) =>
              !!message.payload.conversation.users.find((u) => u.id == user.id),
          ),
        )
        .subscribe((message) => {
          client.emit('message', message);
        });
      this.clients.add({
        socket: client,
        userId: user.id,
        observableSubscriptions: [subscription],
      });
    } catch (e) {
      client.disconnect();
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, message: string) {
    client.emit('message', message);
    this.server.emit('message', message);
  }

  handleDisconnect(client: Socket) {
    const clientToRemove = Array.from(this.clients).find(
      (c) => c.socket == client,
    );
    if (!clientToRemove) {
      return;
    }
    clientToRemove.observableSubscriptions.forEach((sub) => sub.unsubscribe());
    this.clients.delete(clientToRemove);
  }

  sendMessage(message: string) {
    this.server.emit('message', message);
  }

  sendAuctionBid(bid: string) {
    this.server.emit('auctionBid', bid);
  }
}