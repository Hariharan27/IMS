# Inventory Management System - API Specification

## 1. API Overview

### 1.1 Base URL
```
Development: http://localhost:8080/api/v1
Production: https://api.inventory-system.com/api/v1
```

### 1.2 Authentication
All API endpoints (except authentication) require JWT Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

### 1.3 Response Format
All API responses follow a consistent format:

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 1.4 HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## 2. Authentication APIs

### 2.1 Login
**POST** `/auth/login`

Authenticate user and return JWT token.

#### Request Body
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@inventory.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    }
  },
  "message": "Login successful"
}
```

### 2.2 Register
**POST** `/auth/register`

Register a new user (Admin only).

#### Request Body
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STAFF"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STAFF"
  },
  "message": "User registered successfully"
}
```

### 2.3 Refresh Token
**POST** `/auth/refresh`

Refresh JWT token using refresh token.

#### Request Body
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here",
    "refreshToken": "new_refresh_token_here"
  },
  "message": "Token refreshed successfully"
}
```

## 3. Product Management APIs

### 3.1 Get All Products
**GET** `/products`

Get paginated list of products with optional filtering.

#### Query Parameters
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20, max: 100)
- `search` (optional): Search by name, SKU, or brand
- `categoryId` (optional): Filter by category
- `isActive` (optional): Filter by active status

#### Response
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "sku": "PROD001",
        "name": "Laptop Computer",
        "description": "High-performance laptop",
        "category": {
          "id": 1,
          "name": "Electronics"
        },
        "brand": "Dell",
        "model": "XPS 13",
        "weight": 1.2,
        "dimensions": "12.4 x 8.7 x 0.6 inches",
        "unitOfMeasure": "PCS",
        "costPrice": 800.00,
        "sellingPrice": 1200.00,
        "reorderPoint": 10,
        "reorderQuantity": 50,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "totalElements": 100,
    "totalPages": 5,
    "currentPage": 0,
    "size": 20
  },
  "message": "Products retrieved successfully"
}
```

### 3.2 Get Product by ID
**GET** `/products/{id}`

Get a specific product by ID.

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sku": "PROD001",
    "name": "Laptop Computer",
    "description": "High-performance laptop",
    "category": {
      "id": 1,
      "name": "Electronics"
    },
    "brand": "Dell",
    "model": "XPS 13",
    "weight": 1.2,
    "dimensions": "12.4 x 8.7 x 0.6 inches",
    "unitOfMeasure": "PCS",
    "costPrice": 800.00,
    "sellingPrice": 1200.00,
    "reorderPoint": 10,
    "reorderQuantity": 50,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Product retrieved successfully"
}
```

### 3.3 Create Product
**POST** `/products`

Create a new product.

#### Request Body
```json
{
  "sku": "PROD002",
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "categoryId": 1,
  "brand": "Logitech",
  "model": "MX Master 3",
  "weight": 0.141,
  "dimensions": "5.0 x 3.4 x 2.0 inches",
  "unitOfMeasure": "PCS",
  "costPrice": 45.00,
  "sellingPrice": 79.99,
  "reorderPoint": 20,
  "reorderQuantity": 100
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 2,
    "sku": "PROD002",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "category": {
      "id": 1,
      "name": "Electronics"
    },
    "brand": "Logitech",
    "model": "MX Master 3",
    "weight": 0.141,
    "dimensions": "5.0 x 3.4 x 2.0 inches",
    "unitOfMeasure": "PCS",
    "costPrice": 45.00,
    "sellingPrice": 79.99,
    "reorderPoint": 20,
    "reorderQuantity": 100,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Product created successfully"
}
```

### 3.4 Update Product
**PUT** `/products/{id}`

Update an existing product.

#### Request Body
```json
{
  "name": "Updated Laptop Computer",
  "description": "Updated description",
  "sellingPrice": 1250.00,
  "reorderPoint": 15
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sku": "PROD001",
    "name": "Updated Laptop Computer",
    "description": "Updated description",
    "category": {
      "id": 1,
      "name": "Electronics"
    },
    "brand": "Dell",
    "model": "XPS 13",
    "weight": 1.2,
    "dimensions": "12.4 x 8.7 x 0.6 inches",
    "unitOfMeasure": "PCS",
    "costPrice": 800.00,
    "sellingPrice": 1250.00,
    "reorderPoint": 15,
    "reorderQuantity": 50,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  },
  "message": "Product updated successfully"
}
```

### 3.5 Delete Product
**DELETE** `/products/{id}`

Soft delete a product (sets isActive to false).

#### Response
```json
{
  "success": true,
  "data": null,
  "message": "Product deleted successfully"
}
```

## 4. Inventory Management APIs

### 4.1 Get Inventory Summary
**GET** `/inventory`

Get inventory summary across all warehouses.

#### Query Parameters
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20, max: 100)
- `productId` (optional): Filter by product ID
- `warehouseId` (optional): Filter by warehouse ID
- `stockStatus` (optional): Filter by stock status (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)

#### Response
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "productId": 1,
        "productSku": "PROD001",
        "productName": "Laptop Computer",
        "categoryName": "Electronics",
        "warehouseId": 1,
        "warehouseName": "Main Warehouse",
        "quantityOnHand": 25,
        "quantityReserved": 5,
        "quantityAvailable": 20,
        "reorderPoint": 10,
        "reorderQuantity": 50,
        "stockStatus": "IN_STOCK",
        "lastUpdatedAt": "2024-01-01T12:00:00Z"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  },
  "message": "Inventory summary retrieved successfully"
}
```

