# Frontend Feature Implementation Prompts

## Prompt 1: Authentication & User Management System

Create a comprehensive authentication and user management system for an inventory management application using React 18+ with TypeScript, Material-UI, and TailwindCSS. The system should include:

**Core Features:**
- User login with JWT authentication
- User registration with role selection (ADMIN, MANAGER, STAFF)
- User profile management
- User management dashboard for administrators
- Protected routes with role-based access control
- Secure token storage and automatic refresh

**Technical Stack:**
- React 18+ with TypeScript
- Vite as build tool
- Material-UI (MUI) for components
- TailwindCSS for custom styling
- React Router v6 for routing
- Axios for API communication
- React Hook Form + Zod for validation
- JWT authentication integration

**Key Components:**
- LoginForm with username/email and password fields
- RegisterForm with comprehensive user registration
- UserProfile for viewing and editing user information
- UserManagement dashboard for admin operations
- MainLayout with responsive navigation
- ProtectedRoute component for authentication guards

**API Integration:**
- POST /api/auth/login - User authentication
- POST /api/auth/register - User registration
- GET /api/users - List all users (Admin)
- GET /api/users/{id} - Get user details
- PUT /api/users/{id} - Update user information
- DELETE /api/users/{id} - Delete user (Admin)

**Requirements:**
- Responsive design for all screen sizes
- Form validation with real-time feedback
- Loading states and error handling
- Accessibility compliance (WCAG 2.1)
- Dark/light mode support
- Secure token management

---

## Prompt 2: Dashboard & Analytics System

Build a comprehensive dashboard and analytics system for the inventory management application with real-time data visualization and interactive charts.

**Core Features:**
- Real-time dashboard with key metrics
- Interactive charts and graphs
- Activity feed with recent system events
- Alert panel for system notifications
- Quick action buttons for common tasks
- Responsive grid layout

**Technical Stack:**
- React 18+ with TypeScript
- Material-UI (MUI) for components
- TailwindCSS for styling
- Chart.js or Recharts for data visualization
- Axios for API communication
- React Query for data fetching

**Key Components:**
- Dashboard main page with grid layout
- MetricsCard for displaying key performance indicators
- ActivityFeed for recent system activities
- AlertPanel for system alerts and notifications
- QuickActions for common user actions
- Chart components (InventoryChart, StockMovementChart, TopProductsChart, WarehouseChart)

**Dashboard Metrics:**
- Total products count
- Low stock alerts
- Recent stock movements
- Top performing products
- Warehouse utilization
- Purchase order status summary

**API Integration:**
- GET /api/dashboard/metrics - Dashboard metrics
- GET /api/dashboard/activity - Recent activities
- GET /api/dashboard/alerts - System alerts
- GET /api/dashboard/charts - Chart data

**Requirements:**
- Real-time data updates
- Interactive charts with tooltips
- Responsive design for all devices
- Loading states and error handling
- Export functionality for reports
- Customizable dashboard layout

---

## Prompt 3: Product Management System

Develop a comprehensive product management system with advanced search, filtering, and CRUD operations for managing the product catalog.

**Core Features:**
- Product listing with pagination and search
- Create, edit, and delete products
- Advanced filtering and sorting
- Bulk operations (import/export)
- Product image upload
- Category and supplier management integration

**Technical Stack:**
- React 18+ with TypeScript
- Material-UI (MUI) for components
- TailwindCSS for styling
- React Hook Form + Zod for validation
- Axios for API communication
- File upload handling

**Key Components:**
- ProductManagement main page
- ProductList with data table
- ProductForm for create/edit operations
- ProductCard for product display
- ProductFilters for advanced filtering
- ProductSearch with real-time search
- ProductBulkActions for bulk operations

**Product Features:**
- SKU and product name management
- Category and supplier relationships
- Pricing (cost and selling price)
- Inventory levels and reorder points
- Product status (active/inactive)
- Image upload and management

**API Integration:**
- GET /api/products - List products with pagination
- GET /api/products/{id} - Get product details
- POST /api/products - Create new product
- PUT /api/products/{id} - Update product
- DELETE /api/products/{id} - Delete product
- GET /api/categories - Get categories
- GET /api/suppliers - Get suppliers

