import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { WarCallsService } from './war-calls.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';

class CreateCallDto {
  mapPosition: number;
  playerTag: string;
  playerName: string;
}

@Controller('tenants/:tenantId/wars/:warId/calls')
@UseGuards(JwtAuthGuard)
export class WarCallsController {
  constructor(private readonly warCallsService: WarCallsService) {}

  @Get()
  async listCalls(
    @Param('tenantId') tenantId: string,
    @Param('warId') warId: string,
  ) {
    return this.warCallsService.listCalls(tenantId, warId);
  }

  @Post()
  async createCall(
    @Param('tenantId') tenantId: string,
    @Param('warId') warId: string,
    @Body() body: CreateCallDto,
    @CurrentUser() user: any,
  ) {
    return this.warCallsService.createCall(
      tenantId,
      warId,
      body.playerTag,
      body.playerName,
      Number(body.mapPosition),
    );
  }

  @Delete(':callId')
  async deleteCall(
    @Param('tenantId') tenantId: string,
    @Param('warId') warId: string,
    @Param('callId') callId: string,
    @CurrentUser() user: any,
  ) {
    return this.warCallsService.deleteCall(tenantId, warId, callId, user);
  }
}
