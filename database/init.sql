-- COC-SaaS Database Initialization Script
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('MEMBER', 'ELDER', 'CO_LEADER', 'LEADER', 'SUPER_ADMIN');

-- =============================================
-- CORE TABLES
-- =============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    is_platform_admin BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Players Table (CoC Players linked to users)
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    player_tag VARCHAR(15) UNIQUE NOT NULL,
    player_name VARCHAR(100) NOT NULL,
    town_hall_level INTEGER NOT NULL,
    exp_level INTEGER DEFAULT 0,
    trophies INTEGER DEFAULT 0,
    clan_tag VARCHAR(15),
    clan_name VARCHAR(100),
    raw_data JSONB,
    last_synced_at TIMESTAMP NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_player_tag ON players(player_tag);
CREATE INDEX idx_players_clan_tag ON players(clan_tag);

-- Tenants Table (Clans)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clan_tag VARCHAR(15) UNIQUE NOT NULL,
    clan_name VARCHAR(100) NOT NULL,
    clan_badge_url VARCHAR(500),
    clan_level INTEGER DEFAULT 0,
    member_count INTEGER DEFAULT 0,
    description TEXT,
    settings JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMP NOT NULL,
    verified_api_token VARCHAR(500),
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_tenants_clan_tag ON tenants(clan_tag);
CREATE INDEX idx_tenants_is_active ON tenants(is_active);

-- Memberships Table (User-Tenant relationship with roles)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role user_role DEFAULT 'MEMBER',
    player_tag VARCHAR(15),
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, tenant_id)
);

CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_tenant_id ON memberships(tenant_id);
CREATE INDEX idx_memberships_role ON memberships(role);

-- =============================================
-- FUNCTION: Update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA (Optional - Super Admin)
-- =============================================
-- Note: Password is 'Admin123!' hashed with bcrypt
-- You should change this immediately in production
INSERT INTO users (email, username, password, display_name, is_platform_admin, is_email_verified)
VALUES (
    'admin@cocsaas.com',
    'mac_knight141',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'Ishara mac_knight141 Lakshitha',
    TRUE,
    TRUE
)
ON CONFLICT (email) DO NOTHING;