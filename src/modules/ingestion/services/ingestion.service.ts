import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@/prisma/prisma.service';
import { CocApiService } from './coc-api.service';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cocApiService: CocApiService,
    @InjectQueue('clan-ingestion')
    private readonly clanIngestionQueue: Queue,
  ) {}

  /**
   * Schedule ingestion jobs for all active tenants
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async scheduleClanIngestionJobs() {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      select: {
        id: true,
        clanTag: true,
      },
    });

    for (const tenant of tenants) {
      await this.clanIngestionQueue.add(
        'fetch-clan-state',
        {
          tenantId: tenant.id,
          clanTag: tenant.clanTag,
        },
        {
          jobId: `clan-${tenant.clanTag}`,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }

    this.logger.log(`Scheduled ingestion jobs for ${tenants.length} tenants`);
  }
}
