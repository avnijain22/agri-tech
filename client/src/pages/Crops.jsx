import { useState } from 'react';
import api, { errMsg } from '../api/client';
import { useApp } from '../AuthContext';
import { useList, Form, Empty, Alert, dateInput } from '../components/ui';

export default function Crops() {
  const { t } = useApp();
  const { data, error, reload } = useList('/crops');
  const farms = useList('/farms').data || [];
  const [editing, setEditing] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [err, setErr] = useState('');

  const fields = [
    { name: 'name', label: 'Crop', required: true },
    { name: 'farm', label: 'Farm', type: 'select', required: true, options: farms.map(f => ({ value: f._id, label: f.name })) },
    { name: 'variety', label: 'Variety' },
    { name: 'season', label: 'Season', type: 'select', options: ['kharif', 'rabi', 'zaid'] },
    { name: 'status', label: 'Status', type: 'select', options: ['planned', 'growing', 'harvested', 'failed'] },
    { name: 'sowingDate', label: 'Sowing date', type: 'date' },
    { name: 'expectedHarvest', label: 'Expected harvest', type: 'date' },
    { name: 'expectedYield', label: 'Expected yield (quintal)', type: 'number', step: 'any' },
    { name: 'actualYield', label: 'Actual yield (quintal)', type: 'number', step: 'any' },
    { name: 'ph', label: 'Soil pH', type: 'number', step: 'any' },
    { name: 'nitrogen', label: 'Nitrogen (kg/ha)', type: 'number' },
    { name: 'phosphorus', label: 'Phosphorus (kg/ha)', type: 'number' },
    { name: 'potassium', label: 'Potassium (kg/ha)', type: 'number' },
    { name: 'organicCarbon', label: 'Organic carbon (%)', type: 'number', step: 'any' }
  ];
  const soilKeys = ['ph', 'nitrogen', 'phosphorus', 'potassium', 'organicCarbon'];

  const toForm = c => ({ ...c, farm: c.farm?._id || c.farm, sowingDate: dateInput(c.sowingDate), expectedHarvest: dateInput(c.expectedHarvest), ...(c.soil || {}) });
  const save = async v => {
    const body = { ...v, soil: Object.fromEntries(soilKeys.filter(k => v[k] !== '' && v[k] != null).map(k => [k, Number(v[k])])) };
    soilKeys.forEach(k => delete body[k]);
    ['sowingDate', 'expectedHarvest', 'expectedYield', 'actualYield'].forEach(k => { if (body[k] === '') delete body[k]; });
    if (editing === 'new') await api.post('/crops', body); else await api.put(`/crops/${editing._id}`, body);
    setEditing(null); reload();
  };
  const remove = async c => { if (confirm(`Delete ${c.name}?`)) { await api.delete(`/crops/${c._id}`); reload(); } };
  const analyze = async c => {
    try { const r = await api.get(`/crops/${c._id}/analysis`); setAnalysis({ crop: c.name, ...r.data }); setErr(''); } catch (e) { setErr(errMsg(e)); }
  };
  const log = async c => {
    const action = prompt('Activity (e.g. irrigated, sprayed, weeded):'); if (!action) return;
    await api.post(`/crops/${c._id}/activity`, { action, note: prompt('Note (optional):') || '' }); reload();
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">{t('crops')}</h2>
        {!editing && <button className="btn btn-primary" disabled={!farms.length} onClick={() => setEditing('new')}>+ {t('add')}</button>}
      </div>
      {!farms.length && <div className="alert alert-warning py-2">Add a farm first, then you can add crops to it.</div>}
      <Alert error={error || err} />
      {editing && <div className="panel mb-3"><Form fields={fields} initial={editing === 'new' ? { season: 'kharif', status: 'planned' } : toForm(editing)} onSubmit={save} onCancel={() => setEditing(null)} submitLabel={t('save')} /></div>}
      {analysis && (
        <div className="panel mb-3">
          <div className="d-flex justify-content-between"><h5>Soil health: {analysis.crop}</h5><button className="btn-close" onClick={() => setAnalysis(null)} aria-label="Close" /></div>
          {analysis.healthScore === null ? <p className="text-muted">Enter soil test values (edit the crop) to get an analysis.</p> : (
            <>
              <p className="mb-2">Score <strong>{analysis.healthScore}/100</strong> – {analysis.rating}</p>
              <div className="d-flex flex-wrap gap-2 mb-2">{analysis.readings.map(r => (
                <span key={r.key} className={`badge ${r.level === 'optimal' ? 'text-bg-success' : 'text-bg-warning'}`}>{r.label}: {r.value} ({r.level})</span>))}</div>
              <ul className="mb-0">{analysis.advice.map(a => <li key={a}>{a}</li>)}</ul>
            </>
          )}
        </div>
      )}
      {data && !data.length && !editing && <Empty>{t('noCrops')}</Empty>}
      <div className="row g-3">
        {data?.map(c => (
          <div key={c._id} className="col-md-6 col-xl-4">
            <div className="panel h-100">
              <div className="d-flex justify-content-between"><h5>{c.name}</h5><span className="badge text-bg-secondary align-self-start">{c.status}</span></div>
              <div className="small text-muted mb-2">{c.farm?.name} · {c.season} {c.variety && `· ${c.variety}`}</div>
              <div className="small">Sown: {dateInput(c.sowingDate) || '—'} · Harvest: {dateInput(c.expectedHarvest) || '—'}</div>
              {c.activityLog?.length > 0 && <div className="small mt-2">Last: {c.activityLog.at(-1).action}</div>}
              <div className="mt-3 d-flex flex-wrap gap-2">
                <button className="btn btn-sm btn-outline-primary" onClick={() => analyze(c)}>Soil analysis</button>
                <button className="btn btn-sm btn-outline-primary" onClick={() => log(c)}>Log activity</button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(c)}>{t('edit')}</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(c)}>{t('delete')}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