### 4.2 Get Inventory by Product
**GET** `/inventory/product/{productId}`

Get inventory details for a specific product across all warehouses.

#### Response
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "sku": "PROD001",
      "name": "Laptop Computer"
    },
    "inventory": [
      {
        "warehouseId": 1,
        "warehouseName": "Main Warehouse",
        "quantityOnHand": 25,
        "quantityReserved": 5,
        "quantityAvailable": 20,
        "lastUpdatedAt": "2024-01-01T12:00:00Z"
      },
      {
        "warehouseId": 2,
        "warehouseName": "Secondary Warehouse",
        "quantityOnHand": 10,
        "quantityReserved": 0,
        "quantityAvailable": 10,
        "lastUpdatedAt": "2024-01-01T10:00:00Z"
      }
    ]
  },
  "message": "Product inventory retrieved successfully"
}
```

### 4.3 Update Inventory
**POST** `/inventory/update`

Update inventory quantities (add/remove stock).

#### Request Body
```json
{
  "productId": 1,
  "warehouseId": 1,
  "quantityChange": 10,
  "movementType": "IN",
  "referenceType": "PURCHASE_ORDER",
  "referenceId": 123,
  "notes": "Received from purchase order PO-001"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "productId": 1,
    "warehouseId": 1,
    "quantityOnHand": 35,
    "quantityReserved": 5,
    "quantityAvailable": 30,
    "lastUpdatedAt": "2024-01-01T12:30:00Z"
  },
  "message": "Inventory updated successfully"
}
```

### 4.4 Get Stock Movements
**GET** `/inventory/movements`

Get stock movement history.

#### Query Parameters
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20, max: 100)
- `productId` (optional): Filter by product ID
- `warehouseId` (optional): Filter by warehouse ID
- `movementType` (optional): Filter by movement type (IN, OUT, TRANSFER, ADJUSTMENT)
- `startDate` (optional): Filter by start date (ISO format)
- `endDate` (optional): Filter by end date (ISO format)

#### Response
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "productId": 1,
        "productSku": "PROD001",
        "productName": "Laptop Computer",
        "warehouseId": 1,
        "warehouseName": "Main Warehouse",
        "movementType": "IN",
        "quantity": 10,
        "referenceType": "PURCHASE_ORDER",
        "referenceId": 123,
        "notes": "Received from purchase order PO-001",
        "movementDate": "2024-01-01T12:30:00Z",
        "createdBy": {
          "id": 1,
          "username": "admin",
          "firstName": "Admin",
          "lastName": "User"
        }
      }
    ],
    "totalElements": 100,
    "totalPages": 5,
    "currentPage": 0,
    "size": 20
  },
  "message": "Stock movements retrieved successfully"
}
```

## 5. Purchase Order Management APIs

### 5.1 Get All Purchase Orders
**GET** `/purchase-orders`

Get paginated list of purchase orders.

