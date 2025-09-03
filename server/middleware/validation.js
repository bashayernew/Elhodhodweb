const { body, validationResult } = require('express-validator');
const { validatePassword, validateEmail, validatePhone } = require('../utils/authUtils');
const isDev = process.env.NODE_ENV !== 'production';

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Signup validation
exports.validateSignup = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\u0600-\u06FF]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\u0600-\u06FF]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((value) => {
      if (isDev) return true;
      const validation = validatePassword(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),
  
  body('phone')
    .custom((value) => {
      if (validatePhone(value)) return true;
      // Dev fallback: allow 8-12 digits without +965
      if (isDev && /^\+?\d{8,12}$/.test(value)) return true;
      throw new Error('Invalid phone number format. Use +965XXXXXXXXX');
    }),
  
  body('acceptTerms')
    .isBoolean()
    .withMessage('Terms acceptance is required')
    .custom((value) => {
      if (!value) {
        throw new Error('You must accept the terms and conditions');
      }
      return true;
    }),
  
  // Provider-specific validation
  body('subrole')
    .if(body('role').equals('provider'))
    .isIn(['individual', 'company'])
    .withMessage('Subrole must be either individual or company'),
  
  body('divisions')
    .if(body('role').equals('provider'))
    .isIn(['services', 'products', 'both'])
    .withMessage('Divisions must be services, products, or both'),
  
  body('preferredLang')
    .optional()
    .isIn(['en', 'ar'])
    .withMessage('Preferred language must be en or ar'),
  
  handleValidationErrors
];

// Login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// OTP validation
exports.validateOtp = [
  body('phone')
    .custom((value) => {
      if (!validatePhone(value)) {
        throw new Error('Invalid phone number format. Use +965XXXXXXXXX');
      }
      return true;
    }),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('otp')
    .if(body('otp').exists())
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
  
  handleValidationErrors
];

// Provider profile validation
exports.validateProviderProfile = [
  body('brandName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Brand name must be between 2 and 100 characters'),
  
  body('categories')
    .isArray({ min: 1 })
    .withMessage('At least one category must be selected')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Categories must be an array with at least one item');
      }
      return true;
    }),
  
  body('governorate')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Governorate must be between 2 and 50 characters'),
  
  body('area')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Area must be between 2 and 50 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  
  body('serviceRadiusKm')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Service radius must be between 1 and 100 km'),
  
  body('workHours')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Work hours must be less than 200 characters'),
  
  body('crNumber')
    .optional()
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('CR number must be between 5 and 20 characters'),
  
  body('taxNumber')
    .optional()
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Tax number must be between 5 and 20 characters'),
  
  handleValidationErrors
];

// Document upload validation
exports.validateDocumentUpload = [
  body('type')
    .isIn([
      'civil_id_front',
      'civil_id_back',
      'license',
      'articles_of_incorporation',
      'signature_authorization',
      'partner_civil_id'
    ])
    .withMessage('Invalid document type'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  
  handleValidationErrors
];

// Admin action validation
exports.validateAdminAction = [
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be either approve or reject'),
  
  body('reason')
    .if(body('action').equals('reject'))
    .notEmpty()
    .withMessage('Reason is required when rejecting a provider')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  
  handleValidationErrors
];
