import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { IngestionModule } from '@modules/ingestion/ingestion.module';

@Module({
  imports: [PrismaModule, IngestionModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}