#### Query Parameters
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20, max: 100)
- `status` (optional): Filter by status (DRAFT, SUBMITTED, APPROVED, RECEIVED, CANCELLED)
- `supplierId` (optional): Filter by supplier ID
- `warehouseId` (optional): Filter by warehouse ID
- `startDate` (optional): Filter by start date (ISO format)
- `endDate` (optional): Filter by end date (ISO format)

#### Response
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "poNumber": "PO-001",
        "supplier": {
          "id": 1,
          "name": "Dell Inc.",
          "code": "DELL001"
        },
        "warehouse": {
          "id": 1,
          "name": "Main Warehouse",
          "code": "MW001"
        },
        "orderDate": "2024-01-01",
        "expectedDeliveryDate": "2024-01-15",
        "status": "APPROVED",
        "totalAmount": 12000.00,
        "notes": "Laptop order for Q1",
        "itemCount": 2,
        "totalQuantityOrdered": 10,
        "totalQuantityReceived": 0,
        "createdBy": {
          "id": 1,
          "username": "admin",
          "firstName": "Admin",
          "lastName": "User"
        },
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T12:00:00Z"
      }
    ],
    "totalElements": 25,
    "totalPages": 2,
    "currentPage": 0,
    "size": 20
  },
  "message": "Purchase orders retrieved successfully"
}
```

### 5.2 Get Purchase Order by ID
**GET** `/purchase-orders/{id}`

Get a specific purchase order with its items.

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "poNumber": "PO-001",
    "supplier": {
      "id": 1,
      "name": "Dell Inc.",
      "code": "DELL001"
    },
    "warehouse": {
      "id": 1,
      "name": "Main Warehouse",
      "code": "MW001"
    },
    "orderDate": "2024-01-01",
    "expectedDeliveryDate": "2024-01-15",
    "status": "APPROVED",
    "totalAmount": 12000.00,
    "notes": "Laptop order for Q1",
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "sku": "PROD001",
          "name": "Laptop Computer"
        },
        "quantityOrdered": 5,
        "quantityReceived": 0,
        "unitPrice": 1200.00,
        "totalPrice": 6000.00,
        "notes": "Dell XPS 13 laptops"
      },
      {
        "id": 2,
        "product": {
          "id": 2,
          "sku": "PROD002",
          "name": "Wireless Mouse"
        },
        "quantityOrdered": 5,
        "quantityReceived": 0,
        "unitPrice": 79.99,
        "totalPrice": 399.95,
        "notes": "Logitech MX Master 3"
      }
    ],
    "createdBy": {
      "id": 1,
      "username": "admin",
      "firstName": "Admin",
      "lastName": "User"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  },
  "message": "Purchase order retrieved successfully"
}
```

### 5.3 Create Purchase Order
**POST** `/purchase-orders`

Create a new purchase order.

#### Request Body
```json
{
  "supplierId": 1,
  "warehouseId": 1,
  "orderDate": "2024-01-01",
  "expectedDeliveryDate": "2024-01-15",
  "notes": "Laptop order for Q1",
  "items": [
    {
      "productId": 1,
      "quantityOrdered": 5,
      "unitPrice": 1200.00,
      "notes": "Dell XPS 13 laptops"
    },
    {
      "productId": 2,
      "quantityOrdered": 5,
      "unitPrice": 79.99,
      "notes": "Logitech MX Master 3"
    }
  ]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 2,
    "poNumber": "PO-002",
    "supplier": {
      "id": 1,
      "name": "Dell Inc.",
      "code": "DELL001"
    },
    "warehouse": {
      "id": 1,
      "name": "Main Warehouse",
      "code": "MW001"
    },
    "orderDate": "2024-01-01",
    "expectedDeliveryDate": "2024-01-15",
    "status": "DRAFT",
    "totalAmount": 6399.95,
    "notes": "Laptop order for Q1",
    "itemCount": 2,
    "totalQuantityOrdered": 10,
    "totalQuantityReceived": 0,
    "createdBy": {
      "id": 1,
      "username": "admin",
      "firstName": "Admin",
      "lastName": "User"
    },
    "createdAt": "2024-01-01T13:00:00Z",
    "updatedAt": "2024-01-01T13:00:00Z"
  },
  "message": "Purchase order created successfully"
}
```

