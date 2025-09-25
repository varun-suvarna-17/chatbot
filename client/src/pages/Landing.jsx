import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing(){
	return (
		<main className="chat" style={{ alignItems:'center', justifyContent:'center', textAlign:'center' }}>
			<h1 style={{ margin: 0 }}>Meet <span style={{ color:'#c4b5fd' }}>Aura</span></h1>
			<p style={{ color:'var(--sub)', maxWidth:600 }}>
				Your AI-powered health companion for quick guidance and answers. Start a conversation or create an account to sync your sessions.
			</p>
			<div style={{ display:'flex', gap:12, marginTop:12 }}>
				<Link to="/signin" className="btn primary">Get Started</Link>
				<a href="https://github.com/" className="btn" target="_blank" rel="noreferrer">Learn More</a>
			</div>
		</main>
	)
}
