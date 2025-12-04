import { Module } from '@nestjs/common';
import { WarService } from './war.service';
import { WarController } from './war.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { WarCallsModule } from './war-calls.module';

@Module({
  imports: [PrismaModule, WarCallsModule],
  controllers: [WarController],
  providers: [WarService],
  exports: [WarService],
})
export class WarModule {}
