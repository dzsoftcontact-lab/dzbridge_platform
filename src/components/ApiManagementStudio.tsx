import React, { useState, useMemo } from 'react';
import { UserRole, ApiEndpointDef, SchemaTableDef, ExternalApiKey } from '../types';
import { TableRow } from '../services/dbStore';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Lock,
  Server,
  Layers,
  Code,
  ShieldCheck,
  RefreshCw,
  Download,
  Key,
  Globe,
  Activity,
  Sliders,
  Sparkles,
  ArrowRight,
  Database,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Search,
  FileJson,
  CheckCircle2,
  ChevronRight,
  Share2,
  Eye,
  Filter,
  FileSpreadsheet,
  Globe2,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { downloadOpenApiSpec, downloadPostmanCollection } from '../utils/apiExport';

interface ApiManagementStudioProps {
  activeRole?: UserRole;
  dataStore?: Record<string, TableRow[]>;
  schemaTables?: SchemaTableDef[];
  onInsertRow?: (tableName: string, row: Record<string, any>) => void;
  onUpdateRow?: (tableName: string, id: string, updates: Record<string, any>) => void;
  onDeleteRow?: (tableName: string, id: string) => void;
  onExecuteEndpoint?: (
    endpointId: string,
    method: string,
    path: string,
    body: any,
    targetEngine: 'django' | 'nestjs' | 'browser',
  ) => Promise<{ statusCode: number; data: any; latencyMs?: number }>;
}

const INITIAL_API_ENDPOINTS: ApiEndpointDef[] = [
  // 1. Projects & Technology Transfer
  {
    id: 'projects-list',
    category: '1. Projects & Challenges',
    method: 'GET',
    path: '/api/v1/projects',
    drfPath: '/api/v1/projects/',
    description: 'Query, search and filter bilateral research initiatives and doctoral challenges',
    connectedTable: 'projects',
    roleRequired: 'Public',
    authType: 'public',
    rateLimitPerMin: 120,
    corsOrigins: '*',
    expectedStatus: 200,
    enabled: true,
    defaultParams: {
      status: 'submitted',
      location: 'Algiers',
      limit: '10',
    },
  },
  {
    id: 'projects-submit',
    category: '1. Projects & Challenges',
    method: 'POST',
    path: '/api/v1/projects',
    drfPath: '/api/v1/projects/',
    description: 'Submit new institutional research challenge with required skills and logistics',
    connectedTable: 'projects',
    roleRequired: 'Organization',
    authType: 'jwt',
    rateLimitPerMin: 60,
    corsOrigins: '*',
    expectedStatus: 201,
    enabled: true,
    defaultBody: {
      title: 'Algerian Microelectronics & Semiconductor Packaging Initiative',
      description: 'Doctoral research collaboration with diaspora pioneers on AI hardware miniaturization.',
      skillsRequired: ['Semiconductors', 'Microchip Packaging', 'Hardware Acceleration'],
      location: 'Algiers (USTHB & ESI)',
      startDate: '2026-11-10',
      endDate: '2026-11-25',
      logisticsOffered: {
        travel: true,
        lodging: true,
        stipend: true,
        currency: 'DZD',
      },
    },
  },
  {
    id: 'projects-update',
    category: '1. Projects & Challenges',
    method: 'PATCH',
    path: '/api/v1/projects/:id',
    drfPath: '/api/v1/projects/<id>/',
    description: 'Update research challenge details, status transition, or host institution logistics',
    connectedTable: 'projects',
    roleRequired: 'Organization',
    authType: 'jwt',
    rateLimitPerMin: 60,
    corsOrigins: '*',
    expectedStatus: 200,
    enabled: true,
    defaultBody: {
      status: 'under_review',
      title: 'Algerian Microelectronics & Semiconductor Packaging Initiative (Phase 2)',
    },
  },
  {
    id: 'projects-delete',
    category: '1. Projects & Challenges',
    method: 'DELETE',
    path: '/api/v1/projects/:id',
    drfPath: '/api/v1/projects/<id>/',
    description: 'Archive or purge institutional challenge from active matchmaking index',
    connectedTable: 'projects',
    roleRequired: 'Admin',
    authType: 'jwt',
    rateLimitPerMin: 30,
    corsOrigins: '*',
    expectedStatus: 204,
    enabled: true,
  },

  // 2. Scholars & Diaspora Fellows
  {
    id: 'scholars-list',
    category: '2. Scholars & Diaspora',
    method: 'GET',
    path: '/api/v1/scholars',
    drfPath: '/api/v1/profiles/scholars/',
    description: 'Retrieve verified Algerian diaspora laureates, patents, and academic specialties',
    connectedTable: 'profiles',
    roleRequired: 'Public',
    authType: 'public',
    rateLimitPerMin: 120,
    corsOrigins: '*',
    expectedStatus: 200,
    enabled: true,
    defaultParams: {
      is_diaspora: 'true',
      country: 'United States',
    },
  },
  {
    id: 'scholars-availabilities',
    category: '2. Scholars & Diaspora',
    method: 'GET',
    path: '/api/v1/scholars/availabilities',
    drfPath: '/api/v1/profiles/availabilities/',
    description: 'Query physical Algeria visit schedules for keynote lectures and doctoral panels',
    connectedTable: 'expert_availabilities',
    roleRequired: 'Authenticated',
    authType: 'jwt',
    rateLimitPerMin: 90,
    corsOrigins: '*',
    expectedStatus: 200,
    enabled: true,
    defaultParams: {
      city: 'Algiers',
    },
  },
  {
    id: 'availabilities-post',
    category: '2. Scholars & Diaspora',
    method: 'POST',
    path: '/api/v1/scholars/availabilities',
    drfPath: '/api/v1/profiles/availabilities/',
    description: 'Diaspora fellow posts upcoming visit window to Algerian institutions',
    connectedTable: 'expert_availabilities',
    roleRequired: 'Expert',
    authType: 'jwt',
    rateLimitPerMin: 30,
    corsOrigins: '*',
    expectedStatus: 201,
    enabled: true,
    defaultBody: {
      city: 'Oran',
      startDate: '2026-12-01',
      endDate: '2026-12-15',
      durationDays: 14,
      notes: 'Available for computer science and renewable energy workshops.',
    },
  },

  // 3. Algorithmic Matchmaking
  {
    id: 'matches-recommendations',
    category: '3. Algorithmic Matchmaking',
    method: 'GET',
    path: '/api/v1/matches/recommendations',
    drfPath: '/api/v1/matches/recommendations/',
    description: 'Compute 4-factor compatibility score between university challenge and diaspora fellow',
    connectedTable: 'matches',
    roleRequired: 'Authenticated',
    authType: 'jwt',
    rateLimitPerMin: 60,
    corsOrigins: '*',
    expectedStatus: 200,
    enabled: true,
    defaultParams: {
      minScore: '80',
    },
  },
  {
    id: 'matches-respond',
    category: '3. Algorithmic Matchmaking',
    method: 'POST',
    path: '/api/v1/matches/respond',
    drfPath: '/api/v1/matches/respond/',
    description: 'Scholar accepts or declines bilateral pairing proposal from university host',
    connectedTable: 'matches',
    roleRequired: 'Expert',
    authType: 'jwt',
    rateLimitPerMin: 30,
    corsOrigins: '*',
    expectedStatus: 200,
    enabled: true,
    defaultBody: {
      matchId: 'match-001',
      decision: 'accepted',
      notes: 'Delighted to confirm visit and lead the doctoral seminar in Algiers.',
    },
  },

  // 4. Bilateral Agreements & Collaborations
  {
    id: 'collaborations-list',
    category: '4. Institutional Protocols',
    method: 'GET',
    path: '/api/v1/collaborations',
    drfPath: '/api/v1/collaborations/',
    description: 'Fetch active bilateral institutional cooperation protocols across Algerian universities',
    connectedTable: 'collaborations',
    roleRequired: 'Authenticated',
    authType: 'jwt',
    rateLimitPerMin: 90,
    corsOrigins: '*',
    expectedStatus: 200,
    enabled: true,
    defaultParams: {
      status: 'active',
    },
  },
  {
    id: 'collaborations-confirm',
    category: '4. Institutional Protocols',
    method: 'POST',
    path: '/api/v1/collaborations/confirm',
    drfPath: '/api/v1/collaborations/confirm/',
    description: 'Seal formal bilateral cooperation protocol with academic legal ratification',
    connectedTable: 'collaborations',
    roleRequired: 'Organization',
    authType: 'jwt',
    rateLimitPerMin: 20,
    corsOrigins: '*',
    expectedStatus: 201,
    enabled: true,
    defaultBody: {
      projectId: 'proj-0001-esi',
      expertId: 'usr-haba-1001',
      notes: 'Official MESRS bilateral protocol executed between University Rector and Scholar Fellow.',
    },
  },

  // 5. Dynamic Custom KPIs (Admin Managed)
  {
    id: 'kpis-list',
    category: '5. Strategic KPIs & Analytics',
    method: 'GET',
    path: '/api/v1/kpis',
    drfPath: '/api/v1/analytics/kpis/',
    description: 'Real-time performance indicators and national impact metrics for front-end consumption',
    connectedTable: 'custom_kpis',
    roleRequired: 'Public',
    authType: 'public',
    rateLimitPerMin: 180,
    corsOrigins: '*',
    expectedStatus: 200,
    enabled: true,
    defaultParams: {
      displayOnLanding: 'true',
    },
  },
  {
    id: 'kpis-create',
    category: '5. Strategic KPIs & Analytics',
    method: 'POST',
    path: '/api/v1/kpis',
    drfPath: '/api/v1/analytics/kpis/',
    description: 'Create and configure new national strategic indicator with target formula',
    connectedTable: 'custom_kpis',
    roleRequired: 'Admin',
    authType: 'jwt',
    rateLimitPerMin: 30,
    corsOrigins: '*',
    expectedStatus: 201,
    enabled: true,
    defaultBody: {
      name: 'International Joint Laboratory Partnerships',
      description: 'Bilateral lab twinning agreements between Algerian universities and top global institutes.',
      category: 'Academic Research',
      currentValue: '19',
      targetValue: '25',
      unit: 'Labs',
      progressPercentage: 76,
      status: 'on_track',
      visualizationType: 'progress',
      displayOnLanding: true,
    },
  },

  // 6. External Public Feeds & Integration
  {
    id: 'external-national-feed',
    category: '6. External Integrations',
    method: 'GET',
    path: '/api/v1/external/national-impact-feed',
    drfPath: '/api/v1/external/feed/',
    description: 'Public syndication feed for Algerian university websites and ministerial portals',
    connectedTable: 'custom_kpis',
    roleRequired: 'Public',
    authType: 'api_key',
    rateLimitPerMin: 300,
    corsOrigins: '*',
    expectedStatus: 200,
    enabled: true,
  },
  {
    id: 'audit-logs-get',
    category: '6. External Integrations',
    method: 'GET',
    path: '/api/v1/audit/logs',
    drfPath: '/api/v1/governance/audit/',
    description: 'Immutable regulatory audit log stream with SHA-256 verification hashes',
    connectedTable: 'activity_logs',
    roleRequired: 'Admin',
    authType: 'jwt',
    rateLimitPerMin: 60,
    corsOrigins: '*',
    expectedStatus: 200,
    enabled: true,
    defaultParams: {
      limit: '25',
    },
  },
  {
    id: 'auth-login',
    category: '7. Authentication & Tokens',
    method: 'POST',
    path: '/api/v1/auth/login',
    drfPath: '/api/v1/auth/login/',
    description: 'Exchange credentials for stateless JWT token with embedded role claims',
    roleRequired: 'Public',
    authType: 'public',
    rateLimitPerMin: 30,
    corsOrigins: '*',
    expectedStatus: 200,
    enabled: true,
    defaultBody: {
      email: 'belgacem.haba@algerian-scholars.dz',
      password: 'Scholar2026Password!',
    },
  },
];

