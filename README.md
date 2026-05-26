<div align="center">

# 💍 Forever and Always

### A 1st Wedding Anniversary Gift for Shivani ♥️

*A handcrafted digital love letter — built with stars, strokes, and a whole lot of love.*

</div>

---

## ✨ What is this?

**Forever and Always** is a personal anniversary web experience built for **Prabhu & Shivani's 1st Wedding Anniversary (May 28, 2026)**. It's a cinematic, interactive celebration featuring:

- 🎬 **Netflix-style intro** — dramatic reveal before the main page
- 🌌 **Galaxy background** — animated star field with floating hearts and nebula clouds
- 💌 **Tegaki-style love letter** — the anniversary message written in animated handwritten strokes using real Caveat font glyph data
- 🖼️ **Photo gallery** — curated memories from their first year together
- 🎬 **Video gallery** — video moments from the journey
- 📖 **Timeline** — a visual story of their relationship milestones
- 🎵 **Music player** — plays *Adi Penne* and *Sidu Sidu* as background music
- 💫 **Mouse trail** — hearts and sparkles follow your cursor (and finger on touch screens)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build tool | [Vite](https://vitejs.dev/) |
| Styling | Vanilla CSS + [Tailwind CSS](https://tailwindcss.com/) |
| Animation | [Framer Motion](https://motion.dev/) |
| Handwriting | [Caveat](https://fonts.google.com/specimen/Caveat) font glyph stroke data |
| Icons | [Lucide React](https://lucide.dev/) |
| Rendering | SVG stroke-based text + Canvas-based particle effects |

---

## 🚀 Run Locally

**Prerequisites:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── GalaxyBackground.tsx   # Canvas star field & nebula
│   ├── Gallery.tsx            # Photo gallery
│   ├── LoveLetter.tsx         # Tegaki handwritten letter (SVG strokes)
│   ├── MouseTrail.tsx         # Canvas-based cursor particle effect
│   ├── MusicPlayer.tsx        # Audio player with playlist
│   ├── NetflixIntro.tsx       # Cinematic intro animation
│   ├── Timeline.tsx           # Relationship milestone timeline
│   └── VideoGallery.tsx       # Video memories gallery
├── songs/
│   ├── adi-penne.mp3
│   └── sidu-sidu.mp3
├── images/                    # Wedding & couple photos
├── videos/                    # Video memories
└── App.tsx                    # Root app & page layout

caveat/
├── glyphData.json             # Caveat font stroke point data (used by LoveLetter)
└── bundle.ts                  # Font data source
```

---

## 💌 The Letter

The love letter is rendered using a **tegaki (手書き) style** — each character is drawn stroke-by-stroke using the raw bezier point data extracted from the Caveat handwriting font. Characters appear one by one as if being written in real time.

Emoji (❤, 🥰, 🫂) are rendered as custom hand-drawn SVG shapes that spring-pop into place at their natural position in the text flow.

---

<div align="center">

Made with ❤️ for the most special person in the world

*Happy 1st Anniversary, Shivani* 🌸

</div>
