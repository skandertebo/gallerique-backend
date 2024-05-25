import { AzureStorageModule } from '@nestjs/azure-storage';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import FileUpload from './file-upload.entity';
import { FileController } from './file.controller';
import { FileService } from './file.service';
dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([FileUpload]),
    AzureStorageModule.withConfig({
      sasKey: process.env.AZURE_STORAGE_SAS_KEY,
      accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
      containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
    }),
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
