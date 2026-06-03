import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGetMyMenu } from '../api'

const MEALS = [
  { key:'breakfast', label:'Breakfast', icon:'ti-sun', color:'#E1F5EE', iconColor:'#0F6E56', time:'7:00 – 9:00 AM' },
  { key:'lunch', label:'Lunch', icon:'ti-bowl', color:'#E6F1FB', iconColor:'#185FA5', time:'12:30 – 2:30 PM' },
  { key:'dinner', label:'Dinner', icon:'ti-moon', color:'#FAEEDA', iconColor:'#854F0B', time:'7:30 – 9:30 PM' },
]

export default function MyMenu() {
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    apiGetMyMenu().then(r => setMenu(r.data)).catch(() => setMenu(null)).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight:'calc(100vh - 56px)', background:'linear-gradient(135deg,#f0faf6,#e8f4fd)', padding:'2rem 1.25rem' }}>
      <div style={{ maxWidth:480, margin:'0 auto' }}>
        <button className="back-btn" onClick={() => navigate('/dashboard')}><i className="ti ti-arrow-left" />Back to Dashboard</button>
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:'0.5rem' }}>My Saved Menu</h2>
        <p style={{ color:'#6b6b65', marginBottom:'1.5rem', fontSize:13 }}>Your current meal selections</p>

        {loading && <div className="spinner" />}

        {!loading && !menu && (
          <div style={{ background:'#fff', borderRadius:14, padding:'3rem', textAlign:'center', border:'1px solid rgba(0,0,0,0.08)' }}>
            <i className="ti ti-salad" style={{ fontSize:40, color:'#d3d1c7', display:'block', marginBottom:12 }} />
            <p style={{ color:'#6b6b65', marginBottom:16 }}>No menu saved yet.</p>
            <button className="btn-primary" onClick={() => navigate('/menu')}>Select Your Menu</button>
          </div>
        )}

        {!loading && menu && (
          <>
            {MEALS.map(m => (
              <div key={m.key} style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:14, padding:'1.25rem', marginBottom:12, display:'flex', alignItems:'center', gap:14, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ width:48, height:48, borderRadius:12, background:m.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className={`ti ${m.icon}`} style={{ fontSize:22, color:m.iconColor }} />
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:12, color:'#9b9b95', marginBottom:2 }}>{m.label} · {m.time}</p>
                  <p style={{ fontWeight:600, fontSize:15 }}>{menu[m.key] || '—'}</p>
                </div>
                <i className="ti ti-circle-check" style={{ fontSize:18, color:'#1D9E75' }} />
              </div>
            ))}
            <button className="btn-ghost" style={{ width:'100%', marginTop:8 }} onClick={() => navigate('/menu')}>
              <i className="ti ti-edit" style={{ marginRight:6 }} />Change Menu
            </button>
          </>
        )}
      </div>
    </div>
  )
}
