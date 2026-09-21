import React, { useState } from 'react';
import { Phone, MapPin, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [f, setF] = useState({ name: '', email: '', message: '' });
  const submit = (e) => { e.preventDefault(); toast.success('Köszönjük! Hamarosan válaszolunk.'); setF({ name: '', email: '', message: '' }); };
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center">
        <div className="font-script text-2xl text-[#d4af37]">Kapcsolat</div>
        <h1 className="font-display text-4xl md:text-5xl font-black text-white">ÍRJ NEKÜNK</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
          <Row icon={Phone} label="Telefon" val="06 30 728 2289" />
          <Row icon={Mail} label="E-mail" val="info@zavo.hu" />
          <Row icon={MapPin} label="Cím" val="3734 Szuhogy, Fő utca 1." />
          <div className="pt-4 border-t border-neutral-800 text-sm text-neutral-400">Nyitva: minden nap 0–24 óra</div>
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-3">
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Név" required className="w-full px-3 py-3 rounded-lg bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]" />
          <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="E-mail" type="email" required className="w-full px-3 py-3 rounded-lg bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]" />
          <textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="Üzenet" rows={4} required className="w-full px-3 py-3 rounded-lg bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]" />
          <button type="submit" className="w-full gold-gradient text-black font-bold py-3 rounded-lg inline-flex items-center justify-center gap-2"><Send size={16} /> Küldés</button>
        </form>
      </div>
    </div>
  );
};
const Row = ({ icon: Icon, label, val }) => (
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 rounded-full border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]"><Icon size={18} /></div>
    <div><div className="text-xs text-neutral-400">{label}</div><div className="text-white font-semibold">{val}</div></div>
  </div>
);
export default Contact;
