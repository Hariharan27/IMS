-- Add sample data from last month to demonstrate trends
-- This will create historical data to show changes in the dashboard metrics

-- Insert additional products from last month (some discontinued, some new)
INSERT INTO products (sku, name, description, category_id, brand, model, weight, dimensions, unit_of_measure, cost_price, selling_price, reorder_point, reorder_quantity, is_active, created_at) VALUES 
-- Products from last month (some discontinued)
('PROD005', 'Old Keyboard', 'Basic wired keyboard (discontinued)', 1, 'Generic', 'KB-100', 0.5, '17.5 x 5.5 x 1.0 inches', 'PCS', 15.00, 25.00, 30, 100, false, DATE_SUB(NOW(), INTERVAL 45 DAY)),
('PROD006', 'Legacy Monitor', '24-inch monitor (discontinued)', 1, 'Dell', 'P2419H', 3.5, '21.3 x 6.1 x 15.8 inches', 'PCS', 120.00, 180.00, 15, 50, false, DATE_SUB(NOW(), INTERVAL 45 DAY)),
('PROD007', 'Old Mouse Pad', 'Basic mouse pad (discontinued)', 1, 'Generic', 'MP-001', 0.1, '9.0 x 7.0 inches', 'PCS', 2.00, 5.00, 100, 500, false, DATE_SUB(NOW(), INTERVAL 45 DAY)),

-- New products added this month
('PROD008', 'Gaming Headset', 'High-quality gaming headset', 1, 'Razer', 'Kraken X', 0.25, '7.5 x 6.5 x 3.5 inches', 'PCS', 35.00, 59.99, 25, 80, true, NOW()),
('PROD009', 'Mechanical Keyboard', 'RGB mechanical gaming keyboard', 1, 'Corsair', 'K70', 1.1, '17.3 x 6.5 x 1.6 inches', 'PCS', 80.00, 129.99, 20, 60, true, NOW()),
('PROD010', '4K Monitor', '27-inch 4K gaming monitor', 1, 'LG', '27UK650', 5.8, '24.1 x 7.0 x 16.9 inches', 'PCS', 250.00, 399.99, 10, 30, true, NOW()),
('PROD011', 'Gaming Mouse', 'High-DPI gaming mouse', 1, 'SteelSeries', 'Rival 600', 0.096, '5.0 x 2.7 x 1.6 inches', 'PCS', 25.00, 49.99, 40, 120, true, NOW()),
('PROD012', 'Webcam', '1080p streaming webcam', 1, 'Logitech', 'C920', 0.15, '3.0 x 1.0 x 0.5 inches', 'PCS', 30.00, 69.99, 35, 100, true, NOW()),

-- Clothing items from last month
('PROD013', 'Winter Jacket', 'Warm winter jacket', 2, 'North Face', 'Denali', 0.8, 'Standard size', 'PCS', 80.00, 150.00, 20, 80, true, DATE_SUB(NOW(), INTERVAL 45 DAY)),
('PROD014', 'Running Shoes', 'Professional running shoes', 2, 'Nike', 'Air Max', 0.6, 'Standard size', 'PCS', 45.00, 89.99, 30, 100, true, DATE_SUB(NOW(), INTERVAL 45 DAY)),

-- New clothing items this month
('PROD015', 'Summer Dress', 'Light summer dress', 2, 'Zara', 'Summer-2024', 0.3, 'Standard size', 'PCS', 25.00, 49.99, 50, 150, true, NOW()),
('PROD016', 'Jeans', 'Classic blue jeans', 2, 'Levi', '501', 0.5, 'Standard size', 'PCS', 20.00, 39.99, 40, 120, true, NOW()),

-- Books from last month
('PROD017', 'Python Book', 'Learn Python programming', 3, 'Manning', 'Python Guide', 0.7, '8.5 x 11 inches', 'PCS', 25.00, 49.99, 20, 80, true, DATE_SUB(NOW(), INTERVAL 45 DAY)),
('PROD018', 'React Book', 'React development guide', 3, 'Packt', 'React Mastery', 0.6, '8.5 x 11 inches', 'PCS', 20.00, 39.99, 25, 90, true, DATE_SUB(NOW(), INTERVAL 45 DAY)),

-- New books this month
('PROD019', 'AI Book', 'Artificial Intelligence fundamentals', 3, 'MIT Press', 'AI Basics', 0.8, '8.5 x 11 inches', 'PCS', 30.00, 59.99, 15, 60, true, NOW()),
('PROD020', 'DevOps Book', 'DevOps practices and tools', 3, 'OReilly', 'DevOps Guide', 0.7, '8.5 x 11 inches', 'PCS', 28.00, 54.99, 18, 70, true, NOW());

-- Insert inventory for last month's products (lower quantities to show growth)
INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, quantity_reserved, quantity_available, created_at) VALUES 
-- Last month inventory (lower quantities)
(5, 1, 10, 2, 8, DATE_SUB(NOW(), INTERVAL 45 DAY)),
(6, 1, 8, 1, 7, DATE_SUB(NOW(), INTERVAL 45 DAY)),
(7, 1, 50, 5, 45, DATE_SUB(NOW(), INTERVAL 45 DAY)),
(13, 1, 15, 3, 12, DATE_SUB(NOW(), INTERVAL 45 DAY)),
(14, 1, 25, 5, 20, DATE_SUB(NOW(), INTERVAL 45 DAY)),
(17, 1, 12, 2, 10, DATE_SUB(NOW(), INTERVAL 45 DAY)),
(18, 1, 18, 3, 15, DATE_SUB(NOW(), INTERVAL 45 DAY)),

