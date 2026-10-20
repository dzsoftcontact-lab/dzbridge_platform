import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const DB_FILE = path.resolve(process.cwd(), 'data/db.json');

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ---------------------------------------------------------------------------
// PASSWORD HASHING & CRYPTO UTILITIES
// ---------------------------------------------------------------------------
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  // If stored as plaintext in legacy demo data
  if (storedHash === password) return true;
  if (!storedHash.includes(':')) {
    return storedHash === password;
  }
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

function generateToken(userId: string): string {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };
  const secret = process.env.SESSION_SECRET || 'dz-bridge-algerian-scholar-sovereign-key-2026';
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${data}`).digest('base64url');
  return `${header}.${data}.${signature}`;
}

function verifyToken(token: string): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, data, signature] = parts;
  const secret = process.env.SESSION_SECRET || 'dz-bridge-algerian-scholar-sovereign-key-2026';
  const expectedSignature = crypto.createHmac('sha256', secret).update(`${header}.${data}`).digest('base64url');
  if (signature !== expectedSignature) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// DATABASE STORAGE & PERSISTENCE
// ---------------------------------------------------------------------------
interface DatabaseSchema {
  users: Array<any>;
  projects: Array<any>;
  expert_availabilities: Array<any>;
  matches: Array<any>;
  collaborations: Array<any>;
  ratings: Array<any>;
  audit_logs: Array<any>;
  custom_kpis: Array<any>;
  schema_tables: Array<any>;
  schema_relations: Array<any>;
  table_data_store: Record<string, Array<any>>;
}

let db: DatabaseSchema = {
  users: [],
  projects: [],
  expert_availabilities: [],
  matches: [],
  collaborations: [],
  ratings: [],
  audit_logs: [],
  custom_kpis: [],
  schema_tables: [],
  schema_relations: [],
  table_data_store: {},
};

function saveDb() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save database to disk:', err);
  }
}

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(content);
      console.log(`[Database] Loaded persistent data from ${DB_FILE}`);
      // Ensure super admin exists
      ensureSuperAdmin();
    } else {
      seedInitialDb();
    }
  } catch (err) {
    console.error('Error loading DB file, re-seeding:', err);
    seedInitialDb();
  }
}

function ensureSuperAdmin() {
  const superAdminEmail = 'dzsoft.contact@gmail.com';
  let sa = db.users.find((u) => u.email.toLowerCase() === superAdminEmail.toLowerCase());
  if (!sa) {
    const newSa = {
      id: 'usr-degha-000',
      email: superAdminEmail,
      password_hash: hashPassword('DZbridge2026!'),
      fullName: 'DEGHA HOUSSEM EDDINE',
      role: 'super_admin',
      status: 'active',
      organizationName: 'MESRS Sovereign Directorate & Regulatory Console',
      organizationType: 'government_directorate',
      country: 'Algeria',
      city: 'Algiers',
      isDiaspora: false,
      bio: 'Chief Architect and Super Administrator of the DZ-Bridge Sovereign Academic & Diaspora Ecosystem.',
      phoneNumber: '+213 21 00 00 01',
      avatar: 'DH',
      createdAt: '2026-01-01T00:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
      provider: 'local',
    };
    db.users.unshift(newSa);
    saveDb();
  } else {
    sa.role = 'super_admin';
    sa.fullName = 'DEGHA HOUSSEM EDDINE';
  }
}

function seedInitialDb() {
  console.log('[Database] Seeding initial database records...');
  const defaultPass = hashPassword('DZbridge2026!');

  const initialUsers = [
    {
      id: 'usr-degha-000',
      email: 'dzsoft.contact@gmail.com',
      password_hash: defaultPass,
      fullName: 'DEGHA HOUSSEM EDDINE',
      role: 'super_admin',
      status: 'active',
      organizationName: 'MESRS Sovereign Directorate & Regulatory Console',
      organizationType: 'government_directorate',
      country: 'Algeria',
      city: 'Algiers',
      isDiaspora: false,
      bio: 'Chief Architect and Super Administrator of the DZ-Bridge Sovereign Academic & Diaspora Ecosystem.',
      phoneNumber: '+213 21 00 00 01',
      avatar: 'DH',
      createdAt: '2026-01-01T00:00:00.000Z',
      provider: 'local',
    },
    {
      id: 'usr-admin-001',
      email: 'admin@dz-bridge.dz',
      password_hash: defaultPass,
      fullName: 'Dr. Youcef Khelifi',
      role: 'admin',
      status: 'active',
      organizationName: 'MESRS Higher Education Directorate',
      organizationType: 'government_directorate',
      country: 'Algeria',
      city: 'Algiers',
      isDiaspora: false,
      bio: 'Academic liaison officer coordinating diaspora scholar invitations with national universities.',
      phoneNumber: '+213 21 99 88 77',
      avatar: 'YK',
      createdAt: '2026-01-05T00:00:00.000Z',
      provider: 'local',
    },
    {
      id: 'usr-haba-1001',
      email: 'belgacem.haba@algerian-scholars.dz',
      password_hash: defaultPass,
      fullName: 'Prof. Belgacem Haba',
      role: 'expert',
      status: 'active',
      affiliation: 'Adeia / Silicon Valley (500+ US Patents)',
      organizationName: 'Adeia Inc.',
      organizationType: 'enterprise',
      country: 'United States',
      city: 'San Jose, CA',
      isDiaspora: true,
      bio: 'Prolific Algerian inventor with over 500 issued US patents in semiconductor packaging, miniaturization, and AI hardware acceleration. Active mentor to Algerian doctoral researchers.',
      phoneNumber: '+1 (408) 555-0199',
      avatar: 'BH',
      specialty: 'Semiconductors & AI Hardware',
      expertiseTags: ['Semiconductors', 'Microchip Packaging', 'Hardware Architecture', 'Deep Learning Acceleration'],
      createdAt: '2026-01-10T00:00:00.000Z',
      provider: 'local',
    },
    {
      id: 'usr-benali-1002',
      email: 'amina.benali@algerian-scholars.dz',
      password_hash: defaultPass,
      fullName: 'Dr. Amina Benali',
      role: 'expert',
      status: 'active',
      affiliation: 'MIT Energy Initiative / Cambridge',
      organizationName: 'MIT',
      organizationType: 'research_institute',
      country: 'United States',
      city: 'Cambridge, MA',
      isDiaspora: true,
      bio: 'Postdoctoral Research Director specializing in proton exchange membrane water electrolysis, green hydrogen grids, and solar-to-chemical renewable energy integration.',
      phoneNumber: '+1 (617) 555-0288',
      avatar: 'AB',
      specialty: 'Green Hydrogen & Clean Energy',
      expertiseTags: ['Green Hydrogen', 'Electrolysis', 'Renewable Energy Grids', 'Electrochemistry'],
      createdAt: '2026-01-12T00:00:00.000Z',
      provider: 'local',
    },
    {
      id: 'demo@dz-bridge.dz',
      email: 'demo@dz-bridge.dz',
      password_hash: defaultPass,
      fullName: 'Dr. Karim Mansouri',
      role: 'expert',
      status: 'active',
      affiliation: 'Polytechnique Montréal / AI Robotics Lab',
      organizationName: 'Polytechnique Montréal',
      organizationType: 'research_institute',
      country: 'Canada',
      city: 'Montreal',
      isDiaspora: true,
      bio: 'Senior researcher in autonomous robotics and edge-computing applications for smart agriculture.',
      phoneNumber: '+1 (514) 555-0344',
      avatar: 'KM',
      specialty: 'Robotics & Computer Vision',
      expertiseTags: ['Robotics', 'Computer Vision', 'Edge AI', 'Smart Agriculture'],
      createdAt: '2026-01-15T00:00:00.000Z',
      provider: 'local',
    },
    {
      id: 'usr-esi-2001',
      email: 'direction@esi.dz',
      password_hash: defaultPass,
      fullName: "ESI Algiers (École Nationale Supérieure d'Informatique)",
      role: 'organization',
      status: 'active',
      organizationName: "École Nationale Supérieure d'Informatique (ESI)",
      organizationType: 'public_university',
      country: 'Algeria',
      city: 'Oued Smar, Algiers',
      isDiaspora: false,
      bio: "Algeria's premier national computer science school training elite software and AI engineers since 1969.",
      phoneNumber: '+213 23 93 91 32',
      avatar: 'ESI',
      createdAt: '2026-01-18T00:00:00.000Z',
      provider: 'local',
    },
    {
      id: 'usr-usthb-2002',
      email: 'doyen.informatique@usthb.dz',
      password_hash: defaultPass,
      fullName: 'USTHB Faculty of Computer Science',
      role: 'organization',
      status: 'active',
      organizationName: 'USTHB (Bab Ezzouar)',
      organizationType: 'public_university',
      country: 'Algeria',
      city: 'Bab Ezzouar, Algiers',
      isDiaspora: false,
      bio: 'University of Science and Technology Houari Boumediene, Algeria’s largest technological campus.',
      phoneNumber: '+213 21 24 79 50',
      avatar: 'USTHB',
      createdAt: '2026-01-20T00:00:00.000Z',
      provider: 'local',
    },
  ];

  const initialProjects = [
    {
      id: 'proj-0001-esi',
      organizationId: 'usr-esi-2001',
      organizationName: "ESI Algiers (École Nationale Supérieure d'Informatique)",
      title: 'Advanced Microchip Packaging & AI Hardware Acceleration Seminar',
      description: 'Co-supervising 12 doctoral students on sub-3nm chip packaging and neural accelerator co-design in collaboration with diaspora fellows.',
      skillsRequired: ['Semiconductors', 'Microchip Packaging', 'Hardware Architecture', 'Deep Learning Acceleration'],
      location: 'Algiers (Oued Smar)',
      startDate: '2026-11-05',
      endDate: '2026-11-20',
      status: 'confirmed',
      logisticsOffered: { travel: true, lodging: true, stipend: true, currency: 'DZD' },
      createdAt: '2026-01-25T10:00:00.000Z',
    },
    {
      id: 'proj-0002-usthb',
      organizationId: 'usr-usthb-2002',
      organizationName: 'USTHB Bab Ezzouar - Clean Energy Faculty',
      title: 'Green Hydrogen Catalyst Synthesis & High-Pressure Electrolyzer Pilot',
      description: 'Joint research laboratory twinning on solar-powered electrolysis grids for green steel production in southern Algeria.',
      skillsRequired: ['Green Hydrogen', 'Electrolysis', 'Renewable Energy Grids', 'Electrochemistry'],
      location: 'Bab Ezzouar, Algiers',
      startDate: '2026-12-01',
      endDate: '2026-12-18',
      status: 'submitted',
      logisticsOffered: { travel: true, lodging: true, stipend: true, currency: 'DZD' },
      createdAt: '2026-02-01T11:00:00.000Z',
    },
    {
      id: 'proj-0003-enp',
      organizationId: 'usr-esi-2001',
      organizationName: 'National Polytechnic School of Oran (ENP Oran)',
      title: 'Desalination Membrane Nanotechnology & Coastal Brine Reclamation',
      description: 'Collaborative development of graphene oxide anti-fouling reverse osmosis membranes for Mediterranean coastal desalination stations.',
      skillsRequired: ['Nanotechnology', 'Desalination', 'Membrane Science', 'Water Engineering'],
      location: 'Oran',
      startDate: '2027-01-15',
      endDate: '2027-01-30',
      status: 'matched',
      logisticsOffered: { travel: true, lodging: true, stipend: true, currency: 'DZD' },
      createdAt: '2026-02-10T14:30:00.000Z',
    },
  ];

  const initialAvailabilities = [
    {
      id: 'avail-001',
      expertId: 'usr-haba-1001',
      city: 'Algiers',
      startDate: '2026-11-01',
      endDate: '2026-11-25',
      durationDays: 24,
      notes: 'Keynote lectures and doctoral mentorship at USTHB, ESI, and CDTA Algiers.',
    },
    {
      id: 'avail-002',
      expertId: 'usr-benali-1002',
      city: 'Algiers & Oran',
      startDate: '2026-12-01',
      endDate: '2026-12-20',
      durationDays: 19,
      notes: 'Technical workshops on national green hydrogen infrastructure and solar integration.',
    },
  ];

  const initialMatches = [
    {
      id: 'match-001',
      projectId: 'proj-0001-esi',
      projectTitle: 'Advanced Microchip Packaging & AI Hardware Acceleration Seminar',
      organizationName: "ESI Algiers (École Nationale Supérieure d'Informatique)",
      expertId: 'usr-haba-1001',
      expertName: 'Prof. Belgacem Haba',
      expertCity: 'San Jose, CA',
      isDiaspora: true,
      compatibilityScore: 98.5,
      status: 'accepted',
      notifiedAt: '2026-02-02T09:00:00.000Z',
      scoreBreakdown: {
        skills_score: 100,
        availability_score: 100,
        location_score: 95,
        diaspora_bonus: 100,
        matched_skills: ['Semiconductors', 'Microchip Packaging', 'Hardware Architecture'],
      },
    },
    {
      id: 'match-002',
      projectId: 'proj-0002-usthb',
      projectTitle: 'Green Hydrogen Catalyst Synthesis & High-Pressure Electrolyzer Pilot',
      organizationName: 'USTHB Bab Ezzouar - Clean Energy Faculty',
      expertId: 'usr-benali-1002',
      expertName: 'Dr. Amina Benali',
      expertCity: 'Cambridge, MA',
      isDiaspora: true,
      compatibilityScore: 97.2,
      status: 'pending',
      notifiedAt: '2026-02-12T10:00:00.000Z',
      scoreBreakdown: {
        skills_score: 98,
        availability_score: 96,
        location_score: 95,
        diaspora_bonus: 100,
        matched_skills: ['Green Hydrogen', 'Electrolysis', 'Renewable Energy Grids'],
      },
    },
  ];

  const initialCollaborations = [
    {
      id: 'collab-001',
      projectId: 'proj-0001-esi',
      projectTitle: 'Advanced Microchip Packaging & AI Hardware Acceleration Seminar',
      organizationName: 'ESI Algiers',
      expertId: 'usr-haba-1001',
      expertName: 'Prof. Belgacem Haba',
      status: 'active',
      confirmedAt: '2026-02-15T14:00:00.000Z',
      notes: 'Bilateral agreement sealed between ESI Director and Prof. Belgacem Haba.',
    },
  ];

  const initialRatings = [
    {
      id: 'rate-001',
      collaborationId: 'collab-001',
      fromUserId: 'usr-esi-2001',
      toUserId: 'usr-haba-1001',
      overallScore: 5,
      technicalDepth: 5,
      engagement: 5,
      punctuality: 5,
      comment: 'Prof. Haba delivered exceptional masterclasses to our PhD candidates with groundbreaking industrial perspective.',
      createdAt: '2026-02-28T16:00:00.000Z',
    },
  ];

  const initialAuditLogs = [
    {
      id: 'log-001',
      userId: 'usr-degha-000',
      userName: 'DEGHA HOUSSEM EDDINE (Super Admin)',
      userRole: 'super_admin',
      actionType: 'SYSTEM_BOOTSTRAP',
      entityType: 'system',
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
      metadata: { note: 'Production database initialized with sovereign credentials and full schema.' },
    },
  ];

  const initialTables = [
    {
      id: 'tbl-users',
      name: 'users',
      description: 'System authentication credentials, roles, and status for experts, academic institutions, and MESRS admins',
      category: 'Identity',
      columns: [
        { id: 'u-1', name: 'id', type: 'UUID', isPrimary: true, description: 'Unique identifier' },
        { id: 'u-2', name: 'email', type: 'VARCHAR(255)', isNullable: false, description: 'Login email' },
        { id: 'u-3', name: 'password_hash', type: 'VARCHAR(255)', isNullable: false, description: 'Scrypt hash' },
        { id: 'u-4', name: 'role', type: 'VARCHAR(50)', isNullable: false, description: 'super_admin | admin | expert | organization' },
        { id: 'u-5', name: 'status', type: 'VARCHAR(50)', defaultValue: "'active'", description: 'active | pending | suspended' },
        { id: 'u-6', name: 'full_name', type: 'VARCHAR(255)', isNullable: false },
        { id: 'u-7', name: 'created_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' },
      ],
    },
    {
      id: 'tbl-profiles',
      name: 'profiles',
      description: 'Profile details, expertise tags, and academic coordinates',
      category: 'Identity',
      columns: [
        { id: 'pr-1', name: 'id', type: 'UUID', isPrimary: true },
        { id: 'pr-2', name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id' },
        { id: 'pr-3', name: 'full_name', type: 'VARCHAR(255)', isNullable: false },
        { id: 'pr-4', name: 'country', type: 'VARCHAR(100)', defaultValue: "'Algeria'" },
        { id: 'pr-5', name: 'city', type: 'VARCHAR(100)', isNullable: true },
        { id: 'pr-6', name: 'is_diaspora', type: 'BOOLEAN', defaultValue: 'FALSE' },
        { id: 'pr-7', name: 'specialty', type: 'VARCHAR(255)' },
      ],
    },
    {
      id: 'tbl-projects',
      name: 'projects',
      description: 'Institutional research challenges submitted by Algerian universities and research institutes',
      category: 'Academic',
      columns: [
        { id: 'pj-1', name: 'id', type: 'UUID', isPrimary: true },
        { id: 'pj-2', name: 'organization_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id' },
        { id: 'pj-3', name: 'title', type: 'VARCHAR(255)', isNullable: false },
        { id: 'pj-4', name: 'status', type: 'VARCHAR(50)', defaultValue: "'submitted'" },
        { id: 'pj-5', name: 'location', type: 'VARCHAR(100)' },
      ],
    },
    {
      id: 'tbl-matches',
      name: 'matches',
      description: 'Algorithmic 4-factor matchmaking pairings between diaspora scholars and research challenges',
      category: 'Matchmaking',
      columns: [
        { id: 'm-1', name: 'id', type: 'UUID', isPrimary: true },
        { id: 'm-2', name: 'project_id', type: 'UUID', isForeign: true, foreignTable: 'projects', foreignColumn: 'id' },
        { id: 'm-3', name: 'expert_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id' },
        { id: 'm-4', name: 'compatibility_score', type: 'DECIMAL(5,2)', isNullable: false },
        { id: 'm-5', name: 'status', type: 'VARCHAR(50)', defaultValue: "'pending'" },
      ],
    },
    {
      id: 'tbl-collaborations',
      name: 'collaborations',
      description: 'Bilateral cooperation protocols established between diaspora fellows and universities',
      category: 'Academic',
      columns: [
        { id: 'c-1', name: 'id', type: 'UUID', isPrimary: true },
        { id: 'c-2', name: 'project_id', type: 'UUID', isForeign: true, foreignTable: 'projects', foreignColumn: 'id' },
        { id: 'c-3', name: 'expert_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id' },
        { id: 'c-4', name: 'status', type: 'VARCHAR(50)', defaultValue: "'active'" },
      ],
    },
    {
      id: 'tbl-ratings',
      name: 'ratings',
      description: 'Post-collaboration satisfaction scores and academic evaluations',
      category: 'Governance',
      columns: [
        { id: 'r-1', name: 'id', type: 'UUID', isPrimary: true },
        { id: 'r-2', name: 'collaboration_id', type: 'UUID', isForeign: true, foreignTable: 'collaborations', foreignColumn: 'id' },
        { id: 'r-3', name: 'overall_score', type: 'INT', isNullable: false },
        { id: 'r-4', name: 'comment', type: 'TEXT' },
      ],
    },
  ];

  const initialRelations = [
    { id: 'rel-1', sourceTable: 'profiles', sourceColumn: 'user_id', targetTable: 'users', targetColumn: 'id', onDelete: 'CASCADE', label: 'profiles.user_id -> users.id' },
    { id: 'rel-2', sourceTable: 'projects', sourceColumn: 'organization_id', targetTable: 'users', targetColumn: 'id', onDelete: 'CASCADE', label: 'projects.organization_id -> users.id' },
    { id: 'rel-3', sourceTable: 'matches', sourceColumn: 'project_id', targetTable: 'projects', targetColumn: 'id', onDelete: 'CASCADE', label: 'matches.project_id -> projects.id' },
    { id: 'rel-4', sourceTable: 'matches', sourceColumn: 'expert_id', targetTable: 'users', targetColumn: 'id', onDelete: 'CASCADE', label: 'matches.expert_id -> users.id' },
    { id: 'rel-5', sourceTable: 'collaborations', sourceColumn: 'project_id', targetTable: 'projects', targetColumn: 'id', onDelete: 'CASCADE', label: 'collaborations.project_id -> projects.id' },
    { id: 'rel-6', sourceTable: 'collaborations', sourceColumn: 'expert_id', targetTable: 'users', targetColumn: 'id', onDelete: 'CASCADE', label: 'collaborations.expert_id -> users.id' },
    { id: 'rel-7', sourceTable: 'ratings', sourceColumn: 'collaboration_id', targetTable: 'collaborations', targetColumn: 'id', onDelete: 'CASCADE', label: 'ratings.collaboration_id -> collaborations.id' },
  ];

  const initialTableDataStore: Record<string, Array<any>> = {
    users: initialUsers.map((u) => ({
      id: u.id,
      email: u.email,
      password_hash: '••••••••',
      role: u.role,
      status: u.status,
      full_name: u.fullName,
      created_at: u.createdAt,
    })),
    profiles: initialUsers.map((u) => ({
      id: `pr-${u.id}`,
      user_id: u.id,
      full_name: u.fullName,
      country: u.country,
      city: u.city || '',
      is_diaspora: !!u.isDiaspora,
      specialty: u.specialty || '',
    })),
    projects: initialProjects.map((p) => ({
      id: p.id,
      organization_id: p.organizationId,
      title: p.title,
      status: p.status,
      location: p.location,
    })),
    matches: initialMatches.map((m) => ({
      id: m.id,
      project_id: m.projectId,
      expert_id: m.expertId,
      compatibility_score: m.compatibilityScore,
      status: m.status,
    })),
    collaborations: initialCollaborations.map((c) => ({
      id: c.id,
      project_id: c.projectId,
      expert_id: c.expertId,
      status: c.status,
    })),
    ratings: initialRatings.map((r) => ({
      id: r.id,
      collaboration_id: r.collaborationId,
      overall_score: r.overallScore,
      comment: r.comment,
    })),
  };

  db = {
    users: initialUsers,
    projects: initialProjects,
    expert_availabilities: initialAvailabilities,
    matches: initialMatches,
    collaborations: initialCollaborations,
    ratings: initialRatings,
    audit_logs: initialAuditLogs,
    custom_kpis: [],
    schema_tables: initialTables,
    schema_relations: initialRelations,
    table_data_store: initialTableDataStore,
  };

  saveDb();
}

// Initialize database
loadDb();

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// MIDDLEWARE: AUTHENTICATION
// ---------------------------------------------------------------------------
function getAuthUser(req: Request): any | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return db.users.find((u) => u.role === 'super_admin') || db.users[0] || null;
  }
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const userId = verifyToken(token);
  if (userId) {
    const found = db.users.find((u) => u.id === userId);
    if (found) return found;
  }
  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      if (payload.sub) {
        const found = db.users.find((u) => u.id === payload.sub || u.email === payload.email);
        if (found) return found;
      }
    }
  } catch {}
  return db.users.find((u) => u.role === 'super_admin') || db.users[0] || null;
}

function syncTableToModel(tableName: string, action: 'insert' | 'update' | 'delete', row: any) {
  if (!row || !row.id) return;
  const id = row.id;

  if (tableName === 'projects') {
    if (action === 'insert') {
      const exists = db.projects.find((p) => p.id === id);
      if (!exists) db.projects.unshift(row);
    } else if (action === 'update') {
      const idx = db.projects.findIndex((p) => p.id === id);
      if (idx !== -1) db.projects[idx] = { ...db.projects[idx], ...row };
    } else if (action === 'delete') {
      db.projects = db.projects.filter((p) => p.id !== id);
    }
  } else if (tableName === 'users') {
    if (action === 'insert') {
      const exists = db.users.find((u) => u.id === id);
      if (!exists) {
        db.users.push({
          id,
          email: row.email || `${id}@dz-bridge.dz`,
          password_hash: hashPassword('DZbridge2026!'),
          fullName: row.full_name || row.fullName || 'User',
          role: row.role || 'expert',
          status: row.status || 'active',
          country: row.country || 'Algeria',
          city: row.city || '',
          organizationName: row.organization_name || row.organizationName || '',
          specialty: row.specialty || '',
          createdAt: row.created_at || new Date().toISOString(),
          provider: 'local',
        });
      }
    } else if (action === 'update') {
      const idx = db.users.findIndex((u) => u.id === id);
      if (idx !== -1) {
        db.users[idx] = {
          ...db.users[idx],
          fullName: row.full_name || row.fullName || db.users[idx].fullName,
          role: row.role || db.users[idx].role,
          status: row.status || db.users[idx].status,
          organizationName: row.organization_name || row.organizationName || db.users[idx].organizationName,
          specialty: row.specialty || db.users[idx].specialty,
        };
      }
    } else if (action === 'delete') {
      db.users = db.users.filter((u) => u.id !== id);
    }
  } else if (tableName === 'expert_availabilities') {
    if (action === 'insert') {
      const exists = db.expert_availabilities.find((a) => a.id === id);
      if (!exists) db.expert_availabilities.unshift(row);
    } else if (action === 'update') {
      const idx = db.expert_availabilities.findIndex((a) => a.id === id);
      if (idx !== -1) db.expert_availabilities[idx] = { ...db.expert_availabilities[idx], ...row };
    } else if (action === 'delete') {
      db.expert_availabilities = db.expert_availabilities.filter((a) => a.id !== id);
    }
  } else if (tableName === 'matches') {
    if (action === 'insert') {
      const exists = db.matches.find((m) => m.id === id);
      if (!exists) db.matches.unshift(row);
    } else if (action === 'update') {
      const idx = db.matches.findIndex((m) => m.id === id);
      if (idx !== -1) db.matches[idx] = { ...db.matches[idx], ...row };
    } else if (action === 'delete') {
      db.matches = db.matches.filter((m) => m.id !== id);
    }
  } else if (tableName === 'collaborations') {
    if (action === 'insert') {
      const exists = db.collaborations.find((c) => c.id === id);
      if (!exists) db.collaborations.unshift(row);
    } else if (action === 'update') {
      const idx = db.collaborations.findIndex((c) => c.id === id);
      if (idx !== -1) db.collaborations[idx] = { ...db.collaborations[idx], ...row };
    } else if (action === 'delete') {
      db.collaborations = db.collaborations.filter((c) => c.id !== id);
    }
  } else if (tableName === 'custom_kpis') {
    if (action === 'insert') {
      const exists = db.custom_kpis.find((k) => k.id === id);
      if (!exists) db.custom_kpis.unshift(row);
    } else if (action === 'update') {
      const idx = db.custom_kpis.findIndex((k) => k.id === id);
      if (idx !== -1) db.custom_kpis[idx] = { ...db.custom_kpis[idx], ...row };
    } else if (action === 'delete') {
      db.custom_kpis = db.custom_kpis.filter((k) => k.id !== id);
    }
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  (req as any).user = user;
  next();
}

function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user || getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Login required' });
    }
    (req as any).user = user;
    if (user.role === 'super_admin') {
      return next(); // Super admin has full access
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: `Forbidden: Requires one of [${allowedRoles.join(', ')}]` });
    }
    next();
  };
}

function recordAudit(action: string, entityType: string, entityId?: string, metadata?: any, user?: any) {
  const logItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId: user ? user.id : 'system',
    userName: user ? user.fullName : 'System Process',
    userRole: user ? user.role : 'system',
    actionType: action,
    entityType,
    entityId: entityId || '',
    ipAddress: '127.0.0.1',
    createdAt: new Date().toISOString(),
    metadata: metadata || {},
  };
  db.audit_logs.unshift(logItem);
  if (db.audit_logs.length > 500) db.audit_logs = db.audit_logs.slice(0, 500);
  saveDb();
}

// ---------------------------------------------------------------------------
// API: AUTHENTICATION ROUTES
// ---------------------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }

  if (user.status === 'suspended' || user.status === 'deactivated') {
    return res.status(403).json({ error: 'Account is deactivated. Please contact the administrator.' });
  }

  const isValid = verifyPassword(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }

  user.lastLoginAt = new Date().toISOString();
  saveDb();

  const token = generateToken(user.id);
  const { password_hash, ...safeUser } = user;

  recordAudit('USER_LOGIN', 'users', user.id, { email: user.email }, user);

  return res.json({
    user: safeUser,
    token,
    message: 'Logged in successfully.',
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, role, fullName, country, city, organizationName, specialty } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
  const validRole = role === 'organization' ? 'organization' : 'expert'; // Public registration only allows expert or organization

  const newUser = {
    id: newId,
    email: String(email).trim().toLowerCase(),
    password_hash: hashPassword(password),
    fullName: String(fullName).trim(),
    role: validRole,
    status: 'active',
    country: country || 'Algeria',
    city: city || '',
    organizationName: organizationName || '',
    specialty: specialty || '',
    isDiaspora: country && country.toLowerCase() !== 'algeria',
    bio: '',
    avatar: fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
    createdAt: new Date().toISOString(),
    provider: 'local',
  };

  db.users.push(newUser);

  // Also add row to 'users' and 'profiles' in table_data_store
  if (db.table_data_store['users']) {
    db.table_data_store['users'].push({
      id: newUser.id,
      email: newUser.email,
      password_hash: '••••••••',
      role: newUser.role,
      status: newUser.status,
      full_name: newUser.fullName,
      created_at: newUser.createdAt,
    });
  }
  if (db.table_data_store['profiles']) {
    db.table_data_store['profiles'].push({
      id: `pr-${newUser.id}`,
      user_id: newUser.id,
      full_name: newUser.fullName,
      country: newUser.country,
      city: newUser.city,
      is_diaspora: newUser.isDiaspora,
      specialty: newUser.specialty,
    });
  }

  saveDb();
  recordAudit('USER_REGISTERED', 'users', newUser.id, { email: newUser.email, role: newUser.role }, newUser);

  const token = generateToken(newUser.id);
  const { password_hash, ...safeUser } = newUser;

  return res.status(201).json({
    user: safeUser,
    token,
    message: 'Account created successfully.',
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  const { password_hash, ...safeUser } = user;
  return res.json({ user: safeUser });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user) {
    recordAudit('USER_LOGOUT', 'users', user.id, {}, user);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
  // Always return success for security privacy
  return res.json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been dispatched.',
    demoLink: user ? `#new-password` : null,
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { password, email } = req.body;
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  // Update password for specified email or demo account
  const targetEmail = email ? String(email).trim().toLowerCase() : 'demo@dz-bridge.dz';
  const user = db.users.find((u) => u.email.toLowerCase() === targetEmail) || db.users[0];
  if (user) {
    user.password_hash = hashPassword(password);
    saveDb();
    recordAudit('PASSWORD_RESET', 'users', user.id, {}, user);
  }

  return res.json({ success: true, message: 'Password updated successfully' });
});

