import PublicBlogList from "../components/PublicBlogList"

const PublicBlogsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Discover Amazing Stories</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore thousands of articles from talented writers around the world
          </p>
        </div>
        <PublicBlogList />
      </div>
    </div>
  )
}

export default PublicBlogsPage
