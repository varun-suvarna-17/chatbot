# Aura Health Chatbot (MERN)

A minimal MERN stack health chatbot starter. Dark + purple UI, Express backend with MongoDB, and a server-side AI proxy. Paste your AI key in the server `.env`.

## Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

## Setup

1) Install dependencies
```
cd server && npm i
cd ../client && npm i
```

2) Configure environment
- Create `server/.env` based on below. Replace `YOUR_API_KEY_HERE` and `MONGO_URI` if needed.
```
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/aura_chatbot
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=YOUR_API_KEY_HERE  # <— paste your key here
AI_MODEL=gpt-4o-mini
```

3) Run development
```
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open http://localhost:5173

## Notes
- Frontend uses a dev proxy to `/api` for the backend at `http://localhost:5000`.
- Replace AI provider details in `server/index.js` and `.env` if using another model/vendor.
- Messages are optionally stored in MongoDB for basic history. 