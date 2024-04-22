import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class GenericEntity {
  @PrimaryGeneratedColumn()
  id: number;
}
