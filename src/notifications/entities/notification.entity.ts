import { ObjectType, Field } from '@nestjs/graphql';
import GenericEntity from '../../generic/generic.entity';
import User from '../../user/user.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
@Entity()
@ObjectType()
export class Notification extends GenericEntity {
  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  content: string;

  @Field(() => [User], { nullable: true })
  @ManyToMany(() => User, (user) => user.notifications, { eager: true })
  @JoinTable()
  users: User[];

  @Field()
  @Column()
  type: string;
}
