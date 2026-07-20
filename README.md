# ✨ Luna's World

A magical, single-page author universe built for **G Daffini Shiyalin (Luna)** — a cosmic poet and storyteller. The website showcases her published books, poetry collections, creative projects, and provides a portal for readers to connect with her.

> *Stories, poetry, dreams, and worlds beyond imagination.*

---

## Features

### Core Experience
- **Single Page Application (SPA)** — Client-side hash routing (`#home`, `#books`, `#poetry`, `#projects`, `#contact`) swaps views instantly without page reloads.
- **Cosmic Loading Screen** — A pulsing moon glyph with an animated progress bar greets visitors while assets load, then fades out gracefully.
- **Immersive Poetry Reader** — A dedicated full-screen book view with page-flipping animations and integrated **Text-to-Speech (TTS)**, allowing readers to listen to Luna's verses.
- **Expandable Bento Grid Modal** — Click any book or project card to open a smooth, scale-animated modal with cover art, metadata, and action links. Closes via Escape, backdrop click, or the × button.

### Visual Design
- **Cosmic Design System** — Curated palettes featuring deep purples (`#845EC2`), mid-tones (`#9B89B3`), warm taupe (`#D5CABD`), and soft cream/beige for an immersive night-sky atmosphere.
- **Glassmorphism UI** — Translucent, frosted-glass cards with `backdrop-filter: blur()`, subtle hover lifts, and glowing borders.
- **Custom Cursor** — A dual-element cursor (dot + glow) that follows the mouse and scales up when hovering over interactive elements. Gracefully falls back to default on touch devices.
- **Ambient Navigation** — A dynamic spotlight follows the mouse across the nav bar, with an ambient glowing underline tracking the active section.

### Three.js WebGL Background
A full-page Three.js canvas renders behind all content, creating a living cosmic backdrop:

| Module | Description |
|--------|-------------|
| **Starfield** | Twinkling stars spread across a sphere with shader-based twinkle animation. |
| **HeroMoon** | A textured, Fresnel-lit 3D moon sphere that maps to the DOM hero section with auto-rotation. |
| **Nebula** | A full-screen FBM noise shader creating drifting, colour-shifting cosmic clouds. |
| **Sparkles** | Warm floating particles that rise infinitely with gentle horizontal sway. |
| **ShootingStar** | Simultaneous shooting stars raining diagonally across the screen. |
| **CursorTrail** | A 3D particle trail following the mouse cursor. |
| **BookCards** | Shader-based glowing edges on book cards with 3D tilt on mouse hover. |

### Functional Integrations
- **ASTRA (AI Chat Assistant)**: A floating chat widget powered by the **NVIDIA NIM API** (Gemma 4 31B model). Features a cosmic, poetic personality tuned to Luna's brand, typing indicators, and markdown formatting.
- **Contact Form**: Fully functional and serverless, powered by **Google Apps Script**. Messages are sent directly without requiring a dedicated backend database.

---

## Core Web Vitals & Performance

- **Zero CLS Architecture** — Native `font-display: optional` handling, explicit `aspect-ratio` on all images, and bulletproof SPA routing guarantee a perfect 0.000 Cumulative Layout Shift.
- **Responsive WebP Images** — Art-directed `<picture>` tags and `srcset` serve perfectly sized, next-gen WebP images, slashing LCP times by over 80%.
- **Preload Optimization** — Critical fonts are preloaded with `crossorigin="anonymous"` to ensure instantaneous text rendering.
- **High-DPI WebGL Scaling** — Three.js pixel ratio clamping ensures 60 FPS performance without burning GPU cycles on Retina displays.

---

## Tech Stack

This project adheres to a **zero-build-step philosophy**, focusing on raw browser performance:

| Layer | Technology |
|-------|------------|
| Structure | HTML5 (semantic) + Responsive `<picture>` tags |
| Styling | Vanilla CSS3 — custom properties, Flexbox/Grid, glassmorphism |
| Logic | Vanilla JavaScript — DOM manipulation, IntersectionObserver, hash-based SPA routing |
| 3D Graphics | Three.js (loaded dynamically via lazy imports — no bundler required) |
| AI Backend | Serverless function (`api/astra.js`) proxying to NVIDIA NIM API |
| Contact API | Google Apps Script Web App |
| Fonts | Google Fonts — Cormorant Garamond & Outfit/Inter (Inline `@font-face`) |

---

## File Structure

```text
The Luna/
├── index.html          # Main HTML document with all SPA sections
├── styles.css          # Complete design system, animations, and responsive rules
├── script.js           # SPA routing, cursor logic, ASTRA chat, TTS Poetry reader, modals
├── .env.example        # Template for NVIDIA API key
├── README.md           # Project documentation (you are here)
│
├── api/
│   └── astra.js        # Serverless proxy for NVIDIA NIM API with rate limiting
│
├── assets/
│   └── optimized/      # Next-gen WebP images and book covers
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

To run the project on your machine with hot-reloading, you can use `live-server` via Node.js. In the project root directory, run:

```bash
npx live-server --port=3100
```

Then open `http://localhost:3100` in your web browser.


### Setting Up Integrations

#### ASTRA (AI Chat)
The ASTRA widget requires an NVIDIA NIM API key served via a serverless proxy:
1. Copy the environment template: `cp .env.example .env`
2. Add your NVIDIA API key to `.env`.
3. Deploy the `api/astra.js` function to a serverless platform (e.g., Vercel) that supports environment variables.

#### Contact Form
1. Deploy a Google Apps Script that accepts POST requests and forwards emails.
2. Update the `googleScriptUrl` variable in `script.js` with your deployed Web App URL.

---

## Typography

| Typeface | Usage | Feel |
|----------|-------|------|
| **Cormorant Garamond** (Serif) | Headings, eyebrows, decorative text, poetry verses | Classic, literary elegance |
| **Outfit / Inter** (Sans-Serif) | Body text, buttons, UI elements | Clean, modern readability |

---

## Accessibility & SEO

- **ARIA Attributes** — `aria-expanded`, `aria-controls`, and `aria-label` on interactive widgets.
- **Inert Attribute** — Traps focus and prevents interaction with hidden panels (ASTRA chat, expandable modal).
- **Keyboard Navigation** — Escape key closes modals, books, and chat panels.
- **Touch Device Fallback** — Custom cursor is automatically hidden on touch devices.
- **Reduced Motion** — `prefers-reduced-motion: reduce` disables all animations and transitions.
- **XSS Protection** — All user input in the ASTRA chat is sanitised.
- **Semantic HTML** — Proper heading hierarchy, `<main>`, `<nav>`, `<section>`, and `<footer>` elements.

---

## License

© 2026 Luna's World. All rights reserved.
