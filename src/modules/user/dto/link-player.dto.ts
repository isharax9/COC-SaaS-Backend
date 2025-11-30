import { IsNotEmpty, IsString } from 'class-validator';

export class LinkPlayerDto {
  @IsString()
  @IsNotEmpty()
  playerTag: string;

  @IsString()
  @IsNotEmpty()
  apiToken: string;
}