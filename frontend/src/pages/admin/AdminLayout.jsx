import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutList, PlusCircle, Bike, Users, UtensilsCrossed, Boxes, BarChart3, Settings as SettingsIcon, Search, LogOut } from 'lucide-react';
import { LOGO_URL } from '../../mock/mockData';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin/rendelesek', label: 'Rendelések', icon: LayoutList },
  { to: '/admin/uj-rendeles', label: 'Új rendelés', icon: PlusCircle },
  { to: '/admin/futarok', label: 'Futárok', icon: Bike },
  { to: '/admin/vevok', label: 'Vevők', icon: Users },
  { to: '/admin/etlap', label: 'Étlap', icon: UtensilsCrossed },
  { to: '/admin/keszlet', label: 'Készlet', icon: Boxes },
  { to: '/admin/statisztika', label: 'Statisztika', icon: BarChart3 },
  { to: '/admin/beallitasok', label: 'Beállítások', icon: SettingsIcon },
];

const PAGE_META = {
  '/admin/rendelesek': { title: 'Rendelések', subtitle: 'Nyomon követheted az összes befutott rendelést.' },
  '/admin/uj-rendeles': { title: 'Telefonos rendelés felvétele', subtitle: 'Vedd fel a vendég adatait, add hozzá a termékeket, majd zárd le a rendelést.' },
  '/admin/futarok': { title: 'Futárok', subtitle: 'Kezeld a futárok listáját és oszd szét a címeket.' },
  '/admin/vevok': { title: 'Vevők', subtitle: 'Visszatérő vendégeid adatai egy helyen.' },
  '/admin/etlap': { title: 'Étlap', subtitle: 'Termékek, házi / Foodora / Falatozz árakkal.' },
  '/admin/keszlet': { title: 'Készlet', subtitle: 'Kövesd nyomon az alapanyagok mennyiségét.' },
  '/admin/statisztika': { title: 'Statisztika', subtitle: 'Áttekintő számok az üzlet teljesítményéről.' },
  '/admin/beallitasok': { title: 'Beállítások', subtitle: 'Szállítási területek, futárok, kuponkódok, napi és futár zárás.' },
};

const AdminLayout = () => {
  const location = useLocation();
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const meta = PAGE_META[location.pathname] || { title: 'ZAVO Admin', subtitle: '' };
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);

  const dateStr = now.toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const timeStr = now.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
  const weekday = now.toLocaleDateString('hu-HU', { weekday: 'long' });
  const wCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const initial = (user?.name || 'A').charAt(0).toUpperCase();

  const doLogout = () => { logout(); nav('/belepes', { replace: true }); };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <aside className="w-64 bg-neutral-950 text-neutral-100 flex flex-col sticky top-0 h-screen">
        <div className="px-6 pt-6 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="ZAVO" className="h-14 w-14 object-contain rounded-md bg-black/40 p-1" />
            <div>
              <div className="text-2xl font-extrabold tracking-wide gold-text-gradient">ZAVO</div>
              <div className="text-[10px] tracking-[0.3em] text-neutral-400">FOOD &amp; MORE</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-neutral-800">
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Rendszer online
          </div>
          <div className="text-[10px] text-neutral-500 mt-2">v1.1.0</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-neutral-200 px-8 py-5 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{meta.title}</h1>
            {meta.subtitle && <p className="text-sm text-neutral-500 mt-1">{meta.subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-neutral-900">{dateStr} {timeStr}</div>
              <div className="text-xs text-neutral-500">{wCap}</div>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input placeholder="Vendég keresése (név, telefonszám)..." className="w-80 pl-9 pr-3 py-2 rounded-full bg-neutral-100 border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
              <div className="h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-semibold">{initial}</div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">{user?.name}</div>
                <div className="text-xs text-neutral-500">Üzletvezető</div>
              </div>
              <button onClick={doLogout} title="Kilépés" className="h-10 w-10 rounded-full border border-neutral-200 text-neutral-500 hover:text-rose-500 hover:border-rose-200 inline-flex items-center justify-center"><LogOut size={16} /></button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
