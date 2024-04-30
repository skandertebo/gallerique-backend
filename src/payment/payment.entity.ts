import { Field, ObjectType } from '@nestjs/graphql';
import GenericEntity from 'src/generic/generic.entity';
import { Column, Entity } from 'typeorm';

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

  @Column()
  @Field()
  userId: number;

  @Column()
  @Field()
  amount: number;

  @Column()
  @Field()
  status: PaymentStatus;
}
