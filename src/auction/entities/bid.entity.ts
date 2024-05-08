import { Field, ObjectType } from '@nestjs/graphql';
import GenericEntity from '../../generic/generic.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Auction } from './auction.entity';
import User from '../../user/user.entity';

@ObjectType()
@Entity()
export class Bid extends GenericEntity {
  @Field()
  @Column()
  price!: number;

  @Field(() => Auction)
  @ManyToOne(() => Auction, (auction) => auction.bids)
  auction!: Auction;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.bids)
  owner!: User;
}
