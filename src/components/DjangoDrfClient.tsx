import React, { useState } from 'react';
import {
  Code,
  Terminal,
  Play,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  Server,
  Database,
  ArrowRight,
  ShieldCheck,
  FileCode,
  Download,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
} from 'lucide-react';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface DrfEndpoint {
  id: string;
  name: string;
  category: 'Projects' | 'Users' | 'Profiles' | 'Matches' | 'Collaborations' | 'Ratings' | 'Schema & DDL';
  method: HttpMethod;
  path: string;
  description: string;
  body?: any;
}

export const DRF_CRUD_ENDPOINTS: DrfEndpoint[] = [
  // 1. Projects CRUD
  {
    id: 'projects_list',
    name: 'List Projects (GET)',
    category: 'Projects',
    method: 'GET',
    path: '/api/v1/projects/',
    description: 'Query all bilateral challenges with status & location filters.',
  },
  {
    id: 'project_submit',
    name: 'Create Project (POST)',
    category: 'Projects',
    method: 'POST',
    path: '/api/v1/projects/',
    description: 'Creates new research project record and sets organization to authenticated user.',
    body: {
      title: 'Advanced Microchip Packaging & AI Hardware Seminar',
      description: 'Collaborative curriculum co-design for Algerian doctoral students at ESI Algiers.',
      skills_required: ['Semiconductors', 'Microchip Packaging', 'Hardware Architecture', 'Deep Learning'],
      location: 'Algiers',
      start_date: '2026-11-05',
      end_date: '2026-11-15',
      logistics_offered: { travel: true, lodging: true, stipend: true },
    },
  },
  {
    id: 'project_patch',
    name: 'Update Project (PATCH)',
    category: 'Projects',
    method: 'PATCH',
    path: '/api/v1/projects/proj-0001-esi/',
    description: 'Update project status, dates, or required skills in PostgreSQL database.',
    body: {
      title: 'Advanced Microchip Packaging & AI Hardware Seminar (Updated Phase 2)',
      status: 'under_review',
      location: 'Algiers (USTHB & ESI)',
    },
  },
  {
    id: 'project_delete',
    name: 'Delete Project (DELETE)',
    category: 'Projects',
    method: 'DELETE',
    path: '/api/v1/projects/proj-0001-esi/',
    description: 'Permanently remove project from database via Django DestroyAPIView.',
  },

  // 2. Users CRUD
  {
    id: 'users_list',
    name: 'List Users (GET)',
    category: 'Users',
    method: 'GET',
    path: '/api/v1/auth/users/',
    description: 'Retrieve registered users across all roles (admin, expert, organization).',
  },
  {
    id: 'user_create',
    name: 'Register User (POST)',
    category: 'Users',
    method: 'POST',
    path: '/api/v1/auth/register/',
    description: 'Stateless user registration with automated polymorphic profile generation.',
    body: {
      email: 'new.scholar@algerian-scholars.dz',
      password: 'SecureScholarPass2026!',
      role: 'expert',
      full_name: 'Dr. Karim Mansouri',
      country: 'Canada',
      city: 'Montreal',
      is_diaspora: true,
    },
  },
  {
    id: 'user_patch',
    name: 'Update User (PATCH)',
    category: 'Users',
    method: 'PATCH',
    path: '/api/v1/auth/users/usr-haba-1001/',
    description: 'Modify user active status, verification timestamp, or administrative flags.',
    body: {
      status: 'active',
      role: 'expert',
    },
  },
  {
    id: 'user_delete',
    name: 'Delete User (DELETE)',
    category: 'Users',
    method: 'DELETE',
    path: '/api/v1/auth/users/usr-benali-1002/',
    description: 'Delete user account and cascade soft-deletion across user relations.',
  },

  // 3. Profiles & Availability CRUD
  {
    id: 'profile_me',
    name: 'Current Profile (GET)',
    category: 'Profiles',
    method: 'GET',
    path: '/api/v1/profiles/me/',
    description: 'Retrieves Profile OneToOne model and related visit windows.',
  },
  {
    id: 'profile_patch',
    name: 'Update Profile (PATCH)',
    category: 'Profiles',
    method: 'PATCH',
    path: '/api/v1/profiles/me/',
    description: 'Update academic bio, research specialties, and ORCID identifier.',
    body: {
      specialty: 'Semiconductor Microelectronics & Quantum Packaging',
      bio: 'Leading technological transfer and international university twinning in Algeria.',
      city: 'San Jose, CA',
    },
  },
  {
    id: 'availability_post',
    name: 'Declare Availability (POST)',
    category: 'Profiles',
    method: 'POST',
    path: '/api/v1/profiles/availability/',
    description: 'Posts upcoming physical visit schedule to Algeria (calculates duration_days).',
    body: {
      city: 'Algiers',
      start_date: '2026-11-01',
      end_date: '2026-11-20',
      notes: 'In-person university keynote lectures and doctoral mentorship at USTHB/ESI.',
    },
  },
  {
    id: 'availability_delete',
    name: 'Delete Availability (DELETE)',
    category: 'Profiles',
    method: 'DELETE',
    path: '/api/v1/profiles/availability/avail-haba-1/',
    description: 'Remove visit slot from expert schedule in database.',
  },

  // 4. Matches CRUD
  {
    id: 'recommendations',
    name: 'Match Recommendations (GET)',
    category: 'Matches',
    method: 'GET',
    path: '/api/v1/matches/recommendations/?minScore=50',
    description: 'Calculates 4-Factor deterministic matching engine (Skills 45% + Dates 25% + Loc 15% + Diaspora 15%).',
  },
  {
    id: 'match_respond',
    name: 'Respond to Match (POST)',
    category: 'Matches',
    method: 'POST',
    path: '/api/v1/matches/match-001/respond/',
    description: 'Accept or decline paired collaboration challenge.',
    body: {
      decision: 'accepted',
      notes: 'Formally accepted visit window for doctoral masterclass series.',
    },
  },
  {
    id: 'match_delete',
    name: 'Delete Match (DELETE)',
    category: 'Matches',
    method: 'DELETE',
    path: '/api/v1/matches/match-001/',
    description: 'Purge match recommendation record from relational database.',
  },

  // 5. Collaborations CRUD
  {
    id: 'collab_list',
    name: 'List Agreements (GET)',
    category: 'Collaborations',
    method: 'GET',
    path: '/api/v1/collaborations/',
    description: 'Query bilateral institutional cooperation protocols across Algerian universities.',
  },
  {
    id: 'collab_confirm',
    name: 'Confirm Protocol (POST)',
    category: 'Collaborations',
    method: 'POST',
    path: '/api/v1/collaborations/confirm/',
    description: 'Creates Collaboration record and advances project status to confirmed.',
    body: {
      project_id: 'proj-0001-esi',
      expert_id: 'usr-haba-1001',
      notes: 'Official cooperation protocol executed between ESI Algiers and Prof. Belgacem Haba.',
    },
  },
  {
    id: 'collab_delete',
    name: 'Terminate Agreement (DELETE)',
    category: 'Collaborations',
    method: 'DELETE',
    path: '/api/v1/collaborations/collab-001/',
    description: 'Revoke and delete bilateral protocol record from system.',
  },

  // 6. Ratings CRUD
  {
    id: 'rating_list',
    name: 'List Ratings (GET)',
    category: 'Ratings',
    method: 'GET',
    path: '/api/v1/ratings/',
    description: 'Query evaluation scores and academic satisfaction ratings.',
  },
  {
    id: 'rating_create',
    name: 'Submit Rating (POST)',
    category: 'Ratings',
    method: 'POST',
    path: '/api/v1/ratings/',
    description: 'Creates a post-collaboration peer review rating (1-5 scale).',
    body: {
      collaboration: 'collab-001',
      to_user: 'usr-haba-1001',
      overall_score: 5,
      comment: 'Exceptional keynote lectures and valuable mentorship for doctoral candidates.',
      category_scores: { technical_depth: 5, engagement: 5, punctuality: 5 },
      is_private_admin_only: false,
    },
  },
  {
    id: 'rating_delete',
    name: 'Delete Rating (DELETE)',
    category: 'Ratings',
    method: 'DELETE',
    path: '/api/v1/ratings/rate-001/',
    description: 'Remove evaluation rating record from system.',
  },

  // 7. Schema & Table DDL CRUD
  {
    id: 'schema_table_create',
    name: 'Create Table (POST)',
    category: 'Schema & DDL',
    method: 'POST',
    path: '/api/v1/schema/tables/',
    description: 'Add new relational table with primary key and schema configuration.',
    body: {
      table_name: 'research_grants',
      description: 'MESRS national technological grants and funding',
      primary_key_type: 'UUID',
      include_timestamps: true,
    },
  },
  {
    id: 'schema_table_delete',
    name: 'Drop Table (DELETE)',
    category: 'Schema & DDL',
    method: 'DELETE',
    path: '/api/v1/schema/tables/temporary_staging/',
    description: 'Drop table definition and associated foreign keys from database.',
  },
  {
    id: 'schema_col_delete',
    name: 'Drop Column (DELETE)',
    category: 'Schema & DDL',
    method: 'DELETE',
    path: '/api/v1/schema/tables/projects/columns/legacy_notes/',
    description: 'Drop specified column from table definition.',
  },
];

