import { useState } from 'react';
import api, { errMsg } from '../api/client';
import { useApp } from '../AuthContext';
import { useList, Form, Alert, Empty } from '../components/ui';

export default function Community({ type }) {
  const { t, user } = useApp();
  const consult = type === 'consultation';
  const { data, error, reload } = useList(`/posts?type=${type}`);
  const [show, setShow] = useState(false);
  const [reply, setReply] = useState({});
  const [err, setErr] = useState('');

  const create = async v => { await api.post('/posts', { ...v, type }); setShow(false); reload(); };
  const send = async p => {
    try { await api.post(`/posts/${p._id}/reply`, { body: reply[p._id] }); setReply({ ...reply, [p._id]: '' }); reload(); } catch (e) { setErr(errMsg(e)); }
  };
  const hide = async p => { await api.patch(`/posts/${p._id}/hide`); reload(); };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">{consult ? t('consult') : t('community')}</h2>
        {!show && <button className="btn btn-primary" onClick={() => setShow(true)}>{consult ? 'Ask a question' : 'New post'}</button>}
      </div>
      {consult && user.role === 'farmer' && <p className="text-muted">Only you and our agronomy experts can see your questions.</p>}
      <Alert error={error || err} />
      {show && <div className="panel mb-3"><Form fields={[{ name: 'title', label: 'Title', required: true }, { name: 'body', label: 'Details', type: 'textarea', required: true }]} onSubmit={create} onCancel={() => setShow(false)} submitLabel="Post" /></div>}
      {data && !data.length && <Empty>{consult ? 'No questions yet. Ask our experts about pests, soil or crop choice.' : 'No posts yet. Start the first discussion.'}</Empty>}
      {data?.map(p => (
        <div key={p._id} className="panel mb-3">
          <div className="d-flex justify-content-between"><h5 className="mb-0">{p.title}</h5>
            <div>{consult && <span className={`badge ${p.status === 'answered' ? 'text-bg-success' : 'text-bg-warning'}`}>{p.status}</span>}
              {user.role === 'admin' && <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => hide(p)}>Hide</button>}</div></div>
          <div className="small text-muted mb-2">{p.authorName} · {new Date(p.createdAt).toLocaleDateString()}</div>
          <p style={{ whiteSpace: 'pre-wrap' }}>{p.body}</p>
          {p.replies.map(r => (
            <div key={r._id} className="border-start border-3 ps-3 mb-2" style={{ borderColor: r.authorRole === 'farmer' ? '#d5ded2' : '#d9a520' }}>
              <div className="small"><strong>{r.authorName}</strong> {r.authorRole !== 'farmer' && <span className="badge text-bg-warning">{r.authorRole}</span>}</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{r.body}</div>
            </div>
          ))}
          <div className="input-group mt-2">
            <input className="form-control" placeholder="Write a reply" value={reply[p._id] || ''} onChange={e => setReply({ ...reply, [p._id]: e.target.value })} aria-label="Reply" />
            <button className="btn btn-outline-primary" disabled={!reply[p._id]?.trim()} onClick={() => send(p)}>Reply</button>
          </div>
        </div>
      ))}
    </>
  );
}
