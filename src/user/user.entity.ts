import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import GenericEntity from '../generic/generic.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import Conversation from '../chat/entities/conversation.entity';
import { Auction } from '../auction/entities/auction.entity';
import { Bid } from '../bid/entities/bid.entity';

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
  lastName: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  address: string;

  @Field()
  @Column({ default: UserStatus.UNVERIFIED, type: 'int' })
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
}
