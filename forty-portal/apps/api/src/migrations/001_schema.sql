-- Forty Portal · Database Schema
-- PostgreSQL 16

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ──────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(50)  NOT NULL CHECK (role IN ('Admin','Manager','Finance','Developer','Viewer')),
  job_title     VARCHAR(255),
  department    VARCHAR(100),
  phone         VARCHAR(50),
  avatar        VARCHAR(10)  DEFAULT 'avatar-1',
  status        VARCHAR(50)  NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','On Leave','Inactive')),
  joined_at     DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Clients ────────────────────────────────────────────────────────────────────
CREATE TABLE clients (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(255) NOT NULL,
  initials       VARCHAR(4)   NOT NULL,
  email          VARCHAR(255),
  industry       VARCHAR(100),
  contact_person VARCHAR(255),
  phone          VARCHAR(50),
  address        TEXT,
  status         VARCHAR(50)  NOT NULL DEFAULT 'Active',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Projects ───────────────────────────────────────────────────────────────────
CREATE TABLE projects (
  id               VARCHAR(20)   PRIMARY KEY,
  name             VARCHAR(255)  NOT NULL,
  client_id        UUID          REFERENCES clients(id) ON DELETE SET NULL,
  description      TEXT,
  status           VARCHAR(50)   NOT NULL DEFAULT 'In Progress'
                   CHECK (status IN ('Planning','In Progress','Delivered','On Hold')),
  priority         VARCHAR(20)   NOT NULL DEFAULT 'Medium'
                   CHECK (priority IN ('Low','Medium','High','Critical')),
  progress         INTEGER       NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  start_date       DATE,
  end_date         DATE,
  total_value      NUMERIC(12,2) NOT NULL DEFAULT 0,
  hours_logged     INTEGER       NOT NULL DEFAULT 0,
  tasks_total      INTEGER       NOT NULL DEFAULT 0,
  tasks_completed  INTEGER       NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE project_members (
  project_id VARCHAR(20) REFERENCES projects(id) ON DELETE CASCADE,
  user_id    UUID        REFERENCES users(id)    ON DELETE CASCADE,
  role       VARCHAR(100),
  PRIMARY KEY (project_id, user_id)
);

-- ── Invoices ───────────────────────────────────────────────────────────────────
CREATE TABLE invoices (
  id          VARCHAR(20)   PRIMARY KEY,
  client_id   UUID          REFERENCES clients(id)   ON DELETE SET NULL,
  project_id  VARCHAR(20)   REFERENCES projects(id)  ON DELETE SET NULL,
  issued_date DATE          NOT NULL,
  due_date    DATE          NOT NULL,
  paid_date   DATE,
  subtotal    NUMERIC(12,2) NOT NULL,
  vat_rate    NUMERIC(5,2)  NOT NULL DEFAULT 0,
  vat_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  total       NUMERIC(12,2) NOT NULL,
  status      VARCHAR(50)   NOT NULL DEFAULT 'Pending'
              CHECK (status IN ('Pending','Paid','Overdue','Cancelled')),
  notes       TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_items (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  VARCHAR(20)   NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(500)  NOT NULL,
  quantity    NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price  NUMERIC(12,2) NOT NULL,
  amount      NUMERIC(12,2) NOT NULL
);

-- ── Finance ────────────────────────────────────────────────────────────────────
CREATE TABLE transactions (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  type        VARCHAR(20)   NOT NULL CHECK (type IN ('Income','Expense')),
  description VARCHAR(500)  NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  txn_date    TIMESTAMPTZ   NOT NULL,
  category    VARCHAR(100),
  reference   VARCHAR(255),
  invoice_id  VARCHAR(20)   REFERENCES invoices(id) ON DELETE SET NULL,
  status      VARCHAR(50)   NOT NULL DEFAULT 'Completed',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE budgets (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(255)  NOT NULL,
  period     VARCHAR(20)   NOT NULL,
  total      NUMERIC(12,2) NOT NULL,
  spent      NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE upcoming_payments (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255)  NOT NULL,
  description VARCHAR(255),
  amount      NUMERIC(12,2) NOT NULL,
  due_date    DATE          NOT NULL,
  status      VARCHAR(50)   NOT NULL DEFAULT 'Scheduled',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── CRM ────────────────────────────────────────────────────────────────────────
CREATE TABLE deals (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(255)  NOT NULL,
  client_id        UUID          REFERENCES clients(id) ON DELETE SET NULL,
  owner_id         UUID          REFERENCES users(id)   ON DELETE SET NULL,
  value            NUMERIC(12,2) NOT NULL DEFAULT 0,
  stage            VARCHAR(50)   NOT NULL DEFAULT 'Lead'
                   CHECK (stage IN ('Lead','Qualified','Proposal','Negotiation','Won','Lost')),
  probability      INTEGER       NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  expected_close   DATE,
  project_id       VARCHAR(20)   REFERENCES projects(id) ON DELETE SET NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Activities ─────────────────────────────────────────────────────────────────
CREATE TABLE activities (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(500) NOT NULL,
  entity_type VARCHAR(100),
  entity_id   VARCHAR(255),
  details     JSONB,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Notifications ──────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  message    TEXT,
  type       VARCHAR(50)  NOT NULL DEFAULT 'info'
             CHECK (type IN ('info','success','warning','error')),
  is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
  link       VARCHAR(500),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Sessions (refresh tokens) ──────────────────────────────────────────────────
CREATE TABLE sessions (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) NOT NULL UNIQUE,
  expires_at    TIMESTAMPTZ  NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────────────────────
CREATE INDEX idx_activities_user    ON activities(user_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_transactions_date  ON transactions(txn_date DESC);
CREATE INDEX idx_invoices_client    ON invoices(client_id);
CREATE INDEX idx_deals_stage        ON deals(stage);
CREATE INDEX idx_sessions_token     ON sessions(refresh_token);

-- ── Updated_at trigger ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER deals_updated_at    BEFORE UPDATE ON deals    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
