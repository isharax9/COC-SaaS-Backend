import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('👋 Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production!');
    }

    // Delete in order to respect foreign key constraints
    await this.$transaction([
      this.reaction.deleteMany(),
      this.message.deleteMany(),
      this.channel.deleteMany(),
      this.attack.deleteMany(),
      this.warParticipant.deleteMany(),
      this.war.deleteMany(),
      this.membership.deleteMany(),
      this.player.deleteMany(),
      this.tenant.deleteMany(),
      this.user.deleteMany(),
    ]);

    this.logger.warn('🗑️  Database cleaned');
  }
}