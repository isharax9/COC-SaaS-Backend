import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CocApiService } from './services/coc-api.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [CocApiService],
  exports: [CocApiService],
})
export class IngestionModule {}