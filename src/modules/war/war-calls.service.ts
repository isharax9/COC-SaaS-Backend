import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class WarCallsService {
  constructor(private readonly prisma: PrismaService) {}

  async listCalls(tenantId: string, warId: string) {
    return this.prisma.warCall.findMany({
      where: {
        tenantId,
        warId,
        status: 'active',
      },
      orderBy: {
        mapPosition: 'asc',
      },
    });
  }

  async createCall(
    tenantId: string,
    warId: string,
    playerTag: string,
    playerName: string,
    mapPosition: number,
  ) {
    const war = await this.prisma.war.findFirst({
      where: { id: warId, tenantId, isDeleted: false },
    });
    if (!war) {
      throw new NotFoundException('War not found');
    }

    const existingForBase = await this.prisma.warCall.findFirst({
      where: {
        warId,
        tenantId,
        mapPosition,
        status: 'active',
      },
    });
    if (existingForBase) {
      throw new BadRequestException('This base is already called');
    }

    return this.prisma.warCall.create({
      data: {
        warId,
        tenantId,
        playerTag,
        playerName,
        mapPosition,
        status: 'active',
      },
    });
  }

  async deleteCall(
    tenantId: string,
    warId: string,
    callId: string,
    currentUser: { id: string; isPlatformAdmin: boolean; memberships: any[] },
  ) {
    const call = await this.prisma.warCall.findFirst({
      where: {
        id: callId,
        warId,
        tenantId,
      },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (currentUser.isPlatformAdmin) {
      return this.prisma.warCall.update({
        where: { id: callId },
        data: { status: 'cancelled' },
      });
    }

    const membership = currentUser.memberships?.find(
      (m: any) => m.tenantId === tenantId && m.isActive,
    );

    if (!membership) {
      throw new ForbiddenException('Not a member of this clan');
    }

    const canManageAny =
      membership.role === Role.LEADER || membership.role === Role.CO_LEADER;

    const isOwner = membership.playerTag && membership.playerTag === call.playerTag;

    if (!canManageAny && !isOwner) {
      throw new ForbiddenException('You cannot cancel this call');
    }

    return this.prisma.warCall.update({
      where: { id: callId },
      data: { status: 'cancelled' },
    });
  }
}
