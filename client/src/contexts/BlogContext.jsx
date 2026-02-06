// BlogContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useToast } from "../components/ui/use-toast";

const BlogContext = createContext();

export function BlogProvider({ children }) {
  const [blogs, setBlogs] = useState([]);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const getAllBlogs = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Only include parameters that have values
      const filteredParams = Object.entries(params).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value;
          }
          return acc;
        }, 
        {}
      );

      const response = await axios.get("/api/v1/blogs", {
        params: filteredParams,
        timeout: 10000 // Add timeout to prevent hanging requests
      });

      // Handle different response structures
      const responseData = response.data.data || response.data;
      let blogsArray = [];

      if (Array.isArray(responseData)) {
        blogsArray = responseData;
      } else if (responseData.blogs) {
        blogsArray = responseData.blogs;
      } else if (responseData.docs) {
        blogsArray = responseData.docs;
      } else {
        blogsArray = [];
      }

      setBlogs(blogsArray);
      return response.data;
    } catch (error) {
      // Handle different error scenarios
      let errorMessage = "Failed to fetch blogs";
      
      if (error.response) {
        // Server responded with a status code outside 2xx
        errorMessage = error.response.data?.message || error.response.statusText || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response received from server";
      } else {
        // Something happened in setting up the request
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      
      // Return empty array to prevent crashes in components
      return { data: [] };
    } finally {
      setLoading(false);
    }
  }, [toast]);  

  const getBlogById = async (blogId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/v1/blogs/${blogId}`);
      setCurrentBlog(response.data.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Blog not found");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Blog not found",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const publishBlog = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post("/api/v1/blogs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        variant: "success",
        title: "Success",
        description: response.data.message || "Blog published successfully",
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to publish blog");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to publish blog",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBlog = async (blogId, formData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(`/api/v1/blogs/${blogId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update current blog if it's the one being edited
      if (currentBlog?._id === blogId) {
        setCurrentBlog(response.data.data);
      }

      toast({
        variant: "success",
        title: "Success",
        description: response.data.message || "Blog updated successfully",
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update blog");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update blog",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (blogId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(`/api/v1/blogs/${blogId}`);

      // Update blogs list
      setBlogs((prev) => prev.filter((blog) => blog._id !== blogId));

      // Clear current blog if it's the one being deleted
      if (currentBlog?._id === blogId) {
        setCurrentBlog(null);
      }

      toast({
        variant: "success",
        title: "Success",
        description: response.data.message || "Blog deleted successfully",
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete blog");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete blog",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const togglePublishStatus = async (blogId) => {
  try {
    setLoading(true);
    setError(null);

    const response = await axios.patch(
      `/api/v1/blogs/toggle/publish/${blogId}`
    );

    // Update blogs list - REMOVED DUPLICATE SETBLOGS CALL
    setBlogs((prev) =>
      prev.map((blog) =>
        blog._id === blogId
          ? { ...blog, isPublished: !blog.isPublished }
          : blog
      )
    );

    // Update current blog if it's the one being toggled
    if (currentBlog?._id === blogId) {
      setCurrentBlog((prev) => ({
        ...prev,
        isPublished: !prev.isPublished,
      }));
    }

    toast({
      variant: "success",
      title: "Success",
      description: response.data.message || "Publish status updated",
    });
    return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to publish blog");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to publish blog",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    blogs,
    currentBlog,
    loading,
    error,
    getAllBlogs,
    getBlogById,
    publishBlog,
    updateBlog,
    deleteBlog,
    togglePublishStatus,
    setCurrentBlog,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error("useBlog must be used within a BlogProvider");
  }
  return context;
}
