// src/components/leads/Pagination.tsx
interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, onChange }: Props) => {
  return (
    <div className="flex justify-end gap-2 mt-4 mr-4">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="btn"
      >
        Prev
      </button>

      <span className="px-3 py-1 text-sm">
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="btn"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
