import { DuckEffect } from '../types';

export const IDLE_LINE = 'Finale dei 50 metri: paperelle sui blocchi. Pronti?';
export const COUNTDOWN_LINE = 'Silenzio in vasca…';
export const START_LINE = 'VIA! Si parte!';

const LINES: Record<DuckEffect | 'lead', string[]> = {
  jet: ['{n} prende il getto della bocchetta!', '{n} schizza via sul getto!'],
  rope: ['{n} si impiglia nella corsia!', '{n} resta agganciata ai galleggianti!'],
  capsize: ['{n} si cappotta, pancia all’aria!', '{n} si ribalta e galleggia storta.'],
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
