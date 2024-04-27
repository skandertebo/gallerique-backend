import { Field, ObjectType } from '@nestjs/graphql';
import GenericEntity from '../../generic/generic.entity';
import { Column, CreateDateColumn, Entity } from 'typeorm';
import { Auction } from '../../auction/entities/auction.entity';
import User from '../../user/user.entity';

@ObjectType()
@Entity()
export class Bid extends GenericEntity {
  @Field()
  @Column()
  price!: number;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @Column()
  auction!: Auction;

  @Field()
  @Column()
  owner!: User;
}
