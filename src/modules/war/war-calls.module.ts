import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { WarCallsService } from './war-calls.service';
import { WarCallsController } from './war-calls.controller';

@Module({
  imports: [PrismaModule],
  providers: [WarCallsService],
  controllers: [WarCallsController],
  exports: [WarCallsService],
})
export class WarCallsModule {}
