import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-400 bg-white dark:border-gray-500 dark:bg-gray-800 transition-colors duration-200">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Datalytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Secure authentication and dashboard solution for your
              applications.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 hover:underline underline-offset-4"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 hover:underline underline-offset-4"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/signin"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 hover:underline underline-offset-4"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 hover:underline underline-offset-4"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 hover:underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 hover:underline underline-offset-4"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  Email:
                </span>{" "}
                <a
                  href="mailto:support@datalytics.com"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 hover:underline underline-offset-4"
                >
                  support@datalytics.com
                </a>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  Phone:
                </span>{" "}
                <a
                  href="tel:+919913360515"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 hover:underline underline-offset-4"
                >
                  +91 99133 60515
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              © {currentYear} Datalytics. All rights reserved.
            </p>

            {/* Optional: Social Links or Additional Info */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                Made with ❤️ in India
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
