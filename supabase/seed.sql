-- supabase/seed.sql
-- Run AFTER creating a user via Supabase Auth dashboard
-- Replace '<YOUR_USER_ID>' with your auth.users id

INSERT INTO leads (name, phone, email, role_title, organization, status, source, notes, user_id) VALUES
('שרה כהן',    '050-1234567', 'sarah@school.co.il',  'מזכירה',   'בית ספר רמת גן',   'new',          'facebook',  '',               '<YOUR_USER_ID>'),
('ישראל לוי',  '052-9876543', 'israel@tlv.gov.il',   'רכז',      'עיריית תל אביב',   'in_progress',  'referral',  'שלחנו הצעה',     '<YOUR_USER_ID>'),
('מיה אברהם',  '054-1112233', 'maya@garden.co.il',   'מנהלת',    'גן ילדים פרחים',   'closed',       'whatsapp',  'עסקה נסגרה 3k', '<YOUR_USER_ID>'),
('דוד מזרחי',  '053-4455667', 'david@jlm.gov.il',    'מנהל',     'עיריית ירושלים',   'not_relevant', 'outbound',  'לא מתאים',      '<YOUR_USER_ID>'),
('רות שמיר',   '058-7778899', 'ruth@edu.org.il',     'מורה',     'בית ספר הרצליה',   'details_sent', 'facebook',  'מחכה לתגובה',   '<YOUR_USER_ID>');
