import { Module, forwardRef } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { IngestionModule } from '@modules/ingestion/ingestion.module';

@Module({
  imports: [forwardRef(() => IngestionModule)],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}