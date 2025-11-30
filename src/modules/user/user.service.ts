import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/prisma/prisma.service';
import { User, Player } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { LinkPlayerDto } from './dto/link-player.dto';
import { CocApiService } from '@modules/ingestion/services/coc-api.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cocApiService: CocApiService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    // Check if username already exists
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * Link a Clash of Clans player to user account
   * Uses Supercell API token verification
   */
  async linkPlayer(userId: string, linkPlayerDto: LinkPlayerDto): Promise<Player> {
    const { playerTag, apiToken } = linkPlayerDto;

    // Normalize player tag
    const normalizedTag = playerTag.startsWith('#') ? playerTag : `#${playerTag}`;

    // Verify ownership via Supercell API
    const isValid = await this.cocApiService.verifyPlayerToken(
      normalizedTag,
      apiToken,
    );

    if (!isValid) {
      throw new BadRequestException(
        'Player verification failed. Please check your player tag and API token.',
      );
    }

    // Fetch player data from API
    const playerData = await this.cocApiService.getPlayer(normalizedTag);

    // Check if player is already linked
    const existingPlayer = await this.prisma.player.findUnique({
      where: { playerTag: normalizedTag },
    });

    if (existingPlayer) {
      throw new ConflictException('This player is already linked to an account');
    }

    // Create player record
    const player = await this.prisma.player.create({
      data: {
        playerTag: normalizedTag,
        playerName: playerData.name,
        townHallLevel: playerData.townHallLevel,
        expLevel: playerData.expLevel,
        trophies: playerData.trophies,
        clanTag: playerData.clan?.tag,
        clanName: playerData.clan?.name,
        rawData: playerData,
        lastSyncedAt: new Date(),
        isVerified: true,
        userId,
      },
    });

    return player;
  }

  /**
   * Get all players linked to a user
   */
  async getUserPlayers(userId: string): Promise<Player[]> {
    return this.prisma.player.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }
}