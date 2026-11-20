# ReignWell — Project Intelligence

A premium health & nutrition tracking app: landing page + interactive demo.

## Project structure

```
reignwell/
├── web/
│   └── index.html        ← entire app (landing page + interactive demo, single file)
└── .claude/
    └── agents/
        ├── alfin.md      ← website UI
        ├── neha.md       ← mobile app UI
        ├── achu.md       ← app functionality & features
        ├── sarang.md     ← debate bot: pragmatist
        └── adhi.md       ← debate bot: perfectionist
```

## The team

| Agent | Owns |
|---|---|
| **Alfin** | Landing page sections, nav, footer, responsive layout, brand |
| **Neha** | Phone mockup, app screens, in-app UX, components |
| **Achu** | JavaScript logic, features, data, interactivity |
| **Sarang** | Debate bot — argues for fast, user-focused approach |
| **Adhi** | Debate bot — argues for correctness, edge cases, polish |

## How to build anything: the debate workflow

**Before building any new feature or significant change**, run Sarang and Adhi first:

1. Tell me what you want to build
2. Sarang argues his approach (fast, pragmatic)
3. Adhi argues his approach (thorough, principled)
4. They go back and forth 1-2 rounds
5. They reach a CONSENSUS
6. The right specialist (Alfin / Neha / Achu) implements the consensus

This catches bad decisions before code is written, not after.

### Invoke the debate
Say: **"Sarang and Adhi, debate: [what you want to build]"**

### Then implement
Say: **"Alfin implement it"** / **"Neha implement it"** / **"Achu implement it"**

Or route automatically — if the consensus is about:
- Visual design of the landing page → Alfin
- In-app screen or component → Neha
- Logic, data, interactivity → Achu

## Tech stack

- **Single file**: `web/index.html` — no build tools, no npm, no framework
- **Fonts**: Inter (body), Space Grotesk (headings), Cinzel Decorative (logo)
- **CSS tokens**: all colors via CSS variables on `:root` — never hardcode dark colors in component CSS
- **JS**: vanilla only, no dependencies
- **Images**: base64 data URIs embedded inline (CSP blocks external images in Claude artifacts)

## Brand

- Logo: solid black crown + "REIGNWELL" in Cinzel Decorative serif
- Accent: `#C9A84C` gold
- Light sections: `#FFFFFF` bg, `#111111` text
- Dark sections: `#111111` bg, `#F0EBE0` text
- Cards on dark: `#232120`
- Cards on light: `#F5F0E8`

## Artifact

Published at: https://claude.ai/artifact/RgGTrhar5m6y4Kr3jY4NHb
(update by publishing `web/index.html` to that URL)
