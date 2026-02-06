// CommentContext.jsx
import { createContext, useContext, useState } from "react";
import axios from "axios";
import { useToast } from "../components/ui/use-toast";

const CommentContext = createContext();

export function CommentProvider({ children }) {
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const getBlogComments = async (blogId, page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/v1/comments/blog/${blogId}`, {
        params: { page, limit }
      });

      setComments(response.data.data.docs || []);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch comments");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch comments",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (blogId, content) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`/api/v1/comments/blog/${blogId}`, {
        content
      });

      // Optimistically update comments
      setComments(prev => [response.data.data, ...prev]);

      toast({
        variant: "success",
        title: "Success",
        description: "Comment added successfully",
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add comment");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to add comment",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateComment = async (commentId, content) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.patch(`/api/v1/comments/${commentId}`, {
        content
      });

      // Update in comments
      setComments(prev => 
        prev.map(comment => 
          comment._id === commentId 
            ? { ...comment, content } 
            : comment
        )
      );

      // Update in replies if exists
      setReplies(prev => 
        prev.map(reply => 
          reply._id === commentId 
            ? { ...reply, content } 
            : reply
        )
      );

      toast({
        variant: "success",
        title: "Success",
        description: "Comment updated successfully",
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update comment");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update comment",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.delete(`/api/v1/comments/${commentId}`);

      // Remove from comments
      setComments(prev => prev.filter(comment => comment._id !== commentId));

      // Remove from replies if exists
      setReplies(prev => prev.filter(reply => reply._id !== commentId));

      toast({
        variant: "success",
        title: "Success",
        description: "Comment deleted successfully",
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete comment");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete comment",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getReplies = async (commentId, page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/v1/comments/reply/${commentId}`, {
        params: { page, limit }
      });

      setReplies(response.data.data.docs || []);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch replies");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch replies",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addReply = async (commentId, content) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`/api/v1/comments/reply/${commentId}`, {
        content
      });

      // Optimistically update replies
      setReplies(prev => [response.data.data, ...prev]);

      // Update comment count in UI (if needed)
      setComments(prev => 
        prev.map(comment => 
          comment._id === commentId 
            ? { ...comment, replyCount: (comment.replyCount || 0) + 1 } 
            : comment
        )
      );

      toast({
        variant: "success",
        title: "Success",
        description: "Reply added successfully",
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add reply");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to add reply",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    comments,
    replies,
    loading,
    error,
    getBlogComments,
    addComment,
    updateComment,
    deleteComment,
    getReplies,
    addReply,
    setComments,
    setReplies
  };

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
}

export function useComment() {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error("useComment must be used within a CommentProvider");
  }
  return context;
}