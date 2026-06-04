-- RRU Puducherry CMS Database Migration

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'editor' CHECK (role IN ('superadmin', 'admin', 'editor')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  failed_login_attempts INT DEFAULT 0,
  lockout_until TIMESTAMP
);

-- Login history
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(10) CHECK (status IN ('success', 'failed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Hero slides
CREATE TABLE hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- About campus
CREATE TABLE about_campus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  image_url TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vice Chancellor
CREATE TABLE vice_chancellor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  designation VARCHAR(100),
  message TEXT,
  image_url TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campus Director
CREATE TABLE campus_director (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  designation VARCHAR(100),
  message TEXT,
  image_url TEXT,
  contact_email VARCHAR(100),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- News
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  tag VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date DATE,
  location VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gallery
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contact details
CREATE TABLE contact_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100),
  location TEXT,
  phone VARCHAR(30),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Site settings
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed Site Settings
INSERT INTO site_settings (key, value) VALUES 
('site_name', 'RRU Puducherry Campus'),
('footer_address', 'Puducherry, India'),
('footer_phone', '+91-XXXX-XXXXXX'),
('footer_email', 'puducherry@rru.ac.in'),
('social_facebook', '#'),
('social_twitter', '#'),
('social_linkedin', '#');
