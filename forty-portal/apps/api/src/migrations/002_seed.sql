-- Forty Portal Â· Seed Data (real FITSS data)
-- Passwords are bcrypt hashes of "Fitss@2026!" (change before production)

-- â”€â”€ Users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO users (id, name, email, password_hash, role, job_title, department, phone, avatar, status, joined_at) VALUES
('11111111-0000-0000-0000-000000000001','Thobane Sithole',    'thobane@fitss.co.za',  '$2a$12$EZPizVpEJkgdyKw31ATxCu9/ImSoB5zlvwOzorNvyQxOVtBdx.2E6','Admin',    'Co-Founder & CTO',            'Engineering',  '+27 82 000 0001','avatar-1','Active',   '2025-01-01'),
('11111111-0000-0000-0000-000000000002','Bokang Tladi',       'bokang@fitss.co.za',   '$2a$12$EZPizVpEJkgdyKw31ATxCu9/ImSoB5zlvwOzorNvyQxOVtBdx.2E6','Admin',    'Co-Founder & COO',            'Operations',   '+27 82 000 0002','avatar-2','Active',   '2025-01-01'),
('11111111-0000-0000-0000-000000000003','Hilaire Ntibashima', 'hilaire@fitss.co.za',  '$2a$12$EZPizVpEJkgdyKw31ATxCu9/ImSoB5zlvwOzorNvyQxOVtBdx.2E6','Admin',    'Lead Designer & Brand Head',  'Design',       '+27 82 000 0003','avatar-3','Active',   '2025-02-01'),
('11111111-0000-0000-0000-000000000004','Naledi Dlamini',     'naledi@fitss.co.za',   '$2a$12$EZPizVpEJkgdyKw31ATxCu9/ImSoB5zlvwOzorNvyQxOVtBdx.2E6','Admin',    'UI/UX Designer',              'Design',       '+27 82 000 0004','avatar-4','Active',   '2025-03-01'),
('11111111-0000-0000-0000-000000000005','Precious Khumalo',   'precious@fitss.co.za', '$2a$12$EZPizVpEJkgdyKw31ATxCu9/ImSoB5zlvwOzorNvyQxOVtBdx.2E6','Manager',  'Project Manager',             'Operations',   '+27 82 000 0005','avatar-5','Active',   '2025-03-01'),
('11111111-0000-0000-0000-000000000006','Mandla Zulu',        'mandla@fitss.co.za',   '$2a$12$EZPizVpEJkgdyKw31ATxCu9/ImSoB5zlvwOzorNvyQxOVtBdx.2E6','Manager',  'Senior Developer',            'Engineering',  '+27 82 000 0006','avatar-6','Active',   '2025-04-01'),
('11111111-0000-0000-0000-000000000007','Zanele Mokoena',     'zanele@fitss.co.za',   '$2a$12$EZPizVpEJkgdyKw31ATxCu9/ImSoB5zlvwOzorNvyQxOVtBdx.2E6','Finance',  'Finance Manager',             'Finance',      '+27 82 000 0007','avatar-7','Active',   '2025-04-01'),
('11111111-0000-0000-0000-000000000008','Sipho Ndlovu',       'sipho@fitss.co.za',    '$2a$12$EZPizVpEJkgdyKw31ATxCu9/ImSoB5zlvwOzorNvyQxOVtBdx.2E6','Developer','Backend Developer',           'Engineering',  '+27 82 000 0008','avatar-8','Active',   '2025-05-01'),
('11111111-0000-0000-0000-000000000009','Amara Kofi',         'amara@fitss.co.za',    '$2a$12$EZPizVpEJkgdyKw31ATxCu9/ImSoB5zlvwOzorNvyQxOVtBdx.2E6','Developer','Frontend Developer',          'Engineering',  '+27 82 000 0009','avatar-9','Active',   '2025-05-01'),
('11111111-0000-0000-0000-000000000010','Lebo Mokoena',       'lebo@fitss.co.za',     '$2a$12$EZPizVpEJkgdyKw31ATxCu9/ImSoB5zlvwOzorNvyQxOVtBdx.2E6','Developer','Full-Stack Developer',        'Engineering',  '+27 82 000 0010','avatar-4','Active',   '2025-06-01'),
('11111111-0000-0000-0000-000000000011','Kai Dlamini',        'kai@fitss.co.za',      '$2a$12$EZPizVpEJkgdyKw31ATxCu9/ImSoB5zlvwOzorNvyQxOVtBdx.2E6','Developer','Mobile Developer',            'Engineering',  '+27 82 000 0011','avatar-3','Active',   '2025-06-01'),
('11111111-0000-0000-0000-000000000012','Thabo Radebe',       'thabo@fitss.co.za',    '$2a$12$EZPizVpEJkgdyKw31ATxCu9/ImSoB5zlvwOzorNvyQxOVtBdx.2E6','Developer','Junior Developer',            'Engineering',  '+27 82 000 0012','avatar-4','On Leave', '2025-07-01');

