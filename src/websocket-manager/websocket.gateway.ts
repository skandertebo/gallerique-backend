import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Subscription, filter } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { ConversationService } from 'src/chat/conversation.service';
import { UserService } from 'src/user/user.service';

interface WebsocketClient {
  socket: Socket;
  userId: number;
  observableSubscriptions: Subscription[];
}
@WebSocketGateway(1235, { namespace: 'websocket' })
export class WebSocketManagerGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly conversationService: ConversationService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  private clients: Set<WebsocketClient> = new Set();

  handleConnection(client: Socket) {
    const userId = 1; // Assuming you have a way to get the user ID
    const subscription = this.conversationService.observable
      .pipe(
        filter(
          (message) => !!message.payload.users.find((u) => u.id == userId),
        ),
      )
      .subscribe((message) => {
        client.emit('message', message);
      });

    client.on('message', async (message) => {
      const authToken = message.authToken;
      if (!authToken) {
        client.disconnect();
      }
      try {
        const res = await this.jwtService.verifyAsync(authToken);
        if (!res) {
          client.disconnect();
          return;
        }
        const user = await this.userService.findOne(res.sub);
        if (!user) {
          client.disconnect();
          return;
        }
        this.clients.add({
          socket: client,
          userId: user.id,
          observableSubscriptions: [subscription],
        });
      } catch (e) {
        client.disconnect();
      }
    });
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
