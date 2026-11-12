# Gran Premio delle Paperelle

A rubber-duck race that randomly assigns meeting roles. Every participant is a duck; the last duck across the finish line takes the first role, the second-to-last takes the second, and so on: whoever loses, pays.

## Features

- **3D duck race** (three.js): a tilted view over an Olympic pool with reflective water (`Water2`), a tiled floor with lane lines, competition lane ropes, starting blocks, touchpads, backstroke flags and 3D ducks; each duck eases towards a randomly changing speed
- **Adaptive quality**: phones and slow GPUs drop reflections, shadows and resolution automatically; the 3D scene loads as a separate chunk
- **Random events**, same odds for every duck:
  - *current*: short speed boost
  - *whirlpool*: the duck spins in place for a moment
  - *lily pads*: slowdown
  - *the net*: once per race, a fairground net scoops one random duck and drops it back about 18% of the track
- **Live commentary**: a feed column narrating events, lead changes and arrivals, with race time
- **Swim-style arrivals**: every duck races to the end; each lane shows its place and time as it touches the line
- **Final standings with reserves**: roles go to the last available finishers; mark someone "Non c’è" (absent, or had the role last week) and the role moves to the next duck up
- **Countdown and confetti**: 3-2-1 start, confetti at the end
- **Participants**: add names (comma or newline separated), remove them, clear the list
- **Roles**: configurable list; role order follows arrival order
- **Fair draw**: every duck runs the same speed distribution
- **Reduced motion**: water flow, bobbing and buoys stop when the OS asks for it

## Tech Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · three.js · `react-confetti`

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
├── scene/        # three.js scene: pool, water, duck rigs, camera
├── styles/       # Tailwind theme: palette, fonts, keyframes
├── types/        # domain types
└── utils/        # pure helpers
```
