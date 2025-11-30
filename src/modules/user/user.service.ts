import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Player } from './entities/player.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LinkPlayerDto } from './dto/link-player.dto';
import { CocApiService } from '@modules/ingestion/services/coc-api.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    private cocApiService: CocApiService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['memberships', 'memberships.tenant'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
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
    const existingPlayer = await this.playerRepository.findOne({
      where: { playerTag: normalizedTag },
    });

    if (existingPlayer) {
      throw new ConflictException('This player is already linked to an account');
    }

    // Create player record
    const player = this.playerRepository.create({
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
    });

    return this.playerRepository.save(player);
  }

  /**
   * Get all players linked to a user
   */
  async getUserPlayers(userId: string): Promise<Player[]> {
    return this.playerRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }
}