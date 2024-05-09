import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from './fileUpload.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  private readonly fileUploadRepository: Repository<FileUpload>;

  constructor(
    @InjectRepository(FileUpload)
    private readonly repository: Repository<FileUpload>,
  ) {
    this.fileUploadRepository = repository;
  }
  createUploadToken(fileUrl: string) {
    const token = uuidv4();
    const entity = this.repository.create({ fileUrl, token });
    this.repository.save(entity);
    return token;
  }
}