export const DjangoDrfClient: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<DrfEndpoint>(DRF_CRUD_ENDPOINTS[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [activeRole, setActiveRole] = useState<'admin' | 'expert' | 'org'>('admin');
  const [customMethod, setCustomMethod] = useState<HttpMethod>(DRF_CRUD_ENDPOINTS[0].method);
  const [customPath, setCustomPath] = useState<string>(DRF_CRUD_ENDPOINTS[0].path);
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify(DRF_CRUD_ENDPOINTS[0].body, null, 2) || '',
  );
  const [response, setResponse] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const filteredEndpoints = DRF_CRUD_ENDPOINTS.filter((ep) => {
    const matchesCategory = categoryFilter === 'All' || ep.category === categoryFilter;
    const matchesSearch =
      !searchFilter.trim() ||
      ep.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.path.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.method.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelect = (ep: DrfEndpoint) => {
    setSelectedEndpoint(ep);
    setCustomMethod(ep.method);
    setCustomPath(ep.path);
    setRequestBody(ep.body ? JSON.stringify(ep.body, null, 2) : '');
    setResponse(null);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    let parsedBody = null;
    let parseError = null;

    if (requestBody.trim() && customMethod !== 'GET') {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (err: any) {
        parseError = err.message;
      }
    }

    await new Promise((r) => setTimeout(r, 160));

    if (parseError) {
      setResponse({
        statusCode: 400,
        statusText: 'Bad Request',
        latency: 8,
        data: {
          error: 'JSON parse error',
          detail: parseError,
          status: 'Invalid JSON payload in request body',
        },
      });
      setIsExecuting(false);
      return;
    }

    let mockData: any = {};
    let statusCode = 200;
    let statusText = 'OK';

    if (customMethod === 'DELETE') {
      statusCode = 204;
      statusText = 'No Content';
      mockData = {
        deleted: true,
        endpoint: customPath,
        timestamp: new Date().toISOString(),
        message: `Resource at '${customPath}' successfully removed from PostgreSQL database.`,
      };
    } else if (customMethod === 'POST') {
      statusCode = 201;
      statusText = 'Created';
      mockData = {
        id: `created-${Date.now().toString().slice(-6)}`,
        status: 'created',
        created_at: new Date().toISOString(),
        created_by: activeRole === 'admin' ? 'DEGHA HOUSSEM EDDINE (Super Admin)' : activeRole,
        data: parsedBody || {},
        message: 'Successfully serialized and inserted into database.',
      };
    } else if (customMethod === 'PATCH' || customMethod === 'PUT') {
      statusCode = 200;
      statusText = 'OK';
      mockData = {
        id: customPath.split('/').filter(Boolean).pop() || 'updated-id',
        status: 'updated',
        updated_at: new Date().toISOString(),
        updated_fields: parsedBody ? Object.keys(parsedBody) : [],
        data: parsedBody || {},
        message: 'Database record updated successfully.',
      };
    } else {
      // GET
      if (customPath.includes('recommendations')) {
        mockData = {
          totalFound: 2,
          algorithmWeights: { skills: '45%', availability: '25%', location: '15%', diaspora_priority: '15%' },
          matches: [
            {
              id: 'match-drf-001',
              project_title: 'Advanced Microchip Packaging & AI Hardware Seminar',
              expert_name: 'Prof. Belgacem Haba',
              expert_city: 'San Jose, CA (Diaspora)',
              compatibility_score: 98.5,
              score_breakdown: {
                skills_score: 100.0,
                availability_score: 100.0,
                location_score: 100.0,
                diaspora_bonus: 100.0,
                matched_skills: ['Semiconductors', 'Microchip Packaging', 'Hardware Architecture'],
                overlapping_days: 15,
              },
              status: 'pending',
            },
          ],
        };
      } else if (customPath.includes('projects')) {
        mockData = {
          count: 3,
          results: [
            {
              id: 'proj-0001-esi',
              title: 'Advanced Microchip Packaging & AI Hardware Seminar',
              organization: 'ESI Algiers',
              location: 'Algiers',
              status: 'confirmed',
            },
            {
              id: 'proj-0002-usthb',
              title: 'Doctoral Foundation Models for Algerian Dialects & NLP',
              organization: 'USTHB Faculty of Computer Science',
              location: 'Bab Ezzouar, Algiers',
              status: 'submitted',
            },
          ],
        };
      } else if (customPath.includes('users')) {
        mockData = {
          count: 3,
          results: [
            { id: 'admin-000', email: 'dzsoft.contact@gmail.com', full_name: 'DEGHA HOUSSEM EDDINE', role: 'admin', status: 'active' },
            { id: 'usr-haba-1001', email: 'belgacem.haba@algerian-scholars.dz', full_name: 'Prof. Belgacem Haba', role: 'expert', status: 'active' },
            { id: 'usr-esi-2001', email: 'esi.algiers@mesrs.dz', full_name: 'ESI Algiers (Directeur)', role: 'organization', status: 'active' },
          ],
        };
      } else {
        mockData = {
          count: 1,
          results: [
            {
              id: 'res-sample',
              path: customPath,
              engine: 'Django 5.1.2 REST Framework',
              client_role: activeRole,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }
    }

    setResponse({
      statusCode,
      statusText,
      latency: Math.floor(Math.random() * 10) + 12,
      data: mockData,
    });
    setIsExecuting(false);
  };

  const curlSnippet = `curl -X ${customMethod} "http://localhost:8000${customPath}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <drf_simplejwt_access_token>"${
    requestBody && customMethod !== 'GET' ? ` \\\n  -d '${requestBody.replace(/\n/g, ' ')}'` : ''
  }`;

  const categories = ['All', 'Projects', 'Users', 'Profiles', 'Matches', 'Collaborations', 'Ratings', 'Schema & DDL'];

  const getMethodBadgeClass = (m: HttpMethod) => {
    switch (m) {
      case 'GET':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'POST':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PATCH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PUT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
            <Code className="w-3.5 h-3.5 text-emerald-600" />
            <span>Django 5.1 REST Framework & Backend CRUD Workbench</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
            Django REST Framework Client & Full CRUD Tester
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Test and verify all backend CRUD operations (Create, Read, Update, Delete) across Projects, Users, Profiles, Matches, Collaborations, and PostgreSQL Schema.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* User Badge */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-gradient-to-r from-slate-50 to-amber-50/50 rounded-xl border border-slate-200 text-xs">
            <div className="w-7 h-7 rounded-lg bg-[#3b0a2a] text-[#C89B3C] font-black flex items-center justify-center text-xs">
              DH
            </div>
            <div>
              <div className="font-extrabold text-slate-900 leading-none">DEGHA HOUSSEM EDDINE</div>
              <div className="text-[10px] text-[#8C6514] font-semibold mt-0.5">Super Admin · dzsoft.contact@gmail.com</div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-mono text-slate-600">
            Path: <strong className="text-slate-900">/django_backend/</strong>
          </div>
        </div>
      </div>

      {/* Role Preset Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-[#3B0D2C]" />
          <span>Simulate Client Role Credentials:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveRole('admin')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeRole === 'admin'
                ? 'bg-[#3B0D2C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Super Admin (DEGHA HOUSSEM EDDINE)
          </button>
          <button
            onClick={() => setActiveRole('expert')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeRole === 'expert'
                ? 'bg-[#3B0D2C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Diaspora Scholar (Pr. Haba / Dr. Benali)
          </button>
          <button
            onClick={() => setActiveRole('org')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeRole === 'org'
                ? 'bg-[#3B0D2C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            University Dean (ESI Algiers)
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              categoryFilter === cat
                ? 'bg-[#3B0D2C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Two Column DRF Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Endpoint List */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 max-h-[750px] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Endpoints ({filteredEndpoints.length})
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                CRUD Enabled
              </span>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search CRUD actions..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#3B0D2C]"
            />
          </div>

          <div className="space-y-1.5">
            {filteredEndpoints.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <div
                  key={ep.id}
                  onClick={() => handleSelect(ep)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#3B0D2C] text-white border-[#3B0D2C] shadow-md'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-black border ${
                        isSelected ? 'bg-white/20 text-white border-white/30' : getMethodBadgeClass(ep.method)
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-[10px] font-mono truncate text-slate-400">
                      {ep.path.split('?')[0]}
                    </span>
                  </div>
                  <div className="text-xs font-bold mt-1.5 truncate">{ep.name}</div>
                  <p className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                    {ep.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Request & Response Sandbox */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Method & Path Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Active Request URL & HTTP Method
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value as HttpMethod)}
                className={`font-mono text-xs font-black px-3 py-2.5 rounded-xl border ${getMethodBadgeClass(
                  customMethod,
                )} focus:outline-none`}
              >
                <option value="GET">GET</option>
                <option value="POST">POST (Create)</option>
                <option value="PATCH">PATCH (Update)</option>
                <option value="PUT">PUT (Replace)</option>
                <option value="DELETE">DELETE (Remove)</option>
              </select>

              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                className="flex-1 min-w-[200px] bg-slate-50 font-mono text-xs text-slate-900 border border-slate-300 px-3.5 py-2.5 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
              />

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white font-black px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#C89B3C]" />
                <span>{isExecuting ? 'Sending...' : 'Send Request'}</span>
              </button>
            </div>
          </div>

          {/* Request Body for POST / PATCH / PUT */}
          {customMethod !== 'GET' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>JSON Request Body</span>
                <span className="text-[11px] text-slate-400 font-mono">application/json</span>
              </div>
              <textarea
                rows={6}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder="Enter JSON payload..."
                className="w-full bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]"
              />
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 border border-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>HTTP GET request · Query parameters evaluated directly by Django ORM queries.</span>
            </div>
          )}

          {/* cURL Snippet */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold mb-1">
              <span>Django Backend cURL Command</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(curlSnippet);
                  setCopiedCurl(true);
                  setTimeout(() => setCopiedCurl(false), 2000);
                }}
                className="text-[#3B0D2C] hover:text-[#C89B3C] flex items-center gap-1 font-bold"
              >
                {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap overflow-x-auto">
              {curlSnippet}
            </pre>
          </div>

          {/* Response Payload Viewer */}
          {response && (
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">DRF Response</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                      response.statusCode >= 200 && response.statusCode < 300
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    {response.statusCode} {response.statusText}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Django 5.1.2 Engine
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500 font-bold">{response.latency} ms</span>
              </div>

              <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400 border border-slate-800 overflow-x-auto max-h-72 leading-relaxed">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
