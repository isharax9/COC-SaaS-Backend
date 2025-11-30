import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { CreateUserDto } from '@modules/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    return this.authService.login(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@CurrentUser() user: any) {
    return this.authService.login(user);
  }
}