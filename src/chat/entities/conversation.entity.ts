import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Auction } from '../../auction/entities/auction.entity';
import GenericEntity from '../../generic/generic.entity';
import User from '../../user/user.entity';
import Message from './message.entity';

export enum ConversationType {
  AUCTION = 'AUCTION',
  NORMAL = 'NORMAL',
}

registerEnumType(ConversationType, { name: 'ConversationType' });

@ObjectType()
@Entity()
export default class Conversation extends GenericEntity {
  @Column()
  @Field()
  type: ConversationType;
  @ManyToMany(() => User, (user) => user.conversations, {
    eager: true,
    nullable: true,
  })
  @JoinTable()
  @Field(() => [User], { nullable: true })
  users: User[];
  @OneToMany(() => Message, (message) => message.conversation)
  @Field(() => [Message])
  messages: Message[];
  @OneToOne(() => Auction, (auction) => auction.conversation, {
    nullable: true,
  })
  @JoinColumn()
  @Field(() => Auction)
  auction: Auction;
}
