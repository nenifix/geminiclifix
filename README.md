# GeminiCliFix

Google Gemini CLI on Telegram. Built by Nenifix.

## Setup

1. Install dependencies:
   ```
   cd Desktop/geminiclifix
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your bot token:
   ```
   copy .env.example .env
   ```
   Get the token from [@BotFather](https://t.me/BotFather) for `@Geminiclifixbot`.

3. Make sure Gemini CLI is installed and authenticated:
   ```
   npm install -g @google/gemini-cli
   gemini auth
   ```

4. Run:
   ```
   npm run dev      # development with hot reload
   npm run build    # compile TypeScript
   npm start        # run compiled version
   ```

## Commands

- `/start` — Welcome message
- `/help` — List commands
- `/status` — Show model and workspace
- `/reset` — Clear conversation history

## Dev Contact

Nenifix — https://nenifix.xyz — Telegram: @nenifix
