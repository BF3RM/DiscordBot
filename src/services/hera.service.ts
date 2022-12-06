import axios, { Axios } from "axios";
import { getHeraEndpoint } from "../config";

export interface HeraServerInfo {
  id: string;
  name: string;
  lastOnline: Date;
  roundId: string;
  roundStartedAt: Date;
  roundState: string;
  roundLevelName: string;
  roundGameMode: string;
  roundPlayers: number;
}

export class HeraService {
  private client: Axios;

  constructor() {
    this.client = axios.create({ baseURL: getHeraEndpoint() });
  }

  private static instance: HeraService;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new HeraService();
    }

    return this.instance;
  }

  public async getServers(): Promise<HeraServerInfo[]> {
    const res = await this.client.get<HeraServerInfo[]>(
      "/api/v1/server/info?onlyWithRound=1"
    );

    return res.data;
  }
}
