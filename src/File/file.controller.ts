import {
  AzureStorageFileInterceptor,
  UploadedFileMetadata,
} from '@nestjs/azure-storage';
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { imageUploadValidationOptions } from './multer';

@Controller('file')
export class FileController {
  private readonly fileUploadService: FileService;
  constructor(private readonly fileService: FileService) {
    this.fileUploadService = fileService;
  }
  @Post('/upload-image')
  @UseInterceptors(
    AzureStorageFileInterceptor('file', imageUploadValidationOptions),
  )
  async uploadFile(@UploadedFile() file: UploadedFileMetadata) {
    const token = await this.fileUploadService.createUploadToken(
      file.storageUrl,
    );
    return { token };
  }
}
