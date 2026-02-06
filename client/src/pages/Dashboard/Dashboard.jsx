import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../contexts/DashboardContext";
import { useBlog } from "../../contexts/BlogContext";
import { useToast } from "../../components/ui/use-toast";
import { format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    authorStats,
    authorBlogsData,
    loading: dashboardLoading,
    getAuthorStats,
    getAuthorBlogs,
    analytics,
    getAnalytics,
  } = useDashboard();

  const { deleteBlog, togglePublishStatus, loading: blogLoading } = useBlog();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");

  const loading = dashboardLoading || blogLoading;
  const [analyticsPeriod, setAnalyticsPeriod] = useState("30d");

  useEffect(() => {
    // ... existing useEffect ...
    getAnalytics(analyticsPeriod);
  }, [analyticsPeriod]);

  useEffect(() => {
    getAuthorStats();
    fetchBlogs();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [page, limit, statusFilter]);

  const fetchBlogs = () => {
    getAuthorBlogs({
      page,
      limit,
      status: statusFilter === "all" ? undefined : statusFilter,
    });
  };

  const handleDelete = async (blogId) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await deleteBlog(blogId);
        toast({
          variant: "success",
          title: "Blog deleted successfully",
        });
        fetchBlogs();
        getAuthorStats();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to delete blog",
          description: error.message,
        });
      }
    }
  };

  const handleTogglePublish = async (blogId, currentStatus) => {
    try {
      await togglePublishStatus(blogId);
      toast({
        variant: "success",
        title: `Blog ${
          currentStatus ? "unpublished" : "published"
        } successfully`,
      });
      fetchBlogs();
      getAuthorStats();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: error.message,
      });
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            Total Blogs
          </h3>
          <p className="text-3xl font-bold">
            {dashboardLoading ? "..." : authorStats.overview.totalBlogs}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-2">Published</h3>
          <p className="text-3xl font-bold text-green-600">
            {dashboardLoading ? "..." : authorStats.overview.publishedBlogs}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-2">Drafts</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {dashboardLoading ? "..." : authorStats.overview.draftBlogs}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-2">Views</h3>
          <p className="text-3xl font-bold text-blue-600">
            {dashboardLoading ? "..." : authorStats.overview.totalViews}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-2">Followers</h3>
          <p className="text-3xl font-bold text-purple-600">
            {dashboardLoading ? "..." : authorStats.overview.totalFollowers}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-2">Following</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {dashboardLoading ? "..." : authorStats.overview.totalFollowing}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            Engagement Rate
          </h3>
          <p className="text-3xl font-bold text-pink-600">
            {dashboardLoading
              ? "..."
              : `${authorStats.engagement.engagementRate.toFixed(1)}%`}
          </p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Analytics</h2>
          <select
            value={analyticsPeriod}
            onChange={(e) => setAnalyticsPeriod(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        <div className="p-6">
          {loading && !analytics ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Traffic Overview</h3>
                <div className="space-y-4">
                  {analytics.views && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Views</span>
                        <span className="font-medium">
                          {analytics.views.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              analytics.views.total / 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {analytics.engagement && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Engagement Rate</span>
                        <span className="font-medium">
                          {analytics.engagement.rate?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${analytics.engagement.rate || 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Top Content</h3>
                <ul className="space-y-3">
                  {analytics.topContent?.slice(0, 5).map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="truncate max-w-[70%]">{item.title}</span>
                      <span className="font-medium">{item.views} views</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No analytics data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Blogs Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Your Blogs</h2>
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
            <button
              onClick={() => navigate("/blog/new")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create New Blog
            </button>
          </div>
        </div>

        {/* Blog Cards Grid */}
        <div className="p-6">
          {loading && authorBlogsData.docs.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading blogs...</p>
            </div>
          ) : authorBlogsData.docs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authorBlogsData.docs.map((blog) => {
                const createdAt = format(
                  new Date(blog.createdAt),
                  "MMM d, yyyy"
                );
                const updatedAt = blog.updatedAt
                  ? format(new Date(blog.updatedAt), "MMM d, yyyy")
                  : null;

                return (
                  <div
                    key={blog._id}
                    className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                            {blog.title}
                          </h3>
                        </div>
                        {blog.thumbnail && (
                          <div className="ml-4 flex-shrink-0">
                            <img
                              src={blog.thumbnail}
                              alt={blog.title}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[3rem]">
                        {blog.description || "No description available"}
                      </p>

                      <div className="flex justify-between text-xs text-gray-500 mb-4">
                        <div>
                          <span className="font-medium">
                            Created: {createdAt}
                          </span>
                          {updatedAt && updatedAt !== createdAt && (
                            <span className="ml-2 block sm:inline-block mt-1 sm:mt-0">
                              Updated: {updatedAt}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <span className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            {blog.views || 0}
                          </span>
                          <span className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                              />
                            </svg>
                            {blog.commentCount || 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            blog.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {blog.isPublished ? "Published" : "Draft"}
                        </span>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/blogs/edit/${blog._id}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleTogglePublish(blog._id, blog.isPublished)
                            }
                            className={`text-sm ${
                              blog.isPublished
                                ? "text-yellow-600 hover:text-yellow-800"
                                : "text-green-600 hover:text-green-800"
                            }`}
                          >
                            {blog.isPublished ? "Unpublish" : "Publish"}
                          </button>
                          <button
                            onClick={() => handleDelete(blog._id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No blogs found</p>
              <button
                onClick={() => navigate("/blog/new")}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Your First Blog
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {authorBlogsData.pages > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(page * limit, authorBlogsData.total)}
              </span>{" "}
              of <span className="font-medium">{authorBlogsData.total}</span>{" "}
              results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded ${
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= authorBlogsData.pages}
                className={`px-4 py-2 rounded ${
                  page >= authorBlogsData.pages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
