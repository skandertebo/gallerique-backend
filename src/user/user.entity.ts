import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, JoinTable, ManyToMany } from 'typeorm';
import Conversation from '../chat/entities/conversation.entity';
import GenericEntity from '../generic/generic.entity';
import { Auction } from '../auction/entities/auction.entity';
import { Bid } from '../auction/entities/bid.entity';

export enum UserStatus {
  UNVERIFIED = 0,
  VERIFIED = 1,
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

  @Column()
  password: string;

  @Field()
  @Column({ default: 0 })
  credit: number;

  @Field(() => [Auction], { nullable: true })
  @OneToMany(() => Auction, (auction) => auction.owner)
  auctions: Auction[];

  @Field(() => [Bid], { nullable: true })
  @OneToMany(() => Bid, (bid) => bid.owner)
  bids: Bid[];

  @Field(() => [Auction])
  @OneToMany(() => Auction, (auction) => auction.winner)
  wonAuctions: Auction[];
}