const INITIAL_API_KEYS: ExternalApiKey[] = [
  {
    id: 'key-001',
    clientName: 'DZ-Bridge Mobile App (iOS / Android)',
    apiKey: 'dz_live_pub_9a8f2e7b4c1d6e3f4a5b6c7d',
    keyPrefix: 'dz_live_pub_',
    role: 'expert',
    allowedOrigins: '*',
    rateLimit: 300,
    status: 'active',
    createdAt: '2026-09-01T08:00:00Z',
    lastUsedAt: 'Just now',
  },
  {
    id: 'key-002',
    clientName: 'USTHB Bab Ezzouar Rectorate Portal',
    apiKey: 'dz_live_org_8812c4b7f0e91a2b3c4d5e6f',
    keyPrefix: 'dz_live_org_',
    role: 'organization',
    allowedOrigins: 'https://usthb.dz, https://portal.usthb.dz',
    rateLimit: 180,
    status: 'active',
    createdAt: '2026-09-15T10:30:00Z',
    lastUsedAt: '12 min ago',
  },
  {
    id: 'key-003',
    clientName: 'ESI Algiers Student & Research Portal',
    apiKey: 'dz_live_org_3399a1b2c3d4e5f6a7b8c9d0',
    keyPrefix: 'dz_live_org_',
    role: 'organization',
    allowedOrigins: 'https://esi.dz, http://localhost:5173',
    rateLimit: 180,
    status: 'active',
    createdAt: '2026-09-18T14:20:00Z',
    lastUsedAt: '1 hour ago',
  },
  {
    id: 'key-004',
    clientName: 'MESRS Sovereign Statistics Dashboard',
    apiKey: 'dz_live_adm_7744b1c2d3e4f5a6b7c8d9e0',
    keyPrefix: 'dz_live_adm_',
    role: 'admin',
    allowedOrigins: 'https://mesrs.dz, https://stat.mesrs.dz',
    rateLimit: 600,
    status: 'active',
    createdAt: '2026-08-20T09:00:00Z',
    lastUsedAt: '4 min ago',
  },
];

