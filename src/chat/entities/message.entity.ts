import { Length } from 'class-validator';
import GenericEntity from 'src/generic/generic.entity';
import User from 'src/user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import Conversation from './conversation.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export default class Message extends GenericEntity {
  @Column()
  @Field({ nullable: false })
  @Length(1)
  content: string;
  @ManyToOne(() => User, { eager: true })
  @Field(() => User, { nullable: false })
  sender: User;
  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @Field(() => Conversation, { nullable: false })
  conversation: Conversation;
}
