# Finale 50 m Stile Papera

A rubber-duck race that randomly assigns meeting roles. Every participant is a duck; the last duck across the finish line takes the first role, the second-to-last takes the second, and so on: whoever loses, pays.

## Features

- **3D duck race** (three.js): a tilted view over an Olympic pool with reflective water (`Water2`), a tiled floor with lane lines, competition lane ropes, starting blocks, touchpads, backstroke flags and 3D ducks; each duck eases towards a randomly changing speed
- **Adaptive quality**: phones and slow GPUs drop reflections, shadows and resolution automatically; the 3D scene loads as a separate chunk
- **Random events**, same odds for every duck, none in the last stretch:
  - *jet*: the pool inlet pushes the duck for a short boost
  - *lane rope*: the duck snags on the floats and stops for a moment
  - *capsize*: the duck rolls belly up and drifts slowly until it rights itself
  - *the net*: once per race, a fairground net scoops one random duck and drops it back about 18% of the track
- **Live commentary**: a feed column narrating events, lead changes and arrivals, with race time
- **Swim-style arrivals**: every duck races to the end; each lane shows its place and time as it touches the line
- **Final standings with reserves**: roles go to the last available finishers; mark someone "Non c’è" and the role moves to the next duck up
- **Turn memory**: whoever held a role on the previous race day starts the standings already marked as resting ("turno scorso") and can be readmitted; same-day rematches do not count as a new turn
- **Absent today**: a per-participant toggle in the settings keeps someone off the blocks without deleting them
- **Persistence**: participants, roles, turn memory and the mute choice live in `localStorage`
- **Sound**: synthesized start beeps, net swoop, touchpad blips and a final whistle (Web Audio, no assets), with a mute button
- **Standings screenshot**: one button draws the final standings as a PNG and copies it to the clipboard, or downloads it where the clipboard refuses images
- **Countdown and confetti**: 3-2-1 start, confetti at the end
- **Settings**: one modal (gear button) for participants (add comma or newline separated names, remove, clear) and roles, so the race canvas keeps the full width
- **Roles**: role order follows arrival order
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
├── audio/        # synthesized sound effects
├── components/   # one component per file
├── hooks/        # useDuckRace: the race engine
├── scene/        # three.js scene: pool, water, duck rigs, camera
├── styles/       # Tailwind theme: palette, fonts, keyframes
├── types/        # domain types
└── utils/        # pure helpers
```
