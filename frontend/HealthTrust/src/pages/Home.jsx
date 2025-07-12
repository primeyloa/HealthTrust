import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Shield, Users, CheckCircle, TrendingUp, ArrowRight, Star, Award } from 'lucide-react'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div>
      {/* Hero Section */}
      <section className="hero margin-100px">
        <div className="container">
          <h1 className="hero-title">Combat Health Misinformation Together</h1>
          <p className="hero-subtitle">
            Join a trusted community dedicated to sharing accurate health information 
            and fighting misinformation about vaccines and health initiatives.
          </p>
          {!isAuthenticated && (
            <div className="hero-actions">
              <Link to="/register" className="btn btn-lg btn-primary">
                Join the Community
                <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="btn btn-lg btn-secondary">
                Sign In
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <div className="hero-actions">
              <Link to="/feed" className="btn btn-lg btn-primary">
                View Feed
                <ArrowRight size={20} />
              </Link>
              <Link to="/chat" className="btn btn-lg btn-secondary">
                Ask AI Assistant
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-white">
        <div className="container">
          <h2 className="text-center mb-8 text-2xl font-bold">Why Choose HealthTrust?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="card-body">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Verified Information</h3>
                <p className="text-gray-600 text-sm">
                  All health information is fact-checked by medical professionals 
                  and backed by scientific evidence.
                </p>
              </div>
            </div>
            
            <div className="card text-center">
              <div className="card-body">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-success-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Community Support</h3>
                <p className="text-gray-600 text-sm">
                  Connect with like-minded individuals who value evidence-based 
                  health information and scientific literacy.
                </p>
              </div>
            </div>
            
            <div className="card text-center">
              <div className="card-body">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Advanced AI helps identify and counter false health claims with 
                  accurate, peer-reviewed information and sources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8">
        <div className="container">
          <h2 className="text-center mb-8 text-2xl font-bold">Trusted by Health Advocates Worldwide</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="card-body">
                <div className="flex justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">10K+</h3>
                <p className="text-gray-600 text-sm">Verified Posts</p>
              </div>
            </div>
            
            <div className="card text-center">
              <div className="card-body">
                <div className="flex justify-center mb-2">
                  <Users className="w-6 h-6 text-success-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">5K+</h3>
                <p className="text-gray-600 text-sm">Active Members</p>
              </div>
            </div>
            
            <div className="card text-center">
              <div className="card-body">
                <div className="flex justify-center mb-2">
                  <Shield className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">99%</h3>
                <p className="text-gray-600 text-sm">Accuracy Rate</p>
              </div>
            </div>
            
            <div className="card text-center">
              <div className="card-body">
                <div className="flex justify-center mb-2">
                  <Award className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">24/7</h3>
                <p className="text-gray-600 text-sm">AI Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-8 bg-white">
        <div className="container">
          <h2 className="text-center mb-8 text-2xl font-bold">What Our Community Says</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="post-avatar mr-4">Dr</div>
                  <div>
                    <h4 className="font-semibold">Dr. Sarah Johnson</h4>
                    <p className="text-sm text-gray-500">Infectious Disease Specialist</p>
                  </div>
                  <div className="ml-auto">
                    <CheckCircle className="w-5 h-5 text-primary-500" />
                  </div>
                </div>
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">
                  "HealthTrust has become an invaluable platform for sharing accurate medical 
                  information. The AI fact-checking is incredibly accurate and helps combat 
                  dangerous misinformation."
                </p>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="post-avatar mr-4">M</div>
                  <div>
                    <h4 className="font-semibold">Maria Rodriguez</h4>
                    <p className="text-sm text-gray-500">Health Educator</p>
                  </div>
                </div>
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">
                  "As a health educator, I appreciate having a trusted community where I can 
                  share evidence-based information and help others make informed decisions 
                  about their health."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-8 bg-primary-50">
          <div className="container text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of health advocates working together to promote 
              accurate health information and combat dangerous misinformation.
            </p>
            <Link to="/register" className="btn btn-lg btn-primary">
              Get Started Today
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
