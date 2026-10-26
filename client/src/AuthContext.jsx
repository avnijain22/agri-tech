import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from './api/client';
import { dict } from './i18n/translations';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [lang, setLangState] = useState(localStorage.getItem('agritech_lang') || 'en');

  useEffect(() => {
    if (!localStorage.getItem('agritech_token')) { setReady(true); return; }
    api.get('/auth/me').then(r => { setUser(r.data.user); }).catch(() => localStorage.removeItem('agritech_token')).finally(() => setReady(true));
  }, []);

  const setLang = useCallback(l => {
    setLangState(l);
    localStorage.setItem('agritech_lang', l);
    document.documentElement.lang = l;
    if (localStorage.getItem('agritech_token')) api.patch('/auth/me', { language: l }).catch(() => {});
  }, []);

  const t = key => dict[lang]?.[key] ?? dict.en[key] ?? key;

  const authenticate = (data) => {
    localStorage.setItem('agritech_token', data.token);
    setUser(data.user);
    if (data.user.language) { setLangState(data.user.language); localStorage.setItem('agritech_lang', data.user.language); }
  };
  const logout = () => { localStorage.removeItem('agritech_token'); setUser(null); };

  return <Ctx.Provider value={{ user, ready, lang, setLang, t, authenticate, logout }}>{children}</Ctx.Provider>;
}
