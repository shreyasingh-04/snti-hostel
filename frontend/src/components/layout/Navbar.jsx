import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav style={{
      background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)',
      padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#1D9E75,#0F6E56)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ti ti-building-community" style={{ fontSize: 17, color: '#fff' }} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, color: '#1a1a18' }}>Snti Hostel</p>
          <p style={{ fontSize: 11, color: '#9b9b95', lineHeight: 1 }}>Mess Portal</p>
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <>
            <div style={{ textAlign: 'right', marginRight: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{user.name}</p>
              <p style={{ fontSize: 11, color: '#9b9b95' }}>{user.role === 'admin' ? 'Administrator' : user.trainee_type}</p>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: user.role === 'admin' ? '#FAEEDA' : '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: user.role === 'admin' ? '#854F0B' : '#0F6E56' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => { logout(); navigate('/login') }}>
              <i className="ti ti-logout" style={{ marginRight: 4 }} />Logout
            </button>
          </>
        ) : (
          <Link to="/login"><button className="btn-primary" style={{ padding: '7px 18px', fontSize: 13 }}>Login</button></Link>
        )}
      </div>
    </nav>
  )
}
