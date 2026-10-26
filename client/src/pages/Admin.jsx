import { useState } from 'react';
import api, { errMsg } from '../api/client';
import { useList, Alert, Form } from '../components/ui';
import { useApp } from '../AuthContext';

export default function Admin() {
  const { user: me } = useApp();
  const stats = useList('/admin/stats').data;
  const users = useList('/admin/users');
  const alerts = useList('/weather/alerts');
  const [err, setErr] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const patch = async (u, body) => { try { await api.patch(`/admin/users/${u._id}`, body); users.reload(); setErr(''); } catch (e) { setErr(errMsg(e)); } };
  const addAlert = async v => { await api.post('/weather/alerts', v); setShowAlert(false); alerts.reload(); };
  const delAlert = async a => { await api.delete(`/weather/alerts/${a._id}`); alerts.reload(); };

  return (
    <>
      <h2 className="mb-3">Admin dashboard</h2>
      <Alert error={err || users.error} />
      {stats && <div className="row g-3 mb-4">{Object.entries(stats).map(([k, v]) => (
        <div key={k} className="col-6 col-md-4 col-xl-2"><div className="panel stat"><div className="n">{k === 'revenue' ? `₹${v}` : v}</div><div className="text-muted small">{k}</div></div></div>))}</div>}

      <div className="panel mb-4">
        <div className="d-flex justify-content-between mb-2"><h5>Pest and advisory alerts</h5>{!showAlert && <button className="btn btn-sm btn-primary" onClick={() => setShowAlert(true)}>+ New alert</button>}</div>
        {showAlert && <Form fields={[{ name: 'title', label: 'Title', required: true }, { name: 'crop', label: 'Crop (optional)' }, { name: 'severity', label: 'Severity', type: 'select', options: ['info', 'warning', 'critical'] }, { name: 'message', label: 'Message', type: 'textarea', required: true }]}
          initial={{ severity: 'warning' }} onSubmit={addAlert} onCancel={() => setShowAlert(false)} submitLabel="Publish alert" />}
        {alerts.data?.map(a => <div key={a._id} className="d-flex justify-content-between border-top py-2"><div><strong>{a.title}</strong> <span className="badge text-bg-light">{a.severity}</span><div className="small">{a.message}</div></div><button className="btn btn-sm btn-outline-danger align-self-start" onClick={() => delAlert(a)}>Delete</button></div>)}
      </div>

      <div className="panel">
        <h5>Users</h5>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>{users.data?.map(u => (
              <tr key={u._id}><td>{u.name}</td><td>{u.email}</td>
                <td><select className="form-select form-select-sm" disabled={u._id === me.id} value={u.role} onChange={e => patch(u, { role: e.target.value })} aria-label={`Role for ${u.name}`}>
                  <option>farmer</option><option>expert</option><option>admin</option></select></td>
                <td><button className={`btn btn-sm ${u.active ? 'btn-outline-danger' : 'btn-outline-success'}`} disabled={u._id === me.id} onClick={() => patch(u, { active: !u.active })}>{u.active ? 'Deactivate' : 'Activate'}</button></td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