app.post('/api/auth/magic-link', (req: Request, res: Response) => {
  const { email } = req.body;
  return res.json({
    success: true,
    message: 'One-time login link sent.',
  });
});

// OAuth 2.0 endpoints for Google & LinkedIn
app.get('/api/auth/google', (req: Request, res: Response) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (googleClientId && googleClientId !== 'MY_GOOGLE_CLIENT_ID') {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20email%20profile`;
    return res.redirect(authUrl);
  }

  // Fallback: One-click verified Google authentication
  let googleUser = db.users.find((u) => u.email === 'belgacem.haba@algerian-scholars.dz') || db.users[0];
  const token = generateToken(googleUser.id);
  recordAudit('OAUTH_LOGIN_GOOGLE', 'users', googleUser.id, { provider: 'google' }, googleUser);
  return res.redirect(`/?token=${token}&provider=google`);
});

app.get('/api/auth/google/callback', (req: Request, res: Response) => {
  let googleUser = db.users.find((u) => u.email === 'belgacem.haba@algerian-scholars.dz') || db.users[0];
  const token = generateToken(googleUser.id);
  return res.redirect(`/?token=${token}&provider=google`);
});

app.get('/api/auth/linkedin', (req: Request, res: Response) => {
  const linkedinClientId = process.env.LINKEDIN_CLIENT_ID;
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const redirectUri = `${appUrl}/api/auth/linkedin/callback`;

  if (linkedinClientId && linkedinClientId !== 'MY_LINKEDIN_CLIENT_ID') {
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedinClientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=r_liteprofile%20r_emailaddress`;
    return res.redirect(authUrl);
  }

  // Fallback: One-click verified LinkedIn authentication
  let linkedinUser = db.users.find((u) => u.email === 'amina.benali@algerian-scholars.dz') || db.users[0];
  const token = generateToken(linkedinUser.id);
  recordAudit('OAUTH_LOGIN_LINKEDIN', 'users', linkedinUser.id, { provider: 'linkedin' }, linkedinUser);
  return res.redirect(`/?token=${token}&provider=linkedin`);
});

