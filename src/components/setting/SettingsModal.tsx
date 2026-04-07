import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { useSettings, useUpdateSetting } from "../../hooks/setting/useSettings";
import { useTenant, useUpdateTenant } from "../../hooks/tenant/useTenant";
import { useBankDetails, useAddBankDetail, useUpdateBankDetail, useDeleteBankDetail } from "../../hooks/bankDetail/useBankDetail";
import { useAuth } from "../../auth/useAuth";
import { decodeUserToken } from "../../lib/auth.utils";
import { Settings } from "../../interfaces/setting.interface";
import { Tenant } from "../../interfaces/tenant.interface";
import { BankDetails } from "../../interfaces/bankDetail.interface";
import { cn } from "../../lib/utils";
import { Trash2, Plus, RefreshCw } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const TABS = [
  { id: "basic", label: "Basic Settings" },
  { id: "company", label: "Company Settings" },
  { id: "bank", label: "Bank Details" },
];

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const { data: serverSettings, isLoading } = useSettings(undefined, open);
  const updateMutation = useUpdateSetting();
  const [localSettings, setLocalSettings] = useState<Settings[]>([]);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (serverSettings) {
      setLocalSettings(serverSettings);
    }
  }, [serverSettings]);

  const handleUpdateAll = async () => {
    const changed = localSettings.filter(ls => {
      const original = serverSettings?.find(ss => ss.settingID === ls.settingID);
      return original && (original.value !== ls.value || original.preFix !== ls.preFix || original.digits !== ls.digits);
    });

    for (const s of changed) {
      await updateMutation.mutateAsync(s);
    }
  };

  const handleDetailChange = (id: string, field: string, newVal: any) => {
    setLocalSettings(prev =>
      prev.map(s => {
        if (s.settingID !== id) return s;

        if (field === "preFix" || field === "digits") {
          return { ...s, [field]: field === "digits" && newVal !== "" ? Number(newVal) : newVal };
        }

        // Skip JSON bundling for specific settings that should be plain
        const type = s.entityType.toLowerCase();
        if (type.includes("payment q r") || type.includes("paymentqr") || 
            type.includes("payment u p i id") || type.includes("paymentupiid")) {
          return { ...s, value: newVal.toString() };
        }

        let currentData: any;
        try {
          currentData = JSON.parse(s.value);
          if (typeof currentData !== 'object' || currentData === null) {
            currentData = { value: s.value };
          }
        } catch {
          currentData = { value: s.value };
        }

        // Clean up legacy keys from the JSON value to ensure they are only in the columns
        delete currentData.prefix;
        delete currentData.digits;
        delete currentData.preFix;
        delete currentData.Digits;

        const updatedData = { 
          ...currentData, 
          [field]: field === "LastNumber" && newVal !== "" ? Number(newVal) : newVal 
        };
        return { ...s, value: JSON.stringify(updatedData) };
      })
    );
  };

  const getField = (value: string, field: string, fallback: any = "") => {
    try {
      const data = JSON.parse(value);
      if (typeof data !== 'object' || data === null) {
        return field === "value" ? value : fallback;
      }
      
      // If looking for a specific field in JSON, return fallback if it doesn't exist
      if (field !== "value" && !(field in data)) {
        return fallback;
      }

      return data[field] ?? (field === "value" ? value : fallback);
    } catch {
      return field === "value" ? value : fallback;
    }
  };

  const hasChanges = localSettings.some(ls => {
    const original = serverSettings?.find(ss => ss.settingID === ls.settingID);
    return original && (original.value !== ls.value || original.preFix !== ls.preFix || original.digits !== ls.digits);
  });

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-[1000px] w-[90vw] h-[95vh] bg-white border-slate-200 text-slate-900 flex flex-col p-0 overflow-hidden rounded-xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-8 py-4 border-b flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-xl font-bold text-slate-800">Settings</DialogTitle>
        </DialogHeader>

        {/* Tabs Bar */}
        <div className="px-8 shrink-0">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                  activeTab === tab.id
                    ? "bg-[#1853FF] text-white shadow-md shadow-blue-200"
                    : "bg-slate-100/80 text-slate-500 hover:bg-slate-100"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 bg-white custom-scrollbar-light">
          {activeTab === "basic" ? (
            isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-[#1853FF] animate-spin" />
                <p className="text-slate-500 font-medium">Fetching settings...</p>
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                {localSettings.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400">No settings found.</p>
                  </div>
                ) : (() => {
                  const qrSetting = localSettings.find(s => s.entityType.toLowerCase().includes("payment q r") || s.entityType.toLowerCase().includes("paymentqr"));
                  const isQrEnabled = qrSetting?.value === "1";
                  const upiSetting = localSettings.find(s => s.entityType.toLowerCase().includes("payment u p i id") || s.entityType.toLowerCase().includes("paymentupiid"));

                  return (
                    <div className="space-y-6">
                      {/* Special QR Toggle Card */}
                      {qrSetting && (
                        <Card className="border-[#D0E1FF] shadow-sm overflow-hidden border-2 bg-[#F2F7FF]/50">
                          <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                              <h3 className="text-base font-bold text-slate-800">Enable Payment QR</h3>
                              <p className="text-sm text-slate-500 font-medium">Enable QR payments for all firms</p>
                            </div>
                            <Switch 
                              checked={isQrEnabled}
                              onCheckedChange={(val) => handleDetailChange(qrSetting.settingID, "value", val ? "1" : "0")}
                            />
                          </CardContent>
                        </Card>
                      )}

                      {/* UPI ID Card (Condition) */}
                      {isQrEnabled && upiSetting && (
                        <Card className="border-slate-200 shadow-sm overflow-hidden border-2">
                          <CardHeader className="bg-slate-50/50 py-4 border-b">
                            <CardTitle className="text-base font-bold text-slate-800">Payment UPI ID</CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-2">
                              <Label className="text-[13px] font-bold text-slate-500">UPI ID</Label>
                              <Input
                                value={upiSetting.value}
                                onChange={(e) => handleDetailChange(upiSetting.settingID, "value", e.target.value)}
                                className="h-12 bg-white border-slate-200 text-slate-800 focus:ring-[#1853FF]/20 transition-all font-mono text-sm"
                                placeholder="e.g. example@upi"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Remaining Settings */}
                      {localSettings
                        .filter(s => 
                          s.settingID !== qrSetting?.settingID && 
                          s.settingID !== upiSetting?.settingID
                        )
                        .map((setting) => (
                          <Card key={setting.settingID} className="border-slate-200 shadow-sm overflow-hidden border-2">
                            <CardHeader className="bg-slate-50/50 py-4 border-b">
                              <CardTitle className="text-base font-bold text-slate-800">
                                {setting.entityType.replace(/([A-Z])/g, ' $1').trim()}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                               {(() => {
                                 // Check if this setting is a sequence setting (has LastNumber)
                                 const hasLastNumber = getField(setting.value, "LastNumber", undefined) !== undefined;
                                 const editField = hasLastNumber ? "LastNumber" : "value";
                                 const label = hasLastNumber ? "Last Number" : "Value";

                                 return (
                                   <div className="space-y-2">
                                     <Label className="text-[13px] font-bold text-slate-500">{label}</Label>
                                     {setting.entityType.toLowerCase().includes("termsandconditions") || setting.entityType.toLowerCase().includes("terms and conditions") ? (
                                       <textarea
                                         value={getField(setting.value, editField)}
                                         onChange={(e) => handleDetailChange(setting.settingID, editField, e.target.value)}
                                         className="w-full p-4 border border-slate-200 rounded-lg text-sm min-h-[150px] focus:ring-2 focus:ring-[#1853FF]/20 focus:border-[#1853FF] outline-none transition-all"
                                         placeholder="Enter terms and conditions..."
                                       />
                                     ) : (
                                       <Input
                                         type={hasLastNumber ? "number" : "text"}
                                         value={getField(setting.value, editField)}
                                         onChange={(e) => handleDetailChange(setting.settingID, editField, e.target.value)}
                                         className="h-12 bg-white border-slate-200 text-slate-800 focus:ring-[#1853FF]/20 focus:border-[#1853FF] transition-all font-mono text-sm"
                                         placeholder={`Enter ${label.toLowerCase()}`}
                                       />
                                     )}
                                   </div>
                                 );
                               })()}

                              {!(
                                setting.entityType.toLowerCase().includes("termsandconditions") ||
                                setting.entityType.toLowerCase().includes("terms and conditions") ||
                                setting.entityType.toLowerCase().includes("paymentqr") ||
                                setting.entityType.toLowerCase().includes("payment q r") ||
                                setting.entityType.toLowerCase().includes("paymentupiid") ||
                                setting.entityType.toLowerCase().includes("payment u p i id")
                              ) && (
                                <>
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                      <Label className="text-[13px] font-bold text-slate-500">Prefix</Label>
                                      <Input
                                        value={setting.preFix ?? (setting.entityType.toLowerCase().includes("lead") ? "L-NO-" : setting.entityType.toLowerCase().includes("quotation") ? "Q-NO-" : "")}
                                        onChange={(e) => handleDetailChange(setting.settingID, "preFix", e.target.value)}
                                        className="h-12 border-slate-200 bg-white"
                                        placeholder="e.g. L-NO-"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-[13px] font-bold text-slate-500">Digits</Label>
                                      <Input
                                        value={setting.digits ?? "4"}
                                        onChange={(e) => handleDetailChange(setting.settingID, "digits", e.target.value)}
                                        type="number"
                                        className="h-12 border-slate-200 bg-white"
                                        placeholder="4"
                                      />
                                    </div>
                                  </div>

                                  <div className="p-4 bg-[#F2F7FF] border border-[#D0E1FF] rounded-lg">
                                    <p className="text-sm text-slate-600 font-medium">
                                      Preview: <span className="text-[#1853FF] font-bold tracking-wider">
                                        {setting.preFix ?? ""}/{getField(setting.value, "FinancialYear", `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`)}/{String(Number(getField(setting.value, "LastNumber", 0)) + 1).padStart(setting.digits || 4, '0')}
                                      </span>
                                    </p>
                                  </div>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      }
                    </div>
                  );
                })()}
              </div>
            )
          ) : activeTab === "company" ? (
            <CompanySettingsTab enabled={open} />
          ) : activeTab === "bank" ? (
            <BankDetailsTab enabled={open} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p>{TABS.find(t => t.id === activeTab)?.label} coming soon...</p>
            </div>
          )}
        </div>


        {/* Footer */}
        <div className="px-8 py-6 border-t bg-slate-50/30 flex items-center justify-between shrink-0">
          <div className="text-sm">
            {hasChanges ? (
              <span className="text-emerald-600 font-bold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Unsaved changes
              </span>
            ) : (
              <span className="text-slate-400 font-medium">No changes</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-8 h-12 border-slate-200 text-slate-600 hover:bg-slate-100 font-bold rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAll}
              disabled={!hasChanges || updateMutation.isPending}
              className="px-10 h-12 bg-[#1853FF] hover:bg-[#1040D1] text-white font-bold shadow-lg shadow-blue-200 transition-all flex gap-2 rounded-lg"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CompanySettingsTab = ({ enabled }: { enabled: boolean }) => {
  const { token } = useAuth();
  const claims = decodeUserToken(token);
  const { data: tenant, isLoading } = useTenant(claims?.tenantId, enabled);
  const updateMutation = useUpdateTenant();
  const [formData, setFormData] = useState<Tenant | null>(null);

  useEffect(() => {
    if (tenant) {
      setFormData(tenant);
    }
  }, [tenant]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-[#1853FF] animate-spin" />
        <p className="text-slate-500 font-medium">Loading company profile...</p>
      </div>
    );
  }

  if (!formData) return null;

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleReset = () => {
    setFormData(tenant || null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-slate-200 shadow-sm overflow-hidden border-2">
        <CardHeader className="bg-slate-50/50 py-4 border-b">
          <CardTitle className="text-base font-bold text-slate-800 uppercase tracking-wide">
            {formData.companyName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            {/* Firm Name */}
            <div className="space-y-2">
              <Label className="text-[13px] font-bold text-slate-500">Firm Name</Label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="h-12 bg-white border-slate-200 text-slate-800"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-[13px] font-bold text-slate-500">Company Email</Label>
              <Input
                value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                className="h-12 bg-white border-slate-200 text-slate-800"
              />
            </div>

            {/* Mobile */}
            <div className="space-y-2">
              <Label className="text-[13px] font-bold text-slate-500">Mobile</Label>
              <Input
                value={formData.companyPhone || ""}
                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                className="h-12 bg-white border-slate-200 text-slate-800"
              />
            </div>

            {/* Industry Type */}
            <div className="space-y-2">
              <Label className="text-[13px] font-bold text-slate-500">Industry Type</Label>
              <Input
                value={formData.industryType || ""}
                onChange={(e) => setFormData({ ...formData, industryType: e.target.value })}
                className="h-12 bg-white border-slate-200 text-slate-800"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label className="text-[13px] font-bold text-slate-500">Address</Label>
            <textarea
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-4 border border-slate-200 rounded-lg text-sm min-h-[120px] focus:ring-2 focus:ring-[#1853FF]/20 focus:border-[#1853FF] outline-none transition-all"
              placeholder="Full office address..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="px-8 h-11 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-lg"
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="px-10 h-11 bg-[#1853FF] hover:bg-[#1040D1] text-white font-bold shadow-lg shadow-blue-200 transition-all flex gap-2 rounded-lg"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Company
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const BankDetailsTab = ({ enabled }: { enabled: boolean }) => {
  const { token } = useAuth();
  const claims = decodeUserToken(token);
  const tenantId = claims?.tenantId;
  const { data: banks, isLoading } = useBankDetails(tenantId, enabled);
  const addMutation = useAddBankDetail();
  const updateMutation = useUpdateBankDetail();
  const deleteMutation = useDeleteBankDetail();

  const [editingBanks, setEditingBanks] = useState<BankDetails[]>([]);

  useEffect(() => {
    if (banks) {
      setEditingBanks(banks);
    }
  }, [banks]);

  const handleAddBank = () => {
    if (!tenantId) return;
    const newBank: BankDetails = {
      tenantId,
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      branchName: "",
      isActive: true,
    };
    setEditingBanks([newBank, ...editingBanks]);
  };

  const handleFieldChange = (index: number, field: keyof BankDetails, value: any) => {
    setEditingBanks(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const handleSave = (index: number) => {
    const bank = editingBanks[index];
    if (bank.bankAccountId) {
      updateMutation.mutate(bank);
    } else {
      addMutation.mutate(bank);
    }
  };

  const handleReset = (index: number) => {
    if (banks && banks[index]) {
      setEditingBanks(prev => prev.map((b, i) => i === index ? banks[index] : b));
    } else {
      setEditingBanks(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDelete = (bankAccountId: string) => {
    if (confirm("Are you sure you want to delete this bank account?")) {
      deleteMutation.mutate(bankAccountId);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-[#1853FF] animate-spin" />
        <p className="text-slate-500 font-medium">Loading bank accounts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex justify-end">
        <Button 
          onClick={handleAddBank}
          className="bg-[#1853FF] hover:bg-[#1040D1] text-white font-bold flex gap-2 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Add Bank
        </Button>
      </div>

      {editingBanks.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400">No bank accounts found. Click "Add Bank" to create one.</p>
        </div>
      ) : (
        editingBanks.map((bank, index) => (
          <Card key={bank.bankAccountId || `new-${index}`} className="border-slate-200 shadow-sm overflow-hidden border-2 transition-all hover:border-slate-300">
            <CardHeader className="bg-slate-50/50 py-4 px-8 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-800 uppercase tracking-wide">
                {bank.bankName || "NEW BANK ACCOUNT"}
              </CardTitle>
              {bank.bankAccountId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(bank.bankAccountId!)}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                {/* Bank Name */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold text-slate-500">Bank Name *</Label>
                  <Input
                    value={bank.bankName}
                    onChange={(e) => handleFieldChange(index, "bankName", e.target.value)}
                    className="h-12 bg-white border-slate-200 text-slate-800 focus:ring-[#1853FF]/10"
                    placeholder="e.g. SURAT NATIONAL BANK"
                  />
                </div>

                {/* Account Holder */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold text-slate-500">Account Holder Name *</Label>
                  <Input
                    value={bank.accountHolderName}
                    onChange={(e) => handleFieldChange(index, "accountHolderName", e.target.value)}
                    className="h-12 bg-white border-slate-200 text-slate-800 focus:ring-[#1853FF]/10"
                  />
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold text-slate-500">Account Number *</Label>
                  <Input
                    value={bank.accountNumber}
                    onChange={(e) => handleFieldChange(index, "accountNumber", e.target.value)}
                    className="h-12 bg-white border-slate-200 text-slate-800 focus:ring-[#1853FF]/10"
                  />
                </div>

                {/* IFSC Code */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold text-slate-500">IFSC Code *</Label>
                  <Input
                    value={bank.ifscCode}
                    onChange={(e) => handleFieldChange(index, "ifscCode", e.target.value)}
                    className="h-12 bg-white border-slate-200 text-slate-800 focus:ring-[#1853FF]/10 uppercase"
                  />
                </div>

                {/* Branch Name */}
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold text-slate-500">Branch Name *</Label>
                  <Input
                    value={bank.branchName}
                    onChange={(e) => handleFieldChange(index, "branchName", e.target.value)}
                    className="h-12 bg-white border-slate-200 text-slate-800 focus:ring-[#1853FF]/10"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex flex-col gap-3">
                <Label className="text-[13px] font-bold text-slate-500">Status</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={bank.isActive}
                    onCheckedChange={(val) => handleFieldChange(index, "isActive", val)}
                  />
                  <span className={cn(
                    "text-sm font-bold",
                    bank.isActive ? "text-emerald-500" : "text-slate-400"
                  )}>
                    {bank.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => handleReset(index)}
                  className="px-8 h-12 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-lg flex gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
                <Button
                  onClick={() => handleSave(index)}
                  disabled={addMutation.isPending || updateMutation.isPending}
                  className="px-10 h-12 bg-[#1853FF] hover:bg-[#1040D1] text-white font-bold shadow-lg shadow-blue-200 transition-all flex gap-2 rounded-lg"
                >
                  {(addMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Bank
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};



