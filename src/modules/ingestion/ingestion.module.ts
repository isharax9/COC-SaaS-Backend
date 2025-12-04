import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IngestionService } from './services/ingestion.service';
import { CocApiService } from './services/coc-api.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueueAsync({
      name: 'clan-ingestion',
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'redis'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [IngestionService, CocApiService],
  exports: [IngestionService, CocApiService],
})
export class IngestionModule {}
