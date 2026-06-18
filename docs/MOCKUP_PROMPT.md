# Prompt per Mockup — BetMarket

Copia questo prompt in un tool di design AI (Figma AI, v0, Galileo AI, o simili) per generare i mockup.

---

## Prompt

Design a web application called **BetMarket** — a social betting platform built around a retro slot machine. The app is used weekly by a team of ~15 people to randomly assign roles (like "Moderator" and "Notary") with a slot machine, while everyone bets on the outcome using virtual chips.

### Visual Style
- **Retro casino aesthetic** with a modern, clean twist (think Polymarket meets Las Vegas)
- Dark mode primary with warm accent colors (amber/gold for casino feel, teal for success, red for losses)
- Typography: serif display font for headings (like Playfair Display), monospace for data/numbers (like DM Mono), clean sans-serif for body
- Decorative elements: rivets, marquee lights, subtle gradients, recessed card panels
- The slot machine should feel like a real physical machine with a crown/marquee header, reel windows, side light strips, a lever, and a coin tray

### Pages & States to Design

#### 1. HOME / IDLE STATE
The main page when no game is active.
- **Header**: App logo "BetMarket" with a slot machine emoji, user avatar + chip balance badge, settings gear icon
- **Left panel** (~300px): "VIP List" showing all registered users with their chip balance, displayed as colored casino chip badges with numbers. Read-only, no input form. Shows who's online with a green dot
- **Center**: The slot machine in idle state. 2 reel windows (one per role: "Moderator", "Notary") showing "?" placeholders. Status indicator showing "Ready". A big "SPIN" button at the bottom. Marquee lights are dim/off
- **Footer**: Minimal, monospace text "BetMarket — What happens in Vegas..."
- **Leaderboard button** somewhere accessible, showing a trophy icon

#### 2. BETTING PHASE (2-minute countdown)
Someone clicked Spin. A modal/overlay appears automatically for ALL users.
- **Countdown timer** prominently displayed: "1:42 remaining" with a circular or linear progress bar
- **Tab navigation**: [Single] [Any Role] [Combo] [Not Selected] — styled as casino-chip-shaped tabs
- **Chip balance** shown in header: "100 chips" in a casino chip badge

**Single tab (default)**:
For each role (Moderator, Notary), show a market card:
- Role name as header
- List of all participants, each showing:
  - Name
  - Odds multiplier (e.g., "3.5x") — color-coded: low odds = amber, high odds = green
  - A thin probability bar (teal fill on dark track)
  - Chip amount input (small number stepper or slider)
  - "Potential payout: +35 chips" preview
- Selected bet highlighted with accent border
- Unselected participants slightly dimmed

**Any Role tab**:
- Single list of participants (no role column)
- Each shows odds for "wins at least one role"
- Same chip input + payout preview

**Combo tab**:
- Two dropdown selectors: "Participant A → Role 1" + "Participant B → Role 2"
- Combined odds shown (odds_A × odds_B)
- Higher potential payout, visually emphasized

**Not Selected tab**:
- List of participants
- Bet that a specific person does NOT get any role
- Inverse odds shown

**Bottom of modal**:
- Summary bar: "Active bets: 2 bets × 25 chips total | Potential: +85 chips"
- "Lock In" / "Done" button

#### 3. SPINNING STATE
- Betting modal closes
- Slot machine activates: marquee lights pulse, side lights animate
- Reel windows spin with names blurring through
- Status shows "Spinning..."
- The "SPIN" button is disabled, showing "Spinning..."
- If there's a lever, it's pulled down

#### 4. RESULT STATE
- Reels stop on the winners (e.g., "Capra" for Moderator, "Yang" for Notary)
- Confetti animation
- Winner announcement banner below the machine: "Capra is the new Moderator! Yang takes Notary!"
- Marquee lights flash in celebration pattern

**Betting results** (shown in a results panel or reopened modal):
- Each bet shows:
  - Your pick vs actual result
  - Won: green border, checkmark, "+35 chips" in green
  - Lost: red border, X mark, "-10 chips" in red
- Updated chip balance with animated counter
- Stats: "W: 4 / L: 6 | Streak: 0"

#### 5. LEADERBOARD (separate modal or page)
- Ranked list of all users by chip count
- Each entry: rank number, avatar, display name, chip count, win rate percentage
- Top 3 highlighted with gold/silver/bronze badges
- Current user's row highlighted
- "Bankrupt" users shown at bottom with a special badge

#### 6. BANKRUPT STATE
- When a user has 0 chips
- Their chip badge shows "BANKRUPT!" in red
- Betting modal is accessible but all inputs are disabled
- A message: "You're out of chips! Better luck next week."
- Subtle skull or empty wallet icon

### Responsive Behavior
- **Desktop (>1024px)**: Three-column layout — VIP list | Slot Machine | (optional sidebar)
- **Tablet (768-1024px)**: Two columns — Slot Machine takes priority, VIP list below
- **Mobile (<768px)**: Single column — Slot Machine on top, VIP list collapsible, Betting modal is fullscreen

### Key UI Components to Include
- Casino chip badges (colored circles with dashed border, number inside)
- Odds bars (thin horizontal progress bars, teal fill)
- Countdown timer (circular or linear)
- Slot reel windows (recessed panels with gradient overlays)
- Marquee lights (small dots that pulse during spin)
- Credit display (7-segment LED style showing chip count)
- Rivets (small metallic circles at corners of panels)
- Pay line arrows (triangle indicators on sides of reel viewport)

### Color Palette (for reference)
- Background: warm off-white (light) or deep brown-gray (dark)
- Paper/cards: slightly lighter than background
- Accent: warm amber/copper
- Success/teal: muted teal green
- Error: warm red
- Text: high contrast, warm tones
- Odds low: amber
- Odds high: bright green
