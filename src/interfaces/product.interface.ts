// src/interfaces/product.interface.ts

// ── Product (from GET /api/Product/filter) ─────────────────────────
export interface Product {
  productID: string;
  productName: string;
  category?: string | null;
  hsnCode?: string | null;
  description?: string | null;
  isDesignByUs?: boolean;
  unitTypeName?: string | null;
  unitTypeId?: string | null;
  taxCategoryID?: string | null;
  taxCategoryName?: string | null;
  createdByID?: string;
  createdByName?: string | null;
  defaultRate?: number | null;
  purchasePrice?: number | null;
  status?: number;              // 1 = Active, 0 = Inactive
  createdDate?: string;
  updatedAt?: string | null;
}

// ── Unit Type (from GET /api/Product/get-UnitType-dropdown) ────────
export interface UnitType {
  unitTypeID: string;
  unitName: string;
}

// ── Product Dropdown (used in Order/Quotation item selectors) ──────
export interface ProductDropdown {
  productID: string;
  productName: string;
  description?: string | null;
  unitName?: string | null;     // display name e.g. "Page", "Pcs"
  unitTypeId?: string | null;
  defaultRate?: number | null;
}