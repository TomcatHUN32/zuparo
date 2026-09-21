import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LOGO_URL } from '../../mock/mockData';
import { Search, ShoppingCart, Instagram, Facebook, Heart, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/', label: 'Főoldal', end: true },
  { to: '/etlap', label: 'Étlap' },
  { to: '/rolunk', label: 'Rólunk' },
  { to: '/szallitas', label: 'Szállítás' },
  { to: '/kapcsolat', label: 'Kapcsolat' },
];

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="zavo-dark min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-30 bg-neutral-950/85 backdrop-blur border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="ZAVO" className="h-12 w-12 object-contain" />
            <div className="leading-none">
              <div className="text-2xl font-extrabold tracking-wider gold-text-gradient">ZAVO</div>
              <div className="text-[9px] tracking-[0.35em] text-neutral-500">FOOD &amp; MORE</div>
            </div>
          </Link>
          <nav className="flex-1 flex justify-center gap-8">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `text-sm font-semibold tracking-wide ${isActive ? 'text-white border-b-2 border-[#d4af37] pb-1' : 'text-neutral-300 hover:text-white'}`}>{n.label}</NavLink>
            ))}
          </nav>
          <div className="relative w-64 hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input placeholder="Keresés..." className="w-full pl-9 pr-3 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]" />
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' && (
                <Link to="/admin/uj-rendeles" className="text-xs gold-gradient text-black font-bold px-3 py-2 rounded-full">POS</Link>
              )}
              <div className="hidden md:flex items-center gap-2 pr-2 pl-3 py-1.5 rounded-full border border-neutral-800">
                <div className="h-7 w-7 rounded-full bg-[#d4af37] text-black flex items-center justify-center font-bold text-xs">{(user.name || 'V').charAt(0)}</div>
                <div className="text-xs text-neutral-200 max-w-[100px] truncate">{user.name}</div>
              </div>
              <button onClick={() => { logout(); nav('/'); }} title="Kilépés" className="h-10 w-10 rounded-full border border-neutral-800 text-neutral-300 hover:text-rose-400 hover:border-rose-400 flex items-center justify-center"><LogOut size={16} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/belepes" className="text-sm px-4 py-2 rounded-full border border-neutral-800 text-neutral-200 hover:border-[#d4af37] inline-flex items-center gap-2"><LogIn size={14} /> Belépés</Link>
              <Link to="/regisztracio" className="text-sm gold-gradient text-black font-bold px-4 py-2 rounded-full inline-flex items-center gap-2"><User size={14} /> Regisztráció</Link>
            </div>
          )}
          <button className="relative h-10 w-10 rounded-full border border-neutral-800 text-neutral-200 flex items-center justify-center hover:border-[#d4af37]">
            <ShoppingCart size={18} />
            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">0</span>
          </button>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="border-t border-neutral-900 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center gap-6 justify-between">
          <Link to="/" className="flex items-center gap-2"><img src={LOGO_URL} className="h-8 w-8 object-contain" alt="" /><span className="gold-text-gradient font-extrabold tracking-wider">ZAVO</span></Link>
          <nav className="flex gap-6 text-sm text-neutral-400">
            <Link to="/">Főoldal</Link><Link to="/etlap">Étlap</Link><Link to="/rolunk">Rólunk</Link><Link to="/szallitas">Szállítás</Link><Link to="/kapcsolat">Kapcsolat</Link>
          </nav>
          <div className="flex items-center gap-4 text-neutral-400">
            <a href="#" className="hover:text-[#d4af37]"><Facebook size={18} /></a>
            <a href="#" className="hover:text-[#d4af37]"><Instagram size={18} /></a>
          </div>
          <div className="font-script text-lg text-neutral-300 inline-flex items-center gap-2">Te megkívánod. Mi elkészítjük. Mi elvisszük. <Heart size={14} className="text-[#d4af37]" /></div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
