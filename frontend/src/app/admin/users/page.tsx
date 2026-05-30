'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import UserTable from '@/components/admin/UserTable';
import api from '@/lib/api';

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/users/index.php', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/users/index.php?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleUpdateRole = async (id: number, role: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.put('/users/index.php', { id, role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update user role');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Users</h1>
          <p className="text-gray-600">Manage authors and subscribers</p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white font-medium hover:shadow-lg transition-all"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Add User
        </Link>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B1E1E]"></div>
          </div>
        ) : (
          <UserTable 
            users={users} 
            onDelete={handleDelete} 
            onUpdateRole={handleUpdateRole}
            currentUserId={currentUser?.id}
          />
        )}
      </div>
    </div>
  );
}
