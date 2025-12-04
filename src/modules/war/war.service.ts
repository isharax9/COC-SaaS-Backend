import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class WarService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveWar(tenantId: string) {
    return this.prisma.war.findFirst({
      where: {
        tenantId,
        isDeleted: false,
        state: {
          in: ['preparation', 'inWar'],
        },
      },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        participants: true,
        attacks: true,
      },
    });
  }

  async getWarById(tenantId: string, warId: string) {
    return this.prisma.war.findFirst({
      where: {
        id: warId,
        tenantId,
        isDeleted: false,
      },
      include: {
        participants: true,
        attacks: true,
      },
    });
  }

  async listWars(tenantId: string, limit = 20, cursor?: string) {
    return this.prisma.war.findMany({
      where: {
        tenantId,
        isDeleted: false,
      },
      orderBy: {
        startTime: 'desc',
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        participants: true,
      },
    });
  }
}
