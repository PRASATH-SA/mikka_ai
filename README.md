# MIKKA AI Holographic Tutor

MIKKA AI is an advanced AI tutoring system designed for immersive learning.

## Getting Started

### 1. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Backend runs on `http://localhost:8000`.

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5174`.

## Current Phase: Phase 1 (Voice-only Tutor)
- Web Speech API for Speech-to-Text and Text-to-Speech.
- Holographic/Neon UI with reactive visualizers.
- Basic AI chat integration (mocked for now, ready for LLM/RAG).

## Features
- **Voice Interaction**: Tap the mic to speak, MIKKA AI will listen and respond.
- **Holographic Aesthetic**: Glassmorphism and neon effects tailored for hologram fans.
- **Micro-animations**: Pulse and rotate effects based on interaction state.
