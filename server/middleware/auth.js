const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        provider: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User account is not active'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to require admin role
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Middleware to require provider role
const requireProvider = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Provider access required'
      });
    }

    next();
  } catch (error) {
    console.error('Provider middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Middleware to block pending verification providers from certain actions
const pendingGuard = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Provider access required'
      });
    }

    // Check if provider is pending verification
    if (req.user.provider?.verificationStatus === 'pending_verification') {
      return res.status(403).json({
        success: false,
        message: 'Account pending verification. Please wait for admin approval.',
        code: 'PENDING_VERIFICATION'
      });
    }

    next();
  } catch (error) {
    console.error('Pending guard middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Middleware to require verified provider
const requireVerifiedProvider = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Provider access required'
      });
    }

    if (req.user.provider?.verificationStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Provider account must be verified'
      });
    }

    next();
  } catch (error) {
    console.error('Verified provider middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Optional authentication - doesn't fail if no token, but adds user if present
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          profile: true,
          provider: true
        }
      });

      if (user && user.status === 'active') {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireProvider,
  pendingGuard,
  requireVerifiedProvider,
  optionalAuth
};
