import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FileUpload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column()
  fileUrl: string;
}
