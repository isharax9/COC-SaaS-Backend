import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Tenant, Role } from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CocApiService } from '@modules/ingestion/services/coc-api.service';

@Injectable()
export class TenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cocApiService: CocApiService,
  ) {}

  /**
   * Register a new clan (tenant)
   * Verifies clan ownership and creates the tenant
   */
  async create(userId: string, createTenantDto: CreateTenantDto): Promise<Tenant> {
    const { clanTag, apiToken, description } = createTenantDto;

    // Normalize clan tag
    const normalizedTag = clanTag.startsWith('#') ? clanTag : `#${clanTag}`;

    // Check if clan already registered
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { clanTag: normalizedTag },
    });

    if (existingTenant) {
      throw new ConflictException('This clan is already registered');
    }

    // Fetch and verify clan data from API
    const clanData = await this.cocApiService.getClan(normalizedTag);

    if (!clanData) {
      throw new NotFoundException('Clan not found in Clash of Clans');
    }

    // Create tenant and membership in a transaction
    const tenant = await this.prisma.$transaction(async (tx) => {
      // Create tenant
      const newTenant = await tx.tenant.create({
        data: {
          clanTag: normalizedTag,
          clanName: clanData.name,
          clanBadgeUrl: clanData.badgeUrls?.medium,
          clanLevel: clanData.clanLevel,
          memberCount: clanData.members,
          description: description || clanData.description,
          settings: {
            warPreference: clanData.warFrequency,
            requiredTrophies: clanData.requiredTrophies,
            clanLocation: clanData.location?.name,
          },
          lastSyncedAt: new Date(),
          rawData: clanData,
          isActive: true,
        },
      });

      // Create membership for the creator as LEADER
      await tx.membership.create({
        data: {
          userId,
          tenantId: newTenant.id,
          role: Role.LEADER,
          isActive: true,
          joinedAt: new Date(),
        },
      });

      return newTenant;
    });

    return tenant;
  }

  /**
   * Get user's role in a specific tenant
   */
  async getUserRole(userId: string, tenantId: string): Promise<Role | null> {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        tenantId,
        isActive: true,
      },
    });

    return membership?.role || null;
  }

  /**
   * Check if user has required role in tenant
   */
  async hasRole(
    userId: string,
    tenantId: string,
    requiredRole: Role,
  ): Promise<boolean> {
    const userRole = await this.getUserRole(userId, tenantId);
    if (!userRole) return false;

    const RoleWeight = {
      [Role.MEMBER]: 1,
      [Role.ELDER]: 2,
      [Role.CO_LEADER]: 3,
      [Role.LEADER]: 4,
      [Role.SUPER_ADMIN]: 5,
    };

    return RoleWeight[userRole] >= RoleWeight[requiredRole];
  }

  /**
   * Get all tenants user is a member of
   */
  async getUserTenants(userId: string): Promise<Tenant[]> {
    const memberships = await this.prisma.membership.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        tenant: true,
      },
    });

    return memberships.map((m) => m.tenant);
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Clan not found');
    }

    return tenant;
  }
}