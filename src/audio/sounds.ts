interface Tone {
  frequency: number;
  seconds: number;
  type: OscillatorType;
  endFrequency?: number;
  delay?: number;
}

const VOLUME = 0.16;
const SILENCE = 0.001;

let context: AudioContext | null = null;
let isMuted = false;

const tone = ({ frequency, seconds, type, endFrequency, delay = 0 }: Tone) => {
  context ??= new AudioContext();
  const start = context.currentTime + delay;
  const end = start + seconds;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (endFrequency)
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, end);
  gain.gain.setValueAtTime(VOLUME, start);
  gain.gain.exponentialRampToValueAtTime(SILENCE, end);

  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end);
};

const SOUNDS = {
  countdown: () => tone({ frequency: 660, seconds: 0.14, type: 'square' }),
  start: () => tone({ frequency: 990, seconds: 0.6, type: 'square' }),
  net: () =>
    tone({ frequency: 760, endFrequency: 170, seconds: 0.55, type: 'sawtooth' }),
  arrival: () => tone({ frequency: 1320, seconds: 0.1, type: 'sine' }),
  finish: () =>
    [0, 0.2, 0.4].forEach((delay, i) =>
      tone({
        frequency: 1900,
        endFrequency: 2050,
        seconds: i === 2 ? 0.55 : 0.13,
        type: 'triangle',
        delay,
      }),
    ),
};

export type Sound = keyof typeof SOUNDS;

export const setMuted = (next: boolean) => {
  isMuted = next;
};

export const play = (sound: Sound) => {
  if (!isMuted) SOUNDS[sound]();
};
