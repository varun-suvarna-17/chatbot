import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aura_chatbot';
mongoose
	.connect(MONGO_URI)
	.then(() => console.log('MongoDB connected'))
	.catch((err) => console.error('MongoDB connection error:', err));

// Simple Message schema (optional persistence)
const messageSchema = new mongoose.Schema(
	{
		role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
		content: { type: String, required: true },
		sessionId: { type: String, index: true },
	},
	{ timestamps: true }
);
const Message = mongoose.model('Message', messageSchema);

app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' });
});

// AI Chat proxy route
app.post('/api/chat', async (req, res) => {
	try {
		const { messages, sessionId } = req.body || {};
		if (!Array.isArray(messages) || messages.length === 0) {
			return res.status(400).json({ error: 'messages array is required' });
		}

		// Persist last user message (optional)
		const last = messages[messages.length - 1];
		if (last?.role === 'user' && last?.content) {
			await Message.create({ role: 'user', content: last.content, sessionId });
		}

		// Replace with your provider endpoint. Using OpenAI-style as example.
		const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
		const AI_API_KEY = process.env.AI_API_KEY || '';
		if (!AI_API_KEY) {
			return res.status(500).json({ error: 'AI_API_KEY not set on server' });
		}

		const providerPayload = {
			model: process.env.AI_MODEL || 'gpt-4o-mini',
			messages,
			temperature: 0.2,
		};

		const aiResponse = await fetch(AI_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${AI_API_KEY}`,
			},
			body: JSON.stringify(providerPayload),
		});

		if (!aiResponse.ok) {
			const text = await aiResponse.text();
			return res.status(aiResponse.status).json({ error: 'AI provider error', details: text });
		}

		const data = await aiResponse.json();
		const assistantMessage = data?.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

		// Persist assistant reply (optional)
		await Message.create({ role: 'assistant', content: assistantMessage, sessionId });

		res.json({ reply: assistantMessage });
	} catch (error) {
		console.error('Chat error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
}); 