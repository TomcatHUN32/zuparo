import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { STATUS_LABELS, formatFt } from '../../mock/mockData';
import { Phone, MapPin, Trash2, CheckCircle2, Bike, ChevronRight, Filter } from 'lucide-react';
import { toast } from 'sonner';

const Orders = () => {
  const { orders, couriers, updateOrder, deleteOrder } = useData();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => filter === 'all' ? orders : orders.filter((o) => o.status === filter), [orders, filter]);
  const activeCouriers = couriers.filter((c) => c.active);

  const setStatus = (id, status) => { updateOrder(id, { status }); toast.success('Státusz frissítve'); };
  const assignCourier = (id, courierId) => { updateOrder(id, { courierId, status: 'on_route' }); toast.success('Futár hozzárendelve'); };

  return (
    <div className="p-8 grid grid-cols-12 gap-6">
      <div className="col-span-8">
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <Filter size={16} className="text-neutral-500 mr-1" />
          {['all', 'new', 'preparing', 'ready', 'on_route', 'delivered', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-md text-sm border ${filter === s ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-200'}`}>
              {s === 'all' ? 'Összes' : STATUS_LABELS[s].label}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} onClick={() => setSelected(o.id)} className={`bg-white border rounded-xl p-4 cursor-pointer card-hover ${selected === o.id ? 'border-neutral-900' : 'border-neutral-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-900">{o.id}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_LABELS[o.status]?.color}`}>{STATUS_LABELS[o.status]?.label}</span>
                    <span className="text-xs text-neutral-500">{new Date(o.createdAt).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">{o.customerName}</div>
                  <div className="text-xs text-neutral-500 flex flex-wrap gap-3 mt-0.5">
                    <span className="inline-flex items-center gap-1"><Phone size={12} />{o.phone}</span>
                    <span className="inline-flex items-center gap-1"><MapPin size={12} />{o.zip} {o.city}, {o.street}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold text-neutral-900">{formatFt(o.total)}</div>
                  <div className="text-xs text-neutral-500">{o.items.reduce((s, i) => s + i.qty, 0)} tétel • {o.type === 'delivery' ? 'Kiszállítás' : o.type === 'pickup' ? 'Elvitel' : 'Helyben'}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {o.status !== 'delivered' && o.status !== 'cancelled' && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setStatus(o.id, 'preparing'); }} className="text-xs px-2.5 py-1.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200">Készül</button>
                    <button onClick={(e) => { e.stopPropagation(); setStatus(o.id, 'ready'); }} className="text-xs px-2.5 py-1.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200">Kész</button>
                    <button onClick={(e) => { e.stopPropagation(); setStatus(o.id, 'delivered'); }} className="text-xs px-2.5 py-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1"><CheckCircle2 size={12} /> Kiszállítva</button>
                  </>
                )}
                <button onClick={(e) => { e.stopPropagation(); deleteOrder(o.id); toast.success('Rendelés törölve'); }} className="text-xs px-2.5 py-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 inline-flex items-center gap-1"><Trash2 size={12} /> Törlés</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-sm text-neutral-500 text-center py-16">Nincs rendelés ebben a nézetben.</div>}
        </div>
      </div>
      <div className="col-span-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 sticky top-4">
          <h3 className="text-base font-bold text-neutral-900 mb-3">Futár hozzárendelése</h3>
          {!selected && <div className="text-sm text-neutral-500">Válassz egy rendelést a bal oldalon.</div>}
          {selected && (
            <>
              <div className="text-xs text-neutral-500 mb-2">Kiválasztott: <span className="font-semibold text-neutral-900">{selected}</span></div>
              <div className="space-y-2">
                {activeCouriers.map((c) => (
                  <button key={c.id} onClick={() => assignCourier(selected, c.id)} className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-semibold">{c.name.charAt(0)}</div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-neutral-900 inline-flex items-center gap-2"><Bike size={14} /> {c.name}</div>
                        <div className="text-xs text-neutral-500">{c.phone}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400" />
                  </button>
                ))}
                {activeCouriers.length === 0 && <div className="text-sm text-neutral-500">Nincs aktív futár.</div>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