### 5.4 Update Purchase Order Status
**PUT** `/purchase-orders/{id}/status`

Update the status of a purchase order.

#### Request Body
```json
{
  "status": "APPROVED",
  "notes": "Approved by manager"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "poNumber": "PO-001",
    "status": "APPROVED",
    "updatedAt": "2024-01-01T14:00:00Z"
  },
  "message": "Purchase order status updated successfully"
}
```

### 5.5 Receive Purchase Order
**POST** `/purchase-orders/{id}/receive`

Receive items from a purchase order.

#### Request Body
```json
{
  "receivedItems": [
    {
      "itemId": 1,
      "quantityReceived": 3,
      "notes": "Received 3 laptops"
    },
    {
      "itemId": 2,
      "quantityReceived": 5,
      "notes": "Received all mice"
    }
  ]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "poNumber": "PO-001",
    "status": "PARTIALLY_RECEIVED",
    "totalQuantityReceived": 8,
    "updatedAt": "2024-01-01T15:00:00Z"
  },
  "message": "Purchase order items received successfully"
}
```

## 6. Reporting APIs

### 6.1 Inventory Turnover Report
**GET** `/reports/inventory-turnover`

Get inventory turnover analysis.

#### Query Parameters
- `startDate` (optional): Start date for analysis (ISO format)
- `endDate` (optional): End date for analysis (ISO format)
- `categoryId` (optional): Filter by category
- `warehouseId` (optional): Filter by warehouse

#### Response
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalProducts": 100,
      "averageTurnoverRate": 4.5,
      "totalValue": 150000.00
    },
    "products": [
      {
        "productId": 1,
        "productSku": "PROD001",
        "productName": "Laptop Computer",
        "categoryName": "Electronics",
        "beginningInventory": 20,
        "endingInventory": 15,
        "averageInventory": 17.5,
        "turnoverRate": 5.2,
        "daysToSell": 70,
        "totalValue": 18000.00
      }
    ]
  },
  "message": "Inventory turnover report generated successfully"
}
```

### 6.2 Stock Valuation Report
**GET** `/reports/stock-valuation`

Get current stock valuation.

#### Query Parameters
- `categoryId` (optional): Filter by category
- `warehouseId` (optional): Filter by warehouse
- `valuationMethod` (optional): COST or SELLING (default: COST)

#### Response
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalValue": 150000.00,
      "totalItems": 500,
      "averageValuePerItem": 300.00
    },
    "categories": [
      {
        "categoryId": 1,
        "categoryName": "Electronics",
        "totalValue": 80000.00,
        "itemCount": 150,
        "percentage": 53.33
      }
    ],
    "warehouses": [
      {
        "warehouseId": 1,
        "warehouseName": "Main Warehouse",
        "totalValue": 100000.00,
        "itemCount": 300,
        "percentage": 66.67
      }
    ]
  },
  "message": "Stock valuation report generated successfully"
}
```

### 6.3 Trends Report
**GET** `/reports/trends`

Get inventory trends over time.

#### Query Parameters
- `startDate` (required): Start date for analysis (ISO format)
- `endDate` (required): End date for analysis (ISO format)
- `interval` (optional): DAY, WEEK, MONTH (default: MONTH)
- `productId` (optional): Filter by specific product

#### Response
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "period": "2024-01",
        "totalValue": 150000.00,
        "totalItems": 500,
        "movementsIn": 100,
        "movementsOut": 80,
        "turnoverRate": 4.5
      },
      {
        "period": "2024-02",
        "totalValue": 160000.00,
        "totalItems": 520,
        "movementsIn": 120,
        "movementsOut": 100,
        "turnoverRate": 4.8
      }
    ]
  },
  "message": "Trends report generated successfully"
}
```

## 7. Alert Management APIs

### 7.1 Get Alerts
**GET** `/alerts`

Get system alerts and notifications.

#### Query Parameters
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20, max: 100)
- `alertType` (optional): Filter by alert type (LOW_STOCK, OUT_OF_STOCK, REORDER_POINT)
- `severity` (optional): Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
- `isAcknowledged` (optional): Filter by acknowledgment status

#### Response
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "alertType": "LOW_STOCK",
        "product": {
          "id": 1,
          "sku": "PROD001",
          "name": "Laptop Computer"
        },
        "warehouse": {
          "id": 1,
          "name": "Main Warehouse"
        },
        "message": "Low stock alert: Laptop Computer at Main Warehouse (Available: 5, Reorder Point: 10)",
        "severity": "HIGH",
        "isAcknowledged": false,
        "createdAt": "2024-01-01T12:00:00Z"
      }
    ],
    "totalElements": 10,
    "totalPages": 1,
    "currentPage": 0,
    "size": 20
  },
  "message": "Alerts retrieved successfully"
}
```

