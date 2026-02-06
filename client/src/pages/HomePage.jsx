import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1">
        {/* Hero Section with Image Background */}
        <section className="relative py-24 md:py-32 bg-cover bg-center" style={{ backgroundImage: "url('https://via.placeholder.com/1200x600?text=Hero+Image')" }}>
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 container px-4 md:px-6 text-white">
            <div className="flex flex-col items-center space-y-6 text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Share Your Stories, Inspire the World
              </h1>
              <p className="mx-auto max-w-[700px] text-lg md:text-xl text-indigo-100">
                A platform for writers, thinkers, and creators to share their ideas with a global audience.
              </p>
              <div className="space-x-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="inline-block px-8 py-3 text-lg font-semibold text-indigo-600 bg-white rounded-full hover:bg-indigo-50 transition-colors"
                  >
                    Start Writing
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="inline-block px-8 py-3 text-lg font-semibold text-indigo-600 bg-white rounded-full hover:bg-indigo-50 transition-colors"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/signin"
                      className="inline-block px-8 py-3 text-lg font-semibold border border-white text-white rounded-full hover:bg-white hover:text-indigo-600 transition-colors"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Posts Section */}
        <section className="py-16 md:py-24 bg-white dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-12 text-center">
              Featured Stories
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Post 1 */}
              <div className="group flex flex-col rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-700">
                <img
                  src="https://via.placeholder.com/600x400?text=Post+1+Image"
                  alt="Featured post 1"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    The Art of Storytelling
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Discover how to craft compelling narratives that captivate your audience.
                  </p>
                  <Link
                    to="/post/1"
                    className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    Read More
                  </Link>
                </div>
              </div>
              {/* Post 2 */}
              <div className="group flex flex-col rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-700">
                <img
                  src="https://via.placeholder.com/600x400?text=Post+2+Image"
                  alt="Featured post 2"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Technology Trends in 2025
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Explore the innovations shaping the future of tech this year.
                  </p>
                  <Link
                    to="/post/2"
                    className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    Read More
                  </Link>
                </div>
              </div>
              {/* Post 3 */}
              <div className="group flex flex-col rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-700">
                <img
                  src="https://via.placeholder.com/600x400?text=Post+3+Image"
                  alt="Featured post 3"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Mindful Living
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Learn how to embrace mindfulness in your daily routine.
                  </p>
                  <Link
                    to="/post/3"
                    className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Explore by Topic Section */}
        <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-12 text-center">
              Explore by Topic
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/category/technology" className="px-6 py-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">
                Technology
              </Link>
              <Link to="/category/lifestyle" className="px-6 py-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">
                Lifestyle
              </Link>
              <Link to="/category/business" className="px-6 py-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">
                Business
              </Link>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-24 bg-indigo-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Share Your Story?
              </h2>
              <p className="mx-auto max-w-[600px] text-indigo-100 text-lg">
                Join our community of writers and start publishing your ideas today.
              </p>
              <Link
                to="/signup"
                className="inline-block px-8 py-3 text-lg font-semibold bg-white text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors"
              >
                Join Now
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;