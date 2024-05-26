import { Column, Entity, Unique } from 'typeorm';
import GenericEntity from '../generic/generic.entity';

@Entity()
export default class FileUpload extends GenericEntity {
  @Column()
  @Unique('unique_token', ['token'])
  token: string;

  @Column()
  fileUrl: string;
}
