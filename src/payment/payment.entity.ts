import { Field, ObjectType } from '@nestjs/graphql';
import GenericEntity from 'src/generic/generic.entity';
import User from 'src/user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

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
