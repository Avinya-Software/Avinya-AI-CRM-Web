interface Props {
  rows?: number;
  columns?: number;
}

const TableSkeleton = ({ rows = 6, columns = 12 }: Props) => {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-t animate-pulse">
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <div className="h-4 bg-slate-200 rounded w-full" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export default TableSkeleton;
