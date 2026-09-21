import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CATEGORIES, formatFt, LOGO_URL } from '../../mock/mockData';
import { Search, Plus, Heart } from 'lucide-react';
import { toast } from 'sonner';

const MenuPage = () => {
  const { menu } = useData();
  const [cat, setCat] = useState('pizzak');
  const [q, setQ] = useState('');
  const items = menu.filter((m) => m.category === cat && (q ? (m.name + ' ' + m.description).toLowerCase().includes(q.toLowerCase()) : true));
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="font-script text-2xl text-[#d4af37]">Mindig jó falat</div>
          <h1 className="font-display text-4xl font-black text-white">ÉTLAP</h1>
        </div>
        <div className="relative w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keresés..." className="w-full pl-9 pr-3 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`px-4 py-2 rounded-full text-sm border ${cat === c.id ? 'gold-gradient text-black border-transparent font-bold' : 'bg-neutral-900 text-neutral-200 border-neutral-800 hover:border-[#d4af37]'}`}>{c.name}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((m) => (
          <div key={m.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden card-hover hover:border-[#d4af37]">
            <div className="h-40 bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center relative">
              <img src={LOGO_URL} className="h-20 opacity-70" alt="" />
              <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 border border-neutral-700 text-white flex items-center justify-center hover:text-rose-400"><Heart size={14} /></button>
            </div>
            <div className="p-4">
              <div className="font-bold text-white">{m.name}</div>
              <div className="text-xs text-neutral-400 mt-1 line-clamp-2">{m.description}</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="gold-text-gradient font-extrabold">{formatFt(m.price)}</div>
                <button onClick={() => toast.success(`${m.name} a kosárba került`)} className="h-9 px-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold inline-flex items-center gap-1"><Plus size={14} /> Kosárba</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full text-center text-neutral-500 py-16">Nincs találat.</div>}
      </div>
    </div>
  );
};

export default MenuPage;
