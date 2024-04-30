import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import Conversation from '../chat/entities/conversation.entity';
import GenericEntity from '../generic/generic.entity';

export enum UserStatus {
  UNVERIFIED,
  VERIFIED,
}

@Entity()
@ObjectType()
export default class User extends GenericEntity {
  @Column()
  @Field()
  firstName: string;

  @Column()
  @Field()
  lastName: string;

  @Column()
  @Field()
  email: string;

  @Column()
  @Field()
  address: string;

  @Column({ default: UserStatus.UNVERIFIED, type: 'int' })
  @Field()
  status: UserStatus;

  @ManyToMany(() => Conversation, (conversation) => conversation.users)
  @JoinTable()
  @Field(() => [Conversation], { nullable: true })
  conversations: Conversation[];

  @Column()
  password: string;

  @Column({ default: 0 })
  credit: number;
}
