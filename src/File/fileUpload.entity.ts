import GenericEntity from 'src/generic/generic.entity';
import { Entity, Column, Unique } from 'typeorm';

@Entity()
export class FileUpload extends GenericEntity {
  @Column()
  @Unique('unique_token', ['token'])
  token: string;

  @Column()
  fileUrl: string;
}
