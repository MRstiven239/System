import { useTheme } from '../../theme/ThemeContext';

export function GridHeaderRow({ columns, range }) {
  const theme = useTheme();

  return (
    <tr>
      <th className="text-left px-4 py-3 sticky left-0 font-normal" style={{ background: theme.surface, color: theme.inkMuted }}>
        Hábito
      </th>
      {columns.map((column) => (
        <th
          key={column.key}
          className="px-1 py-3 text-center font-normal"
          style={{ color: theme.inkMuted, minWidth: range === 'year' ? 46 : 32 }}
        >
          {range === 'week' ? (
            <div>
              <div>{column.label}</div>
              <div style={{ fontSize: 11 }}>{column.sublabel}</div>
            </div>
          ) : (
            column.label
          )}
        </th>
      ))}
      <th className="px-2 py-3 text-center font-normal" style={{ color: theme.inkMuted, minWidth: 56 }}>
        Progreso
      </th>
    </tr>
  );
}
