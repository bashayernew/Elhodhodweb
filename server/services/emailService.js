const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    }
  });
};

// Send OTP email
exports.sendOtpEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"HodHod Marketplace" <${process.env.SMTP_USER || 'noreply@hodhod.com'}>`,
      to: email,
      subject: 'Verify Your Phone Number - HodHod Marketplace',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">HodHod Marketplace</h1>
              <p style="color: #666; margin: 10px 0 0 0;">Your trusted marketplace for construction and renovation services</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 15px 0; font-size: 20px;">Phone Verification Required</h2>
              <p style="color: #666; margin: 0 0 20px 0; line-height: 1.6;">
                Thank you for signing up with HodHod! To complete your registration, please verify your phone number using the OTP code below.
              </p>
              
              <div style="background-color: #D4AF37; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h3 style="margin: 0; font-size: 32px; letter-spacing: 5px; font-family: monospace;">${otp}</h3>
                <p style="margin: 10px 0 0 0; font-size: 14px;">Your verification code</p>
              </div>
              
              <p style="color: #666; margin: 20px 0 0 0; font-size: 14px; line-height: 1.5;">
                <strong>Important:</strong> This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; margin: 0; font-size: 12px;">
                © 2025 HodHod Marketplace. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        HodHod Marketplace - Phone Verification
        
        Your verification code is: ${otp}
        
        This code will expire in 10 minutes.
        
        If you didn't request this code, please ignore this email.
        
        © 2025 HodHod Marketplace. All rights reserved.
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('Error sending OTP email:', error);
    
    // In development, log the OTP to console
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 DEVELOPMENT MODE: OTP for', email, 'is:', otp);
    }
    
    return false;
  }
};

// Send welcome email
exports.sendWelcomeEmail = async (email, firstName, role) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"HodHod Marketplace" <${process.env.SMTP_USER || 'noreply@hodhod.com'}>`,
      to: email,
      subject: 'Welcome to HodHod Marketplace!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">Welcome to HodHod!</h1>
              <p style="color: #666; margin: 10px 0 0 0;">Your trusted marketplace for construction and renovation services</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 15px 0; font-size: 20px;">Hello ${firstName}!</h2>
              <p style="color: #666; margin: 0 0 20px 0; line-height: 1.6;">
                Welcome to HodHod Marketplace! Your account has been successfully created and verified.
              </p>
              
              <div style="background-color: #D4AF37; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h3 style="margin: 0; font-size: 18px;">Account Type: ${role === 'provider' ? 'Service Provider' : 'User'}</h3>
              </div>
              
              <p style="color: #666; margin: 20px 0 0 0; line-height: 1.5;">
                You can now start using all the features of our platform. 
                ${role === 'provider' ? 'Complete your business profile to start receiving service requests.' : 'Browse services and post requests for your projects.'}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Get Started
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; margin: 0; font-size: 12px;">
                © 2025 HodHod Marketplace. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        Welcome to HodHod Marketplace!
        
        Hello ${firstName},
        
        Welcome to HodHod Marketplace! Your account has been successfully created and verified.
        Account Type: ${role === 'provider' ? 'Service Provider' : 'User'}
        
        You can now start using all the features of our platform.
        ${role === 'provider' ? 'Complete your business profile to start receiving service requests.' : 'Browse services and post requests for your projects.'}
        
        Get started: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
        
        © 2025 HodHod Marketplace. All rights reserved.
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send provider verification status email
exports.sendVerificationStatusEmail = async (email, firstName, status, reason = null) => {
  try {
    const transporter = createTransporter();
    
    const statusText = status === 'approved' ? 'Approved' : 'Rejected';
    const statusColor = status === 'approved' ? '#28a745' : '#dc3545';
    
    const mailOptions = {
      from: `"HodHod Marketplace" <${process.env.SMTP_USER || 'noreply@hodhod.com'}>`,
      to: email,
      subject: `Provider Verification ${statusText} - HodHod Marketplace`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">HodHod Marketplace</h1>
              <p style="color: #666; margin: 10px 0 0 0;">Provider Verification Update</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 15px 0; font-size: 20px;">Hello ${firstName}!</h2>
              
              <div style="background-color: ${statusColor}; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h3 style="margin: 0; font-size: 18px;">Verification Status: ${statusText}</h3>
              </div>
              
              <p style="color: #666; margin: 20px 0 0 0; line-height: 1.5;">
                ${status === 'approved' 
                  ? 'Congratulations! Your provider account has been verified and approved. You can now start posting services and accepting orders.'
                  : `Your provider account verification has been rejected. Reason: ${reason || 'No reason provided'}. Please review and resubmit your documents.`
                }
              </p>
              
              ${status === 'rejected' ? `
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="color: #856404; margin: 0; font-size: 14px;">
                    <strong>Next Steps:</strong> Please review the rejection reason, update your documents if needed, and resubmit for verification.
                  </p>
                </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/provider" style="background-color: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; margin: 0; font-size: 12px;">
                © 2025 HodHod Marketplace. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        HodHod Marketplace - Provider Verification Update
        
        Hello ${firstName},
        
        Your provider account verification status: ${statusText}
        
        ${status === 'approved' 
          ? 'Congratulations! Your provider account has been verified and approved. You can now start posting services and accepting orders.'
          : `Your provider account verification has been rejected. Reason: ${reason || 'No reason provided'}. Please review and resubmit your documents.`
        }
        
        ${status === 'rejected' ? 'Next Steps: Please review the rejection reason, update your documents if needed, and resubmit for verification.' : ''}
        
        Go to Dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/provider
        
        © 2025 HodHod Marketplace. All rights reserved.
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification status email sent:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('Error sending verification status email:', error);
    return false;
  }
};

// Test email service
exports.testEmailService = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
};
