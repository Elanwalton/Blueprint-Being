import Link from 'next/link';
import { FiEdit, FiTrash2, FiEye, FiMessageCircle } from 'react-icons/fi';

interface Post {
  id: number;
  title: string;
  slug: string;
  status: string;
  view_count: number;
  comment_count: number;
  word_count?: number;
  created_at: string;
  category?: { name: string };
}

interface PostTableProps {
  posts: Post[];
  onDelete: (id: number) => void;
  activeFilter?: string;
  onFilterChange?: (status: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-purple-100 text-purple-800',
  trashed: 'bg-red-100 text-red-700',
};

const STATUS_TABS = ['all', 'published', 'draft', 'pending', 'scheduled', 'trashed'];

export default function PostTable({ posts, onDelete, activeFilter = 'all', onFilterChange }: PostTableProps) {
  const handleDelete = (id: number, title: string) => {
    if (confirm(`Move "${title}" to trash?`)) {
      onDelete(id);
    }
  };

  return (
    <div>
      {/* Status filter tabs */}
      {onFilterChange && (
        <div className="flex items-center space-x-1 mb-4 overflow-x-auto pb-1">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => onFilterChange(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all capitalize ${
                activeFilter === s
                  ? 'bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s === 'all' ? 'All Posts' : s}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Words</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{post.title}</div>
                  <div className="text-xs text-gray-400 font-mono">{post.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {post.category?.name || 'Uncategorized'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full capitalize ${STATUS_COLORS[post.status] || 'bg-gray-100 text-gray-700'}`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {post.word_count ? post.word_count.toLocaleString() : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex items-center">
                    <FiEye className="w-4 h-4 mr-1 text-gray-400" />
                    {post.view_count}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {post.status !== 'trashed' && (
                      <Link href={`/blog/${post.slug}`} target="_blank" className="text-gray-500 hover:text-gray-800 transition-colors" title="View">
                        <FiEye className="w-5 h-5" />
                      </Link>
                    )}
                    <Link href={`/admin/posts/edit/${post.id}`} className="text-[#00b4d8] hover:text-[#0077b6] transition-colors" title="Edit">
                      <FiEdit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Move to Trash"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No {activeFilter !== 'all' ? activeFilter : ''} posts found</p>
          </div>
        )}
      </div>
    </div>
  );
}
