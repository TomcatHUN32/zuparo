import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { STATUS_LABELS, formatFt } from '../../mock/mockData';
import { Bike, MapPin, Phone, Home, CheckCircle2, ArrowRight, User } from 'lucide-react';
import { toast } from 'sonner';

const Couriers = () => {
  const { couriers, orders, updateOrder } = useData();
  const [meId, setMeId] = useState(() => localStorage.getItem('zuparo_courier_me') || null);
  const me = couriers.find((c) => c.id === meId) || null;

  const pickMe = (id) => {
    setMeId(id);
    localStorage.setItem('zuparo_courier_me', id);
  };
  const clearMe = () => { setMeId(null); localStorage.removeItem('zuparo_courier_me'); };

  const available = orders.filter((o) => o.type === 'delivery' && !o.courierId && ['new','preparing','ready'].includes(o.status));
  const mine = orders.filter((o) => o.courierId === meId && o.status === 'on_route');

  const take = async (oid) => {
    if (!meId) return toast.error('Válaszd ki, ki vagy!');
    await updateOrder(oid, { courierId: meId, status: 'on_route' });
    toast.success('Cím elvéve — sok sikert! 🛵');
  };
  const arrived = async (oid) => {
    await updateOrder(oid, { status: 'delivered' });
    toast.success('Megérkezett! ✅');
  };

  if (!me) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-neutral-200 p-8 text-center">
          <div className="h-14 w-14 mx-auto rounded-full bg-neutral-900 text-white flex items-center justify-center"><Bike size={22} /></div>
          <h2 className="mt-4 text-2xl font-bold text-neutral-900">Ki vagy?</h2>
          <p className="text-sm text-neutral-500 mt-1">Válaszd ki magad a listából, hogy megjelenjenek a szabad címek.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {couriers.filter((c) => c.active).map((c) => (
              <button key={c.id} onClick={() => pickMe(c.id)} className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50">
                <div className="h-12 w-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-lg">{c.name.charAt(0)}</div>
                <div className="text-left">
                  <div className="font-semibold text-neutral-900">{c.name}</div>
                  <div className="text-xs text-neutral-500 inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> szabad</div>
                </div>
                <ArrowRight size={16} className="ml-auto text-neutral-400" />
              </button>
            ))}
            {couriers.filter((c) => c.active).length === 0 && <div className="col-span-full text-neutral-500">Nincs aktív futár. Vedd fel a Beállítások → Futárok kezelése menüpontban.</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 grid grid-cols-12 gap-6">
      <div className="col-span-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-lg">{me.name.charAt(0)}</div>
          <div>
            <div className="text-xs text-neutral-500">Bejelentkezve mint</div>
            <div className="text-lg font-bold text-neutral-900">{me.name}</div>
          </div>
        </div>
        <button onClick={clearMe} className="text-sm px-4 py-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 inline-flex items-center gap-2"><User size={14} /> Váltás</button>
      </div>

      {/* Available orders */}
      <div className="col-span-12 lg:col-span-7">
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-neutral-900 inline-flex items-center gap-2"><MapPin size={18} /> Szabad címek</h3>
            <div className="text-xs text-neutral-500">{available.length} db elvihető</div>
          </div>
          <div className="space-y-3">
            {available.map((o) => (
              <div key={o.id} className="rounded-xl border border-neutral-200 p-4 hover:border-neutral-900 card-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900">{o.id}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_LABELS[o.status]?.color}`}>{STATUS_LABELS[o.status]?.label}</span>
                      <span className="text-xs text-neutral-500">{new Date(o.createdAt).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="mt-1 font-semibold text-neutral-900">{o.customerName}</div>
                    <div className="text-xs text-neutral-500 flex flex-wrap gap-3 mt-1">
                      <span className="inline-flex items-center gap-1"><Phone size={12} />{o.phone}</span>
                      <span className="inline-flex items-center gap-1"><MapPin size={12} />{o.zip} {o.city}, {o.street} {o.floor && `(${o.floor})`}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-neutral-900">{formatFt(o.total)}</div>
                    <div className="text-[11px] text-neutral-500">{o.payment === 'cash' ? 'Készpénz' : o.payment === 'card' ? 'Kártya' : 'Online fizetve'}</div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button onClick={() => take(o.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold"><Bike size={14} /> Elviszem</button>
                </div>
              </div>
            ))}
            {available.length === 0 && <div className="text-sm text-neutral-500 text-center py-12">Jelenleg nincs szabad cím.</div>}
          </div>
        </div>
      </div>

      {/* My orders on-route */}
      <div className="col-span-12 lg:col-span-5">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-neutral-900 inline-flex items-center gap-2"><Home size={18} /> Nálam most</h3>
            <div className="text-xs text-neutral-500">{mine.length} db úton</div>
          </div>
          <div className="space-y-3">
            {mine.map((o) => (
              <div key={o.id} className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-neutral-900">{o.customerName}</div>
                    <div className="text-xs text-neutral-600 truncate">{o.zip} {o.city}, {o.street}</div>
                    <div className="text-xs text-neutral-500 mt-1">{o.phone} • {o.payment === 'cash' ? `Készpénz ${formatFt(o.total)}` : o.payment === 'card' ? 'Kártya' : 'Online'}</div>
                  </div>
                  <button onClick={() => arrived(o.id)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"><CheckCircle2 size={14} /> Megérkezett</button>
                </div>
              </div>
            ))}
            {mine.length === 0 && <div className="text-sm text-neutral-500 text-center py-10">Nincs kiszállítás alatt lévő rendelésed.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Couriers;
