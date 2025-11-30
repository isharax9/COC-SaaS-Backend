import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Clash of Clans API Service
 * Handles all interactions with the official Supercell API
 */
@Injectable()
export class CocApiService {
  private readonly logger = new Logger(CocApiService.name);
  private readonly apiUrl: string;
  private readonly apiToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get('COC_API_BASE_URL') || 'https://api.clashofclans.com/v1';
    this.apiToken = this.configService.get('COC_API_TOKEN');

    if (!this.apiToken) {
      this.logger.warn('COC_API_TOKEN not configured. API calls will fail.');
    }
  }

  /**
   * Normalize clan/player tags (remove # and convert to uppercase)
   */
  private normalizeTag(tag: string): string {
    return tag.replace('#', '').toUpperCase();
  }

  /**
   * Make authenticated request to CoC API
   */
  private async makeRequest<T>(endpoint: string): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            Accept: 'application/json',
          },
        }),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `CoC API Error: ${error.response?.status} - ${error.response?.data?.message}`,
      );
      throw new BadRequestException(
        error.response?.data?.message || 'Failed to fetch data from Clash of Clans API',
      );
    }
  }

  /**
   * Get clan information
   */
  async getClan(clanTag: string): Promise<any> {
    const normalizedTag = this.normalizeTag(clanTag);
    return this.makeRequest(`/clans/%23${normalizedTag}`);
  }

  /**
   * Get clan members
   */
  async getClanMembers(clanTag: string): Promise<any> {
    const normalizedTag = this.normalizeTag(clanTag);
    return this.makeRequest(`/clans/%23${normalizedTag}/members`);
  }

  /**
   * Get current war information
   */
  async getCurrentWar(clanTag: string): Promise<any> {
    const normalizedTag = this.normalizeTag(clanTag);
    return this.makeRequest(`/clans/%23${normalizedTag}/currentwar`);
  }

  /**
   * Get war log history
   */
  async getWarLog(clanTag: string): Promise<any> {
    const normalizedTag = this.normalizeTag(clanTag);
    return this.makeRequest(`/clans/%23${normalizedTag}/warlog`);
  }

  /**
   * Get clan capital raid seasons
   */
  async getCapitalRaidSeasons(clanTag: string): Promise<any> {
    const normalizedTag = this.normalizeTag(clanTag);
    return this.makeRequest(`/clans/%23${normalizedTag}/capitalraidseasons`);
  }

  /**
   * Get player information
   */
  async getPlayer(playerTag: string): Promise<any> {
    const normalizedTag = this.normalizeTag(playerTag);
    return this.makeRequest(`/players/%23${normalizedTag}`);
  }

  /**
   * Verify player token for ownership
   * Uses the /players/{tag}/verifytoken endpoint
   */
  async verifyPlayerToken(playerTag: string, token: string): Promise<boolean> {
    try {
      const normalizedTag = this.normalizeTag(playerTag);
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/players/%23${normalizedTag}/verifytoken`,
          { token },
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return response.data?.status === 'ok';
    } catch (error) {
      this.logger.error('Player token verification failed', error);
      return false;
    }
  }

  /**
   * Get Clan War League group
   */
  async getClanWarLeagueGroup(clanTag: string): Promise<any> {
    const normalizedTag = this.normalizeTag(clanTag);
    return this.makeRequest(`/clans/%23${normalizedTag}/currentwar/leaguegroup`);
  }
}