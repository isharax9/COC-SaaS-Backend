import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { LinkPlayerDto } from './dto/link-player.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Request() req) {
    return this.userService.findById(req.user.id);
  }

  @Post('link-player')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Link a CoC player to your account' })
  @ApiResponse({ status: 201, description: 'Player linked successfully' })
  @ApiResponse({ status: 400, description: 'Verification failed' })
  @ApiResponse({ status: 409, description: 'Player already linked' })
  async linkPlayer(@Request() req, @Body() linkPlayerDto: LinkPlayerDto) {
    return this.userService.linkPlayer(req.user.id, linkPlayerDto);
  }

  @Get('players')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all linked players' })
  @ApiResponse({ status: 200, description: 'Players retrieved' })
  async getPlayers(@Request() req) {
    return this.userService.getUserPlayers(req.user.id);
  }
}