-- â”€â”€ Clients â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO clients (id, name, initials, email, industry, contact_person, status) VALUES
('22222222-0000-0000-0000-000000000001','RetailZA Ltd',      'RL','billing@retailza.co.za',           'Retail / E-Commerce',  'Sarah van Wyk',    'Active'),
('22222222-0000-0000-0000-000000000002','FinBank Solutions', 'FB','projects@finbank.co.za',           'Financial Services',   'David Molefe',     'Active'),
('22222222-0000-0000-0000-000000000003','FitLife Wellness',  'FW','finance@fitlifewellness.co.za',    'Health & Wellness',    'Priya Govender',   'Active'),
('22222222-0000-0000-0000-000000000004','MiningCorp Africa', 'MA','procurement@miningcorp.co.za',     'Mining & Resources',   'Johan du Plessis', 'Active'),
('22222222-0000-0000-0000-000000000005','Khumalo Designs',   'KD','studio@khumalodesigns.co.za',      'Creative & Design',    'Nia Khumalo',      'Active');

-- â”€â”€ Projects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO projects (id, name, client_id, description, status, priority, progress, start_date, end_date, total_value, hours_logged, tasks_total, tasks_completed) VALUES
('FP-001','E-Commerce Platform',          '22222222-0000-0000-0000-000000000001','Full-stack e-commerce site with product catalogue, cart, checkout and payment gateway.','Delivered',   'High',   100,'2025-10-01','2026-01-24',45000,  48,12,12),
('FP-002','Banking Integration',          '22222222-0000-0000-0000-000000000002','Core banking API integration with transaction processing and statement generation.',   'Delivered',   'High',   100,'2025-11-01','2026-02-10',60000,  52,15,15),
('FP-003','Health & Wellness App',        '22222222-0000-0000-0000-000000000003','Cross-platform wellness app with workout tracking, nutrition logging and coach portal.','Delivered',   'Medium', 100,'2025-12-01','2026-03-31',22500,  30,10,10),
('FP-004','Corporate Website',            '22222222-0000-0000-0000-000000000004','Corporate website with investor portal, project showcase and contact management.',      'Delivered',   'High',   100,'2026-06-01','2026-09-30',60000,  42,8, 8 ),
('FP-005','Brand Identity & Design System','22222222-0000-0000-0000-000000000005','Full brand identity system - logo suite, typography, colour palette and design guidelines.','In Progress','Medium', 35, '2026-10-01','2026-12-31',35000,  12,12,3 );