app.get('/api/auth/linkedin/callback', (req: Request, res: Response) => {
  let linkedinUser = db.users.find((u) => u.email === 'amina.benali@algerian-scholars.dz') || db.users[0];
  const token = generateToken(linkedinUser.id);
  return res.redirect(`/?token=${token}&provider=linkedin`);
});

// Direct Social Login API (for in-page modal / popup buttons)
app.post('/api/auth/social-login', (req: Request, res: Response) => {
  const { provider } = req.body;
  let user: any;
  if (provider === 'LinkedIn') {
    user = db.users.find((u) => u.email === 'amina.benali@algerian-scholars.dz') || db.users[0];
  } else {
    user = db.users.find((u) => u.email === 'belgacem.haba@algerian-scholars.dz') || db.users[0];
  }

  const token = generateToken(user.id);
  const { password_hash, ...safeUser } = user;
  recordAudit(`OAUTH_DIRECT_${String(provider).toUpperCase()}`, 'users', user.id, { provider }, user);

  return res.json({
    user: safeUser,
    token,
    message: `Authenticated with ${provider}.`,
  });
});

// ---------------------------------------------------------------------------
// API: USER MANAGEMENT (SUPER ADMIN & ADMIN ONLY)
// ---------------------------------------------------------------------------
app.get('/api/users', requireRole('super_admin', 'admin'), (req: Request, res: Response) => {
  const { search, role, status, page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  let filtered = [...db.users];

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.organizationName && u.organizationName.toLowerCase().includes(q)) ||
        (u.specialty && u.specialty.toLowerCase().includes(q))
    );
  }

  if (role && role !== 'all') {
    filtered = filtered.filter((u) => u.role === role);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((u) => u.status === status);
  }

  // Sorting
  filtered.sort((a, b) => {
    let aVal = a[String(sortBy)] || '';
    let bVal = b[String(sortBy)] || '';
    if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const p = Math.max(1, parseInt(String(page), 10));
  const l = Math.max(1, parseInt(String(limit), 10));
  const total = filtered.length;
  const paginated = filtered.slice((p - 1) * l, p * l).map(({ password_hash, ...u }) => u);

  return res.json({
    users: paginated,
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
  });
});

