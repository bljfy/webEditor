export const RENDERER_SHARED_CSS = `
.render-root {
  --ink: #10213a;
  --muted: #5e708d;
  --line: #d8e2f0;
  --panel: #ffffff;
  --bg: #f3f6fb;
  --accent: #1f6feb;
  --accent-2: #ff9e57;
  --radius: 14px;
  color: var(--ink);
  background:
    radial-gradient(circle at 7% 10%, rgba(31, 111, 235, 0.12), transparent 26%),
    radial-gradient(circle at 93% 0%, rgba(255, 158, 87, 0.12), transparent 24%),
    var(--bg);
  padding: 8px;
  border-radius: 10px;
  position: relative;
  overflow: visible;
  max-width: 1320px;
  margin: 0 auto;
}

.render-root::after {
  content: "";
  position: sticky;
  top: 0;
  display: block;
  height: 0;
  pointer-events: none;
  z-index: 0;
  box-shadow:
    0 -120px 240px color-mix(in srgb, var(--accent) 12%, transparent),
    0 120px 240px color-mix(in srgb, var(--accent-2) 10%, transparent);
}

.render-root[data-theme="dark"] {
  --ink: #e7f0ff;
  --muted: #93a8c9;
  --line: #1f3553;
  --panel: #0d1b2d;
  --bg: #06111e;
  --accent: #72d9ff;
}

.render-noise {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.08;
  background-image: radial-gradient(currentcolor 0.45px, transparent 0.45px);
  background-size: 3px 3px;
  color: #9bb0c7;
  z-index: 0;
}

.render-topbar,
.render-hero,
.render-section {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--panel);
  position: relative;
  z-index: 1;
}

.render-topbar {
  position: sticky;
  top: 8px;
  z-index: 5;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  backdrop-filter: blur(8px);
  background: color-mix(in srgb, var(--panel) 80%, transparent);
  box-shadow: 0 10px 22px color-mix(in srgb, #000 15%, transparent);
}

.render-topbar nav {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.render-nav-link {
  color: var(--muted);
  text-decoration: none;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 12px;
  transition: all 0.28s ease;
}

.render-nav-link:hover {
  color: var(--ink);
  border-color: color-mix(in srgb, var(--accent) 55%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 24%, transparent) inset;
}

.render-nav-link.active {
  color: #fff;
  border-color: color-mix(in srgb, var(--accent) 76%, transparent);
  background: color-mix(in srgb, var(--accent) 28%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 32%, transparent) inset;
}

.render-hero {
  margin-top: 10px;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  transform: translateY(calc(var(--scroll-y, 0px) * 0.02));
  animation: heroFloatIn 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

.hero-eyebrow {
  color: var(--accent);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.render-hero h2 {
  margin: 6px 0;
}

.render-hero p {
  margin: 0;
  color: var(--muted);
}

.hero-stats {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.hero-stats article {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 6px;
  background: color-mix(in srgb, var(--panel) 92%, var(--accent) 8%);
  transition: transform 0.25s ease;
}

.hero-stats strong {
  display: block;
}

.hero-stats article:hover {
  transform: translateY(-2px);
}

.hero-gallery {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 6px;
}

.hero-main {
  grid-row: span 2;
}

.hero-main,
.hero-sub {
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.hero-main:hover,
.hero-sub:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 24px color-mix(in srgb, #000 20%, transparent);
}

.hero-gallery img,
.media-card img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.media-open-trigger {
  all: unset;
  display: block;
  width: 100%;
  height: 100%;
  cursor: zoom-in;
}

.render-section {
  margin-top: 10px;
  padding: 11px;
  overflow: hidden;
  scroll-margin-top: 86px;
}

.render-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 20%, color-mix(in srgb, var(--accent) 10%, transparent) 48%, transparent 75%);
  transform: translateX(-100%);
  transition: transform 1.2s ease;
  pointer-events: none;
}

.render-section header h3 {
  margin: 0;
}

.render-section header p {
  margin: 2px 0 8px;
  color: var(--muted);
}

.section-grid {
  display: grid;
  gap: 8px;
}

.section-grid-narrative {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.section-grid-strip {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.section-grid-strip::-webkit-scrollbar {
  height: 8px;
}

.section-grid-strip::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--accent) 42%, transparent);
  border-radius: 999px;
}

.section-grid-model {
  grid-template-columns: 1.2fr 1fr;
}

.model-secondary-grid {
  display: grid;
  gap: 8px;
}

.section-grid-atlas {
  grid-template-columns: 1.2fr 1fr 1fr;
}

.section-grid-masonry {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.section-grid-masonry .media-card {
  margin-bottom: 0;
  break-inside: auto;
}

.section-grid-masonry .media-open-trigger,
.section-grid-masonry .media-card img {
  aspect-ratio: 4 / 5;
  width: 100%;
  height: auto;
  object-fit: cover;
}

.section-grid-masonry .media-body h4 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-grid-masonry .media-body p {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-grid-strip .media-open-trigger,
.section-grid-strip .media-card img {
  aspect-ratio: 16 / 10;
}

.section-grid-atlas .media-card:first-child {
  grid-row: span 2;
}

.narrative-card,
.media-card {
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  background: color-mix(in srgb, var(--panel) 92%, var(--accent) 8%);
  transition:
    transform 0.35s cubic-bezier(0.2, 0.7, 0.1, 1),
    box-shadow 0.35s ease,
    border-color 0.35s ease;
}

.media-card {
  scroll-snap-align: start;
  position: relative;
}

.narrative-card:hover,
.media-card:hover {
  transform: translateY(-6px);
  border-color: color-mix(in srgb, var(--accent) 46%, var(--line));
  box-shadow: 0 18px 28px color-mix(in srgb, #000 22%, transparent);
}

.narrative-card {
  padding: 10px;
}

.narrative-card h4,
.media-body h4 {
  margin: 0 0 4px;
}

.narrative-card p,
.media-body p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

.media-placeholder {
  min-height: 140px;
  display: grid;
  place-items: center;
  color: var(--muted);
  background:
    linear-gradient(130deg, color-mix(in srgb, var(--accent) 16%, var(--bg)), color-mix(in srgb, var(--accent-2) 12%, var(--bg))),
    repeating-linear-gradient(-45deg, #eef3fb, #eef3fb 10px, #f7faff 10px, #f7faff 20px);
  position: relative;
}

.media-placeholder::before,
.media-placeholder::after {
  content: "";
  position: absolute;
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
}

.media-placeholder::before {
  inset: 22% 16%;
}

.media-placeholder::after {
  inset: 38% 30%;
}

.media-body {
  padding: 8px;
}

.zoom-hint {
  position: absolute;
  right: 8px;
  top: 8px;
  font-size: 11px;
  color: #fff;
  background: color-mix(in srgb, #000 48%, transparent);
  border-radius: 999px;
  padding: 2px 7px;
  pointer-events: none;
}

.section-anim {
  opacity: 0;
  transform: translateY(22px);
  transition: transform 0.85s cubic-bezier(0.2, 0.7, 0.1, 1), opacity 0.85s ease;
}

.section-anim.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-anim.visible::before {
  transform: translateX(42%);
}

.image-modal {
  position: fixed;
  inset: 0;
  background: rgba(3, 5, 8, 0.92);
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
}

.image-modal-content {
  width: min(1100px, 96vw);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--accent) 38%, transparent);
  background: #000;
}

.image-modal img {
  width: 100%;
  max-height: 82vh;
  object-fit: contain;
  display: block;
}

.image-modal-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(15, 22, 30, 0.95);
  color: #ecf4ff;
}

.image-modal-nav {
  display: flex;
  gap: 8px;
}

.image-modal-bar button {
  border: 1px solid color-mix(in srgb, var(--accent) 34%, transparent);
  background: rgba(24, 38, 53, 0.8);
  color: inherit;
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
}

.render-footer {
  margin-top: 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--panel) 88%, var(--accent) 12%), color-mix(in srgb, var(--panel) 90%, var(--accent-2) 10%));
  padding: 14px;
  display: grid;
  grid-template-columns: 1.2fr 1fr auto;
  gap: 10px;
  align-items: center;
  position: relative;
  z-index: 1;
  box-shadow: 0 14px 28px color-mix(in srgb, #000 12%, transparent);
}

.render-footer-brand strong {
  display: block;
  font-size: 14px;
  letter-spacing: 0.04em;
}

.render-footer-brand p {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 12px;
}

.render-footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.render-footer-links a {
  text-decoration: none;
  color: var(--ink);
  border: 1px solid color-mix(in srgb, var(--line) 74%, var(--accent) 26%);
  border-radius: 999px;
  padding: 3px 9px;
  font-size: 12px;
  background: color-mix(in srgb, var(--panel) 78%, transparent);
  transition: all 0.28s ease;
}

.render-footer-links a:hover {
  border-color: color-mix(in srgb, var(--accent) 55%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 24%, transparent) inset;
}

.render-footer-copy {
  justify-self: end;
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
}

@keyframes heroFloatIn {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 1080px) {
  .render-hero,
  .section-grid-model,
  .section-grid-atlas {
    grid-template-columns: 1fr;
  }

  .hero-main {
    grid-row: auto;
  }

  .render-topbar {
    top: 4px;
  }

  .section-grid-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .section-grid-masonry {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .section-grid-atlas .media-card:first-child {
    grid-row: auto;
  }
}

@media (min-width: 1500px) {
  .render-root {
    max-width: 1640px;
  }

  .section-grid-strip {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .section-grid-narrative {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .section-grid-atlas {
    grid-template-columns: 1.4fr 1fr 1fr 1fr;
  }

  .section-grid-masonry {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .section-grid-atlas,
  .section-grid-model {
    grid-template-columns: 1fr;
  }

  .section-grid-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .section-grid-masonry {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .media-placeholder {
    min-height: 120px;
  }

  .render-footer {
    grid-template-columns: 1fr;
    text-align: left;
  }

  .render-footer-links {
    justify-content: flex-start;
  }

  .render-footer-copy {
    justify-self: start;
  }
}

@media (max-width: 640px) {
  .render-topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .render-topbar nav {
    width: 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 4px;
    white-space: nowrap;
  }

  .render-root {
    padding: 6px;
  }

  .render-section {
    padding: 9px;
  }

  .section-grid-strip {
    grid-auto-flow: column;
    grid-auto-columns: minmax(170px, 1fr);
    grid-template-columns: none;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .section-grid-strip .media-card {
    min-width: 0;
  }

  .section-grid-narrative {
    grid-template-columns: 1fr;
  }

  .section-grid-strip {
    scrollbar-width: thin;
  }

  .section-grid-masonry {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .image-modal-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .image-modal-nav {
    width: 100%;
  }

  .image-modal-nav button,
  .image-modal-bar > button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .render-root *,
  .render-root *::before,
  .render-root *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;
