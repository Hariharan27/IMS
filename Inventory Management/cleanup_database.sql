-- Cleanup Database Script
-- This script deletes all data in the correct order to avoid foreign key constraints

-- 1. Delete Stock Movements (references inventory, products, warehouses)
DELETE FROM stock_movements;

-- 2. Delete Purchase Order Items (references purchase orders and products)
DELETE FROM purchase_order_items;

-- 3. Delete Purchase Orders (references suppliers, warehouses, users)
DELETE FROM purchase_orders;

-- 4. Delete Inventory (references products and warehouses)
DELETE FROM inventory;

-- 5. Delete Products (references categories, users)
DELETE FROM products;

-- 6. Delete Alerts (references products, warehouses, users)
DELETE FROM alerts;

-- Reset sequences if using PostgreSQL
-- ALTER SEQUENCE products_id_seq RESTART WITH 1;
-- ALTER SEQUENCE inventory_id_seq RESTART WITH 1;
-- ALTER SEQUENCE purchase_orders_id_seq RESTART WITH 1;
-- ALTER SEQUENCE purchase_order_items_id_seq RESTART WITH 1;
-- ALTER SEQUENCE stock_movements_id_seq RESTART WITH 1;
-- ALTER SEQUENCE alerts_id_seq RESTART WITH 1;

-- Verify cleanup
SELECT 'Products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'Inventory' as table_name, COUNT(*) as count FROM inventory
UNION ALL
SELECT 'Purchase Orders' as table_name, COUNT(*) as count FROM purchase_orders
UNION ALL
SELECT 'Purchase Order Items' as table_name, COUNT(*) as count FROM purchase_order_items
UNION ALL
SELECT 'Stock Movements' as table_name, COUNT(*) as count FROM stock_movements
UNION ALL
SELECT 'Alerts' as table_name, COUNT(*) as count FROM alerts; 