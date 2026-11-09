import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

import { Arrival } from '../types';
import { formatSeconds } from '../utils/formatSeconds';

const PLACE_CHIP = ['bg-duck', 'bg-silver', 'bg-bronze'];
const PLACE_CHIP_DEFAULT = 'bg-paper';
const HIDDEN = 'hidden';

export const nameLabel = (name: string, color: string) => {
  const element = document.createElement('div');
  element.className =
    'flex items-center gap-1.5 rounded-md bg-ink/60 px-2 py-0.5 text-xs font-black text-dock-ink sm:text-sm';
  const dot = document.createElement('span');
  dot.className = 'size-2.5 shrink-0 rounded-full border-[1.5px] border-ink';
  dot.style.backgroundColor = color;
  element.append(dot, name);
  return new CSS2DObject(element);
};

export const arrivalChip = () => {
  const element = document.createElement('span');
  element.className = HIDDEN;
  return element;
};

export const showArrival = (chip: HTMLSpanElement, arrival: Arrival | undefined) => {
  chip.innerHTML = '';
  if (!arrival) {
    chip.className = HIDDEN;
    return;
  }
  chip.className = `flex animate-pop items-baseline gap-1.5 rounded-lg border-2 border-ink px-2 text-ink ${
    PLACE_CHIP[arrival.place - 1] ?? PLACE_CHIP_DEFAULT
  }`;
  const place = document.createElement('span');
  place.className = 'font-display text-lg leading-6';
  place.textContent = String(arrival.place);
  const time = document.createElement('span');
  time.className = 'text-xs font-black tabular-nums';
  time.textContent = formatSeconds(arrival.seconds);
  chip.append(place, time);
};