**Requirements:**
- Advanced search with multiple criteria
- Real-time filtering and sorting
- Form validation with comprehensive rules
- Image upload with preview
- Bulk import/export functionality
- Responsive design for all devices
- Loading states and error handling

---

## Prompt 4: Inventory Management System

Create an inventory management system for tracking stock levels, movements, and warehouse operations with real-time updates.

**Core Features:**
- Stock level monitoring
- Stock movement tracking
- Warehouse management
- Inventory alerts and notifications
- Stock adjustment operations
- Inventory reports and analytics

**Technical Stack:**
- React 18+ with TypeScript
- Material-UI (MUI) for components
- TailwindCSS for styling
- React Hook Form + Zod for validation
- Axios for API communication
- Real-time updates

**Key Components:**
- InventoryManagement main page
- StockLevelDisplay for current inventory
- StockMovementForm for recording movements
- WarehouseSelector for warehouse operations
- InventoryAlerts for low stock notifications
- InventoryReports for analytics

**Inventory Features:**
- Real-time stock level tracking
- Stock movement history
- Warehouse location management
- Reorder point monitoring
- Stock adjustment operations
- Inventory valuation

**API Integration:**
- GET /api/inventory - Get inventory levels
- GET /api/inventory/movements - Get stock movements
- POST /api/inventory/movements - Record stock movement
- GET /api/warehouses - Get warehouse list
- PUT /api/inventory/{id} - Update inventory

**Requirements:**
- Real-time stock level updates
- Comprehensive movement tracking
- Warehouse management integration
- Alert system for low stock
- Inventory valuation calculations
- Responsive design for all devices
- Export functionality for reports

---

## Prompt 5: Purchase Order Management System

Build a comprehensive purchase order management system for creating, tracking, and managing purchase orders with suppliers.

**Core Features:**
- Purchase order creation and management
- Supplier selection and management
- Order status tracking
- Item management within orders
- Order approval workflow
- Purchase order history

**Technical Stack:**
- React 18+ with TypeScript
- Material-UI (MUI) for components
- TailwindCSS for styling
- React Hook Form + Zod for validation
- Axios for API communication
- State management for complex forms

**Key Components:**
- PurchaseOrderManagement main page
- PurchaseOrderForm for creating orders
- PurchaseOrderList with status tracking
- PurchaseOrderDetail for order details
- SupplierSelector for supplier management
- OrderStatusTracker for status updates

**Purchase Order Features:**
- Multi-item order creation
- Supplier selection and contact info
- Order status management (DRAFT, ORDERED, RECEIVED, CANCELLED)
- Order approval workflow
- Delivery date tracking
- Cost calculations and totals

**API Integration:**
- GET /api/purchase-orders - List purchase orders
- GET /api/purchase-orders/{id} - Get order details
- POST /api/purchase-orders - Create new order
- PUT /api/purchase-orders/{id} - Update order
- PUT /api/purchase-orders/{id}/status - Update order status
- GET /api/suppliers - Get supplier list

**Requirements:**
- Complex form handling with multiple items
- Order status workflow management
- Supplier integration
- Cost calculations and totals
- Order approval process
- Responsive design for all devices
- Export functionality for orders

---

## Prompt 6: Supplier Management System

Develop a supplier management system for maintaining supplier information, contact details, and performance tracking.

**Core Features:**
- Supplier registration and management
- Contact information management
- Supplier performance tracking
- Supplier categorization
- Contact history tracking
- Supplier evaluation system

**Technical Stack:**
- React 18+ with TypeScript
- Material-UI (MUI) for components
- TailwindCSS for styling
- React Hook Form + Zod for validation
- Axios for API communication
- Data visualization for performance metrics

**Key Components:**
- SupplierManagement main page
- SupplierForm for supplier registration
- SupplierList with performance metrics
- SupplierDetail for comprehensive information
- SupplierPerformanceChart for analytics
- ContactHistory for communication tracking

**Supplier Features:**
- Supplier profile management
- Contact information and addresses
- Performance metrics and ratings
- Order history and statistics
- Communication history
- Supplier categorization

**API Integration:**
- GET /api/suppliers - List suppliers
- GET /api/suppliers/{id} - Get supplier details
- POST /api/suppliers - Create new supplier
- PUT /api/suppliers/{id} - Update supplier
- DELETE /api/suppliers/{id} - Delete supplier
- GET /api/suppliers/{id}/performance - Get performance metrics

