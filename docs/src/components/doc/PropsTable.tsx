import propsData from '../../generated/props.json';

type PropRow = { name: string; type: string; required: boolean; defaultValue: string | null; description: string | null };

export function PropsTable({ component }: { component: string }) {
  const rows = (propsData as Record<string, PropRow[]>)[component];

  if (!rows || rows.length === 0) {
    return <p className="text-xs text-gray-400 dark:text-gray-500 italic">No props of its own.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left border-b border-gray-100 dark:border-white/10">
            <th className="pb-2 pr-4 font-heading font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">Prop</th>
            <th className="pb-2 pr-4 font-heading font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">Type</th>
            <th className="pb-2 pr-4 font-heading font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">Default</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(p => (
            <tr key={p.name} className="border-b border-gray-50 dark:border-white/5 last:border-0">
              <td className="py-2 pr-4 font-mono text-gray-900 dark:text-gray-100 align-top whitespace-nowrap">
                {p.name}{p.required && <span className="text-(--premium-red)">*</span>}
              </td>
              <td className="py-2 pr-4 font-mono text-gray-500 dark:text-gray-400 align-top">{p.type}</td>
              <td className="py-2 pr-4 font-mono text-gray-400 dark:text-gray-500 align-top">{p.defaultValue ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
