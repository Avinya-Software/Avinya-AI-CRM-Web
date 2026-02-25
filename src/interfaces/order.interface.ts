// src/interfaces/order.interface.ts

// ── Enums (numeric — matches backend int enums) ────────────────────
export type OrderStatus = 0 | 1 | 2 | 3;    // 0=Pending 1=Processing 2=Completed 3=Cancelled
export type DesignStatus = 0 | 1 | 2 | 3;   // adjust to your backend values

// ── Order Item (read from API) ─────────────────────────────────────
export interface OrderItemResponseDto {
  orderItemID: string;
  orderID?: string;
  productID?: string;
  productName?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  taxCategoryID?: string;
  taxCategoryName?: string;
  lineTotal?: number;
  unitType?: string;
}

// ── Order (read from API list / detail) ───────────────────────────
export interface Order {
  orderID: string;
  orderNo?: string;
  clientID?: string;
  clientName?: string;
  quotationID?: string;
  orderDate?: string;
  isDesignByUs?: boolean;
  designingCharge?: number;
  expectedDeliveryDate?: string;
  status?: OrderStatus;
  statusName?: string;
  firmID?: number;
  designStatus?: DesignStatus;
  assignedDesignTo?: string;
  enableTax?: boolean;
  taxCategoryID?: string;
  isUseBillingAddress?: boolean;
  shippingAddress?: string;
  stateID?: number;
  stateName?: string;
  cityID?: number;
  cityName?: string;
  totalAmount?: number;
  createdDate?: string;
  items?: OrderItemResponseDto[];
}

// ── Filters ────────────────────────────────────────────────────────
export interface OrderFilters {
  page: number;
  pageSize: number;
  search: string;
  status: string;
  startDate: string;
  endDate: string;
}

// ── OrderItemDto — matches backend OrderItemDto exactly ────────────
export interface OrderItemDto {
  orderID?: string | null;
  orderItemId?: string | null;   // null = new row
  productID: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  taxCategoryID?: string | null;
  lineTotal?: number;
}

// ── CreateOrderDto — matches backend OrderDto exactly ─────────────
export interface CreateOrderDto {
  orderID?: string | null;       // null = create, Guid = update
  orderNo?: string | null;
  clientID: string;              // Guid
  quotationID?: string | null;
  orderDate: string;             // ISO datetime string
  isDesignByUs?: boolean;
  designingCharge?: number;
  expectedDeliveryDate: string;  // ISO datetime string
  status?: number;               // int enum
  firmID: number;                // int
  designStatus?: number;         // int enum
  assignedDesignTo?: string | null;
  enableTax?: boolean;
  taxCategoryID?: string | null;
  isUseBillingAddress: boolean;
  shippingAddress?: string | null;
  stateID?: number | null;       // int in backend
  cityID?: number | null;        // int in backend
  items: OrderItemDto[];
}

// Update uses identical shape — same addOrUpdate endpoint
export type UpdateOrderDto = CreateOrderDto;

// ── Dropdown ───────────────────────────────────────────────────────
export interface OrderDropdownItem {
  orderID: string;
  orderNo: string;
  clientName: string;
}

// ── Paginated response wrapper ─────────────────────────────────────
export interface PaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: T[];
}