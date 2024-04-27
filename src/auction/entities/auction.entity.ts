import { ObjectType, Field } from '@nestjs/graphql';
import { Bid } from '../../bid/entities/bid.entity';
import GenericEntity from '../../generic/generic.entity';
import User from '../../user/user.entity';
import { Column, Entity } from 'typeorm';

export enum AuctionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@ObjectType()
@Entity()
export class Auction extends GenericEntity {
  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  picture!: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  startPrice!: number;

  @Field()
  @Column()
  currentPrice!: number;

  @Field()
  @Column()
  startDate!: string;

  @Field()
  @Column()
  endTime!: string;

  @Field()
  @Column({ default: AuctionStatus.CLOSED })
  status!: AuctionStatus;

  @Field(() => [Bid])
  @Column()
  bids!: Bid[];

  @Column()
  owner!: User;
}
