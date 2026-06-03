import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const tiles = [
  { icon:'ti-salad', label:'Select Menu', sub:'Choose your meals for the day', path:'/menu', color:'#E1F5EE', iconColor:'#0F6E56' },
  { icon:'ti-eye', label:'My Menu', sub:'View your saved meal choices', path:'/my-menu', color:'#E6F1FB', iconColor:'#185FA5' },
  { icon:'ti-message-dots', label:'Feedback', sub:'Rate food and share suggestions', path:'/feedback', color:'#FAEEDA', iconColor:'#854F0B' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const expiresDays = user?.expires_at
    ? Math.ceil((new Date(user.expires_at) - new Date()) / (1000*60*60*24))
    : null

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: 'linear-gradient(135deg, #f0faf6 0%, #e8f4fd 100%)', padding: '2rem 1.25rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Welcome card */}
        <div style={{ background: 'linear-gradient(135deg,#1D9E75,#0F6E56)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position:'absolute', right:-20, top:-20, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
          <div style={{ position:'absolute', right:40, bottom:-30, width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
          <p style={{ fontSize:13, opacity:0.8, marginBottom:4 }}>Welcome back 👋</p>
          <h2 style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>{user?.name}</h2>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <span style={{ background:'rgba(255,255,255,0.2)', borderRadius:20, padding:'3px 12px', fontSize:12 }}>{user?.trainee_type}</span>
            <span style={{ background:'rgba(255,255,255,0.2)', borderRadius:20, padding:'3px 12px', fontSize:12 }}>{user?.hostel_block}</span>
            <span style={{ background:'rgba(255,255,255,0.2)', borderRadius:20, padding:'3px 12px', fontSize:12 }}>{user?.mess_type} Mess</span>
          </div>
          {expiresDays && expiresDays < 30 && (
            <div style={{ marginTop:12, background:'rgba(255,255,255,0.15)', borderRadius:8, padding:'8px 12px', fontSize:12 }}>
              <i className="ti ti-alert-triangle" style={{ marginRight:6 }} />
              Your account expires in {expiresDays} days
            </div>
          )}
        </div>

        {/* Action tiles */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:14 }}>
          {tiles.map(t => (
            <button key={t.path} onClick={() => navigate(t.path)}
              style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:14, padding:'1.5rem', textAlign:'left', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <div style={{ width:44, height:44, borderRadius:12, background:t.color, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                <i className={`ti ${t.icon}`} style={{ fontSize:22, color:t.iconColor }} />
              </div>
              <p style={{ fontWeight:600, fontSize:15, marginBottom:3 }}>{t.label}</p>
              <p style={{ fontSize:12, color:'#9b9b95' }}>{t.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
