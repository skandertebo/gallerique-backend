import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { filterByPromise } from 'filter-async-rxjs-pipe';
import { Subscription } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { AuctionService } from 'src/auction/auction.service';
import { AuthService } from 'src/auth/auth.service';
import { ConversationService } from 'src/chat/conversation.service';
import { ConversationType } from 'src/chat/entities/conversation.entity';
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
    private readonly auctionService: AuctionService,
    private readonly conversationService: ConversationService,
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
          filterByPromise(async (v) => {
            const message = v.payload;
            const conversation = message?.conversation;
            if (!conversation) return false;
            if (conversation?.type === ConversationType.AUCTION) {
              if (!conversation.auction) return false;
              const isMember = await this.auctionService.hasUserJoinedAuction(
                user.id,
                conversation.auction.id,
              );
              return isMember;
            } else {
              const conversationMembers =
                await this.conversationService.getUsers(conversation.id);
              return conversationMembers.some(
                (member) => member.id === user.id,
              );
            }
          }),
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

  @SubscribeMessage('auction.message.send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    stringifiedMessage: string,
  ) {
    const payload = JSON.parse(stringifiedMessage) as {
      auctionId: number;
      content: string;
      requestId: string;
    };
    if (!payload.auctionId) {
      client.emit(
        'error',
        JSON.stringify({
          requestId: payload.requestId,
          message: 'auctionId not provided',
        }),
      );
    } else if (!payload.content) {
      client.emit(
        'error',
        JSON.stringify({
          requestId: payload.requestId,
          message: 'content not provided',
        }),
      );
    }
    const user = Array.from(this.clients).find((c) => c.socket.id == client.id);
    if (!user) {
      return;
    }
    const conversation = await this.conversationService.findByAuction(
      payload.auctionId,
    );
    const userObj = await this.userService.findOne(user.userId);
    const message = await this.messageService.createMessage(
      {
        content: payload.content,
        conversationId: conversation.id,
      },
      userObj,
    );
    this.messageService.emit({
      scope: 'message',
      payload: message,
      requestId: payload.requestId,
    });
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
