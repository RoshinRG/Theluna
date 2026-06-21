# ✨ Luna's World

A magical, single-page author universe built for **G Daffini Shiyalin (Luna)** — a cosmic poet and storyteller. The website showcases her published books, poetry collections, creative projects, and provides a portal for readers to connect with her.

> *Stories, poetry, dreams, and worlds beyond imagination.*

---

## Features

### Core Experience
- **Single Page Application (SPA)** — Client-side hash routing (`#home`, `#books`, `#poetry`, `#projects`, `#contact`) swaps views instantly without page reloads.
- **Cosmic Loading Screen** — A pulsing moon glyph with an animated progress bar greets visitors while assets load, then fades out gracefully.
- **Expandable Bento Grid Modal** — Click any book or poetry card to open a smooth, scale-animated modal with cover art, metadata, and action links. Closes via Escape, backdrop click, or the × button.

### Visual Design
- **Cosmic Design System** — Two curated palettes:
  - *Discreet Palette*: Deep purples (`#845EC2`), mid-tones (`#9B89B3`), and warm taupe (`#D5CABD`) for an immersive night-sky atmosphere.
  - *Grey Friends Palette*: Soft, muted typography that glows against the dark backdrop.
- **Glassmorphism UI** — Translucent, frosted-glass cards with `backdrop-filter: blur()`, subtle hover lifts, and glowing borders.
- **Custom Cursor** — A dual-element cursor (dot + glow) that follows the mouse and scales up when hovering over interactive elements. Gracefully falls back to default on touch devices.
- **Ambient Navigation** — A dynamic spotlight follows the mouse across the nav bar, with an ambient glowing underline tracking the active section.

### Three.js WebGL Background
A full-page Three.js canvas renders behind all content, creating a living cosmic backdrop:

| Module | Description |
|--------|-------------|
| **Starfield** | 1,500 twinkling stars spread across a 4,000-unit sphere with shader-based twinkle animation. |
| **HeroMoon** | A textured, Fresnel-lit 3D moon sphere that maps to the DOM hero section with auto-rotation. |
| **Nebula** | A full-screen FBM noise shader creating drifting, colour-shifting cosmic clouds. |
| **Sparkles** | 150 warm floating particles that rise infinitely with gentle horizontal sway. |
| **ShootingStar** | 20 simultaneous shooting stars raining diagonally across the screen. |
| **CursorTrail** | A 25-point particle trail that follows the mouse cursor in 3D space. |
| **BookCards** | Shader-based glowing edges on book cards with 3D tilt on mouse hover. |

### ASTRA — AI Chat Assistant
A floating chat widget powered by the **NVIDIA NIM API** (Gemma 4 31B model with thinking enabled):
- Cosmic, poetic personality tuned to Luna's brand.
- Server-side proxy (`api/astra.js`) to protect the API key.
- IP-based rate limiting (5 requests/minute).
- 15-second timeout with graceful error messages.
- `<think>` tag stripping for clean responses.
- Typing indicator animation while awaiting a reply.

### Animated Social Links
3D flip-card animations with spring physics on hover, featuring tooltips for Email and Wattpad.

---

## Tech Stack

This project adheres to a **zero-build-step philosophy**:

| Layer | Technology |
|-------|------------|
| Structure | HTML5 (semantic) |
| Styling | Vanilla CSS3 — custom properties, Flexbox/Grid, keyframe animations, glassmorphism |
| Logic | Vanilla JavaScript — DOM manipulation, IntersectionObserver, hash-based SPA routing |
| 3D Graphics | Three.js r160 (loaded via import map — no bundler required) |
| AI Backend | Serverless function (`api/astra.js`) proxying to NVIDIA NIM API |
| Fonts | Google Fonts — Cormorant Garamond (headings) + Inter (body) |

---

## File Structure

```text
The Luna/
├── index.html          # Main HTML document with all SPA sections
├── styles.css          # Complete design system, animations, and responsive rules
├── script.js           # SPA routing, cursor logic, loading screen, ASTRA chat, modal
├── .env.example        # Template for NVIDIA API key
├── README.md           # Project documentation (you are here)
│
├── api/
│   └── astra.js        # Serverless proxy for NVIDIA NIM API with rate limiting
│
├── assets/
│   ├── EIGHTEEN.png              # Upcoming poem cover
│   ├── Library of stars.png      # Project cover
│   ├── Moonlit Journals.png      # Project cover
│   ├── She_Became_In_Silence.png # Poetry collection cover
│   ├── The Hidden Bloodline.png  # Book cover
│   ├── Warmth_That_Burned.png    # Poetry collection cover
│   └── Whispers_of_Earth.png     # Poetry collection cover
│
└── three/
    ├── main.js          # CosmicApp — scene, camera, renderer, and animation loop
    ├── Starfield.js     # Twinkling star particles with custom shader
    ├── HeroMoon.js      # Textured 3D moon with Fresnel rim lighting
    ├── Nebula.js        # FBM noise shader for cosmic cloud background
    ├── Sparkles.js      # Rising warm floating particles
    ├── ShootingStar.js  # Diagonal raining shooting stars
    ├── CursorTrail.js   # 3D particle trail following mouse cursor
    └── BookCards.js     # Shader-based card glow with 3D mouse tilt
```

---

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- (Optional) [Node.js](https://nodejs.org/) for local development server

### Running Locally

```bash
# Clone the repository
git clone https://github.com/your-username/the-luna.git
cd the-luna

# Option 1: Open directly
# Simply open index.html in your browser

# Option 2: Use a local dev server (recommended)
npx live-server --port=3000
```

### Setting Up ASTRA (AI Chat)

The ASTRA widget requires an NVIDIA NIM API key served via a serverless proxy:

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
2. Add your NVIDIA API key to `.env`:
   ```
   NVIDIA_API_KEY=your_key_here
   ```
3. Deploy the `api/astra.js` function to a serverless platform (e.g., Vercel) that supports environment variables.

> **Note:** Without the API key configured, the chat widget will still load — it will simply show a friendly error message when a user tries to send a message.

---

## Typography

| Typeface | Usage | Feel |
|----------|-------|------|
| **Cormorant Garamond** (Serif) | Headings, eyebrows, decorative text | Classic, literary elegance |
| **Inter** (Sans-Serif) | Body text, buttons, UI elements | Clean, modern readability |

---

## Accessibility & SEO

- **ARIA Attributes** — `aria-expanded`, `aria-controls`, and `aria-label` on interactive widgets.
- **Inert Attribute** — Traps focus and prevents interaction with hidden panels (ASTRA chat, expandable modal).
- **Keyboard Navigation** — Escape key closes modals and chat panels.
- **Touch Device Fallback** — Custom cursor is automatically hidden on touch devices via `(hover: none) and (pointer: coarse)` media query.
- **Reduced Motion** — `prefers-reduced-motion: reduce` disables all animations and transitions for users who prefer them off.
- **XSS Protection** — All user input in the ASTRA chat is sanitised via `escapeHTML()` before rendering.
- **Meta Tags** — Open Graph (`og:`) and Twitter Card meta tags for rich social sharing previews.
- **Semantic HTML** — Proper heading hierarchy, `<main>`, `<nav>`, `<section>`, and `<footer>` elements.

---

## License

© 2026 Luna's World. All rights reserved.
