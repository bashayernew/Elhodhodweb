// Generate 6-digit OTP
exports.generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Validate Kuwait phone number format (+965XXXXXXXXX)
exports.validatePhone = (phone) => {
  const phoneRegex = /^\+965[0-9]{8}$/;
  return phoneRegex.test(phone);
};

// Format phone number for display
exports.formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remove +965 prefix and format as 05XXXXXXX
  if (phone.startsWith('+965')) {
    return '0' + phone.substring(4);
  }
  
  return phone;
};

// Parse phone number from display format
exports.parsePhone = (displayPhone) => {
  if (!displayPhone) return '';
  
  // Add +965 prefix if not present
  if (displayPhone.startsWith('0')) {
    return '+965' + displayPhone.substring(1);
  }
  
  if (displayPhone.startsWith('+965')) {
    return displayPhone;
  }
  
  return '+965' + displayPhone;
};

// Check if OTP is expired
exports.isOtpExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

// Calculate OTP remaining time in seconds
exports.getOtpRemainingTime = (expiresAt) => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
  return remaining;
};

// Generate secure random string
exports.generateSecureString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate password strength
exports.validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(5, 5 - errors.length)
  };
};

// Sanitize user input
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// Validate email format
exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Rate limiting helper
exports.createRateLimiter = (maxAttempts, windowMs) => {
  const attempts = new Map();
  
  return (identifier) => {
    const now = Date.now();
    const userAttempts = attempts.get(identifier) || [];
    
    // Remove expired attempts
    const validAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false; // Rate limited
    }
    
    // Add current attempt
    validAttempts.push(now);
    attempts.set(identifier, validAttempts);
    
    return true; // Allowed
  };
};
