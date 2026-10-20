export type UserRole = 'super_admin' | 'admin' | 'expert' | 'organization';

export type UserStatus = 'pending_verification' | 'active' | 'suspended' | 'deactivated';

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  organizationName?: string;
  organizationType?: string;
  country: string;
  city?: string;
  isDiaspora?: boolean;
  specialty?: string;
  affiliation?: string;
  bio?: string;
  phoneNumber?: string;
  provider?: 'local' | 'google' | 'linkedin' | 'microsoft';
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export type ProjectStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'matched'
  | 'contact_initiated'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'unsuccessful';

export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export type CollaborationStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface ScoreBreakdown {
  skills_score: number;
  availability_score: number;
  location_score: number;
  diaspora_bonus: number;
  matched_skills: string[];
  overlapping_days?: number;
  explanation?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  organizationName?: string;
  organizationType?: 'public_university' | 'research_institute' | 'startup' | 'enterprise';
  bio?: string;
  phoneNumber?: string;
  country: string;
  city?: string;
  isDiaspora: boolean;
  affiliation?: string;
  titleOrRank?: string;
  expertiseTags: string[];
  collaborationPreferences: {
    remote_ok?: boolean;
    in_person_ok?: boolean;
    travel_stipend_required?: boolean;
    lodging_required?: boolean;
    honorarium_expected?: boolean;
    custom_terms?: string;
  };
  documents?: Array<{
    id: string;
    name: string;
    type: 'cv' | 'publication' | 'patent' | 'certificate';
    url: string;
    uploaded_at: string;
    size_bytes?: number;
  }>;
}

export interface ExpertAvailability {
  id: string;
  expertId: string;
  city: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  notes?: string;
}

export interface ProjectItem {
  id: string;
  organizationId: string;
  organizationName: string;
  title: string;
  description: string;
  skillsRequired: string[];
  location: string;
  startDate?: string;
  endDate?: string;
  logisticsOffered: {
    travel?: boolean;
    lodging?: boolean;
    stipend?: boolean;
    honorarium_amount?: number;
    currency?: string;
    notes?: string;
  };
  budgetDetails?: Record<string, any>;
  status: ProjectStatus;
  createdAt: string;
}

export interface MatchItem {
  id: string;
  projectId: string;
  projectTitle: string;
  organizationName: string;
  organizationCity?: string;
  expertId: string;
  expertName: string;
  expertCity: string;
  expertAffiliation?: string;
  isDiaspora: boolean;
  compatibilityScore: number;
  scoreBreakdown: ScoreBreakdown;
  status: MatchStatus;
  algorithmId?: string;
  notifiedAt: string;
  respondedAt?: string;
  notes?: string;
}