### 7.2 Acknowledge Alert
**POST** `/alerts/{id}/acknowledge`

Acknowledge an alert.

#### Request Body
```json
{
  "notes": "Order placed with supplier"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isAcknowledged": true,
    "acknowledgedAt": "2024-01-01T13:00:00Z",
    "acknowledgedBy": {
      "id": 1,
      "username": "admin",
      "firstName": "Admin",
      "lastName": "User"
    }
  },
  "message": "Alert acknowledged successfully"
}
```

### 7.3 Get Alert Configuration
**GET** `/alerts/config`

Get alert configuration settings.

#### Response
```json
{
  "success": true,
  "data": {
    "lowStockThreshold": 10,
    "criticalStockThreshold": 0,
    "emailNotifications": true,
    "dashboardNotifications": true,
    "notificationFrequency": "DAILY"
  },
  "message": "Alert configuration retrieved successfully"
}
```

## 8. Supporting APIs

### 8.1 Get Categories
**GET** `/categories`

Get all product categories.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "parentId": null,
      "isActive": true
    },
    {
      "id": 2,
      "name": "Laptops",
      "description": "Portable computers",
      "parentId": 1,
      "isActive": true
    }
  ],
  "message": "Categories retrieved successfully"
}
```

### 8.2 Get Warehouses
**GET** `/warehouses`

Get all warehouses.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Main Warehouse",
      "code": "MW001",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "postalCode": "10001",
      "phone": "+1-555-123-4567",
      "email": "main@warehouse.com",
      "manager": {
        "id": 1,
        "username": "admin",
        "firstName": "Admin",
        "lastName": "User"
      },
      "isActive": true
    }
  ],
  "message": "Warehouses retrieved successfully"
}
```

### 8.3 Get Suppliers
**GET** `/suppliers`

Get all suppliers.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dell Inc.",
      "code": "DELL001",
      "contactPerson": "John Smith",
      "email": "orders@dell.com",
      "phone": "+1-555-987-6543",
      "address": "456 Business Ave",
      "city": "Austin",
      "state": "TX",
      "country": "USA",
      "postalCode": "73301",
      "paymentTerms": "Net 30",
      "isActive": true
    }
  ],
  "message": "Suppliers retrieved successfully"
}
```

## 9. Error Codes

### 9.1 Common Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `DUPLICATE_RESOURCE` - Resource already exists
- `INVALID_STATUS_TRANSITION` - Invalid status change
- `INSUFFICIENT_STOCK` - Not enough stock available
- `SYSTEM_ERROR` - Internal server error

### 9.2 Field Validation Errors
- `REQUIRED_FIELD` - Required field is missing
- `INVALID_FORMAT` - Invalid data format
- `MIN_VALUE` - Value below minimum
- `MAX_VALUE` - Value above maximum
- `UNIQUE_CONSTRAINT` - Value must be unique
- `FOREIGN_KEY_CONSTRAINT` - Referenced resource not found

## 10. Rate Limiting

### 10.1 Rate Limits
- **Authentication endpoints**: 5 requests per minute
- **Read operations**: 100 requests per minute
- **Write operations**: 20 requests per minute
- **Reporting endpoints**: 10 requests per minute

### 10.2 Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 11. API Versioning

### 11.1 Version Strategy
- **URL Versioning**: `/api/v1/`, `/api/v2/`
- **Backward Compatibility**: Maintained for at least 6 months
- **Deprecation Notice**: 3 months advance notice
- **Breaking Changes**: New major version required

### 11.2 Version Headers
```
Accept: application/vnd.inventory.v1+json
Content-Type: application/vnd.inventory.v1+json
``` 