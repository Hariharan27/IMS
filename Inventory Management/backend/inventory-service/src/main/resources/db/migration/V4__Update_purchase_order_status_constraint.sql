-- Update purchase order status constraint to allow new status values
-- Drop existing constraint if it exists
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_status_check;

-- Add new constraint with updated status values
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_status_check 
CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CANCELLED', 'CLOSED')); 