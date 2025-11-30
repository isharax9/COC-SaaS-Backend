import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkPlayerDto {
  @ApiProperty({
    example: '#2PP',
    description: 'Clash of Clans player tag',
  })
  @IsString()
  @Matches(/^#?[0289PYLQGRJCUV]+$/, {
    message: 'Invalid player tag format',
  })
  playerTag: string;

  @ApiProperty({
    example: 'your-api-token-from-game',
    description: 'API token from CoC in-game settings for verification',
  })
  @IsString()
  apiToken: string;
}