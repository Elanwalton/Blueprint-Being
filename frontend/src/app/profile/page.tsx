'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiEdit2, FiSave, FiX, FiLock, FiCalendar } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.username || '',
        email: parsedUser.email || '',
        bio: parsedUser.bio || '',
      });
    }
  }, []);

  const handleSave = () => {
    // Update user data
    const updatedUser = { ...user, ...formData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile</p>
          <a
            href="/login"
            className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white hover:shadow-xl hover:shadow-[#8B1E1E]/30 transition-all duration-300 font-medium"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-[#8B1E1E] via-[#A73030] to-[#C74D4D] text-white py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            <span className="text-4xl font-bold">{user.username?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
            {user.username}
          </h1>
          <p className="text-white/90">{user.role}</p>
        </div>
      </section>

      {/* Profile Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="glass-strong rounded-3xl p-8 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-gray-900">Profile Information</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white hover:shadow-xl hover:shadow-[#8B1E1E]/30 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <FiEdit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl transition-all duration-300"
                >
                  <FiSave className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: user.username || '',
                      email: user.email || '',
                      bio: user.bio || '',
                    });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-300"
                >
                  <FiX className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] flex items-center justify-center flex-shrink-0">
                  <FiUser className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
                  <p className="text-lg font-medium">{user.username}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] flex items-center justify-center flex-shrink-0">
                  <FiMail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                  <p className="text-lg font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] flex items-center justify-center flex-shrink-0">
                  <FiCalendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Member Since</h3>
                  <p className="text-lg font-medium">{new Date(user.created_at || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>

              {user.bio && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Bio</h3>
                  <p className="text-gray-700">{user.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card-premium p-6 text-center">
            <div className="text-3xl font-display font-bold text-[#8B1E1E] mb-2">0</div>
            <p className="text-gray-600">Posts Published</p>
          </div>
          <div className="card-premium p-6 text-center">
            <div className="text-3xl font-display font-bold text-[#8B1E1E] mb-2">0</div>
            <p className="text-gray-600">Comments</p>
          </div>
          <div className="card-premium p-6 text-center">
            <div className="text-3xl font-display font-bold text-[#8B1E1E] mb-2">0</div>
            <p className="text-gray-600">Likes Received</p>
          </div>
        </div>
      </section>
    </div>
  );
}
