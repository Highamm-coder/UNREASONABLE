# Anthropic Workbench Chatbot

A modern web interface for chatting with Claude AI using the Anthropic API.

## Setup

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your API key:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

4. Start the server:
   ```bash
   npm start
   ```
   Or for development:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:3000`

## Features

- Modern, responsive chat interface
- Real-time messaging with Claude
- Loading states and error handling
- Secure API key handling via server-side environment variables
- Mobile-friendly design

## Files

- `index.html` - Main chat interface
- `styles.css` - UI styling
- `script.js` - Frontend JavaScript
- `server.js` - Express server with API proxy
- `package.json` - Node.js dependencies
- `.env` - Environment variables (API key)# UNREASONABLE
