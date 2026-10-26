import { useState, useEffect, useCallback } from 'react';
import api, { errMsg } from '../api/client';

export const Alert = ({ error, ok }) => (error || ok) ? <div className={`alert ${error ? 'alert-danger' : 'alert-success'} py-2`} role="alert">{error || ok}</div> : null;

export const Empty = ({ children }) => <div className="panel text-center text-muted py-4">{children}</div>;

// Fetch a list from the API with reload()
export function useList(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const reload = useCallback(() => api.get(url).then(r => { setData(r.data); setError(''); }).catch(e => setError(errMsg(e))), [url]);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, reload };
}

// Generic controlled form. fields: [{name,label,type,options,required,step}]
export function Form({ fields, initial = {}, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [v, setV] = useState(initial);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, val) => setV(s => ({ ...s, [k]: val }));
  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await onSubmit(v); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="row g-2">
      <div className="col-12"><Alert error={err} /></div>
      {fields.map(f => (
        <div key={f.name} className={f.type === 'textarea' ? 'col-12' : 'col-md-6'}>
          <label className="form-label small mb-1" htmlFor={f.name}>{f.label}</label>
          {f.type === 'select' ? (
            <select id={f.name} className="form-select" required={f.required} value={v[f.name] ?? ''} onChange={e => set(f.name, e.target.value)}>
              <option value="">Select…</option>
              {f.options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea id={f.name} className="form-control" rows={3} required={f.required} value={v[f.name] ?? ''} onChange={e => set(f.name, e.target.value)} />
          ) : (
            <input id={f.name} className="form-control" type={f.type || 'text'} step={f.step} required={f.required}
              value={v[f.name] ?? ''} onChange={e => set(f.name, e.target.value)} />
          )}
        </div>
      ))}
      <div className="col-12 d-flex gap-2 mt-2">
        <button className="btn btn-primary" disabled={busy}>{busy ? '…' : submitLabel}</button>
        {onCancel && <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

export const dateInput = d => (d ? String(d).slice(0, 10) : '');
