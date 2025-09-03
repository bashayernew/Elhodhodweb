const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendOtpEmail } = require('../services/emailService');
const { generateOtp, validatePhone } = require('../utils/authUtils');

const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// User Signup (Step 1: Account Creation)
exports.userSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, phone, acceptTerms, governorate, area, block, street, houseNumber, latitude, longitude } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phone || !acceptTerms) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate phone format (+965XXXXXXXXX)
    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Use +965XXXXXXXXX'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone: phone },
          ...(username ? [{ username: username.toLowerCase() }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email.toLowerCase() 
          ? 'Email already registered' 
          : 'Phone number already registered'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        role: 'user',
        email: email.toLowerCase(),
        username: username ? username.toLowerCase() : null,
        phone,
        passwordHash,
        lang: 'en', // default language
        profile: {
          create: {
            firstName,
            lastName,
            governorate: governorate || null,
            area: area || null,
            block: block || null,
            street: street || null,
            houseNumber: houseNumber || null
          }
        }
      },
      include: {
        profile: true
      }
    });

    // Generate and send OTP
    const otp = (process.env.NODE_ENV !== 'production') ? '123456' : generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    
    await prisma.otp.create({
      data: {
        phone,
        codeHash: otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.status(201).json({
      success: true,
      message: 'User account created successfully. Please verify your phone number.',
      data: {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        token: generateToken(user.id, user.role)
      }
    });

  } catch (error) {
    console.error('User signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Provider Signup (Step 1: Account Creation)
exports.providerSignup = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      username,
      password, 
      phone, 
      subrole, 
      divisions, 
      preferredLang,
      acceptTerms,
      categories,
      governorate,
      area,
      block,
      street,
      houseNumber,
      latitude,
      longitude 
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phone || !subrole || !divisions || !acceptTerms) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate subrole
    if (!['individual', 'company'].includes(subrole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subrole. Must be individual or company'
      });
    }

    // Validate divisions
    if (!['services', 'products', 'both'].includes(divisions)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid divisions. Must be services, products, or both'
      });
    }

    // Validate phone format
    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Use +965XXXXXXXXX'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone: phone },
          ...(username ? [{ username: username.toLowerCase() }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email.toLowerCase() 
          ? 'Email already registered' 
          : 'Phone number already registered'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with provider profile
    const user = await prisma.user.create({
      data: {
        role: 'provider',
        subrole,
        email: email.toLowerCase(),
        username: username ? username.toLowerCase() : null,
        phone,
        passwordHash,
        lang: preferredLang || 'en',
        profile: {
          create: {
            firstName,
            lastName,
            governorate: governorate || null,
            area: area || null,
            block: block || null,
            street: street || null,
            houseNumber: houseNumber || null
          }
        },
        provider: {
          create: {
            brandName: `${firstName} ${lastName}`,
            divisions,
            categories: Array.isArray(categories) ? JSON.stringify(categories) : (categories || '[]'),
            verificationStatus: 'pending_verification'
          }
        }
      },
      include: {
        profile: true,
        provider: true
      }
    });

    // Generate and send OTP
    const otp = (process.env.NODE_ENV !== 'production') ? '123456' : generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    
    await prisma.otp.create({
      data: {
        phone,
        codeHash: otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.status(201).json({
      success: true,
      message: 'Provider account created successfully. Please verify your phone number.',
      data: {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        subrole: user.subrole,
        divisions: user.provider.divisions,
        token: generateToken(user.id, user.role)
      }
    });

  } catch (error) {
    console.error('Provider signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone || !email) {
      return res.status(400).json({
        success: false,
        message: 'Phone and email are required'
      });
    }

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: {
        phone,
        email: email.toLowerCase()
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if phone is already verified
    if (user.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is already verified'
      });
    }

    // Check rate limiting (max 3 OTPs per 10 minutes)
    const recentOtps = await prisma.otp.count({
      where: {
        phone,
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
        }
      }
    });

    if (recentOtps >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please wait before requesting another.'
      });
    }

    // Generate and send OTP
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    
    await prisma.otp.create({
      data: {
        phone,
        codeHash: otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, email, otp } = req.body;

    if (!phone || !email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone, email, and OTP are required'
      });
    }

    // Find the most recent OTP for this phone
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found'
      });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP (allow dev override)
    let isValidOtp = false;
    if (process.env.NODE_ENV !== 'production' && otp === '123456') {
      isValidOtp = true;
    } else {
      isValidOtp = await bcrypt.compare(otp, otpRecord.codeHash);
    }
    
    if (!isValidOtp) {
      // Increment attempts
      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 }
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        phone,
        email: email.toLowerCase()
      },
      include: {
        profile: true,
        provider: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Mark phone as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true }
    });

    // Delete used OTP
    await prisma.otp.delete({
      where: { id: otpRecord.id }
    });

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      data: {
        token,
        user: {
          id: user.id,
          role: user.role,
          subrole: user.subrole,
          email: user.email,
          phone: user.phone,
          phoneVerified: true,
          lang: user.lang,
          profile: user.profile,
          provider: user.provider
        }
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; // 'email' field may contain email/phone/username from FE

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email OR phone OR username
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone: email },
          { username: email.toLowerCase() }
        ]
      },
      include: {
        profile: true,
        provider: true
      }
    });

    // Dev fallback: allow admin bootstrap without restart
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@hodhod.com').toLowerCase();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    const ADMIN_PHONE = process.env.ADMIN_PHONE || '+96500000000';
    if (!user && process.env.NODE_ENV !== 'production' && email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      try {
        user = await prisma.user.upsert({
          where: { email: ADMIN_EMAIL },
          update: { role: 'admin', phoneVerified: true },
          create: {
            role: 'admin',
            email: ADMIN_EMAIL,
            username: 'admin',
            phone: ADMIN_PHONE,
            phoneVerified: true,
            passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
            profile: { create: { firstName: 'Admin', lastName: 'User' } }
          },
          include: { profile: true, provider: true }
        });
      } catch (e) {
        // ignore
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if phone is verified
    if (!user.phoneVerified && user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Please verify your phone number first'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          role: user.role,
          subrole: user.subrole,
          email: user.email,
          phone: user.phone,
          phoneVerified: user.phoneVerified,
          lang: user.lang,
          profile: user.profile,
          provider: user.provider
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        profile: true,
        provider: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          role: user.role,
          subrole: user.subrole,
          email: user.email,
          phone: user.phone,
          phoneVerified: user.phoneVerified,
          lang: user.lang,
          profile: user.profile,
          provider: user.provider
        }
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
