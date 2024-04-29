import GenericEntity from 'src/generic/generic.entity';
import User from 'src/user/user.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import Message from './message.entity';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

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
