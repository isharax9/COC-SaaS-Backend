import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WarService } from './war.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';

@Controller('tenants/:tenantId/wars')
@UseGuards(JwtAuthGuard)
export class WarController {
  constructor(private readonly warService: WarService) {}

  @Get('active')
  async getActiveWar(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: any,
  ) {
    // TODO: Add tenant membership validation
    return this.warService.getActiveWar(tenantId);
  }

  @Get(':warId')
  async getWarById(
    @Param('tenantId') tenantId: string,
    @Param('warId') warId: string,
  ) {
    return this.warService.getWarById(tenantId, warId);
  }

  @Get()
  async listWars(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.warService.listWars(tenantId, limit ? Number(limit) : 20, cursor);
  }
}
