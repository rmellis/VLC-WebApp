# 🚦 VLC WebApp Clone

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

A functional clone of VLC media player, built entirely using Vanilla JavaScript, HTML, and CSS. 

This project brings a VLC like experience directly into the web browser, leveraging modern Web APIs to recreate the most iconic features—including the 200% volume booster, dynamic aspect ratio controls, video snapshots, and real-time hardware-accelerated video effects. No frameworks, no external libraries (aside from [Phosphor Icons](https://phosphoricons.com/)), just pure web technologies.

<img width="728" height="556" alt="image" src="https://github.com/user-attachments/assets/752b6b56-88fb-4d34-ad4f-eeb9a04124a8" />

---

## ✨ Core Features & UI Paradigm

### 🖥️ Authentic Desktop Interface
* **Native Cursor Override:** The app globally enforces the native desktop arrow cursor (`cursor: default`) to break the "web page" illusion, only allowing text cursors in input fields.
* **Draggable Modal Windows:** Settings, Effects, and About dialog boxes can be clicked and draged around the viewport.
* **Classic Menu Bar:** The top menu bar mimics native desktop logic. Click a menu to open it, hover over adjacent menus to dynamically switch between them, and click outside to close.
* **Smart Context Menu:** Right-clicking the video player opens a custom context menu. It features boundary detection, meaning if you right-click near the edge of the screen, the nested menus will dynamically flip to the left to prevent getting cut off.
* **Fullscreen Auto-Hiding Controls:** When entering Fullscreen mode, a draggable floating control bar appears. It tracks mouse movement and automatically fades out after 4 seconds of inactivity.

### 🎥 Video Engine
* **Universal Playback:** Play local `.mp4`, `.webm`, `.ogg` files, paste direct network stream URLs, or paste YouTube video links (which dynamically embed via iframe).
* **Live Capture Devices:** Stream directly from your local webcam or connected capture cards (like Elgato) using the `getUserMedia` API.
* **Dynamic Aspect Ratios:** Force video dimensions to `16:9`, `16:10`, `4:3`, `1:1`, or `2.35:1`. The app bypasses intrinsic CSS limitations by mathematically calculating screen boundaries and stretching pixels via `object-fit: fill`.
* **Hardware-Accelerated Video FX:** Adjust Brightness, Contrast, Saturation, Hue, and Sepia on the fly using CSS filters. Includes 5 built-in presets (Grayscale, High Contrast, Trippy, etc.). *These effects apply to local videos, YouTube iframes, AND live webcams!*
* **Take Snapshot:** Captures the exact frame of the video currently playing, applies your active Video FX to the image, draws it to a hidden HTML canvas, and instantly prompts a PNG download.
* **Picture-in-Picture:** Native PiP support for popping the video out of the browser.

### 🔊 Audio Engine
* **200% Volume Booster:** Replicates VLC's famous volume overdrive, visually represented by a custom triangle SVG slider.
* **10-Band Graphic Equalizer:** Manipulate frequencies ranging from 60Hz to 16kHz using the Web Audio API `BiquadFilterNode`.
* **3D Spatial Audio:** Toggleable HRTF (Head-Related Transfer Function) spatial panning that dynamically tracks your mouse position on the screen to alter the origin of the sound.

### 🔤 Subtitles & Playlist
* **On-the-fly SRT Conversion:** Load local `.srt` subtitle files. The webapp dynamically parses the text, converts the timestamps to standard `WEBVTT` format, generates a blob, and injects it into the video player.
* **Playlist Management:** Drag-and-drop local files into the player to queue up to 12 tracks. Open the playlist overlay to view durations, shuffle the queue, set loops, or click the "X" to remove tracks dynamically.

### 🎙️ Experimental Tools
* **Voice Control:** Uses the `webkitSpeechRecognition` API. Click the microphone icon and say "Play", "Stop", "Next", or "Back" to control the player hands-free.
* **Audio Recording:** Uses the `MediaRecorder` API to capture local microphone audio and outputs it as a downloadable `.webm` file in the "Recorded Files" dialog.

---

## ⌨️ Keyboard Shortcuts

This app is heavily mapped for power users.

| Key / Hotkey | Action |
| :--- | :--- |
| `Space` | Play / Pause |
| `S` | Stop Playback |
| `N` / `P` | Next Track / Previous Track |
| `F` | Toggle Fullscreen |
| `M` | Toggle Mute |
| `A` | Cycle Aspect Ratios |
| `[ ` / ` ]` | Decrease / Increase Playback Speed (0.25x to 4.0x) |
| `Arrow Right / Left`| Seek Forward / Backward 10 Seconds |
| `Arrow Up / Down` | Volume Up / Down 10% |
| `Shift + S` | Take Video Snapshot (.png) |
| `Shift + R` | Start / Stop Microphone Recording |
| `Ctrl + O` | Open Local Media |
| `Ctrl + N` / `Ctrl + V`| Prompt for Network/YouTube Stream |
| `Ctrl + C` | Open Capture Device (Webcam) |
| `Ctrl + E` | Open Effects and Filters Dialog |
| `Ctrl + L` | Toggle Playlist View |

---

## 🚀 Installation & Usage

Because this app utilizes raw HTML, CSS, and JS, no build steps or `npm` installations are required.

1. Clone or download this repository.
2. Ensure all three files (`index.html`, `style.css`, `script.js`) are in the same directory.
3. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Brave).
or use at vlc.ywa.app

**⚠️ Important Note on Web APIs:** Due to modern browser security policies, features like the **Webcam Capture Device** and **Voice Control** *require* a secure context. They will work perfectly if you open the local HTML file directly from your hard drive (`file:///`), or if you host the app on a server that uses **HTTPS**. They will be blocked by the browser if hosted on a standard HTTP connection.

---

## 📜 License & Disclaimer
This is an open-source project released under the [GNU/GPL2 License](LICENSE).

*Disclaimer: This web application is an independent, because i felt liek it clone project. It is **not** affiliated with, endorsed by, or associated with VideoLAN or the official VLC media player. Part of [ywa.app](https://ywa.app).*
