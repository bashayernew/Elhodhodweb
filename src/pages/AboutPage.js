import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const AboutPage = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Secure Escrow System',
      description: 'Your payments are held securely until the job is completed and approved.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Competitive Pricing',
      description: 'Get multiple quotes from verified providers to find the best price.'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Direct Communication',
      description: 'Chat directly with providers to discuss project details and requirements.'
    },
    {
      icon: StarIcon,
      title: 'Verified Professionals',
      description: 'All professionals are verified and rated by previous customers.'
    },
    {
      icon: ClockIcon,
      title: 'Quick Response',
      description: 'Get responses from providers within hours, not days.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Driven',
      description: 'Join a community of trusted professionals and satisfied customers.'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Post Your Request',
      description: 'Describe your project, upload photos, and set your budget.',
      icon: '📝'
    },
    {
      step: 2,
      title: 'Receive Quotes',
      description: 'Get multiple quotes from verified providers in your area.',
      icon: '💰'
    },
    {
      step: 3,
      title: 'Choose Professional',
      description: 'Compare quotes, check reviews, and select the best professional.',
      icon: '✅'
    },
    {
      step: 4,
      title: 'Secure Payment',
      description: 'Pay securely through our escrow system.',
      icon: '🔒'
    },
    {
      step: 5,
      title: 'Job Completion',
      description: 'Professional completes the work and you approve the job.',
      icon: '🏠'
    },
    {
      step: 6,
      title: 'Release Payment',
      description: 'Payment is released to the provider after your approval.',
      icon: '🎉'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Customers' },
    { number: '5,000+', label: 'Verified Professionals' },
    { number: '50,000+', label: 'Completed Projects' },
    { number: '4.8', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-hodhod-gold to-hodhod-gold-dark py-20 text-white">
        <div className="container-hodhod">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-cairo"
            >
              Building Smarter Connections in Construction
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed"
            >
              ElHodhod is Kuwait’s first marketplace that brings together suppliers, contractors, and buyers in one trusted platform. Whether you need construction materials, skilled workers, or competitive bids, we make the process fast, transparent, and cost‑effective.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/services" className="inline-flex items-center px-5 py-2.5 rounded-hodhod bg-white text-hodhod-black font-medium shadow hover:bg-white/90">
                Browse Services
              </Link>
              <Link to="/signup" className="inline-flex items-center px-5 py-2.5 rounded-hodhod border border-white text-white font-medium hover:bg-white/10">
                Join Now
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container-hodhod">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-hodhod-gold mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="container-hodhod">
          <div className="max-w-4xl mx-auto space-y-4 text-gray-700">
            <h2 className="text-3xl font-bold text-hodhod-black font-cairo">Our Story</h2>
            <p>ElHodhod started with a simple vision: to transform how people in Kuwait access construction supplies and services. We noticed that buyers struggled with high costs, limited options, and unreliable connections. On the other hand, suppliers and contractors found it hard to reach the right customers.</p>
            <p>That’s why we built ElHodhod — a digital bridge that makes it easy for everyone to connect, trade, and grow.</p>
          </div>
        </div>
      </section>

      {/* How It Works (customized) */}
      <section className="py-16 bg-gray-50">
        <div className="container-hodhod">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-hodhod-black font-cairo mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">For buyers, suppliers, and contractors</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">For Buyers</h3>
              <p className="text-gray-600">Post what you need — materials, services, or workers — get offers, compare, negotiate, and choose the best.</p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">For Suppliers & Contractors</h3>
              <p className="text-gray-600">List your products or services, compete in auctions or place bids, and grow your customer base and reputation.</p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">For Everyone</h3>
              <p className="text-gray-600">Safe payments, transparent pricing, and a trusted network.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container-hodhod">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-2xl font-bold mb-2">Our Mission</h3>
              <p className="text-gray-700">“To simplify construction by connecting people with the right resources, at the right price, at the right time.”</p>
            </div>
            <div className="card">
              <h3 className="text-2xl font-bold mb-2">Our Vision</h3>
              <p className="text-gray-700">“To be Kuwait’s go‑to digital marketplace for construction supplies and services — saving time, reducing costs, and building trust in every transaction.”</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ElHodhod */}
      <section className="py-16 bg-gray-50">
        <div className="container-hodhod">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-hodhod-black font-cairo">Why Choose ElHodhod?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Transparent auctions & bidding','Wide network of suppliers and workers','Secure and easy communication','Fast and reliable deals','Local expertise with global standards','Trusted community reviews'].map((txt) => (
              <div key={txt} className="card flex items-start gap-3">
                <span className="text-hodhod-gold text-xl">✅</span>
                <span className="text-gray-700">{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Professionals Section */}
      <section className="py-16 bg-gradient-to-br from-hodhod-gold to-hodhod-gold-dark text-white">
        <div className="container-hodhod">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <h2 className="text-3xl font-bold mb-6 font-cairo">
                Are You a Professional?
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Join thousands of verified professionals who are already earning more with HodHod. 
                Get access to quality leads, secure payments, and grow your business.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3" />
                  <span>Get quality leads from verified customers</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3" />
                  <span>Secure payments through our escrow system</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3" />
                  <span>Build your reputation with reviews</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3" />
                  <span>Manage your business efficiently</span>
                </li>
              </ul>
              <Link
                to="/signup"
                className="inline-flex items-center px-5 py-2.5 rounded-hodhod bg-white text-hodhod-black font-medium shadow hover:bg-white/90"
              >
                Join as a Professional
                <ArrowRightIcon className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white bg-opacity-10 rounded-hodhod-lg p-8 relative z-0"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🏗️</div>
                <h3 className="text-2xl font-bold mb-4">Join Our Network</h3>
                <p className="opacity-90 mb-6">
                  Connect with customers who need your expertise. 
                  Start earning more today.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">5,000+</div>
                     <div className="text-sm opacity-75">Active Professionals</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">$2M+</div>
                     <div className="text-sm opacity-75">Paid to Professionals</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-hodhod text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-hodhod-black font-cairo mb-4"
          >
            Join the ElHodhod community today
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            Whether you’re a builder, a supplier, or a customer looking for the best deals, we’re here to make it happen.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/signup" className="btn-primary">
              Create Account
            </Link>
            <Link to="/services" className="btn-outline">
              Browse Services
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
