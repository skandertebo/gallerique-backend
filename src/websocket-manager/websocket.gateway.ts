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
import { BidService } from 'src/auction/bid.service';
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
@WebSocketGateway({ namespace: 'websocket', cors: true })
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
    private readonly bidService: BidService,
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
                conversation.auction.id,
                user.id,
              );
              const isSender = message.sender?.id === user.id;
              return isMember || isSender;
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
          client.emit(message.scope, message);
        });
      const bidSubscription = this.bidService.observable
        .pipe(
          filterByPromise(async (v) => {
            const auction = v.payload.auction;
            if (!auction) return false;
            const isMember = await this.auctionService.hasUserJoinedAuction(
              auction.id,
              user.id,
            );
            return isMember;
          }),
        )
        .subscribe((bid) => {
          client.emit('auction.bid.send', bid);
        });

      const auctionSubscription = this.auctionService.observable
        .pipe(
          filterByPromise(async (v) => {
            const auction = v.payload;
            if (!auction) return false;
            const isMember = await this.auctionService.hasUserJoinedAuction(
              auction.id,
              user.id,
            );
            return isMember;
          }),
        )
        .subscribe((auction) => {
          client.emit(auction.scope, auction);
        });
      this.clients.add({
        socket: client,
        userId: user.id,
        observableSubscriptions: [
          subscription,
          bidSubscription,
          auctionSubscription,
        ],
      });
    } catch (e) {
      client.disconnect();
    }
  }

  @SubscribeMessage('auction.bid.send')
  async bid(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    stringifiedBid: string,
  ) {
    const payload = JSON.parse(stringifiedBid) as {
      auctionId: number;
      price: number;
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
    } else if (!payload.price) {
      client.emit(
        'error',
        JSON.stringify({
          requestId: payload.requestId,
          message: 'Price not provided',
        }),
      );
    }
    const user = Array.from(this.clients).find((c) => c.socket.id == client.id);
    if (!user) {
      return;
    }
    const auction = await this.auctionService.findOne(payload.auctionId);
    const userObj = await this.userService.findOne(user.userId);
    const doesUserBelongToAuction =
      await this.auctionService.hasUserJoinedAuction(auction.id, userObj.id);
    if (!doesUserBelongToAuction) {
      client.emit(
        'error',
        JSON.stringify({
          requestId: payload.requestId,
          message: 'User does not belong to this auction',
        }),
      );
      return;
    }
    const bid = await this.bidService.bid(
      {
        price: payload.price,
        auctionId: payload.auctionId,
      },
      userObj,
    );
    auction.currentPrice = bid.price;
    bid.auction = auction;
    this.bidService.emit({
      scope: 'auction.bid.send',
      payload: bid,
      requestId: payload.requestId,
    });
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
    conversation.auction = { id: payload.auctionId, ...conversation.auction };
    message.conversation = conversation;
    this.messageService.emit({
      scope: 'auction.message.send',
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
