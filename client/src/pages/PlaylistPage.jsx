import { useAuth } from "../contexts/AuthContext";
import { PlaylistProvider } from "../contexts/PlaylistContext";
import { BlogProvider } from "../contexts/BlogContext";
import { PlaylistDashboard } from "../components/PlayLists/PlaylistDashboard";

function PlaylistPageContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <PlaylistDashboard userId={user?._id} />
    </div>
  );
}

export default function PlaylistPage() {
  return (
    <BlogProvider>
      <PlaylistProvider>
        <PlaylistPageContent />
      </PlaylistProvider>
    </BlogProvider>
  );
}
