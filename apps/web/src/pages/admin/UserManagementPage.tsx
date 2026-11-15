import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, ShieldCheck, Search, Filter } from 'lucide-react';
import { User, UserRole } from '@eventsphere/shared';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/LoadingSkeleton';

export const UserManagementPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get<any[]>('/api/admin/users');
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    if (targetUserId === currentAdmin?.id) {
      error('You cannot change your own admin role');
      return;
    }

    setUpdatingId(targetUserId);
    try {
      const res = await api.patch(`/api/admin/users/${targetUserId}/role`, {
        role: newRole,
      });
      if (res.success) {
        success(`User role changed to ${newRole}`);
        fetchUsers();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          User & Role Governance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Promote organizers, assign platform administrators, and inspect member activity.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="participant">Participant</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Current Role</th>
                  <th className="py-4 px-6">Registrations</th>
                  <th className="py-4 px-6">Events Organized</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : u.role === 'organizer'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-semibold">
                      {u.total_registrations || 0}
                    </td>

                    <td className="py-4 px-6 font-semibold">
                      {u.total_events_organized || 0}
                    </td>

                    <td className="py-4 px-6 text-slate-500 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {u.id === currentAdmin?.id ? (
                        <span className="text-[10px] text-slate-400 italic">Current Session</span>
                      ) : (
                        <select
                          disabled={updatingId === u.id}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50"
                        >
                          <option value="participant">Participant</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
