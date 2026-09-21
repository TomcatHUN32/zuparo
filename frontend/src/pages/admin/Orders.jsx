import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { STATUS_LABELS, formatFt, CATEGORIES } from '../../mock/mockData';
import { Phone, MapPin, Trash2, Pencil, Filter, XCircle, Bike, Plus, Minus, Globe, Lock, Save, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { toast } from 'sonner';

const Orders = () => {
  const { orders, couriers, updateOrder, deleteOrder, menu } = useData();
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const filtered = useMemo(() => filter === 'all' ? orders : orders.filter((o) => normalize(o.status) === filter), [orders, filter]);

  const cancel = async (o) => {
    if (!window.confirm(`Biztosan sztornózod a ${o.id} rendelést?`)) return;
    await updateOrder(o.id, { status: 'cancelled' });
    toast.success('Rendelés sztornózva');
  };

  const courierName = (id) => couriers.find((c) => c.id === id)?.name;
  const editingOrder = orders.find((o) => o.id === editing);

  return (
    <div className="p-8">
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Filter size={16} className="text-neutral-500 mr-1" />
        {['all', 'new', 'on_route', 'delivered', 'cancelled'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-md text-sm border ${filter === s ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-200'}`}>
            {s === 'all' ? 'Összes' : STATUS_LABELS[s]?.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((o) => {
          const online = o.payment === 'online';
          const shipped = o.status === 'on_route' || o.status === 'delivered' || o.status === 'cancelled';
          return (
            <div key={o.id} className="bg-white border border-neutral-200 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-neutral-900">{o.id}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_LABELS[o.status]?.color}`}>{STATUS_LABELS[o.status]?.label}</span>
                    <span className="text-xs text-neutral-500">{new Date(o.createdAt).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}</span>
                    {o.channel && o.channel !== 'house' && <span className="text-[11px] px-2 py-0.5 rounded-full border bg-neutral-100 text-neutral-700 border-neutral-200">{o.channel === 'foodora' ? 'Foodora' : 'Falatozz'}</span>}
                    {online && <span className="text-[11px] px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 inline-flex items-center gap-1"><Globe size={10} /> Online fizetve</span>}
                    {o.courierId && <span className="text-[11px] px-2 py-0.5 rounded-full border bg-neutral-50 text-neutral-700 border-neutral-200 inline-flex items-center gap-1"><Bike size={10} /> {courierName(o.courierId)}</span>}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">{o.customerName}</div>
                  <div className="text-xs text-neutral-500 flex flex-wrap gap-3 mt-0.5">
                    <span className="inline-flex items-center gap-1"><Phone size={12} />{o.phone}</span>
                    <span className="inline-flex items-center gap-1"><MapPin size={12} />{o.zip} {o.city}, {o.street}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-extrabold text-neutral-900">{formatFt(o.total)}</div>
                  <div className="text-xs text-neutral-500">{o.items.reduce((s, i) => s + i.qty, 0)} tétel • {o.type === 'delivery' ? 'Kiszállítás' : o.type === 'pickup' ? 'Elvitel' : 'Helyben'}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {shipped && online && o.status !== 'cancelled' && (
                  <div className="inline-flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5">
                    <Lock size={12} /> Online fizetve — kiszállítás alatt / megérkezett, nem módosítható
                  </div>
                )}
                {!shipped && (
                  <>
                    <button onClick={() => setEditing(o.id)} className="text-xs px-2.5 py-1.5 rounded-md bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 inline-flex items-center gap-1"><Pencil size={12} /> Rendelés módosítása</button>
                    <button onClick={() => cancel(o)} className="text-xs px-2.5 py-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 inline-flex items-center gap-1"><XCircle size={12} /> Sztornó</button>
                  </>
                )}
                {(o.status === 'cancelled' || o.status === 'delivered') && (
                  <button onClick={async () => { await deleteOrder(o.id); toast.success('Rendelés törölve'); }} className="text-xs px-2.5 py-1.5 rounded-md bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200 inline-flex items-center gap-1"><Trash2 size={12} /> Törlés</button>
                )}
              </div>

              {/* Items dropdown */}
              <div className="mt-3 rounded-lg border border-neutral-200 overflow-hidden">
                <button onClick={() => toggle(o.id)} className="w-full flex items-center justify-between px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-sm">
                  <span className="inline-flex items-center gap-2 text-neutral-700">
                    <span className="text-neutral-500">Tételek</span>
                    <span className="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-md bg-neutral-900 text-white text-xs font-bold">{o.items.reduce((s, i) => s + i.qty, 0)}</span>
                    <span className="text-neutral-500 hidden sm:inline">• {o.items.map((i) => `${i.qty}× ${i.name}`).slice(0, 2).join(', ')}{o.items.length > 2 ? '...' : ''}</span>
                  </span>
                  {expanded[o.id] ? <ChevronUp size={16} className="text-neutral-500" /> : <ChevronDown size={16} className="text-neutral-500" />}
                </button>
                {expanded[o.id] && (
                  <div className="divide-y divide-neutral-200 bg-white">
                    {o.items.map((it, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-neutral-900">
                            <span className="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-md bg-neutral-900 text-white text-xs font-bold mr-2">{it.qty}×</span>
                            <span className="font-semibold">{it.name}</span>
                          </div>
                          {it.note && <div className="text-xs text-neutral-500 mt-0.5 ml-8">📝 {it.note}</div>}
                        </div>
                        <div className="text-sm font-semibold text-neutral-900 whitespace-nowrap">{formatFt(it.price * it.qty)}</div>
                      </div>
                    ))}
                    <div className="px-3 py-2 flex items-center justify-between text-xs text-neutral-600 bg-neutral-50">
                      <div className="flex flex-wrap gap-3">
                        <span>Részösszeg: <span className="font-semibold text-neutral-900">{formatFt(o.subtotal || 0)}</span></span>
                        {(o.discountAmount || 0) > 0 && <span>Kedvezmény{o.couponCode ? ` (${o.couponCode})` : ''}: <span className="font-semibold text-emerald-700">- {formatFt(o.discountAmount)}</span></span>}
                        {o.type === 'delivery' && <span>Szállítás: <span className="font-semibold text-neutral-900">{formatFt(o.deliveryFee || 0)}</span></span>}
                        <span>Fizetés: <span className="font-semibold text-neutral-900">{o.payment === 'cash' ? 'Készpénz' : o.payment === 'card' ? 'Kártya' : 'Online'}</span></span>
                      </div>
                      {o.note && <span className="italic text-neutral-500 truncate max-w-[40%]">Belső: {o.note}</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-sm text-neutral-500 text-center py-16">Nincs rendelés ebben a nézetben.</div>}
      </div>

      {editingOrder && (
        <EditModal order={editingOrder} menu={menu} onClose={() => setEditing(null)} onSave={async (patch) => { await updateOrder(editingOrder.id, patch); setEditing(null); toast.success('Rendelés módosítva'); }} />
      )}
    </div>
  );
};

// Normalize legacy statuses (preparing/ready) to new
const normalize = (s) => (s === 'preparing' || s === 'ready') ? 'new' : s;

const EditModal = ({ order, menu, onClose, onSave }) => {
  const [items, setItems] = useState(order.items.map((i) => ({ ...i })));
  const [addr, setAddr] = useState({ zip: order.zip, city: order.city, street: order.street, floor: order.floor || '' });
  const [note, setNote] = useState(order.note || '');
  const [payment, setPayment] = useState(order.payment);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('pizzak');

  const setQty = (i, delta) => setItems((prev) => prev.map((c, idx) => idx === i ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
  const remove = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const addItemFromMenu = (m) => {
    setItems((prev) => {
      const idx = prev.findIndex((c) => c.id === m.id && !c.note);
      if (idx >= 0) { const copy = [...prev]; copy[idx].qty += 1; return copy; }
      return [...prev, { id: m.id, name: m.name, price: m.price, qty: 1, note: '' }];
    });
    toast.success(`${m.name} hozzáadva`);
  };

  const filtered = menu.filter((m) => (q ? (m.name + ' ' + (m.description || '')).toLowerCase().includes(q.toLowerCase()) : m.category === cat));

  const subtotal = items.reduce((s, c) => s + c.price * c.qty, 0);
  const total = Math.max(0, subtotal - (order.discountAmount || 0) + (order.deliveryFee || 0));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-200" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500">Rendelés módosítása</div>
            <h3 className="text-lg font-bold text-neutral-900">{order.id} • {order.customerName}</h3>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full border border-neutral-200 text-neutral-500 flex items-center justify-center hover:bg-neutral-50"><X size={16} /></button>
        </div>
        <div className="p-6 grid grid-cols-12 gap-5 max-h-[70vh] overflow-y-auto">
          {/* Left: cart items */}
          <div className="col-span-12 md:col-span-6">
            <div className="text-sm font-semibold text-neutral-900 mb-2">Tételek</div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {items.map((c, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-1 rounded-md border border-neutral-200">
                    <button onClick={() => setQty(i, -1)} className="h-8 w-8 flex items-center justify-center"><Minus size={14} /></button>
                    <div className="w-6 text-center text-sm font-semibold">{c.qty}</div>
                    <button onClick={() => setQty(i, +1)} className="h-8 w-8 flex items-center justify-center"><Plus size={14} /></button>
                  </div>
                  <div className="flex-1 text-sm font-semibold text-neutral-900 truncate">{c.name}</div>
                  <div className="text-sm font-semibold text-neutral-900 whitespace-nowrap">{formatFt(c.price * c.qty)}</div>
                  <button onClick={() => remove(i)} className="h-8 w-8 flex items-center justify-center text-neutral-400 hover:text-rose-600"><Trash2 size={14} /></button>
                </div>
              ))}
              {items.length === 0 && <div className="text-sm text-neutral-500 py-6 text-center">A rendelés tétel nélkül maradt.</div>}
            </div>

            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Ir.szám" value={addr.zip} onChange={(e) => setAddr({ ...addr, zip: e.target.value })} className="px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
                <input placeholder="Település" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} className="px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
              </div>
              <input placeholder="Utca, házszám" value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
              <input placeholder="Emelet / ajtó" value={addr.floor} onChange={(e) => setAddr({ ...addr, floor: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
              <textarea rows={2} placeholder="Megjegyzés" value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
              <div>
                <div className="text-xs text-neutral-500 mb-1">Fizetés</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPayment('cash')} className={`px-3 py-2 rounded-lg border text-sm ${payment === 'cash' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white border-neutral-200'}`}>Készpénz</button>
                  <button onClick={() => setPayment('card')} className={`px-3 py-2 rounded-lg border text-sm ${payment === 'card' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white border-neutral-200'}`}>Bankkártya</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: add product picker */}
          <div className="col-span-12 md:col-span-6">
            <div className="text-sm font-semibold text-neutral-900 mb-2">Új tétel hozzáadása</div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Termék keresése..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-neutral-200 text-sm" />
              </div>
              {!q && (
                <div className="flex gap-1 flex-wrap mt-2">
                  {CATEGORIES.map((c) => (
                    <button key={c.id} onClick={() => setCat(c.id)} className={`px-2.5 py-1 rounded-md text-xs border ${cat === c.id ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-200'}`}>{c.name}</button>
                  ))}
                </div>
              )}
              <div className="mt-2 max-h-64 overflow-y-auto pr-1 space-y-1.5">
                {filtered.map((m) => (
                  <button key={m.id} onClick={() => addItemFromMenu(m)} className="w-full flex items-center gap-2 p-2 rounded-lg border border-neutral-200 bg-white hover:border-neutral-900 hover:bg-neutral-50 text-left">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-neutral-900 truncate">{m.name}</div>
                      {m.description && <div className="text-xs text-neutral-500 truncate">{m.description}</div>}
                    </div>
                    <div className="text-sm font-semibold text-neutral-900 whitespace-nowrap">{formatFt(m.price)}</div>
                    <div className="h-7 w-7 rounded-md bg-neutral-900 text-white flex items-center justify-center"><Plus size={14} /></div>
                  </button>
                ))}
                {filtered.length === 0 && <div className="text-sm text-neutral-500 py-6 text-center">Nincs találat.</div>}
              </div>
            </div>
          </div>

          {/* Bottom: totals full-width */}
          <div className="col-span-12 border-t border-neutral-200 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-neutral-600"><span>Részösszeg</span><span>{formatFt(subtotal)}</span></div>
            <div className="flex justify-between text-neutral-600"><span>Kiszállítás</span><span>{formatFt(order.deliveryFee || 0)}</span></div>
            {(order.discountAmount || 0) > 0 && <div className="flex justify-between text-neutral-600"><span>Kedvezmény</span><span>- {formatFt(order.discountAmount)}</span></div>}
            <div className="flex justify-between font-extrabold text-neutral-900 text-base"><span>ÖSSZESEN</span><span>{formatFt(total)}</span></div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-neutral-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-700 text-sm">Mégsem</button>
          <button onClick={() => onSave({ items, subtotal, total, ...addr, note, payment })} className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm inline-flex items-center gap-2"><Save size={14} /> Módosítás mentése</button>
        </div>
      </div>
    </div>
  );
};

export default Orders;
