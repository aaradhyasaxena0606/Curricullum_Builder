# Ethical Study Guide

An AI-powered study assistant designed to promote ethical learning and academic integrity.

## Features

- **AI Chat Assistant**: Get help understanding concepts without cheating
- **Curriculum Generator**: Create personalized study plans
- **Ethical Guidelines**: Built-in safeguards to prevent academic dishonesty

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn-ui + Tailwind CSS
- **Backend**: Supabase Edge Functions
- **AI**: Google Gemini API

## Getting Started

### Prerequisites

- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase account
- Google Gemini API key

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd ethical-study-guide-main

# Install dependencies
npm install

# Set up environment variables
# Create a .env file with:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
# GEMINI_API_KEY=your_gemini_api_key

# Start the development server
npm run dev
```

## Supabase Setup

1. Create a new Supabase project
2. Deploy Edge Functions:
   - `chat-assistant`
   - `generate-curriculum`
3. Set the `GEMINI_API_KEY` secret in Supabase Dashboard
4. Configure JWT settings (disable "Verify JWT with legacy secret")

## Deployment

You can deploy this project to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

Build the production bundle:
```sh
npm run build
```

## Security Notes

- Never commit `.env` files to Git
- Rotate API keys if exposed
- Use Supabase Row Level Security (RLS) policies

## License

MIT
