export interface Product {
  productId: string;
  insurerId: string;
  insurerName?: string;
  productCategoryId: number;
  productCategory?: string;
  productName: string;
  productCode: string;
  defaultReminderDays: number;
  commissionRules: string;
  isActive: boolean;
}

export interface ProductDropdown {
  productID: string;
  productName: string;
  description?: string;
  unitName: number;
}