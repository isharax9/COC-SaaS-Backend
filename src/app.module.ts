import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { TenantModule } from '@modules/tenant/tenant.module';
import { IngestionModule } from '@modules/ingestion/ingestion.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // HTTP Client
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),

    // Database (Prisma)
    PrismaModule,

    // Feature Modules
    IngestionModule,
    AuthModule,
    UserModule,
    TenantModule,
  ],
})
export class AppModule {}