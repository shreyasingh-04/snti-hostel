import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiRegister } from '../api'

const INITIAL = { name:'', email:'', trainee_id:'', trainee_type:'', hostel_block:'', mess_type:'', password:'', confirm:'' }

export default function Register() {
  const [form, setForm] = useState(INITIAL)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const set = f => e => setForm({...form, [f]: e.target.value})

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const { confirm, ...payload } = form
      await apiRegister(payload)
      setSuccess('Registration successful! Redirecting...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) { setError(err.response?.data?.detail || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'linear-gradient(135deg, #f0faf6 0%, #e8f4fd 100%)' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#1D9E75,#0F6E56)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <i className="ti ti-clipboard-list" style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Mess Registration</h1>
          <p style={{ color: '#6b6b65', marginTop: 4 }}>Fill in your details to register</p>
        </div>

        <div className="card-lg">
          {error && <div className="alert alert-error"><i className="ti ti-alert-circle" />{error}</div>}
          {success && <div className="alert alert-success"><i className="ti ti-circle-check" />{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group"><label>Full name</label><input required placeholder="Your full name" value={form.name} onChange={set('name')} /></div>
              <div className="form-group"><label>Email address</label><input type="email" required placeholder="email@snti.in" value={form.email} onChange={set('email')} /></div>
              <div className="form-group"><label>Trainee ID</label><input required placeholder="e.g. T-2024-001" value={form.trainee_id} onChange={set('trainee_id')} /></div>
              <div className="form-group">
                <label>Trainee type</label>
                <select required value={form.trainee_type} onChange={set('trainee_type')}>
                  <option value="">Select type</option>
                  <option>Vocational Trainee</option>
                  <option>Pre-Trainee</option>
                </select>
              </div>
              <div className="form-group">
                <label>Hostel block</label>
                <select required value={form.hostel_block} onChange={set('hostel_block')}>
                  <option value="">Select block</option>
                  <option>Block A</option><option>Block B</option><option>Block C</option><option>Block D</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mess type</label>
                <select required value={form.mess_type} onChange={set('mess_type')}>
                  <option value="">Select mess</option>
                  <option>Veg</option><option>Non-Veg</option><option>Special</option>
                </select>
              </div>
              <div className="form-group"><label>Password</label><input type="password" required placeholder="Min. 6 characters" value={form.password} onChange={set('password')} /></div>
              <div className="form-group"><label>Confirm password</label><input type="password" required placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} /></div>
            </div>
            <button className="btn-primary" style={{ width:'100%', padding:'11px', fontSize:15, marginTop:4 }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:14, fontSize:13, color:'#6b6b65' }}>
            Already registered? <Link to="/login" style={{ color:'#1D9E75', fontWeight:600 }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
