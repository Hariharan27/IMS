# Inventory Management System (IMS) - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Dashboard](#dashboard)
4. [Product Management](#product-management)
5. [Inventory Management](#inventory-management)
6. [Purchase Order Management](#purchase-order-management)
7. [Supplier Management](#supplier-management)
8. [Category Management](#category-management)
9. [Alert Management](#alert-management)
10. [User Management](#user-management)
11. [User Profile](#user-profile)
12. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Overview
The Inventory Management System (IMS) is a comprehensive web-based application designed to streamline inventory operations, purchase order management, and supplier relationships. The system provides real-time tracking, automated alerts, and detailed reporting capabilities.

### Supported Browsers
- Chrome (recommended)
- Firefox
- Safari
- Edge

### System Requirements
- Modern web browser with JavaScript enabled
- Internet connection for real-time updates
- Minimum screen resolution: 1024x768

---

## Authentication

### Login
1. Navigate to the IMS login page
2. Enter your username and password
3. Click "Login" to access the system
4. You will be redirected to the Dashboard upon successful authentication

### Registration (Admin Only)
1. Click "Register" on the login page
2. Fill in the required information:
   - Username (unique)
   - Email address
   - Password (minimum 8 characters)
   - Confirm password
   - Full name
   - Role selection
3. Click "Register" to create your account

### Password Reset
If you forget your password, contact your system administrator to reset it.

### Logout
1. Click on your profile icon in the top-right corner
2. Select "Logout" from the dropdown menu
3. You will be redirected to the login page

---

## Dashboard

### Overview
The Dashboard provides a comprehensive view of your inventory system with key metrics and real-time information.

### Key Metrics
- **Total Products**: Number of active products in the system
- **Low Stock Items**: Products below reorder point
- **Out of Stock**: Products with zero available quantity
- **Active Purchase Orders**: Number of pending purchase orders
- **Total Suppliers**: Number of active suppliers
- **Recent Alerts**: Latest system notifications

### Charts and Analytics
- **Inventory Distribution**: Visual representation of stock levels across warehouses
- **Stock Movement Trends**: Historical data showing inventory changes
- **Top Products**: Most frequently ordered products
- **Warehouse Performance**: Stock levels by warehouse location

### Quick Actions
- **View Low Stock**: Direct access to low stock inventory
- **Create Purchase Order**: Quick access to PO creation
- **Check Alerts**: View recent system notifications
- **Inventory Overview**: Access detailed inventory reports

### Activity Feed
- Real-time updates of system activities
- Recent stock movements
- New purchase orders
- Alert notifications

---

## Product Management

### Viewing Products
1. Navigate to **Products** in the sidebar menu
2. View all products in a table format with:
   - Product name and SKU
   - Category and brand
   - Current stock levels
   - Cost and selling prices
   - Status (active/inactive)

### Adding a New Product
1. Click **"Add Product"** button
2. Fill in the product details:
   - **Basic Information**:
     - Product name
     - SKU (unique identifier)
     - Description
     - Brand and model
   - **Category**: Select from existing categories
   - **Pricing**:
     - Cost price
     - Selling price
   - **Inventory Settings**:
     - Reorder point
     - Reorder quantity
     - Unit of measure
   - **Physical Properties**:
     - Weight
     - Dimensions
3. Click **"Save"** to create the product

### Editing a Product
1. Find the product in the products table
2. Click the **"Edit"** button (pencil icon)
3. Modify the required fields
4. Click **"Save"** to update the product

### Managing Product Status
- **Activate/Deactivate**: Toggle product status using the status switch
- **Delete**: Remove products (only if not used in inventory or orders)

### Product Search and Filter
- Use the search bar to find products by name or SKU
- Filter by category, brand, or status
- Sort by any column (name, price, stock level, etc.)

---

## Inventory Management

### Viewing Inventory
1. Navigate to **Inventory** in the sidebar menu
2. View inventory levels across all warehouses
3. See detailed information including:
   - Product details
   - Warehouse location
   - Quantity on hand
   - Reserved quantity
   - Available quantity
   - Last updated timestamp

### Stock Adjustments
1. Find the inventory item you want to adjust
2. Click **"Adjust Stock"** button
3. Select adjustment type:
   - **Add Stock**: Increase inventory levels
   - **Remove Stock**: Decrease inventory levels
4. Enter the quantity and reason for adjustment
5. Click **"Save"** to apply the adjustment

### Low Stock Monitoring
- **Low Stock Items**: Products below their reorder point
- **Out of Stock**: Products with zero available quantity
- **Stock Alerts**: Automatic notifications for low stock situations

### Inventory Reports
- **Stock Levels**: Current inventory across all warehouses
- **Stock Movements**: Historical changes in inventory
- **Low Stock Report**: Items requiring reorder
- **Inventory Valuation**: Total value of current stock

### Warehouse Management
- View inventory by warehouse location
- Track stock levels per warehouse
- Monitor warehouse-specific alerts

---

## Purchase Order Management

### Viewing Purchase Orders
1. Navigate to **Purchase Orders** in the sidebar menu
2. View all purchase orders with:
   - PO number and date
   - Supplier information
   - Total amount
   - Status (Draft, Submitted, Approved, Ordered, etc.)
   - Items and quantities

### Creating a Purchase Order
1. Click **"Create Purchase Order"** button
2. Fill in the order details:
   - **Supplier**: Select from existing suppliers
   - **Warehouse**: Choose destination warehouse
   - **Expected Delivery Date**: Set delivery timeline
   - **Notes**: Additional order information
3. **Add Items**:
   - Select products from the catalog
   - Enter quantities for each item
   - Review unit prices and totals
4. Click **"Save Draft"** or **"Submit"** to create the PO

### Purchase Order Workflow
1. **Draft**: Initial creation (can be modified)
2. **Submitted**: Sent for approval
3. **Approved**: Ready for ordering
4. **Ordered**: Sent to supplier
5. **Partially Received**: Some items received
6. **Fully Received**: All items received
7. **Closed**: Order completed

### Managing Purchase Orders
- **Edit**: Modify draft orders
- **Approve**: Approve submitted orders
- **Receive Items**: Record received quantities
- **Cancel**: Cancel orders (if allowed)
- **View Details**: See complete order information

### Receiving Items
1. Find the purchase order in "Approved" status
2. Click **"Receive Items"** button
3. Enter received quantities for each item
4. Add notes if needed
5. Click **"Receive"** to update inventory

### Purchase Order Reports
- **Pending Orders**: Orders awaiting approval
- **Recent Orders**: Latest purchase orders
- **Order History**: Historical order data
- **Supplier Performance**: Order analysis by supplier

---

## Supplier Management

### Viewing Suppliers
1. Navigate to **Suppliers** in the sidebar menu
2. View all suppliers with:
   - Company name and code
   - Contact information
   - Payment terms
   - Status (active/inactive)

### Adding a New Supplier
1. Click **"Add Supplier"** button
2. Fill in supplier details:
   - **Company Information**:
     - Company name
     - Supplier code (unique)
     - Contact person
   - **Contact Details**:
     - Email address
     - Phone number
   - **Address**:
     - Street address
     - City, state, country
     - Postal code
   - **Business Terms**:
     - Payment terms
     - Credit limit (if applicable)
3. Click **"Save"** to create the supplier

### Editing Supplier Information
1. Find the supplier in the suppliers table
2. Click the **"Edit"** button
3. Modify the required fields
4. Click **"Save"** to update the supplier

### Managing Supplier Status
- **Activate/Deactivate**: Toggle supplier status
- **View Orders**: See purchase orders from this supplier
- **Performance**: Review supplier performance metrics

### Supplier Search and Filter
- Search by company name or code
- Filter by status or location
- Sort by any column

---

## Category Management

### Viewing Categories
1. Navigate to **Categories** in the sidebar menu
2. View all product categories with:
   - Category name and description
   - Number of products in category
   - Status (active/inactive)

### Adding a New Category
1. Click **"Add Category"** button
2. Fill in category details:
   - **Category Name**: Unique category identifier
   - **Description**: Detailed category description
   - **Parent Category**: Select parent category (if applicable)
3. Click **"Save"** to create the category

### Editing Categories
1. Find the category in the categories table
2. Click the **"Edit"** button
3. Modify the category information
4. Click **"Save"** to update the category

### Managing Category Hierarchy
- **Parent Categories**: Organize categories in a hierarchy
- **Subcategories**: Create subcategories under main categories
- **Product Assignment**: Assign products to appropriate categories

---

## Alert Management

### Viewing Alerts
1. Navigate to **Alerts** in the sidebar menu
2. View all system alerts including:
   - Alert type and severity
   - Description and details
   - Creation date and time
   - Status (read/unread)

### Alert Types
- **Low Stock Alerts**: Products below reorder point
- **Out of Stock Alerts**: Products with zero inventory
- **Purchase Order Alerts**: PO status changes
- **System Alerts**: General system notifications

### Managing Alerts
- **Mark as Read**: Mark alerts as read
- **Delete**: Remove resolved alerts
- **Filter**: Filter alerts by type, severity, or status
- **Search**: Search for specific alerts

### Alert Settings
- **Email Notifications**: Configure email alerts
- **Alert Thresholds**: Set custom alert levels
- **Notification Preferences**: Choose alert types to receive

---

## User Management

### Viewing Users
1. Navigate to **Users** in the sidebar menu (Admin/Manager only)
2. View all system users with:
   - Username and full name
   - Email address
   - Role and status
   - Last login date

### Adding a New User
1. Click **"Add User"** button
2. Fill in user details:
   - **Personal Information**:
     - Username (unique)
     - Full name
     - Email address
   - **Account Settings**:
     - Password
     - Role selection (Admin, Manager, Staff)
     - Status (active/inactive)
3. Click **"Save"** to create the user account

### Managing User Roles
- **Admin**: Full system access and user management
- **Manager**: Inventory and order management
- **Staff**: Basic inventory viewing and updates

### User Account Management
- **Edit User**: Modify user information
- **Reset Password**: Reset user passwords
- **Activate/Deactivate**: Enable or disable user accounts
- **View Activity**: Check user login history

---

## User Profile

### Accessing Your Profile
1. Click on your profile icon in the top-right corner
2. Select **"Profile"** from the dropdown menu

### Profile Information
- **Personal Details**: View and edit your information
- **Account Settings**: Change password and preferences
- **Activity History**: View your recent system activities

### Changing Password
1. Go to your profile page
2. Click **"Change Password"**
3. Enter current password
4. Enter new password and confirmation
5. Click **"Save"** to update password

### Profile Settings
- **Email Preferences**: Configure notification settings
- **Display Preferences**: Customize dashboard view
- **Language Settings**: Choose preferred language

---

## Troubleshooting

### Common Issues

#### Login Problems
- **Forgot Password**: Contact your system administrator
- **Account Locked**: Wait 15 minutes or contact admin
- **Invalid Credentials**: Check username and password

#### System Performance
- **Slow Loading**: Clear browser cache and cookies
- **Page Not Loading**: Check internet connection
- **Data Not Updating**: Refresh the page

#### Data Issues
- **Missing Data**: Check if you have proper permissions
- **Incorrect Information**: Contact your system administrator
- **Duplicate Entries**: Use search and filter to find duplicates

### Getting Help
- **System Administrator**: Contact your IT administrator
- **User Support**: Email support team
- **Documentation**: Refer to this user guide

### Best Practices
- **Regular Logout**: Always log out when finished
- **Data Backup**: Regular data backups are handled automatically
- **Password Security**: Use strong passwords and change regularly
- **Session Management**: Don't share your login credentials

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Search | Ctrl/Cmd + F |
| Refresh | F5 |
| Navigate to Dashboard | Alt + D |
| Navigate to Products | Alt + P |
| Navigate to Inventory | Alt + I |
| Navigate to Purchase Orders | Alt + O |
| Navigate to Suppliers | Alt + S |
| Navigate to Categories | Alt + C |
| Navigate to Alerts | Alt + A |
| Navigate to Users | Alt + U |
| Navigate to Profile | Alt + R |

---

## System Updates

### Automatic Updates
- The system automatically updates during maintenance windows
- Users will be notified of scheduled maintenance
- No action required from users

### New Features
- New features are announced via system notifications
- Training materials are provided for major updates
- User guides are updated regularly

---

*This user guide is maintained by the IMS development team. For questions or suggestions, please contact your system administrator.*

**Version**: 1.0  
**Last Updated**: August 2025  
**System**: Inventory Management System (IMS) 