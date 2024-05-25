import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { AzureStorageModule } from '@nestjs/azure-storage';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUpload } from './fileUpload.entity';

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
