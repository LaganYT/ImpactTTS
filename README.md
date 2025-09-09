# Edge TTS Text-to-Speech App

A Next.js application that uses the @andresaya/edge-tts library to convert text to speech and provide downloadable audio files.

## Features

- Convert text to speech using Microsoft Edge TTS voices
- Adjustable speech rate and pitch
- Audio playback controls
- Download generated audio as MP3 files
- Modern, responsive UI with custom CSS

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter text in the textarea (up to 1000 characters)
2. Select a voice from the dropdown
3. Adjust speech rate (percentage) and pitch (Hz) using the sliders
4. Click "Generate Speech" to create the audio
5. Use the audio controls to play/pause the generated speech
6. Click "Download Audio" to save the MP3 file

## API Endpoints

- `POST /api/tts` - Generate speech from text
- `GET /api/tts` - Get available voices

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Custom CSS
- @andresaya/edge-tts

## Voice Options

The app includes voices that are loaded dynamically from the Edge TTS service.
