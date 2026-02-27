import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { createClientApi, updateClientApi } from "../../api/client.api";
import Spinner from "../common/Spinner";
import type { Client } from "../../interfaces/client.interface";
import { useStates } from "../../hooks/state/useStates";
import { useCities } from "../../hooks/city/useCities";

interface Props {
    open: boolean;
    onClose: () => void;
    client?: Client | null;
    onSuccess: () => void;
}

const CLIENT_TYPES = [
    { value: 1, label: "Company" },
    { value: 2, label: "Individual" },
];

const ClientUpsertSheet = ({ open, onClose, client, onSuccess }: Props) => {
    /*   LOCK BODY SCROLL   */
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "unset";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    /*   STATES & CITIES — dynamic, same pattern as OrderUpsertSheet   */
    const { data: states = [] } = useStates();
    const [selectedStateId, setSelectedStateId] = useState<string>("");
    const { data: cities = [] } = useCities(
        selectedStateId ? Number(selectedStateId) : null
    );

    /*   FORM STATE   */
    const initialForm = {
        clientID: "" as string,
        companyName: "",
        contactPerson: "",
        mobile: "",
        email: "",
        gstNo: "",
        billingAddress: "",
        cityID: "" as string,   // string for controlled select, cast to number on save
        clientType: 1,
        status: true,
        notes: "",
    };

    const [form, setForm] = useState<typeof initialForm>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    /*   State change — reset city just like OrderUpsertSheet   */
    const handleStateChange = (stateId: string) => {
        setSelectedStateId(stateId);
        setForm((prev) => ({ ...prev, cityID: "" }));
    };

    /*   PREFILL ON OPEN   */
    useEffect(() => {
        if (!open) return;

        if (client) {
            const stateId = client.stateID != null ? String(client.stateID) : "";
            // Set state first so useCities fetches before city is applied
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
            // Cast state/city back to numbers before sending
            const payload = {
                ...form,
                stateID: selectedStateId ? Number(selectedStateId) : null,
                cityID: form.cityID ? Number(form.cityID) : null,
            };

            if (client?.clientID) {
                // PUT /api/Client/{id}
                await updateClientApi(client.clientID, payload as any);
            } else {
                // POST /api/Client
                const { clientID, ...rest } = payload;
                await createClientApi(rest as Omit<Client, "clientID">);
            }

            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    /*  UI  */
    return (
        <>
            {/* OVERLAY */}
            <div
                className="fixed inset-0 bg-black/40 z-[60]"
                onClick={saving ? undefined : onClose}
            />

            {/* SHEET */}
            <div className="fixed top-0 right-0 h-screen w-[440px] bg-white z-[70] shadow-2xl flex flex-col animate-slideInRight">
                {/* HEADER */}
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="font-semibold text-lg">
                        {client ? "Edit Client" : "Add Client"}
                    </h2>
                    <button onClick={onClose} disabled={saving}>
                        <X size={20} />
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    <Input
                        label="Company Name"
                        required
                        value={form.companyName}
                        error={errors.companyName}
                        onChange={(v: string) => setForm({ ...form, companyName: v })}
                    />

                    <Input
                        label="Contact Person"
                        required
                        value={form.contactPerson}
                        error={errors.contactPerson}
                        onChange={(v: string) => setForm({ ...form, contactPerson: v })}
                    />

                    <Input
                        label="Mobile"
                        required
                        value={form.mobile}
                        error={errors.mobile}
                        onChange={(v: string) =>
                            setForm({ ...form, mobile: v.replace(/[^0-9]/g, "").slice(0, 10) })
                        }
                    />

                    <Input
                        label="Email"
                        value={form.email}
                        error={errors.email}
                        onChange={(v: string) => setForm({ ...form, email: v })}
                    />

                    <Input
                        label="GST No"
                        value={form.gstNo}
                        onChange={(v: string) => setForm({ ...form, gstNo: v.toUpperCase() })}
                    />

                    <Textarea
                        label="Billing Address"
                        value={form.billingAddress}
                        onChange={(v: string) => setForm({ ...form, billingAddress: v })}
                    />

                    {/* STATE — fetched from API */}
                    <div>
                        <label className="text-sm font-medium">State</label>
                        <select
                            className="input w-full mt-1"
                            value={selectedStateId}
                            onChange={(e) => handleStateChange(e.target.value)}
                        >
                            <option value="">Select State</option>
                            {(states as any[]).map((s) => (
                                <option key={s.stateID} value={s.stateID}>
                                    {s.stateName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* CITY — fetched based on selected state, disabled until state is chosen */}
                    <div>
                        <label className="text-sm font-medium">City</label>
                        <select
                            className="input w-full mt-1 disabled:bg-slate-50 disabled:text-slate-400"
                            value={form.cityID}
                            disabled={!selectedStateId}
                            onChange={(e) => setForm({ ...form, cityID: e.target.value })}
                        >
                            <option value="">
                                {selectedStateId ? "Select City" : "Select state first"}
                            </option>
                            {(cities as any[]).map((c) => (
                                <option key={c.cityID} value={c.cityID}>
                                    {c.cityName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* CLIENT TYPE */}
                    <div>
                        <label className="text-sm font-medium">Client Type</label>
                        <select
                            className="input w-full mt-1"
                            value={form.clientType}
                            onChange={(e) =>
                                setForm({ ...form, clientType: Number(e.target.value) })
                            }
                        >
                            {CLIENT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* STATUS */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium">Status</label>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, status: !form.status })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.status ? "bg-blue-600" : "bg-gray-300"
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.status ? "translate-x-6" : "translate-x-1"
                                    }`}
                            />
                        </button>
                        <span className="text-sm text-gray-600">
                            {form.status ? "Active" : "Inactive"}
                        </span>
                    </div>

                    <Textarea
                        label="Notes"
                        value={form.notes}
                        onChange={(v: string) => setForm({ ...form, notes: v })}
                    />
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t flex gap-3">
                    <button
                        className="flex-1 border rounded-lg py-2"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        disabled={saving}
                        className="flex-1 bg-blue-600 text-white rounded-lg py-2 flex items-center justify-center gap-2"
                        onClick={handleSave}
                    >
                        {saving && <Spinner />}
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </>
    );
};

export default ClientUpsertSheet;

/*   HELPERS   */

const Input = ({ label, required, value, error, type = "text", onChange }: any) => (
    <div>
        <label className="text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            className={`input w-full mt-1 ${error ? "border-red-500" : ""}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

const Textarea = ({ label, value, onChange }: any) => (
    <div>
        <label className="text-sm font-medium">{label}</label>
        <textarea
            className="input w-full h-24 mt-1"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);