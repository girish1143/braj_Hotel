'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Lock,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { StaffAccount, StaffRole, StaffDepartment, StaffStatus, StaffActivityLog } from './types';
import { API_BASE_URL } from '../../lib/api';

interface StaffManagementModuleProps {
  currentStaffRole: StaffRole;
  currentStaffName: string;
  hotelId: string;
  hotelName: string;
}

export default function StaffManagementModule({
  currentStaffRole,
  currentStaffName,
  hotelId,
  hotelName
}: StaffManagementModuleProps) {
  // Staff Directory State
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [activityLogs, setActivityLogs] = useState<StaffActivityLog[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    departmentCounts: {} as Record<string, number>,
    roleCounts: {} as Record<string, number>
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);

  // Success summary modal for newly created credentials
  const [newStaffSummary, setNewStaffSummary] = useState<{
    staff: StaffAccount;
    tempPassword: string;
  } | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Form State for Add New Staff
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    phone: '',
    department: 'Front Office' as StaffDepartment,
    position: '',
    username: '',
    temporaryPassword: '',
    role: 'Receptionist' as StaffRole,
    status: 'Active' as StaffStatus,
    joiningDate: new Date().toISOString().split('T')[0],
    requirePasswordChange: true
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch staff directory & metrics from backend
  const fetchStaffData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Directory
      const res = await fetch(`${API_BASE_URL}/hotel-admin/staff`);
      const data = await res.json();
      if (data.success && data.data) {
        setStaffList(data.data.staff || []);
      }

      // 2. Fetch Metrics
      const mRes = await fetch(`${API_BASE_URL}/hotel-admin/staff/metrics`);
      const mData = await mRes.json();
      if (mData.success && mData.data) {
        setMetrics(mData.data);
      }

      // 3. Fetch Activity Logs
      const aRes = await fetch(`${API_BASE_URL}/hotel-admin/staff/activity`);
      const aData = await aRes.json();
      if (aData.success && aData.data) {
        setActivityLogs(aData.data);
      }
    } catch (err) {
      console.error('Failed to load staff data from server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  // Filtered List
  const filteredStaff = staffList.filter(s => {
    const matchesSearch =
      !searchQuery ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.position.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
    const matchesRole = selectedRole === 'ALL' || s.role === selectedRole;
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  // Handle Create Staff Submit
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.username.trim() || !formData.position.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/hotel-admin/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-brijnidhi-role': currentStaffRole
        },
        body: JSON.stringify({
          ...formData,
          hotelId,
          hotelName
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create staff account.');
      }

      // Open Success Summary Modal
      setNewStaffSummary({
        staff: data.data.staff,
        tempPassword: data.data.generatedPassword
      });

      setIsAddModalOpen(false);
      // Reset form
      setFormData({
        fullName: '',
        employeeId: '',
        email: '',
        phone: '',
        department: 'Front Office',
        position: '',
        username: '',
        temporaryPassword: '',
        role: 'Receptionist',
        status: 'Active',
        joiningDate: new Date().toISOString().split('T')[0],
        requirePasswordChange: true
      });

      // Refresh list
      fetchStaffData();
    } catch (err: any) {
      setFormError(err.message || 'Creation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Status Toggle (Activate, Inactivate, Suspend)
  const handleUpdateStatus = async (staffId: string, newStatus: StaffStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/hotel-admin/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchStaffData();
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  // Handle Admin Reset Password
  const handleResetPassword = async (staff: StaffAccount) => {
    const confirm = window.confirm(`Reset temporary password for ${staff.fullName} (${staff.employeeId})?`);
    if (!confirm) return;

    try {
      const res = await fetch(`${API_BASE_URL}/hotel-admin/staff/${staff.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setNewStaffSummary({
          staff,
          tempPassword: data.data.newTemporaryPassword
        });
      }
    } catch (err) {
      alert('Password reset failed.');
    }
  };

  // Copy credentials helper
  const handleCopyCredentials = () => {
    if (!newStaffSummary) return;
    const text = `🏨 Brijnidhi Hotel Workstation Credentials\nHotel: ${hotelName}\nEmployee: ${newStaffSummary.staff.fullName} (${newStaffSummary.staff.employeeId})\nRole: ${newStaffSummary.staff.role} (${newStaffSummary.staff.department})\nUsername: ${newStaffSummary.staff.username}\nTemporary Password: ${newStaffSummary.tempPassword}\nPortal Login URL: http://localhost:3000/hotel-admin\nNote: You will be required to change your password upon your first sign in.`;
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const getRoleBadgeColor = (role: StaffRole) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Manager':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Receptionist':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Housekeeping':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Accountant':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300';
      case 'Restaurant Staff':
        return 'bg-orange-100 text-orange-900 border-orange-300';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  const getStatusBadge = (status: StaffStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-300">
            Inactive
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
            Suspended
          </span>
        );
    }
  };

  const isAdmin = currentStaffRole === 'Admin';

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-amber-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
              🏛️ Staff & RBAC Security Module
            </span>
            <span className="text-xs text-neutral-500">
              {hotelName}
            </span>
          </div>
          <h2 className="text-2xl font-serif font-black text-neutral-900">
            Staff Management & Access Control
          </h2>
          <p className="text-xs text-neutral-600">
            Authorized administrator directory for provisioning hotel personnel, managing role permissions, and auditing login activity.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setIsAddModalOpen(true);
              setFormError('');
            }}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition transform active:scale-95 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Staff Account</span>
          </button>
        )}
      </div>

      {/* METRIC CARDS (Prompt Section 5) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider block">
              Total Staff Members
            </span>
            <span className="text-3xl font-black text-neutral-900 font-mono mt-1 block">
              {metrics.total || staffList.length}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Across all departments</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Accounts */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider block">
              Active Accounts
            </span>
            <span className="text-3xl font-black text-emerald-700 font-mono mt-1 block">
              {metrics.active || staffList.filter(s => s.status === 'Active').length}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Ready for workstation duty</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Inactive Accounts */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider block">
              Inactive Accounts
            </span>
            <span className="text-3xl font-black text-neutral-600 font-mono mt-1 block">
              {metrics.inactive || staffList.filter(s => s.status === 'Inactive').length}
            </span>
            <span className="text-[11px] text-neutral-500 font-medium">Off duty or on leave</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Suspended Accounts */}
        <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider block">
              Suspended Accounts
            </span>
            <span className="text-3xl font-black text-rose-700 font-mono mt-1 block">
              {metrics.suspended || staffList.filter(s => s.status === 'Suspended').length}
            </span>
            <span className="text-[11px] text-rose-600 font-medium">Access blocked by Admin</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Universal Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by staff name, employee ID, email, username, or position..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#fcf9f2] border border-amber-300 text-xs text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-amber-600 transition"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-[#fcf9f2] border border-amber-300 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-amber-600"
          >
            <option value="ALL">All Departments</option>
            <option value="Front Office">Front Office</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Accounts & Finance">Accounts & Finance</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Operations & Management">Operations & Management</option>
            <option value="Administration">Administration</option>
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-[#fcf9f2] border border-amber-300 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-amber-600"
          >
            <option value="ALL">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Accountant">Accountant</option>
            <option value="Restaurant Staff">Restaurant Staff</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-[#fcf9f2] border border-amber-300 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-amber-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>

          <button
            type="button"
            onClick={fetchStaffData}
            className="p-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition"
            title="Refresh Directory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STAFF DIRECTORY TABLE */}
      <div className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-700">
            <thead className="bg-[#fcf9f2] border-b border-amber-200 text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Department & Position</th>
                <th className="py-3.5 px-4">System Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-600 mb-2" />
                    <span>Loading verified staff directory...</span>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-neutral-500">
                    <Users className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="font-bold text-sm text-neutral-700">No staff members match the selected filters.</p>
                    <p className="text-xs text-neutral-400 mt-1">Try resetting search filters or click &apos;Add New Staff Account&apos;.</p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map(staff => (
                  <tr key={staff.id} className="hover:bg-amber-50/50 transition">
                    {/* Staff Member & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-amber-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                          {staff.fullName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-900 block text-xs">
                            {staff.fullName}
                          </span>
                          <span className="text-[11px] text-neutral-500 font-mono block">
                            @{staff.username} • {staff.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-900">
                      <span className="bg-amber-100/70 border border-amber-300/80 px-2.5 py-1 rounded-lg">
                        {staff.employeeId}
                      </span>
                    </td>

                    {/* Department & Position */}
                    <td className="py-3.5 px-4">
                      <span className="text-neutral-900 font-semibold block">
                        {staff.position}
                      </span>
                      <span className="text-[11px] text-neutral-500 block">
                        {staff.department}
                      </span>
                    </td>

                    {/* System Role Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRoleBadgeColor(staff.role)}`}>
                        {staff.role}
                      </span>
                    </td>

                    {/* Account Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(staff.status)}
                    </td>

                    {/* Joining Date */}
                    <td className="py-3.5 px-4 text-neutral-600 font-mono text-[11px]">
                      {staff.joiningDate}
                    </td>

                    {/* Admin Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        {isAdmin ? (
                          <>
                            {/* Reset Password */}
                            <button
                              type="button"
                              onClick={() => handleResetPassword(staff)}
                              className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-100 transition"
                              title="Reset Password & Issue Temporary Credentials"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Status Toggles */}
                            {staff.status === 'Active' ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(staff.id, 'Inactive')}
                                className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-bold transition"
                                title="Deactivate account"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(staff.id, 'Active')}
                                className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold transition"
                                title="Activate account"
                              >
                                Activate
                              </button>
                            )}

                            {staff.status !== 'Suspended' ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(staff.id, 'Suspended')}
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold transition"
                                title="Suspend account"
                              >
                                Suspend
                              </button>
                            ) : null}
                          </>
                        ) : (
                          <span className="text-[10px] text-neutral-400 italic">Read-only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT STAFF ACTIVITY & LOGIN HISTORY LOG (Prompt Section 5) */}
      <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-700" />
            <h3 className="text-sm font-serif font-black text-neutral-900">
              Recent Staff Activity & Security Audit Trail
            </h3>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">
            {activityLogs.length} Events Logged
          </span>
        </div>

        <div className="divide-y divide-neutral-100 max-h-56 overflow-y-auto">
          {activityLogs.map(log => (
            <div key={log.id} className="py-2.5 flex items-start justify-between text-xs gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-neutral-900">{log.staffName}</span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    log.status === 'SUCCESS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : log.status === 'WARNING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {log.action}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600">{log.details}</p>
              </div>
              <div className="text-right shrink-0 text-[10px] text-neutral-400 font-mono">
                <span>{log.timestamp}</span>
                <span className="block text-[9px] text-neutral-400">IP: {log.ip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD NEW STAFF MODAL (Prompt Section 3) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative border border-amber-200 space-y-5 max-h-[90vh] overflow-y-auto text-neutral-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Admin Workstation
                </span>
                <h3 className="font-serif font-black text-2xl text-neutral-900 mt-1">
                  Create New Staff Account
                </h3>
                <p className="text-xs text-neutral-600">
                  Fill in employee profile and assign role permissions. Password will be securely hashed with salt.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="text-neutral-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Radhika Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 bg-[#fcf9f2]"
                  />
                </div>

                {/* Employee ID */}
                <div>
                  <label className="text-neutral-700 block mb-1">
                    Employee ID <span className="text-neutral-400 font-normal">(Leave empty to auto-generate)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="e.g. EMP-VRN-108"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 bg-[#fcf9f2] font-mono"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-neutral-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="radhika@brijnidhi.org"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 bg-[#fcf9f2]"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-neutral-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 bg-[#fcf9f2]"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="text-neutral-700 block mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value as StaffDepartment })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 bg-[#fcf9f2]"
                  >
                    <option value="Front Office">Front Office</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Accounts & Finance">Accounts & Finance</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Operations & Management">Operations & Management</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                {/* Job Position */}
                <div>
                  <label className="text-neutral-700 block mb-1">Job Position *</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g. Front Desk Lead or Night Auditor"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 bg-[#fcf9f2]"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="text-neutral-700 block mb-1">Login Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. radhika.s"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 bg-[#fcf9f2] font-mono"
                  />
                </div>

                {/* System Role */}
                <div>
                  <label className="text-neutral-700 block mb-1">Assigned Role (RBAC) *</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as StaffRole })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 bg-[#fcf9f2]"
                  >
                    <option value="Receptionist">Receptionist (Front Desk, Check-Ins, Folios)</option>
                    <option value="Manager">Manager (Operations, Room Matrix, Reports)</option>
                    <option value="Housekeeping">Housekeeping (Room Cleaning & Maintenance)</option>
                    <option value="Accountant">Accountant (Billing, Cash Registers, Invoices)</option>
                    <option value="Restaurant Staff">Restaurant Staff (Bhojan Dining Orders)</option>
                    <option value="Admin">Admin (Full System & Staff Creation Access)</option>
                  </select>
                </div>

                {/* Joining Date */}
                <div>
                  <label className="text-neutral-700 block mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 bg-[#fcf9f2]"
                  />
                </div>

                {/* Custom Temporary Password */}
                <div>
                  <label className="text-neutral-700 block mb-1">
                    Temporary Password <span className="text-neutral-400 font-normal">(Leave empty to auto-generate)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.temporaryPassword}
                    onChange={e => setFormData({ ...formData, temporaryPassword: e.target.value })}
                    placeholder="Auto-generated strong password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 bg-[#fcf9f2] font-mono"
                  />
                </div>
              </div>

              {/* Checkbox: First Login Password Change */}
              <div className="pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-neutral-700 font-medium bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <input
                    type="checkbox"
                    checked={formData.requirePasswordChange}
                    onChange={e => setFormData({ ...formData, requirePasswordChange: e.target.checked })}
                    className="rounded border-amber-400 text-amber-600 focus:ring-0"
                  />
                  <span>
                    <strong>Require password reset on first login</strong> (Recommended by OWASP Security Standards)
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center space-x-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Hashing & Provisioning...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Staff Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIALS SUCCESS SUMMARY MODAL (Prompt Section 3: Step 7) */}
      {newStaffSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-emerald-300 space-y-5 text-neutral-900">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-7 h-7" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Account Provisioned Successfully
              </span>
              <h3 className="font-serif font-black text-2xl text-neutral-900 mt-1">
                Staff Credentials Issued
              </h3>
              <p className="text-xs text-neutral-600">
                Provide these secure workstation login credentials to the employee. They will be required to change their password on first sign-in.
              </p>
            </div>

            {/* Credential Card */}
            <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-2.5 font-mono text-xs">
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Employee Name:</span>
                <span className="font-bold text-amber-400">{newStaffSummary.staff.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Employee ID:</span>
                <span className="font-bold text-white">{newStaffSummary.staff.employeeId}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">System Role:</span>
                <span className="font-bold text-emerald-400">{newStaffSummary.staff.role}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Username:</span>
                <span className="font-bold text-amber-300">{newStaffSummary.staff.username}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-neutral-400">Temporary Password:</span>
                <span className="font-black text-amber-400 text-sm">{newStaffSummary.tempPassword}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-md cursor-pointer"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Credentials Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Login Credentials for Staff</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setNewStaffSummary(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-100 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
