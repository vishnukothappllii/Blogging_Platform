// PostContext.jsx
import { createContext, useContext, useState } from "react";
import axios from "axios";
import { useToast } from "../components/ui/use-toast";

const PostContext = createContext();

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [feed, setFeed] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const createPost = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post("/api/v1/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Add to feed and user posts
      setPosts(prev => [response.data.data, ...prev]);
      setFeed(prev => [response.data.data, ...prev]);
      
      toast({
        variant: "success",
        title: "Success",
        description: "Post created successfully",
      });
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create post");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create post",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserPosts = async (userId, page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/v1/posts/user/${userId}`, {
        params: { page, limit }
      });

      setPosts(response.data.data.docs || []);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch user posts");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch user posts",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getFeed = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get("/api/v1/posts", {
        params: { page, limit }
      });

      setFeed(response.data.data.docs || []);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch feed");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch feed",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPostsByHashtag = async (hashtag, page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/v1/posts/hashtag/${hashtag}`, {
        params: { page, limit }
      });

      setPosts(response.data.data.docs || []);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch hashtag posts");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch hashtag posts",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (postId, content) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.patch(`/api/v1/posts/${postId}`, {
        content
      });

      // Update in all post lists
      setPosts(prev => 
        prev.map(post => 
          post._id === postId 
            ? response.data.data 
            : post
        )
      );
      
      setFeed(prev => 
        prev.map(post => 
          post._id === postId 
            ? response.data.data 
            : post
        )
      );
      
      // Update current post if it's the one being edited
      if (currentPost?._id === postId) {
        setCurrentPost(response.data.data);
      }
      
      toast({
        variant: "success",
        title: "Success",
        description: "Post updated successfully",
      });
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update post");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update post",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePostMedia = async (postId, mediaFile) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append("media", mediaFile);
      
      const response = await axios.patch(
        `/api/v1/posts/${postId}/media`, 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update in all post lists
      setPosts(prev => 
        prev.map(post => 
          post._id === postId 
            ? response.data.data 
            : post
        )
      );
      
      setFeed(prev => 
        prev.map(post => 
          post._id === postId 
            ? response.data.data 
            : post
        )
      );
      
      // Update current post if it's the one being edited
      if (currentPost?._id === postId) {
        setCurrentPost(response.data.data);
      }
      
      toast({
        variant: "success",
        title: "Success",
        description: "Post media updated successfully",
      });
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update media");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update media",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.delete(`/api/v1/posts/${postId}`);
      
      // Remove from all post lists
      setPosts(prev => prev.filter(post => post._id !== postId));
      setFeed(prev => prev.filter(post => post._id !== postId));
      
      // Clear current post if it's the one being deleted
      if (currentPost?._id === postId) {
        setCurrentPost(null);
      }
      
      toast({
        variant: "success",
        title: "Success",
        description: "Post deleted successfully",
      });
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete post");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete post",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    posts,
    feed,
    currentPost,
    loading,
    error,
    createPost,
    getUserPosts,
    getFeed,
    getPostsByHashtag,
    updatePost,
    updatePostMedia,
    deletePost,
    setCurrentPost
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
}

export function usePost() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePost must be used within a PostProvider");
  }
  return context;
}