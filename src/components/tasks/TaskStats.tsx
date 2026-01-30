// src/components/tasks/TaskStats.tsx
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useTasks } from "../../hooks/task/useTasks";
import { TaskStatus } from "../../interfaces/task.interface";

export const TaskStats = () => {
    const { data } = useTasks();
    const tasks = data?.data || [];

    const stats = {
        total: tasks.length,
        pending: tasks.filter((t) => t.status === TaskStatus.Pending).length,
        inProgress: tasks.filter((t) => t.status === TaskStatus.InProgress).length,
        completed: tasks.filter((t) => t.status === TaskStatus.Completed).length,
    };

    return (
        <div className="grid grid-cols-4 gap-4">
            <StatCard
                icon={<Clock className="text-blue-600" />}
                label="Total Tasks"
                value={stats.total}
                color="blue"
            />
            <StatCard
                icon={<AlertCircle className="text-yellow-600" />}
                label="Pending"
                value={stats.pending}
                color="yellow"
            />
            <StatCard
                icon={<Clock className="text-purple-600" />}
                label="In Progress"
                value={stats.inProgress}
                color="purple"
            />
            <StatCard
                icon={<CheckCircle className="text-green-600" />}
                label="Completed"
                value={stats.completed}
                color="green"
            />
        </div>
    );
};

const StatCard = ({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
}) => (
    <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center gap-3">
            <div className={`p-3 bg-${color}-50 rounded-lg`}>{icon}</div>
            <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-600">{label}</p>
            </div>
        </div>
    </div>
);