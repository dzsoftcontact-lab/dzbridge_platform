import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Shield,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Building,
  GraduationCap,
  Globe,
  Mail,
  Calendar,
  Lock,
} from 'lucide-react';
import { UserAccount, UserRole, UserStatus } from '../types';
import { useAuth } from '../context/AuthContext';

interface UserManagementStudioProps {
  currentRole: UserRole;
  onRefreshAllData?: () => void;
}

export const UserManagementStudio: React.FC<UserManagementStudioProps> = ({ currentRole, onRefreshAllData }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserAccount | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // Form states for Create/Edit
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'expert' as UserRole,
    status: 'active' as UserStatus,
    organizationName: '',
    country: 'Algeria',
    city: '',
    specialty: '',
    bio: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const isSuperAdmin = currentRole === 'super_admin' || currentUser?.role === 'super_admin';

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Fetch users from real backend API with pagination, filter, search, sort
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('dzb-token');
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: search.trim(),
        role: roleFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
      });

      const res = await fetch(`/api/users?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error('Failed to load users');
      }

      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
    } catch (err: any) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Toggle user status (Activate / Deactivate)
  const handleToggleStatus = async (user: UserAccount) => {
    if (user.role === 'super_admin') {
      alert('Cannot change status of Super Admin.');
      return;
    }

    const nextStatus: UserStatus = user.status === 'active' ? 'deactivated' : 'active';
    try {
      const token = localStorage.getItem('dzb-token');
      const res = await fetch(`/api/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        showNotification(`User ${user.fullName} is now ${nextStatus}.`);
        fetchUsers();
        if (onRefreshAllData) onRefreshAllData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  // Handle Delete User
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem('dzb-token');
      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        showNotification(`User ${userToDelete.fullName} deleted permanently.`);
        setUserToDelete(null);
        fetchUsers();
        if (onRefreshAllData) onRefreshAllData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting user');
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'expert',
      status: 'active',
      organizationName: '',
      country: 'Algeria',
      city: '',
      specialty: '',
      bio: '',
    });
    setFormError(null);
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const openEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      password: '',
      role: user.role,
      status: user.status,
      organizationName: user.organizationName || '',
      country: user.country || 'Algeria',
      city: user.city || '',
      specialty: user.specialty || '',
      bio: user.bio || '',
    });
    setFormError(null);
  };

  // Submit Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      setFormError('Full Name and Email are required.');
      return;
    }

    try {
      const token = localStorage.getItem('dzb-token');
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create user');
        return;
      }

      showNotification(`User account for ${formData.fullName} created successfully.`);
      setShowCreateModal(false);
      fetchUsers();
      if (onRefreshAllData) onRefreshAllData();
    } catch (err: any) {
      setFormError(err.message || 'Error creating user');
    }
  };

  // Submit Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('dzb-token');
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to update user');
        return;
      }

      showNotification(`User ${formData.fullName} updated successfully.`);
      setEditingUser(null);
      fetchUsers();
      if (onRefreshAllData) onRefreshAllData();
    } catch (err: any) {
      setFormError(err.message || 'Error updating user');
    }
  };

  // Role Badge Helper
  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <ShieldAlert className="w-3 h-3 text-purple-600" />
            Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Shield className="w-3 h-3 text-blue-600" />
            Admin
          </span>
        );
      case 'organization':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Building className="w-3 h-3 text-amber-600" />
            Institution
          </span>
        );
      case 'expert':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <GraduationCap className="w-3 h-3 text-emerald-600" />
            Expert
          </span>
        );
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Active
          </span>
        );
      case 'pending_verification':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
      case 'suspended':
      case 'deactivated':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600" />
            {status === 'suspended' ? 'Suspended' : 'Deactivated'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-[var(--accent-gold)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-['Fraunces',serif] text-[var(--text-primary)]">
                User Management & Access Control
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Manage accounts, role assignments, permissions, activation states, and institutional affiliations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchUsers}
            className="h-10 px-3.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5 transition"
            title="Refresh user list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="h-10 px-4 rounded-xl bg-[var(--brand)] text-[var(--text-on-brand)] hover:bg-[var(--brand-hover)] text-xs font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by full name, email, specialty, or organization..."
            className="w-full h-10 ps-9 pe-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)] transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-xs font-medium focus:outline-none focus:border-[var(--brand)]"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="expert">Expert</option>
              <option value="organization">Organization</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-xs font-medium focus:outline-none focus:border-[var(--brand)]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending_verification">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-xs font-medium focus:outline-none focus:border-[var(--brand)]"
            >
              <option value="createdAt">Date Created</option>
              <option value="fullName">Full Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
              <option value="lastLoginAt">Last Login</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-10 px-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-subtle)] text-xs flex items-center justify-center"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-semibold border-b border-[var(--border)] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Affiliation / Domain</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[var(--brand)]" />
                      <span>Loading user records from database...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-muted)]">
                    No users found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const canModifyUser = isSuperAdmin || (currentRole === 'admin' && u.role !== 'super_admin' && u.role !== 'admin');
                  const canDeleteUser = isSuperAdmin && u.role !== 'super_admin';

                  return (
                    <tr key={u.id} className="hover:bg-[var(--bg-subtle)]/60 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[var(--brand)] text-[var(--accent-gold)] font-bold text-xs flex items-center justify-center shrink-0">
                            {u.avatar || u.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[var(--accent-gold-subtle)] text-[var(--text-accent)] font-semibold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[var(--text-secondary)] font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[var(--text-muted)]" />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {renderRoleBadge(u.role)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(u.status)}
                      </td>

                      {/* Affiliation / Domain */}
                      <td className="py-3.5 px-4 text-[var(--text-secondary)] max-w-xs truncate">
                        <div className="font-medium text-[var(--text-primary)] truncate">
                          {u.organizationName || u.affiliation || 'Independent'}
                        </div>
                        {u.specialty && (
                          <div className="text-[10px] text-[var(--text-muted)] truncate">
                            {u.specialty}
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Globe className="w-3 h-3 text-[var(--text-muted)]" />
                          <span>{u.city ? `${u.city}, ${u.country}` : u.country}</span>
                        </div>
                        {u.isDiaspora && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold text-[var(--text-accent)]">
                            ★ Diaspora
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 text-[11px] text-[var(--text-muted)] font-mono whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Profile */}
                          <button
                            type="button"
                            onClick={() => setViewingProfile(u)}
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            title="View Full Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active / Deactivate */}
                          {canModifyUser && u.role !== 'super_admin' && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded-lg border transition ${
                                u.status === 'active'
                                  ? 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                  : 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              }`}
                              title={u.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                            >
                              {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Edit User */}
                          {canModifyUser && (
                            <button
                              type="button"
                              onClick={() => openEditModal(u)}
                              className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                              title="Edit User"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete User */}
                          {canDeleteUser && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(u)}
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Delete User Permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="py-3 px-4 border-t border-[var(--border)] bg-[var(--bg-subtle)]/40 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div>
            Showing <strong className="text-[var(--text-primary)]">{users.length}</strong> of{' '}
            <strong className="text-[var(--text-primary)]">{totalCount}</strong> users
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE USER                                            */}
      {/* ------------------------------------------------------------- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold font-['Fraunces',serif] text-[var(--text-primary)] mb-1">
              Create New User Account
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Add an authorized scholar, university administrator, or platform staff member to the system.
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Dr. Amina Benali"
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@institution.dz"
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Initial Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Defaults to DZbridge2026!"
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs font-medium focus:outline-none focus:border-[var(--brand)]"
                  >
                    <option value="expert">Expert / Scholar</option>
                    <option value="organization">Organization / University</option>
                    {isSuperAdmin && <option value="admin">Admin</option>}
                    {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs font-medium focus:outline-none focus:border-[var(--brand)]"
                  >
                    <option value="active">Active</option>
                    <option value="pending_verification">Pending Verification</option>
                    <option value="suspended">Suspended</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Algiers, Oran, Boston..."
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Organization / Affiliation</label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  placeholder="e.g. ESI Algiers, MIT, Sonatrach"
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Domain / Specialty</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="e.g. Green Hydrogen, AI Hardware, Nanotechnology"
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-10 px-4 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-subtle)] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[var(--brand)] text-[var(--text-on-brand)] hover:bg-[var(--brand-hover)] text-xs font-semibold shadow-sm"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT USER                                              */}
      {/* ------------------------------------------------------------- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold font-['Fraunces',serif] text-[var(--text-primary)] mb-1">
              Edit User: {editingUser.fullName}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Update account information, role privileges, and affiliation details.
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Role</label>
                  <select
                    value={formData.role}
                    disabled={editingUser.role === 'super_admin' && !isSuperAdmin}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs font-medium focus:outline-none focus:border-[var(--brand)] disabled:opacity-50"
                  >
                    <option value="expert">Expert / Scholar</option>
                    <option value="organization">Organization / University</option>
                    {isSuperAdmin && <option value="admin">Admin</option>}
                    {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Status</label>
                  <select
                    value={formData.status}
                    disabled={editingUser.role === 'super_admin'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs font-medium focus:outline-none focus:border-[var(--brand)] disabled:opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="pending_verification">Pending Verification</option>
                    <option value="suspended">Suspended</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Organization Name</label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Specialty / Domain</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">Biography / Notes</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="h-10 px-4 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-subtle)] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[var(--brand)] text-[var(--text-on-brand)] hover:bg-[var(--brand-hover)] text-xs font-semibold shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: VIEW USER PROFILE                                      */}
      {/* ------------------------------------------------------------- */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--brand)] text-[var(--accent-gold)] font-bold text-base flex items-center justify-center shadow-md">
                  {viewingProfile.avatar || viewingProfile.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {viewingProfile.fullName}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-mono">
                    {viewingProfile.email}
                  </p>
                </div>
              </div>
              <div>{renderRoleBadge(viewingProfile.role)}</div>
            </div>

            <div className="space-y-3 py-3 border-y border-[var(--border)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Status:</span>
                <span>{renderStatusBadge(viewingProfile.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Organization:</span>
                <span className="font-semibold text-[var(--text-primary)] text-right">
                  {viewingProfile.organizationName || viewingProfile.affiliation || 'Independent'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Location:</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {viewingProfile.city ? `${viewingProfile.city}, ${viewingProfile.country}` : viewingProfile.country}
                  {viewingProfile.isDiaspora && ' (Diaspora)'}
                </span>
              </div>
              {viewingProfile.specialty && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Specialty:</span>
                  <span className="font-medium text-[var(--text-primary)]">{viewingProfile.specialty}</span>
                </div>
              )}
              {viewingProfile.bio && (
                <div className="pt-2">
                  <span className="block text-[var(--text-secondary)] mb-1">Biography:</span>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-subtle)] p-2.5 rounded-lg">
                    {viewingProfile.bio}
                  </p>
                </div>
              )}
              <div className="flex justify-between pt-1">
                <span className="text-[var(--text-secondary)]">Registered:</span>
                <span className="font-mono">{new Date(viewingProfile.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setViewingProfile(null)}
                className="h-9 px-4 rounded-xl bg-[var(--brand)] text-[var(--text-on-brand)] text-xs font-semibold hover:bg-[var(--brand-hover)] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE CONFIRMATION                                    */}
      {/* ------------------------------------------------------------- */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">
              Delete User Account?
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
              Are you sure you want to permanently delete <strong>{userToDelete.fullName}</strong> ({userToDelete.email})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="h-10 px-4 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-subtle)] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
