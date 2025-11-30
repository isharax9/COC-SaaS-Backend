import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Player } from './entities/player.entity';
import { IngestionModule } from '@modules/ingestion/ingestion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Player]),
    forwardRef(() => IngestionModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}