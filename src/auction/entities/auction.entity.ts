import { ObjectType, Field } from '@nestjs/graphql';
import { Bid } from './bid.entity';
import GenericEntity from '../../generic/generic.entity';
import User from '../../user/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

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
  picture: string;

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
  @OneToMany(() => Bid, (bid) => bid.auction, { onDelete: 'CASCADE' })
  bids!: Bid[];

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.auctions)
  owner!: User;

  @Field(() => User)
  @ManyToOne(() => User)
  winner: User;
}
