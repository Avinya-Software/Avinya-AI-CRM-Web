import { Braces, Hash, IndianRupee, List, TrendingUp } from "lucide-react";
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

const isCurrencyKey = (key: string) =>
  /revenue|amount|price|total|charge|outstanding|grandtotal|balance|cost/i.test(key);

const isDateLike = (value: string) => /^\d{4}-\d{2}-\d{2}/.test(value);

const formatValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return "-";

  const lowerKey = key.toLowerCase();
  let stringValue = String(value).trim();

  if (stringValue.startsWith("?") || stringValue.startsWith("â‚¹")) {
    stringValue = stringValue.substring(1).trim().replace(/,/g, "");
  }

  const numberValue = Number(stringValue);
  if (!Number.isNaN(numberValue) && stringValue !== "" && !lowerKey.includes("id") && !lowerKey.includes("no")) {
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

  return String(value).replace(/^\?/, "â‚¹");
};

const getMetricStyle = (key: string) => {
  const lowerKey = key.toLowerCase();

  if (isCurrencyKey(lowerKey)) {
    return { Icon: IndianRupee, colorClass: "bg-emerald-50 text-emerald-600" };
  }

  if (/count|leads|clients|results|orders|tasks|projects/i.test(lowerKey)) {
    return { Icon: TrendingUp, colorClass: "bg-violet-50 text-violet-600" };
  }

  return { Icon: Hash, colorClass: "bg-blue-50 text-blue-600" };
};

const getVisibleColumns = (rows: Record<string, any>[]) => {
  const allColumns = Array.from(
    new Set(rows.flatMap((row) => (isPlainObject(row) ? Object.keys(row) : [])))
  );

  return allColumns.filter((col) => {
    const lower = col.toLowerCase();
    if (allColumns.length <= 4) return true;
    if (lower.endsWith("id") && lower !== "id" && !lower.includes("status")) return false;
    if (["tenantid", "isdeleted", "createdby", "updatedby"].includes(lower)) return false;
    return true;
  });
};

const MetricGrid = ({ data, compact }: { data: Record<string, any>; compact?: boolean }) => {
  const keys = Object.keys(data);
  if (keys.length === 0) return null;

  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
      {keys.map((key) => {
        const value = data[key];
        const { Icon, colorClass } = getMetricStyle(key);

        return (
          <div
            key={key}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm",
              compact ? "p-4" : "p-5"
            )}
          >
            <div className="relative z-10 flex items-center gap-3">
              <div className={cn("rounded-xl p-2.5", colorClass)}>
                <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 truncate text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {formatLabel(key)}
                </p>
                <p className={cn("font-black tracking-tight text-slate-900 break-words", compact ? "text-lg" : "text-2xl")}>
                  {formatValue(key, value)}
                </p>
              </div>
            </div>
            <Icon className="pointer-events-none absolute -bottom-3 -right-3 h-16 w-16 opacity-[0.04]" />
          </div>
        );
      })}
    </div>
  );
};

const PrimitiveList = ({ data, compact }: { data: any[]; compact?: boolean }) => (
  <div className="flex flex-wrap gap-2">
    {data.map((item, index) => (
      <div
        key={`${String(item)}-${index}`}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm",
          compact ? "px-3 py-2 text-[11px]" : "px-4 py-2.5 text-sm"
        )}
      >
        <List className={compact ? "h-3 w-3 text-emerald-500" : "h-4 w-4 text-emerald-500"} />
        <span>{formatValue("value", item)}</span>
      </div>
    ))}
  </div>
);

const ObjectTable = ({ rows, compact }: { rows: Record<string, any>[]; compact?: boolean }) => {
  const columns = getVisibleColumns(rows);

  if (rows.length === 1 && columns.length <= 4 && columns.every((column) => isPrimitive(rows[0][column]))) {
    return <MetricGrid data={rows[0]} compact={compact} />;
  }

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm", compact ? "max-h-[400px]" : "")}>
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
        <MetricGrid data={Object.fromEntries(primitiveEntries)} compact={compact} />
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
    return <MetricGrid data={{ Value: data }} compact={compact} />;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return null;
    if (data.every(isPrimitive)) {
      return <PrimitiveList data={data} compact={compact} />;
    }
    if (data.every(isPlainObject)) {
      return <ObjectTable rows={data} compact={compact} />;
    }
    return <JsonBlock value={data} compact={compact} />;
  }

  if (isPlainObject(data)) {
    if (Object.values(data).every(isPrimitive)) {
      return <MetricGrid data={data} compact={compact} />;
    }
    return <NestedObject data={data} compact={compact} />;
  }

  return <JsonBlock value={data} compact={compact} />;
};
