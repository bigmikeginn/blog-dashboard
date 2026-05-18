import React, { useState, useEffect } from 'react';

export default function Dashboard({ clientId }) {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchBlogs();
    const interval = setInterval(fetchBlogs, 10000);
    return () => clearInterval(interval);
  }, [clientId]);

  const fetchBlogs = async () => {
    try {
      const resp = await fetch(`/api/blogs?client=${clientId}`);
      const data = await resp.json();
      setBlogs(data.blogs || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setLoading(false);
    }
  };

  const handleApprove = async (blog) => {
    setStatus('Approving...');
    try {
      const resp = await fetch(`/api/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogId: blog.id,
          client: clientId
        })
      });

      if (resp.ok) {
        setStatus('✅ Blog published!');
        setSelectedBlog(null);
        setTimeout(() => {
          fetchBlogs();
          setStatus('');
        }, 1000);
      } else {
        setStatus('❌ Approval failed');
      }
    } catch (err) {
      setStatus('❌ Error: ' + err.message);
    }
  };

  const handleReject = async (blog) => {
    setStatus('Rejecting...');
    try {
      const resp = await fetch(`/api/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogId: blog.id,
          client: clientId
        })
      });

      if (resp.ok) {
        setStatus('✅ Blog rejected and marked for revision');
        setSelectedBlog(null);
        setTimeout(() => {
          fetchBlogs();
          setStatus('');
        }, 1000);
      }
    } catch (err) {
      setStatus('❌ Error: ' + err.message);
    }
  };

  const pending = blogs.filter(b => b.status === 'pending');
  const published = blogs.filter(b => b.status === 'published');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            📝 Blog Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Review and approve your automatically generated blog posts</p>
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div className={`max-w-7xl mx-auto mb-6 p-4 rounded-lg font-semibold ${
          status.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {status}
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8">
        {/* Pending Blogs */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-lg border-2 border-indigo-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <h2 className="text-2xl font-bold text-white">
                ⏳ Waiting for Approval ({pending.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading...</div>
            ) : pending.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg mb-2">✨ No pending blogs</p>
                <p className="text-sm">Your new blog posts will appear here for review</p>
              </div>
            ) : (
              <div className="divide-y">
                {pending.map(blog => (
                  <div
                    key={blog.id}
                    onClick={() => setSelectedBlog(blog)}
                    className={`p-6 cursor-pointer transition-all hover:bg-indigo-50 border-l-4 ${
                      selectedBlog?.id === blog.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-transparent'
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{blog.slug}</h3>
                    <p className="text-sm text-gray-600 mb-3">{blog.content.substring(0, 100)}...</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Generated: {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600">Click to preview →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Blog Preview */}
        <div>
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-100 sticky top-8 overflow-hidden">
            {selectedBlog ? (
              <>
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                  <h3 className="text-xl font-bold text-white">Preview</h3>
                </div>

                <div className="p-6">
                  {/* Blog Image */}
                  {selectedBlog.imageUrl && (
                    <img
                      src={selectedBlog.imageUrl}
                      alt="Blog header"
                      className="w-full h-48 object-cover rounded-lg mb-6 border border-gray-200"
                    />
                  )}

                  {/* Blog Title */}
                  <h4 className="text-lg font-bold text-gray-800 mb-4">{selectedBlog.slug}</h4>

                  {/* Blog Content Preview */}
                  <div className="prose prose-sm max-w-none mb-6">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {selectedBlog.content.substring(0, 200)}...
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="text-xs text-gray-500 mb-6 pb-6 border-b">
                    <p>📅 {new Date(selectedBlog.createdAt).toLocaleDateString()}</p>
                    <p>📄 {Math.ceil(selectedBlog.content.length / 5)} words</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleApprove(selectedBlog)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md"
                    >
                      ✅ Approve & Publish
                    </button>
                    <button
                      onClick={() => handleReject(selectedBlog)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md"
                    >
                      📝 Request Changes
                    </button>
                    <button
                      onClick={() => setSelectedBlog(null)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg mb-2">👈 Select a blog to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Published Section */}
      {published.length > 0 && (
        <div className="max-w-7xl mx-auto mt-12">
          <div className="bg-white rounded-xl shadow-lg border-2 border-green-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
              <h2 className="text-2xl font-bold text-white">
                ✅ Published ({published.length})
              </h2>
            </div>

            <div className="divide-y">
              {published.slice(-5).map(blog => (
                <div key={blog.id} className="p-6 hover:bg-green-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{blog.slug}</h3>
                      <p className="text-sm text-gray-600">
                        Published: {new Date(blog.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-green-600 font-bold">✓ Live</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 text-center text-gray-600 text-sm">
        <p>Auto-refreshing every 10 seconds • Powered by AI + n8n</p>
      </div>
    </div>
  );
}
