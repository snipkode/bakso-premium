import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, Plus, Edit, Trash2, MoreVertical, 
  Shield, ChefHat, Truck, User, Phone, Mail, 
  CheckCircle, XCircle, Clock, Filter, RefreshCw 
} from 'lucide-react';
import { useAuthStore } from '../../store';
import { Card, Button, Badge, LoadingSpinner, Input } from '../../components/ui/BaseComponents';

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

  // Mock data for now (will be replaced with API)
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    // TODO: Replace with API call
    // const response = await api.get('/users');
    // setUsers(response.data.users);
    
    // Mock data for demonstration
    setUsers([
      {
        id: '1',
        name: 'Admin User',
        phone: '081234567890',
        email: 'admin@bakso.com',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-01',
        lastActive: '2024-03-14',
      },
      {
        id: '2',
        name: 'Kitchen Staff',
        phone: '081234567891',
        email: 'kitchen@bakso.com',
        role: 'kitchen',
        status: 'active',
        createdAt: '2024-01-02',
        lastActive: '2024-03-14',
      },
      {
        id: '3',
        name: 'Driver One',
        phone: '081234567892',
        email: 'driver@bakso.com',
        role: 'driver',
        status: 'active',
        createdAt: '2024-01-03',
        lastActive: '2024-03-14',
      },
      {
        id: '4',
        name: 'John Customer',
        phone: '081234567893',
        email: 'john@example.com',
        role: 'customer',
        status: 'active',
        createdAt: '2024-02-01',
        lastActive: '2024-03-13',
      },
      {
        id: '5',
        name: 'Jane Customer',
        phone: '081234567894',
        email: 'jane@example.com',
        role: 'customer',
        status: 'inactive',
        createdAt: '2024-02-02',
        lastActive: '2024-02-15',
      },
    ]);
    setLoading(false);
  };

  const handleToggleStatus = (userId, currentStatus) => {
    // TODO: API call to toggle status
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  };

  const handleDeleteUser = (userId) => {
    if (!confirm('Delete this user?')) return;
    // TODO: API call to delete user
    setUsers(users.filter(u => u.id !== userId));
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === 'all' || user.role === filterRole;
    const matchStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => ['kitchen', 'driver'].includes(u.role)).length,
    customer: users.filter(u => u.role === 'customer').length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'kitchen': return <ChefHat className="w-4 h-4" />;
      case 'driver': return <Truck className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-purple-500" />
            <span className="text-xs text-gray-500">Admin</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.admin}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 text-orange-500">
              <ChefHat className="w-5 h-5" />
            </div>
            <span className="text-xs text-gray-500">Staff</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.staff}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-gray-500">Customer</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.customer}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-xs text-gray-500">Active</span>
          </div>
          <p className="text-2xl font-bold text-success">{stats.active}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-error" />
            <span className="text-xs text-gray-500">Inactive</span>
          </div>
          <p className="text-2xl font-bold text-error">{stats.inactive}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <Button variant="secondary" onClick={loadUsers}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.phone}
                          </p>
                          {user.email && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {new Date(user.lastActive).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className="p-2 h-auto"
                        >
                          {user.status === 'active' ? (
                            <XCircle className="w-4 h-4 text-warning" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-success" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                          className="p-2 h-auto"
                        >
                          <Edit className="w-4 h-4 text-primary" />
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 h-auto"
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

      {/* Add/Edit Modal Placeholder */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input 
                  defaultValue={editingUser?.name} 
                  placeholder="Full name" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input 
                  defaultValue={editingUser?.phone} 
                  placeholder="081234567890" 
                  type="tel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input 
                  defaultValue={editingUser?.email} 
                  placeholder="email@example.com" 
                  type="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select 
                  defaultValue={editingUser?.role || 'customer'}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="driver">Driver</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => { setShowAddModal(false); setEditingUser(null); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => { 
                  // TODO: Save user
                  setShowAddModal(false); 
                  setEditingUser(null);
                  loadUsers();
                }}
                className="flex-1"
              >
                {editingUser ? 'Save Changes' : 'Create User'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
