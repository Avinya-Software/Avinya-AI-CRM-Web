import type { Project } from "../interfaces/project.interface";

export type ProjectDropdownOption = {
  value: number;
  label: string;
};

export const DEFAULT_PROJECT_STATUS_OPTIONS: ProjectDropdownOption[] = [
  { value: 1, label: "Planning" },
  { value: 2, label: "Active" },
  { value: 3, label: "Completed" },
];

export const DEFAULT_PROJECT_PRIORITY_OPTIONS: ProjectDropdownOption[] = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
];

const normalizeNumber = (value: unknown): number | null => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const normalizeLabel = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim();
};

export const normalizeProjectStatusOptions = (
  items: any[] | undefined | null
): ProjectDropdownOption[] => {
  const normalized = (items ?? [])
    .map((item) => {
      const value = normalizeNumber(
        item?.projectStatusID ?? item?.statusID ?? item?.id ?? item?.value
      );
      const label = normalizeLabel(
        item?.statusName ?? item?.projectStatusName ?? item?.name ?? item?.label
      );

      return value === null || !label ? null : { value, label };
    })
    .filter((item): item is ProjectDropdownOption => !!item);

  return normalized.length > 0 ? normalized : DEFAULT_PROJECT_STATUS_OPTIONS;
};

export const normalizeProjectPriorityOptions = (
  items: any[] | undefined | null
): ProjectDropdownOption[] => {
  const normalized = (items ?? [])
    .map((item) => {
      const value = normalizeNumber(
        item?.projectPriorityID ?? item?.priorityID ?? item?.id ?? item?.value
      );
      const label = normalizeLabel(
        item?.priorityName ?? item?.projectPriorityName ?? item?.name ?? item?.label
      );

      return value === null || !label ? null : { value, label };
    })
    .filter((item): item is ProjectDropdownOption => !!item);

  return normalized.length > 0 ? normalized : DEFAULT_PROJECT_PRIORITY_OPTIONS;
};

export const getProjectStatusLabel = (
  project: Pick<Project, "status" | "statusName">,
  options: ProjectDropdownOption[] = DEFAULT_PROJECT_STATUS_OPTIONS
) => {
  if (project.statusName?.trim()) return project.statusName;
  const fallbackValue = options[0]?.value ?? DEFAULT_PROJECT_STATUS_OPTIONS[0].value;
  return options.find((option) => option.value === (project.status ?? fallbackValue))?.label ?? "Unknown";
};

export const getProjectPriorityLabel = (
  project: Pick<Project, "priority" | "priorityName">,
  options: ProjectDropdownOption[] = DEFAULT_PROJECT_PRIORITY_OPTIONS
) => {
  if (project.priorityName?.trim()) return project.priorityName;
  const fallbackValue = options[0]?.value ?? DEFAULT_PROJECT_PRIORITY_OPTIONS[0].value;
  return options.find((option) => option.value === (project.priority ?? fallbackValue))?.label ?? "Unknown";
};

export const getProjectStatusStyle = (label: string) => {
  const key = label.trim().toLowerCase();

  if (key.includes("plan")) return "bg-slate-100 text-slate-600";
  if (key.includes("active") || key.includes("progress")) return "bg-blue-100 text-blue-700";
  if (key.includes("complete") || key.includes("done") || key.includes("close")) return "bg-green-100 text-green-700";
  if (key.includes("hold") || key.includes("pause") || key.includes("pending")) return "bg-orange-100 text-orange-700";

  return "bg-slate-100 text-slate-600";
};

export const getProjectPriorityStyle = (label: string) => {
  const key = label.trim().toLowerCase();

  if (key.includes("critical") || key.includes("urgent")) return "bg-red-100 text-red-700";
  if (key.includes("high")) return "bg-orange-100 text-orange-700";
  if (key.includes("medium") || key.includes("normal")) return "bg-amber-100 text-amber-700";
  if (key.includes("low")) return "bg-slate-100 text-slate-500";

  return "bg-slate-100 text-slate-500";
};
