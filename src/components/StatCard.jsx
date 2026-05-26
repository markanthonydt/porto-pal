export default function StatCard({ label, value, hint, tone = 'default' }) {
  const toneClasses = {
    default: 'from-white/15 to-white/5 border-white/10',
    sea: 'from-sea/30 to-white/5 border-sea/30',
    coral: 'from-coral/25 to-white/5 border-coral/30',
    sun: 'from-sun/25 to-white/5 border-sun/30 text-slate-950',
  };

  return (
    <article className={`rounded-[1.75rem] border bg-gradient-to-br p-5 shadow-soft ${toneClasses[tone]}`}>
      <p className={`text-sm ${tone === 'sun' ? 'text-slate-900/70' : 'text-slate-400'}`}>{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${tone === 'sun' ? 'text-slate-950' : 'text-white'}`}>{value}</p>
      {hint ? <p className={`mt-2 text-sm ${tone === 'sun' ? 'text-slate-900/70' : 'text-slate-300'}`}>{hint}</p> : null}
    </article>
  );
}
