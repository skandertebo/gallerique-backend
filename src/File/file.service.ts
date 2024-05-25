import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from './fileUpload.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import GenericService from 'src/generic/generic.service';

@Injectable()
export class FileService extends GenericService<FileUpload> {
  constructor(
    @InjectRepository(FileUpload)
    private readonly fileUploadRepository: Repository<FileUpload>,
  ) {
    super(fileUploadRepository);
  }
  async createUploadToken(fileUrl: string) {
    const token = uuidv4();
    await this.create({ fileUrl, token });
    return token;
  }

  async getFilePath(token: string) {
    const entity = await this.fileUploadRepository.findOne({
      where: { token },
    });
    if (!entity) throw new NotFoundException('The token does not exist!');
    return entity.fileUrl;
  }
}
