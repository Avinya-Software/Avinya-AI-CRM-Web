import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select as AntSelect } from "antd";
import toast from "react-hot-toast";
import { useUpsertProduct } from "../../hooks/product/useUpsertProduct";
import { useUnitTypeDropdown } from "../../hooks/product/useUnitTypeDropdown";
import { useTaxCategories } from "../../hooks/taxCategory/taxCategory";
import { Loader2, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (newProduct: any) => void;
}

const ProductQuickAddModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const { mutateAsync: upsertProduct, isPending: isSaving } = useUpsertProduct();
  const { data: unitTypes, mutate: fetchUnits, isPending: unitLoading } = useUnitTypeDropdown();
  const { data: taxCategories, mutate: fetchTaxes, isPending: taxLoading } = useTaxCategories();

  useEffect(() => {
    if (open) {
      fetchUnits(undefined);
      fetchTaxes(undefined);
      form.resetFields();
    }
  }, [open, fetchUnits, fetchTaxes, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      const payload = {
        productName: values.productName.trim(),
        unitType: values.unitType,
        defaultRate: values.defaultRate,
        purchasePrice: values.purchasePrice,
        taxCategoryID: values.taxCategoryID || null,
        description: values.description || "",
        status: 1, // Default to Active
      };

      const result = await upsertProduct(payload);
      toast.success("Product created successfully");
      onSuccess(result?.data);
      onClose();
    } catch (error) {
      console.error("Validation Failed:", error);
    }
  };

  return (
    <Modal
      title={<h2 className="text-xl font-semibold text-slate-900">Quick Add Product</h2>}
      open={open}
      onCancel={onClose}
      width={450}
      centered
      className="quick-add-modal"
      closeIcon={<X size={20} className="text-slate-600" />}
      footer={[
        <div key="footer" className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-white rounded-b-xl">
          <button
            key="cancel"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            key="submit"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 btn-primary rounded-lg transition disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Create Product"
            )}
          </button>
        </div>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: 1 }}
        className="p-6 space-y-4"
        requiredMark={"optional"}
      >
        <Form.Item
          label={<label className="block text-sm font-medium text-slate-700 mb-0">Product Name <span className="text-red-500">*</span></label>}
          name="productName"
          rules={[{ required: true, message: "Required" }, { min: 2, message: "Min 2 characters" }]}
          className="mb-0"
        >
          <Input 
            placeholder="Enter product name" 
            className="h-10 border-slate-300 rounded-lg"
          />
        </Form.Item>
        <Form.Item
          label={<label className="block text-sm font-medium text-slate-700 mb-0">Description</label>}
          name="description"
          className="mb-0"
        >
          <Input 
            placeholder="Enter product description" 
            className="h-10 border-slate-300 rounded-lg"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label={<label className="block text-sm font-medium text-slate-700 mb-0">Unit Type <span className="text-red-500">*</span></label>}
            name="unitType"
            rules={[{ required: true, message: "Required" }]}
            className="mb-0"
          >
            <AntSelect
              showSearch
              placeholder="Select Unit"
              loading={unitLoading}
              optionFilterProp="children"
              className="h-10"
            >
              {unitTypes?.data?.map((u: any) => (
                <AntSelect.Option key={u.unitTypeID} value={u.unitTypeID}>
                  {u.unitName}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>

          <Form.Item
            label={<label className="block text-sm font-medium text-slate-700 mb-0">Tax Category</label>}
            name="taxCategoryID"
            className="mb-0"
          >
            <AntSelect
              showSearch
              placeholder="No Tax"
              loading={taxLoading}
              allowClear
              optionFilterProp="children"
              className="h-10"
            >
              {taxCategories?.map((t: any) => (
                <AntSelect.Option key={t.taxCategoryID} value={t.taxCategoryID}>
                  {t.taxName || t.categoryName}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label={<label className="block text-sm font-medium text-slate-700 mb-0">Default Rate <span className="text-red-500">*</span></label>}
            name="defaultRate"
            rules={[{ required: true, message: "Required" }]}
            className="mb-0"
          >
            <InputNumber
              className="w-full h-10 flex items-center border-slate-300 rounded-lg"
              min={0.01}
              placeholder="0.00"
              precision={2}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            label={<label className="block text-sm font-medium text-slate-700 mb-0">Purchase Price <span className="text-red-500">*</span></label>}
            name="purchasePrice"
            rules={[{ required: true, message: "Required" }]}
            className="mb-0"
          >
            <InputNumber
              className="w-full h-10 flex items-center border-slate-300 rounded-lg"
              min={0.01}
              placeholder="0.00"
              precision={2}
              step={0.01}
            />
          </Form.Item>
        </div>
      </Form>

      <style>{`
        .quick-add-modal .ant-modal-content {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
        }
        .quick-add-modal .ant-modal-header {
          padding: 16px 24px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 0;
        }
        .quick-add-modal .ant-modal-body {
          padding: 0;
        }
        .quick-add-modal .ant-form-item-label {
          padding-bottom: 4px;
        }
        .quick-add-modal .ant-form-item-label label {
            height: auto;
        }
      `}</style>
    </Modal>
  );
};

export default ProductQuickAddModal;
