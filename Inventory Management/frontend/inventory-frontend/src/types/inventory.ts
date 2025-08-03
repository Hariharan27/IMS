export interface InventoryItem {
  id: number;
  product: {
    id: number;
    name: string;
    sku: string;
    description?: string;
    category: {
      id: number;
      name: string;
      description?: string;
      parent?: any;
      children?: any;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
      createdBy?: any;
      updatedBy?: any;
    };
    brand?: string;
    model?: string;
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
    createdBy?: any;
    updatedBy?: any;
  };
  warehouse: {
    id: number;
    name: string;
    code: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
    email: string;
    manager?: any;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: any;
    updatedBy?: any;
  };
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  lastUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: any;
}

export interface StockAdjustmentData {
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockMovement {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  movementType: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  referenceType: string;
  referenceId?: number;
  notes?: string;
  movementDate: string;
  createdBy: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface InventorySummary {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalWarehouses: number;
  recentMovements: StockMovement[];
}

export interface InventoryFilters {
  search?: string;
  status?: string;
  warehouseId?: number;
  categoryId?: number;
  page?: number;
  size?: number;
}

export interface InventoryUpdateRequest {
  productId: number;
  warehouseId: number;
  quantityChange: number;
  movementType: 'IN' | 'OUT';
  referenceType: string;
  referenceId?: number;
  notes?: string;
}

export interface InventoryUpdateResponse {
  productId: number;
  warehouseId: number;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  lastUpdatedAt: string;
} 