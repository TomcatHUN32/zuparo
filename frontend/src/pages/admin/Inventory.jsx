import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Trash2, Pencil, Check, X, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const Inventory = () => {
  const { inventory, addInventory, updateInventory, deleteInventory } = useData();
  const [draft, setDraft] = useState({ name: '', unit: 'db', stock: 0, minStock: 0 });
  const [editing, setEditing] = useState(null);
  const [ed, setEd] = useState({});
  const submit = () => {
    if (!draft.name) return toast.error('Név kötelező');
    addInventory({ ...draft, stock: Number(draft.stock), minStock: Number(draft.minStock) });
    setDraft({ name: '', unit: 'db', stock: 0, minStock: 0 }); toast.success('Alapanyag hozzáadva');
  };
  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-base font-bold text-neutral-900 mb-3 inline-flex items-center gap-2"><Package size={18} /> Új tétel</h3>
        <div className="grid grid-cols-12 gap-3">
          <input placeholder="Név" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="col-span-4 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
          <select value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} className="col-span-2 px-3 py-2 border border-neutral-200 rounded-lg text-sm">
            <option value="db">db</option><option value="kg">kg</option><option value="l">l</option><option value="g">g</option>
          </select>
          <input type="number" placeholder="Készlet" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} className="col-span-2 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
          <input type="number" placeholder="Min." value={draft.minStock} onChange={(e) => setDraft({ ...draft, minStock: e.target.value })} className="col-span-2 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
          <button onClick={submit} className="col-span-2 px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm inline-flex items-center justify-center gap-1 hover:bg-neutral-800"><Plus size={14} /> Hozzáadás</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
            <tr><th className="py-2 px-4 text-left">Név</th><th className="py-2 px-4">Egység</th><th className="py-2 px-4 text-right">Készlet</th><th className="py-2 px-4 text-right">Min. szint</th><th className="py-2 px-4">Státusz</th><th></th></tr>
          </thead>
          <tbody>
            {inventory.map((i) => editing === i.id ? (
              <tr key={i.id} className="bg-neutral-50 border-b border-neutral-100">
                <td className="py-2 px-4"><input value={ed.name} onChange={(e) => setEd({ ...ed, name: e.target.value })} className="w-full px-2 py-1 border rounded" /></td>
                <td className="py-2 px-4"><input value={ed.unit} onChange={(e) => setEd({ ...ed, unit: e.target.value })} className="w-16 px-2 py-1 border rounded" /></td>
                <td className="py-2 px-4 text-right"><input type="number" value={ed.stock} onChange={(e) => setEd({ ...ed, stock: e.target.value })} className="w-24 px-2 py-1 border rounded text-right" /></td>
                <td className="py-2 px-4 text-right"><input type="number" value={ed.minStock} onChange={(e) => setEd({ ...ed, minStock: e.target.value })} className="w-24 px-2 py-1 border rounded text-right" /></td>
                <td></td>
                <td className="py-2 px-4 text-right whitespace-nowrap">
                  <button onClick={() => { updateInventory(i.id, { ...ed, stock: Number(ed.stock), minStock: Number(ed.minStock) }); setEditing(null); toast.success('Mentve'); }} className="h-8 w-8 rounded-md bg-emerald-600 text-white inline-flex items-center justify-center mr-1"><Check size={14} /></button>
                  <button onClick={() => setEditing(null)} className="h-8 w-8 rounded-md border border-neutral-200 text-neutral-500 inline-flex items-center justify-center"><X size={14} /></button>
                </td>
              </tr>
            ) : (
              <tr key={i.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="py-2 px-4 font-semibold text-neutral-900">{i.name}</td>
                <td className="py-2 px-4 text-center text-neutral-600">{i.unit}</td>
                <td className="py-2 px-4 text-right">{i.stock}</td>
                <td className="py-2 px-4 text-right">{i.minStock}</td>
                <td className="py-2 px-4">
                  {i.stock < i.minStock ? <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200"><AlertTriangle size={12} /> Alacsony</span> : <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Rendben</span>}
                </td>
                <td className="py-2 px-4 text-right whitespace-nowrap">
                  <button onClick={() => { setEditing(i.id); setEd(i); }} className="h-8 w-8 rounded-md border border-neutral-200 text-neutral-500 inline-flex items-center justify-center mr-1 hover:bg-neutral-50"><Pencil size={14} /></button>
                  <button onClick={() => { deleteInventory(i.id); toast.success('Törölve'); }} className="h-8 w-8 rounded-md border border-neutral-200 text-rose-500 inline-flex items-center justify-center hover:bg-rose-50"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
