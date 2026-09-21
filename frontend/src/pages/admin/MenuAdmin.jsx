import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CATEGORIES, formatFt } from '../../mock/mockData';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const empty = { name: '', description: '', price: 0, category: 'pizzak' };

const MenuAdmin = () => {
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem } = useData();
  const [cat, setCat] = useState('pizzak');
  const [draft, setDraft] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [editDraft, setEditDraft] = useState(empty);

  const submit = () => {
    if (!draft.name || !draft.price) return toast.error('Név és ár kötelező');
    addMenuItem({ ...draft, price: Number(draft.price) });
    setDraft({ ...empty, category: cat }); toast.success('Termék hozzáadva');
  };
  const saveEdit = (id) => { updateMenuItem(id, { ...editDraft, price: Number(editDraft.price) }); setEditing(null); toast.success('Mentve'); };

  const items = menu.filter((m) => m.category === cat);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => { setCat(c.id); setDraft({ ...empty, category: c.id }); }} className={`px-3 py-1.5 rounded-md text-sm border ${cat === c.id ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-200'}`}>{c.name}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-base font-bold text-neutral-900 mb-3">Új termék hozzáadása</h3>
        <div className="grid grid-cols-12 gap-3">
          <input placeholder="Név" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="col-span-3 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
          <input placeholder="Leírás" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="col-span-6 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
          <input type="number" placeholder="Ár (Ft)" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className="col-span-2 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
          <button onClick={submit} className="col-span-1 px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm inline-flex items-center justify-center gap-1 hover:bg-neutral-800"><Plus size={14} /></button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
            <tr>
              <th className="py-2 px-4 text-left">Név</th>
              <th className="py-2 px-4 text-left">Leírás</th>
              <th className="py-2 px-4 text-right">Ár</th>
              <th className="py-2 px-4 text-right">Elérhető</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => editing === m.id ? (
              <tr key={m.id} className="border-b border-neutral-100 bg-neutral-50">
                <td className="py-2 px-4"><input value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} className="w-full px-2 py-1 border border-neutral-300 rounded" /></td>
                <td className="py-2 px-4"><input value={editDraft.description} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} className="w-full px-2 py-1 border border-neutral-300 rounded" /></td>
                <td className="py-2 px-4"><input type="number" value={editDraft.price} onChange={(e) => setEditDraft({ ...editDraft, price: e.target.value })} className="w-24 px-2 py-1 border border-neutral-300 rounded text-right" /></td>
                <td className="py-2 px-4 text-right">—</td>
                <td className="py-2 px-4 text-right">
                  <button onClick={() => saveEdit(m.id)} className="h-8 w-8 rounded-md bg-emerald-600 text-white inline-flex items-center justify-center mr-1"><Check size={14} /></button>
                  <button onClick={() => setEditing(null)} className="h-8 w-8 rounded-md border border-neutral-200 text-neutral-500 inline-flex items-center justify-center"><X size={14} /></button>
                </td>
              </tr>
            ) : (
              <tr key={m.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="py-2 px-4 font-semibold text-neutral-900">{m.name}</td>
                <td className="py-2 px-4 text-neutral-600">{m.description}</td>
                <td className="py-2 px-4 text-right font-semibold">{formatFt(m.price)}</td>
                <td className="py-2 px-4 text-right">
                  <button onClick={() => updateMenuItem(m.id, { available: !m.available })} className={`text-xs px-2 py-1 rounded-full border ${m.available ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>{m.available ? 'Elérhető' : 'Nem'}</button>
                </td>
                <td className="py-2 px-4 text-right whitespace-nowrap">
                  <button onClick={() => { setEditing(m.id); setEditDraft({ name: m.name, description: m.description, price: m.price, category: m.category }); }} className="h-8 w-8 rounded-md border border-neutral-200 text-neutral-500 inline-flex items-center justify-center mr-1 hover:bg-neutral-50"><Pencil size={14} /></button>
                  <button onClick={() => { deleteMenuItem(m.id); toast.success('Termék törölve'); }} className="h-8 w-8 rounded-md border border-neutral-200 text-rose-500 inline-flex items-center justify-center hover:bg-rose-50"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-neutral-500">Nincs termék ebben a kategóriában.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuAdmin;
