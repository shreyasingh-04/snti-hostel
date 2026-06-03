import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGetMenuOptions, apiGetMyMenu, apiSaveMenu } from '../api'

const MEALS = [
  { key:'breakfast', label:'Breakfast', icon:'ti-sun', color:'#E1F5EE', iconColor:'#0F6E56', time:'7:00 – 9:00 AM' },
  { key:'lunch', label:'Lunch', icon:'ti-bowl', color:'#E6F1FB', iconColor:'#185FA5', time:'12:30 – 2:30 PM' },
  { key:'dinner', label:'Dinner', icon:'ti-moon', color:'#FAEEDA', iconColor:'#854F0B', time:'7:30 – 9:30 PM' },
]

export default function SelectMenu() {
  const [options, setOptions] = useState({ breakfast:[], lunch:[], dinner:[] })
  const [selections, setSelect] = useState({ breakfast:'', lunch:'', dinner:'' })
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([apiGetMenuOptions(), apiGetMyMenu().catch(() => null)])
      .then(([optRes, menuRes]) => {
        const grouped = { breakfast:[], lunch:[], dinner:[] }
        optRes.data.forEach(o => grouped[o.meal]?.push(o.item_name))
        setOptions(grouped)
        if (menuRes) setSelect({ breakfast: menuRes.data.breakfast||'', lunch: menuRes.data.lunch||'', dinner: menuRes.data.dinner||'' })
      })
  }, [])

  const handleSave = async () => {
    if (!selections.breakfast || !selections.lunch || !selections.dinner) {
      setAlert({ type:'error', msg:'Please select all three meals.' }); return
    }
    setLoading(true)
    try {
      await apiSaveMenu(selections)
      setAlert({ type:'success', msg:'Menu saved! Redirecting...' })
      setTimeout(() => navigate('/my-menu'), 1200)
    } catch { setAlert({ type:'error', msg:'Failed to save. Try again.' })
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'calc(100vh - 56px)', background:'linear-gradient(135deg,#f0faf6,#e8f4fd)', padding:'2rem 1.25rem' }}>
      <div style={{ maxWidth:540, margin:'0 auto' }}>
        <button className="back-btn" onClick={() => navigate('/dashboard')}><i className="ti ti-arrow-left" />Back to Dashboard</button>
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:'0.5rem' }}>Select Your Menu</h2>
        <p style={{ color:'#6b6b65', marginBottom:'1.5rem', fontSize:13 }}>Choose your preferred meals for each session</p>

        {alert && <div className={`alert alert-${alert.type}`}><i className={`ti ti-${alert.type==='error'?'alert-circle':'circle-check'}`} />{alert.msg}</div>}

        {MEALS.map(meal => (
          <div key={meal.key} style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.08)', borderRadius:14, padding:'1.25rem', marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
              <div style={{ width:46, height:46, borderRadius:12, background:meal.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className={`ti ${meal.icon}`} style={{ fontSize:22, color:meal.iconColor }} />
              </div>
              <div>
                <p style={{ fontWeight:600, fontSize:15 }}>{meal.label}</p>
                <p style={{ fontSize:12, color:'#9b9b95' }}>{meal.time}</p>
              </div>
            </div>
            <select value={selections[meal.key]} onChange={e => setSelect({...selections, [meal.key]: e.target.value})}>
              <option value="">-- Choose your {meal.label.toLowerCase()} --</option>
              {options[meal.key].map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        ))}

        <button className="btn-primary" style={{ width:'100%', padding:'12px', fontSize:15, marginTop:8 }} onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : <><i className="ti ti-device-floppy" style={{ marginRight:6 }} />Save My Menu</>}
        </button>
      </div>
    </div>
  )
}
