# Claudemotion – Intro (YouTube Short)

Eine Form, die sich durch 11 UI-Zustände morpht, 7 Takte, 1080×1920, 60 fps, nahtloser Loop von exakt 13,000 s.

| Datei | Zweck |
| --- | --- |
| `src/index.html` | Die Animation. `seek(t)` setzt jeden Stil allein aus der Zeit (Federn als geschlossene Sprungantworten, periodisch summiert). |
| `build.mjs` | Bettet Schrift (Geist) und Clip-Frames ein → `dist/claudemotion-intro.html` (eine Datei). |
| `render.cjs` | Playwright: `beats` (ein Standbild pro Beat), `loop` (Naht prüfen), `full` (4 Unterframes pro Frame, per `tmix` zu Bewegungsunschärfe gemischt). |
| `audio.py` | Schneidet 7 Takte ab einem gemessenen Downbeat, streckt sie auf 13,000 s und legt die synthetisierten UI-Sounds mit ihrer Spitze auf die Events. |

```bash
node build.mjs
node render.cjs beats      # Kontrolle
node render.cjs full       # → out/video-only.mp4
python3 audio.py song.wav  # → out/audio.wav (Song nicht im Repo)
ffmpeg -i out/video-only.mp4 -i out/audio.wav -c:v copy -c:a aac -b:a 192k -shortest out/claudemotion-intro.mp4
```

Der verwendete Song („AKAI – Slowed“) ist nicht lizenzfrei und liegt deshalb nicht im Repo.