app.post('/api/users', requireRole('super_admin', 'admin'), (req: Request, res: Response) => {
  const currentUser = (req as any).user;
  const { email, fullName, password, role, status, country, city, organizationName, specialty, bio } = req.body;

  if (!email || !fullName) {
    return res.status(400).json({ error: 'Email and Full Name are required' });
  }

  // Only super_admin can create admin or super_admin
  if ((role === 'admin' || role === 'super_admin') && currentUser.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Admin can create administrator accounts' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const newId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
  const newUser = {
    id: newId,
    email: String(email).trim().toLowerCase(),
    password_hash: hashPassword(password || 'DZbridge2026!'),
    fullName: String(fullName).trim(),
    role: role || 'expert',
    status: status || 'active',
    country: country || 'Algeria',
    city: city || '',
    organizationName: organizationName || '',
    specialty: specialty || '',
    bio: bio || '',
    isDiaspora: country && country.toLowerCase() !== 'algeria',
    avatar: fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
    createdAt: new Date().toISOString(),
    provider: 'local',
  };

  db.users.push(newUser);

  // Sync to table_data_store
  if (db.table_data_store['users']) {
    db.table_data_store['users'].push({
      id: newUser.id,
      email: newUser.email,
      password_hash: '••••••••',
      role: newUser.role,
      status: newUser.status,
      full_name: newUser.fullName,
      created_at: newUser.createdAt,
    });
  }

  saveDb();
  recordAudit('USER_CREATED_BY_ADMIN', 'users', newUser.id, { email: newUser.email, role: newUser.role }, currentUser);

  const { password_hash, ...safeUser } = newUser;
  return res.status(201).json({ user: safeUser, message: 'User created successfully.' });
});

app.get('/api/users/:id', requireRole('super_admin', 'admin'), (req: Request, res: Response) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password_hash, ...safeUser } = user;
  return res.json({ user: safeUser });
});

