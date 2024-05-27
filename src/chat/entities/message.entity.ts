import { Field, ObjectType } from '@nestjs/graphql';
import { Length } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import GenericEntity from '../../generic/generic.entity';
import User from '../../user/user.entity';
import Conversation from './conversation.entity';

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
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @Field(() => Conversation, { nullable: false })
  conversation: Conversation;
}
