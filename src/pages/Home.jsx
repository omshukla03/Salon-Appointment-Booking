// src/pages/Home.jsx
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">✂</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Style Studio
              </span>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/partner/register"
                className="px-4 py-2 text-purple-600 hover:text-purple-800 transition-colors font-medium border border-purple-200 rounded-full hover:bg-purple-50"
              >
                Become a Partner
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Style
              </span>
              <br />
              <span className="text-gray-800">Perfected</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Premium styling services for everyone. Book your perfect salon appointment with professional stylists.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Book Now ✨
              </Link>
              <Link
                to="/partner/register"
                className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-full text-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Join as Partner 🤝
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-indigo-200 rounded-full opacity-50"></div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Style Studio?</h2>
            <p className="text-xl text-gray-600">Experience the difference with our premium features</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: "📅", 
                title: "Easy Booking", 
                desc: "Book appointments instantly with real-time availability",
                highlight: "24/7 Online"
              },
              { 
                icon: "👨‍💼", 
                title: "Expert Stylists", 
                desc: "Certified professionals with years of experience",
                highlight: "Verified Partners"
              },
              { 
                icon: "💳", 
                title: "Secure Payments", 
                desc: "Safe and secure payment processing with multiple options",
                highlight: "100% Protected"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-50 to-indigo-50 p-8 rounded-2xl text-center hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-3">{feature.desc}</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {feature.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partner Benefits Section */}
      <div className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Partner with Style Studio</h2>
            <p className="text-xl text-gray-600">Grow your business with our platform</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Increased Bookings</h3>
                    <p className="text-gray-600">Reach more customers and fill your schedule</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Easy Management</h3>
                    <p className="text-gray-600">Manage appointments and customers effortlessly</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Secure Payments</h3>
                    <p className="text-gray-600">Get paid instantly with automated processing</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">🏪</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Start?</h3>
                <p className="text-gray-600 mb-6">Join thousands of successful salon partners</p>
                <Link
                  to="/partner/register"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Become a Partner
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">✂</span>
            </div>
            <span className="text-xl font-bold">Style Studio</span>
          </div>
          <p className="text-gray-400">&copy; 2025 Style Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;