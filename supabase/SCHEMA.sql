-- POS CRM Schema

-- 1. Terminals Table
CREATE TYPE terminal_status AS ENUM ('online', 'offline', 'maintenance');

CREATE TABLE terminals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_id TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL,
    status terminal_status DEFAULT 'offline',
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    firmware_version TEXT,
    zone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sales Table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_id UUID REFERENCES terminals(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    category TEXT NOT NULL, -- e.g., 'electronics', 'home goods'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Activity Logs Table
CREATE TYPE activity_type AS ENUM ('activation', 'payment', 'alert', 'update');

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_id UUID REFERENCES terminals(id) ON DELETE SET NULL,
    type activity_type NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Basic setup
ALTER TABLE terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for development: everyone can read/write if authenticated)
CREATE POLICY "Allow all for authenticated" ON terminals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON sales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
