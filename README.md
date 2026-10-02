# Audio Captcha, Visualizer and Voice Control

A browser app built with [p5.js](https://p5js.org/), p5.sound, p5.speech and [Meyda](https://meyda.js.org/) that explores three ideas in audio processing: an audio captcha, visualisations driven by audio features, and voice commands.

## Features

### Audio Captcha

Plays a spoken word that has been scrambled with random audio effects and mixed with white noise. You type the word you hear and submit it to check your answer.

- Random scrambling each time you play: band-pass filter, distortion, delay and reverb.
- A live visualisation of the processed sound.
- Reload to switch to the next word.

### Audio Feature Visualizer

Choose one of three sounds and Meyda extracts audio features in real time to drive a particle-ring visualisation.

| Track | Features used |
|-------|---------------|
| Ex2 Sound 1 | RMS (loudness), spectral centroid (brightness), zero crossing rate |
| Ex2 Sound 2 | RMS, spectral rolloff, zero crossing rate |
| Ex2 Sound 3 | RMS, spectral centroid, spectral rolloff |

### Voice Control

Play the music track and click **Start Voice**, then speak commands to change the visualisation while the music plays:

| Say | Effect |
|-----|--------|
| `black`, `white`, `red`, `blue`, `green` | Change the background colour |
| `square`, `triangle`, `circle`, `pentagon` | Change the shape of the particles |

A phrase can contain both a colour and a shape.

## Run Locally

The app loads audio files and uses the microphone, so serve it from a local web server. You need Python 3, a microphone, an internet connection (the Meyda library loads from a CDN) and a browser with speech recognition support, such as Chrome.

```bash
git clone https://github.com/ayeshaatif07/Audio-Captcha-Visualizer.git
cd Audio-Captcha-Visualizer
python3 -m http.server 8000
```

Then:

1. Open http://localhost:8000 in Chrome.
2. Click once on the page so the browser allows audio.
3. Allow microphone access when asked, if you use voice commands.

Press `Ctrl+C` in the terminal to stop the server.

## Project Structure

| File / folder | Purpose |
|---------------|---------|
| `index.html` | Page, instructions and script loading |
| `style.css` | Styling |
| `sketch.js` | p5 setup and draw loop that connects the three parts |
| `audioCaptcha.js` | The audio captcha: scrambling, noise, UI and answer checking |
| `meydaEngine.js` | Plays audio and extracts features with Meyda |
| `audioVisualizer.js` | Track selector and the feature-driven visualisation |
| `voiceController.js` | Voice recognition and the colour and shape commands |
| `utils.js` | Helper functions |
| `Ex2_files/` | Audio files used by the app |
| `libraries/` | p5.js, p5.sound and p5.speech |

## Author and Credits

- **Author:** Ayesha Atif
- **Coursework:** Intelligent Signal Processing (CM3065) – Midterm (Exercise 2)
- Built with [p5.js](https://p5js.org/), [p5.sound](https://p5js.org/reference/#/libraries/p5.sound), p5.speech and [Meyda](https://meyda.js.org/).
