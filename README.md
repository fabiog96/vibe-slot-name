# Gran Premio delle Paperelle

A rubber-duck race that randomly assigns meeting roles. Every participant is a duck; the first duck across the finish line takes the first role, the second takes the second, and so on.

## Features

- **Duck race**: smooth 60fps race driven by `requestAnimationFrame`, each duck easing towards a randomly changing speed
- **Random events**, same odds for every duck:
  - *current*: short speed boost
  - *whirlpool*: the duck spins in place for a moment
  - *lily pads*: slowdown
  - *the net*: once per race, a fairground net scoops one random duck and drops it back about 18% of the track
- **Live commentary**: a bar narrating events, lead changes and arrivals
- **Countdown and podium**: 3-2-1 start, podium with confetti at the end
- **Participants**: add names (comma or newline separated), remove them, clear the list
- **Roles**: configurable list; role order follows arrival order
- **Fair draw**: every duck runs the same speed distribution
- **Reduced motion**: water and bobbing animations stop when the OS asks for it

## Tech Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · `react-confetti`

## Development

```bash
git clone https://github.com/fabiog96/vibe-slot-name.git
cd vibe-slot-name
npm install
npm run dev
```

The dev server runs on `http://localhost:3000/vibe-slot-name/`.

## Build

```bash
npm run build
```

`build` typechecks first (`npm run typecheck`), so a type error also stops the Pages deploy.

Pushing to `main` deploys `dist/` to GitHub Pages (`.github/workflows/deploy.yml`).

## Project Structure

```text
src/
├── components/   # one component per file
├── hooks/        # useDuckRace: the race engine
├── styles/       # Tailwind theme: palette, fonts, keyframes
├── types/        # domain types
└── utils/        # pure helpers
```