export interface CollaborationItem {
  id: string;
  projectId: string;
  projectTitle: string;
  expertId: string;
  expertName: string;
  organizationId: string;
  organizationName: string;
  status: CollaborationStatus;
  confirmedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  userId: string | null;
  userName?: string;
  userRole?: UserRole;
  actionType: string;
  entityType: string;
  entityId?: string;
  ipAddress: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface SchemaColumn {
  id: string;
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  foreignTable?: string;
  foreignColumn?: string;
  isNullable?: boolean;
  defaultValue?: string;
  description?: string;
}

export interface SchemaRelation {
  id: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  label?: string;
}

export interface SchemaTableDef {
  id: string;
  name: string;
  description: string;
  category?: 'Identity' | 'Matchmaking' | 'Collaborations' | 'Audit' | 'Academic' | 'Feedback' | 'Communications' | 'Custom';
  columns: SchemaColumn[];
}

export interface BackendConnectionConfig {
  apiUrl: string;
  djangoApiUrl: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  latencyMs: number;
  port: number;
  djangoPort: number;
  database: string;
  dbType: string;
  jwtToken: string;
  lastPing: string;
}

export interface ApiEndpointDef {
  id: string;
  category: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  drfPath?: string;
  description: string;
  roleRequired: 'Public' | 'Authenticated' | 'Expert' | 'Organization' | 'Admin';
  targetRole?: UserRole | 'all';
  connectedTable?: string;
  authType?: 'public' | 'jwt' | 'api_key' | 'admin';
  rateLimitPerMin?: number;
  corsOrigins?: string;
  enabled?: boolean;
  defaultBody?: any;
  defaultParams?: Record<string, string>;
  expectedStatus: number;
  isCustomCreated?: boolean;
}

export interface ExternalApiKey {
  id: string;
  clientName: string;
  apiKey: string;
  keyPrefix: string;
  role: UserRole | 'external';
  allowedOrigins: string;
  rateLimit: number;
  status: 'active' | 'revoked';
  createdAt: string;
  lastUsedAt?: string;
}

export interface CustomKpiItem {
  id: string;
  name: string;
  description: string;
  category: 'National Impact' | 'Academic Research' | 'Diaspora Outreach' | 'Governance';
  currentValue: string;
  targetValue: string;
  unit?: string;
  progressPercentage: number;
  status: 'exceeded' | 'on_track' | 'attention_required';
  visualizationType: 'progress' | 'gauge' | 'stat_counter' | 'sparkline';
  displayOnLanding: boolean;
  createdAt: string;
  formulaOrSource?: string;
  createdByUserId?: string;
  targetAlgorithmId?: string;
}

export interface MatchingAlgorithmItem {
  id: string;
  name: string;
  version: string;
  description: string;
  skillsWeight: number;
  availabilityWeight: number;
  locationWeight: number;
  diasporaBonusWeight: number;
  minCompatibilityThreshold: number;
  isActive: boolean;
  createdByUserId: string;
  createdAt: string;
}

export interface MatchEvaluationItem {
  id: string;
  matchId: string;
  algorithmId: string;
  evaluatorUserId: string;
  evaluatorName?: string;
  skillsAlignmentScore: number;
  availabilitySyncScore: number;
  locationAffinityScore: number;
  diasporaPriorityScore: number;
  compositeScore: number;
  precisionMetric: number;
  committeeVerificationNotes?: string;
  isVerifiedByCommittee: boolean;
  createdAt: string;
}

export interface KpiEvaluationItem {
  id: string;
  kpiId: string;
  evaluatedByUserId: string;
  recordedValue: string;
  targetValue: string;
  deltaPercentage: number;
  complianceStatus: 'compliant' | 'warning' | 'critical';
  evaluationNotes?: string;
  evaluatedAt: string;
}

export interface ExpertItem {
  id: string;
  userId: string;
  fullName: string;
  academicTitle: string;
  highestDegree: string;
  currentAffiliation: string;
  country: string;
  city?: string;
  isDiaspora: boolean;
  primaryDomain: string;
  skills: string[];
  hIndex: number;
  citationsCount: number;
  publicationsCount: number;
  bio?: string;
  googleScholarUrl?: string;
  orcidId?: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  createdAt: string;
}

export interface InstitutionItem {
  id: string;
  userId: string;
  code: string;
  name: string;
  acronym: string;
  institutionType: 'university' | 'national_school' | 'research_center' | 'enterprise' | 'startup' | 'ministry' | 'association';
  sector?: 'public' | 'private' | 'mixed';
  wilaya: string;
  country?: string;
  rectorOrDirector: string;
  contactEmail: string;
  website?: string;
  totalDoctoralStudents: number;
  isVerified?: boolean;
  createdAt: string;
}

export type AcademicInstitutionItem = InstitutionItem;

export interface ResearchLaboratoryItem {
  id: string;
  institutionId: string;
  directorUserId?: string;
  code: string;
  name: string;
  acronym: string;
  scientificDomain: string;
  doctoralSchoolName?: string;
  createdAt: string;
}

export interface MatchingCriteriaWeightItem {
  id: string;
  algorithmId: string;
  criterionCode: string;
  criterionName: string;
  weightPercentage: number;
  isMandatory: boolean;
  minimumScoreRequired: number;
  notes?: string;
}

export interface MatchingRunItem {
  id: string;
  algorithmId: string;
  algorithmName?: string;
  projectId?: string;
  projectTitle?: string;
  initiatedByUserId: string;
  initiatedByName?: string;
  candidatesEvaluated: number;
  matchesGenerated: number;
  avgCompatibilityScore: number;
  executionTimeMs: number;
  status: 'completed' | 'running' | 'failed';
  ranAt: string;
}

export interface PublicationPatentItem {
  id: string;
  expertId: string;
  expertName?: string;
  collaborationId?: string;
  institutionId?: string;
  title: string;
  type: 'patent' | 'journal_article' | 'conference_paper' | 'doctoral_thesis';
  patentOrDoiNumber: string;
  publisherOrPatentOffice: string;
  year: number;
  citationsCount: number;
  createdAt: string;
}

export interface CollaborationMilestoneItem {
  id: string;
  collaborationId: string;
  assignedExpertId: string;
  title: string;
  phaseNumber: number;
  targetCompletionDate: string;
  completedAt?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  deliverableDescription?: string;
  verifiedByUserId?: string;
  createdAt: string;
}

export interface KpiInstitutionTargetItem {
  id: string;
  kpiId: string;
  institutionId: string;
  institutionName?: string;
  assignedTargetValue: string;
  achievedValue: string;
  complianceRate: number;
  lastUpdated: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  matchId?: string;
  projectId?: string;
  collaborationId?: string;
  type: 'match_proposed' | 'kpi_threshold_alert' | 'collaboration_update' | 'committee_invitation';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationItem {
  id: string;
  projectId: string;
  projectTitle?: string;
  expertId: string;
  expertName?: string;
  organizationId: string;
  organizationName?: string;
  matchId?: string;
  status: 'requested' | 'active' | 'archived';
  preferredContactSlot?: string;
  lastMessageSnippet?: string;
  lastMessageAt?: string;
  createdAt: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  recipientId: string;
  body: string;
  attachments?: string[];
  isRead: boolean;
  sentAt: string;
}

export interface EventPromotionItem {
  id: string;
  organizationId: string;
  organizationName?: string;
  collaborationId?: string;
  projectId?: string;
  title: string;
  description: string;
  eventType: 'workshop' | 'doctoral_seminar' | 'keynote' | 'conference' | 'hackathon';
  locationCity: string;
  venueAddress: string;
  eventDate: string;
  materialsUrls?: string[];
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'published';
  approvedByAdminId?: string;
  createdAt: string;
}

export interface SurveyTemplateItem {
  id: string;
  title: string;
  surveyType: 'platform_experience' | 'collaboration_experience' | 'onboarding';
  targetRole: 'expert' | 'organization' | 'all';
  triggerEvent: 'after_registration' | 'after_project_submission' | 'after_match' | 'after_collaboration_completion';
  questions: Array<{
    id: string;
    question: string;
    type: 'rating_1_to_5' | 'yes_no' | 'single_choice' | 'text';
    options?: string[];
  }>;
  isActive: boolean;
  createdAt: string;
}

export interface SurveyResponseItem {
  id: string;
  surveyId: string;
  userId: string;
  userName?: string;
  userRole?: UserRole;
  projectId?: string;
  collaborationId?: string;
  responses: Record<string, any>;
  rating: number; // 1 to 5
  npsScore?: number; // 0 to 10
  comments?: string;
  submittedAt: string;
}

export interface IssueFlagItem {
  id: string;
  reporterUserId: string;
  reporterName?: string;
  reportedUserId?: string;
  reportedName?: string;
  projectId?: string;
  collaborationId?: string;
  category: 'quality' | 'communication' | 'logistics' | 'policy_violation' | 'unresolved_complaint';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  adminResolutionNotes?: string;
  createdAt: string;
}

export interface AnalyticsSnapshotItem {
  id: string;
  snapshotDate: string;
  periodType: 'daily' | 'monthly' | 'quarterly';
  totalRegisteredExperts: number;
  totalRegisteredOrganizations: number;
  totalProjectsSubmitted: number;
  totalMatchesGenerated: number;
  totalCollaborationsConfirmed: number;
  totalCollaborationsCompleted: number;
  avgTimeToMatchDays: number;
  collaborationSuccessRate: number;
  userSatisfactionAvgScore: number;
  metricsPayload?: Record<string, any>;
  createdAt: string;
}

