import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';

import { ExcelService } from './excel.service';

@Controller('excel')
export class ExcelController {
  constructor(private excelService: ExcelService) {}

  @Get('download')
  async downloadFile(
    @Query('users') users: string,
    @Query('page') page: number,
    @Res() res: Response,
  ) {
    return this.excelService.downloadFile(users, page, res);
  }

  @Get('template')
  async downloadTemplate(@Res() res: Response) {
    return this.excelService.downloadTemplate(res);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('excelFile'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.excelService.uploadFile(file);
  }
}
