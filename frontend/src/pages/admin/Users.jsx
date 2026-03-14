import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users, Search, Plus, Edit, Trash2,
  Shield, ChefHat, Truck, User,
  CheckCircle, XCircle, Clock, RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../store';
import { Card, Button, Badge, LoadingSpinner, Input, Pagination } from '../../components/ui/BaseComponents';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [submitting, setSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const offset = (currentPage - 1) * pageSize;
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit: pageSize,
          offset: offset,
          role: filterRole !== 'all' ? filterRole : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          search: searchQuery || undefined,
        },
      });
      setUsers(response.data.rows || []);
      setTotalCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert(error.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize, filterRole, filterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      const response = await axios.patch(
        `${API_URL}/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = response.data.user;
      setUsers(users.map(u => u.id === userId ? { ...u, ...updatedUser } : u));
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '123456',
      role: 'customer',
    });
    setShowAddModal(true);
  };

  const openEditModal = (user) => {
    setFormData({
      name: user.name,
      phone: user.phone,
      email: user.email || '',
      password: '',
      role: user.role,
    });
    setEditingUser(user);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      role: 'customer',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      alert('Name and phone are required');
      return;
    }

    setSubmitting(true);
    let success = false;

    if (editingUser) {
      success = await handleUpdateUser(editingUser.id, formData);
    } else {
      success = await handleCreateUser(formData);
    }

    if (success) {
      closeModal();
      loadUsers();
    }
    setSubmitting(false);
  };

  const handleCreateUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/users`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newUser = response.data.user;
      setUsers([newUser, ...users]);
      return true;
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create user');
      return false;
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = response.data.user;
      setUsers(users.map(u => u.id === userId ? { ...u, ...updatedUser } : u));
      return true;
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update user');
      return false;
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const stats = {
    total: totalCount,
    admin: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => ['kitchen', 'driver'].includes(u.role)).length,
    customer: users.filter(u => u.role === 'customer').length,
    active: users.filter(u => u.status === 'active').length,
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-3.5 h-3.5" />;
      case 'kitchen': return <ChefHat className="w-3.5 h-3.5" />;
      case 'driver': return <Truck className="w-3.5 h-3.5" />;
      default: return <User className="w-3.5 h-3.5" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'kitchen': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'driver': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {totalCount} users total
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Add User</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <Card className="p-3 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-bold text-purple-600">{stats.admin}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Admin</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-bold text-orange-600">{stats.staff}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Staff</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-bold text-blue-600">{stats.customer}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Customer</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-bold text-green-600">{stats.active}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Active</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-bold text-gray-600 dark:text-gray-400">{stats.total - stats.active}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Inactive</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search name, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 py-2.5 text-sm"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-medium"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="kitchen">Kitchen</option>
          <option value="driver">Driver</option>
          <option value="customer">Customer</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-medium"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <Button variant="secondary" onClick={loadUsers}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Last Active
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.phone}
                          </p>
                          {user.email && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[150px]">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {getRoleIcon(user.role)}
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {user.status === 'active' ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(user.lastActive).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(user)}
                          className="p-1.5 h-auto"
                        >
                          <Edit className="w-4 h-4 text-primary" />
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 h-auto"
                          >
                            <Trash2 className="w-4 h-4 text-error" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-xs font-medium"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {totalCount} users
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                  className="py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone *
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="081234567890"
                  type="tel"
                  className="py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  type="email"
                  className="py-2.5 text-sm"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <Input
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password"
                    type="password"
                    className="py-2.5 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="driver">Driver</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={closeModal}
                className="flex-1 py-2.5 text-sm"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 py-2.5 text-sm"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (editingUser ? 'Save Changes' : 'Create User')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
