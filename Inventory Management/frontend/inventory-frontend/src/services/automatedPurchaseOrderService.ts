import api from './api';

export interface AutomatedPORequest {
  productId: number;
  productName: string;
  supplierId: number;
  supplierName: string;
  warehouseId: number;
  warehouseName: string;
  suggestedQuantity: number;
  unitPrice: number;
  estimatedCost: number;
  expectedDeliveryDate: string;
}

export interface AutomatedPOStatus {
  automatedWorkflow: {
    schedule: string;
    lastRun: string;
    nextRun: string;
    enabled: boolean;
  };
  businessRules: {
    lowStockThreshold: string;
    minimumOrderQuantity: string;
    leadTime: string;
    safetyStock: string;
  };
  automationFeatures: {
    demandAnalysis: string;
    supplierSelection: string;
    quantityCalculation: string;
    costEstimation: string;
  };
}

class AutomatedPurchaseOrderService {
  // Manually trigger automated PO generation
  async generateAutomatedPOs(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/automated-purchase-orders/generate');
      return response.data;
    } catch (error) {
      console.error('Error generating automated POs:', error);
      throw error;
    }
  }

  // Generate automated PO for specific product
  async generateAutomatedPOForProduct(
    productId: number, 
    warehouseId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/automated-purchase-orders/generate/${productId}/${warehouseId}`);
      return response.data;
    } catch (error) {
      console.error('Error generating automated PO for product:', error);
      throw error;
    }
  }

  // Get automated PO status and configuration
  async getAutomatedPOStatus(): Promise<{ success: boolean; data: AutomatedPOStatus; message: string }> {
    try {
      const response = await api.get('/automated-purchase-orders/status');
      return response.data;
    } catch (error) {
      console.error('Error getting automated PO status:', error);
      throw error;
    }
  }

  // Get low stock products that need automated POs
  async getLowStockProducts(): Promise<{ success: boolean; data: any[]; message: string }> {
    try {
      const response = await api.get('/inventory/low-stock');
      return response.data;
    } catch (error) {
      console.error('Error getting low stock products:', error);
      throw error;
    }
  }

  // Get demand forecast for a product
  async getDemandForecast(productId: number): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const response = await api.get(`/business-workflows/demand-forecast/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting demand forecast:', error);
      throw error;
    }
  }

  // Get reorder suggestions
  async getReorderSuggestions(): Promise<{ success: boolean; data: any[]; message: string }> {
    try {
      const response = await api.get('/business-workflows/reorder-suggestions');
      return response.data;
    } catch (error) {
      console.error('Error getting reorder suggestions:', error);
      throw error;
    }
  }
}

export default new AutomatedPurchaseOrderService(); 