-- This month inventory (higher quantities to show growth)
(8, 1, 35, 5, 30, NOW()),
(9, 1, 25, 3, 22, NOW()),
(10, 1, 12, 2, 10, NOW()),
(11, 1, 45, 5, 40, NOW()),
(12, 1, 40, 4, 36, NOW()),
(15, 1, 60, 8, 52, NOW()),
(16, 1, 50, 6, 44, NOW()),
(19, 1, 20, 3, 17, NOW()),
(20, 1, 22, 2, 20, NOW());

-- Insert some purchase orders from last month to show order trends
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, expected_delivery_date, status, total_amount, notes, created_at) VALUES 
('PO-2024-001', 1, 1, DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY), 'RECEIVED', 2500.00, 'Last month order', DATE_SUB(NOW(), INTERVAL 45 DAY)),
('PO-2024-002', 2, 1, DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY), 'RECEIVED', 1800.00, 'Last month order', DATE_SUB(NOW(), INTERVAL 40 DAY)),
('PO-2024-003', 1, 2, DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), 'RECEIVED', 1200.00, 'Last month order', DATE_SUB(NOW(), INTERVAL 35 DAY));

-- Insert purchase orders from this month (more orders to show growth)
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, expected_delivery_date, status, total_amount, notes, created_at) VALUES 
('PO-2024-004', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'SUBMITTED', 3500.00, 'This month order', NOW()),
('PO-2024-005', 2, 1, NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), 'SUBMITTED', 2800.00, 'This month order', NOW()),
('PO-2024-006', 1, 2, NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), 'SUBMITTED', 2200.00, 'This month order', NOW()),
('PO-2024-007', 2, 1, NOW(), DATE_ADD(NOW(), INTERVAL 12 DAY), 'SUBMITTED', 1900.00, 'This month order', NOW()),
('PO-2024-008', 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 8 DAY), 'SUBMITTED', 3100.00, 'This month order', NOW());

-- Insert purchase order items for last month
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity_ordered, unit_price, total_price) VALUES 
(1, 1, 10, 800.00, 8000.00),
(1, 2, 20, 45.00, 900.00),
(2, 3, 50, 5.00, 250.00),
(2, 4, 15, 20.00, 300.00),
(3, 1, 5, 800.00, 4000.00);

-- Insert purchase order items for this month (more items to show growth)
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity_ordered, unit_price, total_price) VALUES 
(4, 8, 30, 35.00, 1050.00),
(4, 9, 20, 80.00, 1600.00),
(4, 10, 8, 250.00, 2000.00),
(5, 11, 35, 25.00, 875.00),
(5, 12, 30, 30.00, 900.00),
(5, 15, 40, 25.00, 1000.00),
(6, 16, 35, 20.00, 700.00),
(6, 19, 12, 30.00, 360.00),
(7, 20, 15, 28.00, 420.00),
(7, 8, 25, 35.00, 875.00),
(8, 9, 15, 80.00, 1200.00),
(8, 10, 5, 250.00, 1250.00);

-- Insert some stock movements from last month (lower activity)
INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, notes, created_at) VALUES 
(1, 1, 'IN', 10, 'PURCHASE_ORDER', 1, 'Last month stock in', DATE_SUB(NOW(), INTERVAL 45 DAY)),
(2, 1, 'IN', 20, 'PURCHASE_ORDER', 1, 'Last month stock in', DATE_SUB(NOW(), INTERVAL 45 DAY)),
(3, 1, 'IN', 50, 'PURCHASE_ORDER', 2, 'Last month stock in', DATE_SUB(NOW(), INTERVAL 40 DAY)),
(4, 1, 'IN', 15, 'PURCHASE_ORDER', 2, 'Last month stock in', DATE_SUB(NOW(), INTERVAL 40 DAY)),
(1, 2, 'IN', 5, 'PURCHASE_ORDER', 3, 'Last month stock in', DATE_SUB(NOW(), INTERVAL 35 DAY));

-- Insert stock movements from this month (higher activity to show growth)
INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, notes, created_at) VALUES 
(8, 1, 'IN', 30, 'PURCHASE_ORDER', 4, 'This month stock in', NOW()),
(9, 1, 'IN', 20, 'PURCHASE_ORDER', 4, 'This month stock in', NOW()),
(10, 1, 'IN', 8, 'PURCHASE_ORDER', 4, 'This month stock in', NOW()),
(11, 1, 'IN', 35, 'PURCHASE_ORDER', 5, 'This month stock in', NOW()),
(12, 1, 'IN', 30, 'PURCHASE_ORDER', 5, 'This month stock in', NOW()),
(15, 1, 'IN', 40, 'PURCHASE_ORDER', 5, 'This month stock in', NOW()),
(16, 1, 'IN', 35, 'PURCHASE_ORDER', 6, 'This month stock in', NOW()),
(19, 1, 'IN', 12, 'PURCHASE_ORDER', 6, 'This month stock in', NOW()),
(20, 1, 'IN', 15, 'PURCHASE_ORDER', 7, 'This month stock in', NOW()),
(8, 1, 'IN', 25, 'PURCHASE_ORDER', 8, 'This month stock in', NOW()),
(9, 1, 'IN', 15, 'PURCHASE_ORDER', 8, 'This month stock in', NOW()),
(10, 1, 'IN', 5, 'PURCHASE_ORDER', 8, 'This month stock in', NOW()); 