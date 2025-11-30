import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { LinkPlayerDto } from './dto/link-player.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getCurrentUser(@CurrentUser() user: any) {
    return this.userService.findById(user.id);
  }

  @Get('me/players')
  async getMyPlayers(@CurrentUser() user: any) {
    return this.userService.getUserPlayers(user.id);
  }

  @Post('me/players/link')
  async linkPlayer(
    @CurrentUser() user: any,
    @Body() linkPlayerDto: LinkPlayerDto,
  ) {
    return this.userService.linkPlayer(user.id, linkPlayerDto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}