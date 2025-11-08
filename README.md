# Planetary Researchers - Voice Chat Game

An interactive voice chat application where you interview 10 different planetary researchers to identify who is telling the truth about their planet's characteristics.

## Game Concept

Talk to 10 planetary researchers, each claiming to be from a different planet. Each researcher will tell you about 4 characteristics of their planet:
- Average temperature
- Planet color/appearance
- Ocean coverage percentage
- Gravity

**The Challenge**: 9 of the 10 researchers are imposters who know some facts correctly but lie about others. Only ONE researcher (Voice 6 - Earth Research Station) tells the complete truth about all four facts.

Each imposter knows 2 facts correctly and lies about the other 2 facts. Use your conversational skills to identify inconsistencies and find the trustworthy researcher!

## Tech Stack

- **React 19** + **TypeScript** + **Vite** - Modern frontend framework
- **Google Gemini AI** - Powers conversational AI responses
- **ElevenLabs** - Text-to-speech for voice synthesis
- **Web Speech API** - Voice recognition for user input

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or pnpm
- API keys for:
  - Google Gemini API
  - ElevenLabs API

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (use `.env.example` as template):
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to the URL shown in the terminal

## How to Play

1. Select a planetary researcher from the list
2. Click the microphone button and ask them about their planet
3. Listen to their voice response
4. Take notes about what each researcher tells you
5. Compare answers to find contradictions
6. Identify the one truthful researcher!

## Project Structure

```
src/
├── data/
│   ├── marsFacts.ts      # AI prompt generation logic
│   └── voices.ts         # Voice/character definitions
├── hooks/
│   └── useVoiceRecording.ts  # Voice recording custom hook
├── services/
│   ├── elevenlabs.ts     # Text-to-speech service
│   └── gemini.ts         # AI chat service
├── App.tsx               # Main application component
└── main.tsx              # Application entry point
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
