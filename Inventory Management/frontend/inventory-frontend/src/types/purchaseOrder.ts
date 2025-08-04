export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplier: Supplier;
  warehouse: Warehouse;
  orderDate: string;
  expectedDeliveryDate: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy: User;
  items: PurchaseOrderItem[];
  itemCount: number;
  totalQuantityOrdered: number;
  totalQuantityReceived: number;
}

export interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  product: Product;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  remainingQuantity: number;
  partiallyReceived: boolean;
  fullyReceived: boolean;
}

export interface PurchaseOrderRequest {
  supplierId: number;
  warehouseId: number;
  orderDate: string;
  expectedDeliveryDate?: string;
  notes?: string;
  items: PurchaseOrderItemRequest[];
}

export interface PurchaseOrderItemRequest {
  productId: number;
  quantityOrdered: number;
  unitPrice: number;
  notes?: string;
}

export interface PurchaseOrderStatusUpdateRequest {
  status: PurchaseOrderStatus;
  notes?: string;
}

export interface ReceiveItemsRequest {
  receivedItems: ReceiveItemRequest[];
}

export interface ReceiveItemRequest {
  itemId: number;
  quantityReceived: number;
  notes?: string;
}

export type PurchaseOrderStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'ORDERED'
  | 'PARTIALLY_RECEIVED'
  | 'FULLY_RECEIVED'
  | 'CANCELLED'
  | 'CLOSED';

export interface PurchaseOrderListResponse {
  success: boolean;
  data: PurchaseOrder[];
  message: string;
  count: number;
}

export interface PurchaseOrderResponse {
  success: boolean;
  data: PurchaseOrder;
  message: string;
}

export interface PurchaseOrderFilters {
  search?: string;
  status?: PurchaseOrderStatus;
  supplierId?: number;
  warehouseId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface PurchaseOrderStats {
  totalOrders: number;
  totalValue: number;
  pendingOrders: number;
  overdueOrders: number;
  ordersByStatus: {
    [key in PurchaseOrderStatus]: number;
  };
}

// Supporting types (imported from other files)
export interface Supplier {
  id: number;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxId?: string;
  paymentTerms?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  updatedBy?: User;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
  managerId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  updatedBy?: User;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  category: Category;
  brand: string;
  model: string;
  weight?: number;
  dimensions?: string;
  unitOfMeasure: string;
  costPrice: number;
  sellingPrice: number;
  reorderPoint: number;
  reorderQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  updatedBy?: User;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  parent?: Category;
  children?: Category[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: User;
  updatedBy?: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF'; 