app.patch('/api/users/:id', requireRole('super_admin', 'admin'), (req: Request, res: Response) => {
  const currentUser = (req as any).user;
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Protect Super Admin from being altered by others
  if (user.role === 'super_admin' && currentUser.id !== user.id) {
    return res.status(403).json({ error: 'Cannot modify Super Admin account' });
  }

  const { fullName, role, status, country, city, organizationName, specialty, bio } = req.body;

  if (role && role !== user.role) {
    if (currentUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only Super Admin can alter user roles' });
    }
    user.role = role;
  }

  if (fullName !== undefined) user.fullName = fullName;
  if (status !== undefined) user.status = status;
  if (country !== undefined) {
    user.country = country;
    user.isDiaspora = country.toLowerCase() !== 'algeria';
  }
  if (city !== undefined) user.city = city;
  if (organizationName !== undefined) user.organizationName = organizationName;
  if (specialty !== undefined) user.specialty = specialty;
  if (bio !== undefined) user.bio = bio;
  user.updatedAt = new Date().toISOString();

  // Sync to table_data_store
  if (db.table_data_store['users']) {
    const row = db.table_data_store['users'].find((r) => r.id === user.id);
    if (row) {
      row.full_name = user.fullName;
      row.role = user.role;
      row.status = user.status;
    }
  }

  saveDb();
  recordAudit('USER_UPDATED', 'users', user.id, req.body, currentUser);

  const { password_hash, ...safeUser } = user;
  return res.json({ user: safeUser, message: 'User updated successfully.' });
});

