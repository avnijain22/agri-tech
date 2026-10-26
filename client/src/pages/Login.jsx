import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { useApp } from '../AuthContext';
import { Alert } from '../components/ui';
import { languages } from '../i18n/translations';

export default function Login({ register }) {
  const { t, user, authenticate, lang, setLang } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', phone: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const { data } = await api.post(register ? '/auth/register' : '/auth/login', { ...f, language: lang });
      authenticate(data); nav('/');
    } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  const bind = k => ({ value: f[k], onChange: e => setF({ ...f, [k]: e.target.value }) });

  return (
    <div className="auth-wrap">
      <div className="auth-art">
        <h1>Know your soil, sky and season.</h1>
        <p className="mt-3 mb-0">Weather, soil health, pest alerts and expert advice for your farm, in your language.</p>
      </div>
      <div className="auth-form">
        <form onSubmit={submit} style={{ width: '100%', maxWidth: 380 }}>
          <h2 className="mb-1">{register ? t('register') : t('login')}</h2>
          <p className="text-muted">{t('tagline')}</p>
          <Alert error={err} />
          {register && <div className="mb-3"><label className="form-label" htmlFor="name">{t('name')}</label><input id="name" className="form-control" required {...bind('name')} /></div>}
          <div className="mb-3"><label className="form-label" htmlFor="email">{t('email')}</label><input id="email" type="email" className="form-control" required {...bind('email')} /></div>
          <div className="mb-3"><label className="form-label" htmlFor="password">{t('password')}</label><input id="password" type="password" minLength={6} className="form-control" required {...bind('password')} /></div>
          {register && <div className="mb-3"><label className="form-label" htmlFor="phone">{t('phone')}</label><input id="phone" className="form-control" {...bind('phone')} /></div>}
          <button className="btn btn-primary w-100" disabled={busy}>{busy ? '…' : register ? t('register') : t('login')}</button>
          <div className="d-flex justify-content-between mt-3 small">
            {register ? <Link to="/login">{t('login')}</Link> : <Link to="/register">{t('register')}</Link>}
            <select value={lang} onChange={e => setLang(e.target.value)} className="form-select form-select-sm w-auto" aria-label="Language">
              {Object.entries(languages).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </form>
      </div>
    </div>
  );
}
