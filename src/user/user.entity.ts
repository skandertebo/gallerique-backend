import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import Conversation from '../chat/entities/conversation.entity';
import GenericEntity from '../generic/generic.entity';
import { Notification } from '../notifications/entities/notification.entity';
import Payment from '../payment/payment.entity';
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

  @ManyToMany(() => Notification, (notification) => notification.users)
  @Field(() => [Notification], { nullable: true })
  notifications: Notification[];

  @Column()
  password: string;

  @Column({ default: 0 })
  credit: number;

  @OneToMany(() => Payment, (payment) => payment.user)
  @Field(() => [Payment], { nullable: true })
  payments: Payment[];
}
