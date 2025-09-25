import React from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/SignUp.jsx'
import Chat from './pages/Chat.jsx'

export default function App(){
	return (
		<BrowserRouter>
			<div className="app">
				<header className="header">
					<Link to="/" className="brand" style={{ textDecoration: 'none' }}>💜 Aura</Link>
					<div className="subtitle">Health Chatbot</div>
				</header>
				<div className="content">
					<Routes>
						<Route path="/" element={<Landing />} />
						<Route path="/signin" element={<SignIn />} />
						<Route path="/signup" element={<SignUp />} />
						<Route path="/chat" element={<Chat />} />
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</div>
				<footer className="footer">
					<div className="note">This chatbot provides informational guidance and is not a substitute for professional medical advice.</div>
				</footer>
			</div>
		</BrowserRouter>
	)
} 