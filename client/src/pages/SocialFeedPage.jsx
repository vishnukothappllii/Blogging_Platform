import { useState } from "react"
import CreatePost from "../components/CreatePost"
import PostFeed from "../components/PostFeed"
import { TrendingUp, Users } from "lucide-react"

const SocialFeedPage = () => {
  const [refreshFeed, setRefreshFeed] = useState(0)

  const handlePostCreated = () => {
    setRefreshFeed((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Feed</h1>
              <p className="text-gray-600 dark:text-gray-300">Stay updated with posts from people you follow</p>
            </div>

            <CreatePost onPostCreated={handlePostCreated} />
            <PostFeed key={refreshFeed} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-4">
              {/* Trending Topics */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Trending
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-all duration-200 cursor-pointer">
                      <div>
                        <p className="font-semibold text-sm text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                          #technology
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                          1.2K posts
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-all duration-200 cursor-pointer">
                      <div>
                        <p className="font-semibold text-sm text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                          #programming
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                          987 posts
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-all duration-200 cursor-pointer">
                      <div>
                        <p className="font-semibold text-sm text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                          #webdev
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                          756 posts
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggested Users */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-700 dark:to-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Who to Follow
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          JD
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            John Doe
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">@johndoe</p>
                        </div>
                      </div>
                      <button className="text-xs bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                        Follow
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          AS
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Alice Smith
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">@alicesmith</p>
                        </div>
                      </div>
                      <button className="text-xs bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                        Follow
                      </button>
                    </div>

                    <div className="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          MB
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Mike Brown
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">@mikebrown</p>
                        </div>
                      </div>
                      <button className="text-xs bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                        Follow
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    Your Activity
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Posts Today</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">3</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Followers</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">247</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Following</span>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">89</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SocialFeedPage