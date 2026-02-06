import { createContext, useContext, useState } from "react";
import axios from "axios";
import { useToast } from "../components/ui/use-toast";

const PlaylistContext = createContext();

export function PlaylistProvider({ children }) {
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const createPlaylist = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post("/api/v1/playlist", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Add to playlists
      setPlaylists((prev) => [response.data.data, ...prev]);

      toast({
        variant: "success",
        title: "Success",
        description: "Playlist created successfully",
      });

      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create playlist");
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create playlist",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserPlaylists = async (userId, page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/v1/playlist/user/${userId}`, {
        params: { page, limit },
      });

      setPlaylists(response.data.data.docs || []);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch playlists");
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch playlists",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPlaylistById = async (playlistId) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching playlist:", playlistId); // Debug log

      const response = await axios.get(`/api/v1/playlist/${playlistId}`);

      console.log("Playlist fetched successfully:", response.data.data); // Debug log

      setCurrentPlaylist(response.data.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching playlist:", error); // Debug log

      const errorMessage =
        error.response?.data?.message || "Failed to fetch playlist";
      setError(errorMessage);

      // More specific error handling
      if (error.response?.status === 403) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to view this playlist",
        });
      } else if (error.response?.status === 404) {
        toast({
          variant: "destructive",
          title: "Not Found",
          description: "Playlist not found",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addBlogToPlaylist = async (playlistId, blogId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(
        `/api/v1/playlist/${playlistId}/add/${blogId}`
      );

      // Update current playlist if it's the one being modified
      if (currentPlaylist?._id === playlistId) {
        setCurrentPlaylist((prev) => ({
          ...prev,
          blogs: [...prev.blogs, blogId],
        }));
      }

      // Update in playlists list if needed
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist._id === playlistId
            ? { ...playlist, blogs: [...playlist.blogs, blogId] }
            : playlist
        )
      );

      toast({
        variant: "success",
        title: "Success",
        description: "Blog added to playlist",
      });

      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to add blog to playlist"
      );
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to add blog to playlist",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeBlogFromPlaylist = async (playlistId, blogId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(
        `/api/v1/playlist/${playlistId}/remove/${blogId}`
      );

      // Update current playlist if it's the one being modified
      if (currentPlaylist?._id === playlistId) {
        setCurrentPlaylist((prev) => ({
          ...prev,
          blogs: prev.blogs.filter((id) => id.toString() !== blogId),
        }));
      }

      // Update in playlists list if needed
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist._id === playlistId
            ? {
                ...playlist,
                blogs: playlist.blogs.filter((id) => id.toString() !== blogId),
              }
            : playlist
        )
      );

      toast({
        variant: "success",
        title: "Success",
        description: "Blog removed from playlist",
      });

      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to remove blog from playlist"
      );
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to remove blog from playlist",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePlaylist = async (playlistId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(`/api/v1/playlist/${playlistId}`);

      // Remove from playlists
      setPlaylists((prev) =>
        prev.filter((playlist) => playlist._id !== playlistId)
      );

      // Clear current playlist if it's the one being deleted
      if (currentPlaylist?._id === playlistId) {
        setCurrentPlaylist(null);
      }

      toast({
        variant: "success",
        title: "Success",
        description: "Playlist deleted successfully",
      });

      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete playlist");
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete playlist",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePlaylist = async (playlistId, formData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(
        `/api/v1/playlist/${playlistId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update current playlist if it's the one being modified
      if (currentPlaylist?._id === playlistId) {
        setCurrentPlaylist(response.data.data);
      }

      // Update in playlists list if needed
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist._id === playlistId ? response.data.data : playlist
        )
      );

      toast({
        variant: "success",
        title: "Success",
        description: "Playlist updated successfully",
      });

      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update playlist");
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update playlist",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchPlaylists = async (query, page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/v1/playlist", {
        params: { query, page, limit },
      });

      setPlaylists(response.data.data.docs || []);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Failed to search playlists");
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to search playlists",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    playlists,
    currentPlaylist,
    loading,
    error,
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addBlogToPlaylist,
    removeBlogFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    searchPlaylists,
    setCurrentPlaylist,
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
}
