import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import GenericEntity from '../../generic/generic.entity';
import User from '../../user/user.entity';
import { Auction } from './auction.entity';

@ObjectType()
@Entity()
export class Bid extends GenericEntity {
  @Field()
  @Column()
  price!: number;

  @Field(() => Auction)
  @ManyToOne(() => Auction, (auction) => auction.bids, { onDelete: 'CASCADE' })
  auction!: Auction;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.bids)
  owner!: User;
}
