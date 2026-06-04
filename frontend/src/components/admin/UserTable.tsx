'use client';

import { useState } from 'react';
import { FiEdit2, FiTrash2, FiUser, FiCheck, FiX } from 'react-icons/fi';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  profile_picture?: string;
}

interface UserTableProps {
  users: User[];
  onDelete: (id: number) => void;
  onUpdateRole: (id: number, role: string) => void;
  currentUserId: number;
}

export default function UserTable({ users, onDelete, onUpdateRole, currentUserId }: UserTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleEditClick = (user: User) => {
    setEditingId(user.id);
    setSelectedRole(user.role);
  };

  const handleSaveRole = (userId: number) => {
    onUpdateRole(userId, selectedRole);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSelectedRole('');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 text-left text-sm font-semibold text-gray-500">
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Joined</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#0077b6] flex items-center justify-center text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                {editingId === user.id ? (
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/20 focus:border-[#00b4d8] text-gray-900 bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="author">Author</option>
                    <option value="contributor">Contributor</option>
                    <option value="subscriber">Subscriber</option>
                  </select>
                ) : (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'editor'
                        ? 'bg-cyan-100 text-[#00b4d8]'
                        : user.role === 'author'
                        ? 'bg-blue-100 text-blue-800'
                        : user.role === 'contributor'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center text-sm text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-600 mr-2"></span>
                  Active
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end space-x-2">
                  {editingId === user.id ? (
                    <>
                      <button
                        onClick={() => handleSaveRole(user.id)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        title="Save Role"
                      >
                        <FiCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Cancel"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                       {currentUserId !== user.id && (
                        <>
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Edit Role"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(user.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete User"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
