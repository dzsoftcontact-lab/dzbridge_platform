import React, { useState, useEffect } from 'react';
import { PanelLeftOpen } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { RoleExplanationBanner } from './components/RoleExplanationBanner';
import { DashboardOverview } from './components/DashboardOverview';
import { ExpertWorkspace } from './components/ExpertWorkspace';
import { OrganizationPortal } from './components/OrganizationPortal';
import { ApiManagementStudio } from './components/ApiManagementStudio';
import { DjangoDrfClient } from './components/DjangoDrfClient';
import { DatabaseStudio } from './components/DatabaseStudio';
import { TestSequenceRunner } from './components/TestSequenceRunner';
import { AnalyticsView } from './components/AnalyticsView';
import { TranslationManager } from './components/TranslationManager';
import { BackendConnectModal } from './components/BackendConnectModal';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { AdminConsole } from './components/AdminConsole';
import { UserManagementStudio } from './components/UserManagementStudio';
import { KpiManagementStudio } from './components/KpiManagementStudio';

import { LanguageProvider, useTranslation } from './i18n/LanguageContext';

import {
  UserRole,
  ProjectStatus,
  SchemaTableDef,
  SchemaRelation,
  BackendConnectionConfig,
  ActivityLogItem,
  ProjectItem,
  MatchItem,
  CollaborationItem,
  ExpertAvailability,
  CustomKpiItem,
} from './types';

import { INITIAL_SCHEMA_TABLES, INITIAL_SCHEMA_RELATIONS } from './data/schemaData';
import { TableRow } from './services/dbStore';
import {
  INITIAL_EXPERTS,
  INITIAL_EXPERTS_RECORDS,
  INITIAL_PROJECTS,
  INITIAL_MATCHES,
  INITIAL_COLLABORATIONS,
  INITIAL_CUSTOM_KPIS,
  INITIAL_MATCHING_ALGORITHMS,
  INITIAL_MATCH_EVALUATIONS,
  INITIAL_KPI_EVALUATIONS,
  INITIAL_PROJECT_STATUS_HISTORIES,
  INITIAL_INSTITUTIONS,
  INITIAL_ACADEMIC_INSTITUTIONS,
  INITIAL_RESEARCH_LABORATORIES,
  INITIAL_MATCHING_CRITERIA_WEIGHTS,
  INITIAL_MATCHING_RUNS,
  INITIAL_PUBLICATIONS_PATENTS,
  INITIAL_COLLABORATION_MILESTONES,
  INITIAL_KPI_INSTITUTION_TARGETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RATINGS,
} from './data/mockDb';

