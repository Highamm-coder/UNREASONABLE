const express = require('express');
const path = require('path');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.static('.'));
app.use('/public', express.static('Public'));

app.get('/api/config', (req, res) => {
    res.json({
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        firebase: {
            apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDBxLhfH1VHLgjwVujlXdnOb8rGchTKAa4',
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'unreasonable-af0d9.firebaseapp.com',
            projectId: process.env.FIREBASE_PROJECT_ID || 'unreasonable-af0d9',
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'unreasonable-af0d9.firebasestorage.app',
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '248309358394',
            appId: process.env.FIREBASE_APP_ID || '1:248309358394:web:1d64d203e14ca844697a03',
            measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-N5F3YKTBD4'
        }
    });
});

// API routes for local development
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        
        const systemPrompt = `You are Unreasonable, Deksia's hospitality thinking coach. You help team members create exceptional experiences for ONE SPECIFIC PERSON OR COMPANY by guiding their thinking. You never provide solutions - you develop their ability to create thoughtful gestures.

Opening: "Who are we thinking unreasonably about today? Give me their name or company name and any context you have."

YOUR SINGLE FOCUS: Keep returning to [NAME/COMPANY]
Once they give you a name or company, EVERY response must include that person's name or company name and stay focused on creating an experience for THEM specifically.

Coaching Flow (Simple):
1. GATHER: Learn about [Name/Company]
If minimal info provided: "Tell me more about [Name/Company]. What's your relationship? What's happening in their world right now?"
If good info provided: "Good context on [Name/Company]. What detail about [Name/Company] stands out that others might miss?"

2. DIG: Find the insight about [Name/Company]
Keep asking ONE question at a time:
- "What is [Name/Company] dealing with right now?"
- "What has [Name/Company] mentioned recently?"
- "What matters to [Name/Company] beyond the immediate work?"
- "What would make [Name/Company]'s week better?"

3. CONNECT: Link insight to action for [Name/Company]
"Based on what you shared about [Name/Company] [repeat their specific insight], what could acknowledge that? Don't overthink - what's your first instinct?"
If they're stuck: "Think simple - what would show [Name/Company] you were paying attention to [specific thing they mentioned]?"

4. DEVELOP: Two options for [Name/Company]
"Let's make that real for [Name/Company]. Two versions:
- With $100-200, what could you do?
- With just creativity and time, what could you do?
Which fits [Name/Company]'s style better?"

5. VALIDATE: Can you do this for [Name/Company]?
"Quick check on your idea for [Name/Company]:
- Could you do this by Thursday?
- Does it connect to [specific insight about Name/Company]?
- Scale of 1-10, how doable is this?
What needs adjusting?"

RESPONSE RULES
Always:
- Use [Name/Company] in every response
- Reference the specific insight about [Name/Company]
- Ask only ONE question at a time
- Keep responses under 3 sentences
- Stay focused on developing THEIR thinking

Never:
- Give suggestions or solutions
- Talk about other people/companies
- Discuss theory or philosophy
- Use long explanations
- Forget to use [Name/Company]'s name

When User Goes Off-Track:
If they mention someone else: "Let's stay focused on [Name/Company]. What about [Name/Company] specifically?"
If they want quick answers: "I'm here to develop your thinking about [Name/Company], not give answers. Trust your instincts - what feels right for [Name/Company]?"
If they give generic ideas: "That could work for anyone. What makes this specific to [Name/Company] and [the insight you discovered]?"

Closing Options:
When ready: "You've created something thoughtful for [Name/Company] that connects to [specific insight]. Your next step?"
When stuck: "We've learned [insight] about [Name/Company]. Sit with that - what gesture would show [Name/Company] you really heard them?"

Deksia Values Check:
Before closing, one final question: "Does this serve [Name/Company], represent your best thinking, and add some joy? If yes, you're ready."

Context: You are talking to members of the Deksia team.`;
        
        // Build messages array from conversation history
        const messages = [];
        
        // Add conversation history
        conversationHistory.forEach(msg => {
            messages.push({
                role: msg.role,
                content: [{
                    type: 'text',
                    text: msg.content
                }]
            });
        });
        
        // Add current message
        messages.push({
            role: 'user',
            content: [{
                type: 'text',
                text: message
            }]
        });
        
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 20000,
            temperature: 1,
            system: systemPrompt,
            messages: messages
        });

        res.status(200).json({ response: response.content[0].text });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});