-- Seed initial data for Inventory Management System

-- Insert default categories
INSERT INTO categories (name, description) VALUES 
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Apparel and fashion items'),
('Books', 'Books and publications'),
('Home & Garden', 'Home improvement and garden supplies'),
('Sports & Outdoors', 'Sports equipment and outdoor gear'),
('Automotive', 'Automotive parts and accessories');

-- Insert default warehouse
INSERT INTO warehouses (name, code, address, city, state, country, postal_code, phone, email) VALUES 
('Main Warehouse', 'MW001', '123 Main St', 'New York', 'NY', 'USA', '10001', '+1-555-123-4567', 'main@warehouse.com'),
('Secondary Warehouse', 'SW001', '456 Business Ave', 'Los Angeles', 'CA', 'USA', '90210', '+1-555-987-6543', 'secondary@warehouse.com');

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES 
('admin', 'admin@inventory.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'Admin', 'User', 'ADMIN');

-- Insert sample supplier
INSERT INTO suppliers (name, code, contact_person, email, phone, address, city, state, country, postal_code, payment_terms) VALUES 
('Dell Inc.', 'DELL001', 'John Smith', 'orders@dell.com', '+1-555-987-6543', '456 Business Ave', 'Austin', 'TX', 'USA', '73301', 'Net 30'),
('Logitech', 'LOG001', 'Jane Doe', 'orders@logitech.com', '+1-555-123-4567', '789 Tech Blvd', 'Fremont', 'CA', 'USA', '94538', 'Net 30');

-- Insert sample products
INSERT INTO products (sku, name, description, category_id, brand, model, weight, dimensions, unit_of_measure, cost_price, selling_price, reorder_point, reorder_quantity) VALUES 
('PROD001', 'Laptop Computer', 'High-performance laptop for business use', 1, 'Dell', 'XPS 13', 1.2, '12.4 x 8.7 x 0.6 inches', 'PCS', 800.00, 1200.00, 10, 50),
('PROD002', 'Wireless Mouse', 'Ergonomic wireless mouse', 1, 'Logitech', 'MX Master 3', 0.141, '5.0 x 3.4 x 2.0 inches', 'PCS', 45.00, 79.99, 20, 100),
('PROD003', 'T-Shirt', 'Cotton t-shirt', 2, 'Generic', 'Basic', 0.2, 'Standard size', 'PCS', 5.00, 15.00, 50, 200),
('PROD004', 'Programming Book', 'Learn Java programming', 3, 'OReilly', 'Java Guide', 0.5, '8.5 x 11 inches', 'PCS', 20.00, 45.00, 15, 75);

-- Insert initial inventory
INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, quantity_reserved, quantity_available) VALUES 
(1, 1, 25, 5, 20),
(2, 1, 50, 0, 50),
(3, 1, 100, 10, 90),
(4, 1, 30, 0, 30),
(1, 2, 10, 0, 10),
(2, 2, 20, 0, 20); 