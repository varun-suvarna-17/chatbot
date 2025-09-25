import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function SignUp(){
	const navigate = useNavigate()
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)

	async function onSubmit(e){
		e.preventDefault()
		setLoading(true)
		setTimeout(() => { // mock
			setLoading(false)
			navigate('/chat')
		}, 800)
	}

	return (
		<main className="chat" style={{ alignItems:'center' }}>
			<form onSubmit={onSubmit} className="card" style={{ width:'100%', maxWidth:420 }}>
				<h2 style={{ marginTop:0 }}>Create account</h2>
				<label>Name</label>
				<input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Jane Doe" required />
				<label>Email</label>
				<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required />
				<label>Password</label>
				<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" required />
				<button className="btn primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Sign Up'}</button>
				<div style={{ display:'flex', gap:8 }}>
					<Link to="/chat" className="btn" role="button">Go to Chat</Link>
					<Link to="/signin" className="btn" role="button">Sign in</Link>
				</div>
			</form>
		</main>
	)
}
