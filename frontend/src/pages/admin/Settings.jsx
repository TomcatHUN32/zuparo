import React, { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatFt } from '../../mock/mockData';
import { MapPin, Bike, Ticket, ClipboardList, Plus, Trash2, Pencil, Check, X, ArrowRight, FileArchive, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TABS = [
  { id: 'zones', label: 'Szállítási területek', icon: MapPin },
  { id: 'couriers', label: 'Futárok kezelése', icon: Bike },
  { id: 'coupons', label: 'Kuponkódok', icon: Ticket },
  { id: 'dayclose', label: 'Napi zárás', icon: ClipboardList },
  { id: 'courierclose', label: 'Futár zárás', icon: BadgeCheck },
];

const Settings = () => {
  const [tab, setTab] = useState('zones');
  return (
    <div className="p-8">
      <div className="flex flex-wrap gap-2 mb-6 border-b border-neutral-200 pb-3">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 ${tab === t.id ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>
      {tab === 'zones' && <ZonesTab />}
      {tab === 'couriers' && <CouriersTab />}
      {tab === 'coupons' && <CouponsTab />}
      {tab === 'dayclose' && <DayCloseTab />}
      {tab === 'courierclose' && <CourierCloseTab />}
    </div>
  );
};

// ---------------- Zones ----------------
const ZonesTab = () => {
  const { zones, addZone, updateZone, deleteZone } = useData();
  const [draft, setDraft] = useState({ zip: '', city: '', fee: 500 });
  const [editing, setEditing] = useState(null);
  const [ed, setEd] = useState({});
  const submit = async () => {
    if (!draft.zip || !draft.city) return toast.error('Irányítószám és település kötelező');
    await addZone({ ...draft, fee: Number(draft.fee) });
    setDraft({ zip: '', city: '', fee: 500 }); toast.success('Zóna hozzáadva');
  };
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-base font-bold text-neutral-900 mb-3 inline-flex items-center gap-2"><MapPin size={18} /> Új szállítási zóna</h3>
        <div className="grid grid-cols-12 gap-3">
          <input placeholder="Irányítószám" value={draft.zip} onChange={(e) => setDraft({ ...draft, zip: e.target.value })} className="col-span-3 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
          <input placeholder="Település" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} className="col-span-5 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
          <input type="number" placeholder="Szállítási díj (Ft)" value={draft.fee} onChange={(e) => setDraft({ ...draft, fee: e.target.value })} className="col-span-2 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
          <button onClick={submit} className="col-span-2 px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm inline-flex items-center justify-center gap-1 hover:bg-neutral-800"><Plus size={14} /> Hozzáadás</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
            <tr><th className="py-2 px-4 text-left">Irányítószám</th><th className="py-2 px-4 text-left">Település</th><th className="py-2 px-4 text-right">Szállítási díj</th><th></th></tr>
          </thead>
          <tbody>
            {zones.map((z) => editing === z.id ? (
              <tr key={z.id} className="bg-neutral-50 border-b border-neutral-100">
                <td className="py-2 px-4"><input value={ed.zip} onChange={(e) => setEd({ ...ed, zip: e.target.value })} className="w-24 px-2 py-1 border rounded" /></td>
                <td className="py-2 px-4"><input value={ed.city} onChange={(e) => setEd({ ...ed, city: e.target.value })} className="w-full px-2 py-1 border rounded" /></td>
                <td className="py-2 px-4 text-right"><input type="number" value={ed.fee} onChange={(e) => setEd({ ...ed, fee: e.target.value })} className="w-24 px-2 py-1 border rounded text-right" /></td>
                <td className="py-2 px-4 text-right whitespace-nowrap">
                  <button onClick={async () => { await updateZone(z.id, { ...ed, fee: Number(ed.fee) }); setEditing(null); toast.success('Mentve'); }} className="h-8 w-8 rounded-md bg-emerald-600 text-white inline-flex items-center justify-center mr-1"><Check size={14} /></button>
                  <button onClick={() => setEditing(null)} className="h-8 w-8 rounded-md border border-neutral-200 text-neutral-500 inline-flex items-center justify-center"><X size={14} /></button>
                </td>
              </tr>
            ) : (
              <tr key={z.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="py-2 px-4 font-semibold text-neutral-900">{z.zip}</td>
                <td className="py-2 px-4 text-neutral-700">{z.city}</td>
                <td className="py-2 px-4 text-right font-semibold">{formatFt(z.fee)}</td>
                <td className="py-2 px-4 text-right whitespace-nowrap">
                  <button onClick={() => { setEditing(z.id); setEd(z); }} className="h-8 w-8 rounded-md border border-neutral-200 text-neutral-500 inline-flex items-center justify-center mr-1 hover:bg-neutral-50"><Pencil size={14} /></button>
                  <button onClick={async () => { await deleteZone(z.id); toast.success('Törölve'); }} className="h-8 w-8 rounded-md border border-neutral-200 text-rose-500 inline-flex items-center justify-center hover:bg-rose-50"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {zones.length === 0 && <tr><td colSpan={4} className="py-10 text-center text-neutral-500">Még nincs zóna.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------------- Couriers ----------------
const CouriersTab = () => {
  const { couriers, addCourier, updateCourier, deleteCourier } = useData();
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');

  const submit = async () => {
    if (!newName.trim()) return toast.error('Add meg a nevet');
    await addCourier({ name: newName.trim(), phone: '' });
    setNewName(''); toast.success('Futár hozzáadva');
  };
  const saveEdit = async (id) => { await updateCourier(id, { name: editName.trim() || 'Névtelen' }); setEditing(null); toast.success('Mentve'); };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-base font-bold text-neutral-900 mb-3 inline-flex items-center gap-2"><Bike size={18} /> Futárok</h3>
        <div className="flex gap-2 mb-4">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Új futár neve..." className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" onKeyDown={(e) => e.key === 'Enter' && submit()} />
          <button onClick={submit} className="px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm inline-flex items-center gap-1 hover:bg-neutral-800"><Plus size={14} /> Hozzáadás</button>
        </div>
        <div className="space-y-2">
          {couriers.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200">
              <div className="h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-semibold">{c.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                {editing === c.id ? (
                  <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(c.id)} className="w-full px-2 py-1 rounded border border-neutral-300 text-sm" />
                ) : (<div className="text-sm font-semibold text-neutral-900">{c.name}</div>)}
                <div className="text-xs text-neutral-500 inline-flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${c.active ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                  {c.active ? 'Aktív' : 'Inaktív'}
                </div>
              </div>
              <button onClick={() => updateCourier(c.id, { active: !c.active })} className="text-xs px-2 py-1 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50">{c.active ? 'Kikapcs' : 'Bekapcs'}</button>
              {editing === c.id ? (
                <>
                  <button onClick={() => saveEdit(c.id)} className="h-8 w-8 rounded-md bg-emerald-600 text-white flex items-center justify-center"><Check size={14} /></button>
                  <button onClick={() => setEditing(null)} className="h-8 w-8 rounded-md border border-neutral-200 text-neutral-500 flex items-center justify-center"><X size={14} /></button>
                </>
              ) : (
                <button onClick={() => { setEditing(c.id); setEditName(c.name); }} className="h-8 w-8 rounded-md border border-neutral-200 text-neutral-500 flex items-center justify-center hover:bg-neutral-50"><Pencil size={14} /></button>
              )}
              <button onClick={async () => { await deleteCourier(c.id); toast.success('Futár törölve'); }} className="h-8 w-8 rounded-md border border-neutral-200 text-rose-500 flex items-center justify-center hover:bg-rose-50"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------------- Coupons ----------------
const CouponsTab = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useData();
  const [draft, setDraft] = useState({ code: '', kind: 'percent', value: 10, active: true });
  const submit = async () => {
    if (!draft.code) return toast.error('Kód szükséges');
    await addCoupon({ ...draft, code: draft.code.toUpperCase(), value: Number(draft.value) });
    setDraft({ code: '', kind: 'percent', value: 10, active: true }); toast.success('Kupon hozzáadva');
  };
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-base font-bold text-neutral-900 mb-3 inline-flex items-center gap-2"><Ticket size={18} /> Új kupon</h3>
        <div className="grid grid-cols-12 gap-3">
          <input placeholder="Kód (pl. ZUPARO10)" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} className="col-span-4 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
          <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })} className="col-span-3 px-3 py-2 border border-neutral-200 rounded-lg text-sm">
            <option value="percent">Százalékos (%)</option>
            <option value="amount">Fix összeg (Ft)</option>
          </select>
          <input type="number" placeholder="Érték" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} className="col-span-3 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
          <button onClick={submit} className="col-span-2 px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm inline-flex items-center justify-center gap-1 hover:bg-neutral-800"><Plus size={14} /> Létrehozás</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
            <tr><th className="py-2 px-4 text-left">Kód</th><th className="py-2 px-4 text-left">Típus</th><th className="py-2 px-4 text-right">Érték</th><th className="py-2 px-4">Állapot</th><th></th></tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="py-2 px-4 font-semibold text-neutral-900">{c.code}</td>
                <td className="py-2 px-4 text-neutral-700">{c.kind === 'percent' ? 'Százalékos' : 'Fix összeg'}</td>
                <td className="py-2 px-4 text-right font-semibold">{c.kind === 'percent' ? `${c.value}%` : formatFt(c.value)}</td>
                <td className="py-2 px-4">
                  <button onClick={() => updateCoupon(c.id, { active: !c.active })} className={`text-xs px-2 py-1 rounded-full border ${c.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>{c.active ? 'Aktív' : 'Inaktív'}</button>
                </td>
                <td className="py-2 px-4 text-right">
                  <button onClick={async () => { await deleteCoupon(c.id); toast.success('Törölve'); }} className="h-8 w-8 rounded-md border border-neutral-200 text-rose-500 inline-flex items-center justify-center hover:bg-rose-50"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-neutral-500">Még nincs kupon.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------------- Day close ----------------
const DayCloseTab = () => {
  const [rep, setRep] = useState(null);
  const [history, setHistory] = useState([]);
  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/reports/today`);
      setRep(data);
      const h = await axios.get(`${API}/reports/history`).then((r) => r.data);
      setHistory(h);
    } catch (e) { toast.error('Nem sikerült a napi zárás betöltése'); }
  };
  useEffect(() => { load(); }, []);
  const close = async () => {
    await axios.post(`${API}/reports/close-day`);
    toast.success('Napi zárás archiválva');
    load();
  };
  if (!rep) return <div className="text-neutral-500">Betöltés...</div>;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Rendelések ma" value={rep.orders} />
        <Stat label="Bevétel ma" value={formatFt(rep.revenue)} />
        <Stat label="Kp. bevétel" value={formatFt(rep.byPayment?.cash || 0)} />
        <Stat label="Kártya + online" value={formatFt((rep.byPayment?.card || 0) + (rep.byPayment?.online || 0))} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="font-bold mb-3">Bevétel csatorna szerint</h3>
          <ul className="space-y-2 text-sm">
            {Object.entries(rep.byChannel || {}).map(([k, v]) => (<li key={k} className="flex justify-between"><span className="capitalize">{k}</span><span className="font-semibold">{formatFt(v)}</span></li>))}
            {Object.keys(rep.byChannel || {}).length === 0 && <li className="text-neutral-500">Nincs adat.</li>}
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="font-bold mb-3">Futárok bontása</h3>
          <ul className="space-y-2 text-sm">
            {(rep.byCourier || []).map((c, i) => (<li key={i} className="flex justify-between"><span>{c.name} ({c.orders} db)</span><span className="font-semibold">{formatFt(c.revenue)}</span></li>))}
            {(rep.byCourier || []).length === 0 && <li className="text-neutral-500">Nincs futáradat.</li>}
          </ul>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={close} className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-5 py-3 rounded-lg"><FileArchive size={16} /> Napi zárás archiválása</button>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="font-bold mb-3">Zárási előzmények</h3>
        <table className="w-full text-sm">
          <thead className="text-neutral-500 border-b border-neutral-200">
            <tr><th className="py-2 text-left">Dátum</th><th className="py-2 text-right">Rendelések</th><th className="py-2 text-right">Bevétel</th><th className="py-2 text-right">Zárva</th></tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="border-b border-neutral-100">
                <td className="py-2">{h.date}</td>
                <td className="py-2 text-right">{h.orders}</td>
                <td className="py-2 text-right font-semibold">{formatFt(h.revenue)}</td>
                <td className="py-2 text-right text-neutral-500">{new Date(h.closedAt).toLocaleString('hu-HU')}</td>
              </tr>
            ))}
            {history.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-neutral-500">Még nincs archivált zárás.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------------- Courier close ----------------
const CourierCloseTab = () => {
  const { couriers } = useData();
  const [reports, setReports] = useState({});
  useEffect(() => {
    (async () => {
      const map = {};
      for (const c of couriers) {
        try { map[c.id] = await axios.get(`${API}/reports/courier/${c.id}`).then((r) => r.data); }
        catch { map[c.id] = null; }
      }
      setReports(map);
    })();
  }, [couriers]);
  return (
    <div className="grid grid-cols-2 gap-6">
      {couriers.map((c) => {
        const r = reports[c.id];
        return (
          <div key={c.id} className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-base font-bold text-neutral-900">{c.name}</div>
                <div className="text-xs text-neutral-500">Mai zárás</div>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full border ${c.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>{c.active ? 'Aktív' : 'Inaktív'}</div>
            </div>
            {!r && <div className="text-neutral-500 text-sm">Betöltés...</div>}
            {r && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Kiszállítva" value={`${r.orders} db`} sm />
                <Stat label="Bevétel" value={formatFt(r.revenue)} sm />
                <Stat label="Készpénz" value={formatFt(r.cash)} sm />
                <Stat label="Kártya + online" value={formatFt(r.card + r.online)} sm />
              </div>
            )}
          </div>
        );
      })}
      {couriers.length === 0 && <div className="col-span-2 text-neutral-500 text-center py-16">Nincs futár.</div>}
    </div>
  );
};

const Stat = ({ label, value, sm }) => (
  <div className={`rounded-xl border border-neutral-200 bg-white ${sm ? 'p-3' : 'p-5'}`}>
    <div className="text-xs text-neutral-500">{label}</div>
    <div className={`font-extrabold text-neutral-900 ${sm ? 'text-lg' : 'text-2xl'}`}>{value}</div>
  </div>
);

export default Settings;
