import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiSubmitFeedback } from '../api'

const CATEGORIES = ['Food Quality','Hygiene','Portion Size','Variety','Other']

export default function Feedback() {
  const [form, setForm] = useState({ rating:0, category:'Food Quality', comment:'' })
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const ratingLabels = ['','Poor','Fair','Good','Great','Excellent']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.rating) { setAlert({ type:'error', msg:'Please give a star rating.' }); return }
    setLoading(true)
    try {
      await apiSubmitFeedback(form)
      setAlert({ type:'success', msg:'Thank you for your feedback!' })
      setForm({ rating:0, category:'Food Quality', comment:'' })
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch { setAlert({ type:'error', msg:'Could not submit. Try again.' })
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'calc(100vh - 56px)', background:'linear-gradient(135deg,#f0faf6,#e8f4fd)', padding:'2rem 1.25rem' }}>
      <div style={{ maxWidth:480, margin:'0 auto' }}>
        <button className="back-btn" onClick={() => navigate('/dashboard')}><i className="ti ti-arrow-left" />Back to Dashboard</button>
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:'0.5rem' }}>Food Feedback</h2>
        <p style={{ color:'#6b6b65', marginBottom:'1.5rem', fontSize:13 }}>Help us improve your mess experience</p>

        <div className="card-lg">
          {alert && <div className={`alert alert-${alert.type}`}><i className={`ti ti-${alert.type==='error'?'alert-circle':'circle-check'}`} />{alert.msg}</div>}
          <form onSubmit={handleSubmit}>
            {/* Star rating */}
            <div className="form-group">
              <label>Overall rating</label>
              <div style={{ display:'flex', gap:8, marginTop:6, alignItems:'center' }}>
                {[1,2,3,4,5].map(n => (
                  <span key={n} onClick={() => setForm({...form, rating:n})}
                    style={{ fontSize:32, cursor:'pointer', color: n<=form.rating ? '#EF9F27' : '#e0ddd5', transition:'color 0.1s, transform 0.1s', display:'inline-block' }}
                    onMouseEnter={e => e.currentTarget.style.transform='scale(1.2)'}
                    onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                  >★</span>
                ))}
                {form.rating > 0 && <span style={{ fontSize:13, color:'#854F0B', fontWeight:600, marginLeft:4 }}>{ratingLabels[form.rating]}</span>}
              </div>
            </div>

            {/* Category chips */}
            <div className="form-group">
              <label>Category</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:6 }}>
                {CATEGORIES.map(c => (
                  <button type="button" key={c} onClick={() => setForm({...form, category:c})}
                    style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${form.category===c ? '#1D9E75' : 'rgba(0,0,0,0.12)'}`, background: form.category===c ? '#E1F5EE' : '#fff', color: form.category===c ? '#0F6E56' : '#6b6b65', fontSize:13, fontWeight: form.category===c ? 600 : 400, cursor:'pointer' }}
                  >{c}</button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Suggestions or issues</label>
              <textarea rows={4} placeholder="Tell us how we can improve the mess service..." value={form.comment} onChange={e => setForm({...form, comment:e.target.value})} />
            </div>

            <button className="btn-primary" style={{ width:'100%', padding:'11px', fontSize:15 }} disabled={loading}>
              {loading ? 'Submitting...' : <><i className="ti ti-send" style={{ marginRight:6 }} />Submit Feedback</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
