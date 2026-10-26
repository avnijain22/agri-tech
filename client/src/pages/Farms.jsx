import { useState } from 'react';
import api from '../api/client';
import { useApp } from '../AuthContext';
import { useList, Form, Empty, Alert } from '../components/ui';

const fields = [
  { name: 'name', label: 'Farm name', required: true },
  { name: 'location', label: 'Village / district' },
  { name: 'latitude', label: 'Latitude', type: 'number', step: 'any', required: true },
  { name: 'longitude', label: 'Longitude', type: 'number', step: 'any', required: true },
  { name: 'areaAcres', label: 'Area (acres)', type: 'number', step: 'any' },
  { name: 'soilType', label: 'Soil type', type: 'select', options: ['alluvial', 'black', 'red', 'laterite', 'sandy', 'loamy', 'clay'] },
  { name: 'irrigation', label: 'Irrigation', type: 'select', options: ['rainfed', 'canal', 'borewell', 'drip', 'sprinkler'] }
];

export default function Farms() {
  const { t } = useApp();
  const { data, error, reload } = useList('/farms');
  const [editing, setEditing] = useState(null); // null | 'new' | farm
  const [geo, setGeo] = useState(null);
  const save = async v => {
    if (editing === 'new') await api.post('/farms', v); else await api.put(`/farms/${editing._id}`, v);
    setEditing(null); setGeo(null); reload();
  };
  const remove = async f => { if (confirm(`Delete ${f.name}?`)) { await api.delete(`/farms/${f._id}`); reload(); } };
  const locate = () => navigator.geolocation?.getCurrentPosition(p => setGeo({ latitude: p.coords.latitude.toFixed(4), longitude: p.coords.longitude.toFixed(4), k: Date.now() }));

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">{t('farms')}</h2>
        {!editing && <button className="btn btn-primary" onClick={() => setEditing('new')}>+ {t('add')}</button>}
      </div>
      <Alert error={error} />
      {editing && (
        <div className="panel mb-3">
          <button className="btn btn-sm btn-outline-primary mb-2" onClick={locate}>Use my current location</button>
          <Form key={geo?.k || 'f'} fields={fields} initial={{ ...(editing === 'new' ? { soilType: 'loamy', irrigation: 'rainfed' } : editing), ...(geo || {}) }} onSubmit={save} onCancel={() => { setEditing(null); setGeo(null); }} submitLabel={t('save')} />
        </div>
      )}
      {data && !data.length && !editing && <Empty>{t('noFarms')}</Empty>}
      <div className="row g-3">
        {data?.map(f => (
          <div key={f._id} className="col-md-6 col-xl-4">
            <div className="panel h-100">
              <h5>{f.name}</h5>
              <div className="text-muted small mb-2">{f.location || '—'} · {f.latitude}, {f.longitude}</div>
              <div>{f.areaAcres} acres · {f.soilType} soil · {f.irrigation}</div>
              <div className="mt-3 d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(f)}>{t('edit')}</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(f)}>{t('delete')}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
