import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiLogin, apiGetMe } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { data } = await apiLogin(form)
      localStorage.setItem('token', data.access_token)
      const me = await apiGetMe()
      login(data.access_token, me.data)
      navigate(me.data.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'linear-gradient(135deg, #f0faf6 0%, #e8f4fd 100%)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg,#1D9E75,#0F6E56)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <i className="ti ti-building-community" style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Welcome back</h1>
          <p style={{ color: '#6b6b65', marginTop: 4 }}>Snti Hostel Mess Portal</p>
        </div>

        <div className="card-lg">
          {error && <div className="alert alert-error"><i className="ti ti-alert-circle" />{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" required placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Password</label>
              <input type="password" required placeholder="Enter password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '11px', fontSize: 15 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#6b6b65' }}>
            New trainee? <Link to="/register" style={{ color: '#1D9E75', fontWeight: 600 }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
