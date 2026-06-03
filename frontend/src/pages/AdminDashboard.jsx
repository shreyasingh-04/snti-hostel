import { useState, useEffect, useRef } from 'react'
import { apiGetStats, apiGetAllUsers, apiGetRegistrations, apiGetAllFeedback,
         apiDeleteExpired, apiExportExcel, apiGetMenuOptions,
         apiAddMenuOption, apiDeleteMenuOption, apiUploadStudents } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'

const TABS = [
  { id:'overview', label:'Overview', icon:'ti-layout-dashboard' },
  { id:'students', label:'Students', icon:'ti-users' },
  { id:'registrations', label:'Registrations', icon:'ti-clipboard-list' },
  { id:'feedback', label:'Feedback', icon:'ti-star' },
  { id:'menus', label:'Manage Menus', icon:'ti-salad' },
  { id:'upload', label:'Bulk Upload', icon:'ti-upload' },
]

export default function AdminDashboard() {
  const [tab, setTab]               = useState('overview')
  const [stats, setStats]           = useState(null)
  const [users, setUsers]           = useState([])
  const [regs, setRegs]             = useState([])
  const [feedback, setFeedback]     = useState([])
  const [options, setOptions]       = useState([])
  const [newItem, setNewItem]       = useState({ meal:'breakfast', item_name:'' })
  const [alert, setAlert]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const fileRef = useRef()

  const showAlert = (type, msg) => { setAlert({type, msg}); setTimeout(() => setAlert(null), 4000) }

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, u, r, f, o] = await Promise.all([
        apiGetStats(), apiGetAllUsers(), apiGetRegistrations(),
        apiGetAllFeedback(), apiGetMenuOptions()
      ])
      setStats(s.data); setUsers(u.data); setRegs(r.data)
      setFeedback(f.data); setOptions(o.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  const handleDeleteExpired = async () => {
    if (!window.confirm('Delete all expired trainee accounts? This cannot be undone.')) return
    const { data } = await apiDeleteExpired()
    showAlert('success', `Deleted ${data.deleted} expired account(s).`)
    loadAll()
  }

  const handleAddOption = async () => {
    if (!newItem.item_name.trim()) return
    try {
      const { data } = await apiAddMenuOption(newItem)
      setOptions([...options, data])
      setNewItem({...newItem, item_name:''})
    } catch { showAlert('error', 'Failed to add item.') }
  }

  const handleDeleteOption = async (id) => {
    await apiDeleteMenuOption(id)
    setOptions(options.filter(o => o.id !== id))
  }

  const handleUpload = async () => {
    if (!uploadFile) return
    try {
      const { data } = await apiUploadStudents(uploadFile)
      setUploadResult(data)
      loadAll()
    } catch { showAlert('error', 'Upload failed. Check CSV format.') }
  }

  const ratingData = [1,2,3,4,5].map(r => ({ name:`${r}★`, count: feedback.filter(f => f.rating===r).length }))
  const messData = ['Veg','Non-Veg','Special'].map(m => ({ name:m, value: users.filter(u => u.mess_type===m).length }))
  const PIE_COLORS = ['#1D9E75','#185FA5','#854F0B']

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.trainee_id.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <div style={{ textAlign:'center' }}>
        <div className="spinner" style={{ margin:'0 auto 12px' }} />
        <p style={{ color:'#6b6b65' }}>Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', minHeight:'calc(100vh - 56px)' }}>
      {/* Sidebar */}
      <div style={{ width:220, background:'#fff', borderRight:'1px solid rgba(0,0,0,0.08)', padding:'1.25rem 0', flexShrink:0, display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'0 1rem 1rem', borderBottom:'1px solid rgba(0,0,0,0.06)', marginBottom:'0.5rem' }}>
          <p style={{ fontSize:11, fontWeight:600, color:'#9b9b95', textTransform:'uppercase', letterSpacing:'0.06em' }}>Admin Panel</p>
        </div>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 1rem', border:'none', background: tab===t.id ? '#E1F5EE' : 'transparent', color: tab===t.id ? '#0F6E56' : '#6b6b65', fontWeight: tab===t.id ? 600 : 400, fontSize:14, cursor:'pointer', textAlign:'left', borderLeft: tab===t.id ? '3px solid #1D9E75' : '3px solid transparent', transition:'all 0.15s' }}
          >
            <i className={`ti ${t.icon}`} style={{ fontSize:17 }} />{t.label}
          </button>
        ))}
        <div style={{ flex:1 }} />
        <div style={{ padding:'1rem', borderTop:'1px solid rgba(0,0,0,0.06)' }}>
          <button className="btn-primary" style={{ width:'100%', fontSize:13, padding:'8px' }} onClick={apiExportExcel}>
            <i className="ti ti-table-export" style={{ marginRight:6 }} />Export Excel
          </button>
          <button className="btn-danger" style={{ width:'100%', fontSize:13, padding:'8px', marginTop:8 }} onClick={handleDeleteExpired}>
            <i className="ti ti-trash" style={{ marginRight:6 }} />Delete Expired
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1, overflow:'auto', background:'#F4F6F9', padding:'1.5rem' }}>
        {alert && (
          <div className={`alert alert-${alert.type}`} style={{ marginBottom:'1rem', maxWidth:600 }}>
            <i className={`ti ti-${alert.type==='error'?'alert-circle':'circle-check'}`} />{alert.msg}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {tab==='overview' && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:'1.25rem' }}>Dashboard Overview</h2>

            {/* Stats grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))', gap:12, marginBottom:'1.5rem' }}>
              {[
                { label:'Total Trainees', value:stats?.total_trainees??0, icon:'ti-users', color:'#E1F5EE', ic:'#0F6E56' },
                { label:'Vocational', value:stats?.vocational??0, icon:'ti-briefcase', color:'#E6F1FB', ic:'#185FA5' },
                { label:'Pre-Trainees', value:stats?.pre_trainee??0, icon:'ti-school', color:'#EEEDFE', ic:'#534AB7' },
                { label:'Menus Saved', value:stats?.menus_saved??0, icon:'ti-salad', color:'#FAEEDA', ic:'#854F0B' },
                { label:'Avg Rating', value:`${stats?.avg_rating??0}★`, icon:'ti-star', color:'#FFF3CD', ic:'#856404' },
                { label:'Expiring Soon', value:stats?.expiring_soon??0, icon:'ti-clock', color:'#FCEBEB', ic:'#A32D2D' },
              ].map(s => (
                <div key={s.label} style={{ background:'#fff', borderRadius:12, padding:'1rem', border:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <p style={{ fontSize:12, color:'#9b9b95', marginBottom:6 }}>{s.label}</p>
                      <p style={{ fontSize:26, fontWeight:700 }}>{s.value}</p>
                    </div>
                    <div style={{ width:38, height:38, borderRadius:10, background:s.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <i className={`ti ${s.icon}`} style={{ fontSize:18, color:s.ic }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px,1fr))', gap:14 }}>
              <div style={{ background:'#fff', borderRadius:12, padding:'1.25rem', border:'1px solid rgba(0,0,0,0.07)' }}>
                <p style={{ fontWeight:600, marginBottom:'1rem', fontSize:14 }}>Feedback Ratings</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={ratingData}>
                    <XAxis dataKey="name" tick={{ fontSize:12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize:12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4,4,0,0]}>
                      {ratingData.map((_,i) => <Cell key={i} fill="#1D9E75" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background:'#fff', borderRadius:12, padding:'1.25rem', border:'1px solid rgba(0,0,0,0.07)' }}>
                <p style={{ fontWeight:600, marginBottom:'1rem', fontSize:14 }}>Mess Type Distribution</p>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={messData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({name,value}) => value>0?`${name}: ${value}`:''}>
                      {messData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {tab==='students' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:10 }}>
              <h2 style={{ fontSize:20, fontWeight:700 }}>All Students ({filteredUsers.length})</h2>
              <input placeholder="Search name, email, ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ width:260 }} />
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Trainee ID</th><th>Type</th><th>Block</th><th>Mess</th><th>Registered</th><th>Expires</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u => {
                    const expDays = u.expires_at ? Math.ceil((new Date(u.expires_at) - new Date())/(1000*60*60*24)) : null
                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                            <div style={{ width:30, height:30, borderRadius:'50%', background:'#E1F5EE', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:12, color:'#0F6E56', flexShrink:0 }}>{u.name.charAt(0)}</div>
                            <div>
                              <p style={{ fontWeight:500 }}>{u.name}</p>
                              <p style={{ fontSize:11, color:'#9b9b95' }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontFamily:'monospace', fontSize:12 }}>{u.trainee_id}</td>
                        <td><span className={`badge ${u.trainee_type==='Pre-Trainee'?'badge-purple':'badge-blue'}`}>{u.trainee_type}</span></td>
                        <td>{u.hostel_block}</td>
                        <td><span className={`badge ${u.mess_type==='Veg'?'badge-green':u.mess_type==='Non-Veg'?'badge-amber':'badge-blue'}`}>{u.mess_type}</span></td>
                        <td style={{ fontSize:12, color:'#6b6b65' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                        <td>
                          {expDays !== null && (
                            <span className={`badge ${expDays < 14 ? 'badge-red' : expDays < 30 ? 'badge-amber' : 'badge-green'}`}>
                              {expDays < 0 ? 'Expired' : `${expDays}d`}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredUsers.length===0 && <p style={{ color:'#9b9b95', padding:'2rem', textAlign:'center' }}>No students found.</p>}
            </div>
          </div>
        )}

        {/* REGISTRATIONS TAB */}
        {tab==='registrations' && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:'1.25rem' }}>Registrations & Menus ({regs.length})</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>ID</th><th>Mess</th><th>Block</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th><th>Expires</th></tr></thead>
                <tbody>
                  {regs.map(r => (
                    <tr key={r.id}>
                      <td>
                        <p style={{ fontWeight:500 }}>{r.name}</p>
                        <p style={{ fontSize:11, color:'#9b9b95' }}>{r.email}</p>
                      </td>
                      <td style={{ fontFamily:'monospace', fontSize:12 }}>{r.trainee_id}</td>
                      <td><span className={`badge ${r.mess_type==='Veg'?'badge-green':r.mess_type==='Non-Veg'?'badge-amber':'badge-blue'}`}>{r.mess_type||'—'}</span></td>
                      <td>{r.hostel_block}</td>
                      <td style={{ fontSize:12 }}>{r.breakfast || <span style={{ color:'#d3d1c7' }}>Not set</span>}</td>
                      <td style={{ fontSize:12 }}>{r.lunch    || <span style={{ color:'#d3d1c7' }}>Not set</span>}</td>
                      <td style={{ fontSize:12 }}>{r.dinner   || <span style={{ color:'#d3d1c7' }}>Not set</span>}</td>
                      <td style={{ fontSize:12, color:'#6b6b65' }}>{r.expires_at||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {regs.length===0 && <p style={{ color:'#9b9b95', padding:'2rem', textAlign:'center' }}>No registrations yet.</p>}
            </div>
          </div>
        )}

        {/* FEEDBACK TAB */}
        {tab==='feedback' && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:'1.25rem' }}>Student Feedback ({feedback.length})</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Category</th><th>Rating</th><th>Comment</th><th>Date</th></tr></thead>
                <tbody>
                  {feedback.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight:500 }}>{f.user_name}</td>
                      <td><span className="badge badge-blue">{f.category}</span></td>
                      <td>
                        <span style={{ color:'#EF9F27', fontWeight:600 }}>{'★'.repeat(f.rating)}</span>
                        <span style={{ color:'#e0ddd5' }}>{'★'.repeat(5-f.rating)}</span>
                      </td>
                      <td style={{ color:'#6b6b65', maxWidth:240, fontSize:13 }}>{f.comment||'—'}</td>
                      <td style={{ fontSize:12, color:'#9b9b95' }}>{new Date(f.submitted_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {feedback.length===0 && <p style={{ color:'#9b9b95', padding:'2rem', textAlign:'center' }}>No feedback yet.</p>}
            </div>
          </div>
        )}

        {/* MENUS TAB */}
        {tab==='menus' && (
          <div style={{ maxWidth:600 }}>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:'1.25rem' }}>Manage Menu Options</h2>
            <div className="card" style={{ marginBottom:'1.25rem' }}>
              <p style={{ fontWeight:600, marginBottom:'0.75rem' }}>Add new dish</p>
              <div style={{ display:'flex', gap:8 }}>
                <select value={newItem.meal} onChange={e => setNewItem({...newItem, meal:e.target.value})} style={{ width:140 }}>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
                <input placeholder="Dish name" value={newItem.item_name} onChange={e => setNewItem({...newItem, item_name:e.target.value})} onKeyDown={e => e.key==='Enter' && handleAddOption()} style={{ flex:1 }} />
                <button className="btn-primary" onClick={handleAddOption}>Add</button>
              </div>
            </div>
            {['breakfast','lunch','dinner'].map(meal => (
              <div key={meal} className="card" style={{ marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'0.75rem' }}>
                  <i className={`ti ${meal==='breakfast'?'ti-sun':meal==='lunch'?'ti-bowl':'ti-moon'}`} style={{ color:'#1D9E75' }} />
                  <p style={{ fontWeight:600, textTransform:'capitalize' }}>{meal}</p>
                  <span className="badge badge-green">{options.filter(o=>o.meal===meal).length} items</span>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {options.filter(o=>o.meal===meal).map(o => (
                    <span key={o.id} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#F4F6F9', borderRadius:20, padding:'5px 12px', fontSize:13, border:'1px solid rgba(0,0,0,0.08)' }}>
                      {o.item_name}
                      <span onClick={() => handleDeleteOption(o.id)} style={{ cursor:'pointer', color:'#9b9b95', fontSize:16, lineHeight:1 }}>×</span>
                    </span>
                  ))}
                  {options.filter(o=>o.meal===meal).length===0 && <span style={{ fontSize:13, color:'#9b9b95' }}>No items yet</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BULK UPLOAD TAB — PPT Phase 1 */}
        {tab==='upload' && (
          <div style={{ maxWidth:560 }}>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:'0.5rem' }}>Bulk Upload Students</h2>
            <p style={{ color:'#6b6b65', marginBottom:'1.5rem', fontSize:13 }}>Upload a CSV file to add multiple trainees at once (PPT Phase 1)</p>

            <div className="card" style={{ marginBottom:'1.25rem' }}>
              <p style={{ fontWeight:600, marginBottom:'0.5rem' }}>Required CSV columns</p>
              <div style={{ background:'#F4F6F9', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:12, color:'#534AB7', marginBottom:'1rem' }}>
                name, email, trainee_id, trainee_type, hostel_block, mess_type, password
              </div>
              <p style={{ fontSize:12, color:'#9b9b95', marginBottom:'1rem' }}>trainee_type must be: <strong>Vocational Trainee</strong> or <strong>Pre-Trainee</strong></p>

              <div style={{ border:'2px dashed rgba(29,158,117,0.3)', borderRadius:12, padding:'2rem', textAlign:'center', background:'#f0faf6', cursor:'pointer' }}
                onClick={() => fileRef.current.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); setUploadFile(e.dataTransfer.files[0]) }}
              >
                <i className="ti ti-upload" style={{ fontSize:32, color:'#1D9E75', display:'block', marginBottom:8 }} />
                <p style={{ fontWeight:500, marginBottom:4 }}>{uploadFile ? uploadFile.name : 'Click or drag CSV file here'}</p>
                <p style={{ fontSize:12, color:'#9b9b95' }}>Only .csv files accepted</p>
                <input ref={fileRef} type="file" accept=".csv" style={{ display:'none' }} onChange={e => setUploadFile(e.target.files[0])} />
              </div>

              {uploadFile && (
                <button className="btn-primary" style={{ width:'100%', marginTop:14, padding:'10px' }} onClick={handleUpload}>
                  <i className="ti ti-upload" style={{ marginRight:6 }} />Upload & Import Students
                </button>
              )}
            </div>

            {uploadResult && (
              <div className="card">
                <p style={{ fontWeight:600, marginBottom:'0.75rem' }}>Upload Result</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div style={{ background:'#E1F5EE', borderRadius:8, padding:'0.875rem', textAlign:'center' }}>
                    <p style={{ fontSize:26, fontWeight:700, color:'#0F6E56' }}>{uploadResult.added}</p>
                    <p style={{ fontSize:12, color:'#0F6E56' }}>Added</p>
                  </div>
                  <div style={{ background:'#FAEEDA', borderRadius:8, padding:'0.875rem', textAlign:'center' }}>
                    <p style={{ fontSize:26, fontWeight:700, color:'#854F0B' }}>{uploadResult.skipped}</p>
                    <p style={{ fontSize:12, color:'#854F0B' }}>Skipped (duplicates)</p>
                  </div>
                </div>
                {uploadResult.errors?.length > 0 && (
                  <div style={{ marginTop:10 }}>
                    <p style={{ fontSize:12, fontWeight:600, color:'#A32D2D', marginBottom:4 }}>Errors:</p>
                    {uploadResult.errors.map((e,i) => <p key={i} style={{ fontSize:12, color:'#A32D2D' }}>• {e}</p>)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
