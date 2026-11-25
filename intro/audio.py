"""Builds the soundtrack: a 7-bar slice of the song starting on a downbeat, stretched by a
hair so 28 beats last exactly 13.000 s, plus synthesized UI sounds placed by their peaks."""
import json, subprocess, sys
import numpy as np

SR = 48000
SONG = sys.argv[1]
OUT = "out/audio.wav"
START = 16.770          # measured downbeat (s) in the source recording
BPM_SRC = 129.3         # measured tempo
T = 13.0                # loop length in the video: 28 beats
BEAT = T / 28
src_len = 28 * 60 / BPM_SRC
at = lambda n: n * BEAT

# 1. Slice + stretch with ffmpeg (atempo keeps the pitch).
raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-ss", f"{START:.4f}", "-t", f"{src_len + 0.2:.4f}", "-i", SONG,
     "-af", f"atempo={src_len / T:.6f}", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
    capture_output=True, check=True).stdout
music = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()[: int(T * SR)]
music /= np.abs(music).max() / 0.86
fade = int(0.012 * SR)
music[:fade] *= np.linspace(0, 1, fade)[:, None]
music[-fade:] *= np.linspace(1, 0, fade)[:, None]

# 2. UI sounds.
rng = np.random.default_rng(7)
def env(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def bandnoise(n, lo, hi):
    spec = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(spec, n)
def tone(n, hz): return np.sin(2 * np.pi * hz * np.arange(n) / SR)
def click(pitch=1900, body=0.012, gain=1.0):
    n = int(0.07 * SR)
    x = 0.9 * bandnoise(n, 1800, 7000) * env(n, 0.0022) + 0.45 * tone(n, pitch) * env(n, body)
    return gain * x / np.abs(x).max()
def key():
    n = int(0.04 * SR)
    x = bandnoise(n, 3500, 11000) * env(n, 0.0013) + 0.25 * tone(n, 3100) * env(n, 0.006)
    return 0.55 * x / np.abs(x).max()
def thock(hz, gain):
    n = int(0.09 * SR)
    x = 0.5 * bandnoise(n, 900, 4000) * env(n, 0.0018) + tone(n, hz) * env(n, 0.022)
    return gain * x / np.abs(x).max()
def chime():
    n = int(0.45 * SR)
    a = np.minimum(1, np.arange(n) / (0.004 * SR))
    x = a * (tone(n, 880) * env(n, 0.16) + 0.6 * tone(n, 1318.5) * env(n, 0.11) + 0.25 * tone(n, 1760) * env(n, 0.07))
    return 0.5 * x / np.abs(x).max()

events = []
for t in (at(1), at(6), at(7), at(11), at(21)): events.append((t, click()))
events.append((at(19), click(pitch=1500, body=0.016)))                       # toggle
for i in range(6): events.append((at(2) + i * BEAT / 4, key()))               # typing "chrome"
events.append((at(4), key()))                                                  # arrow down
events.append((at(5), click(pitch=1650, gain=0.9)))                            # enter
events.append((at(13), key()))                                                 # counter tick
events.append((at(15), thock(420, 0.7))); events.append((at(17.5), thock(560, 0.55)))   # grab / let go
events.append((at(22), thock(420, 0.7))); events.append((at(22.75), thock(560, 0.55)))
events.append((at(24), chime()))                                               # published

ui = np.zeros(len(music))
log = []
for t, s in events:
    peak = int(np.argmax(np.abs(s)))                 # place each sound by its measured peak
    start = int(round(t * SR)) - peak
    a, b = max(0, start), min(len(ui), start + len(s))
    ui[a:b] += s[a - start : b - start]
    log.append((round(t, 3), round(peak / SR * 1000, 2)))
mix = music + 0.32 * ui[:, None]
mix /= max(1.0, np.abs(mix).max() / 0.97)

import wave
with wave.open(OUT, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
print(f"{OUT}: {len(mix) / SR:.3f} s, {len(events)} UI sounds; (time s, peak offset ms):", log[:6], "...")
