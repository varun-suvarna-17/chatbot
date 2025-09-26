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

// AI Chat proxy route (n8n webhook variant)
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

		// n8n webhook URL (no API key)
		const AI_WEBHOOK_URL = process.env.AI_WEBHOOK_URL || 'https://learnerscorner.app.n8n.cloud/webhook-test/chatbot';
		const webhookPayload = {
			messages,
			sessionId,
			meta: { source: 'aura-chatbot', timestamp: Date.now() },
		};

		console.log('Sending to webhook:', AI_WEBHOOK_URL);
		console.log('Payload:', JSON.stringify(webhookPayload, null, 2));

		const aiResponse = await fetch(AI_WEBHOOK_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(webhookPayload),
		});

		console.log('Webhook response status:', aiResponse.status);
		console.log('Webhook response headers:', Object.fromEntries(aiResponse.headers.entries()));

		if (!aiResponse.ok) {
			const text = await aiResponse.text();
			console.error('Webhook error response:', text);
			
			// Handle n8n test mode error
			if (aiResponse.status === 404) {
				try {
					const errorData = JSON.parse(text);
					if (errorData.message?.includes('webhook') && errorData.message?.includes('not registered')) {
						// For testing, return a mock response instead of error
						const mockResponse = `I'm Aura, your health assistant! I received your message: "${last?.content || 'Hello'}". 

Note: The n8n webhook is not activated yet. Please click "Execute workflow" in your n8n canvas to enable real AI responses.`;
						
						await Message.create({ role: 'assistant', content: mockResponse, sessionId });
						return res.json({ reply: mockResponse });
					}
				} catch (e) {
					// Fall through to generic error
				}
			}
			
			return res.status(aiResponse.status).json({ error: 'AI webhook error', details: text });
		}

		// Support flexible webhook outputs
		let data;
		const text = await aiResponse.text();
		console.log('Webhook raw response:', text);
		
		try { 
			data = JSON.parse(text); 
			console.log('Parsed JSON response:', data);
		} catch (e) { 
			console.log('Non-JSON response, treating as string');
			data = text; 
		}

		let assistantMessage = 'Sorry, I could not generate a response.';
		if (typeof data === 'string') {
			assistantMessage = data;
		} else if (data?.output) {
			// n8n webhook format
			assistantMessage = data.output;
		} else if (data?.reply) {
			assistantMessage = data.reply;
		} else if (data?.data?.reply) {
			assistantMessage = data.data.reply;
		} else if (Array.isArray(data?.choices) && data.choices[0]?.message?.content) {
			assistantMessage = data.choices[0].message.content;
		}

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