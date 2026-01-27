/*
  # Add Performance Indexes

  1. Performance Improvements
    - Add indexes on frequently queried columns
    - Optimize foreign key lookups
    - Speed up order by operations
    - Improve RLS policy performance

  2. Indexes Added
    - products: restaurant_id, status, display_order
    - categories: restaurant_id, is_active
    - orders: restaurant_id, status, created_at
    - product_categories: product_id, category_id
    - subscriptions: restaurant_id, status, end_date
*/

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_restaurant_status 
  ON products(restaurant_id, status) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_products_display_order 
  ON products(restaurant_id, display_order);

CREATE INDEX IF NOT EXISTS idx_products_updated_at 
  ON products(updated_at DESC);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_active 
  ON categories(restaurant_id, is_active) 
  WHERE is_active = true;

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status 
  ON orders(restaurant_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_created_at 
  ON orders(restaurant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status_created 
  ON orders(status, created_at DESC) 
  WHERE status IN ('pending', 'confirmed', 'preparing');

-- Product categories indexes (composite for join optimization)
CREATE INDEX IF NOT EXISTS idx_product_categories_product 
  ON product_categories(product_id);

CREATE INDEX IF NOT EXISTS idx_product_categories_category 
  ON product_categories(category_id);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant_status 
  ON subscriptions(restaurant_id, status) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date 
  ON subscriptions(end_date) 
  WHERE status = 'active';

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_restaurant 
  ON customers(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_customers_phone 
  ON customers(restaurant_id, phone);

-- Support tickets indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_restaurant 
  ON support_tickets(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status 
  ON support_tickets(status, created_at DESC) 
  WHERE status != 'resolved';

-- Analyze tables to update statistics
ANALYZE products;
ANALYZE categories;
ANALYZE orders;
ANALYZE product_categories;
ANALYZE subscriptions;
ANALYZE customers;
ANALYZE support_tickets;