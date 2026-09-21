import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CATEGORIES, formatFt } from '../../mock/mockData';
import { Plus, Trash2, Pencil, Check, X, ChefHat } from 'lucide-react';
import { toast } from 'sonner';

const empty = { name: '', description: '', price: 0, priceFoodora: 0, priceFalatozz: 0, category: 'pizzak' };

const MenuAdmin = () => {
  const { menu, inventory, addMenuItem, updateMenuItem, deleteMenuItem } = useData();
  const [cat, setCat] = useState('pizzak');
  const [draft, setDraft] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [ed, setEd] = useState(empty);
  const [recipeFor, setRecipeFor] = useState(null); // menu item id

  const submit = async () => {
    if (!draft.name || !draft.price) return toast.error('Név és ár kötelező');
    await addMenuItem({
      ...draft,
      price: Number(draft.price),
      priceFoodora: draft.priceFoodora ? Number(draft.priceFoodora) : null,
      priceFalatozz: draft.priceFalatozz ? Number(draft.priceFalatozz) : null,
      recipe: [],
    });
    setDraft({ ...empty, category: cat });
    toast.success('Termék hozzáadva');
  };
  const saveEdit = async (id) => {
    await updateMenuItem(id, {
      name: ed.name,
      description: ed.description,
      price: Number(ed.price),
      priceFoodora: ed.priceFoodora ? Number(ed.priceFoodora) : null,
      priceFalatozz: ed.priceFalatozz ? Number(ed.priceFalatozz) : null,
    });
    setEditing(null);
    toast.success('Mentve');
  };

  const items = menu.filter((m) => m.category === cat);
  const recipeItem = menu.find((m) => m.id === recipeFor);

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
          <input placeholder="Leírás" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="col-span-5 px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
          <input type="number" placeholder="Házi ár" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className="col-span-1 px-2 py-2 border border-neutral-200 rounded-lg text-sm" />
          <input type="number" placeholder="Foodora" value={draft.priceFoodora} onChange={(e) => setDraft({ ...draft, priceFoodora: e.target.value })} className="col-span-1 px-2 py-2 border border-neutral-200 rounded-lg text-sm" />
          <input type="number" placeholder="Falatozz" value={draft.priceFalatozz} onChange={(e) => setDraft({ ...draft, priceFalatozz: e.target.value })} className="col-span-1 px-2 py-2 border border-neutral-200 rounded-lg text-sm" />
          <button onClick={submit} className="col-span-1 px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm inline-flex items-center justify-center gap-1 hover:bg-neutral-800"><Plus size={14} /></button>
        </div>
        <div className="mt-2 text-xs text-neutral-500">Foodora / Falatozz ár üresen hagyva → házi ár érvényes. A recept a listában szerkeszthető.</div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
            <tr>
              <th className="py-2 px-4 text-left">Név</th>
              <th className="py-2 px-4 text-left">Leírás</th>
              <th className="py-2 px-4 text-right">Házi</th>
              <th className="py-2 px-4 text-right">Foodora</th>
              <th className="py-2 px-4 text-right">Falatozz</th>
              <th className="py-2 px-4 text-center">Recept</th>
              <th className="py-2 px-4 text-right">Elérhető</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => editing === m.id ? (
              <tr key={m.id} className="border-b border-neutral-100 bg-neutral-50">
                <td className="py-2 px-4"><input value={ed.name} onChange={(e) => setEd({ ...ed, name: e.target.value })} className="w-full px-2 py-1 border rounded" /></td>
                <td className="py-2 px-4"><input value={ed.description} onChange={(e) => setEd({ ...ed, description: e.target.value })} className="w-full px-2 py-1 border rounded" /></td>
                <td className="py-2 px-4 text-right"><input type="number" value={ed.price} onChange={(e) => setEd({ ...ed, price: e.target.value })} className="w-20 px-2 py-1 border rounded text-right" /></td>
                <td className="py-2 px-4 text-right"><input type="number" value={ed.priceFoodora ?? ''} onChange={(e) => setEd({ ...ed, priceFoodora: e.target.value })} className="w-20 px-2 py-1 border rounded text-right" /></td>
                <td className="py-2 px-4 text-right"><input type="number" value={ed.priceFalatozz ?? ''} onChange={(e) => setEd({ ...ed, priceFalatozz: e.target.value })} className="w-20 px-2 py-1 border rounded text-right" /></td>
                <td className="py-2 px-4 text-center text-neutral-400">—</td>
                <td className="py-2 px-4 text-right">—</td>
                <td className="py-2 px-4 text-right whitespace-nowrap">
                  <button onClick={() => saveEdit(m.id)} className="h-8 w-8 rounded-md bg-emerald-600 text-white inline-flex items-center justify-center mr-1"><Check size={14} /></button>
                  <button onClick={() => setEditing(null)} className="h-8 w-8 rounded-md border border-neutral-200 text-neutral-500 inline-flex items-center justify-center"><X size={14} /></button>
                </td>
              </tr>
            ) : (
              <tr key={m.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="py-2 px-4 font-semibold text-neutral-900">{m.name}</td>
                <td className="py-2 px-4 text-neutral-600">{m.description}</td>
                <td className="py-2 px-4 text-right font-semibold">{formatFt(m.price)}</td>
                <td className="py-2 px-4 text-right text-neutral-700">{m.priceFoodora ? formatFt(m.priceFoodora) : <span className="text-neutral-300">—</span>}</td>
                <td className="py-2 px-4 text-right text-neutral-700">{m.priceFalatozz ? formatFt(m.priceFalatozz) : <span className="text-neutral-300">—</span>}</td>
                <td className="py-2 px-4 text-center">
                  <button onClick={() => setRecipeFor(m.id)} className={`text-xs px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${(m.recipe || []).length > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                    <ChefHat size={12} /> {(m.recipe || []).length > 0 ? `${(m.recipe || []).length} alapanyag` : 'Recept'}
                  </button>
                </td>
                <td className="py-2 px-4 text-right">
                  <button onClick={() => updateMenuItem(m.id, { available: !m.available })} className={`text-xs px-2 py-1 rounded-full border ${m.available ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>{m.available ? 'Elérhető' : 'Nem'}</button>
                </td>
                <td className="py-2 px-4 text-right whitespace-nowrap">
                  <button onClick={() => { setEditing(m.id); setEd({ ...m, priceFoodora: m.priceFoodora || '', priceFalatozz: m.priceFalatozz || '' }); }} className="h-8 w-8 rounded-md border border-neutral-200 text-neutral-500 inline-flex items-center justify-center mr-1 hover:bg-neutral-50"><Pencil size={14} /></button>
                  <button onClick={async () => { await deleteMenuItem(m.id); toast.success('Termék törölve'); }} className="h-8 w-8 rounded-md border border-neutral-200 text-rose-500 inline-flex items-center justify-center hover:bg-rose-50"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-neutral-500">Nincs termék ebben a kategóriában.</td></tr>}
          </tbody>
        </table>
      </div>

      {recipeItem && (
        <RecipeModal
          item={recipeItem}
          inventory={inventory}
          onClose={() => setRecipeFor(null)}
          onSave={async (recipe) => { await updateMenuItem(recipeItem.id, { recipe }); toast.success('Recept mentve'); setRecipeFor(null); }}
        />
      )}
    </div>
  );
};

const RecipeModal = ({ item, inventory, onClose, onSave }) => {
  const [rows, setRows] = useState(() => (item.recipe || []).map((r) => ({ ...r })));
  const [pick, setPick] = useState({ inventoryId: inventory[0]?.id || '', qty: 1 });

  const addRow = () => {
    if (!pick.inventoryId || !pick.qty) return toast.error('Válassz alapanyagot és mennyiséget');
    if (rows.find((r) => r.inventoryId === pick.inventoryId)) return toast.error('Ez az alapanyag már szerepel');
    setRows([...rows, { inventoryId: pick.inventoryId, qty: Number(pick.qty) }]);
    setPick({ inventoryId: inventory[0]?.id || '', qty: 1 });
  };
  const setQty = (id, qty) => setRows(rows.map((r) => r.inventoryId === id ? { ...r, qty: Number(qty) } : r));
  const remove = (id) => setRows(rows.filter((r) => r.inventoryId !== id));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500">Recept szerkesztése</div>
            <h3 className="text-lg font-bold text-neutral-900 inline-flex items-center gap-2"><ChefHat size={18} className="text-amber-600" /> {item.name}</h3>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full border border-neutral-200 text-neutral-500 flex items-center justify-center hover:bg-neutral-50"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className="text-xs text-neutral-500 mb-2">Alapanyag hozzáadása</div>
            <div className="grid grid-cols-12 gap-2">
              <select value={pick.inventoryId} onChange={(e) => setPick({ ...pick, inventoryId: e.target.value })} className="col-span-7 px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white">
                {inventory.map((inv) => <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>)}
                {inventory.length === 0 && <option value="">Nincs alapanyag – vedd fel a Készlet oldalon</option>}
              </select>
              <input type="number" step="any" value={pick.qty} onChange={(e) => setPick({ ...pick, qty: e.target.value })} className="col-span-3 px-3 py-2 rounded-lg border border-neutral-200 text-sm" placeholder="Mennyiség" />
              <button onClick={addRow} className="col-span-2 px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm inline-flex items-center justify-center gap-1"><Plus size={14} /> Hozzáad</button>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="py-2 px-3 text-left">Alapanyag</th>
                  <th className="py-2 px-3 text-right">Mennyiség / adag</th>
                  <th className="py-2 px-3 text-left">Egység</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const inv = inventory.find((i) => i.id === r.inventoryId);
                  return (
                    <tr key={r.inventoryId} className="border-b border-neutral-100">
                      <td className="py-2 px-3 font-semibold text-neutral-900">{inv?.name || '—'}</td>
                      <td className="py-2 px-3 text-right"><input type="number" step="any" value={r.qty} onChange={(e) => setQty(r.inventoryId, e.target.value)} className="w-24 px-2 py-1 border rounded text-right" /></td>
                      <td className="py-2 px-3 text-neutral-500">{inv?.unit}</td>
                      <td className="py-2 px-3 text-right"><button onClick={() => remove(r.inventoryId)} className="h-8 w-8 rounded-md border border-neutral-200 text-rose-500 inline-flex items-center justify-center hover:bg-rose-50"><Trash2 size={14} /></button></td>
                    </tr>
                  );
                })}
                {rows.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-neutral-500">Még nincs recept. Add hozzá az alapanyagokat fentről.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-neutral-500">Minden leadott rendelésnél automatikusan levonjuk az itt megadott mennyiségeket a készletből (adagszám × recept mennyiség).</div>
        </div>
        <div className="px-6 py-4 border-t border-neutral-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-700 text-sm">Mégsem</button>
          <button onClick={() => onSave(rows)} className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm inline-flex items-center gap-2"><Check size={14} /> Recept mentése</button>
        </div>
      </div>
    </div>
  );
};

export default MenuAdmin;