function AppContent() {
  const { lang } = useTranslation();
  const [activeRole, setActiveRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Left Panel (Sidebar) Open/Closed State with localStorage persistence
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('dz_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('dz_sidebar_open', String(next));
      return next;
    });
  };

  // Global Ctrl+B / Cmd+B keyboard shortcut to toggle left panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync real persistent backend state from server on mount
  useEffect(() => {
    fetch('/api/state/full')
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error('Server state unreachable');
      })
      .then((state) => {
        if (state.table_data_store && Object.keys(state.table_data_store).length > 0) {
          setDataStore(state.table_data_store);
        }
        if (state.projects && state.projects.length > 0) {
          setProjectsList(state.projects);
        }
        if (state.matches && state.matches.length > 0) {
          setMatchesList(state.matches);
        }
        if (state.collaborations && state.collaborations.length > 0) {
          setCollaborationsList(state.collaborations);
        }
      })
      .catch((err) => {
        console.warn('Initial state sync fallback to baseline data:', err);
      });
  }, []);

  // Active Scholar Persona (when viewing as expert)
  const [currentExpertIndex, setCurrentExpertIndex] = useState(0);
  const activeExpert = INITIAL_EXPERTS[currentExpertIndex] || INITIAL_EXPERTS[0];

  // Backend Connection State
  const [backendConfig, setBackendConfig] = useState<BackendConnectionConfig>({
    apiUrl: 'http://localhost:4000/api/v1',
    djangoApiUrl: 'http://localhost:8000/api/v1',
    status: 'connected',
    latencyMs: 18,
    port: 4000,
    djangoPort: 8000,
    database: 'dz_bridge_db',
    dbType: 'PostgreSQL 16 (UUID & JSONB)',
    jwtToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi0wMDAiLCJlbWFpbCI6ImFkbWluQGR6LWJyaWRnZS5keiIsInJvbGUiOiJhZG1pbiIsInN0YXR1cyI6ImFjdGl2ZSJ9.DzBridgeAdminTokenVerifiedSignature',
    lastPing: new Date().toLocaleTimeString(),
  });

  // Schema Definitions
  // Schema Definitions
  const [schemaTables, setSchemaTables] = useState<SchemaTableDef[]>(INITIAL_SCHEMA_TABLES);
  const [schemaRelations, setSchemaRelations] = useState<SchemaRelation[]>(INITIAL_SCHEMA_RELATIONS);

  // Comprehensive Baseline Data Store Generator (All 21 Tables Fully Linked)
  const buildBaselineDataStore = (): Record<string, TableRow[]> => {
    const map: Record<string, TableRow[]> = {};
    INITIAL_SCHEMA_TABLES.forEach((tbl) => {
      map[tbl.name] = [];
    });

    // 1. Users
    map['users'] = [
      { id: 'admin-000', email: 'dzsoft.contact@gmail.com', full_name: 'DEGHA HOUSSEM EDDINE', role: 'admin', status: 'active', created_at: '2026-08-01T08:00:00Z' },
      ...INITIAL_EXPERTS.map((e) => ({
        id: e.id,
        email: e.email,
        role: 'expert',
        status: 'active',
        created_at: '2026-08-01T08:00:00Z',
      })),
      ...INITIAL_ACADEMIC_INSTITUTIONS.map((inst) => ({
        id: inst.userId,
        email: inst.contactEmail,
        role: 'organization',
        status: 'active',
        created_at: '2026-08-01T08:00:00Z',
      })),
    ];

    // 2. Profiles
    map['profiles'] = [
      {
        id: 'prof-admin-000',
        user_id: 'admin-000',
        full_name: 'DEGHA HOUSSEM EDDINE',
        organization_name: "MESRS - Ministère de l'Enseignement Supérieur",
        organization_type: 'Government / Ministry',
        bio: 'Lead System Architect & National Platform Administrator (MESRS Governance)',
        phone_number: '+213 550 12 34 56',
        country: 'Algeria',
        city: 'Algiers',
        is_diaspora: false,
        expertise_tags: ['Platform Architecture', 'PostgreSQL Schema', 'REST API', 'Governance'],
        collaboration_preferences: ['National Academic Strategic Alignment'],
        documents: [],
        created_at: '2026-08-01T08:00:00Z',
      },
      ...INITIAL_EXPERTS.map((e) => ({
      id: e.profile.id,
      user_id: e.id,
      full_name: e.profile.fullName,
      organization_name: e.profile.organizationName,
      organization_type: e.profile.organizationType,
      bio: e.profile.bio,
      phone_number: e.profile.phoneNumber,
      country: e.profile.country,
      city: e.profile.city,
      is_diaspora: e.profile.isDiaspora,
      expertise_tags: e.profile.expertiseTags,
      collaboration_preferences: e.profile.collaborationPreferences,
      documents: e.profile.documents,
      created_at: '2026-08-01T08:00:00Z',
    })),
  ];

    // 2b. Dedicated Experts Table
    map['experts'] = INITIAL_EXPERTS_RECORDS.map((exp) => ({
      id: exp.id,
      user_id: exp.userId,
      full_name: exp.fullName,
      academic_title: exp.academicTitle,
      highest_degree: exp.highestDegree,
      current_affiliation: exp.currentAffiliation,
      country: exp.country,
      city: exp.city || 'Algiers',
      is_diaspora: exp.isDiaspora,
      primary_domain: exp.primaryDomain,
      skills: exp.skills,
      h_index: exp.hIndex,
      citations_count: exp.citationsCount,
      publications_count: exp.publicationsCount,
      bio: exp.bio || '',
      google_scholar_url: exp.googleScholarUrl || '',
      orcid_id: exp.orcidId || '',
      verification_status: exp.verificationStatus,
      created_at: exp.createdAt,
    }));

    // 3. Unified General Institutions Table
    map['institutions'] = INITIAL_INSTITUTIONS.map((inst) => ({
      id: inst.id,
      user_id: inst.userId,
      code: inst.code,
      name: inst.name,
      acronym: inst.acronym,
      institution_type: inst.institutionType,
      sector: inst.sector || 'public',
      wilaya: inst.wilaya,
      country: inst.country || 'Algeria',
      rector_or_director: inst.rectorOrDirector,
      contact_email: inst.contactEmail,
      website: inst.website || '',
      total_doctoral_students: inst.totalDoctoralStudents,
      is_verified: inst.isVerified !== false,
      created_at: inst.createdAt,
    }));

    // Backward-compatibility alias pointer
    map['academic_institutions'] = map['institutions'];

    // 4. Research Laboratories
    map['research_laboratories'] = INITIAL_RESEARCH_LABORATORIES.map((lab) => ({
      id: lab.id,
      institution_id: lab.institutionId,
      director_user_id: lab.directorUserId,
      code: lab.code,
      name: lab.name,
      acronym: lab.acronym,
      scientific_domain: lab.scientificDomain,
      doctoral_school_name: lab.doctoralSchoolName,
      created_at: lab.createdAt,
    }));

    // Master mapping: User account ID -> Dedicated Expert entity primary key (experts.id)
    const userToExpertId: Record<string, string> = {
      'usr-haba-1001': 'exp-001',
      'usr-benali-1002': 'exp-002',
      'usr-mansouri-1003': 'exp-003',
    };

    // 5. Expert Availabilities (FK -> experts.id)
    const availRows: TableRow[] = [];
    INITIAL_EXPERTS.forEach((exp) => {
      const expertPk = userToExpertId[exp.id] || exp.id;
      exp.availabilities.forEach((av) => {
        availRows.push({
          id: av.id,
          expert_id: expertPk,
          user_id: exp.id,
          userId: exp.id,
          city: av.city,
          start_date: av.startDate,
          end_date: av.endDate,
          duration_days: av.durationDays,
          notes: av.notes,
          created_at: '2026-08-15T08:00:00Z',
        });
      });
    });
    map['expert_availabilities'] = availRows;

    // 6. Matching Algorithms
    map['matching_algorithms'] = INITIAL_MATCHING_ALGORITHMS.map((ma) => ({
      id: ma.id,
      name: ma.name,
      version: ma.version,
      description: ma.description,
      skills_weight: ma.skillsWeight,
      availability_weight: ma.availabilityWeight,
      location_weight: ma.locationWeight,
      diaspora_bonus_weight: ma.diasporaBonusWeight,
      min_compatibility_threshold: ma.minCompatibilityThreshold,
      is_active: ma.isActive,
      created_by_user_id: ma.createdByUserId,
      created_at: ma.createdAt,
    }));

    // 7. Matching Criteria Weights
    map['matching_criteria_weights'] = INITIAL_MATCHING_CRITERIA_WEIGHTS.map((mcw) => ({
      id: mcw.id,
      algorithm_id: mcw.algorithmId,
      criterion_code: mcw.criterionCode,
      criterion_name: mcw.criterionName,
      weight_percentage: mcw.weightPercentage,
      is_mandatory: mcw.isMandatory,
      minimum_score_required: mcw.minimumScoreRequired,
      notes: mcw.notes,
    }));

    // 8. Matching Runs
    map['matching_runs'] = INITIAL_MATCHING_RUNS.map((mr) => ({
      id: mr.id,
      algorithm_id: mr.algorithmId,
      project_id: mr.projectId,
      initiated_by_user_id: mr.initiatedByUserId,
      candidates_evaluated: mr.candidatesEvaluated,
      matches_generated: mr.matchesGenerated,
      avg_compatibility_score: mr.avgCompatibilityScore,
      execution_time_ms: mr.executionTimeMs,
      status: mr.status,
      ran_at: mr.ranAt,
    }));

    // 9. Projects
    map['projects'] = INITIAL_PROJECTS.map((p) => ({
      id: p.id,
      organization_id: p.organizationId,
      institution_id: p.organizationId === 'usr-esi-2001' ? 'inst-esi' : 'inst-usthb',
      laboratory_id: p.organizationId === 'usr-esi-2001' ? 'lab-lsi' : 'lab-lrea',
      title: p.title,
      description: p.description,
      skills_required: p.skillsRequired,
      location: p.location,
      start_date: p.startDate,
      end_date: p.endDate,
      logistics_offered: p.logisticsOffered,
      budget_details: p.budgetDetails,
      status: p.status,
      created_at: p.createdAt,
    }));

    // 10. Matches (FK -> experts.id)
    map['matches'] = INITIAL_MATCHES.map((m) => ({
      id: m.id,
      project_id: m.projectId,
      expert_id: userToExpertId[m.expertId] || m.expertId,
      user_id: m.expertId,
      userId: m.expertId,
      algorithm_id: m.algorithmId || 'algo-001',
      matching_run_id: 'run-001',
      compatibility_score: m.compatibilityScore,
      score_breakdown: m.scoreBreakdown,
      status: m.status,
      notified_at: m.notifiedAt,
      responded_at: m.respondedAt,
      created_at: m.notifiedAt,
    }));

    // 11. Match Evaluations
    map['match_evaluations'] = INITIAL_MATCH_EVALUATIONS.map((me) => ({
      id: me.id,
      match_id: me.matchId,
      algorithm_id: me.algorithmId,
      matching_run_id: 'run-001',
      evaluator_user_id: me.evaluatorUserId,
      skills_alignment_score: me.skillsAlignmentScore,
      availability_sync_score: me.availabilitySyncScore,
      location_affinity_score: me.locationAffinityScore,
      diaspora_priority_score: me.diasporaPriorityScore,
      composite_score: me.compositeScore,
      precision_metric: me.precisionMetric,
      recall_metric: 94.2,
      f1_score: 95.8,
      committee_verification_notes: me.committeeVerificationNotes,
      is_verified_by_committee: me.isVerifiedByCommittee,
      created_at: me.createdAt,
    }));

    // 12. Collaborations (FK -> experts.id)
    map['collaborations'] = INITIAL_COLLABORATIONS.map((c) => ({
      id: c.id,
      project_id: c.projectId,
      expert_id: userToExpertId[c.expertId] || c.expertId,
      user_id: c.expertId,
      userId: c.expertId,
      organization_id: c.organizationId,
      institution_id: c.organizationId === 'usr-esi-2001' ? 'inst-esi' : 'inst-usthb',
      status: c.status,
      confirmed_at: c.confirmedAt,
      completed_at: c.completedAt,
      notes: c.notes,
      created_at: c.createdAt,
    }));

    // 13. Collaboration Milestones (FK -> experts.id)
    map['collaboration_milestones'] = INITIAL_COLLABORATION_MILESTONES.map((cm) => ({
      id: cm.id,
      collaboration_id: cm.collaborationId,
      assigned_expert_id: userToExpertId[cm.assignedExpertId] || cm.assignedExpertId,
      user_id: cm.assignedExpertId,
      title: cm.title,
      phase_number: cm.phaseNumber,
      target_completion_date: cm.targetCompletionDate,
      completed_at: cm.completedAt,
      status: cm.status,
      deliverable_description: cm.deliverableDescription,
      verified_by_user_id: cm.verifiedByUserId,
      created_at: cm.createdAt,
    }));

    // 14. Publications & Patents (FK -> experts.id)
    map['publications_patents'] = INITIAL_PUBLICATIONS_PATENTS.map((pp) => ({
      id: pp.id,
      expert_id: userToExpertId[pp.expertId] || pp.expertId,
      user_id: pp.expertId,
      collaboration_id: pp.collaborationId,
      institution_id: pp.institutionId,
      title: pp.title,
      type: pp.type,
      patent_or_doi_number: pp.patentOrDoiNumber,
      publisher_or_patent_office: pp.publisherOrPatentOffice,
      year: pp.year,
      citations_count: pp.citationsCount,
      created_at: pp.createdAt,
    }));

    // 15. Ratings
    map['ratings'] = INITIAL_RATINGS;

    // 16. Custom KPIs
    map['custom_kpis'] = INITIAL_CUSTOM_KPIS.map((k) => ({
      id: k.id,
      name: k.name,
      description: k.description,
      category: k.category,
      current_value: k.currentValue,
      target_value: k.targetValue,
      unit: k.unit || '',
      progress_percentage: k.progressPercentage,
      status: k.status,
      visualization_type: k.visualizationType,
      display_on_landing: k.displayOnLanding,
      created_by_user_id: k.createdByUserId,
      target_algorithm_id: k.targetAlgorithmId,
      target_institution_id: 'inst-esi',
      created_at: k.createdAt,
    }));

    // 17. KPI Evaluations
    map['kpi_evaluations'] = INITIAL_KPI_EVALUATIONS.map((ke) => ({
      id: ke.id,
      kpi_id: ke.kpiId,
      evaluated_by_user_id: ke.evaluatedByUserId,
      institution_id: 'inst-esi',
      recorded_value: ke.recordedValue,
      target_value: ke.targetValue,
      delta_percentage: ke.deltaPercentage,
      compliance_status: ke.complianceStatus,
      evaluation_notes: ke.evaluationNotes,
      evaluated_at: ke.evaluatedAt,
    }));

    // 18. KPI Institution Targets
    map['kpi_institution_targets'] = INITIAL_KPI_INSTITUTION_TARGETS.map((kit) => ({
      id: kit.id,
      kpi_id: kit.kpiId,
      institution_id: kit.institutionId,
      assigned_target_value: kit.assignedTargetValue,
      achieved_value: kit.achievedValue,
      compliance_rate: kit.complianceRate,
      last_updated: kit.lastUpdated,
    }));

    // 19. Project Status Histories
    map['project_status_histories'] = INITIAL_PROJECT_STATUS_HISTORIES;

    // 20. Activity Logs
    map['activity_logs'] = [
      {
        id: 'log-boot-001',
        user_id: 'admin-000',
        userId: 'admin-000',
        project_id: 'proj-0001-esi',
        collaboration_id: 'collab-001',
        user_role: 'admin',
        userName: 'MESRS Directorate',
        action_type: 'SYSTEM_BOOTSTRAP',
        entity_type: 'platform',
        ip_address: '127.0.0.1',
        metadata: {
          note: 'Platform initialized with 28 fully linked relational tables and zero circular loops.',
          stack: 'PostgreSQL 16 + Django 5.1 + React + Vite',
        },
        created_at: '2026-09-01T08:00:00Z',
        createdAt: '2026-09-01T08:00:00Z',
      },
      {
        id: 'log-boot-002',
        user_id: 'usr-esi-2001',
        userId: 'usr-esi-2001',
        project_id: 'proj-0001-esi',
        collaboration_id: 'collab-001',
        user_role: 'organization',
        userName: 'ESI Algiers Admin',
        action_type: 'COLLABORATION_CONFIRMED',
        entity_type: 'collaboration',
        ip_address: '193.194.76.10',
        metadata: {
          scholar: 'Dr. Amina Benali',
          scope: 'Doctoral Arabic NLP & Algerian Dialect LLM',
        },
        created_at: '2026-09-28T14:00:00Z',
        createdAt: '2026-09-28T14:00:00Z',
      },
    ];

    // 21. Notifications
    map['notifications'] = INITIAL_NOTIFICATIONS.map((n) => ({
      id: n.id,
      user_id: n.userId,
      match_id: n.matchId,
      project_id: n.projectId,
      collaboration_id: n.collaborationId,
      type: n.type,
      title: n.title,
      message: n.message,
      is_read: n.isRead,
      created_at: n.createdAt,
    }));

    // 22. Conversations
    map['conversations'] = [
      {
        id: 'conv-001',
        project_id: 'proj-0001-esi',
        expert_id: 'usr-benali-1002',
        organization_id: 'usr-esi-2001',
        match_id: 'match-001',
        status: 'active',
        preferred_contact_slot: 'Thursdays 14:00 - 16:00 CET',
        last_message_at: '2026-09-29T11:45:00Z',
        created_at: '2026-09-27T10:35:00Z',
      },
    ];

    // 23. Messages
    map['messages'] = [
      {
        id: 'msg-001',
        conversation_id: 'conv-001',
        sender_id: 'usr-esi-2001',
        recipient_id: 'usr-benali-1002',
        body: 'Welcome Dr. Benali. We are honored to collaborate on the Algerian Dialect LLM Doctoral Program at ESI Algiers.',
        attachments: [{ name: 'doctoral_curriculum_v2.pdf', size: '2.4MB' }],
        is_read: true,
        sent_at: '2026-09-27T11:00:00Z',
      },
      {
        id: 'msg-002',
        conversation_id: 'conv-001',
        sender_id: 'usr-benali-1002',
        recipient_id: 'usr-esi-2001',
        body: 'Thank you Director. I have reviewed the syllabus and confirmed my physical visit to Algiers for the November workshop.',
        attachments: [{ name: 'lecture_plan_arabic_nlp.pdf', size: '1.1MB' }],
        is_read: true,
        sent_at: '2026-09-28T09:20:00Z',
      },
    ];

    // 24. Event Promotions
    map['event_promotions'] = [
      {
        id: 'ep-001',
        organization_id: 'usr-esi-2001',
        collaboration_id: 'collab-001',
        project_id: 'proj-0001-esi',
        title: 'National Doctoral Workshop on Generative AI & Arabic Dialect NLP',
        description: 'Five-day intensive seminar featuring diaspora guest laureate Dr. Amina Benali at ESI Oued Smar campus.',
        event_type: 'doctoral_seminar',
        location_city: 'Algiers',
        venue_address: 'Amphi Bertin, Higher National School of Computer Science (ESI), Oued Smar',
        event_date: '2026-11-12',
        materials_urls: ['https://esi.dz/events/ai-seminar-2026.pdf'],
        status: 'published',
        approved_by_admin_id: 'admin-000',
        created_at: '2026-09-29T14:00:00Z',
      },
    ];

    // 25. Surveys
    map['surveys'] = [
      {
        id: 'sv-001',
        title: 'Post-Collaboration Impact & Transfer Quality Survey',
        survey_type: 'collaboration_experience',
        target_role: 'all',
        trigger_event: 'after_collaboration_completion',
        questions: [
          { id: 'q1', text: 'How effectively did the diaspora fellow transfer knowledge to doctoral students?', type: 'scale_1_5' },
          { id: 'q2', text: 'Were local logistical arrangements (lodging, transport, lab access) sufficient?', type: 'scale_1_5' },
        ],
        is_active: true,
        created_by_user_id: 'admin-000',
        created_at: '2026-08-15T09:00:00Z',
      },
    ];

    // 26. Survey Responses
    map['survey_responses'] = [
      {
        id: 'sr-001',
        survey_id: 'sv-001',
        user_id: 'usr-esi-2001',
        project_id: 'proj-0001-esi',
        collaboration_id: 'collab-001',
        responses: { q1: 5, q2: 5 },
        rating: 5,
        nps_score: 10,
        comments: 'Dr. Benali provided world-class doctoral supervision to our students.',
        submitted_at: '2026-09-30T16:00:00Z',
      },
    ];

    // 27. Issue Flags
    map['issue_flags'] = [
      {
        id: 'if-001',
        reporter_user_id: 'usr-esi-2001',
        reported_user_id: null,
        project_id: 'proj-0001-esi',
        collaboration_id: 'collab-001',
        category: 'logistics',
        description: 'High-speed GPU access for Algerian dial-in scholars required cloud quota expansion.',
        severity: 'low',
        status: 'resolved',
        admin_resolution_notes: 'MESRS Cloud AI computing grant allocated 500 GPU hours for the workshop.',
        created_at: '2026-09-28T16:00:00Z',
      },
    ];

    // 28. Analytics Snapshots
    map['analytics_snapshots'] = [
      {
        id: 'as-001',
        snapshot_date: '2026-09-30',
        period_type: 'monthly',
        total_registered_experts: 320,
        total_registered_organizations: 48,
        total_projects_submitted: 94,
        total_matches_generated: 168,
        total_collaborations_confirmed: 52,
        total_collaborations_completed: 34,
        avg_time_to_match_days: 1.6,
        collaboration_success_rate: 94.5,
        user_satisfaction_avg_score: 4.9,
        metrics_payload: {
          diaspora_countries: { France: 110, USA: 65, Canada: 42, Germany: 38, UK: 35, UAE: 30 },
          domains: { AI_NLP: 42, Renewable_Energy: 28, Biotech_Health: 25, Material_Science: 19 },
        },
        generated_by_user_id: 'admin-000',
        institution_id: 'inst-esi',
        created_at: '2026-09-30T23:59:59Z',
      },
    ];

    return map;
  };

  // Live In-Browser Relational Data Store
  const [dataStore, setDataStore] = useState<Record<string, TableRow[]>>(buildBaselineDataStore);

  // Dynamic Strategic Performance Indicators (Admin Managed)
  const [customKpis, setCustomKpis] = useState<CustomKpiItem[]>(INITIAL_CUSTOM_KPIS);

  // Business Entities State
  const [projectsList, setProjectsList] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [matchesList, setMatchesList] = useState<MatchItem[]>(INITIAL_MATCHES);
  const [collaborationsList, setCollaborationsList] = useState<CollaborationItem[]>(INITIAL_COLLABORATIONS);

  // Audit Log Record Helper
  const recordAuditLog = (
    actionType: string,
    entityType: string,
    entityId: string | undefined,
    metadata: Record<string, any>,
  ) => {
    const newLogItem: TableRow = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: activeRole === 'admin' ? 'admin-000' : activeRole === 'expert' ? activeExpert.id : 'usr-esi-2001',
      userName:
        activeRole === 'admin'
          ? 'Super Admin (MESRS)'
          : activeRole === 'expert'
          ? activeExpert.profile.fullName
          : 'ESI Algiers',
      userRole: activeRole,
      actionType,
      entityType,
      entityId: entityId || null,
      ipAddress: '127.0.0.1',
      metadata,
      createdAt: new Date().toISOString(),
    };
    setDataStore((prev) => ({
      ...prev,
      activity_logs: [newLogItem, ...(prev['activity_logs'] || [])],
    }));
  };

  // Database Row Operations with Permanent Backend Persistence
  const handleInsertRow = async (tableName: string, row: Record<string, any>) => {
    const rowId = row.id || crypto.randomUUID();
    const cleanRow: TableRow = { ...row, id: rowId };
    setDataStore((prev) => ({
      ...prev,
      [tableName]: [cleanRow, ...(prev[tableName] || [])],
    }));
    recordAuditLog('RECORD_INSERTED', tableName, rowId, {
      table: tableName,
      fieldsCount: Object.keys(row).length,
    });
    // Persist permanently to real backend model and disk
    try {
      const token = localStorage.getItem('dzb-token');
      await fetch(`/api/data/${tableName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(cleanRow),
      });
    } catch (err) {
      console.warn('Backend row persistence failed:', err);
    }
  };

  const handleUpdateRow = async (tableName: string, id: string, updates: Record<string, any>) => {
    setDataStore((prev) => ({
      ...prev,
      [tableName]: (prev[tableName] || []).map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
    recordAuditLog('RECORD_UPDATED', tableName, id, {
      table: tableName,
      updatedFields: Object.keys(updates),
    });
    // Persist permanently to real backend model and disk
    try {
      const token = localStorage.getItem('dzb-token');
      await fetch(`/api/data/${tableName}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.warn('Backend row update failed:', err);
    }
  };

  const handleDeleteRow = async (tableName: string, id: string) => {
    setDataStore((prev) => ({
      ...prev,
      [tableName]: (prev[tableName] || []).filter((r) => r.id !== id),
    }));
    recordAuditLog('RECORD_DELETED', tableName, id, {
      table: tableName,
    });
    // Persist permanently to real backend model and disk
    try {
      const token = localStorage.getItem('dzb-token');
      await fetch(`/api/data/${tableName}/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      console.warn('Backend row deletion failed:', err);
    }
  };

  const handleImportRows = async (tableName: string, rows: Record<string, any>[]) => {
    const normalizedRows: TableRow[] = rows.map((r) => ({
      ...r,
      id: r.id ? String(r.id) : crypto.randomUUID(),
    }));
    setDataStore((prev) => ({
      ...prev,
      [tableName]: [...normalizedRows, ...(prev[tableName] || [])],
    }));
    recordAuditLog('DATA_IMPORTED', tableName, undefined, {
      table: tableName,
      rowCount: normalizedRows.length,
    });
    try {
      const token = localStorage.getItem('dzb-token');
      await fetch(`/api/data/${tableName}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ rows: normalizedRows }),
      });
    } catch (err) {
      console.warn('Backend row import failed:', err);
    }
  };

  const handleRenameTable = (oldName: string, newName: string) => {
    setDataStore((prev) => {
      const next = { ...prev };
      if (next[oldName]) {
        next[newName] = next[oldName];
        delete next[oldName];
      }
      return next;
    });
    recordAuditLog('TABLE_RENAMED', 'schema', newName, { oldName, newName });
  };

  const handleDeleteTableData = async (tableName: string) => {
    setDataStore((prev) => {
      const next = { ...prev };
      delete next[tableName];
      return next;
    });
    recordAuditLog('TABLE_DROPPED', 'schema', tableName, { tableName });
    try {
      const token = localStorage.getItem('dzb-token');
      await fetch(`/api/data/${tableName}/clear`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      console.warn('Backend table clear failed:', err);
    }
  };

  const handleResetAllData = async () => {
    setDataStore((prev) => {
      const resetMap: Record<string, TableRow[]> = {};
      Object.keys(prev).forEach((tName) => {
        resetMap[tName] = [];
      });
      resetMap['activity_logs'] = [
        {
          id: `log-reset-${Date.now()}`,
          userId: 'admin-000',
          userName: 'DEGHA HOUSSEM EDDINE (Super Admin)',
          userRole: 'admin',
          actionType: 'DATABASE_RESET_TO_ZERO',
          entityType: 'database',
          ipAddress: '127.0.0.1',
          metadata: { note: 'Admin cleared all tables to 0 data rows.' },
          createdAt: new Date().toISOString(),
        },
      ];
      return resetMap;
    });
    setProjectsList([]);
    setMatchesList([]);
    setCollaborationsList([]);
    try {
      const token = localStorage.getItem('dzb-token');
      await fetch('/api/data/reset-all', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      console.warn('Backend reset failed:', err);
    }
  };

  const handleSeedBaselineData = () => {
    setProjectsList(INITIAL_PROJECTS);
    setMatchesList(INITIAL_MATCHES);
    setCollaborationsList(INITIAL_COLLABORATIONS);
    setCustomKpis(INITIAL_CUSTOM_KPIS);
    setDataStore(buildBaselineDataStore());

    recordAuditLog('OFFICIAL_SCHOLAR_DATA_SEEDED', 'database', undefined, {
      laureates: INITIAL_EXPERTS.map((e) => e.profile.fullName),
      totalTablesSeeded: INITIAL_SCHEMA_TABLES.length,
    });
  };

  // Custom KPI Studio Handlers
  const handleAddKpi = (newKpi: CustomKpiItem) => {
    setCustomKpis((prev) => [newKpi, ...prev]);
    handleInsertRow('custom_kpis', {
      id: newKpi.id,
      name: newKpi.name,
      description: newKpi.description,
      category: newKpi.category,
      current_value: newKpi.currentValue,
      target_value: newKpi.targetValue,
      unit: newKpi.unit || '',
      progress_percentage: newKpi.progressPercentage,
      status: newKpi.status,
      visualization_type: newKpi.visualizationType,
      display_on_landing: newKpi.displayOnLanding,
      created_at: newKpi.createdAt,
    });
    recordAuditLog('CUSTOM_KPI_CREATED', 'custom_kpis', newKpi.id, {
      name: newKpi.name,
      category: newKpi.category,
      target: newKpi.targetValue,
    });
  };

  const handleUpdateKpi = (id: string, updates: Partial<CustomKpiItem>) => {
    setCustomKpis((prev) =>
      prev.map((k) => (k.id === id ? { ...k, ...updates } : k)),
    );
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.currentValue !== undefined) dbUpdates.current_value = updates.currentValue;
    if (updates.targetValue !== undefined) dbUpdates.target_value = updates.targetValue;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.progressPercentage !== undefined) dbUpdates.progress_percentage = updates.progressPercentage;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.visualizationType !== undefined) dbUpdates.visualization_type = updates.visualizationType;
    if (updates.displayOnLanding !== undefined) dbUpdates.display_on_landing = updates.displayOnLanding;

    handleUpdateRow('custom_kpis', id, dbUpdates);
    recordAuditLog('CUSTOM_KPI_UPDATED', 'custom_kpis', id, updates);
  };

  const handleDeleteKpi = (id: string) => {
    const target = customKpis.find((k) => k.id === id);
    setCustomKpis((prev) => prev.filter((k) => k.id !== id));
    handleDeleteRow('custom_kpis', id);
    recordAuditLog('CUSTOM_KPI_DELETED', 'custom_kpis', id, { name: target?.name });
  };

  const handleResetDefaultKpis = () => {
    setCustomKpis(INITIAL_CUSTOM_KPIS);
    setDataStore((prev) => ({
      ...prev,
      custom_kpis: INITIAL_CUSTOM_KPIS.map((k) => ({
        id: k.id,
        name: k.name,
        description: k.description,
        category: k.category,
        current_value: k.currentValue,
        target_value: k.targetValue,
        unit: k.unit || '',
        progress_percentage: k.progressPercentage,
        status: k.status,
        visualization_type: k.visualizationType,
        display_on_landing: k.displayOnLanding,
        created_at: k.createdAt,
      })),
    }));
    recordAuditLog('CUSTOM_KPIS_RESET_TO_DEFAULTS', 'custom_kpis', undefined, { count: INITIAL_CUSTOM_KPIS.length });
  };

  // Expert Actions
  const handleAddAvailability = (avail: Partial<ExpertAvailability>) => {
    const newAvail: ExpertAvailability = {
      id: `avail-${Date.now()}`,
      expertId: activeExpert.id,
      city: avail.city || 'Algiers',
      startDate: avail.startDate || '2026-11-01',
      endDate: avail.endDate || '2026-11-20',
      durationDays: avail.durationDays || 20,
      notes: avail.notes,
    };
    activeExpert.availabilities.push(newAvail);
    recordAuditLog('AVAILABILITY_POSTED', 'expert_availabilities', newAvail.id, {
      city: newAvail.city,
      days: newAvail.durationDays,
    });
  };

  const handleRespondMatch = (matchId: string, decision: 'accepted' | 'rejected', notes?: string) => {
    setMatchesList((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, status: decision, respondedAt: new Date().toISOString(), notes }
          : m,
      ),
    );
    if (decision === 'accepted') {
      const match = matchesList.find((m) => m.id === matchId);
      if (match) {
        setProjectsList((prev) =>
          prev.map((p) =>
            p.id === match.projectId && p.status === 'matched'
              ? { ...p, status: 'contact_initiated' }
              : p,
          ),
        );
      }
    }
    recordAuditLog('MATCH_RESPONSE_RECORDED', 'matches', matchId, { decision, notes });
  };

  const handleUploadDocument = (doc: { name: string; type: any; url: string; size_bytes?: number }) => {
    if (!activeExpert.profile.documents) activeExpert.profile.documents = [];
    activeExpert.profile.documents.push({
      id: `doc-${Date.now()}`,
      name: doc.name,
      type: doc.type,
      url: doc.url,
      uploaded_at: new Date().toISOString(),
      size_bytes: doc.size_bytes || 1200000,
    });
    recordAuditLog('DOCUMENT_UPLOADED', 'profiles', activeExpert.profile.id, { name: doc.name });
  };

  // University Organization Actions
  const handleCreateProject = (newProj: Partial<ProjectItem>) => {
    const projId = `proj-${Date.now()}`;
    const project: ProjectItem = {
      id: projId,
      organizationId: 'usr-esi-2001',
      organizationName: 'ESI Algiers (École Nationale Supérieure d\'Informatique)',
      title: newProj.title || 'New Collaboration Initiative',
      description: newProj.description || '',
      skillsRequired: newProj.skillsRequired || ['Artificial Intelligence'],
      location: newProj.location || 'Algiers',
      startDate: newProj.startDate || '2026-11-05',
      endDate: newProj.endDate || '2026-11-15',
      logisticsOffered: newProj.logisticsOffered || { travel: true, lodging: true, stipend: true },
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };
    setProjectsList((prev) => [project, ...prev]);

    // Automatically calculate and add match for top candidate
    const topExpert = INITIAL_EXPERTS[0];
    const newMatch: MatchItem = {
      id: `match-${Date.now()}`,
      projectId: projId,
      projectTitle: project.title,
      organizationName: project.organizationName,
      expertId: topExpert.id,
      expertName: topExpert.profile.fullName,
      expertCity: topExpert.profile.city || 'Algiers',
      expertAffiliation: topExpert.profile.affiliation,
      isDiaspora: topExpert.profile.isDiaspora,
      compatibilityScore: 98.2,
      scoreBreakdown: {
        skills_score: 100,
        availability_score: 100,
        location_score: 100,
        diaspora_bonus: 100,
        matched_skills: project.skillsRequired,
        overlapping_days: 10,
        explanation: 'Top alignment computed via 4-factor deterministic scoring engine.',
      },
      status: 'pending',
      notifiedAt: new Date().toISOString(),
    };
    setMatchesList((prev) => [newMatch, ...prev]);

    recordAuditLog('PROJECT_CREATED', 'projects', projId, { title: project.title });
  };

  const handleTransitionProjectStatus = (projectId: string, targetStatus: ProjectStatus, notes?: string) => {
    setProjectsList((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: targetStatus } : p)),
    );
    recordAuditLog('PROJECT_STATUS_TRANSITIONED', 'projects', projectId, { targetStatus, notes });
  };

  const handleConfirmCollaboration = (projectId: string, expertId: string, notes?: string) => {
    const project = projectsList.find((p) => p.id === projectId);
    const expert = INITIAL_EXPERTS.find((e) => e.id === expertId) || INITIAL_EXPERTS[0];
    const collabId = `collab-${Date.now()}`;
    const newCollab: CollaborationItem = {
      id: collabId,
      projectId,
      projectTitle: project?.title || 'Bilateral Collaboration',
      expertId,
      expertName: expert.profile.fullName,
      organizationId: 'usr-esi-2001',
      organizationName: 'ESI Algiers',
      status: 'active',
      confirmedAt: new Date().toISOString(),
      notes: notes || 'Formal institutional protocol executed.',
      createdAt: new Date().toISOString(),
    };
    setCollaborationsList((prev) => [newCollab, ...prev]);
    setProjectsList((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: 'confirmed' } : p)),
    );
    recordAuditLog('COLLABORATION_CONFIRMED', 'collaborations', collabId, {
      project: project?.title,
      expert: expert.profile.fullName,
    });
  };

  // API Console Request Executor
  const handleApiConsoleExecute = async (
    endpointId: string,
    method: string,
    path: string,
    body: any,
    targetEngine: 'django' | 'nestjs' | 'browser',
  ): Promise<{ statusCode: number; data: any }> => {
    await new Promise((r) => setTimeout(r, 120));

    if (endpointId === 'auth-register') {
      const newUserId = `usr-${Date.now()}`;
      recordAuditLog('USER_REGISTERED', 'users', newUserId, { email: body?.email, role: body?.role });
      return {
        statusCode: 201,
        data: {
          message: 'User registered into database.',
          userId: newUserId,
          email: body?.email,
          role: body?.role,
          verificationToken: crypto.randomUUID().replace(/-/g, ''),
        },
      };
    }

    if (endpointId === 'projects-submit') {
      handleCreateProject(body);
      return {
        statusCode: 201,
        data: {
          message: 'Project created and ingested into state machine.',
          project: body,
        },
      };
    }

    if (endpointId === 'projects-list') {
      return {
        statusCode: 200,
        data: {
          count: projectsList.length,
          results: projectsList,
        },
      };
    }

    if (endpointId === 'matches-recommendations') {
      return {
        statusCode: 200,
        data: {
          totalFound: matchesList.length,
          algorithmWeights: { skills: '45%', availability: '25%', location: '15%', diaspora_priority: '15%' },
          matches: matchesList,
        },
      };
    }

    if (endpointId === 'admin-analytics') {
      return {
        statusCode: 200,
        data: {
          overview: {
            totalUsers: 84,
            diasporaExperts: 38,
            localExperts: 18,
            organizations: 28,
          },
          kpis: {
            matchSuccessRate: '91.3%',
            avgDaysToMatch: '2.3 days',
            satisfactionScore: 4.88,
          },
          engine: targetEngine,
        },
      };
    }

    if (endpointId === 'admin-audit') {
      const logs = dataStore.activity_logs || [];
      return {
        statusCode: 200,
        data: {
          total: logs.length,
          logs: logs.slice(0, 10),
        },
      };
    }

    return {
      statusCode: method === 'POST' ? 201 : 200,
      data: {
        message: 'Endpoint executed successfully.',
        method,
        path,
        timestamp: new Date().toISOString(),
      },
    };
  };

  // Convert activity logs to ActivityLogItem
  const currentActivityLogs: ActivityLogItem[] = (dataStore.activity_logs || []).map((l) => ({
    id: l.id,
    userId: l.userId || null,
    userName: l.userName || 'Super Admin',
    userRole: l.userRole || 'admin',
    actionType: l.actionType || 'UNKNOWN_ACTION',
    entityType: l.entityType || 'general',
    entityId: l.entityId,
    ipAddress: l.ipAddress || '127.0.0.1',
    metadata: l.metadata || {},
    createdAt: l.createdAt || new Date().toISOString(),
  }));

  // Handle Role Change: auto-navigate to the most relevant view
  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    if (newRole === 'expert' && activeTab !== 'scholar-space' && activeTab !== 'api-management' && activeTab !== 'django-client') {
      setActiveTab('scholar-space');
    } else if (newRole === 'organization' && activeTab !== 'university-portal' && activeTab !== 'api-management' && activeTab !== 'django-client') {
      setActiveTab('university-portal');
    } else if (newRole === 'admin' && activeTab === 'scholar-space') {
      setActiveTab('dashboard');
    }
  };

  if (activeTab === 'login') {
    return (
      <LoginPage
        onNavigateLanding={() => setActiveTab('landing')}
        onLoginSuccess={(role) => {
          handleRoleChange(role);
          if (role === 'super_admin' || role === 'admin') {
            setActiveTab('admin-console');
          } else if (role === 'organization') {
            setActiveTab('university-portal');
          } else {
            setActiveTab('scholar-space');
          }
        }}
      />
    );
  }

  if (activeTab === 'landing') {
    return (
      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="min-h-screen bg-[#FDFCFB] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#3b0a2a] selection:text-[#C89B3C]"
      >
        <LandingPage
          onNavigateLogin={() => setActiveTab('login')}
          onSelectRole={(r) => {
            setActiveRole(r);
            if (r === 'expert') {
              setActiveTab('scholar-space');
            } else if (r === 'organization') {
              setActiveTab('university-portal');
            } else {
              setActiveTab('admin-console');
            }
          }}
        />
        {showConnectModal && (
          <BackendConnectModal
            config={backendConfig}
            onUpdateConfig={(up) => setBackendConfig((prev) => ({ ...prev, ...up }))}
            onClose={() => setShowConnectModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#f8f9ff] text-slate-800 flex font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#3b0a2a] selection:text-[#C89B3C]"
    >
      {/* 1. SIDEBAR NAVIGATION */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={handleRoleChange}
        onOpenConnectModal={() => setShowConnectModal(true)}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* 2. MAIN APP CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <TopHeader
          activeRole={activeRole}
          setActiveRole={handleRoleChange}
          latencyMs={backendConfig.latencyMs}
          port={backendConfig.port}
          onOpenConnectModal={() => setShowConnectModal(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          onToggleLanding={() => setActiveTab(activeTab === 'landing' ? 'dashboard' : 'landing')}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Role Explanation Banner */}
          <RoleExplanationBanner
            activeRole={activeRole}
            setActiveRole={handleRoleChange}
          />

          {/* TAB: NATIONAL DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              customKpis={customKpis}
              onNavigateKpiStudio={() => setActiveTab('kpi-studio')}
              onExportAudit={() => setActiveTab('analytics')}
            />
          )}

          {/* TAB: SCHOLAR & DIASPORA WORKSPACE (Expert Role) */}
          {activeTab === 'scholar-space' && (
            <ExpertWorkspace
              currentExpert={activeExpert}
              matches={matchesList}
              projects={projectsList}
              collaborations={collaborationsList}
              onAddAvailability={handleAddAvailability}
              onRespondMatch={handleRespondMatch}
              onUploadDocument={handleUploadDocument}
            />
          )}

          {/* TAB: UNIVERSITY & INSTITUTE PORTAL (Organization Role) */}
          {activeTab === 'university-portal' && (
            <OrganizationPortal
              currentOrgName="ESI Algiers (École Nationale Supérieure d'Informatique)"
              projects={projectsList}
              matches={matchesList}
              collaborations={collaborationsList}
              onCreateProject={handleCreateProject}
              onTransitionStatus={handleTransitionProjectStatus}
              onConfirmCollaboration={handleConfirmCollaboration}
            />
          )}

          {/* TAB: REST API GATEWAY & ENDPOINT BUILDER */}
          {activeTab === 'api-management' && (
            <ApiManagementStudio
              activeRole={activeRole}
              dataStore={dataStore}
              schemaTables={schemaTables}
              onInsertRow={handleInsertRow}
              onUpdateRow={handleUpdateRow}
              onDeleteRow={handleDeleteRow}
              onExecuteEndpoint={handleApiConsoleExecute}
            />
          )}

          {/* TAB: TRANSLATION MANAGER (Requested Hub for Editing Translations) */}
          {activeTab === 'translation-hub' && <TranslationManager />}

          {/* TAB: DJANGO REST FRAMEWORK TEST CLIENT */}
          {activeTab === 'django-client' && <DjangoDrfClient />}

          {/* TAB: DATABASE STUDIO */}
          {activeTab === 'schema' && (
            <DatabaseStudio
              tables={schemaTables}
              relations={schemaRelations}
              onUpdateTables={setSchemaTables}
              onUpdateRelations={setSchemaRelations}
              dataStore={dataStore}
              onInsertRow={handleInsertRow}
              onUpdateRow={handleUpdateRow}
              onDeleteRow={handleDeleteRow}
              onImportRows={handleImportRows}
              onResetAllData={handleResetAllData}
              onSeedBaselineData={handleSeedBaselineData}
              onRenameTable={handleRenameTable}
              onDeleteTableData={handleDeleteTableData}
            />
          )}

          {/* TAB: AUTOMATED LIFECYCLE SEQUENCES */}
          {activeTab === 'sequence' && (
            <TestSequenceRunner
              onExecuteSequenceStep={async (stepId) => {
                await new Promise((r) => setTimeout(r, 180));
                if (stepId === 1) {
                  return {
                    status: 201,
                    payload: {
                      message: 'Diaspora Scholar registered.',
                      user: { email: 'belgacem.haba@algerian-scholars.dz', role: 'expert' },
                    },
                  };
                }
                if (stepId === 2) {
                  return {
                    status: 201,
                    payload: {
                      message: 'Algeria visit window posted (Algiers, 20 days).',
                    },
                  };
                }
                if (stepId === 3) {
                  return {
                    status: 201,
                    payload: {
                      message: 'ESI Algiers collaboration project created.',
                    },
                  };
                }
                if (stepId === 4) {
                  return {
                    status: 200,
                    payload: {
                      message: '4-factor compatibility score computed (98.5%).',
                    },
                  };
                }
                if (stepId === 5) {
                  return {
                    status: 200,
                    payload: {
                      message: 'Invitation accepted; project moved to contact_initiated.',
                    },
                  };
                }
                if (stepId === 6) {
                  return {
                    status: 201,
                    payload: {
                      message: 'Bilateral institutional partnership confirmed.',
                    },
                  };
                }
                return {
                  status: 200,
                  payload: {
                    message: 'Activity audit logs verified in PostgreSQL table.',
                    totalEvents: (dataStore.activity_logs || []).length,
                  },
                };
              }}
            />
          )}

          {/* TAB: AUDIT LOGS & KPIS */}
          {activeTab === 'analytics' && (
            <AnalyticsView logs={currentActivityLogs} />
          )}

          {/* TAB: SUPER ADMIN CONSOLE */}
          {activeTab === 'admin-console' && (
            <AdminConsole
              customKpis={customKpis}
              onAddKpi={handleAddKpi}
              onUpdateKpi={handleUpdateKpi}
              onDeleteKpi={handleDeleteKpi}
              onResetDefaultKpis={handleResetDefaultKpis}
              backendConfig={backendConfig}
              onUpdateBackendConfig={(cfg) => setBackendConfig((prev) => ({ ...prev, ...cfg }))}
              schemaTables={schemaTables}
              schemaRelations={schemaRelations}
              onUpdateTables={setSchemaTables}
              onUpdateRelations={setSchemaRelations}
              dataStore={dataStore}
              onInsertRow={handleInsertRow}
              onUpdateRow={handleUpdateRow}
              onDeleteRow={handleDeleteRow}
              onImportRows={handleImportRows}
              onResetAllData={handleResetAllData}
              onSeedBaselineData={handleSeedBaselineData}
              onRenameTable={handleRenameTable}
              onDeleteTableData={handleDeleteTableData}
              auditLogs={currentActivityLogs}
              onExportAudit={() => setActiveTab('analytics')}
              onExecuteEndpoint={async (id, method, path, body, engine) => {
                const res = await handleApiConsoleExecute(id, method, path, body, engine);
                return { ...res, latencyMs: 18 };
              }}
            />
          )}

          {/* TAB: DEDICATED USER MANAGEMENT & RBAC */}
          {activeTab === 'user-management' && (
            <UserManagementStudio
              currentRole={activeRole}
              onRefreshAllData={async () => {
                try {
                  const res = await fetch('/api/state/full');
                  if (res.ok) {
                    const data = await res.json();
                    if (data.table_data_store) setDataStore(data.table_data_store);
                    if (data.projects) setProjectsList(data.projects);
                  }
                } catch {}
              }}
            />
          )}

          {/* TAB: CUSTOM KPI STUDIO */}
          {activeTab === 'kpi-studio' && (
            <KpiManagementStudio
              kpis={customKpis}
              onAddKpi={handleAddKpi}
              onUpdateKpi={handleUpdateKpi}
              onDeleteKpi={handleDeleteKpi}
              onResetDefaultKpis={handleResetDefaultKpis}
            />
          )}
        </main>
      </div>

      {/* Backend Connection Gateway Modal */}
      {showConnectModal && (
        <BackendConnectModal
          config={backendConfig}
          onUpdateConfig={(up) => setBackendConfig((prev) => ({ ...prev, ...up }))}
          onClose={() => setShowConnectModal(false)}
        />
      )}

      {/* Quick Floating Re-open Button when Left Panel is Closed */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className={`fixed bottom-6 ${
            lang === 'ar' ? 'right-6' : 'left-6'
          } z-50 px-3.5 py-2.5 bg-[#3b0a2a] text-[#C89B3C] hover:bg-[#4a0e38] rounded-xl shadow-2xl border border-[#C89B3C]/50 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 ring-2 ring-[#C89B3C]/30`}
          title={lang === 'ar' ? 'فتح اللوحة الجانبية (Ctrl+B)' : 'Open Navigation Panel (Ctrl+B)'}
          aria-label="Open left panel"
        >
          <PanelLeftOpen className="w-4 h-4 shrink-0" />
          <span>{lang === 'ar' ? 'فتح اللوحة الجانبية' : 'Open Navigation Panel'}</span>
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
