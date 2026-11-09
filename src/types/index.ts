export interface Participant {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}

export type RacePhase = 'idle' | 'countdown' | 'racing' | 'finished';

export type DuckEffect = 'current' | 'whirlpool' | 'lilypad' | 'net';

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
  participant: Participant;
  arrival: Arrival;
}

export interface CommentaryLine {
  id: number;
  text: string;
  seconds: number;
}
