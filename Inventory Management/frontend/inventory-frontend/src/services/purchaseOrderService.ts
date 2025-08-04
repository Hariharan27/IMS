import api from './api';
import type {
  PurchaseOrder,
  PurchaseOrderRequest,
  PurchaseOrderResponse,
  PurchaseOrderListResponse,
  PurchaseOrderStatusUpdateRequest,
  ReceiveItemsRequest,
  PurchaseOrderFilters,
  PurchaseOrderStats,
} from '../types/purchaseOrder';

class PurchaseOrderService {
  // Get all purchase orders with pagination and filters
  async getPurchaseOrders(filters?: PurchaseOrderFilters): Promise<PurchaseOrderListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.supplierId) params.append('supplierId', filters.supplierId.toString());
    if (filters?.warehouseId) params.append('warehouseId', filters.warehouseId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.size) params.append('size', filters.size.toString());

    const url = `/purchase-orders${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  }

  // Get purchase order by ID
  async getPurchaseOrderById(id: number): Promise<PurchaseOrderResponse> {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  }

  // Get purchase order by PO number
  async getPurchaseOrderByPoNumber(poNumber: string): Promise<PurchaseOrderResponse> {
    const response = await api.get(`/purchase-orders/po-number/${poNumber}`);
    return response.data;
  }

  // Get purchase orders by supplier
  async getPurchaseOrdersBySupplier(supplierId: number): Promise<PurchaseOrderListResponse> {
    const response = await api.get(`/purchase-orders/supplier/${supplierId}`);
    return response.data;
  }

  // Get purchase orders by warehouse
  async getPurchaseOrdersByWarehouse(warehouseId: number): Promise<PurchaseOrderListResponse> {
    const response = await api.get(`/purchase-orders/warehouse/${warehouseId}`);
    return response.data;
  }

  // Get purchase orders by status
  async getPurchaseOrdersByStatus(status: string): Promise<PurchaseOrderListResponse> {
    const response = await api.get(`/purchase-orders/status/${status}`);
    return response.data;
  }

  // Create new purchase order
  async createPurchaseOrder(data: PurchaseOrderRequest): Promise<PurchaseOrderResponse> {
    const response = await api.post('/purchase-orders', data);
    return response.data;
  }

  // Update purchase order status
  async updatePurchaseOrderStatus(
    id: number, 
    data: PurchaseOrderStatusUpdateRequest
  ): Promise<PurchaseOrderResponse> {
    const response = await api.put(`/purchase-orders/${id}/status`, data);
    return response.data;
  }

  // Receive items for a purchase order
  async receivePurchaseOrder(id: number, data: ReceiveItemsRequest): Promise<PurchaseOrderResponse> {
    const response = await api.post(`/purchase-orders/${id}/receive`, data);
    return response.data;
  }

  // Get purchase order count
  async getPurchaseOrderCount(): Promise<{ success: boolean; data: number; message: string }> {
    const response = await api.get('/purchase-orders/count');
    return response.data;
  }

  // Get purchase order count by status
  async getPurchaseOrderCountByStatus(status: string): Promise<{ success: boolean; data: number; message: string }> {
    const response = await api.get(`/purchase-orders/count/status/${status}`);
    return response.data;
  }

  // Get purchase order count by supplier
  async getPurchaseOrderCountBySupplier(supplierId: number): Promise<{ success: boolean; data: number; message: string }> {
    const response = await api.get(`/purchase-orders/count/supplier/${supplierId}`);
    return response.data;
  }

  // Get purchase order count by warehouse
  async getPurchaseOrderCountByWarehouse(warehouseId: number): Promise<{ success: boolean; data: number; message: string }> {
    const response = await api.get(`/purchase-orders/count/warehouse/${warehouseId}`);
    return response.data;
  }

  // Get purchase order statistics (custom method for dashboard)
  async getPurchaseOrderStats(): Promise<PurchaseOrderStats> {
    try {
      // Get all purchase orders to calculate stats
      const ordersResponse = await this.getPurchaseOrders({ size: 1000 });
      const orders = ordersResponse.data;

      const stats: PurchaseOrderStats = {
        totalOrders: orders.length,
        totalValue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
        pendingOrders: orders.filter(order => 
          ['DRAFT', 'SUBMITTED', 'APPROVED', 'ORDERED'].includes(order.status)
        ).length,
        overdueOrders: orders.filter(order => {
          if (!order.expectedDeliveryDate) return false;
          const expectedDate = new Date(order.expectedDeliveryDate);
          const today = new Date();
          return expectedDate < today && !['FULLY_RECEIVED', 'CANCELLED', 'CLOSED'].includes(order.status);
        }).length,
        ordersByStatus: {
          DRAFT: 0,
          SUBMITTED: 0,
          APPROVED: 0,
          ORDERED: 0,
          PARTIALLY_RECEIVED: 0,
          FULLY_RECEIVED: 0,
          CANCELLED: 0,
          CLOSED: 0,
        }
      };

      // Count orders by status
      orders.forEach(order => {
        stats.ordersByStatus[order.status]++;
      });

      return stats;
    } catch (error) {
      console.error('Error getting purchase order stats:', error);
      return {
        totalOrders: 0,
        totalValue: 0,
        pendingOrders: 0,
        overdueOrders: 0,
        ordersByStatus: {
          DRAFT: 0,
          SUBMITTED: 0,
          APPROVED: 0,
          ORDERED: 0,
          PARTIALLY_RECEIVED: 0,
          FULLY_RECEIVED: 0,
          CANCELLED: 0,
          CLOSED: 0,
        }
      };
    }
  }

  // Get purchase orders for dashboard (recent orders)
  async getRecentPurchaseOrders(limit: number = 5): Promise<PurchaseOrder[]> {
    try {
      const response = await this.getPurchaseOrders({ size: limit });
      return response.data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting recent purchase orders:', error);
      return [];
    }
  }

  // Get pending purchase orders
  async getPendingPurchaseOrders(): Promise<PurchaseOrder[]> {
    try {
      const response = await this.getPurchaseOrders({ 
        status: 'ORDERED',
        size: 100 
      });
      return response.data.filter(order => 
        ['DRAFT', 'SUBMITTED', 'APPROVED', 'ORDERED'].includes(order.status)
      );
    } catch (error) {
      console.error('Error getting pending purchase orders:', error);
      return [];
    }
  }

  // Get overdue purchase orders
  async getOverduePurchaseOrders(): Promise<PurchaseOrder[]> {
    try {
      const response = await this.getPurchaseOrders({ size: 100 });
      return response.data.filter(order => {
        if (!order.expectedDeliveryDate) return false;
        const expectedDate = new Date(order.expectedDeliveryDate);
        const today = new Date();
        return expectedDate < today && !['FULLY_RECEIVED', 'CANCELLED', 'CLOSED'].includes(order.status);
      });
    } catch (error) {
      console.error('Error getting overdue purchase orders:', error);
      return [];
    }
  }
}

export default new PurchaseOrderService(); 