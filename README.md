# 🕹️ Bit Smash

A feature-complete, progressive web application (PWA) arcade game built with **vanilla HTML5 Canvas, CSS3, and ES6 JavaScript**. Features classic Atari Breakout mechanics packed with retro CRT effects, an upgrades system, power-ups, particle explosions, dynamic Web Audio synthesis, and multi-language support.

<img width="1002" height="623" alt="Image" src="https://github.com/user-attachments/assets/19fef38b-e302-417e-8b81-c4b62a24eaee" />

---

## ✨ Features

* **🎮 Complete UI & Menu System:** Dynamic HTML overlays for the Main Menu, Upgrades Shop, Settings, Win Screen, and Lose Screen.
* **⚡ Upgrades & Economy:** Collect coins during gameplay to unlock 5 persistent upgrade paths stored in `localStorage`:
  1. **Paddle Size:** Increases paddle width.
  2. **Ball Speed:** Enhances base ball velocity.
  3. **Extra Life:** Grants additional starting lives.
  4. **Multi-Ball Drop:** Increases chance and utility of extra ball drops.
  5. **Coin Multiplier:** Multiplies earnings per brick destroyed.
* **🎁 Real-Time Power-Ups:** Brick drops yield Multi-Ball, Paddle Expander, and Extra Life power-ups.
* **💥 Particle Physics FX:** Dynamic color-matched particle explosions upon brick destruction.
* **🎵 Synthesized Web Audio & BGM:** Zero-dependency sound effects engine producing sound waves, chiptune hits, win/lose tracks, and background music using the browser's native `AudioContext`.
* **🌐 Multi-Language Support:** Instant toggling between English (`EN`) and Turkish (`TR`).
* **📱 Progressive Web App (PWA):** Offline-ready with service workers and fully installable as a standalone app on mobile and desktop.
* **📺 Retro CRT FX:** Pure CSS CRT screen overlay with scanlines, glass vignette, and phosphor flicker.

---

## 🛠️ Project Structure

```text
bit-smash/
├── index.html     # Game markup & UI overlay screens
├── style.css      # CRT styling, animations & UI theme
├── game.js        # Engine, Web Audio, state management, & physics
├── sw.js          # Service Worker for offline PWA caching
├── manifest.json  # Web App Manifest for mobile installation
└── README.md      # Project documentation
