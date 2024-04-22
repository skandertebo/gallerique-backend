import { Column, Entity } from 'typeorm';
import GenericEntity from '../generic/generic.entity';

export enum UserStatus {
  UNVERIFIED,
  VERIFIED,
}

@Entity()
export default class User extends GenericEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @Column({ default: UserStatus.UNVERIFIED, type: 'int' })
  status: UserStatus;

  @Column()
  password: string;

  @Column({ default: 0 })
  credit: number;
}
