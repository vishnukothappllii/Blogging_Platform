// DashboardContext.jsx
import { createContext, useContext, useState } from "react";
import axios from "axios";
import { useToast } from "../components/ui/use-toast";

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [authorStats, setAuthorStats] = useState({
    overview: {
      totalBlogs: 0,
      publishedBlogs: 0,
      draftBlogs: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalFollowers: 0,
      totalFollowing: 0,
    },
    engagement: {
      avgViewDuration: 0,
      engagementRate: 0,
    },
    topContent: [],
    audience: {
      total: 0,
      locations: [],
    },
  });
  const [authorBlogsData, setAuthorBlogsData] = useState({
    docs: [],
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const getAuthorStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/v1/dashboard/stats");

      // Handle nested response structure
      const responseData = response.data.data || response.data;

      // Merge with default structure to ensure all properties exist
      setAuthorStats((prev) => ({
        ...prev,
        overview: {
          ...prev.overview,
          ...(responseData.overview || {}),
        },
        engagement: {
          ...prev.engagement,
          ...(responseData.engagement || {}),
        },
        topContent: responseData.topContent || [],
        audience: {
          ...prev.audience,
          ...(responseData.audience || {}),
        },
      }));

      return responseData;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch author stats";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAuthorBlogs = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const {
        page = 1,
        limit = 10,
        status,
        sortBy = "createdAt",
        sortOrder = -1,
      } = params;

      const response = await axios.get("/api/v1/dashboard/blogs", {
        params: {
          page,
          limit,
          status,
          sortBy,
          sortOrder,
        },
      });

      const responseData = response.data.data || response.data;
      let blogsData;

      // Handle different response structures
      if (Array.isArray(responseData)) {
        // Simple array response
        blogsData = {
          docs: responseData,
          total: responseData.length,
          page: 1,
          pages: 1,
          limit: responseData.length,
        };
      } else if (responseData.docs) {
        // Paginated response
        blogsData = {
          docs: responseData.docs,
          total: responseData.total,
          page: responseData.page,
          pages: responseData.pages,
          limit: responseData.limit,
        };
      } else {
        // Fallback to empty
        blogsData = {
          docs: [],
          total: 0,
          page: 1,
          pages: 1,
          limit: 10,
        };
      }

      setAuthorBlogsData(blogsData);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch author blogs";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAnalytics = async (period = "30d") => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/v1/dashboard/analytics", {
        params: { period },
      });

      // More flexible response handling
      const responseData = response.data.data || response.data;
      setAnalytics(responseData);
      return responseData;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch analytics";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    authorStats,
    authorBlogsData,
    analytics,
    loading,
    error,
    getAuthorStats,
    getAuthorBlogs,
    getAnalytics,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
