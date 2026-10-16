import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Brain = Record<string, any> & { online?: boolean; logs?: any[]; chats?: Record<string, any>; events?: any[]; knowledge?: any[]; lidMap?: Record<string, string> };
type Ctx = { brain: Brain; online: boolean; queue: any[]; refresh: () => Promise<void>; command: (text: string, orderId?: string) => Promise<void>; save: (path: string, body: any) => Promise<void> };
const NoaContext = createContext<Ctx | null>(null);
const read = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; } };
const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

export function NoaServerProvider({ children }: { children: ReactNode }) {
  const [brain, setBrain] = useState<Brain>(() => read('noa_snapshot', { online: false }));
  const [queue, setQueue] = useState<any[]>(() => read('noa_queue', []));
  const [online, setOnline] = useState(false);
  const refresh = useCallback(async () => {
    if (document.hidden) return;
    try {
      const response = await fetch('/api/noa/brain');
      if (!response.ok) throw new Error('offline');
      const next = await response.json(); setBrain(next); setOnline(true); write('noa_snapshot', next);
      const pending = read<any[]>('noa_queue', []);
      for (const item of pending) await fetch(item.path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(item.body) });
      setQueue([]); write('noa_queue', []);
    } catch { setOnline(false); }
  }, []);
  const enqueue = useCallback(async (path: string, body: any) => {
    try { const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); if (!r.ok) throw Error(); await refresh(); }
    catch { const next = [...read<any[]>('noa_queue', []), { path, body }]; setQueue(next); write('noa_queue', next); }
  }, [refresh]);
  useEffect(() => { refresh(); const id = window.setInterval(refresh, 4000); return () => clearInterval(id); }, [refresh]);
  const value = useMemo(() => ({ brain, online, queue, refresh, command: (text: string, orderId?: string) => enqueue('/api/noa/command', { text, orderId }), save: (path: string, body: any) => enqueue(path, body) }), [brain, online, queue, refresh, enqueue]);
  return <NoaContext.Provider value={value}>{!online && queue.length > 0 && <div className="offline-banner">אופליין – שינויים בתור ({queue.length})</div>}{children}</NoaContext.Provider>;
}
export const useNoa = () => { const value = useContext(NoaContext); if (!value) throw new Error('NoaServerProvider is missing'); return value; };
export function notifyOneSignal(title: string, body: string) { window.dispatchEvent(new CustomEvent('noa-notification', { detail: { title, body } })); }