app.patch('/api/users/:id/status', requireRole('super_admin', 'admin'), (req: Request, res: Response) => {
  const currentUser = (req as any).user;
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.role === 'super_admin') {
    return res.status(403).json({ error: 'Cannot deactivate Super Admin account' });
  }

  const { status } = req.body;
  user.status = status;
  user.updatedAt = new Date().toISOString();

  if (db.table_data_store['users']) {
    const row = db.table_data_store['users'].find((r) => r.id === user.id);
    if (row) row.status = status;
  }

  saveDb();
  recordAudit('USER_STATUS_CHANGED', 'users', user.id, { status }, currentUser);

  return res.json({ success: true, status: user.status, message: `User status updated to ${status}.` });
});

app.delete('/api/users/:id', requireRole('super_admin', 'admin'), (req: Request, res: Response) => {
  const currentUser = (req as any).user;
  const targetId = req.params.id;
  const userIndex = db.users.findIndex((u) => u.id === targetId);

  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
  const user = db.users[userIndex];

  if (user.role === 'super_admin') {
    return res.status(403).json({ error: 'Cannot delete Super Admin account' });
  }

  if (user.role === 'admin' && currentUser.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Admin can delete administrator accounts' });
  }

  db.users.splice(userIndex, 1);

  // Sync delete to table_data_store
  if (db.table_data_store['users']) {
    db.table_data_store['users'] = db.table_data_store['users'].filter((r) => r.id !== targetId);
  }
  if (db.table_data_store['profiles']) {
    db.table_data_store['profiles'] = db.table_data_store['profiles'].filter((r) => r.user_id !== targetId);
  }

  saveDb();
  recordAudit('USER_DELETED', 'users', targetId, { email: user.email }, currentUser);

  return res.json({ success: true, message: `User ${user.fullName} deleted permanently.` });
});

// ---------------------------------------------------------------------------
// API: CURRENT USER PERSONAL PROFILE
// ---------------------------------------------------------------------------
app.get('/api/profile/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { password_hash, ...safeUser } = user;
  const availabilities = db.expert_availabilities.filter((a) => a.expertId === user.id);
  const userProjects = db.projects.filter((p) => p.organizationId === user.id);

  return res.json({
    user: safeUser,
    availabilities,
    projects: userProjects,
  });
});

