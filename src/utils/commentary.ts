import { DuckEffect } from '../types';

export const IDLE_LINE = 'Paperelle allineate al pontile. Pronti?';
export const COUNTDOWN_LINE = 'Silenzio sul fiume…';
export const START_LINE = 'VIA! Si parte!';

const LINES: Record<DuckEffect | 'lead', string[]> = {
  current: ['{n} prende la corrente!', '{n} cavalca un’onda!'],
  whirlpool: ['{n} finisce nel mulinello!', '{n} gira su se stessa, confusa.'],
  lilypad: ['{n} si incastra tra le ninfee!', '{n} rallenta tra le ninfee.'],
  net: ['Arriva il retino! {n} viene ripescata e rimessa indietro!'],
  lead: ['{n} passa in testa!', 'Sorpasso! Ora comanda {n}!'],
};

export const lineFor = (event: DuckEffect | 'lead', name: string) => {
  const options = LINES[event];
  return options[Math.floor(Math.random() * options.length)].replace('{n}', name);
};

export const finishLine = (name: string, place: number, total: number) => {
  if (place === 1) return `${name} taglia il traguardo per prima!`;
  if (place === total) return `${name} chiude la gara, ultima ma con stile.`;
  return `${name} chiude in ${place}ª posizione.`;
};
