import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import GenericEntity from '../generic/generic.entity';
import User from '../user/user.entity';

export enum PaymentStatus {
  PENDING,
  SUCCESS,
  FAILED,
}

@Entity()
@ObjectType()
export default class Payment extends GenericEntity {
  @Column()
  @Field()
  sessionId: string;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @Column()
  @Field()
  amount: number;

  @Column()
  @Field()
  status: PaymentStatus;
}
