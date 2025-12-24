#!/bin/bash

# Discord Server Stats Bot - Startup Script

echo "🚀 Starting Discord Server Stats Bot..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file based on .env.example"
    exit 1
fi

# Start the bot
node bot.js
