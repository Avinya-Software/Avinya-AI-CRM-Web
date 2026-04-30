import { useEffect, useState } from "react";
import { Select as AntSelect } from "antd";
import { X ,Users} from "lucide-react";
import toast from "react-hot-toast";

import { createClientApi, updateClientApi } from "../../api/client.api";
import Spinner from "../common/Spinner";
import type { Client } from "../../interfaces/client.interface";
import { useStates } from "../../hooks/state/useStates";
import { useCities } from "../../hooks/city/useCities";
import { usePermissions } from "../../context/PermissionContext";

interface Props {
    open: boolean;
    onClose: () => void;
    client?: Client | null;
    onSuccess: (message?: string) => void;
}

const CLIENT_TYPES = [
    { value: 1, label: "Company" },
    { value: 2, label: "Individual" },
];

const ClientUpsertSheet = ({ open, onClose, client, onSuccess }: Props) => {
    const isEdit = !!client;

    /* ── PERMISSIONS ── */
    const { hasPermission } = usePermissions();
    const canAdd = hasPermission("client", "add");
    const canEdit = hasPermission("client", "edit");
    const isReadOnly = isEdit ? !canEdit : !canAdd;

    /*   LOCK BODY SCROLL   */
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [open]);

    /*   STATES & CITIES   */
    const statesMutation = useStates();
    const citiesMutation = useCities();
    const [selectedStateId, setSelectedStateId] = useState<string>("");

    useEffect(() => {
        if (open) statesMutation.mutate(undefined);
    }, [open]);

    useEffect(() => {
        if (selectedStateId) citiesMutation.mutate(Number(selectedStateId));
    }, [selectedStateId]);

    const states: any[] = statesMutation.data ?? [];
    const cities: any[] = citiesMutation.data ?? [];

    /*   FORM STATE   */
    const initialForm = {
        clientID: "" as string,
        companyName: "",
        contactPerson: "",
        mobile: "",
        email: "",
        gstNo: "",
        billingAddress: "",
        cityID: "" as string,
        clientType: 1,
        status: true,
        notes: "",
    };

    const [form, setForm] = useState<typeof initialForm>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const handleStateChange = (stateId: string) => {
        setSelectedStateId(stateId);
        setForm((prev) => ({ ...prev, cityID: "" }));
    };

    /*   PREFILL ON OPEN   */
    useEffect(() => {
        if (!open) return;

        if (client) {
            const stateId = client.stateID != null ? String(client.stateID) : "";
            setSelectedStateId(stateId);
            setForm({
                clientID: client.clientID,
                companyName: client.companyName ?? "",
                contactPerson: client.contactPerson ?? "",
                mobile: client.mobile ?? "",
                email: client.email ?? "",
                gstNo: client.gstNo ?? "",
                billingAddress: client.billingAddress ?? "",
                cityID: client.cityID != null ? String(client.cityID) : "",
                clientType: client.clientType ?? 1,
                status: client.status ?? true,
                notes: client.notes ?? "",
            });
        } else {
            setSelectedStateId("");
            setForm(initialForm);
        }

        setErrors({});
    }, [open, client]);

    /*   VALIDATION   */
    const validate = () => {
        const e: Record<string, string> = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;

        if (!form.companyName.trim()) e.companyName = "Company name is required";
        if (!form.contactPerson.trim()) e.contactPerson = "Contact person is required";

        if (!form.mobile.trim()) e.mobile = "Mobile is required";
        else if (!mobileRegex.test(form.mobile))
            e.mobile = "Invalid mobile number (10 digits, starting 6-9)";

        if (form.email && !emailRegex.test(form.email))
            e.email = "Invalid email address";

        setErrors(e);

        if (Object.keys(e).length) {
            toast.error("Please fix validation errors");
            return false;
        }

        return true;
    };

    /*   SAVE   */
    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);
        try {
            const payload = {
                ...form,
                stateID: selectedStateId ? Number(selectedStateId) : null,
                cityID: form.cityID ? Number(form.cityID) : null,
            };

            let res;
            if (client?.clientID) {
                res = await updateClientApi(client.clientID, payload as any);
            } else {
                const { clientID, ...rest } = payload;
                res = await createClientApi(rest as Omit<Client, "clientID">);
            }

            onSuccess(res?.statusMessage);
        } catch (error: any) {
            const respData = error.response?.data;
            toast.error(respData?.statusMessage || respData?.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    // Hard guard — don't render if no permission
    if (!open) return null;
    if (isEdit && !canEdit) return null;
    if (!isEdit && !canAdd) return null;

    return (
        <>
            {/* OVERLAY */}
            <div
                className="fixed inset-0 bg-black/40 z-[60]"
                onClick={saving ? undefined : onClose}
            />

            {/* SHEET */}
            <div className="fixed top-0 right-0 h-screen w-full max-w-[720px] bg-white z-[70] shadow-2xl flex flex-col animate-slideInRight">

                {/* HEADER */}
                <div className="px-6 py-4 border-b bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--btn-primary)]">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800">
                                {client ? "Edit Customer" : "Add New Customer"}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {client ? "Update customer information" : "Fill in the details to create a customer"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* ── SECTION: Client Info ── */}
                    <Section title="Client Information">
                        <Input
                            label="Company Name"
                            required
                            value={form.companyName}
                            error={errors.companyName}
                            onChange={(v: string) => setForm({ ...form, companyName: v })}
                            disabled={isReadOnly}
                        />

                        <Input
                            label="Contact Person"
                            required
                            value={form.contactPerson}
                            error={errors.contactPerson}
                            onChange={(v: string) => setForm({ ...form, contactPerson: v })}
                            disabled={isReadOnly}
                        />

                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Customer Type</label>
                            <AntSelect
                                showSearch
                                className="w-full h-10"
                                value={form.clientType}
                                onChange={(val) => setForm({ ...form, clientType: val })}
                                disabled={isReadOnly}
                                placeholder="Select Type"
                                optionFilterProp="children"
                            >
                                {CLIENT_TYPES.map((t) => (
                                    <AntSelect.Option key={t.value} value={t.value}>{t.label}</AntSelect.Option>
                                ))}
                            </AntSelect>
                        </div>

                        <Input
                            label="GST No"
                            value={form.gstNo}
                            onChange={(v: string) => setForm({ ...form, gstNo: v.toUpperCase() })}
                            disabled={isReadOnly}
                        />
                    </Section>

                    {/* ── SECTION: Contact Details ── */}
                    <Section title="Contact Details">
                        <Input
                            label="Mobile"
                            required
                            value={form.mobile}
                            error={errors.mobile}
                            onChange={(v: string) =>
                                setForm({ ...form, mobile: v.replace(/[^0-9]/g, "").slice(0, 10) })
                            }
                            disabled={isReadOnly}
                        />

                        <Input
                            label="Email"
                            value={form.email}
                            error={errors.email}
                            onChange={(v: string) => setForm({ ...form, email: v })}
                            disabled={isReadOnly}
                        />
                    </Section>

                    {/* ── SECTION: Location ── */}
                    <Section title="Location">
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">State</label>
                            <AntSelect
                                showSearch
                                className="w-full h-10"
                                value={selectedStateId || undefined}
                                onChange={(val) => handleStateChange(val)}
                                disabled={isReadOnly}
                                placeholder="Select State"
                                optionFilterProp="children"
                            >
                                {(states as any[]).map((s) => (
                                    <AntSelect.Option key={s.stateID} value={String(s.stateID)}>
                                        {s.stateName}
                                    </AntSelect.Option>
                                ))}
                            </AntSelect>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">City</label>
                            <AntSelect
                                showSearch
                                className="w-full h-10"
                                value={form.cityID || undefined}
                                disabled={!selectedStateId || isReadOnly}
                                onChange={(val) => setForm({ ...form, cityID: val })}
                                placeholder={selectedStateId ? "Select City" : "Select state first"}
                                optionFilterProp="children"
                            >
                                {(cities as any[]).map((c) => (
                                    <AntSelect.Option key={c.cityID} value={String(c.cityID)}>
                                        {c.cityName}
                                    </AntSelect.Option>
                                ))}
                            </AntSelect>
                        </div>

                        <div className="col-span-2">
                            <Textarea
                                label="Billing Address"
                                value={form.billingAddress}
                                onChange={(v: string) => setForm({ ...form, billingAddress: v })}
                                disabled={isReadOnly}
                            />
                        </div>
                    </Section>

                    {/* ── SECTION: Additional Info ── */}
                    <Section title="Additional Info">
                        <div className="col-span-2">
                            <Textarea
                                label="Notes"
                                value={form.notes}
                                onChange={(v: string) => setForm({ ...form, notes: v })}
                                disabled={isReadOnly}
                            />
                        </div>

                        {isEdit && (
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-semibold text-slate-600">Status</label>
                                <button
                                    type="button"
                                    onClick={() => !isReadOnly && setForm({ ...form, status: !form.status })}
                                    disabled={isReadOnly}
                                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors disabled:opacity-50 ${form.status ? "bg-[var(--btn-primary)]" : "bg-gray-300"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.status ? "translate-x-5" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                                <span className="text-xs font-medium text-slate-600">
                                    {form.status ? "Active" : "Inactive"}
                                </span>
                            </div>
                        )}
                    </Section>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t bg-slate-50 flex gap-3 shrink-0">
                    <button
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    {!isReadOnly && (
                        <button
                            disabled={saving}
                            className="flex-1 btn-primary px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                            onClick={handleSave}
                        >
                            {saving ? <Spinner /> : isEdit ? "Update Customer" : "Save Customer"}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default ClientUpsertSheet;

/* ================= HELPERS ================= */

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
        <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {children}
        </div>
    </div>
);

const Input = ({ label, required, value, error, type = "text", onChange, disabled }: any) => (
    <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            className={`input w-full ${error ? "border-red-400 focus:ring-red-500 focus:border-red-500" : ""} disabled:bg-slate-50 disabled:text-slate-500`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
        />
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
);

const Textarea = ({ label, required, value, error, onChange, disabled }: any) => (
    <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            className={`input w-full h-20 resize-none disabled:bg-slate-50 disabled:text-slate-500 ${error ? "border-red-400 focus:ring-red-500 focus:border-red-500" : ""}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
        />
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
);