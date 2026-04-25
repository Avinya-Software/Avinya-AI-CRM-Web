import { Braces } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type ChatDataRendererProps = {
  data: any;
  compact?: boolean;
};

const formatLabel = (label: string) =>
  label.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();

const isPlainObject = (value: any): value is Record<string, any> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const isPrimitive = (value: any) =>
  value === null || value === undefined || ["string", "number", "boolean"].includes(typeof value);

const isCountKey = (key: string) =>
  /count|orders?|clients?|leads?|tasks?|projects?|results?|records?|qty|quantity|units?|items?/i.test(key);

const isCurrencyKey = (key: string) =>
  !isCountKey(key) &&
  /revenue|amount|price|charge|outstanding|grandtotal|balance|cost|subtotal|payment|invoice|expense|sales|profit|income|value/i.test(key);

const isDateLike = (value: string) => /^\d{4}-\d{2}-\d{2}/.test(value);

const isYearKey = (key: string) => /^year$/i.test(key.trim());

const startsWithRupeeSymbol = (value: string) => value.charCodeAt(0) === 0x20b9;

const formatValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return "-";

  const lowerKey = key.toLowerCase();
  let stringValue = String(value).trim();

  if (stringValue.startsWith("?") || startsWithRupeeSymbol(stringValue)) {
    stringValue = stringValue.substring(1).trim().replace(/,/g, "");
  }

  const numberValue = Number(stringValue);
  if (!Number.isNaN(numberValue) && stringValue !== "" && !lowerKey.includes("id") && !lowerKey.includes("no")) {
    if (isYearKey(key)) {
      return String(Math.trunc(numberValue));
    }

    if (isCurrencyKey(lowerKey)) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(numberValue);
    }

    return numberValue.toLocaleString("en-IN");
  }

  if (typeof value === "string" && isDateLike(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  return String(value).replace(/^\?/, "\u20b9");
};

const getVisibleColumns = (rows: Record<string, any>[]) => {
  const allColumns = Array.from(
    new Set(rows.flatMap((row) => (isPlainObject(row) ? Object.keys(row) : [])))
  );

  const visibleColumns = allColumns.filter((col) => {
    const lower = col.toLowerCase();
    if (allColumns.length <= 4) return true;
    if (lower.endsWith("id") && lower !== "id" && !lower.includes("status")) return false;
    if (["tenantid", "isdeleted", "createdby", "updatedby"].includes(lower)) return false;
    return true;
  });

  return visibleColumns.length > 0 ? visibleColumns : allColumns;
};

const ObjectTable = ({ rows, compact }: { rows: Record<string, any>[]; compact?: boolean }) => {
  const columns = getVisibleColumns(rows);

  if (columns.length === 0) return null;

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm", compact ? "max-h-[400px]" : "")}>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            {columns.map((column) => (
              <TableHead
                key={column}
                className={cn(
                  "border-r border-slate-100 font-bold uppercase text-slate-500 last:border-r-0",
                  compact ? "px-3 py-2 text-[10px]" : "px-4 py-3 text-xs"
                )}
              >
                {formatLabel(column)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-slate-50/60">
              {columns.map((column) => {
                const value = row[column];
                const isLongText =
                  /details|notes|requirement|links|description|address/i.test(column) ||
                  String(value ?? "").length > 60;

                return (
                  <TableCell
                    key={column}
                    className={cn(
                      "border-r border-slate-100 align-top text-slate-700 last:border-r-0",
                      compact ? "px-3 py-2 text-[11px]" : "px-4 py-3 text-sm",
                      isLongText ? "min-w-[220px] whitespace-normal" : "whitespace-nowrap"
                    )}
                  >
                    {isPrimitive(value) ? (
                      formatValue(column, value)
                    ) : (
                      <pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-slate-600">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const JsonBlock = ({ label, value, compact }: { label?: string; value: any; compact?: boolean }) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    {label && (
      <div className="border-b border-slate-100 px-4 py-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{formatLabel(label)}</p>
      </div>
    )}
    <div className={compact ? "p-3" : "p-4"}>
      <pre className={cn("overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-slate-50 text-slate-700", compact ? "p-3 text-[11px]" : "p-4 text-xs")}>
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  </div>
);

const NestedObject = ({ data, compact }: { data: Record<string, any>; compact?: boolean }) => {
  const primitiveEntries = Object.entries(data).filter(([, value]) => isPrimitive(value));
  const complexEntries = Object.entries(data).filter(([, value]) => !isPrimitive(value));

  return (
    <div className="space-y-4">
      {primitiveEntries.length > 0 && (
        <ObjectTable rows={[Object.fromEntries(primitiveEntries)]} compact={compact} />
      )}

      {complexEntries.map(([key, value]) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Braces className={compact ? "h-3.5 w-3.5 text-emerald-500" : "h-4 w-4 text-emerald-500"} />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {formatLabel(key)}
            </span>
          </div>
          <ChatDataRenderer data={value} compact={compact} />
        </div>
      ))}
    </div>
  );
};

export const ChatDataRenderer = ({ data, compact = false }: ChatDataRendererProps) => {
  if (data === null || data === undefined) return null;

  if (isPrimitive(data)) {
    return <ObjectTable rows={[{ Value: data }]} compact={compact} />;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return null;
    if (data.every(isPrimitive)) {
      return <ObjectTable rows={data.map((item) => ({ Value: item }))} compact={compact} />;
    }
    if (data.every(isPlainObject)) {
      return <ObjectTable rows={data} compact={compact} />;
    }
    return <JsonBlock value={data} compact={compact} />;
  }

  if (isPlainObject(data)) {
    if (Object.values(data).every(isPrimitive)) {
      return <ObjectTable rows={[data]} compact={compact} />;
    }
    return <NestedObject data={data} compact={compact} />;
  }

  return <JsonBlock value={data} compact={compact} />;
};
