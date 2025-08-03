# Inventory Management System - Database Schema

## 1. Database Overview

### 1.1 Database Technology
- **Database**: PostgreSQL 15+
- **ORM**: Spring Data JPA
- **Migration Tool**: Flyway
- **Connection Pool**: HikariCP

### 1.2 Schema Design Principles
- **Normalization**: 3NF compliance
- **Audit Trail**: Created/updated timestamps on all tables
- **Soft Deletes**: Logical deletion support
- **Foreign Key Constraints**: Referential integrity
- **Indexing**: Performance optimization
- **Naming Convention**: snake_case for tables and columns

## 2. Core Tables

### 2.1 Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STAFF',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

### 2.2 Warehouses Table
```sql
CREATE TABLE warehouses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    manager_id BIGINT REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_warehouses_code ON warehouses(code);
CREATE INDEX idx_warehouses_manager_id ON warehouses(manager_id);
CREATE INDEX idx_warehouses_is_active ON warehouses(is_active);
```

### 2.3 Categories Table
```sql
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES categories(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);
```

### 2.4 Products Table
```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    brand VARCHAR(100),
    model VARCHAR(100),
    weight DECIMAL(10,2),
    dimensions VARCHAR(100),
    unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'PCS',
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    reorder_point INTEGER NOT NULL DEFAULT 0,
    reorder_quantity INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_is_active ON products(is_active);
```

### 2.5 Suppliers Table
```sql
CREATE TABLE suppliers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    postal_code VARCHAR(20),
    payment_terms VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
```

### 2.6 Inventory Table
```sql
CREATE TABLE inventory (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id),
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT REFERENCES users(id),
    UNIQUE(product_id, warehouse_id)
);

-- Indexes
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse_id ON inventory(warehouse_id);
CREATE INDEX idx_inventory_quantity_on_hand ON inventory(quantity_on_hand);
CREATE INDEX idx_inventory_last_updated_at ON inventory(last_updated_at);
```

### 2.7 Stock Movements Table
```sql
CREATE TABLE stock_movements (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id),
    movement_type VARCHAR(20) NOT NULL, -- IN, OUT, TRANSFER, ADJUSTMENT
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(50), -- PURCHASE_ORDER, SALE_ORDER, TRANSFER, ADJUSTMENT
    reference_id BIGINT,
    notes TEXT,
    movement_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_warehouse_id ON stock_movements(warehouse_id);
CREATE INDEX idx_stock_movements_movement_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_reference_type ON stock_movements(reference_type);
CREATE INDEX idx_stock_movements_movement_date ON stock_movements(movement_date);
```

### 2.8 Purchase Orders Table
```sql
CREATE TABLE purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id),
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, APPROVED, RECEIVED, CANCELLED
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_warehouse_id ON purchase_orders(warehouse_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_order_date ON purchase_orders(order_date);
```

### 2.9 Purchase Order Items Table
```sql
CREATE TABLE purchase_order_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL REFERENCES purchase_orders(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_product_id ON purchase_order_items(product_id);
```

### 2.10 Alerts Table
```sql
CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL, -- LOW_STOCK, OUT_OF_STOCK, REORDER_POINT
    product_id BIGINT REFERENCES products(id),
    warehouse_id BIGINT REFERENCES warehouses(id),
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    is_acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_at TIMESTAMP,
    acknowledged_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_alerts_alert_type ON alerts(alert_type);
CREATE INDEX idx_alerts_product_id ON alerts(product_id);
CREATE INDEX idx_alerts_warehouse_id ON alerts(warehouse_id);
CREATE INDEX idx_alerts_is_acknowledged ON alerts(is_acknowledged);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
```

## 3. Audit and Logging Tables

### 3.1 Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 3.2 System Logs Table
```sql
CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    level VARCHAR(10) NOT NULL, -- INFO, WARN, ERROR, DEBUG
    logger VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_logger ON system_logs(logger);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
```

## 4. Views for Reporting

### 4.1 Inventory Summary View
```sql
CREATE VIEW inventory_summary AS
SELECT 
    p.id as product_id,
    p.sku,
    p.name as product_name,
    c.name as category_name,
    w.id as warehouse_id,
    w.name as warehouse_name,
    i.quantity_on_hand,
    i.quantity_reserved,
    i.quantity_available,
    p.reorder_point,
    p.reorder_quantity,
    CASE 
        WHEN i.quantity_available <= p.reorder_point THEN 'LOW_STOCK'
        WHEN i.quantity_available = 0 THEN 'OUT_OF_STOCK'
        ELSE 'IN_STOCK'
    END as stock_status,
    i.last_updated_at
FROM products p
JOIN categories c ON p.category_id = c.id
CROSS JOIN warehouses w
LEFT JOIN inventory i ON p.id = i.product_id AND w.id = i.warehouse_id
WHERE p.is_active = true AND w.is_active = true;
```

### 4.2 Stock Movement Summary View
```sql
CREATE VIEW stock_movement_summary AS
SELECT 
    p.sku,
    p.name as product_name,
    w.name as warehouse_name,
    sm.movement_type,
    SUM(sm.quantity) as total_quantity,
    COUNT(*) as movement_count,
    MIN(sm.movement_date) as first_movement,
    MAX(sm.movement_date) as last_movement
FROM stock_movements sm
JOIN products p ON sm.product_id = p.id
JOIN warehouses w ON sm.warehouse_id = w.id
GROUP BY p.sku, p.name, w.name, sm.movement_type;
```

