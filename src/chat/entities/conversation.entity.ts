import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import GenericEntity from '../../generic/generic.entity';
import User from '../../user/user.entity';
import Message from './message.entity';

export enum ConversationType {
  AUCTION,
  NORMAL,
}

registerEnumType(ConversationType, { name: 'ConversationType' });

@ObjectType()
@Entity()
export default class Conversation extends GenericEntity {
  @Column()
  @Field()
  type: ConversationType;
  @ManyToMany(() => User, (user) => user.conversations, { eager: true })
  @JoinTable()
  @Field(() => [User], { nullable: true })
  users: User[];
  @OneToMany(() => Message, (message) => message.conversation)
  @Field(() => [Message])
  messages: Message[];

  //TODO: add relation with the auction entity
}
