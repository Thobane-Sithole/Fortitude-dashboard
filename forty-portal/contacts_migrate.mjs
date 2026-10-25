import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost', port: 5432,
  database: 'forty_portal', user: 'fitss', password: 'fitss_secret_2026',
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name         VARCHAR(255) NOT NULL,
        email        VARCHAR(255),
        phone        VARCHAR(50),
        company      VARCHAR(255),
        job_title    VARCHAR(255),
        address      VARCHAR(500),
        group_name   VARCHAR(20)  CHECK (group_name IN ('work','family','friends','clients')),
        notes        TEXT,
        tags         VARCHAR(500),
        is_favorite  BOOLEAN      NOT NULL DEFAULT false,
        avatar_index INTEGER      NOT NULL DEFAULT 1 CHECK (avatar_index BETWEEN 1 AND 9),
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id)`);

    const { rows: existing } = await client.query(`SELECT COUNT(*) AS cnt FROM contacts`);
    if (parseInt(existing[0].cnt) > 0) {
      console.log('Seed data already present, skipping.');
      await client.query('COMMIT');
      return;
    }

    const { rows: adminRows } = await client.query(
      `SELECT id FROM users WHERE email = 'thobane@fitss.co.za' LIMIT 1`
    );
    if (!adminRows.length) { console.error('Admin user not found'); await client.query('ROLLBACK'); return; }
    const uid = adminRows[0].id;

    const seed = [
      { name: 'Sarah Wilson',    email: 'sarah.wilson@fortyportal.co.za',  phone: '+1 (555) 123-4567', company: 'TechCorp Inc.',     job_title: 'UI/UX Designer',       group_name: 'work',    tags: 'Work,Designer',  is_favorite: true,  avatar_index: 1, address: 'San Francisco, CA', notes: 'Key stakeholder for the design project. Prefers morning meetings.' },
      { name: 'Mike Johnson',    email: 'mike.johnson@fortyportal.co.za',   phone: '+1 (555) 987-6543', company: 'DevStudio LLC',     job_title: 'Software Engineer',    group_name: 'work',    tags: 'Work,Developer', is_favorite: false, avatar_index: 2, address: 'New York, NY', notes: 'Backend specialist. Available for code reviews on Thursdays.' },
      { name: 'Emily Davis',     email: 'emily.davis@fortyportal.co.za',    phone: '+1 (555) 456-7890', company: 'InnovateTech',      job_title: 'Product Manager',      group_name: 'clients', tags: 'Clients,VIP',    is_favorite: true,  avatar_index: 3, address: 'Chicago, IL', notes: 'High-priority client. Contract renewal in Q2.' },
      { name: 'Kabelo Radebe',   email: 'kabelo@fortyportal.co.za',         phone: '+1 (555) 321-6549', company: 'MediaPro Agency',   job_title: 'Marketing Director',   group_name: 'work',    tags: 'Work,Manager',   is_favorite: false, avatar_index: 4, address: 'Los Angeles, CA', notes: 'Head of marketing campaigns. Best reached via email.' },
      { name: 'Lerato Khumalo',  email: 'lerato@fortyportal.co.za',         phone: '+1 (555) 789-1234', company: 'TechCorp Inc.',     job_title: 'HR Manager',           group_name: 'work',    tags: 'Work,Manager',   is_favorite: false, avatar_index: 5, address: 'Johannesburg, ZA', notes: 'HR contact. Great for onboarding queries.' },
      { name: 'Mandla Ngubane',  email: 'mandla@fortyportal.co.za',         phone: '+1 (555) 654-7891', company: 'CodeBase Studios',  job_title: 'Backend Developer',    group_name: 'friends', tags: 'Friends,Developer', is_favorite: false, avatar_index: 6, address: 'Cape Town, ZA', notes: 'Friend and colleague. Good for peer reviews.' },
      { name: 'Zanele Mokoena',  email: 'zanele@fortyportal.co.za',         phone: '+27 (11) 222-3333', company: 'Bright Ideas Co.',  job_title: 'Creative Director',    group_name: 'clients', tags: 'Clients,Designer', is_favorite: true, avatar_index: 7, address: 'Pretoria, ZA', notes: 'Creative partner on the rebrand project.' },
      { name: 'Sipho Dlamini',   email: 'sipho.d@fortyportal.co.za',        phone: '+27 (21) 333-4444', company: 'StellarCode',       job_title: 'Full Stack Developer', group_name: 'work',    tags: 'Work,Developer', is_favorite: false, avatar_index: 8, address: 'Durban, ZA', notes: 'Contracted developer on Project Apollo.' },
      { name: 'Ayesha Nkosi',    email: 'ayesha.n@fortyportal.co.za',       phone: '+27 (31) 444-5555', company: 'Nkosi & Partners',  job_title: 'Legal Advisor',        group_name: 'clients', tags: 'Clients,VIP',    is_favorite: false, avatar_index: 9, address: 'Sandton, ZA', notes: 'Legal advisor for contracts and compliance.' },
      { name: 'James Okonkwo',   email: 'james.o@fortyportal.co.za',        phone: '+234 80 1234-5678', company: 'West Africa Ventures', job_title: 'Business Dev Manager', group_name: 'clients', tags: 'Clients', is_favorite: false, avatar_index: 1, address: 'Lagos, NG', notes: 'Partnership discussions ongoing.' },
      { name: 'Priya Sharma',    email: 'priya.s@fortyportal.co.za',        phone: '+91 98765-43210',   company: 'Infosphere Tech',   job_title: 'Data Scientist',       group_name: 'work',    tags: 'Work,Developer', is_favorite: false, avatar_index: 2, address: 'Mumbai, IN', notes: 'Data pipeline collaboration.' },
      { name: 'Thato Molefe',    email: 'thato@fortyportal.co.za',          phone: '+27 (51) 555-6666', company: 'GreenTech SA',      job_title: 'Project Coordinator',  group_name: 'family',  tags: 'Family',         is_favorite: true,  avatar_index: 3, address: 'Bloemfontein, ZA', notes: 'Family friend and colleague.' },
    ];

    for (const c of seed) {
      await client.query(
        `INSERT INTO contacts(user_id,name,email,phone,company,job_title,address,group_name,notes,tags,is_favorite,avatar_index)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [uid, c.name, c.email, c.phone, c.company, c.job_title, c.address, c.group_name, c.notes, c.tags, c.is_favorite, c.avatar_index]
      );
    }

    await client.query('COMMIT');
    console.log('contacts table created + 12 contacts seeded.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