-- Project members
INSERT INTO project_members (project_id, user_id, role) VALUES
('FP-001','11111111-0000-0000-0000-000000000001','Tech Lead'),
('FP-001','11111111-0000-0000-0000-000000000008','Backend Developer'),
('FP-001','11111111-0000-0000-0000-000000000009','Frontend Developer'),
('FP-002','11111111-0000-0000-0000-000000000002','Project Lead'),
('FP-002','11111111-0000-0000-0000-000000000008','Backend Developer'),
('FP-003','11111111-0000-0000-0000-000000000011','Mobile Developer'),
('FP-003','11111111-0000-0000-0000-000000000009','Frontend Developer'),
('FP-004','11111111-0000-0000-0000-000000000003','Design Lead'),
('FP-004','11111111-0000-0000-0000-000000000010','Full-Stack Developer'),
('FP-005','11111111-0000-0000-0000-000000000004','Lead Designer'),
('FP-005','11111111-0000-0000-0000-000000000005','Project Manager');

-- â”€â”€ Invoices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO invoices (id, client_id, project_id, issued_date, due_date, paid_date, subtotal, vat_rate, vat_amount, total, status) VALUES
('INV-001','22222222-0000-0000-0000-000000000001','FP-001','2026-01-10','2026-01-24','2026-01-20',45000,0,0,45000,'Paid'),
('INV-002','22222222-0000-0000-0000-000000000002','FP-002','2026-01-15','2026-01-29','2026-01-29',60000,0,0,60000,'Paid'),
('INV-003','22222222-0000-0000-0000-000000000003','FP-003','2026-02-01','2026-02-15','2026-02-14',22500,0,0,22500,'Paid'),
('INV-005','22222222-0000-0000-0000-000000000004','FP-004','2026-02-10','2026-02-24','2026-02-21',60000,0,0,60000,'Paid');

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount) VALUES
('INV-001','E-commerce platform development (full-stack)',1,35000,35000),
('INV-001','Payment gateway integration & testing',       1, 5000, 5000),
('INV-001','Deployment, hosting setup & handover',        1, 5000, 5000),
('INV-002','Core banking API integration',                1,45000,45000),
('INV-002','Transaction processing module',               1,10000,10000),
('INV-002','Statement generation & reporting',            1, 5000, 5000),
('INV-003','Cross-platform wellness app (iOS + Android)', 1,17500,17500),
('INV-003','Coach portal web application',                1, 3500, 3500),
('INV-003','Backend API & database setup',                1, 1500, 1500),
('INV-005','Corporate website design & development',      1,50000,50000),
('INV-005','Investor portal module',                      1, 8000, 8000),
('INV-005','Contact management system',                   1, 2000, 2000);

-- â”€â”€ Transactions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO transactions (type, description, amount, txn_date, category, reference, invoice_id, status) VALUES
('Income', 'Payment from MiningCorp Africa',  60000, '2026-10-21 10:42:00+02','Client Payment',  'INV-005','INV-005','Completed'),
('Expense','Software Subscription',             820,  '2026-10-21 09:00:00+02','Software & Tools',NULL,      NULL,     'Completed'),
('Expense','Cloud Hosting (AWS + Vercel)',      4075, '2026-10-20 15:15:00+02','Infrastructure',  NULL,      NULL,     'Completed'),
('Income', 'Payment from FinBank Solutions',  60000, '2026-01-29 11:00:00+02','Client Payment',  'INV-002','INV-002','Completed'),
('Expense','LinkedIn Premium',                 1200, '2026-10-18 08:30:00+02','Marketing',       NULL,      NULL,     'Completed'),
('Expense','Contractor Payment (Khumalo Designs)',3500,'2026-10-15 16:20:00+02','Contractors',   NULL,      NULL,     'Completed'),
('Income', 'Payment from RetailZA Ltd',       45000, '2026-01-20 14:00:00+02','Client Payment',  'INV-001','INV-001','Completed'),
('Income', 'Payment from FitLife Wellness',   22500, '2026-02-14 09:30:00+02','Client Payment',  'INV-003','INV-003','Completed');

