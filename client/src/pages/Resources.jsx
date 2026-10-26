import { useState } from 'react';
import api, { errMsg } from '../api/client';
import { useApp } from '../AuthContext';
import { useList, Alert, Empty } from '../components/ui';

export default function Resources() {
  const { t, user } = useApp();
  const { data, error, reload } = useList('/resources');
  const [cart, setCart] = useState({});
  const [address, setAddress] = useState('');
  const [msg, setMsg] = useState({});

  const add = r => setCart(c => ({ ...c, [r._id]: Math.min((c[r._id] || 0) + 1, r.stock) }));
  const lines = (data || []).filter(r => cart[r._id]);
  const total = lines.reduce((s, r) => s + r.price * cart[r._id], 0);

  const order = async () => {
    try {
      await api.post('/orders', { items: lines.map(r => ({ resource: r._id, quantity: cart[r._id] })), address });
      setCart({}); setMsg({ ok: 'Order placed. Track it under My orders.' }); reload();
    } catch (e) { setMsg({ error: errMsg(e) }); }
  };
  const adminAdd = async () => {
    const name = prompt('Name'); if (!name) return;
    try { await api.post('/resources', { name, category: prompt('Category (seeds/fertilizer/pesticide/tools/other)') || 'other', price: Number(prompt('Price')), unit: prompt('Unit (kg, bottle...)') || 'unit', stock: Number(prompt('Stock')) }); reload(); } catch (e) { setMsg({ error: errMsg(e) }); }
  };
  const adminDel = async r => { if (confirm(`Delete ${r.name}?`)) { await api.delete(`/resources/${r._id}`); reload(); } };

  return (
    <div className="row g-3">
      <div className="col-lg-8">
        <div className="d-flex justify-content-between mb-3"><h2 className="m-0">{t('resources')}</h2>
          {user.role === 'admin' && <button className="btn btn-primary" onClick={adminAdd}>+ {t('add')}</button>}</div>
        <Alert error={error || msg.error} ok={msg.ok} />
        {data && !data.length && <Empty>No resources listed yet.</Empty>}
        <div className="row g-3">
          {data?.map(r => (
            <div className="col-md-6" key={r._id}>
              <div className="panel h-100">
                <div className="d-flex justify-content-between"><h6>{r.name}</h6><span className="badge text-bg-light">{r.category}</span></div>
                <div className="small text-muted">{r.description}</div>
                <div className="my-2"><strong>₹{r.price}</strong> / {r.unit} · <span className={r.stock ? '' : 'text-danger'}>{r.stock ? `${r.stock} in stock` : 'Out of stock'}</span></div>
                <button className="btn btn-sm btn-outline-primary" disabled={!r.stock} onClick={() => add(r)}>{t('addToCart')}</button>
                {user.role === 'admin' && <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => adminDel(r)}>{t('delete')}</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-lg-4">
        <div className="panel position-sticky" style={{ top: 16 }}>
          <h5>{t('cart')}</h5>
          {!lines.length ? <p className="text-muted">Your cart is empty.</p> : lines.map(r => (
            <div key={r._id} className="d-flex justify-content-between align-items-center mb-1">
              <span>{r.name}</span>
              <span><input type="number" min="0" max={r.stock} className="form-control form-control-sm d-inline-block" style={{ width: 70 }} value={cart[r._id]}
                onChange={e => setCart({ ...cart, [r._id]: Math.min(Number(e.target.value), r.stock) })} aria-label={`Quantity of ${r.name}`} /></span>
            </div>
          ))}
          <hr /><div className="d-flex justify-content-between"><strong>{t('total')}</strong><strong>₹{total}</strong></div>
          <textarea className="form-control my-2" rows={2} placeholder="Delivery address" value={address} onChange={e => setAddress(e.target.value)} />
          <button className="btn btn-primary w-100" disabled={!lines.length || !address.trim()} onClick={order}>{t('placeOrder')}</button>
        </div>
      </div>
    </div>
  );
}
