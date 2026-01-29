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