**Requirements:**
- Comprehensive supplier profiles
- Performance tracking and analytics
- Contact history management
- Supplier categorization
- Export functionality for supplier data
- Responsive design for all devices
- Search and filtering capabilities

---

## Prompt 7: Category Management System

Create a category management system for organizing products into hierarchical categories with full CRUD operations.

**Core Features:**
- Category creation and management
- Hierarchical category structure
- Category-product relationships
- Category statistics and analytics
- Bulk category operations
- Category import/export

**Technical Stack:**
- React 18+ with TypeScript
- Material-UI (MUI) for components
- TailwindCSS for styling
- React Hook Form + Zod for validation
- Axios for API communication
- Tree structure for hierarchical display

**Key Components:**
- CategoryManagement main page
- CategoryForm for category creation
- CategoryTree for hierarchical display
- CategoryList with statistics
- CategoryDetail for category information
- CategoryBulkActions for bulk operations

**Category Features:**
- Hierarchical category structure
- Category description and metadata
- Product count per category
- Category status management
- Parent-child relationships
- Category statistics

**API Integration:**
- GET /api/categories - List categories
- GET /api/categories/{id} - Get category details
- POST /api/categories - Create new category
- PUT /api/categories/{id} - Update category
- DELETE /api/categories/{id} - Delete category
- GET /api/categories/{id}/products - Get category products

**Requirements:**
- Hierarchical category display
- Drag-and-drop category organization
- Category statistics and analytics
- Bulk operations for categories
- Category import/export functionality
- Responsive design for all devices
- Search and filtering capabilities

---

## Prompt 8: Alert Management System

Build an alert management system for monitoring system events, inventory alerts, and user notifications.

**Core Features:**
- System alert monitoring
- Inventory alert management
- User notification system
- Alert configuration and rules
- Alert history and analytics
- Alert acknowledgment system

**Technical Stack:**
- React 18+ with TypeScript
- Material-UI (MUI) for components
- TailwindCSS for styling
- Real-time updates with WebSocket or polling
- Axios for API communication
- Notification system integration

**Key Components:**
- AlertManagement main page
- AlertList with filtering options
- AlertDetail for alert information
- AlertConfiguration for alert rules
- AlertHistory for past alerts
- AlertStatistics for analytics

**Alert Features:**
- Low stock alerts
- System event notifications
- User activity alerts
- Alert severity levels
- Alert acknowledgment tracking
- Alert configuration rules

**API Integration:**
- GET /api/alerts - List alerts
- GET /api/alerts/{id} - Get alert details
- POST /api/alerts - Create new alert
- PUT /api/alerts/{id} - Update alert
- PUT /api/alerts/{id}/acknowledge - Acknowledge alert
- GET /api/alerts/config - Get alert configuration

**Requirements:**
- Real-time alert updates
- Alert filtering and search
- Alert acknowledgment system
- Alert configuration management
- Alert history and analytics
- Responsive design for all devices
- Notification system integration

---

## Prompt 9: User Profile & Settings System

Develop a comprehensive user profile and settings management system for user account management and preferences.

**Core Features:**
- User profile management
- Account settings and preferences
- Password change functionality
- Notification preferences
- Theme and display settings
- Account security settings

**Technical Stack:**
- React 18+ with TypeScript
- Material-UI (MUI) for components
- TailwindCSS for styling
- React Hook Form + Zod for validation
- Axios for API communication
- Theme management system

**Key Components:**
- UserProfile main page
- ProfileForm for profile editing
- SettingsPanel for account settings
- PasswordChangeForm for security
- NotificationSettings for preferences
- ThemeSettings for display options

**Profile Features:**
- Personal information management
- Profile picture upload
- Contact information updates
- Password change and security
- Notification preferences
- Theme and display settings

**API Integration:**
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update profile
- PUT /api/users/password - Change password
- GET /api/users/settings - Get user settings
- PUT /api/users/settings - Update settings
- POST /api/users/avatar - Upload profile picture

**Requirements:**
- Comprehensive profile management
- Secure password change process
- Notification preference management
- Theme and display customization
- Profile picture upload and management
- Responsive design for all devices
- Form validation and error handling

---