export const ApiManagementStudio: React.FC<ApiManagementStudioProps> = ({
  activeRole = 'admin',
  dataStore = {},
  schemaTables = [],
  onInsertRow,
  onUpdateRow,
  onDeleteRow,
  onExecuteEndpoint,
}) => {
  const { lang, t } = useTranslation();
  const isAr = lang === 'ar';

  // Master Endpoints State (CRUD Enabled)
  const [endpoints, setEndpoints] = useState<ApiEndpointDef[]>(INITIAL_API_ENDPOINTS);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(INITIAL_API_ENDPOINTS[0].id);
  const [apiKeys, setApiKeys] = useState<ExternalApiKey[]>(INITIAL_API_KEYS);

  // Studio Top Tabs: 'endpoints' | 'api-keys' | 'cors-gateway'
  const [activeMainTab, setActiveMainTab] = useState<'endpoints' | 'api-keys' | 'cors-gateway'>('endpoints');

  // Filters
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected endpoint
  const selectedEndpoint = useMemo(() => {
    return endpoints.find((ep) => ep.id === selectedEndpointId) || endpoints[0];
  }, [endpoints, selectedEndpointId]);

  // Console Inspector Tabs: 'test-runner' | 'client-code' | 'schema-mapping' | 'drf-guide'
  const [inspectorTab, setInspectorTab] = useState<'test-runner' | 'client-code' | 'schema-mapping' | 'drf-guide'>('test-runner');
  const [selectedClientLang, setSelectedClientLang] = useState<'fetch' | 'axios' | 'curl' | 'dart' | 'python'>('fetch');

  // Execution State
  const [targetEngine, setTargetEngine] = useState<'browser' | 'nestjs' | 'django'>('browser');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [requestBodyText, setRequestBodyText] = useState<string>(() => {
    return selectedEndpoint?.defaultBody ? JSON.stringify(selectedEndpoint.defaultBody, null, 2) : '';
  });
  const [queryParams, setQueryParams] = useState<Record<string, string>>(() => {
    return selectedEndpoint?.defaultParams || {};
  });

  // Response State
  const [executionResult, setExecutionResult] = useState<{
    statusCode: number;
    statusText: string;
    responseTimeMs: number;
    payloadSizeKb: number;
    headers: Record<string, string>;
    data: any;
    engine: string;
  } | null>(null);

  // Copy confirmations
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState<boolean>(false);

  // Form State for Add / Edit Endpoint
  const [formMethod, setFormMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>('GET');
  const [formPath, setFormPath] = useState<string>('/api/v1/external/');
  const [formCategory, setFormCategory] = useState<string>('6. External Integrations');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formConnectedTable, setFormConnectedTable] = useState<string>('projects');
  const [formRoleRequired, setFormRoleRequired] = useState<ApiEndpointDef['roleRequired']>('Public');
  const [formAuthType, setFormAuthType] = useState<ApiEndpointDef['authType']>('public');
  const [formRateLimit, setFormRateLimit] = useState<number>(120);
  const [formCorsOrigins, setFormCorsOrigins] = useState<string>('*');
  const [formExpectedStatus, setFormExpectedStatus] = useState<number>(200);
  const [formBodyJson, setFormBodyJson] = useState<string>('{\n  "title": "Sample Title",\n  "status": "active"\n}');
  const [formJsonError, setFormJsonError] = useState<string | null>(null);

  // Form State for Create API Key
  const [newKeyClientName, setNewKeyClientName] = useState<string>('');
  const [newKeyRole, setNewKeyRole] = useState<UserRole | 'external'>('external');
  const [newKeyOrigins, setNewKeyOrigins] = useState<string>('*');
  const [newKeyRateLimit, setNewKeyRateLimit] = useState<number>(180);

  // Update request body when endpoint selection changes
  const handleSelectEndpoint = (ep: ApiEndpointDef) => {
    setSelectedEndpointId(ep.id);
    setRequestBodyText(ep.defaultBody ? JSON.stringify(ep.defaultBody, null, 2) : '');
    setQueryParams(ep.defaultParams || {});
    setExecutionResult(null);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormMethod('GET');
    setFormPath('/api/v1/external/my-resource');
    setFormCategory('6. External Integrations');
    setFormDescription('External frontend REST API endpoint connecting to database.');
    setFormConnectedTable(schemaTables[0]?.name || 'projects');
    setFormRoleRequired('Public');
    setFormAuthType('public');
    setFormRateLimit(120);
    setFormCorsOrigins('*');
    setFormExpectedStatus(200);
    setFormBodyJson('');
    setFormJsonError(null);
    setShowAddEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (ep: ApiEndpointDef) => {
    setModalMode('edit');
    setFormMethod(ep.method);
    setFormPath(ep.path);
    setFormCategory(ep.category);
    setFormDescription(ep.description);
    setFormConnectedTable(ep.connectedTable || 'projects');
    setFormRoleRequired(ep.roleRequired);
    setFormAuthType(ep.authType || 'public');
    setFormRateLimit(ep.rateLimitPerMin || 120);
    setFormCorsOrigins(ep.corsOrigins || '*');
    setFormExpectedStatus(ep.expectedStatus);
    setFormBodyJson(ep.defaultBody ? JSON.stringify(ep.defaultBody, null, 2) : '');
    setFormJsonError(null);
    setShowAddEditModal(true);
  };

  // Save Add/Edit Endpoint
  const handleSaveEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    setFormJsonError(null);

    let parsedBody: any = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(formMethod) && formBodyJson.trim()) {
      try {
        parsedBody = JSON.parse(formBodyJson);
      } catch (err: any) {
        setFormJsonError(`Invalid JSON syntax: ${err.message}`);
        return;
      }
    }

    if (modalMode === 'create') {
      const newEpId = `ep-${Date.now()}`;
      const newEp: ApiEndpointDef = {
        id: newEpId,
        category: formCategory,
        method: formMethod,
        path: formPath.startsWith('/') ? formPath : `/${formPath}`,
        drfPath: formPath.endsWith('/') ? formPath : `${formPath}/`,
        description: formDescription || 'Custom REST endpoint connected to backend database',
        connectedTable: formConnectedTable,
        roleRequired: formRoleRequired,
        authType: formAuthType,
        rateLimitPerMin: formRateLimit,
        corsOrigins: formCorsOrigins,
        expectedStatus: formExpectedStatus,
        defaultBody: parsedBody,
        enabled: true,
        isCustomCreated: true,
      };
      setEndpoints((prev) => [newEp, ...prev]);
      setSelectedEndpointId(newEpId);
      setRequestBodyText(parsedBody ? JSON.stringify(parsedBody, null, 2) : '');
    } else {
      setEndpoints((prev) =>
        prev.map((ep) =>
          ep.id === selectedEndpoint.id
            ? {
                ...ep,
                method: formMethod,
                path: formPath.startsWith('/') ? formPath : `/${formPath}`,
                drfPath: formPath.endsWith('/') ? formPath : `${formPath}/`,
                category: formCategory,
                description: formDescription,
                connectedTable: formConnectedTable,
                roleRequired: formRoleRequired,
                authType: formAuthType,
                rateLimitPerMin: formRateLimit,
                corsOrigins: formCorsOrigins,
                expectedStatus: formExpectedStatus,
                defaultBody: parsedBody,
              }
            : ep
        )
      );
      setRequestBodyText(parsedBody ? JSON.stringify(parsedBody, null, 2) : '');
    }

    setShowAddEditModal(false);
  };

  // Delete Endpoint
  const handleDeleteEndpoint = () => {
    setEndpoints((prev) => prev.filter((ep) => ep.id !== selectedEndpoint.id));
    setShowDeleteConfirmModal(false);
    const remaining = endpoints.filter((ep) => ep.id !== selectedEndpoint.id);
    if (remaining.length > 0) {
      setSelectedEndpointId(remaining[0].id);
      setRequestBodyText(remaining[0].defaultBody ? JSON.stringify(remaining[0].defaultBody, null, 2) : '');
    }
  };

  // Duplicate Endpoint
  const handleDuplicateEndpoint = (ep: ApiEndpointDef) => {
    const cloneId = `ep-${Date.now()}`;
    const clone: ApiEndpointDef = {
      ...ep,
      id: cloneId,
      path: `${ep.path}-copy`,
      drfPath: ep.drfPath ? `${ep.drfPath}copy/` : undefined,
      description: `Copy of ${ep.description}`,
      isCustomCreated: true,
    };
    setEndpoints((prev) => [clone, ...prev]);
    setSelectedEndpointId(cloneId);
  };

  // Toggle Endpoint Enabled
  const handleToggleEndpointEnabled = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEndpoints((prev) =>
      prev.map((ep) => (ep.id === id ? { ...ep, enabled: !ep.enabled } : ep))
    );
  };

  // Create API Key
  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyClientName) return;

    const prefix = newKeyRole === 'admin' ? 'dz_live_adm_' : newKeyRole === 'organization' ? 'dz_live_org_' : 'dz_live_pub_';
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const fullKey = `${prefix}${randomHex}`;

    const newKey: ExternalApiKey = {
      id: `key-${Date.now()}`,
      clientName: newKeyClientName,
      apiKey: fullKey,
      keyPrefix: prefix,
      role: newKeyRole,
      allowedOrigins: newKeyOrigins || '*',
      rateLimit: newKeyRateLimit || 180,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastUsedAt: 'Just created',
    };

    setApiKeys((prev) => [newKey, ...prev]);
    setShowCreateKeyModal(false);
    setNewKeyClientName('');
    setNewKeyOrigins('*');
  };

  // Revoke API Key
  const handleRevokeApiKey = (keyId: string) => {
    setApiKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, status: 'revoked' as const } : k))
    );
  };

  // Execute Request (Live DB Integration)
  const handleRunExecution = async () => {
    setIsExecuting(true);
    const startTime = performance.now();

    try {
      let parsedBody: any = null;
      if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && requestBodyText.trim()) {
        try {
          parsedBody = JSON.parse(requestBodyText);
        } catch {
          // If parse fails, send raw string
          parsedBody = requestBodyText;
        }
      }

      // If Target Engine is Browser Live DB or custom, interact directly with dataStore
      if (targetEngine === 'browser') {
        await new Promise((r) => setTimeout(r, 140));
        const table = selectedEndpoint.connectedTable;
        let responseData: any = null;
        let responseCode = selectedEndpoint.expectedStatus;

        if (table && dataStore[table]) {
          const liveRows = dataStore[table];

          if (selectedEndpoint.method === 'GET') {
            // Check query filters
            let filtered = [...liveRows];
            if (queryParams.status) {
              filtered = filtered.filter((r) => String(r.status).toLowerCase() === queryParams.status.toLowerCase());
            }
            if (queryParams.limit) {
              const lim = parseInt(queryParams.limit, 10);
              if (!isNaN(lim)) filtered = filtered.slice(0, lim);
            }
            responseData = {
              success: true,
              source: `PostgreSQL Live Table: "${table}"`,
              count: filtered.length,
              totalInDb: liveRows.length,
              results: filtered,
            };
          } else if (selectedEndpoint.method === 'POST') {
            // Actual insertion into live table!
            const newRow = {
              id: parsedBody?.id || `rec-${Date.now()}`,
              ...parsedBody,
              created_at: new Date().toISOString(),
            };
            if (onInsertRow) {
              onInsertRow(table, newRow);
            }
            responseData = {
              success: true,
              message: `Record successfully inserted into live database table "${table}".`,
              insertedRecord: newRow,
            };
            responseCode = 201;
          } else if (selectedEndpoint.method === 'DELETE') {
            responseData = {
              success: true,
              message: `Simulated deletion from table "${table}".`,
            };
          } else {
            responseData = {
              success: true,
              message: `Executed ${selectedEndpoint.method} against table "${table}".`,
              payload: parsedBody,
            };
          }
        } else {
          // Default synthetic response
          responseData = {
            success: true,
            endpoint: selectedEndpoint.path,
            method: selectedEndpoint.method,
            timestamp: new Date().toISOString(),
            gateway: 'DZ-Bridge Sovereign Gateway v1.0',
            clientRole: activeRole,
            data: parsedBody || { status: 'ok', queryParams },
          };
        }

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        const jsonStr = JSON.stringify(responseData);
        const sizeKb = Number((new Blob([jsonStr]).size / 1024).toFixed(2));

        setExecutionResult({
          statusCode: responseCode,
          statusText: responseCode === 200 ? 'OK' : responseCode === 201 ? 'Created' : 'Accepted',
          responseTimeMs: duration,
          payloadSizeKb: sizeKb,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'x-powered-by': 'DZ-Bridge Sovereign Relational Gateway (PostgreSQL 16)',
            'x-ratelimit-limit': String(selectedEndpoint.rateLimitPerMin || 120),
            'x-ratelimit-remaining': String((selectedEndpoint.rateLimitPerMin || 120) - 1),
            'access-control-allow-origin': selectedEndpoint.corsOrigins || '*',
          },
          data: responseData,
          engine: 'Browser Live In-Memory Relational Engine',
        });
      } else if (onExecuteEndpoint) {
        // Delegate to external mock execution handler
        const res = await onExecuteEndpoint(
          selectedEndpoint.id,
          selectedEndpoint.method,
          selectedEndpoint.path,
          parsedBody,
          targetEngine === 'django' ? 'django' : 'nestjs'
        );
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        const jsonStr = JSON.stringify(res.data);
        const sizeKb = Number((new Blob([jsonStr]).size / 1024).toFixed(2));

        setExecutionResult({
          statusCode: res.statusCode,
          statusText: res.statusCode === 200 ? 'OK' : res.statusCode === 201 ? 'Created' : 'Accepted',
          responseTimeMs: duration,
          payloadSizeKb: sizeKb,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'x-powered-by': targetEngine === 'django' ? 'Django 5.1 / DRF 3.15' : 'NestJS 10 / Express',
            'access-control-allow-origin': '*',
          },
          data: res.data,
          engine: targetEngine === 'django' ? 'Django REST Framework (Port 8000)' : 'NestJS Gateway (Port 4000)',
        });
      }
    } catch (err: any) {
      setExecutionResult({
        statusCode: 500,
        statusText: 'Internal Server Error',
        responseTimeMs: 45,
        payloadSizeKb: 0.2,
        headers: { 'content-type': 'application/json' },
        data: { error: err.message || 'Execution failed' },
        engine: 'Gateway Error Handler',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Filtered Endpoints List
  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((ep) => {
      const matchMethod = methodFilter === 'ALL' || ep.method === methodFilter;
      const matchCategory = categoryFilter === 'ALL' || ep.category === categoryFilter;
      const matchQuery =
        !searchQuery ||
        ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ep.connectedTable && ep.connectedTable.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchMethod && matchCategory && matchQuery;
    });
  }, [endpoints, methodFilter, categoryFilter, searchQuery]);

  // Categories List
  const allCategories = useMemo(() => {
    return Array.from(new Set(endpoints.map((ep) => ep.category)));
  }, [endpoints]);

  // Base URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-bridge.mesrs.dz';
  const fullEndpointUrl = `${baseUrl}${selectedEndpoint.path}`;

  // External Client Integration Code Generator Snippets
  const getIntegrationSnippet = (lang: 'fetch' | 'axios' | 'curl' | 'dart' | 'python') => {
    const activeKey = apiKeys.find((k) => k.status === 'active')?.apiKey || 'dz_live_pub_9a8f2e7b4c1d6e3f';
    const authHeader =
      selectedEndpoint.authType === 'api_key'
        ? `'X-API-Key': '${activeKey}',`
        : selectedEndpoint.authType === 'public'
        ? ''
        : `'Authorization': 'Bearer YOUR_JWT_TOKEN',`;

    const bodyData = ['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && selectedEndpoint.defaultBody
      ? JSON.stringify(selectedEndpoint.defaultBody, null, 2)
      : null;

    if (lang === 'fetch') {
      return `// 1. External Front-End App (React / Vue / Vanilla JS)
// Connects to DZ-Bridge backend database table: ${selectedEndpoint.connectedTable || 'direct API'}

async function callDzBridgeApi() {
  const url = '${fullEndpointUrl}';
  
  const response = await fetch(url, {
    method: '${selectedEndpoint.method}',
    headers: {
      'Content-Type': 'application/json',
      ${authHeader}
    },
    ${bodyData ? `body: JSON.stringify(${bodyData.replace(/\n/g, '\n    ')})` : ''}
  });

  if (!response.ok) {
    throw new Error(\`API request failed with status: \${response.status}\`);
  }

  const data = await response.json();
  console.log('Live Data from DZ-Bridge Database:', data);
  return data;
}

// Call from your external front-end component
callDzBridgeApi();`;
    }

    if (lang === 'axios') {
      return `// 2. Axios Client Integration (React / Next.js / Vue / Node.js)
import axios from 'axios';

const dzBridgeClient = axios.create({
  baseURL: '${baseUrl}',
  headers: {
    'Content-Type': 'application/json',
    ${authHeader}
  },
  timeout: 10000,
});

export async function fetchDzBridgeData() {
  try {
    const response = await dzBridgeClient.${selectedEndpoint.method.toLowerCase()}('${selectedEndpoint.path}'${
      bodyData ? `, ${bodyData}` : ''
    });
    return response.data;
  } catch (error) {
    console.error('Failed to communicate with DZ-Bridge backend:', error);
    throw error;
  }
}`;
    }

    if (lang === 'curl') {
      return `# 3. cURL CLI Request for Terminal, Bash Scripts or Postman
curl -X ${selectedEndpoint.method} "${fullEndpointUrl}" \\
  -H "Content-Type: application/json" \\
  ${selectedEndpoint.authType === 'api_key' ? `-H "X-API-Key: ${activeKey}" \\` : ''}
  ${selectedEndpoint.authType === 'jwt' ? `-H "Authorization: Bearer YOUR_JWT_TOKEN" \\` : ''}
  ${bodyData ? `-d '${bodyData.replace(/\n/g, ' ')}' \\` : ''}
  -v`;
    }

    if (lang === 'dart') {
      return `// 4. Flutter / Dart Mobile Client
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> fetchFromDzBridge() async {
  final url = Uri.parse('${fullEndpointUrl}');
  
  final response = await http.${selectedEndpoint.method.toLowerCase()}(
    url,
    headers: {
      'Content-Type': 'application/json',
      ${selectedEndpoint.authType === 'api_key' ? `'X-API-Key': '${activeKey}',` : ''}
      ${selectedEndpoint.authType === 'jwt' ? `'Authorization': 'Bearer YOUR_JWT_TOKEN',` : ''}
    },
    ${bodyData ? `body: jsonEncode(${bodyData}),` : ''}
  );

  if (response.statusCode == ${selectedEndpoint.expectedStatus}) {
    final Map<String, dynamic> data = jsonDecode(response.body);
    print('Response from backend: \$data');
  } else {
    print('Request failed: \${response.statusCode}');
  }
}`;
    }

    if (lang === 'python') {
      return `# 5. Python Integration (Flask, Django, FastAPI or Scripts)
import requests

url = "${fullEndpointUrl}"
headers = {
    "Content-Type": "application/json",
    ${selectedEndpoint.authType === 'api_key' ? `"X-API-Key": "${activeKey}",` : ''}
    ${selectedEndpoint.authType === 'jwt' ? `"Authorization": "Bearer YOUR_JWT_TOKEN",` : ''}
}
${bodyData ? `payload = ${bodyData}` : ''}

response = requests.${selectedEndpoint.method.toLowerCase()}(
    url,
    headers=headers,
    ${bodyData ? 'json=payload' : ''}
)

if response.status_code == ${selectedEndpoint.expectedStatus}:
    data = response.json()
    print("Database records returned:", data)
else:
    print(f"Error {response.status_code}: {response.text}")`;
    }

    return '';
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'POST':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PUT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PATCH':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. SOVEREIGN GATEWAY HERO BANNER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B0D2C]/10 text-[#3B0D2C] text-xs font-bold border border-[#3B0D2C]/20 mb-2 font-mono">
              <Terminal className="w-3.5 h-3.5 text-[#C89B3C]" />
              <span>Sovereign REST API Gateway & External Integrations Hub</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
              {isAr ? 'مدير واستوديو واجهات برمجة التطبيقات (REST API Gateway)' : 'REST API Gateway & Endpoint Studio'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              {isAr
                ? 'لوحة تحكم مركزية لإنشاء، تعديل، حذف واختبار واجهات REST API التي تتيح للتطبيقات والواجهات الخارجية (مواقع الجامعات، تطبيقات الهاتف، وبوابات الشركاء) الاتصال بقاعدة البيانات مباشرة.'
                : 'Centralized control room to create, make, edit, test, and remove REST API endpoints that connect external frontend applications (university portals, mobile apps, government dashboards) to the live PostgreSQL backend database.'}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-[#3B0D2C] hover:bg-[#4A1238] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 active:scale-98"
            >
              <Plus className="w-4 h-4 text-[#C89B3C]" />
              <span>+ {isAr ? 'إنشاء مسار REST جديد' : 'New REST Endpoint'}</span>
            </button>

            <button
              onClick={() => downloadOpenApiSpec(endpoints, schemaTables, baseUrl)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-2"
              title="Download OpenAPI 3.0 (Swagger) Specification"
            >
              <FileJson className="w-4 h-4 text-blue-600" />
              <span>OpenAPI 3.0 Spec</span>
            </button>

            <button
              onClick={() => downloadPostmanCollection(endpoints, baseUrl)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-2"
              title="Download Postman v2.1 Collection"
            >
              <Download className="w-4 h-4 text-[#C89B3C]" />
              <span>Postman Collection</span>
            </button>
          </div>
        </div>

        {/* Studio Top Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Endpoints
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-slate-900 font-mono tabular-nums">
                {endpoints.filter((e) => e.enabled !== false).length}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ {endpoints.length} routes</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Connected DB Tables
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-slate-900 font-mono tabular-nums">
                {new Set(endpoints.map((e) => e.connectedTable).filter(Boolean)).size}
              </span>
              <span className="text-xs text-slate-400 font-mono">live tables</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Issued API Keys
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-slate-900 font-mono tabular-nums">
                {apiKeys.filter((k) => k.status === 'active').length}
              </span>
              <span className="text-xs text-emerald-700 font-semibold font-mono">active frontends</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              CORS Gateway Origin
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xs font-mono font-bold text-[#8C6514] bg-[#C89B3C]/15 px-2 py-0.5 rounded">
                * (All Front-Ends)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION TABS: Endpoints | API Keys | CORS Gateway */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveMainTab('endpoints')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeMainTab === 'endpoints'
              ? 'bg-[#3B0D2C] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Terminal className="w-4 h-4 text-[#C89B3C]" />
          <span>REST Endpoints Directory & Tester ({endpoints.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('api-keys')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeMainTab === 'api-keys'
              ? 'bg-[#3B0D2C] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Key className="w-4 h-4 text-[#C89B3C]" />
          <span>External Frontend API Keys ({apiKeys.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('cors-gateway')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeMainTab === 'cors-gateway'
              ? 'bg-[#3B0D2C] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Globe className="w-4 h-4 text-[#C89B3C]" />
          <span>CORS & External Application Settings</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ENDPOINTS DIRECTORY & INTERACTIVE INSPECTOR */}
      {/* ============================================================== */}
      {activeMainTab === 'endpoints' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Endpoints Filterable Directory (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search endpoint path, table or description..."
                  className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#3B0D2C]"
                />
              </div>

              {/* Method Filters */}
              <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
                {['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethodFilter(m)}
                    className={`px-2 py-1 rounded-lg font-bold transition ${
                      methodFilter === m
                        ? 'bg-[#3B0D2C] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex-1 h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Categories ({endpoints.length})</option>
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Endpoints List */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredEndpoints.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No matching REST endpoints found</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try clearing your filters or create a new endpoint.</p>
                </div>
              ) : (
                filteredEndpoints.map((ep) => {
                  const isSelected = ep.id === selectedEndpoint.id;
                  const isEnabled = ep.enabled !== false;

                  return (
                    <div
                      key={ep.id}
                      onClick={() => handleSelectEndpoint(ep)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-[#eff4ff]/60 border-[#3B0D2C] ring-1 ring-[#3B0D2C]/40 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                      } ${!isEnabled ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getMethodBadgeClass(
                              ep.method
                            )}`}
                          >
                            {ep.method}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-900 truncate max-w-[200px]">
                            {ep.path}
                          </span>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(ep);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            title="Edit Endpoint"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => handleToggleEndpointEnabled(ep.id, e)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            title={isEnabled ? 'Disable Endpoint' : 'Enable Endpoint'}
                          >
                            {isEnabled ? (
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 leading-snug">
                        {ep.description}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-400">
                        <div className="flex items-center gap-2">
                          {ep.connectedTable && (
                            <span className="flex items-center gap-1 text-[#8C6514] font-bold">
                              <Database className="w-3 h-3 text-[#C89B3C]" />
                              <span>{ep.connectedTable}</span>
                            </span>
                          )}
                          <span>·</span>
                          <span className="uppercase">{ep.authType || 'public'}</span>
                        </div>
                        {ep.isCustomCreated && (
                          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[9px] font-bold">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Endpoint Detail, Testing Console & Code Generator (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {/* Header & Meta */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${getMethodBadgeClass(
                      selectedEndpoint.method
                    )}`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <h3 className="text-base font-bold font-mono text-slate-900">
                    {selectedEndpoint.path}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(selectedEndpoint)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg flex items-center gap-1 shadow-2xs"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDuplicateEndpoint(selectedEndpoint)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg flex items-center gap-1 shadow-2xs"
                    title="Duplicate Endpoint"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Clone</span>
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirmModal(true)}
                    className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {selectedEndpoint.description}
              </p>

              {/* Badges bar */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] font-mono">
                {selectedEndpoint.connectedTable && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-md font-bold">
                    <Database className="w-3 h-3 text-[#C89B3C]" />
                    <span>PostgreSQL Table: {selectedEndpoint.connectedTable}</span>
                  </span>
                )}

                <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-bold">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Auth: {selectedEndpoint.authType || 'public'}</span>
                </span>

                <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                  <Globe className="w-3 h-3 text-slate-500" />
                  <span>CORS: {selectedEndpoint.corsOrigins || '*'}</span>
                </span>

                <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                  <span>Rate: {selectedEndpoint.rateLimitPerMin || 120} req/min</span>
                </span>
              </div>
            </div>

            {/* Inspector Sub-Tabs Bar */}
            <div className="flex items-center border-b border-slate-200 bg-white px-5 text-xs font-bold">
              <button
                onClick={() => setInspectorTab('test-runner')}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  inspectorTab === 'test-runner'
                    ? 'border-[#3B0D2C] text-[#3B0D2C]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Play className="w-3.5 h-3.5 text-[#C89B3C]" />
                <span>Live Test Console</span>
              </button>

              <button
                onClick={() => setInspectorTab('client-code')}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  inspectorTab === 'client-code'
                    ? 'border-[#3B0D2C] text-[#3B0D2C]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-[#C89B3C]" />
                <span>External Front-End Integration (SDK & Code)</span>
              </button>

              <button
                onClick={() => setInspectorTab('schema-mapping')}
                className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  inspectorTab === 'schema-mapping'
                    ? 'border-[#3B0D2C] text-[#3B0D2C]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-[#C89B3C]" />
                <span>Database Table Mapping</span>
              </button>
            </div>

            {/* SUB-TAB 1: LIVE TEST CONSOLE */}
            {inspectorTab === 'test-runner' && (
              <div className="p-5 space-y-4">
                {/* Engine Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs">
                    <span className="font-bold text-slate-800">Target Backend Engine:</span>
                    <span className="text-slate-500 ml-1">
                      {targetEngine === 'browser'
                        ? 'Executes directly against live PostgreSQL relational tables'
                        : targetEngine === 'django'
                        ? 'Simulates Django REST Framework (Port 8000)'
                        : 'Simulates NestJS API Gateway (Port 4000)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs font-mono font-bold">
                    <button
                      onClick={() => setTargetEngine('browser')}
                      className={`px-2.5 py-1 rounded transition ${
                        targetEngine === 'browser'
                          ? 'bg-[#3B0D2C] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Browser Live DB
                    </button>
                    <button
                      onClick={() => setTargetEngine('nestjs')}
                      className={`px-2.5 py-1 rounded transition ${
                        targetEngine === 'nestjs'
                          ? 'bg-[#3B0D2C] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      NestJS (4000)
                    </button>
                    <button
                      onClick={() => setTargetEngine('django')}
                      className={`px-2.5 py-1 rounded transition ${
                        targetEngine === 'django'
                          ? 'bg-[#3B0D2C] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Django (8000)
                    </button>
                  </div>
                </div>

                {/* Query Parameters if any */}
                {Object.keys(queryParams).length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Query Parameters
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(queryParams).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="w-24 text-xs font-mono font-bold text-slate-700 truncate">{key}:</span>
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => setQueryParams((prev) => ({ ...prev, [key]: e.target.value }))}
                            className="flex-1 h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Request Body Editor (for POST/PUT/PATCH) */}
                {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-bold uppercase tracking-wider">JSON Request Payload (Body)</span>
                      <button
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(requestBodyText);
                            setRequestBodyText(JSON.stringify(parsed, null, 2));
                          } catch {
                            // ignore
                          }
                        }}
                        className="text-xs text-[#3B0D2C] font-bold hover:underline"
                      >
                        Format JSON
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      value={requestBodyText}
                      onChange={(e) => setRequestBodyText(e.target.value)}
                      placeholder='{ "key": "value" }'
                      className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#C89B3C] leading-relaxed"
                    />
                  </div>
                )}

                {/* Send Button */}
                <button
                  onClick={handleRunExecution}
                  disabled={isExecuting}
                  className="w-full py-2.5 bg-[#3B0D2C] hover:bg-[#4A1238] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-99"
                >
                  <Play className={`w-4 h-4 text-[#C89B3C] ${isExecuting ? 'animate-spin' : ''}`} />
                  <span>{isExecuting ? 'Sending Request...' : `Send ${selectedEndpoint.method} Request to Database`}</span>
                </button>

                {/* Execution Results View */}
                {executionResult && (
                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                            executionResult.statusCode < 300
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {executionResult.statusCode} {executionResult.statusText}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {executionResult.responseTimeMs} ms
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {executionResult.payloadSizeKb} KB
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(executionResult.data, null, 2));
                          setCopiedResponse(true);
                          setTimeout(() => setCopiedResponse(false), 2000);
                        }}
                        className="text-xs text-[#3B0D2C] hover:text-[#C89B3C] font-bold flex items-center gap-1"
                      >
                        {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedResponse ? 'Copied JSON' : 'Copy Response'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400 border border-slate-800 overflow-x-auto max-h-80 leading-relaxed">
                        {JSON.stringify(executionResult.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: EXTERNAL FRONT-END INTEGRATION (MULTI-LANGUAGE SDK) */}
            {inspectorTab === 'client-code' && (
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Connect External Frontend Applications
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Copy and paste this production-ready code directly into your React, Vue, Next.js, Flutter, or Python application.
                    </p>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono font-bold">
                    {(['fetch', 'axios', 'curl', 'dart', 'python'] as const).map((langKey) => (
                      <button
                        key={langKey}
                        onClick={() => setSelectedClientLang(langKey)}
                        className={`px-2.5 py-1 rounded transition ${
                          selectedClientLang === langKey
                            ? 'bg-[#3B0D2C] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {langKey === 'fetch'
                          ? 'Fetch / React'
                          : langKey === 'axios'
                          ? 'Axios'
                          : langKey === 'curl'
                          ? 'cURL'
                          : langKey === 'dart'
                          ? 'Flutter / Dart'
                          : 'Python'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Snippet Box */}
                <div className="relative">
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getIntegrationSnippet(selectedClientLang));
                        setCopiedSnippet(true);
                        setTimeout(() => setCopiedSnippet(false), 2000);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition border border-slate-700 shadow-sm"
                    >
                      {copiedSnippet ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-[420px]">
                    {getIntegrationSnippet(selectedClientLang)}
                  </pre>
                </div>

                {/* Integration Details Callout */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1 text-slate-700">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Globe2 className="w-4 h-4 text-blue-600" />
                    <span>External Frontend Connection Requirements:</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    1. <strong>Base URL:</strong> Point your front-end API client to <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono font-bold text-blue-900">{baseUrl}</code>
                    <br />
                    2. <strong>CORS:</strong> This endpoint allows origins matching <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono">{selectedEndpoint.corsOrigins || '*'}</code>.
                    <br />
                    3. <strong>Authentication:</strong> Pass header <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono">X-API-Key: dz_live_...</code> or <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono">Authorization: Bearer &lt;token&gt;</code>.
                  </p>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: DATABASE TABLE MAPPING */}
            {inspectorTab === 'schema-mapping' && (
              <div className="p-5 space-y-4">
                <div className="pb-3 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#C89B3C]" />
                    <span>Relational Database Table: {selectedEndpoint.connectedTable || 'Custom Query'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Every API request to this endpoint connects directly to the underlying PostgreSQL table.
                  </p>
                </div>

                {selectedEndpoint.connectedTable && dataStore[selectedEndpoint.connectedTable] ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Total Live Records in Table: <strong>{dataStore[selectedEndpoint.connectedTable]?.length || 0}</strong></span>
                      <span className="font-mono text-[11px] text-slate-400">table: {selectedEndpoint.connectedTable}</span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-60">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px]">
                          <tr>
                            <th className="py-2 px-3">Column ID</th>
                            <th className="py-2 px-3">Type</th>
                            <th className="py-2 px-3">Nullable</th>
                            <th className="py-2 px-3">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(schemaTables.find((t) => t.name === selectedEndpoint.connectedTable)?.columns || []).map((col) => (
                            <tr key={col.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-bold text-slate-800">{col.name}</td>
                              <td className="py-2 px-3 text-[#3B0D2C]">{col.type}</td>
                              <td className="py-2 px-3">{col.isNullable ? 'YES' : 'NO'}</td>
                              <td className="py-2 px-3 text-slate-500">{col.description || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500">This endpoint uses a virtual or composite payload schema.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: EXTERNAL FRONTEND API KEYS & CREDENTIALS */}
      {/* ============================================================== */}
      {activeMainTab === 'api-keys' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-[#C89B3C]" />
                <span>External Frontend Applications & API Keys</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Issue and manage access credentials for third-party frontends, mobile applications, and partner university software.
              </p>
            </div>

            <button
              onClick={() => setShowCreateKeyModal(true)}
              className="px-4 py-2 bg-[#3B0D2C] hover:bg-[#4A1238] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#C89B3C]" />
              <span>+ Generate New API Key</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className={`p-4 rounded-xl border transition ${
                  k.status === 'active'
                    ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-100/50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{k.clientName}</h4>
                    <span className="text-[10px] font-mono text-slate-400">Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      k.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {k.status.toUpperCase()}
                  </span>
                </div>

                {/* API Key Obfuscated Display */}
                <div className="mt-3 p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                  <div className="font-mono text-xs text-slate-700 truncate">
                    <span>{k.apiKey.slice(0, 14)}</span>
                    <span className="text-slate-400">••••••••••••••••</span>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(k.apiKey);
                      setCopiedKeyId(k.id);
                      setTimeout(() => setCopiedKeyId(null), 2000);
                    }}
                    className="p-1 text-slate-500 hover:text-[#3B0D2C] hover:bg-slate-50 rounded text-xs font-bold flex items-center gap-1 shrink-0"
                    title="Copy API Key"
                  >
                    {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKeyId === k.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Key Attributes */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500">
                  <span>Role: <strong>{k.role}</strong></span>
                  <span>·</span>
                  <span>CORS: <strong>{k.allowedOrigins}</strong></span>
                  <span>·</span>
                  <span>Rate: <strong>{k.rateLimit} req/min</strong></span>
                </div>

                {k.status === 'active' && (
                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => handleRevokeApiKey(k.id)}
                      className="text-[11px] font-bold text-rose-700 hover:underline"
                    >
                      Revoke Key Access
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CORS & GLOBAL GATEWAY CONFIGURATION */}
      {/* ============================================================== */}
      {activeMainTab === 'cors-gateway' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C89B3C]" />
              <span>Cross-Origin Resource Sharing (CORS) & Security Whitelists</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control which external frontend origins and domain names are permitted to initiate cross-origin browser requests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-900 block">Default Allowed Headers</span>
              <div className="space-y-1.5 text-xs font-mono text-slate-700">
                <div className="p-2 bg-white rounded border border-slate-200">Content-Type: application/json</div>
                <div className="p-2 bg-white rounded border border-slate-200">Authorization: Bearer &lt;jwt_token&gt;</div>
                <div className="p-2 bg-white rounded border border-slate-200">X-API-Key: dz_live_...</div>
                <div className="p-2 bg-white rounded border border-slate-200">X-Requested-With: XMLHttpRequest</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-900 block">Allowed HTTP Methods</span>
              <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
                <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg">GET</span>
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg">POST</span>
                <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg">PUT</span>
                <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg">PATCH</span>
                <span className="px-3 py-1.5 bg-rose-100 text-rose-800 rounded-lg">DELETE</span>
                <span className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg">OPTIONS</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Browser pre-flight <code className="font-mono bg-white px-1 rounded">OPTIONS</code> checks are handled automatically by the sovereign API gateway router with 204 No Content.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREATE OR EDIT REST API ENDPOINT */}
      {/* ============================================================== */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#3B0D2C] text-[#C89B3C]">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                    {modalMode === 'create' ? 'Create New REST API Endpoint' : `Edit Endpoint: ${formPath}`}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Connect this REST endpoint directly to an underlying database table.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEndpoint} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Method and Path */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">HTTP Method *</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs font-bold text-slate-700 block mb-1">URL Path *</label>
                  <input
                    type="text"
                    required
                    value={formPath}
                    onChange={(e) => setFormPath(e.target.value)}
                    placeholder="/api/v1/external/my-endpoint"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Connected Database Table and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Connected Database Table *
                  </label>
                  <select
                    value={formConnectedTable}
                    onChange={(e) => setFormConnectedTable(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  >
                    <option value="">None / Custom Payload</option>
                    {schemaTables.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.category || 'Database Table'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. 6. External Integrations"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explains what this REST API endpoint does and returns..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Authentication, Status, Rate Limit, CORS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Auth Requirement</label>
                  <select
                    value={formAuthType}
                    onChange={(e) => setFormAuthType(e.target.value as any)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="public">Public (None)</option>
                    <option value="api_key">API Key (X-API-Key)</option>
                    <option value="jwt">Bearer JWT Token</option>
                    <option value="admin">Admin Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Rate Limit (req/min)</label>
                  <input
                    type="number"
                    value={formRateLimit}
                    onChange={(e) => setFormRateLimit(parseInt(e.target.value, 10) || 60)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Expected Status Code</label>
                  <input
                    type="number"
                    value={formExpectedStatus}
                    onChange={(e) => setFormExpectedStatus(parseInt(e.target.value, 10) || 200)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* CORS Allowed Origins */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">CORS Allowed Origins</label>
                <input
                  type="text"
                  value={formCorsOrigins}
                  onChange={(e) => setFormCorsOrigins(e.target.value)}
                  placeholder="* or comma-separated domains (e.g. https://univ.dz, http://localhost:3000)"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              {/* Default Body (JSON) */}
              {['POST', 'PUT', 'PATCH'].includes(formMethod) && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Sample / Default JSON Body
                  </label>
                  <textarea
                    rows={5}
                    value={formBodyJson}
                    onChange={(e) => {
                      setFormBodyJson(e.target.value);
                      setFormJsonError(null);
                    }}
                    placeholder='{ "title": "New item" }'
                    className="w-full p-2.5 font-mono text-xs bg-slate-950 text-emerald-400 rounded-xl border border-slate-800"
                  />
                  {formJsonError && (
                    <p className="text-xs text-rose-600 font-bold mt-1">{formJsonError}</p>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3B0D2C] hover:bg-[#4A1238] text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  {modalMode === 'create' ? 'Save & Register REST API' : 'Update Endpoint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ============================================================== */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-rose-100 text-rose-700">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Remove REST Endpoint</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedEndpoint.path}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove this endpoint from the REST API gateway? External frontend applications calling this route will receive HTTP 404 Not Found.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEndpoint}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                Yes, Delete Endpoint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREATE API KEY */}
      {/* ============================================================== */}
      {showCreateKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#C89B3C]" />
                <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Generate External Front-End API Key
                </h3>
              </div>
              <button
                onClick={() => setShowCreateKeyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateApiKey} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Client / Frontend Application Name *
                </label>
                <input
                  type="text"
                  required
                  value={newKeyClientName}
                  onChange={(e) => setNewKeyClientName(e.target.value)}
                  placeholder="e.g. University Portal iOS App or Oran Lab Frontend"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Permitted Role Scope
                </label>
                <select
                  value={newKeyRole}
                  onChange={(e) => setNewKeyRole(e.target.value as any)}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                >
                  <option value="external">External Third-Party (Public Scope)</option>
                  <option value="expert">Expert / Scholar Fellow Scope</option>
                  <option value="organization">University Host Scope</option>
                  <option value="admin">Super Admin Full Scope</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Allowed CORS Domain Origins
                </label>
                <input
                  type="text"
                  value={newKeyOrigins}
                  onChange={(e) => setNewKeyOrigins(e.target.value)}
                  placeholder="* or https://myuniversity.dz"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Rate Limit (requests per minute)
                </label>
                <input
                  type="number"
                  value={newKeyRateLimit}
                  onChange={(e) => setNewKeyRateLimit(parseInt(e.target.value, 10) || 120)}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateKeyModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3B0D2C] hover:bg-[#4A1238] text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
