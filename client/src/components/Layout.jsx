import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../AuthContext';
import { languages } from '../i18n/translations';

export default function Layout() {
  const { user, t, lang, setLang, logout } = useApp();
  const [open, setOpen] = useState(false);
  useLocation();
  const links = [
    ['/', 'dashboard'], ['/farms', 'farms'], ['/crops', 'crops'], ['/weather', 'weather'],
    ['/resources', 'resources'], ['/orders', 'orders'], ['/community', 'community'], ['/consult', 'consult']
  ];
  if (user.role === 'admin') links.push(['/admin', 'admin']);

  return (
    <div className="shell">
      <nav className={`side ${open ? 'open' : ''}`} aria-label="Main">
        <div className="brand">Agri<span>Tech</span></div>
        {links.map(([to, key]) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}>{t(key)}</NavLink>
        ))}
        <div className="mt-auto pt-3 border-top border-secondary">
          <select className="form-select form-select-sm mb-2" value={lang} onChange={e => setLang(e.target.value)} aria-label="Language">
            {Object.entries(languages).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="small px-1 mb-2">{user.name} <span className="text-warning">({user.role})</span></div>
          <button className="btn btn-sm btn-outline-light w-100" onClick={logout}>{t('logout')}</button>
        </div>
      </nav>
      <main className="main">
        <div className="topbar-m">
          <button className="btn btn-outline-primary btn-sm" onClick={() => setOpen(!open)} aria-label="Menu">☰ Menu</button>
          <strong className="brand">AgriTech</strong>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
