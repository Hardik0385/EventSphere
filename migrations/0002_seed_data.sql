-- Migration 0002: Seed Data for EventSphere
-- All seed accounts use password: password123 (hashed via PBKDF2-SHA256, 100000 iterations)

-- Insert Users
INSERT OR IGNORE INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES
('usr-admin-001', 'Dr. Sarah Jenkins', 'admin@eventsphere.cloud', 'a1b2c3d4e5f60718293a4b5c6d7e8f90:f9afe371d9faabafc81ebf27026dbe1d3b7bfd793bed1ec340c02ba645b49c15', 'admin', datetime('now', '-30 days'), datetime('now', '-30 days')),
('usr-org-001', 'Alex Rivera', 'organizer@eventsphere.cloud', 'a1b2c3d4e5f60718293a4b5c6d7e8f90:f9afe371d9faabafc81ebf27026dbe1d3b7bfd793bed1ec340c02ba645b49c15', 'organizer', datetime('now', '-25 days'), datetime('now', '-25 days')),
('usr-org-002', 'Elena Rostova', 'organizer2@eventsphere.cloud', 'a1b2c3d4e5f60718293a4b5c6d7e8f90:f9afe371d9faabafc81ebf27026dbe1d3b7bfd793bed1ec340c02ba645b49c15', 'organizer', datetime('now', '-20 days'), datetime('now', '-20 days')),
('usr-part-001', 'Jordan Lee', 'participant@eventsphere.cloud', 'a1b2c3d4e5f60718293a4b5c6d7e8f90:f9afe371d9faabafc81ebf27026dbe1d3b7bfd793bed1ec340c02ba645b49c15', 'participant', datetime('now', '-15 days'), datetime('now', '-15 days')),
('usr-part-002', 'Maya Chen', 'student2@eventsphere.cloud', 'a1b2c3d4e5f60718293a4b5c6d7e8f90:f9afe371d9faabafc81ebf27026dbe1d3b7bfd793bed1ec340c02ba645b49c15', 'participant', datetime('now', '-10 days'), datetime('now', '-10 days')),
('usr-part-003', 'Liam Davis', 'student3@eventsphere.cloud', 'a1b2c3d4e5f60718293a4b5c6d7e8f90:f9afe371d9faabafc81ebf27026dbe1d3b7bfd793bed1ec340c02ba645b49c15', 'participant', datetime('now', '-8 days'), datetime('now', '-8 days'));

-- Insert Events
INSERT OR IGNORE INTO events (id, organizer_id, title, description, category, location, start_time, end_time, capacity, status, created_at, updated_at) VALUES
('evt-001', 'usr-org-001', 'Global Cloud Native & Edge Summit 2026', 'A premier gathering exploring high-performance edge compute, distributed data caching, and serverless architectures with Cloudflare Workers and D1.', 'Cloud Computing', 'Main Auditorium & Live Virtual Stream', datetime('now', '+10 days', '09:00:00'), datetime('now', '+10 days', '17:00:00'), 150, 'published', datetime('now', '-20 days'), datetime('now', '-20 days')),

('evt-002', 'usr-org-001', 'Hands-on Serverless & SQLite at the Edge', 'Interactive masterclass on building zero-cold-start web APIs with Hono, TypeScript, and edge databases. Attendees receive verifiable micro-credentials.', 'Serverless & Edge', 'Innovation Lab 304, Tech Park', datetime('now', '+14 days', '14:00:00'), datetime('now', '+14 days', '18:00:00'), 50, 'published', datetime('now', '-18 days'), datetime('now', '-18 days')),

('evt-003', 'usr-org-002', 'AI & Distributed Systems Hackathon', '48-hour collaborative build sprint designing intelligent distributed systems, serverless event pipelines, and real-time streaming tools.', 'Artificial Intelligence', 'Cyber Arena, Engineering Block C', datetime('now', '+21 days', '10:00:00'), datetime('now', '+23 days', '16:00:00'), 80, 'published', datetime('now', '-12 days'), datetime('now', '-12 days')),

('evt-004', 'usr-org-002', 'DevOps & GitOps Cloud Infrastructure Workshop', 'Learn infrastructure as code, automated continuous deployments via Cloudflare Pages and GitHub Actions, and canary rollout strategies.', 'DevOps & Cloud', 'Online via Secure Stream', datetime('now', '+5 days', '15:00:00'), datetime('now', '+5 days', '18:30:00'), 60, 'published', datetime('now', '-7 days'), datetime('now', '-7 days')),

('evt-005', 'usr-org-001', 'Annual University Tech Odyssey 2026', 'Flagship university technical exposition showcasing student projects, industry keynotes, project demonstrations, and networking booths.', 'College Festival', 'Grand Convention Hall', datetime('now', '+30 days', '09:30:00'), datetime('now', '+30 days', '19:00:00'), 250, 'published', datetime('now', '-5 days'), datetime('now', '-5 days')),

('evt-006', 'usr-org-002', 'Design Systems for Cloud Platforms', 'Deep dive into crafting accessible, responsive user experiences and dark-mode dashboards with Tailwind CSS and React component architectures.', 'UI/UX & Design', 'Design Center Room 102', datetime('now', '+18 days', '11:00:00'), datetime('now', '+18 days', '14:00:00'), 40, 'published', datetime('now', '-3 days'), datetime('now', '-3 days'));

-- Insert Sample Registrations
INSERT OR IGNORE INTO registrations (id, event_id, user_id, ticket_code, registration_status, created_at) VALUES
('reg-001', 'evt-001', 'usr-part-001', 'ES-CLOUD-89421', 'confirmed', datetime('now', '-14 days')),
('reg-002', 'evt-002', 'usr-part-001', 'ES-SRVLS-33910', 'confirmed', datetime('now', '-12 days')),
('reg-003', 'evt-001', 'usr-part-002', 'ES-CLOUD-11492', 'confirmed', datetime('now', '-9 days')),
('reg-004', 'evt-003', 'usr-part-002', 'ES-AIHKT-77218', 'confirmed', datetime('now', '-8 days')),
('reg-005', 'evt-001', 'usr-part-003', 'ES-CLOUD-66389', 'confirmed', datetime('now', '-6 days')),
('reg-006', 'evt-004', 'usr-part-003', 'ES-DVCOP-55019', 'confirmed', datetime('now', '-4 days'));

-- Insert Sample Check-Ins
INSERT OR IGNORE INTO check_ins (id, registration_id, checked_in_at, verified_by) VALUES
('chk-001', 'reg-001', datetime('now', '-13 days'), 'usr-org-001'),
('chk-002', 'reg-003', datetime('now', '-8 days'), 'usr-org-001');

-- Insert Sample Audit Logs
INSERT OR IGNORE INTO audit_logs (id, actor_id, action, entity_type, entity_id, created_at) VALUES
('log-001', 'usr-admin-001', 'SYSTEM_BOOTSTRAP', 'SYSTEM', 'SYSTEM', datetime('now', '-30 days')),
('log-002', 'usr-org-001', 'EVENT_CREATED', 'EVENT', 'evt-001', datetime('now', '-20 days')),
('log-003', 'usr-part-001', 'EVENT_REGISTER', 'REGISTRATION', 'reg-001', datetime('now', '-14 days')),
('log-004', 'usr-org-001', 'TICKET_CHECKIN', 'CHECK_IN', 'chk-001', datetime('now', '-13 days'));