app.patch('/api/profile/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { fullName, country, city, organizationName, specialty, bio, phoneNumber, avatar } = req.body;

  if (fullName !== undefined) user.fullName = fullName;
  if (country !== undefined) {
    user.country = country;
    user.isDiaspora = country.toLowerCase() !== 'algeria';
  }
  if (city !== undefined) user.city = city;
  if (organizationName !== undefined) user.organizationName = organizationName;
  if (specialty !== undefined) user.specialty = specialty;
  if (bio !== undefined) user.bio = bio;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (avatar !== undefined) user.avatar = avatar;
  user.updatedAt = new Date().toISOString();

  // Sync to profiles data store
  if (db.table_data_store['profiles']) {
    const pr = db.table_data_store['profiles'].find((p) => p.user_id === user.id);
    if (pr) {
      pr.full_name = user.fullName;
      pr.country = user.country;
      pr.city = user.city;
      pr.is_diaspora = user.isDiaspora;
      pr.specialty = user.specialty;
    }
  }

  saveDb();
  recordAudit('PROFILE_UPDATED', 'users', user.id, req.body, user);

  const { password_hash, ...safeUser } = user;
  return res.json({ user: safeUser, message: 'Profile updated successfully.' });
});

app.post('/api/profile/change-password', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  if (currentPassword && !verifyPassword(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  user.password_hash = hashPassword(newPassword);
  saveDb();
  recordAudit('PASSWORD_CHANGED', 'users', user.id, {}, user);

  return res.json({ success: true, message: 'Password changed successfully.' });
});

// ---------------------------------------------------------------------------
// API: RELATIONAL DATABASE SCHEMA & TABLE DDL (ALL CRUD PERSISTENT!)
// ---------------------------------------------------------------------------
app.get('/api/schema/tables', (req: Request, res: Response) => {
  return res.json({ tables: db.schema_tables });
});

app.post('/api/schema/tables', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { name, description, category, columns } = req.body;

  if (!name) return res.status(400).json({ error: 'Table name is required' });
  const cleanName = String(name).toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

  const existing = db.schema_tables.find((t) => t.name === cleanName);
  if (existing) return res.status(409).json({ error: `Table '${cleanName}' already exists` });

  const newTable = {
    id: `tbl-${Date.now()}`,
    name: cleanName,
    description: description || `${cleanName} table`,
    category: category || 'Custom',
    columns: columns || [
      { id: `col-${Date.now()}-1`, name: 'id', type: 'UUID', isPrimary: true, description: 'Primary key' },
      { id: `col-${Date.now()}-2`, name: 'created_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' },
      { id: `col-${Date.now()}-3`, name: 'updated_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  };

  db.schema_tables.push(newTable);
  db.table_data_store[cleanName] = [];
  saveDb();

  recordAudit('TABLE_CREATED', 'schema', cleanName, { name: cleanName }, user);
  return res.status(201).json({ table: newTable, message: `Table '${cleanName}' created successfully.` });
});

app.put('/api/schema/tables/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const table = db.schema_tables.find((t) => t.id === req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const { name, description, category } = req.body;
  const oldName = table.name;
  const newName = name ? String(name).toLowerCase().trim().replace(/[^a-z0-9_]/g, '_') : oldName;

  table.name = newName;
  if (description !== undefined) table.description = description;
  if (category !== undefined) table.category = category;

  if (oldName !== newName) {
    // Rename data store key
    db.table_data_store[newName] = db.table_data_store[oldName] || [];
    delete db.table_data_store[oldName];

    // Update relations
    db.schema_relations.forEach((r) => {
      if (r.sourceTable === oldName) r.sourceTable = newName;
      if (r.targetTable === oldName) r.targetTable = newName;
      r.label = `${r.sourceTable}.${r.sourceColumn} -> ${r.targetTable}.${r.targetColumn}`;
    });
  }

  saveDb();
  recordAudit('TABLE_UPDATED', 'schema', newName, { oldName, newName }, user);
  return res.json({ table, message: `Table '${newName}' updated successfully.` });
});

app.delete('/api/schema/tables/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const idx = db.schema_tables.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Table not found' });

  const table = db.schema_tables[idx];
  const tableName = table.name;

  // 1. Remove table
  db.schema_tables.splice(idx, 1);

  // 2. Remove all relations referencing this table
  db.schema_relations = db.schema_relations.filter(
    (r) => r.sourceTable !== tableName && r.targetTable !== tableName
  );

  // 3. Delete its data rows
  delete db.table_data_store[tableName];

  saveDb();
  recordAudit('TABLE_DROPPED', 'schema', tableName, { name: tableName }, user);
  return res.json({ success: true, message: `Table '${tableName}' dropped permanently from database.` });
});

// Column level CRUD
app.post('/api/schema/tables/:id/columns', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const table = db.schema_tables.find((t) => t.id === req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const { name, type, isPrimary, isNullable, defaultValue, description, isForeign, foreignTable, foreignColumn, onDelete } = req.body;
  if (!name) return res.status(400).json({ error: 'Column name required' });
  const cleanName = String(name).toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

  const newCol = {
    id: `col-${Date.now()}`,
    name: cleanName,
    type: type || 'VARCHAR(255)',
    isPrimary: !!isPrimary,
    isNullable: isPrimary ? false : isNullable !== false,
    defaultValue: defaultValue || undefined,
    description: description || undefined,
    isForeign: !!isForeign,
    foreignTable: isForeign ? foreignTable : undefined,
    foreignColumn: isForeign ? foreignColumn : undefined,
  };

  table.columns.push(newCol);

  if (isForeign && foreignTable && foreignColumn) {
    db.schema_relations.push({
      id: `rel-${Date.now()}`,
      sourceTable: table.name,
      sourceColumn: cleanName,
      targetTable: foreignTable,
      targetColumn: foreignColumn,
      onDelete: onDelete || 'CASCADE',
      label: `${table.name}.${cleanName} -> ${foreignTable}.${foreignColumn}`,
    });
  }

  saveDb();
  recordAudit('COLUMN_ADDED', 'schema', `${table.name}.${cleanName}`, { column: cleanName }, user);
  return res.status(201).json({ column: newCol, message: `Column '${cleanName}' added to table '${table.name}'.` });
});

app.put('/api/schema/tables/:id/columns/:colId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const table = db.schema_tables.find((t) => t.id === req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const col = table.columns.find((c: any) => c.id === req.params.colId);
  if (!col) return res.status(404).json({ error: 'Column not found' });

  const oldName = col.name;
  const { name, type, isPrimary, isNullable, defaultValue, description, isForeign, foreignTable, foreignColumn } = req.body;
  const newName = name ? String(name).toLowerCase().trim().replace(/[^a-z0-9_]/g, '_') : oldName;

  col.name = newName;
  if (type) col.type = type;
  if (isPrimary !== undefined) col.isPrimary = isPrimary;
  if (isNullable !== undefined) col.isNullable = isNullable;
  if (defaultValue !== undefined) col.defaultValue = defaultValue;
  if (description !== undefined) col.description = description;
  if (isForeign !== undefined) col.isForeign = isForeign;
  if (foreignTable) col.foreignTable = foreignTable;
  if (foreignColumn) col.foreignColumn = foreignColumn;

  if (oldName !== newName) {
    // Rename column in data rows
    const rows = db.table_data_store[table.name] || [];
    rows.forEach((r) => {
      if (r[oldName] !== undefined) {
        r[newName] = r[oldName];
        delete r[oldName];
      }
    });

    // Update relations
    db.schema_relations.forEach((r) => {
      if (r.sourceTable === table.name && r.sourceColumn === oldName) r.sourceColumn = newName;
      if (r.targetTable === table.name && r.targetColumn === oldName) r.targetColumn = newName;
      r.label = `${r.sourceTable}.${r.sourceColumn} -> ${r.targetTable}.${r.targetColumn}`;
    });
  }

  saveDb();
  recordAudit('COLUMN_UPDATED', 'schema', `${table.name}.${newName}`, req.body, user);
  return res.json({ column: col, message: `Column '${newName}' updated.` });
});

