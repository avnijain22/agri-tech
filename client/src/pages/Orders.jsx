import { useState } from 'react';
import api, { errMsg } from '../api/client';
import { useApp } from '../AuthContext';
import { useList, Alert, Empty } from '../components/ui';

const STEPS = ['pending', 'approved', 'shipped', 'delivered'];

export default function Orders() {
  const { t, user } = useApp();
  const { data, error, reload } = useList('/orders');
  const [err, setErr] = useState('');
  const act = async fn => { try { await fn(); reload(); setErr(''); } catch (e) { setErr(errMsg(e)); } };

  return (
    <>
      <h2 className="mb-3">{t('orders')}</h2>
      <Alert error={error || err} />
      {data && !data.length && <Empty>No orders yet. Browse Resources to place your first order.</Empty>}
      {data?.map(o => (
        <div key={o._id} className="panel mb-3">
          <div className="d-flex justify-content-between flex-wrap gap-2">
            <div><strong>#{o._id.slice(-6)}</strong> <span className="text-muted small">{new Date(o.createdAt).toLocaleString()}</span>
              {user.role === 'admin' && <div className="small">{o.owner?.name} ({o.owner?.email})</div>}</div>
            <span className={`badge align-self-start ${o.status === 'cancelled' ? 'text-bg-danger' : 'text-bg-success'}`}>{o.status}</span>
          </div>
          <ul className="my-2">{o.items.map(i => <li key={i.resource}>{i.name} × {i.quantity} – ₹{i.price * i.quantity}</li>)}</ul>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <strong>{t('total')}: ₹{o.total}</strong>
            <div className="d-flex gap-2">
              {o.status === 'pending' && String(o.owner?._id || o.owner) === String(user.id) && <button className="btn btn-sm btn-outline-danger" onClick={() => act(() => api.patch(`/orders/${o._id}/cancel`))}>Cancel order</button>}
              {user.role === 'admin' && o.status !== 'cancelled' && STEPS.indexOf(o.status) < 3 && (
                <button className="btn btn-sm btn-primary" onClick={() => act(() => api.patch(`/orders/${o._id}/status`, { status: STEPS[STEPS.indexOf(o.status) + 1] }))}>Mark {STEPS[STEPS.indexOf(o.status) + 1]}</button>)}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
