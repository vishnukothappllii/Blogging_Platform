"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBlog } from "../contexts/BlogContext";
import { useToast } from "../components/ui/use-toast";
import QuillEditor from "../components/editor/QuillEditor";
import ImageUploader from "../components/common/ImageUploader";
import { format } from "date-fns";

const BlogEditor = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    currentBlog,
    blogs,
    getBlogById,
    getAllBlogs,
    setCurrentBlog,
    publishBlog,
    updateBlog,
    loading,
    error,
  } = useBlog();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    tags: "",
    thumbnail: null,
  });

  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const isEditing = !!blogId;

  // Load blog data when editing
  useEffect(() => {
    if (blogId && !currentBlog) {
      getBlogById(blogId).catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load blog data",
        });
        navigate("/dashboard");
      });
    }
  }, [blogId, currentBlog, getBlogById, toast, navigate]);

  // Load related blogs for suggestions
  useEffect(() => {
    if (isEditing && blogs.length === 0) {
      getAllBlogs({ limit: 100 }).catch(() => {
        console.warn("Failed to load related content suggestions");
      });
    }
  }, [isEditing, blogs.length, getAllBlogs]);

  // Populate form when editing
  useEffect(() => {
    if (isEditing && currentBlog && currentBlog._id === blogId) {
      setFormData({
        title: currentBlog.title || "",
        description: currentBlog.description || "",
        content: currentBlog.content || "",
        tags: currentBlog.tags?.join(", ") || "",
        thumbnail: null,
      });

      if (currentBlog.thumbnail) {
        setThumbnailPreview(currentBlog.thumbnail);
      }
    }
  }, [currentBlog, isEditing, blogId]);

  // Update related blogs based on tags
  const updateRelatedBlogs = useCallback(() => {
    if (blogs.length > 0 && formData.tags) {
      try {
        const currentTags = formData.tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag !== "");

        const related = blogs
          .filter(
            (blog) =>
              blog._id !== blogId &&
              blog.tags?.some((tag) => currentTags.includes(tag.toLowerCase()))
          )
          .slice(0, 3);

        setRelatedBlogs(related);
      } catch (error) {
        console.error("Error processing tags:", error);
        setRelatedBlogs([]);
      }
    } else {
      setRelatedBlogs([]);
    }
  }, [blogs, formData.tags, blogId]);

  useEffect(() => {
    updateRelatedBlogs();
  }, [updateRelatedBlogs]);

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.content.trim()) {
      errors.content = "Content is required";
    }

    if (!isEditing && !formData.thumbnail) {
      errors.thumbnail = "Thumbnail is required for new blogs";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));

    // Clear content error when user starts typing
    if (formErrors.content) {
      setFormErrors((prev) => ({ ...prev, content: "" }));
    }
  };

  const handleThumbnailChange = (file) => {
    setFormData((prev) => ({ ...prev, thumbnail: file }));
    setThumbnailPreview(URL.createObjectURL(file));

    // Clear thumbnail error when file is selected
    if (formErrors.thumbnail) {
      setFormErrors((prev) => ({ ...prev, thumbnail: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent double submission

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Please fix the errors below",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const blogData = new FormData();
      blogData.append("title", formData.title.trim());
      blogData.append("description", formData.description.trim());
      blogData.append("content", formData.content.trim());
      blogData.append("tags", formData.tags.trim());

      if (formData.thumbnail) {
        blogData.append("thumbnail", formData.thumbnail);
      }

      if (isEditing) {
        await updateBlog(blogId, blogData);
        toast({
          variant: "success",
          title: "Blog updated successfully",
        });
      } else {
        await publishBlog(blogData);
        toast({
          variant: "success",
          title: "Blog published successfully",
        });
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        variant: "destructive",
        title: isEditing ? "Failed to update blog" : "Failed to publish blog",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (loading && !currentBlog && isEditing) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading blog data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Blog" : "Create New Blog"}
        </h1>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="blog-form"
            disabled={isSubmitting || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                {isEditing ? "Updating..." : "Publishing..."}
              </>
            ) : (
              <>{isEditing ? "Update Blog" : "Publish Blog"}</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form id="blog-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <label htmlFor="title" className="block font-medium mb-2">
                Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter blog title"
                className={`w-full border rounded px-3 py-2 ${
                  formErrors.title ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              {formErrors.title && (
                <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block font-medium mb-2">
                Short Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief preview of your blog"
                className={`w-full border rounded px-3 py-2 min-h-[100px] ${
                  formErrors.description ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.description}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="content" className="block font-medium mb-2">
                Content *
              </label>
              <div
                className={
                  formErrors.content ? "border border-red-500 rounded" : ""
                }
              >
                <QuillEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Write your blog content here..."
                  readOnly={isSubmitting}
                />
              </div>
              {formErrors.content && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.content}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="thumbnail" className="block font-medium mb-2">
                Thumbnail {!isEditing && "*"}
              </label>
              <ImageUploader
                id="thumbnail"
                onFileChange={handleThumbnailChange}
                previewUrl={thumbnailPreview}
                disabled={isSubmitting}
              />
              {formErrors.thumbnail && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.thumbnail}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Recommended size: 1200x630 pixels
              </p>
            </div>

            <div>
              <label htmlFor="tags" className="block font-medium mb-2">
                Tags
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleChange}
                placeholder="tag1, tag2, tag3"
                className="w-full border border-gray-300 rounded px-3 py-2"
                disabled={isSubmitting}
              />
              <p className="text-sm text-gray-500 mt-2">
                Separate tags with commas
              </p>
            </div>

            {/* Related Blogs Section */}
            {relatedBlogs.length > 0 && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <h3 className="font-medium mb-3">Related Content</h3>
                <div className="space-y-3">
                  {relatedBlogs.map((blog) => (
                    <div
                      key={blog._id}
                      className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                      onClick={() => {
                        if (!isSubmitting) {
                          setCurrentBlog(blog);
                          navigate(`/blogs/edit/${blog._id}`);
                        }
                      }}
                    >
                      {blog.thumbnail && (
                        <img
                          src={blog.thumbnail || "/placeholder.svg"}
                          alt={blog.title}
                          className="w-12 h-12 object-cover rounded mr-3"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-sm line-clamp-1">
                          {blog.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {blog.isPublished ? "Published" : "Draft"} •{" "}
                          {format(new Date(blog.createdAt), "MMM d")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogEditor;
