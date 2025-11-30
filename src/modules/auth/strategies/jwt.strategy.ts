import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        memberships: {
          include: {
            tenant: true,
          },
          where: {
            isActive: true,
          },
        },
        players: true,
      },
    });

    if (!user || user.isDeleted) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}