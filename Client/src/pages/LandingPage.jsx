import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import RotatingLogo from "../components/RotatingLogo"
import landingImage from "../assets/images/landing-image-1.png" // Import the image
import { useAuth } from "../context/AuthContext" // Import auth context

const LandingPage = () => {
  const navigate = useNavigate()
  const [imageLoaded, setImageLoaded] = useState(false)
  const { clearAuthState } = useAuth() // Get the clearAuthState function

  // Preload the background image
  useEffect(() => {
    const img = new Image()
    img.src = landingImage
    img.onload = () => setImageLoaded(true)
  }, [])

  // Ensure we clean up any stale auth data on landing page load
  useEffect(() => {
    // Check if we're coming from a direct page load (not internal navigation)
    const isDirectNavigation = !document.referrer.includes(window.location.host)
    
    if (isDirectNavigation) {
      // Clear any potentially stale auth data
      clearAuthState()
      // Also directly clear localStorage as a safety measure
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
      
      console.log('Cleared potential stale auth data on landing page load')
    }
  }, [clearAuthState])

  const handleGetStarted = () => {
    // Clear auth state before navigating to ensure clean state
    clearAuthState()
    
    // Also directly clear localStorage as a safety measure
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
    
    // Use a short timeout to ensure clearance has happened
    setTimeout(() => {
      navigate("/login")
    }, 10)
  }

  return (
    <div 
      className={`min-h-screen flex flex-col bg-cover bg-center bg-no-repeat relative transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundImage: `url(${landingImage})` }}
    >
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900/60 to-teal-900/70 z-0"></div>
      
      {/* Content positioned above the overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="container mx-auto pt-8 md:pt-16 px-4 text-center">
          <div className="flex flex-col items-center justify-center">
            <RotatingLogo />
            <motion.h1
              className="text-4xl md:text-5xl font-bold mt-6 text-amber-300"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Welcome to HealthPal
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-amber-300 mt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Your personal health assistant
            </motion.p>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="max-w-3xl w-full bg-white/50 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-2xl">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-black">About HealthPal</h2>
                <p className="text-lg text-black leading-relaxed">
                  HealthPal is your comprehensive health management platform. From booking appointments with top doctors
                  to managing your prescriptions and medical records, HealthPal is here to assist you every step of the
                  way.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-black">Key Features</h2>
                <ul className="space-y-2 text-gray-700">
                  <motion.li
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="h-2 w-2 rounded-full bg-teal-600"></div>
                    <span>Easy appointment booking with specialists</span>
                  </motion.li>
                  <motion.li
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="h-2 w-2 rounded-full bg-teal-600"></div>
                    <span>Secure medical records management</span>
                  </motion.li>
                  <motion.li
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="h-2 w-2 rounded-full bg-teal-600"></div>
                    <span>Prescription tracking and reminders</span>
                  </motion.li>
                  <motion.li
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="h-2 w-2 rounded-full bg-teal-600"></div>
                    <span>24/7 health monitoring and support</span>
                  </motion.li>
                </ul>
              </div>
              <div className="flex justify-center pt-4">
                <motion.button
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-8 rounded-md text-lg shadow-lg transition-all"
                  onClick={handleGetStarted}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>
          </div>
        </main>

        <motion.footer
          className="bg-teal-800/80 backdrop-blur-sm text-white py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} HealthPal. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
              <a href="#" className="hover:underline">
                Terms of Service
              </a>
              <a href="#" className="hover:underline">
                Contact Us
              </a>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  )
}

export default LandingPage

