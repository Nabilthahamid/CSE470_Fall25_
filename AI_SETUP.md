# 🤖 AI Features Setup Guide

## OpenAI API Key Configuration

To enable AI-powered features (like AI Comparison Insights), you need to add your OpenAI API key to your environment variables.

### Step 1: Add API Key to .env File

Open your `.env` file in the project root and add:

```env
OPENAI_API_KEY=your-api-key-here
```

### Step 2: Restart Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

### Step 3: Test AI Features

1. Go to the Compare Products page
2. Add 2 or more products to comparison
3. Click "Show AI Insights"
4. You should see AI-powered analysis using OpenAI GPT

## How It Works

- **With API Key**: Uses OpenAI GPT-3.5-turbo for sophisticated AI analysis
- **Without API Key**: Falls back to rule-based analysis (still works, but less sophisticated)

## Cost Information

- **GPT-3.5-turbo**: ~$0.002 per 1K tokens (very affordable)
- **Average Analysis**: ~500-1000 tokens per comparison
- **Cost per Analysis**: ~$0.001-0.002 (less than 1 cent)

## Security Notes

⚠️ **Important**:

- Never commit your `.env` file to Git
- The `.env` file is already in `.gitignore`
- Keep your API key secret
- Regenerate your key if it's ever exposed

## Troubleshooting

If AI features don't work:

1. Check that `OPENAI_API_KEY` is in your `.env` file
2. Verify the API key is correct (no extra spaces)
3. Restart your development server
4. Check browser console for errors
5. Verify you have credits in your OpenAI account

## Current AI Features Enabled

✅ **AI Comparison Insights** - Analyzes compared products with AI

## Future AI Features

Once the API key is configured, you can also enable:

- AI Product Recommendations
- AI Chatbot
- AI PC Builder Assistant
- AI Product Description Generator

See `AI_INTEGRATION_GUIDE.md` for more details.
