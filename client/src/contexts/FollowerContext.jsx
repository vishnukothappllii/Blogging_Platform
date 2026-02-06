// FollowerContext.jsx
import { createContext, useContext, useState } from "react";
import axios from "axios";
import { useToast } from "../components/ui/use-toast";

const FollowerContext = createContext();

export function FollowerProvider({ children }) {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [followStatus, setFollowStatus] = useState({});
  const { toast } = useToast();

  const toggleFollow = async (authorId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`/api/v1/followers/${authorId}`);
      
      // Update follow status for this author
      setFollowStatus(prev => ({
        ...prev,
        [authorId]: response.data.data.isFollowing
      }));
      
      toast({
        variant: "success",
        title: "Success",
        description: response.data.message || "Follow status updated",
      });
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update follow status");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update follow status",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getFollowers = async (authorId, page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/v1/followers/${authorId}`, {
        params: { page, limit }
      });

      setFollowers(response.data.data.docs || []);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch followers");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch followers",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getFollowing = async (userId, page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/v1/followers/following/${userId}`, {
        params: { page, limit }
      });

      setFollowing(response.data.data.docs || []);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch following list");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch following list",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async (authorId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/v1/followers/status/${authorId}`);
      
      // Update follow status for this author
      setFollowStatus(prev => ({
        ...prev,
        [authorId]: response.data.data.isFollowing
      }));
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to check follow status");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    followers,
    following,
    followStatus,
    loading,
    error,
    toggleFollow,
    getFollowers,
    getFollowing,
    checkFollowStatus
  };

  return (
    <FollowerContext.Provider value={value}>
      {children}
    </FollowerContext.Provider>
  );
}

export function useFollower() {
  const context = useContext(FollowerContext);
  if (context === undefined) {
    throw new Error("useFollower must be used within a FollowerProvider");
  }
  return context;
}