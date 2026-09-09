import { useState } from 'react';
import { ScrollableTable } from '../../../../src/components/ScrollableTable';
import { SortableColumnHeader, type SortDir } from '../../../../src/components/SortableColumnHeader';
import { FilterRow } from '../../../../src/components/FilterRow';
import { RankBadge } from '../../../../src/components/RankBadge';
import { StatusBadge } from '../../../../src/components/StatusBadge';
import { StatusDot } from '../../../../src/components/StatusDot';

// A composed, near-real screen (an employee directory), not a placeholder -
// ScrollableTable's own story just proves the fade/nudge mechanic works on
// 20 identical throwaway rows, which reads nothing like how it's actually
// used: wrapped around a real sortable, filterable data table built from
// several other components in this same catalog.
const ROLE_LEVELS = ['worker', 'foreman', 'finance', 'manager', 'admin'];

interface Employee {
  name: string; email: string; role: string; company: string; division: string; active: boolean;
}

const EMPLOYEES: Employee[] = [
  { name: 'Ana Ruiz', email: 'ana.ruiz@premiummg.ca', role: 'admin', company: 'Premium Management Group', division: 'All', active: true },
  { name: 'Luis Ortega', email: 'luis.ortega@premiummg.ca', role: 'worker', company: 'Premium Drywall Inc.', division: 'Drywall', active: true },
  { name: 'Sara Kim', email: 'sara.kim@premiummg.ca', role: 'manager', company: 'Premium Drywall Inc.', division: 'Drywall', active: true },
  { name: 'Marcus Webb', email: 'marcus.webb@premiummg.ca', role: 'foreman', company: 'Premium Contracting Inc.', division: 'Contracting', active: true },
  { name: 'Priya Anand', email: 'priya.anand@premiummg.ca', role: 'finance', company: 'Premium Caulking Inc.', division: 'Caulking (Atlantic)', active: false },
];

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ['#E62027', '#3A3A3A', '#1A2C6E', '#A51E26', '#7C171D'];

export function EmployeeTableDemo() {
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const rows = EMPLOYEES
    .filter(e => roleFilter.length === 0 || roleFilter.includes(e.role))
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      return a[sortBy as keyof Employee] > b[sortBy as keyof Employee] ? dir : -dir;
    });

  const onSort = (col: string) => {
    if (col === sortBy) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('asc'); }
  };

  return (
    <div className="w-full">
      <div className="mb-3">
        <FilterRow
          label="Role"
          options={ROLE_LEVELS}
          selected={roleFilter}
          onToggle={v => setRoleFilter(f => f.includes(v) ? f.filter(x => x !== v) : [...f, v])}
          onClear={() => setRoleFilter([])}
          capitalize
        />
      </div>

      <ScrollableTable maxHeight="280px">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#F9F9F9] dark:bg-black/40">
            <tr>
              <SortableColumnHeader col="name" label="Name" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="text-left" />
              <SortableColumnHeader col="role" label="Role" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="text-left" />
              <th className="px-4 py-3 text-left pmg-eyebrow text-gray-500 dark:text-gray-400">Company</th>
              <th className="px-4 py-3 text-left pmg-eyebrow text-gray-500 dark:text-gray-400">Division</th>
              <th className="px-4 py-3 text-left pmg-eyebrow text-gray-500 dark:text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/10">
            {rows.map((e, i) => (
              <tr key={e.email}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative shrink-0">
                      <div
                        className="w-8 h-8 rounded-full grid place-items-center text-white text-xs font-heading font-bold"
                        style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                      >
                        {initials(e.name)}
                      </div>
                      <StatusDot active={e.active} variant="presence" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{e.name}</p>
                      <p className="text-xs text-gray-400 truncate">{e.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><RankBadge value={e.role} levels={ROLE_LEVELS} /></td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">{e.company}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">{e.division}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={e.active ? 'active' : 'inactive'}
                    colorClass={e.active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>
    </div>
  );
}
