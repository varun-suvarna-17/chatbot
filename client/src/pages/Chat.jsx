import React, { useEffect, useRef, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export default function Chat(){
	const [sessionId] = useState(() => Math.random().toString(36).slice(2))
	const [messages, setMessages] = useState([
		{ role: 'assistant', content: 'Hi! I am Aura, your health assistant. How can I help you today?' },
	])
	const [input, setInput] = useState('')
	const [loading, setLoading] = useState(false)
	const endRef = useRef(null)

	useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

	async function sendMessage(e){
		e?.preventDefault()
		const text = input.trim()
		if (!text || loading) return
		const nextMessages = [...messages, { role: 'user', content: text }]
		setMessages(nextMessages)
		setInput('')
		setLoading(true)
		try {
			const res = await fetch(`${API_BASE}/api/chat`, {
				method:'POST', headers:{ 'Content-Type':'application/json' },
				body: JSON.stringify({ messages: nextMessages, sessionId })
			})
			const data = await res.json()
			if(!res.ok) throw new Error(data?.error || 'Request failed')
			setMessages((prev)=>[...prev, { role:'assistant', content:data.reply }])
		}catch(err){
			setMessages((prev)=>[...prev, { role:'assistant', content:'Sorry, something went wrong while contacting the AI.' }])
		}finally{ setLoading(false) }
	}

	return (
		<div className="chat-page">
			<main className="chat chat-scroll">
				{messages.map((m, i) => (
					<div key={i} className={`message ${m.role}`}>
						<div className="bubble">{m.content}</div>
					</div>
				))}
				{loading && (
					<div className="message assistant">
						<div className="bubble typing"><span></span><span></span><span></span></div>
					</div>
				)}
				<div ref={endRef} />
			</main>
			<form className="composer" onSubmit={sendMessage}>
				<input type="text" placeholder="Ask a health question..." value={input} onChange={(e)=>setInput(e.target.value)} aria-label="Chat message" />
				<button disabled={loading || !input.trim()}>{loading ? 'Sending...' : 'Send'}</button>
			</form>
		</div>
	)
}
