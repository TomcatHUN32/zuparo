import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatFt } from '../../mock/mockData';
import { Plus, Trash2, Pencil, Check, X, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { zones, addZone, updateZone, deleteZone } = useData();
  const [draft, setDraft] = useState({ zip: '', city: '', fee: 500 });
  const [editing, setEditing] = useState(null);
  const [ed, setEd] = useState({});
  const submit = () => {
    if (!draft.zip || !draft.city) return toast.error('Irányítószám és település kötelező');
    addZone({ ...draft, fee: Number(draft.fee) });
    setDraft({ zip: '', city: '', fee: 500 }); toast.success('Zona hozzáadva');
  };
  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-base font-bold text-neutral-900 mb-3 inline-flex items-center gap-2"><MapPin size={18} /> Új szállítási zona</h3>
        <div className="grid grid-cols-12 gap-3">
          <input placeholder="Irányítószám" value={draft.zip} onChange={(e) => setDraft({ ...draft, zip: e.target.value })} className="col-span-3 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
          <input placeholder="Település" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} className="col-span-5 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
          <input type="number" placeholder="Száll. díj (Ft)" value={draft.fee} onChange={(e) => setDraft({ ...draft, fee: e.target.value })} className="col-span-2 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
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
                  <button onClick={() => { updateZone(z.id, { ...ed, fee: Number(ed.fee) }); setEditing(null); toast.success('Mentve'); }} className="h-8 w-8 rounded-md bg-emerald-600 text-white inline-flex items-center justify-center mr-1"><Check size={14} /></button>
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
                  <button onClick={() => { deleteZone(z.id); toast.success('Törölve'); }} className="h-8 w-8 rounded-md border border-neutral-200 text-rose-500 inline-flex items-center justify-center hover:bg-rose-50"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;
