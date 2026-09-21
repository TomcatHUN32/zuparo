import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { STATUS_LABELS, formatFt } from '../../mock/mockData';
import { Bike, Plus, Trash2, Pencil, MapPin, ArrowRight, X, Check } from 'lucide-react';
import { toast } from 'sonner';

const Couriers = () => {
  const { couriers, orders, addCourier, updateCourier, deleteCourier, updateOrder } = useData();
  const [selected, setSelected] = useState(null);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');

  const pending = orders.filter((o) => o.type === 'delivery' && !o.courierId && ['new','preparing','ready'].includes(o.status));

  const submit = () => {
    if (!newName.trim()) return toast.error('Add meg a futár nevét');
    addCourier({ name: newName.trim(), phone: '' });
    setNewName(''); toast.success('Futár hozzáadva');
  };
  const saveEdit = (id) => { updateCourier(id, { name: editName.trim() || 'Névtelen' }); setEditing(null); toast.success('Mentés sikeres'); };
  const assign = (orderId) => {
    if (!selected) return toast.error('Válassz futárt jobb oldalon');
    updateOrder(orderId, { courierId: selected, status: 'on_route' });
    toast.success('Cím átadva a futárnak');
  };

  return (
    <div className="p-8 grid grid-cols-12 gap-6">
      <div className="col-span-7">
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-neutral-900 inline-flex items-center gap-2"><MapPin size={18} /> Kiadandó címek</h3>
            <div className="text-xs text-neutral-500">{pending.length} rendelés vár futárra</div>
          </div>
          <div className="space-y-2">
            {pending.map((o) => (
              <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-neutral-300">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-neutral-900">{o.customerName} • <span className="font-normal text-neutral-500">{o.id}</span></div>
                  <div className="text-xs text-neutral-500 truncate">{o.zip} {o.city}, {o.street} {o.floor && `(${o.floor})`}</div>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_LABELS[o.status]?.color}`}>{STATUS_LABELS[o.status]?.label}</span>
                <div className="text-sm font-semibold text-neutral-900 whitespace-nowrap">{formatFt(o.total)}</div>
                <button onClick={() => assign(o.id)} disabled={!selected} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border ${selected ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800' : 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'}`}>
                  Odaadom <ArrowRight size={12} />
                </button>
              </div>
            ))}
            {pending.length === 0 && <div className="text-sm text-neutral-500 text-center py-10">Nincs kiadandó cím most.</div>}
          </div>
        </div>
      </div>

      <div className="col-span-5 space-y-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="text-base font-bold text-neutral-900 mb-3 inline-flex items-center gap-2"><Bike size={18} /> Futárok</h3>
          <div className="flex gap-2 mb-4">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Új futár neve..." className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" onKeyDown={(e) => e.key === 'Enter' && submit()} />
            <button onClick={submit} className="px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm inline-flex items-center gap-1 hover:bg-neutral-800"><Plus size={14} /> Hozzáadás</button>
          </div>
          <div className="space-y-2">
            {couriers.map((c) => (
              <div key={c.id} className={`flex items-center gap-3 p-3 rounded-lg border ${selected === c.id ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'}`}>
                <button onClick={() => setSelected(selected === c.id ? null : c.id)} className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-white ${selected === c.id ? 'bg-emerald-600' : 'bg-neutral-900'}`}>{c.name.charAt(0)}</button>
                <div className="flex-1 min-w-0">
                  {editing === c.id ? (
                    <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(c.id)} className="w-full px-2 py-1 rounded border border-neutral-300 text-sm" />
                  ) : (
                    <div className="text-sm font-semibold text-neutral-900">{c.name}</div>
                  )}
                  <div className="text-xs text-neutral-500 inline-flex items-center gap-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${c.active ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                    {c.active ? 'Aktív' : 'Inaktív'}
                  </div>
                </div>
                <button onClick={() => updateCourier(c.id, { active: !c.active })} className="text-xs px-2 py-1 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50">
                  {c.active ? 'Kikapcs' : 'Bekapcs'}
                </button>
                {editing === c.id ? (
                  <>
                    <button onClick={() => saveEdit(c.id)} className="h-8 w-8 rounded-md bg-emerald-600 text-white flex items-center justify-center"><Check size={14} /></button>
                    <button onClick={() => setEditing(null)} className="h-8 w-8 rounded-md border border-neutral-200 text-neutral-500 flex items-center justify-center"><X size={14} /></button>
                  </>
                ) : (
                  <button onClick={() => { setEditing(c.id); setEditName(c.name); }} className="h-8 w-8 rounded-md border border-neutral-200 text-neutral-500 flex items-center justify-center hover:bg-neutral-50"><Pencil size={14} /></button>
                )}
                <button onClick={() => { deleteCourier(c.id); if (selected === c.id) setSelected(null); toast.success('Futár törölve'); }} className="h-8 w-8 rounded-md border border-neutral-200 text-rose-500 flex items-center justify-center hover:bg-rose-50"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-neutral-500">Tipp: kattints egy futárra (avatar) a kijelöléshez, majd az „Odaadom” gombra egy címnél.</div>
        </div>
      </div>
    </div>
  );
};

export default Couriers;
