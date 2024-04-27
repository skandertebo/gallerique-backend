import { Column, Entity } from 'typeorm';
import GenericEntity from '../generic/generic.entity';
import { Field, ObjectType } from '@nestjs/graphql';

export enum UserStatus {
  UNVERIFIED = 0,
  VERIFIED = 1,
}

@ObjectType()
@Entity()
export default class User extends GenericEntity {
  @Column()
  @Field()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  address: string;

  @Field()
  @Column({ default: UserStatus.UNVERIFIED, type: 'int' })
  status: UserStatus;

  @Field()
  @Column()
  password: string;

  @Field()
  @Column({ default: 0 })
  credit: number;
}
