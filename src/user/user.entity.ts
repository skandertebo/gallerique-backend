import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, JoinTable, ManyToMany } from 'typeorm';
import Conversation from '../chat/entities/conversation.entity';
import GenericEntity from '../generic/generic.entity';
import { Auction } from '../auction/entities/auction.entity';
import { Bid } from '../auction/entities/bid.entity';
import { Notification } from '../notifications/entities/notification.entity';
import Payment from '../payment/payment.entity';
export enum UserStatus {
  UNVERIFIED,
  VERIFIED,
}

@ObjectType()
@Entity()
@ObjectType()
export default class User extends GenericEntity {
  @Column()
  @Field()
  firstName: string;

  @Field()
  @Column()
  @Field()
  lastName: string;

  @Field()
  @Column()
  @Field()
  email: string;

  @Field()
  @Column()
  @Field()
  address: string;

  @Field()
  @Column({ default: UserStatus.UNVERIFIED, type: 'int' })
  @Field()
  status: UserStatus;

  @ManyToMany(() => Conversation, (conversation) => conversation.users)
  @JoinTable()
  @Field(() => [Conversation], { nullable: true })
  conversations: Conversation[];

  @ManyToMany(() => Notification, (notification) => notification.users)
  @Field(() => [Notification], { nullable: true })
  notifications: Notification[];

  @Column()
  password: string;

  @Field()
  @Column({ default: 0 })
  credit: number;

  @OneToMany(() => Payment, (payment) => payment.user)
  @Field(() => [Payment], { nullable: true })
  payments: Payment[];

  @Field(() => [Auction], { nullable: true })
  @OneToMany(() => Auction, (auction) => auction.owner)
  auctions: Auction[];

  @Field(() => [Bid], { nullable: true })
  @OneToMany(() => Bid, (bid) => bid.owner)
  bids: Bid[];

  @Field(() => [Auction])
  @OneToMany(() => Auction, (auction) => auction.winner)
  wonAuctions: Auction[];

  @Field(() => [Auction])
  @ManyToMany(() => Auction, (auction) => auction.members)
  auctionsParticipated: Auction[];
}
