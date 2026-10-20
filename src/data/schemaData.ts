import { SchemaTableDef, SchemaRelation } from '../types';

export const INITIAL_SCHEMA_TABLES: SchemaTableDef[] = [
  // 1. Identity & Profiles
  {
    id: 'tbl-users',
    name: 'users',
    description: 'System authentication credentials, roles, and status for experts, academic institutions, and MESRS admins',
    category: 'Identity',
    columns: [
      { id: 'u-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'u-2', name: 'email', type: 'VARCHAR(255)', isNullable: false, description: 'Unique login email' },
      { id: 'u-3', name: 'password_hash', type: 'VARCHAR(255)', isNullable: false, description: 'bcrypt with salt rounds: 12' },
      { id: 'u-4', name: 'role', type: 'user_role ENUM', isNullable: false, description: 'expert | organization | admin' },
      { id: 'u-5', name: 'status', type: 'user_status ENUM', defaultValue: "'pending_verification'", description: 'pending_verification | active | suspended | deactivated' },
      { id: 'u-6', name: 'email_verification_token', type: 'VARCHAR(255)', isNullable: true, description: 'Crypto hash for activation' },
      { id: 'u-7', name: 'email_verified_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: true },
      { id: 'u-8', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
      { id: 'u-9', name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-profiles',
    name: 'profiles',
    description: 'Polymorphic profile details, multi-select expertise tags, profile completeness %, and collaboration preferences',
    category: 'Identity',
    columns: [
      { id: 'pr-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4()' },
      { id: 'pr-2', name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', description: 'FK -> users(id) ON DELETE CASCADE' },
      { id: 'pr-3', name: 'full_name', type: 'VARCHAR(255)', isNullable: false },
      { id: 'pr-4', name: 'organization_name', type: 'VARCHAR(255)', isNullable: true },
      { id: 'pr-5', name: 'organization_type', type: 'VARCHAR(100)', isNullable: true, description: 'public_university | startup | research_institute | company | association' },
      { id: 'pr-6', name: 'bio', type: 'TEXT', isNullable: true },
      { id: 'pr-7', name: 'phone_number', type: 'VARCHAR(50)', isNullable: true },
      { id: 'pr-8', name: 'country', type: 'VARCHAR(100)', defaultValue: "'Algeria'" },
      { id: 'pr-9', name: 'city', type: 'VARCHAR(100)', isNullable: true },
      { id: 'pr-10', name: 'is_diaspora', type: 'BOOLEAN', defaultValue: 'FALSE', description: 'True for diaspora researchers' },
      { id: 'pr-11', name: 'expertise_tags', type: 'TEXT[]', defaultValue: "'{}'", description: 'GIN indexed for rapid algorithmic matching' },
      { id: 'pr-12', name: 'collaboration_preferences', type: 'JSONB', defaultValue: "'{\"remote_ok\": true, \"in_person_ok\": true}'::jsonb" },
      { id: 'pr-13', name: 'profile_completeness_percentage', type: 'INT', defaultValue: '85', description: 'Onboarding wizard completeness tracking' },
      { id: 'pr-14', name: 'is_verified', type: 'BOOLEAN', defaultValue: 'FALSE', description: 'MESRS official identity credential verification' },
      { id: 'pr-15', name: 'documents', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'CV, patents, publications, certificates URLs' },
      { id: 'pr-16', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-experts',
    name: 'experts',
    description: 'Dedicated registry of verified scientific experts and diaspora laureates with h-index, academic titles, research domains, citations, and credentials',
    category: 'Identity',
    columns: [
      { id: 'exp-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'exp-2', name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', description: 'FK -> users(id) ON DELETE CASCADE (1:1 with scholar account)' },
      { id: 'exp-3', name: 'full_name', type: 'VARCHAR(255)', isNullable: false, description: 'Official Scholar Full Legal Name' },
      { id: 'exp-4', name: 'academic_title', type: 'VARCHAR(100)', isNullable: false, description: 'Professor, Research Director, Associate Professor, Fellow' },
      { id: 'exp-5', name: 'highest_degree', type: 'VARCHAR(100)', isNullable: false, description: 'PhD, Doctor of Science, HDR' },
      { id: 'exp-6', name: 'current_affiliation', type: 'VARCHAR(255)', isNullable: false, description: 'Current university, research institute, or corporate laboratory' },
      { id: 'exp-7', name: 'country', type: 'VARCHAR(100)', defaultValue: "'France'", description: 'Current country of scientific practice' },
      { id: 'exp-8', name: 'city', type: 'VARCHAR(100)', isNullable: true },
      { id: 'exp-9', name: 'is_diaspora', type: 'BOOLEAN', defaultValue: 'TRUE', description: 'True for diaspora scholars residing abroad' },
      { id: 'exp-10', name: 'primary_domain', type: 'VARCHAR(150)', isNullable: false, description: 'Primary research specialization domain' },
      { id: 'exp-11', name: 'skills', type: 'TEXT[]', defaultValue: "'{}'", description: 'GIN indexed keywords for algorithmic matching' },
      { id: 'exp-12', name: 'h_index', type: 'INT', defaultValue: '18', description: 'Scopus / Google Scholar scientific citation h-index' },
      { id: 'exp-13', name: 'citations_count', type: 'INT', defaultValue: '1200' },
      { id: 'exp-14', name: 'publications_count', type: 'INT', defaultValue: '30' },
      { id: 'exp-15', name: 'bio', type: 'TEXT', isNullable: true },
      { id: 'exp-16', name: 'google_scholar_url', type: 'VARCHAR(255)', isNullable: true },
      { id: 'exp-17', name: 'orcid_id', type: 'VARCHAR(50)', isNullable: true },
      { id: 'exp-18', name: 'verification_status', type: 'VARCHAR(50)', defaultValue: "'verified'", description: 'verified | pending | rejected' },
      { id: 'exp-19', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },

  // 2. Institutions Hierarchy (Unified General Institution Model)
  {
    id: 'tbl-institutions',
    name: 'institutions',
    description: 'Unified general registry of partner institutions (Universities, National Higher Schools, Research Centers EPST, Enterprises, and Public Directorates)',
    category: 'Academic',
    columns: [
      { id: 'inst-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'inst-2', name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', description: 'FK -> users(id) Institutional Admin Login' },
      { id: 'inst-3', name: 'code', type: 'VARCHAR(50)', isNullable: false, description: 'Official Accreditation Code (e.g. ESI-ALGIERS, USTHB-ALGIERS)' },
      { id: 'inst-4', name: 'name', type: 'VARCHAR(255)', isNullable: false, description: 'Full Official Institution Legal Designation' },
      { id: 'inst-5', name: 'acronym', type: 'VARCHAR(50)', isNullable: false },
      { id: 'inst-6', name: 'institution_type', type: 'VARCHAR(80)', defaultValue: "'university'", description: 'university | national_school | research_center | enterprise | startup | ministry | association' },
      { id: 'inst-7', name: 'sector', type: 'VARCHAR(80)', defaultValue: "'public'", description: 'public | private | mixed' },
      { id: 'inst-8', name: 'wilaya', type: 'VARCHAR(100)', isNullable: false, description: 'Algerian Province (e.g. Algiers, Oran, Constantine, Boumerdes)' },
      { id: 'inst-9', name: 'country', type: 'VARCHAR(100)', defaultValue: "'Algeria'" },
      { id: 'inst-10', name: 'rector_or_director', type: 'VARCHAR(255)', isNullable: true },
      { id: 'inst-11', name: 'contact_email', type: 'VARCHAR(255)', isNullable: false },
      { id: 'inst-12', name: 'website', type: 'VARCHAR(255)', isNullable: true },
      { id: 'inst-13', name: 'total_doctoral_students', type: 'INT', defaultValue: '0' },
      { id: 'inst-14', name: 'is_verified', type: 'BOOLEAN', defaultValue: 'TRUE' },
      { id: 'inst-15', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-research-laboratories',
    name: 'research_laboratories',
    description: 'Accredited university research laboratories and doctoral school research units hosting diaspora missions',
    category: 'Academic',
    columns: [
      { id: 'rl-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'rl-2', name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', foreignColumn: 'id', description: 'FK -> institutions(id)' },
      { id: 'rl-3', name: 'director_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', isNullable: true, description: 'FK -> users(id) Lab Director' },
      { id: 'rl-4', name: 'code', type: 'VARCHAR(50)', isNullable: false, description: 'Laboratory MESRS Accreditation Code' },
      { id: 'rl-5', name: 'name', type: 'VARCHAR(255)', isNullable: false },
      { id: 'rl-6', name: 'acronym', type: 'VARCHAR(50)', isNullable: false },
      { id: 'rl-7', name: 'scientific_domain', type: 'VARCHAR(150)', isNullable: false },
      { id: 'rl-8', name: 'doctoral_school_name', type: 'VARCHAR(255)', isNullable: true },
      { id: 'rl-9', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },

  // 3. Expert Availability
  {
    id: 'tbl-expert-availabilities',
    name: 'expert_availabilities',
    description: 'Physical Algeria visit availability windows for diaspora and traveling scholars',
    category: 'Matchmaking',
    columns: [
      { id: 'ea-1', name: 'id', type: 'UUID', isPrimary: true },
      { id: 'ea-2', name: 'expert_id', type: 'UUID', isForeign: true, foreignTable: 'experts', foreignColumn: 'id', description: 'FK -> experts(id)' },
      { id: 'ea-3', name: 'city', type: 'VARCHAR(100)', isNullable: false, description: 'Algiers, Oran, Constantine, etc.' },
      { id: 'ea-4', name: 'start_date', type: 'DATE', isNullable: false },
      { id: 'ea-5', name: 'end_date', type: 'DATE', isNullable: false },
      { id: 'ea-6', name: 'duration_days', type: 'INT', description: 'Calculated stay duration in days' },
      { id: 'ea-7', name: 'notes', type: 'TEXT', isNullable: true },
      { id: 'ea-8', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },

  // 4. Algorithmic Matchmaking Engine
  {
    id: 'tbl-matching-algorithms',
    name: 'matching_algorithms',
    description: 'Deterministic 4-factor matchmaking models, weighting matrices, and compatibility thresholds',
    category: 'Matchmaking',
    columns: [
      { id: 'ma-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'ma-2', name: 'name', type: 'VARCHAR(150)', isNullable: false, description: 'Algorithmic Model Designation' },
      { id: 'ma-3', name: 'version', type: 'VARCHAR(50)', defaultValue: "'v2.6-prod'" },
      { id: 'ma-4', name: 'description', type: 'TEXT', isNullable: true },
      { id: 'ma-5', name: 'skills_weight', type: 'DECIMAL(5,2)', defaultValue: '45.00', description: 'Skills GIN overlap weight %' },
      { id: 'ma-6', name: 'availability_weight', type: 'DECIMAL(5,2)', defaultValue: '25.00', description: 'Physical Algeria visit overlap weight %' },
      { id: 'ma-7', name: 'location_weight', type: 'DECIMAL(5,2)', defaultValue: '15.00', description: 'University campus city affinity %' },
      { id: 'ma-8', name: 'diaspora_bonus_weight', type: 'DECIMAL(5,2)', defaultValue: '15.00', description: 'Diaspora scholar priority weight %' },
      { id: 'ma-9', name: 'min_compatibility_threshold', type: 'DECIMAL(5,2)', defaultValue: '65.00', description: 'Minimum score to trigger notification' },
      { id: 'ma-10', name: 'is_active', type: 'BOOLEAN', defaultValue: 'TRUE' },
      { id: 'ma-11', name: 'created_by_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', isNullable: true, description: 'FK -> users(id)' },
      { id: 'ma-12', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-matching-criteria-weights',
    name: 'matching_criteria_weights',
    description: 'Granular mathematical parameters and sub-factor weights configuring the deterministic matching algorithm',
    category: 'Matchmaking',
    columns: [
      { id: 'mcw-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'mcw-2', name: 'algorithm_id', type: 'UUID', isForeign: true, foreignTable: 'matching_algorithms', foreignColumn: 'id', description: 'FK -> matching_algorithms(id)' },
      { id: 'mcw-3', name: 'criterion_code', type: 'VARCHAR(50)', isNullable: false, description: 'SKILLS_OVERLAP | AVAIL_WINDOW | CITY_AFFINITY | DIASPORA_BOOST' },
      { id: 'mcw-4', name: 'criterion_name', type: 'VARCHAR(150)', isNullable: false },
      { id: 'mcw-5', name: 'weight_percentage', type: 'DECIMAL(5,2)', isNullable: false },
      { id: 'mcw-6', name: 'is_mandatory', type: 'BOOLEAN', defaultValue: 'FALSE' },
      { id: 'mcw-7', name: 'minimum_score_required', type: 'DECIMAL(5,2)', defaultValue: '0.00' },
      { id: 'mcw-8', name: 'notes', type: 'TEXT', isNullable: true },
    ],
  },
  {
    id: 'tbl-matching-runs',
    name: 'matching_runs',
    description: 'Execution batches and automated algorithm runs scanning projects against expert profiles',
    category: 'Matchmaking',
    columns: [
      { id: 'mr-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'mr-2', name: 'algorithm_id', type: 'UUID', isForeign: true, foreignTable: 'matching_algorithms', foreignColumn: 'id', description: 'FK -> matching_algorithms(id)' },
      { id: 'mr-3', name: 'project_id', type: 'UUID', isForeign: true, foreignTable: 'projects', foreignColumn: 'id', isNullable: true, description: 'FK -> projects(id) (null for batch nationwide run)' },
      { id: 'mr-4', name: 'initiated_by_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', description: 'FK -> users(id) MESRS Operator' },
      { id: 'mr-5', name: 'candidates_evaluated', type: 'INT', defaultValue: '0' },
      { id: 'mr-6', name: 'matches_generated', type: 'INT', defaultValue: '0' },
      { id: 'mr-7', name: 'avg_compatibility_score', type: 'DECIMAL(5,2)', defaultValue: '0.00' },
      { id: 'mr-8', name: 'execution_time_ms', type: 'INT', defaultValue: '120' },
      { id: 'mr-9', name: 'status', type: 'VARCHAR(50)', defaultValue: "'completed'", description: 'completed | running | failed' },
      { id: 'mr-10', name: 'ran_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },

  // 5. Projects & Matches
  {
    id: 'tbl-projects',
    name: 'projects',
    description: 'Collaboration initiatives and doctoral school projects submitted by Algerian universities (Strict 10-phase lifecycle)',
    category: 'Matchmaking',
    columns: [
      { id: 'pj-1', name: 'id', type: 'UUID', isPrimary: true },
      { id: 'pj-2', name: 'organization_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', description: 'FK -> users(id)' },
      { id: 'pj-3', name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', foreignColumn: 'id', isNullable: true, description: 'FK -> institutions(id)' },
      { id: 'pj-4', name: 'laboratory_id', type: 'UUID', isForeign: true, foreignTable: 'research_laboratories', foreignColumn: 'id', isNullable: true, description: 'FK -> research_laboratories(id)' },
      { id: 'pj-5', name: 'title', type: 'VARCHAR(255)', isNullable: false },
      { id: 'pj-6', name: 'description', type: 'TEXT', isNullable: false },
      { id: 'pj-7', name: 'skills_required', type: 'TEXT[]', defaultValue: "'{}'", description: 'GIN indexed for skills alignment' },
      { id: 'pj-8', name: 'location', type: 'VARCHAR(100)', isNullable: false },
      { id: 'pj-9', name: 'start_date', type: 'DATE', isNullable: true },
      { id: 'pj-10', name: 'end_date', type: 'DATE', isNullable: true },
      { id: 'pj-11', name: 'logistics_offered', type: 'JSONB', defaultValue: "'{\"travel\": false, \"lodging\": false}'::jsonb" },
      { id: 'pj-12', name: 'budget_details', type: 'JSONB', defaultValue: "'{}'::jsonb" },
      { id: 'pj-13', name: 'status', type: 'project_status ENUM', defaultValue: "'draft'", description: 'draft | submitted | under_review | matched | contact_initiated | confirmed | in_progress | completed | cancelled | unsuccessful' },
      { id: 'pj-14', name: 'success_level', type: 'VARCHAR(80)', isNullable: true, description: 'matched_only | confirmed | executed | highly_successful' },
      { id: 'pj-15', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-matches',
    name: 'matches',
    description: 'Multi-factor compatibility pairings generated between university projects and diaspora fellows',
    category: 'Matchmaking',
    columns: [
      { id: 'm-1', name: 'id', type: 'UUID', isPrimary: true },
      { id: 'm-2', name: 'project_id', type: 'UUID', isForeign: true, foreignTable: 'projects', foreignColumn: 'id' },
      { id: 'm-3', name: 'expert_id', type: 'UUID', isForeign: true, foreignTable: 'experts', foreignColumn: 'id', description: 'FK -> experts(id) Matched Fellow' },
      { id: 'm-4', name: 'algorithm_id', type: 'UUID', isForeign: true, foreignTable: 'matching_algorithms', foreignColumn: 'id', isNullable: true, description: 'FK -> matching_algorithms(id)' },
      { id: 'm-5', name: 'matching_run_id', type: 'UUID', isForeign: true, foreignTable: 'matching_runs', foreignColumn: 'id', isNullable: true, description: 'FK -> matching_runs(id)' },
      { id: 'm-6', name: 'compatibility_score', type: 'DECIMAL(5,2)', isNullable: false, description: 'Percentage 0.00% to 100.00%' },
      { id: 'm-7', name: 'score_breakdown', type: 'JSONB', defaultValue: "'{}'::jsonb", description: 'Detailed sub-scores & matched tags' },
      { id: 'm-8', name: 'status', type: 'match_status ENUM', defaultValue: "'pending'", description: 'pending | accepted | rejected | expired' },
      { id: 'm-9', name: 'notified_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
      { id: 'm-10', name: 'responded_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: true },
      { id: 'm-11', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-match-evaluations',
    name: 'match_evaluations',
    description: 'Scientific precision audits, academic committee evaluations, and ranking quality metrics (Precision@K, NDCG)',
    category: 'Matchmaking',
    columns: [
      { id: 'me-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'me-2', name: 'match_id', type: 'UUID', isForeign: true, foreignTable: 'matches', foreignColumn: 'id', isNullable: false, description: 'FK -> matches(id)' },
      { id: 'me-3', name: 'algorithm_id', type: 'UUID', isForeign: true, foreignTable: 'matching_algorithms', foreignColumn: 'id', isNullable: false, description: 'FK -> matching_algorithms(id)' },
      { id: 'me-4', name: 'matching_run_id', type: 'UUID', isForeign: true, foreignTable: 'matching_runs', foreignColumn: 'id', isNullable: true, description: 'FK -> matching_runs(id)' },
      { id: 'me-5', name: 'evaluator_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', isNullable: true, description: 'FK -> users(id) MESRS Scientific Committee' },
      { id: 'me-6', name: 'skills_alignment_score', type: 'DECIMAL(5,2)', isNullable: false },
      { id: 'me-7', name: 'availability_sync_score', type: 'DECIMAL(5,2)', isNullable: false },
      { id: 'me-8', name: 'location_affinity_score', type: 'DECIMAL(5,2)', isNullable: false },
      { id: 'me-9', name: 'diaspora_priority_score', type: 'DECIMAL(5,2)', isNullable: false },
      { id: 'me-10', name: 'composite_score', type: 'DECIMAL(5,2)', isNullable: false },
      { id: 'me-11', name: 'precision_metric', type: 'DECIMAL(5,2)', defaultValue: '97.50', description: 'Precision@K benchmark %' },
      { id: 'me-12', name: 'recall_metric', type: 'DECIMAL(5,2)', defaultValue: '94.20', description: 'Recall@K benchmark %' },
      { id: 'me-13', name: 'f1_score', type: 'DECIMAL(5,2)', defaultValue: '95.80', description: 'Harmonic mean of precision and recall' },
      { id: 'me-14', name: 'committee_verification_notes', type: 'TEXT', isNullable: true },
      { id: 'me-15', name: 'is_verified_by_committee', type: 'BOOLEAN', defaultValue: 'TRUE' },
      { id: 'me-16', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },

  // 6. Direct Communications & Secure Messaging (Explicit in Specs)
  {
    id: 'tbl-conversations',
    name: 'conversations',
    description: 'Secure communication channel established between an expert and organization following mutual match acceptance',
    category: 'Communications',
    columns: [
      { id: 'conv-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'conv-2', name: 'project_id', type: 'UUID', isForeign: true, foreignTable: 'projects', foreignColumn: 'id', description: 'FK -> projects(id)' },
      { id: 'conv-3', name: 'expert_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', description: 'FK -> users(id) Expert' },
      { id: 'conv-4', name: 'organization_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', description: 'FK -> users(id) Organization' },
      { id: 'conv-5', name: 'match_id', type: 'UUID', isForeign: true, foreignTable: 'matches', foreignColumn: 'id', isNullable: true, description: 'FK -> matches(id)' },
      { id: 'conv-6', name: 'status', type: 'VARCHAR(50)', defaultValue: "'active'", description: 'requested | active | archived' },
      { id: 'conv-7', name: 'preferred_contact_slot', type: 'VARCHAR(150)', isNullable: true, description: 'Agreed contact time window' },
      { id: 'conv-8', name: 'last_message_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
      { id: 'conv-9', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-messages',
    name: 'messages',
    description: 'Encrypted communication messages exchanged between matched parties for mission scheduling and terms coordination',
    category: 'Communications',
    columns: [
      { id: 'msg-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'msg-2', name: 'conversation_id', type: 'UUID', isForeign: true, foreignTable: 'conversations', foreignColumn: 'id', description: 'FK -> conversations(id) ON DELETE CASCADE' },
      { id: 'msg-3', name: 'sender_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', description: 'FK -> users(id) Sender' },
      { id: 'msg-4', name: 'recipient_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', description: 'FK -> users(id) Recipient' },
      { id: 'msg-5', name: 'body', type: 'TEXT', isNullable: false },
      { id: 'msg-6', name: 'attachments', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Shared syllabus, slides, and agreement documents' },
      { id: 'msg-7', name: 'is_read', type: 'BOOLEAN', defaultValue: 'FALSE' },
      { id: 'msg-8', name: 'sent_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },

  // 7. Collaborations, Milestones & Event Promotion (Explicit in Specs)
  {
    id: 'tbl-collaborations',
    name: 'collaborations',
    description: 'Official confirmed bilateral partnerships between Algerian universities and diaspora scholars',
    category: 'Collaborations',
    columns: [
      { id: 'c-1', name: 'id', type: 'UUID', isPrimary: true },
      { id: 'c-2', name: 'project_id', type: 'UUID', isForeign: true, foreignTable: 'projects', foreignColumn: 'id' },
      { id: 'c-3', name: 'expert_id', type: 'UUID', isForeign: true, foreignTable: 'experts', foreignColumn: 'id', description: 'FK -> experts(id) Assigned Scholar' },
      { id: 'c-4', name: 'organization_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id' },
      { id: 'c-5', name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', foreignColumn: 'id', isNullable: true, description: 'FK -> institutions(id)' },
      { id: 'c-6', name: 'status', type: 'collaboration_status ENUM', defaultValue: "'pending'", description: 'pending | active | completed | cancelled' },
      { id: 'c-7', name: 'completion_flag', type: 'BOOLEAN', defaultValue: 'FALSE', description: 'Confirmed execution by both parties' },
      { id: 'c-8', name: 'confirmed_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: true },
      { id: 'c-9', name: 'completed_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: true },
      { id: 'c-10', name: 'notes', type: 'TEXT', isNullable: true },
      { id: 'c-11', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-collaboration-milestones',
    name: 'collaboration_milestones',
    description: 'Structured deliverables, doctoral seminars, and on-site mission phases in Algeria',
    category: 'Collaborations',
    columns: [
      { id: 'cm-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'cm-2', name: 'collaboration_id', type: 'UUID', isForeign: true, foreignTable: 'collaborations', foreignColumn: 'id', description: 'FK -> collaborations(id)' },
      { id: 'cm-3', name: 'assigned_expert_id', type: 'UUID', isForeign: true, foreignTable: 'experts', foreignColumn: 'id', description: 'FK -> experts(id) Assigned Scholar' },
      { id: 'cm-4', name: 'title', type: 'VARCHAR(255)', isNullable: false },
      { id: 'cm-5', name: 'phase_number', type: 'INT', defaultValue: '1' },
      { id: 'cm-6', name: 'target_completion_date', type: 'DATE', isNullable: false },
      { id: 'cm-7', name: 'completed_at', type: 'TIMESTAMP WITH TIME ZONE', isNullable: true },
      { id: 'cm-8', name: 'status', type: 'VARCHAR(50)', defaultValue: "'pending'", description: 'pending | in_progress | completed | delayed' },
      { id: 'cm-9', name: 'deliverable_description', type: 'TEXT', isNullable: true },
      { id: 'cm-10', name: 'verified_by_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', isNullable: true, description: 'FK -> users(id)' },
      { id: 'cm-11', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-publications-patents',
    name: 'publications_patents',
    description: 'Intellectual property, co-authored peer-reviewed research papers, and patent filings co-produced with diaspora scholars',
    category: 'Collaborations',
    columns: [
      { id: 'pp-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'pp-2', name: 'expert_id', type: 'UUID', isForeign: true, foreignTable: 'experts', foreignColumn: 'id', description: 'FK -> experts(id) Diaspora Co-Author' },
      { id: 'pp-3', name: 'collaboration_id', type: 'UUID', isForeign: true, foreignTable: 'collaborations', foreignColumn: 'id', isNullable: true, description: 'FK -> collaborations(id)' },
      { id: 'pp-4', name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', foreignColumn: 'id', isNullable: true, description: 'FK -> institutions(id)' },
      { id: 'pp-5', name: 'title', type: 'VARCHAR(255)', isNullable: false },
      { id: 'pp-6', name: 'type', type: 'VARCHAR(80)', defaultValue: "'patent'", description: 'patent | journal_article | conference_paper | doctoral_thesis' },
      { id: 'pp-7', name: 'patent_or_doi_number', type: 'VARCHAR(150)', isNullable: false },
      { id: 'pp-8', name: 'publisher_or_patent_office', type: 'VARCHAR(150)', isNullable: false },
      { id: 'pp-9', name: 'year', type: 'INT', defaultValue: '2026' },
      { id: 'pp-10', name: 'citations_count', type: 'INT', defaultValue: '0' },
      { id: 'pp-11', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-event-promotions',
    name: 'event_promotions',
    description: 'University events, academic workshops, and keynote seminars promoted on DZ-Bridge and linked to collaborations',
    category: 'Collaborations',
    columns: [
      { id: 'ep-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'ep-2', name: 'organization_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', description: 'FK -> users(id) Host Organization' },
      { id: 'ep-3', name: 'collaboration_id', type: 'UUID', isForeign: true, foreignTable: 'collaborations', foreignColumn: 'id', isNullable: true, description: 'FK -> collaborations(id)' },
      { id: 'ep-4', name: 'project_id', type: 'UUID', isForeign: true, foreignTable: 'projects', foreignColumn: 'id', isNullable: true, description: 'FK -> projects(id)' },
      { id: 'ep-5', name: 'title', type: 'VARCHAR(255)', isNullable: false },
      { id: 'ep-6', name: 'description', type: 'TEXT', isNullable: false },
      { id: 'ep-7', name: 'event_type', type: 'VARCHAR(80)', defaultValue: "'doctoral_seminar'", description: 'workshop | doctoral_seminar | keynote | conference | hackathon' },
      { id: 'ep-8', name: 'location_city', type: 'VARCHAR(100)', isNullable: false },
      { id: 'ep-9', name: 'venue_address', type: 'VARCHAR(255)', isNullable: false },
      { id: 'ep-10', name: 'event_date', type: 'DATE', isNullable: false },
      { id: 'ep-11', name: 'materials_urls', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'PDF slides, agenda, registration links' },
      { id: 'ep-12', name: 'status', type: 'VARCHAR(50)', defaultValue: "'pending_approval'", description: 'draft | pending_approval | approved | rejected | published' },
      { id: 'ep-13', name: 'approved_by_admin_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', isNullable: true, description: 'FK -> users(id) Admin Reviewer' },
      { id: 'ep-14', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },

  // 8. Surveys, Feedback & Conflict Moderation (Explicit in Specs Section 9)
  {
    id: 'tbl-surveys',
    name: 'surveys',
    description: 'Configurable survey questionnaires triggered at key platform milestones (post-registration, match, completion)',
    category: 'Feedback',
    columns: [
      { id: 'sv-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'sv-2', name: 'title', type: 'VARCHAR(255)', isNullable: false },
      { id: 'sv-3', name: 'survey_type', type: 'VARCHAR(80)', defaultValue: "'collaboration_experience'", description: 'platform_experience | collaboration_experience | onboarding' },
      { id: 'sv-4', name: 'target_role', type: 'VARCHAR(50)', defaultValue: "'all'", description: 'expert | organization | all' },
      { id: 'sv-5', name: 'trigger_event', type: 'VARCHAR(80)', defaultValue: "'after_collaboration_completion'", description: 'after_registration | after_project_submission | after_match | after_collaboration_completion' },
      { id: 'sv-6', name: 'questions', type: 'JSONB', isNullable: false, description: 'Structured 1-5 scale questions, multiple-choice, and open feedback fields' },
      { id: 'sv-7', name: 'is_active', type: 'BOOLEAN', defaultValue: 'TRUE' },
      { id: 'sv-8', name: 'created_by_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', isNullable: true, description: 'FK -> users(id) MESRS Admin' },
      { id: 'sv-9', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-survey-responses',
    name: 'survey_responses',
    description: 'Submitted feedback answers, satisfaction scores (1-5), and Net Promoter Scores (NPS) for platform governance',
    category: 'Feedback',
    columns: [
      { id: 'sr-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'sr-2', name: 'survey_id', type: 'UUID', isForeign: true, foreignTable: 'surveys', foreignColumn: 'id', description: 'FK -> surveys(id)' },
      { id: 'sr-3', name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', description: 'FK -> users(id) Respondent' },
      { id: 'sr-4', name: 'project_id', type: 'UUID', isForeign: true, foreignTable: 'projects', foreignColumn: 'id', isNullable: true, description: 'FK -> projects(id)' },
      { id: 'sr-5', name: 'collaboration_id', type: 'UUID', isForeign: true, foreignTable: 'collaborations', foreignColumn: 'id', isNullable: true, description: 'FK -> collaborations(id)' },
      { id: 'sr-6', name: 'responses', type: 'JSONB', isNullable: false, description: 'Raw question-answer map' },
      { id: 'sr-7', name: 'rating', type: 'INT', isNullable: false, description: '1 to 5 scale satisfaction rating' },
      { id: 'sr-8', name: 'nps_score', type: 'INT', isNullable: true, description: '0 to 10 recommendation index' },
      { id: 'sr-9', name: 'comments', type: 'TEXT', isNullable: true },
      { id: 'sr-10', name: 'submitted_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-ratings',
    name: 'ratings',
    description: 'Confidential 1-5 scale mutual feedback across categories (communication, professionalism, value, punctuality)',
    category: 'Feedback',
    columns: [
      { id: 'r-1', name: 'id', type: 'UUID', isPrimary: true },
      { id: 'r-2', name: 'collaboration_id', type: 'UUID', isForeign: true, foreignTable: 'collaborations', foreignColumn: 'id' },
      { id: 'r-3', name: 'project_id', type: 'UUID', isForeign: true, foreignTable: 'projects', foreignColumn: 'id', isNullable: true, description: 'FK -> projects(id)' },
      { id: 'r-4', name: 'from_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id' },
      { id: 'r-5', name: 'to_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id' },
      { id: 'r-6', name: 'overall_score', type: 'INT', isNullable: false, description: '1 to 5 scale check' },
      { id: 'r-7', name: 'category_scores', type: 'JSONB', isNullable: false, description: 'communication, technical depth, mentorship impact, logistics' },
      { id: 'r-8', name: 'comment', type: 'TEXT', isNullable: true },
      { id: 'r-9', name: 'recommendation_for_future', type: 'BOOLEAN', defaultValue: 'TRUE' },
      { id: 'r-10', name: 'is_private_admin_only', type: 'BOOLEAN', defaultValue: 'TRUE', description: 'Internal in MVP to build long-term trust' },
      { id: 'r-11', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-issue-flags',
    name: 'issue_flags',
    description: 'Dispute moderation, low-satisfaction alerts, and reported complaints requiring administrator intervention',
    category: 'Feedback',
    columns: [
      { id: 'if-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'if-2', name: 'reporter_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', description: 'FK -> users(id) Reporter' },
      { id: 'if-3', name: 'reported_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', isNullable: true, description: 'FK -> users(id) Target' },
      { id: 'if-4', name: 'project_id', type: 'UUID', isForeign: true, foreignTable: 'projects', foreignColumn: 'id', isNullable: true, description: 'FK -> projects(id)' },
      { id: 'if-5', name: 'collaboration_id', type: 'UUID', isForeign: true, foreignTable: 'collaborations', foreignColumn: 'id', isNullable: true, description: 'FK -> collaborations(id)' },
      { id: 'if-6', name: 'category', type: 'VARCHAR(100)', isNullable: false, description: 'quality | communication | logistics | policy_violation | unresolved_complaint' },
      { id: 'if-7', name: 'description', type: 'TEXT', isNullable: false },
      { id: 'if-8', name: 'severity', type: 'VARCHAR(50)', defaultValue: "'medium'", description: 'low | medium | high | critical' },
      { id: 'if-9', name: 'status', type: 'VARCHAR(50)', defaultValue: "'open'", description: 'open | investigating | resolved | dismissed' },
      { id: 'if-10', name: 'admin_resolution_notes', type: 'TEXT', isNullable: true },
      { id: 'if-11', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },

  // 9. Custom KPI Governance & Analytics Snapshots (Explicit in Specs Section 8 & 11)
  {
    id: 'tbl-custom-kpis',
    name: 'custom_kpis',
    description: 'Dynamic platform KPIs configured by MESRS administrators with target thresholds, algorithm links, and front-end visualization modes',
    category: 'Audit',
    columns: [
      { id: 'ck-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'ck-2', name: 'name', type: 'VARCHAR(150)', isNullable: false, description: 'KPI Metric Title' },
      { id: 'ck-3', name: 'description', type: 'TEXT', isNullable: true, description: 'Institutional purpose and methodology' },
      { id: 'ck-4', name: 'category', type: 'VARCHAR(100)', defaultValue: "'National Impact'", description: 'National Impact, Academic Research, Diaspora Outreach, Governance' },
      { id: 'ck-5', name: 'current_value', type: 'VARCHAR(50)', isNullable: false },
      { id: 'ck-6', name: 'target_value', type: 'VARCHAR(50)', isNullable: false },
      { id: 'ck-7', name: 'unit', type: 'VARCHAR(30)', defaultValue: "''" },
      { id: 'ck-8', name: 'progress_percentage', type: 'INT', defaultValue: '80' },
      { id: 'ck-9', name: 'status', type: 'VARCHAR(50)', defaultValue: "'on_track'", description: 'exceeded | on_track | attention_required' },
      { id: 'ck-10', name: 'visualization_type', type: 'VARCHAR(50)', defaultValue: "'progress'", description: 'progress | gauge | stat_counter | sparkline' },
      { id: 'ck-11', name: 'display_on_landing', type: 'BOOLEAN', defaultValue: 'TRUE', description: 'Highlight on public sovereign landing page' },
      { id: 'ck-12', name: 'created_by_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', isNullable: true, description: 'FK -> users(id) MESRS Administrator' },
      { id: 'ck-13', name: 'target_algorithm_id', type: 'UUID', isForeign: true, foreignTable: 'matching_algorithms', foreignColumn: 'id', isNullable: true, description: 'FK -> matching_algorithms(id)' },
      { id: 'ck-14', name: 'target_institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', foreignColumn: 'id', isNullable: true, description: 'FK -> institutions(id)' },
      { id: 'ck-15', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-kpi-evaluations',
    name: 'kpi_evaluations',
    description: 'Periodic audit assessments and performance checkpoint evaluations measuring strategic KPI targets',
    category: 'Audit',
    columns: [
      { id: 'ke-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'ke-2', name: 'kpi_id', type: 'UUID', isForeign: true, foreignTable: 'custom_kpis', foreignColumn: 'id', isNullable: false, description: 'FK -> custom_kpis(id)' },
      { id: 'ke-3', name: 'evaluated_by_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', isNullable: true, description: 'FK -> users(id) Inspector' },
      { id: 'ke-4', name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', foreignColumn: 'id', isNullable: true, description: 'FK -> institutions(id)' },
      { id: 'ke-5', name: 'recorded_value', type: 'VARCHAR(50)', isNullable: false },
      { id: 'ke-6', name: 'target_value', type: 'VARCHAR(50)', isNullable: false },
      { id: 'ke-7', name: 'delta_percentage', type: 'DECIMAL(5,2)', defaultValue: '0.00' },
      { id: 'ke-8', name: 'compliance_status', type: 'VARCHAR(50)', defaultValue: "'compliant'" },
      { id: 'ke-9', name: 'evaluation_notes', type: 'TEXT', isNullable: true },
      { id: 'ke-10', name: 'evaluated_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-kpi-institution-targets',
    name: 'kpi_institution_targets',
    description: 'Institutional allocation of national KPI quotas per university and research centre',
    category: 'Audit',
    columns: [
      { id: 'kit-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'kit-2', name: 'kpi_id', type: 'UUID', isForeign: true, foreignTable: 'custom_kpis', foreignColumn: 'id', description: 'FK -> custom_kpis(id)' },
      { id: 'kit-3', name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', foreignColumn: 'id', description: 'FK -> institutions(id)' },
      { id: 'kit-4', name: 'assigned_target_value', type: 'VARCHAR(50)', isNullable: false },
      { id: 'kit-5', name: 'achieved_value', type: 'VARCHAR(50)', isNullable: false },
      { id: 'kit-6', name: 'compliance_rate', type: 'DECIMAL(5,2)', defaultValue: '90.00' },
      { id: 'kit-7', name: 'last_updated', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-analytics-snapshots',
    name: 'analytics_snapshots',
    description: 'Automated platform health and conversion funnel snapshots aggregated for executive reporting (Explicit in Specs)',
    category: 'Audit',
    columns: [
      { id: 'as-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'as-2', name: 'snapshot_date', type: 'DATE', isNullable: false },
      { id: 'as-3', name: 'period_type', type: 'VARCHAR(50)', defaultValue: "'monthly'", description: 'daily | monthly | quarterly' },
      { id: 'as-4', name: 'total_registered_experts', type: 'INT', defaultValue: '0' },
      { id: 'as-5', name: 'total_registered_organizations', type: 'INT', defaultValue: '0' },
      { id: 'as-6', name: 'total_projects_submitted', type: 'INT', defaultValue: '0' },
      { id: 'as-7', name: 'total_matches_generated', type: 'INT', defaultValue: '0' },
      { id: 'as-8', name: 'total_collaborations_confirmed', type: 'INT', defaultValue: '0' },
      { id: 'as-9', name: 'total_collaborations_completed', type: 'INT', defaultValue: '0' },
      { id: 'as-10', name: 'avg_time_to_match_days', type: 'DECIMAL(5,2)', defaultValue: '1.80' },
      { id: 'as-11', name: 'collaboration_success_rate', type: 'DECIMAL(5,2)', defaultValue: '92.50' },
      { id: 'as-12', name: 'user_satisfaction_avg_score', type: 'DECIMAL(3,2)', defaultValue: '4.85' },
      { id: 'as-13', name: 'metrics_payload', type: 'JSONB', defaultValue: "'{}'::jsonb", description: 'Funnel stages, drop-off points, and domain breakdown' },
      { id: 'as-14', name: 'generated_by_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', isNullable: true, description: 'FK -> users(id) Executive Analyst' },
      { id: 'as-15', name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', foreignColumn: 'id', isNullable: true, description: 'FK -> institutions(id) Optional Institutional Filter' },
      { id: 'as-16', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },

  // 10. Governance, Audit Trails & Notifications (Explicit in Specs Section 7 & 8)
  {
    id: 'tbl-project-status-histories',
    name: 'project_status_histories',
    description: 'Audit trail for project state machine transitions from draft to confirmed and completed',
    category: 'Audit',
    columns: [
      { id: 'psh-1', name: 'id', type: 'UUID', isPrimary: true },
      { id: 'psh-2', name: 'project_id', type: 'UUID', isForeign: true, foreignTable: 'projects', foreignColumn: 'id' },
      { id: 'psh-3', name: 'previous_status', type: 'project_status ENUM', isNullable: true },
      { id: 'psh-4', name: 'new_status', type: 'project_status ENUM', isNullable: false },
      { id: 'psh-5', name: 'changed_by_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', isNullable: true },
      { id: 'psh-6', name: 'notes', type: 'TEXT', isNullable: true },
      { id: 'psh-7', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-activity-logs',
    name: 'activity_logs',
    description: 'Immutable system-wide audit trail with cross-table linkages to actors, projects, and collaborations',
    category: 'Audit',
    columns: [
      { id: 'al-1', name: 'id', type: 'UUID', isPrimary: true },
      { id: 'al-2', name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', isNullable: true },
      { id: 'al-3', name: 'project_id', type: 'UUID', isForeign: true, foreignTable: 'projects', foreignColumn: 'id', isNullable: true, description: 'FK -> projects(id)' },
      { id: 'al-4', name: 'collaboration_id', type: 'UUID', isForeign: true, foreignTable: 'collaborations', foreignColumn: 'id', isNullable: true, description: 'FK -> collaborations(id)' },
      { id: 'al-5', name: 'user_role', type: 'user_role ENUM', isNullable: true },
      { id: 'al-6', name: 'action_type', type: 'VARCHAR(100)', isNullable: false, description: 'ACCOUNT_CREATED, CV_UPLOADED, PROJECT_SUBMITTED, MATCH_ACCEPTED, COLLABORATION_CONFIRMED' },
      { id: 'al-7', name: 'entity_type', type: 'VARCHAR(100)', isNullable: true },
      { id: 'al-8', name: 'entity_id', type: 'UUID', isNullable: true },
      { id: 'al-9', name: 'status_before', type: 'VARCHAR(100)', isNullable: true },
      { id: 'al-10', name: 'status_after', type: 'VARCHAR(100)', isNullable: true },
      { id: 'al-11', name: 'ip_address', type: 'VARCHAR(45)', isNullable: true },
      { id: 'al-12', name: 'metadata', type: 'JSONB', defaultValue: "'{}'::jsonb" },
      { id: 'al-13', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
  {
    id: 'tbl-notifications',
    name: 'notifications',
    description: 'System alert routing and messaging linked directly to users, match proposals, and projects',
    category: 'Audit',
    columns: [
      { id: 'notif-1', name: 'id', type: 'UUID', isPrimary: true, description: 'uuid_generate_v4() primary key' },
      { id: 'notif-2', name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'users', foreignColumn: 'id', description: 'FK -> users(id)' },
      { id: 'notif-3', name: 'match_id', type: 'UUID', isForeign: true, foreignTable: 'matches', foreignColumn: 'id', isNullable: true, description: 'FK -> matches(id)' },
      { id: 'notif-4', name: 'project_id', type: 'UUID', isForeign: true, foreignTable: 'projects', foreignColumn: 'id', isNullable: true, description: 'FK -> projects(id)' },
      { id: 'notif-5', name: 'collaboration_id', type: 'UUID', isForeign: true, foreignTable: 'collaborations', foreignColumn: 'id', isNullable: true, description: 'FK -> collaborations(id)' },
      { id: 'notif-6', name: 'type', type: 'VARCHAR(80)', isNullable: false },
      { id: 'notif-7', name: 'title', type: 'VARCHAR(255)', isNullable: false },
      { id: 'notif-8', name: 'message', type: 'TEXT', isNullable: false },
      { id: 'notif-9', name: 'is_read', type: 'BOOLEAN', defaultValue: 'FALSE' },
      { id: 'notif-10', name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
];

export const INITIAL_SCHEMA_RELATIONS: SchemaRelation[] = [
  // 1. Identity & Profiles
  {
    id: 'rel-1',
    sourceTable: 'profiles',
    sourceColumn: 'user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: '1:1 User Profile',
  },
  {
    id: 'rel-exp-1',
    sourceTable: 'experts',
    sourceColumn: 'user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: '1:1 Expert Scientific Credentials',
  },
  {
    id: 'rel-2',
    sourceTable: 'expert_availabilities',
    sourceColumn: 'expert_id',
    targetTable: 'experts',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Expert Visit Schedule Windows',
  },

  // 2. Institutions Hierarchy Linkages
  {
    id: 'rel-3',
    sourceTable: 'institutions',
    sourceColumn: 'user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Institution Admin Account',
  },
  {
    id: 'rel-4',
    sourceTable: 'research_laboratories',
    sourceColumn: 'institution_id',
    targetTable: 'institutions',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Parent University/Center',
  },
  {
    id: 'rel-5',
    sourceTable: 'research_laboratories',
    sourceColumn: 'director_user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Lab Director Fellow',
  },

  // 3. Projects & Ownership Linkages
  {
    id: 'rel-6',
    sourceTable: 'projects',
    sourceColumn: 'organization_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Organization Owner',
  },
  {
    id: 'rel-7',
    sourceTable: 'projects',
    sourceColumn: 'institution_id',
    targetTable: 'institutions',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Hosting Institution',
  },
  {
    id: 'rel-8',
    sourceTable: 'projects',
    sourceColumn: 'laboratory_id',
    targetTable: 'research_laboratories',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Associated Research Lab',
  },

  // 4. Algorithmic Matchmaking Engine Linkages
  {
    id: 'rel-9',
    sourceTable: 'matching_algorithms',
    sourceColumn: 'created_by_user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Algorithm Maintainer',
  },
  {
    id: 'rel-10',
    sourceTable: 'matching_criteria_weights',
    sourceColumn: 'algorithm_id',
    targetTable: 'matching_algorithms',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Algorithm Weight Matrix',
  },
  {
    id: 'rel-11',
    sourceTable: 'matching_runs',
    sourceColumn: 'algorithm_id',
    targetTable: 'matching_algorithms',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Run Algorithm Model',
  },
  {
    id: 'rel-12',
    sourceTable: 'matching_runs',
    sourceColumn: 'project_id',
    targetTable: 'projects',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Target Project Match Run',
  },
  {
    id: 'rel-13',
    sourceTable: 'matching_runs',
    sourceColumn: 'initiated_by_user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Run Operator User',
  },

  // 5. Matches & Evaluation Metrics Linkages
  {
    id: 'rel-14',
    sourceTable: 'matches',
    sourceColumn: 'project_id',
    targetTable: 'projects',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Matched Project',
  },
  {
    id: 'rel-15',
    sourceTable: 'matches',
    sourceColumn: 'expert_id',
    targetTable: 'experts',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Matched Expert Fellow',
  },
  {
    id: 'rel-16',
    sourceTable: 'matches',
    sourceColumn: 'algorithm_id',
    targetTable: 'matching_algorithms',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Computed Algorithm Model',
  },
  {
    id: 'rel-17',
    sourceTable: 'matches',
    sourceColumn: 'matching_run_id',
    targetTable: 'matching_runs',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Origin Batch Match Run',
  },
  {
    id: 'rel-18',
    sourceTable: 'match_evaluations',
    sourceColumn: 'match_id',
    targetTable: 'matches',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Evaluated Match Pairing',
  },
  {
    id: 'rel-19',
    sourceTable: 'match_evaluations',
    sourceColumn: 'algorithm_id',
    targetTable: 'matching_algorithms',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Evaluation Algorithm Spec',
  },
  {
    id: 'rel-20',
    sourceTable: 'match_evaluations',
    sourceColumn: 'matching_run_id',
    targetTable: 'matching_runs',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Evaluated Match Run',
  },
  {
    id: 'rel-21',
    sourceTable: 'match_evaluations',
    sourceColumn: 'evaluator_user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Academic Committee Reviewer',
  },

  // 6. Direct Communications & Secure Messaging Linkages (Explicit in Specs)
  {
    id: 'rel-22',
    sourceTable: 'conversations',
    sourceColumn: 'project_id',
    targetTable: 'projects',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Conversation Project Context',
  },
  {
    id: 'rel-23',
    sourceTable: 'conversations',
    sourceColumn: 'expert_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Conversation Expert Participant',
  },
  {
    id: 'rel-24',
    sourceTable: 'conversations',
    sourceColumn: 'organization_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Conversation Organization Participant',
  },
  {
    id: 'rel-25',
    sourceTable: 'conversations',
    sourceColumn: 'match_id',
    targetTable: 'matches',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Origin Match Trigger',
  },
  {
    id: 'rel-26',
    sourceTable: 'messages',
    sourceColumn: 'conversation_id',
    targetTable: 'conversations',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Parent Conversation Channel',
  },
  {
    id: 'rel-27',
    sourceTable: 'messages',
    sourceColumn: 'sender_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Message Author',
  },
  {
    id: 'rel-28',
    sourceTable: 'messages',
    sourceColumn: 'recipient_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Message Recipient',
  },

  // 7. Collaborations, Milestones & Event Promotion Linkages
  {
    id: 'rel-29',
    sourceTable: 'collaborations',
    sourceColumn: 'project_id',
    targetTable: 'projects',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Collaboration Project',
  },
  {
    id: 'rel-30',
    sourceTable: 'collaborations',
    sourceColumn: 'expert_id',
    targetTable: 'experts',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Participating Expert Fellow',
  },
  {
    id: 'rel-31',
    sourceTable: 'collaborations',
    sourceColumn: 'organization_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Hosting Organization',
  },
  {
    id: 'rel-32',
    sourceTable: 'collaborations',
    sourceColumn: 'institution_id',
    targetTable: 'institutions',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Hosting Institution',
  },
  {
    id: 'rel-33',
    sourceTable: 'collaboration_milestones',
    sourceColumn: 'collaboration_id',
    targetTable: 'collaborations',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Parent Collaboration',
  },
  {
    id: 'rel-34',
    sourceTable: 'collaboration_milestones',
    sourceColumn: 'assigned_expert_id',
    targetTable: 'experts',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Assigned Scholar Deliverable',
  },
  {
    id: 'rel-34b',
    sourceTable: 'collaboration_milestones',
    sourceColumn: 'verified_by_user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Milestone Verifier Account',
  },
  {
    id: 'rel-35',
    sourceTable: 'publications_patents',
    sourceColumn: 'expert_id',
    targetTable: 'experts',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Scholar Author / Inventor',
  },
  {
    id: 'rel-36',
    sourceTable: 'publications_patents',
    sourceColumn: 'collaboration_id',
    targetTable: 'collaborations',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Resulting Collaboration',
  },
  {
    id: 'rel-37',
    sourceTable: 'publications_patents',
    sourceColumn: 'institution_id',
    targetTable: 'institutions',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Co-filing Partner Institution',
  },
  {
    id: 'rel-38',
    sourceTable: 'event_promotions',
    sourceColumn: 'organization_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Host Event Organization',
  },
  {
    id: 'rel-39',
    sourceTable: 'event_promotions',
    sourceColumn: 'collaboration_id',
    targetTable: 'collaborations',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Linked Partnership Event',
  },
  {
    id: 'rel-40',
    sourceTable: 'event_promotions',
    sourceColumn: 'project_id',
    targetTable: 'projects',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Linked Project Initiative',
  },
  {
    id: 'rel-41',
    sourceTable: 'event_promotions',
    sourceColumn: 'approved_by_admin_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Admin Event Approver',
  },

  // 8. Surveys, Ratings & Dispute Moderation Linkages (Explicit in Specs Section 9)
  {
    id: 'rel-42',
    sourceTable: 'surveys',
    sourceColumn: 'created_by_user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Survey Creator Administrator',
  },
  {
    id: 'rel-43',
    sourceTable: 'survey_responses',
    sourceColumn: 'survey_id',
    targetTable: 'surveys',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Parent Survey Template',
  },
  {
    id: 'rel-44',
    sourceTable: 'survey_responses',
    sourceColumn: 'user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Respondent User',
  },
  {
    id: 'rel-45',
    sourceTable: 'survey_responses',
    sourceColumn: 'project_id',
    targetTable: 'projects',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Surveyed Project Context',
  },
  {
    id: 'rel-46',
    sourceTable: 'survey_responses',
    sourceColumn: 'collaboration_id',
    targetTable: 'collaborations',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Surveyed Collaboration Context',
  },
  {
    id: 'rel-47',
    sourceTable: 'ratings',
    sourceColumn: 'collaboration_id',
    targetTable: 'collaborations',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Rated Collaboration',
  },
  {
    id: 'rel-48',
    sourceTable: 'ratings',
    sourceColumn: 'project_id',
    targetTable: 'projects',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Rated Project Entity',
  },
  {
    id: 'rel-49',
    sourceTable: 'ratings',
    sourceColumn: 'from_user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Feedback Author',
  },
  {
    id: 'rel-50',
    sourceTable: 'ratings',
    sourceColumn: 'to_user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Evaluated Peer',
  },
  {
    id: 'rel-51',
    sourceTable: 'issue_flags',
    sourceColumn: 'reporter_user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Flag Submitter',
  },
  {
    id: 'rel-52',
    sourceTable: 'issue_flags',
    sourceColumn: 'reported_user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Reported Subject',
  },
  {
    id: 'rel-53',
    sourceTable: 'issue_flags',
    sourceColumn: 'project_id',
    targetTable: 'projects',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Contested Project',
  },
  {
    id: 'rel-54',
    sourceTable: 'issue_flags',
    sourceColumn: 'collaboration_id',
    targetTable: 'collaborations',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Contested Collaboration',
  },

  // 9. Custom KPI System Linkages
  {
    id: 'rel-55',
    sourceTable: 'custom_kpis',
    sourceColumn: 'created_by_user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'MESRS KPI Admin Creator',
  },
  {
    id: 'rel-56',
    sourceTable: 'custom_kpis',
    sourceColumn: 'target_algorithm_id',
    targetTable: 'matching_algorithms',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Linked Match Algorithm',
  },
  {
    id: 'rel-57',
    sourceTable: 'custom_kpis',
    sourceColumn: 'target_institution_id',
    targetTable: 'institutions',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Targeted Institution Scope',
  },
  {
    id: 'rel-58',
    sourceTable: 'kpi_evaluations',
    sourceColumn: 'kpi_id',
    targetTable: 'custom_kpis',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Evaluated KPI',
  },
  {
    id: 'rel-59',
    sourceTable: 'kpi_evaluations',
    sourceColumn: 'evaluated_by_user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'KPI Verification Inspector',
  },
  {
    id: 'rel-60',
    sourceTable: 'kpi_evaluations',
    sourceColumn: 'institution_id',
    targetTable: 'institutions',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Audited Institution Scope',
  },
  {
    id: 'rel-61',
    sourceTable: 'kpi_institution_targets',
    sourceColumn: 'kpi_id',
    targetTable: 'custom_kpis',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Parent KPI Policy',
  },
  {
    id: 'rel-62',
    sourceTable: 'kpi_institution_targets',
    sourceColumn: 'institution_id',
    targetTable: 'institutions',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Assigned Institution Target',
  },

  // 10. Governance, Audit Trails & Notifications (Now Fully Linked)
  {
    id: 'rel-63',
    sourceTable: 'project_status_histories',
    sourceColumn: 'project_id',
    targetTable: 'projects',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Project Audit Trail',
  },
  {
    id: 'rel-64',
    sourceTable: 'project_status_histories',
    sourceColumn: 'changed_by_user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Status Transitioner',
  },
  {
    id: 'rel-65',
    sourceTable: 'activity_logs',
    sourceColumn: 'user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Audit Actor',
  },
  {
    id: 'rel-66',
    sourceTable: 'activity_logs',
    sourceColumn: 'project_id',
    targetTable: 'projects',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Audited Project Entity',
  },
  {
    id: 'rel-67',
    sourceTable: 'activity_logs',
    sourceColumn: 'collaboration_id',
    targetTable: 'collaborations',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Audited Collaboration Entity',
  },
  {
    id: 'rel-68',
    sourceTable: 'notifications',
    sourceColumn: 'user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Notification Recipient',
  },
  {
    id: 'rel-69',
    sourceTable: 'notifications',
    sourceColumn: 'match_id',
    targetTable: 'matches',
    targetColumn: 'id',
    onDelete: 'CASCADE',
    label: 'Linked Match Alert',
  },
  {
    id: 'rel-70',
    sourceTable: 'notifications',
    sourceColumn: 'project_id',
    targetTable: 'projects',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Linked Project Alert',
  },
  {
    id: 'rel-71',
    sourceTable: 'notifications',
    sourceColumn: 'collaboration_id',
    targetTable: 'collaborations',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Linked Collaboration Alert',
  },

  // 11. Analytics Snapshots Linkages
  {
    id: 'rel-72',
    sourceTable: 'analytics_snapshots',
    sourceColumn: 'generated_by_user_id',
    targetTable: 'users',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Executive Snapshot Creator',
  },
  {
    id: 'rel-73',
    sourceTable: 'analytics_snapshots',
    sourceColumn: 'institution_id',
    targetTable: 'institutions',
    targetColumn: 'id',
    onDelete: 'SET NULL',
    label: 'Snapshot Institution Scope',
  },
];

export function generatePostgreSqlDdl(tables: SchemaTableDef[], relations: SchemaRelation[]): string {
  let sql = `-- ==============================================================================
-- DZ-BRIDGE: COMPLETE RELATIONAL POSTGRESQL SCHEMA DDL
-- Official Matchmaking Platform for Algerian Scholars & Organizations
-- Compliant with Detailed Functional Specifications (July 9, 2026)
-- Fully Linked & Constraint-Locked Relational Integrity (Zero Orphan Tables)
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Custom Enumerations
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('expert', 'organization', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('pending_verification', 'active', 'suspended', 'deactivated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE project_status AS ENUM ('draft', 'submitted', 'under_review', 'matched', 'contact_initiated', 'confirmed', 'in_progress', 'completed', 'cancelled', 'unsuccessful');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
        CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'collaboration_status') THEN
        CREATE TYPE collaboration_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'survey_trigger_event') THEN
        CREATE TYPE survey_trigger_event AS ENUM ('after_registration', 'after_project_submission', 'after_match', 'after_collaboration_completion');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'issue_severity') THEN
        CREATE TYPE issue_severity AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
END $$;\n\n`;

  // Tables
  tables.forEach((tbl) => {
    sql += `-- Table: ${tbl.name} (${tbl.category || 'Core'})\n`;
    sql += `CREATE TABLE IF NOT EXISTS ${tbl.name} (\n`;
    const colDefs = tbl.columns.map((col) => {
      let line = `    ${col.name} ${col.type}`;
      if (col.isPrimary) line += ' PRIMARY KEY DEFAULT uuid_generate_v4()';
      if (col.isNullable === false && !col.isPrimary) line += ' NOT NULL';
      if (col.defaultValue && !col.isPrimary) line += ` DEFAULT ${col.defaultValue}`;
      return line;
    });
    sql += colDefs.join(',\n');
    sql += '\n);\n\n';
  });

  // Foreign Key Constraints
  sql += `-- 2. Relational Foreign Key Integrity Constraints (All Tables Locked)\n`;
  relations.forEach((rel) => {
    const constraintName = `fk_${rel.sourceTable}_${rel.sourceColumn}_to_${rel.targetTable}`;
    sql += `ALTER TABLE ${rel.sourceTable} ADD CONSTRAINT ${constraintName} \n`;
    sql += `    FOREIGN KEY (${rel.sourceColumn}) REFERENCES ${rel.targetTable}(${rel.targetColumn}) ON DELETE ${rel.onDelete};\n\n`;
  });

  return sql;
}

export function generateDjangoOrmCode(tables: SchemaTableDef[], relations: SchemaRelation[]): string {
  let py = `"""
DZ-Bridge Django 5.1 ORM Models
Generated automatically by Django Schema Studio
Database Engine: PostgreSQL 16 with UUID & JSONB
Full Relational Integrity: All Tables Locked & Linked via ForeignKeys
Compliant with DZ-Bridge Functional Specifications (July 9, 2026)
"""
import uuid
from django.db import models
from django.conf import settings\n\n`;

  tables.forEach((tbl) => {
    const className = tbl.name
      .split('_')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('');
    py += `class ${className}(models.Model):\n`;
    py += `    """${tbl.description || tbl.name}"""\n`;
    tbl.columns.forEach((col) => {
      let fieldCode = '';
      if (col.isPrimary && col.type.includes('UUID')) {
        fieldCode = `models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`;
      } else if (col.isForeign) {
        const targetModel = (col.foreignTable || 'User')
          .split('_')
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join('');
        const onDel = tbl.name.includes('log') || tbl.name.includes('history') ? 'models.SET_NULL' : 'models.CASCADE';
        fieldCode = `models.ForeignKey('${targetModel}', on_delete=${onDel}, null=True, blank=True, related_name='${tbl.name}_${col.name}')`;
      } else if (col.type === 'BOOLEAN') {
        fieldCode = `models.BooleanField(default=${col.defaultValue === 'TRUE' ? 'True' : 'False'})`;
      } else if (col.type.includes('VARCHAR') || col.type.includes('CHAR')) {
        const maxLen = col.type.match(/\d+/)?.[0] || '255';
        fieldCode = `models.CharField(max_length=${maxLen}${col.isNullable ? ', null=True, blank=True' : ''})`;
      } else if (col.type === 'TEXT') {
        fieldCode = `models.TextField(${col.isNullable ? 'null=True, blank=True' : ''})`;
      } else if (col.type === 'DATE') {
        fieldCode = `models.DateField(${col.isNullable ? 'null=True, blank=True' : ''})`;
      } else if (col.type.includes('TIMESTAMP')) {
        fieldCode = `models.DateTimeField(${col.defaultValue?.includes('CURRENT_TIMESTAMP') ? 'auto_now_add=True' : 'null=True, blank=True'})`;
      } else if (col.type === 'JSONB' || col.type.includes('[]')) {
        fieldCode = `models.JSONField(default=dict, blank=True)`;
      } else if (col.type.includes('INT')) {
        fieldCode = `models.IntegerField(${col.isNullable ? 'null=True, blank=True' : ''})`;
      } else if (col.type.includes('DECIMAL')) {
        fieldCode = `models.DecimalField(max_digits=5, decimal_places=2)`;
      } else {
        fieldCode = `models.CharField(max_length=255, null=True, blank=True)`;
      }
      py += `    ${col.name} = ${fieldCode}\n`;
    });
    py += `\n    class Meta:\n`;
    py += `        db_table = '${tbl.name}'\n`;
    py += `        verbose_name = '${className}'\n\n\n`;
  });

  return py;
}
