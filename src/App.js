import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Import i18n configuration
import './i18n';

// Import context providers
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Import components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LanguageOnboarding from './components/LanguageOnboarding';

// Import pages
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import ProvidersPage from './pages/ProvidersPage';
import ProviderProfilePage from './pages/ProviderProfilePage';
import UserPublicProfilePage from './pages/UserPublicProfilePage';
import ProviderMeRedirect from './pages/ProviderMeRedirect';
import FavoritesPage from './pages/FavoritesPage';
import PostRequestPage from './pages/PostRequestPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import AuctionsPage from './pages/AuctionsPage';
import CreateAuctionPage from './pages/CreateAuctionPage';
import AuctionDetailsPage from './pages/AuctionDetailsPage';
import AuctionBidsPage from './pages/AuctionBidsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';

// Import dashboard pages
import UserDashboard from './pages/Dashboard/UserDashboard';
import ProviderDashboard from './pages/Dashboard/ProviderDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';

// Import other pages
import MessagesPage from './pages/MessagesPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import PlansPage from './pages/PlansPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { i18n } = useTranslation();

  // Set document direction based on language
  React.useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <div className="App min-h-screen bg-white">
                <LanguageOnboarding />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Layout><HomePage /></Layout>} />
                  <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
                  <Route path="/services/:id" element={<Layout><ServiceDetailsPage /></Layout>} />
                  <Route path="/providers" element={<Layout><ProvidersPage /></Layout>} />
                  <Route path="/providers/:id" element={<Layout><ProviderProfilePage /></Layout>} />
                  <Route path="/providers/me" element={<Layout><ProviderMeRedirect /></Layout>} />
                  <Route path="/users/:id" element={<Layout><UserPublicProfilePage /></Layout>} />
                  <Route path="/favorites" element={<Layout><FavoritesPage /></Layout>} />
                  <Route path="/post-request" element={<Layout><PostRequestPage /></Layout>} />
                  <Route path="/post-product-request" element={<Layout><PostRequestPage /></Layout>} />
                  <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
                  <Route path="/products/:id" element={<Layout><ProductDetailsPage /></Layout>} />
                  <Route path="/auctions" element={<Layout><AuctionsPage /></Layout>} />
                  <Route path="/auctions/:id" element={<Layout><AuctionDetailsPage /></Layout>} />
                  <Route path="/auctions/:id/bids" element={<Layout><AuctionBidsPage /></Layout>} />
                  <Route path="/create-auction" element={<Layout><CreateAuctionPage /></Layout>} />
                  <Route path="/about" element={<Layout><AboutPage /></Layout>} />
                  <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />

                  {/* Protected User Routes */}
                  <Route 
                    path="/dashboard/user" 
                    element={
                      <ProtectedRoute userType="user">
                        <Layout><UserDashboard /></Layout>
                      </ProtectedRoute>
                    } 
                  />

                  {/* Protected Provider Routes */}
                  <Route 
                    path="/dashboard/provider" 
                    element={
                      <ProtectedRoute userType="provider">
                        <Layout><ProviderDashboard /></Layout>
                      </ProtectedRoute>
                    } 
                  />

                  {/* Protected Admin Routes */}
                  <Route 
                    path="/dashboard/admin" 
                    element={
                      <ProtectedRoute userType="admin">
                        <Layout><AdminDashboard /></Layout>
                      </ProtectedRoute>
                    } 
                  />

                  {/* Other Protected Routes */}
                  <Route 
                    path="/messages" 
                    element={
                      <ProtectedRoute>
                        <Layout><MessagesPage /></Layout>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/wallet" 
                    element={
                      <ProtectedRoute>
                        <Layout><WalletPage /></Layout>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Layout><ProfilePage /></Layout>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/plans" 
                    element={
                      <ProtectedRoute>
                        <Layout><PlansPage /></Layout>
                      </ProtectedRoute>
                    } 
                  />
                </Routes>

                {/* Toast notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#D4AF37',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
