import { Router } from 'express';
import passport from '../config/passport';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const router = Router();

// Helper function to generate JWT token
const generateToken = (user: any) => {
  logger.debug('generateToken - Input user:', { 
    Id: user.Id, 
    Email: user.Email, 
    Username: user.Username,
    id: user.id,
    email: user.email,
    username: user.username
  });

  // Handle both capitalized (from database) and lowercase property names
  const id = user.Id || user.id;
  const email = user.Email || user.email;
  const username = user.Username || user.username || (email && email.split('@')[0]);

  logger.debug('generateToken - Processed values:', { id, email, username });

  return jwt.sign(
    { 
      id, 
      email,
      username,
      fullName: user.FullName || user.fullName,
      profilePicture: user.ProfilePicture || user.profilePicture
    },
    process.env.JWT_SECRET || 'your-super-secure-jwt-secret-change-this-in-production',
    { expiresIn: '7d' }
  );
};

// Google OAuth Routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      logger.debug('Google OAuth callback - req.user:', req.user);
      
      const user = req.user as any;
      if (!user) {
        logger.error('Google OAuth callback - No user found in req.user');
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:4200'}/login?error=auth_failed`);
      }

      logger.debug('Google OAuth callback - User found:', { 
        Id: user.Id, 
        Email: user.Email, 
        Username: user.Username,
        id: user.id,
        email: user.email,
        username: user.username 
      });
      
      const token = generateToken(user);
      logger.debug('Google OAuth callback - Token generated successfully');
      
      // Redirect to frontend with token
      const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:4200'}/auth/callback?token=${token}&provider=google`;
      logger.debug('Google OAuth callback - Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:4200'}/login?error=server_error`);
    }
  }
);

// Facebook OAuth Routes
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:4200'}/login?error=auth_failed`);
      }

      const token = generateToken(user);
      
      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:4200'}/auth/callback?token=${token}&provider=facebook`);
    } catch (error) {
      logger.error('Facebook OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:4200'}/login?error=server_error`);
    }
  }
);

// Apple OAuth Routes (simplified for now - Apple OAuth is more complex)
// Note: Apple OAuth requires additional setup including key files and certificates
router.get('/apple', (req, res) => {
  res.status(501).json({ 
    error: 'Apple OAuth not implemented yet',
    message: 'Apple OAuth requires additional setup with certificates and key files. Please use Google or Facebook for now.'
  });
});

// OAuth status endpoint
router.get('/oauth/status', (req, res) => {
  const providers = {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    facebook: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
    apple: false // Set to true when properly configured
  };
  
  res.json({ providers });
});

export default router;
