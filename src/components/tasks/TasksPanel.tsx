import { CheckCircle, Clock, Calendar } from "lucide-react";
import { usePendingSystemEvents } from "../../hooks/system-events/usePendingSystemEvents";
import { useAcknowledgeSystemEvent } from "../../hooks/system-events/useAcknowledgeSystemEvent";
import type { SystemEvent } from "../../interfaces/systemEvent.interface";

/* =====================================================
 * MAIN PANEL
 * ===================================================== */

const TasksPanel = () => {
  const { data: events = [], isLoading } = usePendingSystemEvents();
  const acknowledgeMutation = useAcknowledgeSystemEvent();

  const handleAcknowledge = (eventId: string) => {
    acknowledgeMutation.mutate(eventId);
  };

  if (isLoading) {
    return <TasksSkeleton />;
  }

  const pending = events.filter((e) => !e.isAcknowledged);
  const completed = events.filter((e) => e.isAcknowledged);

  return (
    <div className="bg-white rounded-lg border">
      {/* HEADER */}
      <div className="px-4 py-5 border-b bg-gray-100">
        <div>
          <h1 className="text-4xl font-serif font-semibold text-slate-900">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {pending.length} pending, {completed.length} completed
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-8">
        {/* PENDING */}
        <Section
          title="Pending Tasks"
          icon={<Clock size={18} className="text-blue-900" />}
          count={pending.length}
        >
          {pending.length === 0 ? (
            <EmptyState text="No pending tasks" emoji="🎉" />
          ) : (
            <div className="space-y-3">
              {pending.map((event) => (
                <TaskCard
                  key={event.eventId}
                  event={event}
                  showAction
                  onAcknowledge={() => handleAcknowledge(event.eventId)}
                />
              ))}
            </div>
          )}
        </Section>

        {/* COMPLETED */}
        <Section
          title="Completed Tasks"
          icon={<CheckCircle size={18} className="text-green-600" />}
          count={completed.length}
        >
          {completed.length === 0 ? (
            <EmptyState text="No completed tasks yet" />
          ) : (
            <div className="space-y-3">
              {completed.map((event) => (
                <TaskCard key={event.eventId} event={event} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

export default TasksPanel;

/* =====================================================
 * SECTION
 * ===================================================== */

const Section = ({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) => (
  <div>
    <div className="flex items-center gap-2 mb-4 pb-2 border-b">
      {icon}
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <span className="ml-auto text-sm text-slate-500">({count})</span>
    </div>
    {children}
  </div>
);

/* =====================================================
 * TASK CARD
 * ===================================================== */

const TaskCard = ({
  event,
  onAcknowledge,
  showAction = false,
}: {
  event: SystemEvent;
  onAcknowledge?: () => void;
  showAction?: boolean;
}) => {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        showAction
          ? "bg-white hover:bg-slate-50 hover:border-slate-300"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 mb-1">{event.title}</p>

          {event.description && (
            <p className="text-sm text-slate-600 mb-2">
              {event.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar size={12} />
            <span>{formatDate(event.eventDate)}</span>
          </div>
        </div>

        {showAction ? (
          <button
            onClick={onAcknowledge}
            className="flex-shrink-0 px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded hover:bg-blue-800 transition-colors"
          >
            Mark Done
          </button>
        ) : (
          <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
        )}
      </div>
    </div>
  );
};

/* =====================================================
 * LOADING SKELETON
 * ===================================================== */

const TasksSkeleton = () => (
  <div className="bg-white rounded-lg border animate-pulse">
    <div className="px-4 py-5 border-b bg-gray-100">
      <div className="h-8 w-32 bg-slate-300 rounded mb-2" />
      <div className="h-4 w-48 bg-slate-200 rounded" />
    </div>

    <div className="p-6 space-y-8">
      {[1, 2].map((section) => (
        <div key={section}>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-4 bg-slate-300 rounded" />
            <div className="h-4 w-32 bg-slate-300 rounded" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="h-4 w-3/4 bg-slate-300 rounded" />
                <div className="h-3 w-5/6 bg-slate-200 rounded" />
                <div className="h-3 w-24 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* =====================================================
 * EMPTY STATE
 * ===================================================== */

const EmptyState = ({
  text,
  emoji,
}: {
  text: string;
  emoji?: string;
}) => (
  <div className="text-center py-8 text-slate-500">
    {emoji && <div className="text-3xl mb-2">{emoji}</div>}
    <p className="text-sm">{text}</p>
  </div>
);
