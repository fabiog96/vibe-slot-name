export interface Participant {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}

export type SpinResult = Record<string, Participant | null>;

export enum GameState {
  IDLE = 'IDLE',
  SPINNING = 'SPINNING',
  STOPPING = 'STOPPING',
  RESULT = 'RESULT',
}
