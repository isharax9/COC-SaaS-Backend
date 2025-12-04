import { Module } from '@nestjs/common';
import { WarService } from './war.service';
import { WarController } from './war.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WarController],
  providers: [WarService],
  exports: [WarService],
})
export class WarModule {}