-- â”€â”€ Budgets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO budgets (name, period, total, spent) VALUES
('LinkedIn & Outreach', 'Q4 2026',  10000, 6000),
('Operations',          'Q4 2026',  60000,33000),
('Payroll',             'Q4 2026',  60000,52800),
('Software & Tools',    'Q4 2026',  10000, 6800);

-- â”€â”€ Upcoming Payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO upcoming_payments (name, description, amount, due_date) VALUES
('Payroll Run',        '12 employees',        24000,'2026-11-01'),
('Adobe Creative Cloud','Subscription renewal',  820,'2026-11-03'),
('AWS Cloud Hosting',  'Monthly server costs', 4075,'2026-11-05'),
('LinkedIn Premium',   'Monthly subscription', 1200,'2026-11-10'),
('Xero Accounting',    'Accounting software',   450,'2026-11-15');

-- â”€â”€ CRM Deals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO deals (name, client_id, owner_id, value, stage, probability, expected_close, project_id) VALUES
('FP-001 E-Commerce Platform',           '22222222-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001',45000,'Won',  100,'2026-01-24','FP-001'),
('FP-002 Banking Integration',           '22222222-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002',60000,'Won',  100,'2026-02-10','FP-002'),
('FP-003 Health & Wellness App',         '22222222-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000009',22500,'Won',  100,'2026-03-31','FP-003'),
('FP-004 Corporate Website',             '22222222-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000003',60000,'Won',  100,'2026-09-30','FP-004'),
('FP-005 Brand Identity & Design System','22222222-0000-0000-0000-000000000005','11111111-0000-0000-0000-000000000004',35000,'Negotiation',80,'2026-12-31','FP-005'),
('New Prospect - TechStart SA',            NULL,                                  '11111111-0000-0000-0000-000000000002',45000,'Qualified',40,'2027-02-28',NULL);

-- â”€â”€ Activities â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO activities (user_id, action, entity_type, entity_id, created_at) VALUES
('11111111-0000-0000-0000-000000000001','Marked INV-005 as Paid',         'invoice','INV-005','2026-10-21 10:42:00+02'),
('11111111-0000-0000-0000-000000000001','Updated FP-005 progress to 35%', 'project','FP-005', '2026-10-20 14:30:00+02'),
('11111111-0000-0000-0000-000000000005','Created milestone: Logo Delivery','project','FP-005', '2026-10-19 11:00:00+02'),
('11111111-0000-0000-0000-000000000004','Uploaded brand audit document',   'project','FP-005', '2026-10-18 16:00:00+02'),
('11111111-0000-0000-0000-000000000001','Added TechStart SA as new lead',  'deal',   NULL,      '2026-10-17 09:30:00+02'),
('11111111-0000-0000-0000-000000000002','Closed FP-004 with MiningCorp',   'project','FP-004', '2026-10-01 10:00:00+02'),
('11111111-0000-0000-0000-000000000003','Completed FP-004 handover',       'project','FP-004', '2026-09-30 17:00:00+02');

-- â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO notifications (user_id, title, message, type, is_read, link) VALUES
('11111111-0000-0000-0000-000000000001','Payment Received',    'MiningCorp Africa paid INV-005 (R60,000).',           'success',FALSE,'/invoices/INV-005'),
('11111111-0000-0000-0000-000000000001','FP-005 Update',       'Brand audit document uploaded by Hilaire.',            'info',  FALSE,'/projects/FP-005'),
('11111111-0000-0000-0000-000000000001','New Lead Added',      'TechStart SA added to CRM pipeline.',                  'info',  FALSE,'/crm'),
('11111111-0000-0000-0000-000000000001','Deadline Approaching','FP-005 logo delivery due Oct 30.',                     'warning',FALSE,'/projects/FP-005'),
('11111111-0000-0000-0000-000000000001','Payroll Reminder',    'November payroll run scheduled for Nov 1 (R24,000).',  'warning',TRUE, '/finance');
