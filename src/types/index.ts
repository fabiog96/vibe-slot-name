export interface Participant {
  id: string;
  name: string;
  isAbsent?: boolean;
}

export interface Runner {
  id: string;
  name: string;
  color: string;
}

export interface Role {
  id: string;
  name: string;
}

export type RacePhase = 'idle' | 'countdown' | 'racing' | 'finished';

export type DuckEffect = 'jet' | 'rope' | 'capsize' | 'net';

export interface DuckView {
  id: string;
  progress: number;
  surge: number;
  effect: DuckEffect | null;
  effectElapsed: number;
}

export interface Arrival {
  id: string;
  name: string;
  place: number;
  seconds: number;
}

export interface Placement {
  role: Role;
  arrival: Arrival;
}

export interface CommentaryLine {
  id: number;
  text: string;
  seconds: number;
}

export interface Turn {
  day: string;
  holderIds: string[];
}
