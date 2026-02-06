import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Image,
  Camera,
  History,
  LogOut,
  Save,
  X,
} from "lucide-react";

const Settings = () => {
  const {
    user,
    loading,
    logout,
    changePassword,
    updateAccountDetails,
    updateAvatar,
    deleteAccount,
    updateCoverImage,
    getUserChannelProfile,
    getReadHistory,
    checkAuthStatus,
    refreshToken,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [readHistory, setReadHistory] = useState([]);
  const [channelProfile, setChannelProfile] = useState(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    bio: "",
    website: "",
    location: "",
    socialLinks: {},
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // File upload states
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        email: user.email || "",
        bio: user.bio || "",
        website: user.website || "",
        location: user.location || "",
        socialLinks: user.socialLinks || {},
      });
    }
  }, [user]);

  // Load channel profile and read history
  useEffect(() => {
    if (user && activeTab === "channel") {
      loadChannelProfile();
    }
    if (user && activeTab === "history") {
      loadReadHistory();
    }
  }, [user, activeTab]);

  const loadChannelProfile = async () => {
    setIsLoading(true);
    const result = await getUserChannelProfile(user.username);
    if (result.success) {
      setChannelProfile(result.data);
    } else {
      setMessage({ type: "error", text: result.message });
    }
    setIsLoading(false);
  };

  const loadReadHistory = async () => {
    setIsLoading(true);
    const result = await getReadHistory();
    if (result.success) {
      setReadHistory(result.data);
    } else {
      setMessage({ type: "error", text: result.message });
    }
    setIsLoading(false);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await updateAccountDetails(profileForm);
    if (result.success) {
      showMessage("success", result.message);
    } else {
      showMessage("error", result.message);
    }
    setIsLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showMessage("error", "New password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    const result = await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    });

    if (result.success) {
      showMessage("success", result.message);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      showMessage("error", result.message);
    }
    setIsLoading(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setIsLoading(true);
    const result = await updateAvatar(avatarFile);
    if (result.success) {
      showMessage("success", result.message);
      setAvatarFile(null);
      setAvatarPreview(null);
    } else {
      showMessage("error", result.message);
    }
    setIsLoading(false);
  };

  const handleCoverUpload = async () => {
    if (!coverFile) return;

    setIsLoading(true);
    const result = await updateCoverImage(coverFile);
    if (result.success) {
      showMessage("success", result.message);
      setCoverFile(null);
      setCoverPreview(null);
    } else {
      showMessage("error", result.message);
    }
    setIsLoading(false);
  };

  const handleRefreshToken = async () => {
    setIsLoading(true);
    const result = await refreshToken();
    if (result) {
      showMessage("success", "Token refreshed successfully");
    } else {
      showMessage("error", "Failed to refresh token");
    }
    setIsLoading(false);
  };

  const handleCheckAuthStatus = async () => {
    setIsLoading(true);
    try {
      await checkAuthStatus();
      showMessage("success", "Authentication status verified");
    } catch (error) {
      showMessage(
        "error",
        "Failed to check authentication status: " + error.message
      );
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await deleteAccount(user?._id);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "media", label: "Media", icon: Image },
    { id: "channel", label: "Channel", icon: Camera },
    { id: "history", label: "History", icon: History },
    { id: "account", label: "Account", icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your account settings and preferences
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{message.text}</span>
              <button
                onClick={() => setMessage({ type: "", text: "" })}
                className="text-current hover:opacity-70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Profile Information
              </h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          fullName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          bio: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                      rows="4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={profileForm.website}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          website: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          location: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={user?.username || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Username cannot be changed
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={profileForm.socialLinks.twitter || ""}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          socialLinks: {
                            ...profileForm.socialLinks,
                            twitter: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                      placeholder="https://x.com/yourusername"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={profileForm.socialLinks.linkedin || ""}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          socialLinks: {
                            ...profileForm.socialLinks,
                            linkedin: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                      placeholder="https://linkedin.com/in/yourusername"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GitHub
                    </label>
                    <input
                      type="url"
                      value={profileForm.socialLinks.github || ""}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          socialLinks: {
                            ...profileForm.socialLinks,
                            github: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Change Password
              </h2>
              <form
                onSubmit={handlePasswordChange}
                className="space-y-6 max-w-md"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.old ? "text" : "password"}
                      value={passwordForm.oldPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          oldPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          old: !showPasswords.old,
                        })
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.old ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {isLoading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Profile Media
              </h2>
              <div className="space-y-8">
                {/* Avatar Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Profile Picture
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="flex-shrink-0">
                      <img
                        src={
                          avatarPreview ||
                          user?.avatar?.url ||
                          "/default-avatar.png"
                        }
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
                      />
                      {avatarFile && (
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={handleAvatarUpload}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
                          >
                            {isLoading ? "Uploading..." : "Upload Avatar"}
                          </button>
                          <button
                            onClick={() => {
                              setAvatarFile(null);
                              setAvatarPreview(null);
                            }}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cover Image Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Cover Image
                  </h3>
                  <div className="space-y-4">
                    <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={
                          coverPreview ||
                          user?.coverImage?.url ||
                          "/default-cover.jpg"
                        }
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
                      />
                      {coverFile && (
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={handleCoverUpload}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
                          >
                            {isLoading ? "Uploading..." : "Upload Cover"}
                          </button>
                          <button
                            onClick={() => {
                              setCoverFile(null);
                              setCoverPreview(null);
                            }}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Channel Tab */}
          {activeTab === "channel" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Channel Profile
              </h2>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                </div>
              ) : channelProfile ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Channel Stats
                        </h3>
                        <dl className="mt-4 space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-gray-600 dark:text-gray-400">
                              Followers:
                            </dt>
                            <dd className="font-medium text-gray-900 dark:text-white">
                              {channelProfile.followersCount || 0}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600 dark:text-gray-400">
                              Following:
                            </dt>
                            <dd className="font-medium text-gray-900 dark:text-white">
                              {channelProfile.followingCount || 0}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Channel Info
                        </h3>
                        <dl className="mt-4 space-y-2">
                          <div>
                            <dt className="text-gray-600 dark:text-gray-400">
                              Username:
                            </dt>
                            <dd className="font-medium text-gray-900 dark:text-white">
                              @{channelProfile.username}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-gray-600 dark:text-gray-400">
                              Full Name:
                            </dt>
                            <dd className="font-medium text-gray-900 dark:text-white">
                              {channelProfile.fullName}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-gray-600 dark:text-gray-400">
                              Email:
                            </dt>
                            <dd className="font-medium text-gray-900 dark:text-white">
                              {channelProfile.email}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No channel profile data available
                  </p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Read History
              </h2>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                </div>
              ) : readHistory.length > 0 ? (
                <div className="space-y-4">
                  {readHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={item.thumbnail?.url || "/default-video.jpg"}
                          alt={item.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description || "No description available"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Read on{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No read history available
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Account Management
              </h2>
              <div className="space-y-6">
                {/* Authentication Status */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Authentication Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Current Status
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user ? "Authenticated" : "Not authenticated"}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        }`}
                      >
                        {user ? "Active" : "Inactive"}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCheckAuthStatus}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Checking..." : "Check Auth Status"}
                      </button>
                      <button
                        onClick={handleRefreshToken}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Refreshing..." : "Refresh Token"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        User ID
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {user?._id || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Username
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        @{user?.username || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Email
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {user?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Full Name
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {user?.fullName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Account Created
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Last Updated
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {user?.updatedAt
                          ? new Date(user.updatedAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-red-900 dark:text-red-400 mb-4">
                    Danger Zone
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-red-800 dark:text-red-300 mb-2">
                        Delete your account. This action cannot be undone.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
