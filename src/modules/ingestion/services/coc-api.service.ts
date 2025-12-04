import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CocApiService {
  private readonly logger = new Logger(CocApiService.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl = 'https://api.clashofclans.com/v1';

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('COC_API_TOKEN');

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private encodeTag(tag: string): string {
    return encodeURIComponent(tag.startsWith('#') ? tag : `#${tag}`);
  }

  async getClan(tag: string) {
    const encoded = this.encodeTag(tag);
    const { data } = await this.client.get(`/clans/${encoded}`);
    return data;
  }

  async getCurrentWar(tag: string) {
    const encoded = this.encodeTag(tag);
    const { data } = await this.client.get(`/clans/${encoded}/currentwar`);
    return data;
  }

  async getWarLeagueWar(warTag: string) {
    const encoded = this.encodeTag(warTag);
    const { data } = await this.client.get(`/clanwarleagues/wars/${encoded}`);
    return data;
  }

  async getPlayer(tag: string) {
    const encoded = this.encodeTag(tag);
    const { data } = await this.client.get(`/players/${encoded}`);
    return data;
  }

  async verifyPlayerToken(tag: string, token: string): Promise<boolean> {
    try {
      const encoded = this.encodeTag(tag);
      const { data } = await this.client.post(`/players/${encoded}/verifytoken`, {
        token,
      });
      return data.status === 'ok';
    } catch (error) {
      this.logger.warn(`Failed to verify token for player ${tag}`);
      return false;
    }
  }
}
