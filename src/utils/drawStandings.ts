import { Arrival, Placement, Role } from '../types';
import { formatSeconds } from './formatSeconds';
import { RACE_TITLE } from './raceTitle';
import { themeColor } from './themeColor';

const PIXEL_RATIO = 2;
const WIDTH = 720;
const PADDING = 32;
const BORDER = 6;
const RADIUS = 20;
const HEADER_HEIGHT = 92;
const CARD_COLUMNS = 2;
const CARD_HEIGHT = 104;
const CARD_GAP = 12;
const CARD_INSET = 18;
const CARD_WIDTH = (WIDTH - PADDING * 2 - CARD_GAP * (CARD_COLUMNS - 1)) / CARD_COLUMNS;
const ROW_HEIGHT = 34;
const NAME_X = PADDING + 46;
const TIME_WIDTH = 72;
const CARD_FILL = ['duck', 'silver', 'bronze'];
const DISPLAY = '"Lilita One", sans-serif';
const BODY = 'Nunito, sans-serif';
const FADED = 0.45;

interface Standings {
  roles: Role[];
  placements: Placement[];
  arrivals: Arrival[];
  unavailableIds: string[];
}

const longDate = () =>
  new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const drawStandings = ({
  roles,
  placements,
  arrivals,
  unavailableIds,
}: Standings) => {
  const cardRows = Math.ceil(roles.length / CARD_COLUMNS);
  const listTop = PADDING + HEADER_HEIGHT + cardRows * (CARD_HEIGHT + CARD_GAP) + 8;
  const height = listTop + arrivals.length * ROW_HEIGHT + PADDING;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH * PIXEL_RATIO;
  canvas.height = height * PIXEL_RATIO;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas is not available');
  ctx.scale(PIXEL_RATIO, PIXEL_RATIO);

  const ink = themeColor('ink');
  const text = (
    value: string,
    x: number,
    y: number,
    font: string,
    { align = 'left', alpha = 1, color = ink, maxWidth = WIDTH }: {
      align?: CanvasTextAlign;
      alpha?: number;
      color?: string;
      maxWidth?: number;
    } = {},
  ) => {
    ctx.font = font;
    ctx.textAlign = align;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillText(value, x, y, maxWidth);
    ctx.globalAlpha = 1;
  };
  const box = (x: number, y: number, w: number, h: number, radius: number, fill: string) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fillStyle = fill;
    ctx.fill();
  };

  box(0, 0, WIDTH, height, RADIUS, ink);
  box(BORDER, BORDER, WIDTH - BORDER * 2, height - BORDER * 2, RADIUS - BORDER, themeColor('paper'));

  text(RACE_TITLE, PADDING, PADDING + 34, `36px ${DISPLAY}`);
  text(longDate(), PADDING, PADDING + 62, `800 15px ${BODY}`, { alpha: 0.6 });

  roles.forEach((role, i) => {
    const x = PADDING + (i % CARD_COLUMNS) * (CARD_WIDTH + CARD_GAP);
    const y = PADDING + HEADER_HEIGHT + Math.floor(i / CARD_COLUMNS) * (CARD_HEIGHT + CARD_GAP);
    const fill = CARD_FILL[i] ? themeColor(CARD_FILL[i]) : '#ffffff';
    const inner = { maxWidth: CARD_WIDTH - CARD_INSET * 2 };
    const placement = placements.find((p) => p.role.id === role.id);

    box(x, y, CARD_WIDTH, CARD_HEIGHT, 14, ink);
    box(x + 3, y + 3, CARD_WIDTH - 6, CARD_HEIGHT - 6, 11, fill);
    text(role.name.toUpperCase(), x + CARD_INSET, y + 30, `900 12px ${BODY}`, { ...inner, alpha: 0.75 });
    if (!placement) {
      text('Nessuno disponibile', x + CARD_INSET, y + 66, `800 16px ${BODY}`, inner);
      return;
    }
    text(placement.arrival.name, x + CARD_INSET, y + 64, `30px ${DISPLAY}`, inner);
    text(
      `${placement.arrival.place}° · ${formatSeconds(placement.arrival.seconds)}`,
      x + CARD_INSET,
      y + 86,
      `800 13px ${BODY}`,
      { ...inner, alpha: 0.75 },
    );
  });

  const roleByParticipant = new Map(placements.map((p) => [p.arrival.id, p.role.name]));
  const right = WIDTH - PADDING;

  arrivals.forEach((arrival, i) => {
    const y = listTop + i * ROW_HEIGHT + 22;
    const isOut = unavailableIds.includes(arrival.id);
    const role = roleByParticipant.get(arrival.id);
    const nameFont = `800 16px ${BODY}`;

    text(String(arrival.place), NAME_X - 14, y, `19px ${DISPLAY}`, { align: 'right' });
    text(arrival.name, NAME_X, y, nameFont, { alpha: isOut ? FADED : 1 });
    if (isOut) {
      ctx.font = nameFont;
      ctx.globalAlpha = FADED;
      ctx.fillStyle = ink;
      ctx.fillRect(NAME_X, y - 6, ctx.measureText(arrival.name).width, 2);
      ctx.globalAlpha = 1;
    }
    text(formatSeconds(arrival.seconds), right, y, `800 13px ${BODY}`, { align: 'right', alpha: 0.6 });

    if (!role) return;
    const pillFont = `900 11px ${BODY}`;
    const label = role.toUpperCase();
    ctx.font = pillFont;
    const pillWidth = ctx.measureText(label).width + 18;
    const pillRight = right - TIME_WIDTH;
    box(pillRight - pillWidth, y - 15, pillWidth, 21, 10.5, ink);
    text(label, pillRight - 9, y, pillFont, { align: 'right', color: '#ffffff' });
  });

  return canvas;
};
