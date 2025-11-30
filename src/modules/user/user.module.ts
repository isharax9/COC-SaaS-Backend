import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { IngestionModule } from '@modules/ingestion/ingestion.module';

@Module({
  imports: [forwardRef(() => IngestionModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}