export interface Session {
  id: string;
  date: Date;
  startTime: Date;
  endTime?: Date;
  handsStart: number;
  handsEnd?: number;
  limit: string;
  format: string;
  straddle: boolean;
  accountStart: number;
  accountEnd?: number;
  isActive: boolean;
}

export interface Player {
  id: string;
  name: string;
  colorTag: ColorTag;
  totalHands: number;
  vpip: number;
  pfr: number;
  note: string;
  exploits: string;
  aiSummary?: string;
}

export type ColorTag = 'green' | 'yellow' | 'red' | 'cyan' | 'magenta';

export interface Stake {
  id: string;
  name: string;
  format: string;
}

export interface Format {
  id: string;
  name: string;
}

export interface TableRating {
  id: string;
  tableName: string;
  players: Player[];
  rating: number;
  notes: string;
}
