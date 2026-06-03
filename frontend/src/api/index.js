import client from './client'

export const apiRegister    = (data) => client.post('/auth/register', data)
export const apiLogin       = (data) => client.post('/auth/login', data)
export const apiGetMe       = ()     => client.get('/auth/me')

export const apiGetMenuOptions    = ()     => client.get('/menu/options')
export const apiGetMyMenu         = ()     => client.get('/menu/my')
export const apiSaveMenu          = (data) => client.post('/menu/save', data)
export const apiSubmitFeedback    = (data) => client.post('/menu/feedback', data)
export const apiAddMenuOption     = (data) => client.post('/menu/options', data)
export const apiDeleteMenuOption  = (id)   => client.delete(`/menu/options/${id}`)

export const apiGetStats        = ()     => client.get('/admin/stats')
export const apiGetAllUsers     = ()     => client.get('/admin/users')
export const apiGetRegistrations= ()     => client.get('/admin/registrations')
export const apiGetAllFeedback  = ()     => client.get('/admin/feedback')
export const apiDeleteExpired   = ()     => client.delete('/admin/users/expired')
export const apiUploadStudents  = (file) => {
  const fd = new FormData(); fd.append('file', file)
  return client.post('/admin/upload-students', fd, { headers:{ 'Content-Type':'multipart/form-data' } })
}
export const apiExportExcel = () =>
  client.get('/admin/export', { responseType:'blob' }).then(res => {
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a'); a.href = url
    a.setAttribute('download', 'snti_registrations.xlsx')
    document.body.appendChild(a); a.click(); a.remove()
  })
