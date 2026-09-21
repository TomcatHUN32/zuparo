import React from 'react';
import { Link } from 'react-router-dom';
import { LOGO_URL, CATEGORIES, formatFt } from '../../mock/mockData';
import { useData } from '../../context/DataContext';
import { Clock, Bike, Heart, ArrowRight, MapPin, Phone, Flame, Pizza, Beef, Utensils, Wheat, Salad, Popcorn, CakeSlice, CupSoda, Percent } from 'lucide-react';

const ICONS = { Pizza, Beef, Utensils, Wheat, Salad, Popcorn, CakeSlice, CupSoda };

const Home = () => {
  const { menu } = useData();
  const featured = [
    menu.find((m) => m.name === 'Margherita'),
    menu.find((m) => m.name === 'ZAVO Burger menü'),
    menu.find((m) => m.name === 'Gyros tál'),
    menu.find((m) => m.name === 'Csirkés tortilla'),
  ].filter(Boolean);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(1200px 500px at 70% 30%, rgba(212,175,55,0.18), transparent 60%), linear-gradient(180deg, #0a0a0a 0%, #0a0a0a 60%, #0f0f10 100%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 md:col-span-6">
            <div className="font-script text-3xl md:text-4xl text-[#d4af37]">Mindig jó falat</div>
            <h1 className="mt-3 font-display text-5xl md:text-7xl font-black leading-[0.95]">
              <span className="text-white">ÉJJEL‑NAPPAL</span><br />
              <span className="gold-text-gradient">VELED VAGYUNK!</span>
            </h1>
            <div className="mt-8 flex flex-wrap gap-6">
              <IconBlock icon={Clock} title="0–24" sub="RENDELHETŐ" />
              <IconBlock icon={Bike} title="GYORS" sub="KISZÁLLÍTÁS" />
              <IconBlock icon={Heart} title="MINŐSÉGI" sub="ÉTELEK" />
            </div>
            <Link to="/etlap" className="mt-8 inline-flex items-center gap-3 gold-gradient text-black font-extrabold tracking-wider px-8 py-4 rounded-full shadow-[0_10px_30px_-10px_rgba(212,175,55,0.6)] hover:brightness-105">
              RENDELJ MOST <span className="h-8 w-8 rounded-full bg-black text-[#d4af37] flex items-center justify-center"><ArrowRight size={16} /></span>
            </Link>
            <div className="mt-6 font-script text-lg text-neutral-300">Te megkívánod. Mi elkészítjük. Mi elvisszük. <Heart size={14} className="inline text-[#d4af37]" /></div>
          </div>
          <div className="col-span-12 md:col-span-6 flex justify-center">
            <div className="relative">
              <img src={LOGO_URL} alt="ZAVO Pizza" className="h-[380px] md:h-[460px] object-contain drop-shadow-[0_30px_60px_rgba(212,175,55,0.25)]" />
              <div className="absolute -bottom-4 -right-4 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-2xl">
                <Flame size={22} className="text-[#d4af37]" />
                <div className="leading-tight"><div className="text-xs text-neutral-400">FRISSEN.</div><div className="text-xs text-neutral-400">SZAFTOSAN.</div><div className="text-xs text-neutral-400">NEKED.</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category strip */}
      <section className="max-w-7xl mx-auto px-6 -mt-4">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIES.slice(0, 8).map((c, i) => {
            const Icon = ICONS[c.icon] || Utensils;
            return (
              <Link key={c.id} to="/etlap" className={`rounded-2xl border p-4 flex flex-col items-center justify-center text-center card-hover ${i === 0 ? 'border-[#d4af37] bg-neutral-900' : 'border-neutral-800 bg-neutral-900/60 hover:border-[#d4af37]'}`}>
                <Icon size={28} className={i === 0 ? 'text-[#d4af37]' : 'text-neutral-300'} />
                <div className={`mt-2 text-xs tracking-[0.2em] ${i === 0 ? 'text-[#d4af37]' : 'text-neutral-300'}`}>{c.name.toUpperCase()}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs tracking-[0.35em] text-neutral-500">LEGNÉPSZERŰBB ÉTELEINK</div>
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mt-1">A VENDÉGEINK KEDVENCEI</h2>
          </div>
          <Link to="/etlap" className="text-sm text-[#d4af37] hover:underline inline-flex items-center gap-1">Összes étel megtekintése <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((m, i) => (
            <div key={m.id} className="relative rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden card-hover hover:border-[#d4af37]">
              <div className="h-40 bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center">
                <img src={LOGO_URL} className="h-24 object-contain opacity-70" alt="" />
              </div>
              {i === 0 && <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded gold-gradient text-black">TOP</span>}
              {i === 1 && <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded bg-rose-500 text-white">ÚJ</span>}
              <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 border border-neutral-700 text-white flex items-center justify-center hover:text-rose-400"><Heart size={14} /></button>
              <div className="p-4">
                <div className="font-bold text-white">{m.name}</div>
                <div className="text-xs text-neutral-400 mt-1 line-clamp-2">{m.description}</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="gold-text-gradient font-extrabold">{formatFt(m.price)}</div>
                  <button className="h-9 w-9 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info strip */}
      <section className="max-w-7xl mx-auto px-6 mt-16 mb-16">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-800">
          <InfoCol icon={Bike} title="0–24 KISZÁLLÍTÁS" sub="Éjjel-nappal rendelhetsz!" />
          <InfoCol icon={MapPin} title="ELLENŐRIZD" sub="A szállítási területed" cta={{ to: '/szallitas', label: 'Cím megadása' }} />
          <InfoCol icon={Phone} title="RENDELÉS TELEFONON IS" sub="06 30 728 2289" />
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <span className="inline-flex items-center gap-2 text-xs text-neutral-500"><Percent size={12} className="text-[#d4af37]" /> Akciók, kupon kódok az étlapon</span>
        </div>
      </section>
    </div>
  );
};

const IconBlock = ({ icon: Icon, title, sub }) => (
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 rounded-full border border-neutral-700 flex items-center justify-center"><Icon size={18} className="text-neutral-200" /></div>
    <div><div className="font-extrabold text-white leading-tight">{title}</div><div className="text-[10px] tracking-[0.25em] text-neutral-400">{sub}</div></div>
  </div>
);
const InfoCol = ({ icon: Icon, title, sub, cta }) => (
  <div className="p-6 flex items-center gap-4">
    <div className="h-12 w-12 rounded-full border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]"><Icon size={22} /></div>
    <div>
      <div className="font-extrabold tracking-widest text-white text-sm">{title}</div>
      <div className="text-sm text-neutral-400 mt-0.5">{sub}</div>
      {cta && <Link to={cta.to} className="mt-2 inline-flex items-center gap-2 gold-gradient text-black text-xs font-bold px-3 py-1.5 rounded-full">{cta.label} <ArrowRight size={12} /></Link>}
    </div>
  </div>
);

export default Home;