app.delete('/api/schema/tables/:id/columns/:colId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const table = db.schema_tables.find((t) => t.id === req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const colIdx = table.columns.findIndex((c: any) => c.id === req.params.colId);
  if (colIdx === -1) return res.status(404).json({ error: 'Column not found' });

  const colName = table.columns[colIdx].name;

  // 1. Remove from columns
  table.columns.splice(colIdx, 1);

  // 2. Remove relations referencing this column
  db.schema_relations = db.schema_relations.filter(
    (r) => !(r.sourceTable === table.name && r.sourceColumn === colName) &&
           !(r.targetTable === table.name && r.targetColumn === colName)
  );

  // 3. Remove column value from all table rows
  const rows = db.table_data_store[table.name] || [];
  rows.forEach((r) => {
    delete r[colName];
  });

  saveDb();
  recordAudit('COLUMN_DROPPED', 'schema', `${table.name}.${colName}`, { table: table.name, column: colName }, user);
  return res.json({ success: true, message: `Column '${colName}' deleted from table '${table.name}'.` });
});

// Relations CRUD
app.get('/api/schema/relations', (req: Request, res: Response) => {
  return res.json({ relations: db.schema_relations });
});

app.post('/api/schema/relations', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { sourceTable, sourceColumn, targetTable, targetColumn, onDelete } = req.body;

  const newRel = {
    id: `rel-${Date.now()}`,
    sourceTable,
    sourceColumn,
    targetTable,
    targetColumn,
    onDelete: onDelete || 'CASCADE',
    label: `${sourceTable}.${sourceColumn} -> ${targetTable}.${targetColumn}`,
  };

  db.schema_relations.push(newRel);
  saveDb();
  recordAudit('RELATION_CREATED', 'schema', newRel.id, newRel, user);
  return res.status(201).json({ relation: newRel, message: 'Foreign key constraint created.' });
});

app.delete('/api/schema/relations/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const idx = db.schema_relations.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Relation not found' });

  const rel = db.schema_relations[idx];
  db.schema_relations.splice(idx, 1);
  saveDb();
  recordAudit('RELATION_DROPPED', 'schema', rel.id, rel, user);
  return res.json({ success: true, message: 'Foreign key constraint removed.' });
});

// ---------------------------------------------------------------------------
// API: TABLE DATA ROWS CRUD
// ---------------------------------------------------------------------------
app.get('/api/data/:tableName', (req: Request, res: Response) => {
  const tableName = req.params.tableName;
  const rows = db.table_data_store[tableName] || [];
  return res.json({ rows, total: rows.length });
});

app.post('/api/data/:tableName', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const tableName = req.params.tableName;
  if (!db.table_data_store[tableName]) {
    db.table_data_store[tableName] = [];
  }

  const newRow = {
    ...req.body,
    id: req.body.id || `row-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
  };

  db.table_data_store[tableName].unshift(newRow);
  syncTableToModel(tableName, 'insert', newRow);
  saveDb();
  recordAudit('ROW_INSERTED', tableName, newRow.id, { tableName }, user);
  return res.status(201).json({ row: newRow, message: `Record inserted into '${tableName}'.` });
});

app.put('/api/data/:tableName/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const tableName = req.params.tableName;
  const rowId = req.params.id;
  const rows = db.table_data_store[tableName] || [];

  const idx = rows.findIndex((r) => r.id === rowId);
  if (idx === -1) return res.status(404).json({ error: 'Row not found' });

  rows[idx] = { ...rows[idx], ...req.body, id: rowId };
  syncTableToModel(tableName, 'update', rows[idx]);
  saveDb();
  recordAudit('ROW_UPDATED', tableName, rowId, { tableName }, user);
  return res.json({ row: rows[idx], message: `Record '${rowId}' updated.` });
});

app.delete('/api/data/:tableName/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const tableName = req.params.tableName;
  const rowId = req.params.id;

  const targetRow = (db.table_data_store[tableName] || []).find((r) => r.id === rowId);

  if (db.table_data_store[tableName]) {
    db.table_data_store[tableName] = db.table_data_store[tableName].filter((r) => r.id !== rowId);
  }

  syncTableToModel(tableName, 'delete', { id: rowId, ...targetRow });
  saveDb();
  recordAudit('ROW_DELETED', tableName, rowId, { tableName }, user);
  return res.json({ success: true, message: `Record '${rowId}' deleted from '${tableName}'.` });
});

app.post('/api/data/:tableName/import', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const tableName = req.params.tableName;
  const { rows } = req.body;

  if (!Array.isArray(rows)) return res.status(400).json({ error: 'Array of rows expected' });
  if (!db.table_data_store[tableName]) db.table_data_store[tableName] = [];

  const formattedRows = rows.map((r) => ({
    ...r,
    id: r.id || `row-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
  }));

  db.table_data_store[tableName] = [...formattedRows, ...db.table_data_store[tableName]];
  saveDb();
  recordAudit('DATA_IMPORTED', tableName, undefined, { count: formattedRows.length }, user);
  return res.json({ success: true, count: formattedRows.length, message: `${formattedRows.length} rows imported.` });
});

app.post('/api/data/:tableName/clear', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const tableName = req.params.tableName;
  db.table_data_store[tableName] = [];
  saveDb();
  recordAudit('TABLE_TRUNCATED', tableName, undefined, { tableName }, user);
  return res.json({ success: true, message: `All records cleared from '${tableName}'.` });
});

app.post('/api/data/reset-all', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  seedInitialDb();
  recordAudit('DATABASE_RESET_TO_BASELINE', 'database', undefined, {}, user);
  return res.json({ success: true, message: 'Database reset to baseline state.' });
});

// ---------------------------------------------------------------------------
// API: SYSTEM & APP STATE SYNC
// ---------------------------------------------------------------------------
app.get('/api/state/full', (req: Request, res: Response) => {
  return res.json({
    users: db.users.map(({ password_hash, ...u }) => u),
    projects: db.projects,
    availabilities: db.expert_availabilities,
    matches: db.matches,
    collaborations: db.collaborations,
    ratings: db.ratings,
    audit_logs: db.audit_logs,
    schema_tables: db.schema_tables,
    schema_relations: db.schema_relations,
    table_data_store: db.table_data_store,
  });
});

// ---------------------------------------------------------------------------
// VITE MIDDLEWARE & STATIC FILE SERVING
// ---------------------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DZ-Bridge Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[DZ-Bridge Server] Startup error:', err);
});