### 4.3 Purchase Order Summary View
```sql
CREATE VIEW purchase_order_summary AS
SELECT 
    po.po_number,
    s.name as supplier_name,
    w.name as warehouse_name,
    po.order_date,
    po.expected_delivery_date,
    po.status,
    po.total_amount,
    COUNT(poi.id) as item_count,
    SUM(poi.quantity_ordered) as total_quantity_ordered,
    SUM(poi.quantity_received) as total_quantity_received,
    u.first_name || ' ' || u.last_name as created_by_name
FROM purchase_orders po
JOIN suppliers s ON po.supplier_id = s.id
JOIN warehouses w ON po.warehouse_id = w.id
JOIN users u ON po.created_by = u.id
LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
GROUP BY po.id, po.po_number, s.name, w.name, po.order_date, 
         po.expected_delivery_date, po.status, po.total_amount, u.first_name, u.last_name;
```

## 5. Database Functions

### 5.1 Update Inventory Function
```sql
CREATE OR REPLACE FUNCTION update_inventory(
    p_product_id BIGINT,
    p_warehouse_id BIGINT,
    p_quantity_change INTEGER,
    p_movement_type VARCHAR(20),
    p_user_id BIGINT
) RETURNS VOID AS $$
BEGIN
    -- Update inventory
    INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, quantity_available, updated_by)
    VALUES (p_product_id, p_warehouse_id, p_quantity_change, p_quantity_change, p_user_id)
    ON CONFLICT (product_id, warehouse_id)
    DO UPDATE SET 
        quantity_on_hand = inventory.quantity_on_hand + p_quantity_change,
        quantity_available = inventory.quantity_available + p_quantity_change,
        last_updated_at = CURRENT_TIMESTAMP,
        updated_by = p_user_id;
    
    -- Record stock movement
    INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, created_by)
    VALUES (p_product_id, p_warehouse_id, p_movement_type, p_quantity_change, p_user_id);
END;
$$ LANGUAGE plpgsql;
```

### 5.2 Check Low Stock Function
```sql
CREATE OR REPLACE FUNCTION check_low_stock() RETURNS VOID AS $$
DECLARE
    stock_record RECORD;
BEGIN
    FOR stock_record IN 
        SELECT 
            i.product_id,
            i.warehouse_id,
            p.name as product_name,
            w.name as warehouse_name,
            i.quantity_available,
            p.reorder_point
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        JOIN warehouses w ON i.warehouse_id = w.id
        WHERE i.quantity_available <= p.reorder_point
        AND p.is_active = true
        AND w.is_active = true
    LOOP
        -- Check if alert already exists
        IF NOT EXISTS (
            SELECT 1 FROM alerts 
            WHERE product_id = stock_record.product_id 
            AND warehouse_id = stock_record.warehouse_id
            AND alert_type = 'LOW_STOCK'
            AND is_acknowledged = false
        ) THEN
            INSERT INTO alerts (alert_type, product_id, warehouse_id, message, severity)
            VALUES (
                'LOW_STOCK',
                stock_record.product_id,
                stock_record.warehouse_id,
                'Low stock alert: ' || stock_record.product_name || ' at ' || stock_record.warehouse_name || 
                ' (Available: ' || stock_record.quantity_available || ', Reorder Point: ' || stock_record.reorder_point || ')',
                CASE 
                    WHEN stock_record.quantity_available = 0 THEN 'CRITICAL'
                    WHEN stock_record.quantity_available <= stock_record.reorder_point / 2 THEN 'HIGH'
                    ELSE 'MEDIUM'
                END
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## 6. Database Triggers

### 6.1 Update Timestamp Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_order_items_updated_at BEFORE UPDATE ON purchase_order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 7. Migration Files

### 7.1 V1__Create_initial_schema.sql
```sql
-- Initial schema creation
-- This file contains all the table creation statements above
```

### 7.2 V2__Add_indexes.sql
```sql
-- Performance optimization indexes
-- This file contains all the index creation statements above
```

### 7.3 V3__Add_views_and_functions.sql
```sql
-- Views and functions for reporting
-- This file contains all the view and function creation statements above
```

## 8. Data Seeding

### 8.1 V4__Seed_initial_data.sql
```sql
-- Insert default categories
INSERT INTO categories (name, description) VALUES 
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Apparel and fashion items'),
('Books', 'Books and publications'),
('Home & Garden', 'Home improvement and garden supplies');

-- Insert default warehouse
INSERT INTO warehouses (name, code, address, city, state, country, postal_code) VALUES 
('Main Warehouse', 'MW001', '123 Main St', 'New York', 'NY', 'USA', '10001');

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES 
('admin', 'admin@inventory.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'Admin', 'User', 'ADMIN');
```

## 9. Performance Considerations

### 9.1 Indexing Strategy
- **Primary Keys**: All tables have BIGSERIAL primary keys
- **Foreign Keys**: Indexed for join performance
- **Search Fields**: Username, email, SKU, product names
- **Status Fields**: Active/inactive flags for filtering
- **Date Fields**: Created/updated timestamps for sorting

### 9.2 Partitioning Strategy
- **Stock Movements**: Partition by month for large datasets
- **Audit Logs**: Partition by month for performance
- **System Logs**: Partition by day for log management

### 9.3 Maintenance
- **Vacuum**: Regular VACUUM and ANALYZE
- **Statistics**: Updated table statistics
- **Archiving**: Old audit logs and system logs
- **Backup**: Daily automated backups 