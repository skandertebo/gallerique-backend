import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import Conversation from '../../chat/entities/conversation.entity';
import GenericEntity from '../../generic/generic.entity';
import User from '../../user/user.entity';
import { Bid } from './bid.entity';

export enum AuctionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING',
}

registerEnumType(AuctionStatus, { name: 'AuctionStatus' });

@ObjectType()
@Entity()
export class Auction extends GenericEntity {
  @Field()
  @Column()
  title!: string;

  @Field()
  @Column({ default: '' })
  image: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  startPrice!: number;

  @Field()
  @Column()
  currentPrice!: number;

  @Field()
  @Column()
  startDate!: string;

  @Field()
  @Column()
  endTime!: string;

  @Field()
  @Column({ default: AuctionStatus.PENDING, type: 'varchar' })
  status!: AuctionStatus;

  @Field(() => [Bid])
  @OneToMany(() => Bid, (bid) => bid.auction, { onDelete: 'CASCADE' })
  bids!: Bid[];

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.auctions)
  owner!: User;

  @Field(() => User)
  @ManyToOne(() => User)
  winner: User;

  @Field(() => [User])
  @ManyToMany(() => User)
  @JoinTable()
  members: User[];

  @Field(() => Conversation)
  @OneToOne(() => Conversation, (conv) => conv.auction)
  conversation: Conversation;
}
