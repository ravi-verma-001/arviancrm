-- PostgreSQL / Supabase Production Schema for Arvian Marketing CRM
-- Includes Row-Level Security (RLS) policies, indexes, and constraints

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agencies table
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'Arvian Marketing',
    logo TEXT,
    timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    email VARCHAR(255) NOT NULL DEFAULT 'contact@arvianmarketing.com',
    phone VARCHAR(50) DEFAULT '+91 98765 43210',
    website TEXT DEFAULT 'https://arvianmarketing.com',
    address TEXT DEFAULT 'Mumbai, Maharashtra, India',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users / Employees table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'SALES_EXECUTIVE',
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    date_of_joining TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    manager_id UUID REFERENCES users(id),
    working_hours VARCHAR(100) DEFAULT '10:00 AM - 7:00 PM IST',
    leave_balance INTEGER DEFAULT 18,
    emergency_contact TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Salary records (Restricted to SUPER_ADMIN)
CREATE TABLE IF NOT EXISTS salary_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    monthly_salary NUMERIC(12, 2) NOT NULL,
    allowances NUMERIC(12, 2) DEFAULT 0,
    deductions NUMERIC(12, 2) DEFAULT 0,
    advances NUMERIC(12, 2) DEFAULT 0,
    net_salary NUMERIC(12, 2) NOT NULL,
    payroll_period VARCHAR(50) NOT NULL,
    payment_date TIMESTAMPTZ,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    total_hours NUMERIC(5, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PRESENT',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    custom_id VARCHAR(50) UNIQUE NOT NULL,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    contact_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    company_name VARCHAR(255),
    industry VARCHAR(100),
    city VARCHAR(100),
    website TEXT,
    instagram_handle VARCHAR(100),
    fb_page_url TEXT,
    source VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    services_interested JSONB DEFAULT '[]',
    budget VARCHAR(100),
    previous_marketing_exp VARCHAR(50),
    previous_meta_ads_exp VARCHAR(50) DEFAULT 'UNKNOWN',
    prev_meta_daily_budget NUMERIC(12, 2),
    prev_meta_monthly_budget NUMERIC(12, 2),
    prev_campaign_results TEXT,
    ad_account_notes TEXT,
    customer_requirements TEXT,
    objections TEXT,
    competitor_info TEXT,
    notes TEXT,
    assigned_to_id UUID REFERENCES users(id),
    campaign_id UUID,
    next_follow_up_date TIMESTAMPTZ,
    converted_to_client_id UUID,
    lost_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Follow-ups table
CREATE TABLE IF NOT EXISTS follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    assigned_to_id UUID NOT NULL REFERENCES users(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    type VARCHAR(50) DEFAULT 'CALL',
    reminder_interval_minutes INTEGER DEFAULT 15,
    reminder_sent BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    attempt_number INTEGER DEFAULT 1,
    notes TEXT,
    outcome TEXT,
    next_action TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    custom_id VARCHAR(50) UNIQUE NOT NULL,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    primary_contact VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    website TEXT,
    industry VARCHAR(100),
    fb_page_url TEXT,
    instagram_handle VARCHAR(100),
    instagram_followers INTEGER DEFAULT 0,
    followers_recorded_date TIMESTAMPTZ,
    services_purchased JSONB DEFAULT '[]',
    contract_start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    contract_end_date TIMESTAMPTZ,
    renewal_date TIMESTAMPTZ,
    account_manager_id UUID REFERENCES users(id),
    monthly_service_fee NUMERIC(12, 2) DEFAULT 0,
    ad_budget NUMERIC(12, 2) DEFAULT 0,
    payment_terms VARCHAR(100) DEFAULT 'Advance Monthly',
    payment_status VARCHAR(50) DEFAULT 'PAID',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    is_internal BOOLEAN DEFAULT TRUE,
    name VARCHAR(255) NOT NULL,
    objective VARCHAR(50) DEFAULT 'LEADS',
    platform VARCHAR(50) DEFAULT 'META',
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    daily_budget NUMERIC(12, 2) DEFAULT 0,
    lifetime_budget NUMERIC(12, 2),
    actual_spend NUMERIC(12, 2) DEFAULT 0,
    target_audience TEXT,
    target_location VARCHAR(255) DEFAULT 'India',
    ad_copy_headline TEXT,
    ad_copy_primary TEXT,
    call_to_action VARCHAR(50) DEFAULT 'Learn More',
    creative_url TEXT,
    landing_page_url TEXT,
    assigned_employee_id UUID REFERENCES users(id),
    notes TEXT,
    meta_campaign_id VARCHAR(100),
    last_synced_at TIMESTAMPTZ,
    sync_status VARCHAR(50) DEFAULT 'MANUAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaign Daily Metrics
CREATE TABLE IF NOT EXISTS campaign_daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    spend NUMERIC(12, 2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    frequency NUMERIC(5, 2) DEFAULT 1.0,
    link_clicks INTEGER DEFAULT 0,
    outbound_clicks INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    messaging_conversations INTEGER DEFAULT 0,
    landing_page_views INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(campaign_id, date)
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    service_category VARCHAR(100) DEFAULT 'Meta Ads',
    owner_id UUID REFERENCES users(id),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    template_type VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to_id UUID REFERENCES users(id),
    created_by_id UUID REFERENCES users(id),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'NOT_STARTED',
    completion_percentage INTEGER DEFAULT 0,
    checklist JSONB DEFAULT '[]',
    approval_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content Calendar
CREATE TABLE IF NOT EXISTS content_calendar_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    publish_date TIMESTAMPTZ NOT NULL,
    platform VARCHAR(50) DEFAULT 'INSTAGRAM',
    post_type VARCHAR(50) DEFAULT 'POST',
    topic VARCHAR(255) NOT NULL,
    caption TEXT,
    hashtags TEXT,
    creative_url TEXT,
    assigned_designer_id UUID REFERENCES users(id),
    assigned_smm_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'IDEA',
    published_url TEXT,
    performance_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_period VARCHAR(50) NOT NULL,
    invoice_amount NUMERIC(12, 2) NOT NULL,
    amount_received NUMERIC(12, 2) DEFAULT 0,
    outstanding_amount NUMERIC(12, 2) NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    payment_date TIMESTAMPTZ,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    items JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    vendor VARCHAR(255),
    receipt_url TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) policies for Supabase
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super Admins can access salary records"
ON salary_records FOR ALL
USING (auth.jwt() ->> 'role' = 'SUPER_ADMIN');

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leads tenant isolation"
ON leads FOR ALL
USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients tenant isolation"
ON clients FOR ALL
USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);
