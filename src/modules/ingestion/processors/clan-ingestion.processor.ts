import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CocApiService } from '../services/coc-api.service';

interface ClanIngestionJobData {
  tenantId: string;
  clanTag: string;
}

@Injectable()
@Processor('clan-ingestion')
export class ClanIngestionProcessor extends WorkerHost {
  private readonly logger = new Logger(ClanIngestionProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cocApiService: CocApiService,
  ) {
    super();
  }

  /**
   * Process clan ingestion job
   * - Fetch current war
   * - Upsert war record
   * - Upsert participants
   * - Upsert attacks
   */
  async process(job: Job<ClanIngestionJobData>): Promise<void> {
    const { tenantId, clanTag } = job.data;

    this.logger.log(`Processing clan ingestion for ${clanTag}`);

    // Fetch current war
    const warData = await this.cocApiService.getCurrentWar(clanTag);

    if (!warData || warData.state === 'notInWar') {
      this.logger.log(`Clan ${clanTag} is not in war`);
      return;
    }

    // Upsert war record
    const war = await this.prisma.war.upsert({
      where: {
        warTag: warData.warTag || `${warData.clan.tag}-${warData.opponent.tag}-${warData.startTime}`,
      },
      update: {
        tenantId,
        opponentTag: warData.opponent.tag,
        opponentName: warData.opponent.name,
        teamSize: warData.teamSize,
        startTime: new Date(warData.startTime),
        endTime: new Date(warData.endTime),
        state: warData.state,
        result: warData.result,
        teamStars: warData.clan.stars,
        opponentStars: warData.opponent.stars,
        teamDestruction: warData.clan.destructionPercentage,
        opponentDestruction: warData.opponent.destructionPercentage,
        rawData: warData,
      },
      create: {
        tenantId,
        warTag: warData.warTag || `${warData.clan.tag}-${warData.opponent.tag}-${warData.startTime}`,
        opponentTag: warData.opponent.tag,
        opponentName: warData.opponent.name,
        teamSize: warData.teamSize,
        startTime: new Date(warData.startTime),
        endTime: new Date(warData.endTime),
        state: warData.state,
        result: warData.result,
        teamStars: warData.clan.stars,
        opponentStars: warData.opponent.stars,
        teamDestruction: warData.clan.destructionPercentage,
        opponentDestruction: warData.opponent.destructionPercentage,
        rawData: warData,
      },
    });

    // Upsert participants
    const clanMembers = warData.clan.members || [];

    for (const member of clanMembers) {
      await this.prisma.warParticipant.upsert({
        where: {
          warId_playerTag: {
            warId: war.id,
            playerTag: member.tag,
          },
        },
        update: {
          playerName: member.name,
          townHallLevel: member.townhallLevel,
          mapPosition: member.mapPosition,
          opponentAttacks: member.opponentAttacks?.length || 0,
          bestOpponentAttack: member.bestOpponentAttack || null,
          attacks: member.attacks?.length || 0,
        },
        create: {
          warId: war.id,
          playerTag: member.tag,
          playerName: member.name,
          townHallLevel: member.townhallLevel,
          mapPosition: member.mapPosition,
          opponentAttacks: member.opponentAttacks?.length || 0,
          bestOpponentAttack: member.bestOpponentAttack || null,
          attacks: member.attacks?.length || 0,
        },
      });
    }

    // Upsert attacks
    const clanAttacks = clanMembers.flatMap((m: any) => m.attacks || []);

    for (const attack of clanAttacks) {
      const existing = await this.prisma.attack.findFirst({
        where: {
          warId: war.id,
          attackerTag: attack.attackerTag,
          defenderTag: attack.defenderTag,
          order: attack.order,
        },
      });

      if (!existing) {
        await this.prisma.attack.create({
          data: {
            warId: war.id,
            attackerTag: attack.attackerTag,
            attackerName: attack.attackerTag,
            defenderTag: attack.defenderTag,
            defenderName: attack.defenderTag,
            stars: attack.stars,
            destructionPercent: attack.destructionPercentage,
            duration: attack.duration,
            order: attack.order,
            isFresh: attack.isFresh || false,
          },
        });
      }
    }

    this.logger.log(`Ingestion completed for clan ${clanTag}`);
  }
}
