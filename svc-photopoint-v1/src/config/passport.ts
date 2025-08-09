import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from 'passport-facebook';
import { UserRepository } from '../database/userRepository';

const userRepository = UserRepository;

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userRepository.findById(id);
    done(null, user);
  } catch (error) {
    done(error, undefined);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.OAUTH_CALLBACK_URL}/google/callback`
  },
  async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback) => {
    try {
      console.log('Google strategy - Processing profile:', { 
        id: profile.id, 
        email: profile.emails?.[0]?.value, 
        displayName: profile.displayName 
      });

      // Check if user already exists by OAuth ID first
      let user = await userRepository.findByOAuthId('google', profile.id);
      console.log('Google strategy - Found by OAuth ID:', user ? 'Yes' : 'No');
      
      if (user) {
        console.log('Google strategy - Returning existing OAuth user:', { id: user.id, email: user.email });
        return done(null, user);
      }
      
      // Check if user exists by email
      user = await userRepository.findByEmail(profile.emails?.[0]?.value || '');
      console.log('Google strategy - Found by email:', user ? 'Yes' : 'No');
      
      if (user) {
        // User exists, update OAuth info
        console.log('Google strategy - Updating OAuth ID for existing user');
        const updatedUser = await userRepository.updateOAuthId(user.id, 'google', profile.id);
        console.log('Google strategy - OAuth ID updated:', updatedUser ? 'Success' : 'Failed');
        return done(null, updatedUser || user);
      }
      
      // Create new user
      console.log('Google strategy - Creating new OAuth user');
      const newUser = await userRepository.createOAuthUser({
        email: profile.emails?.[0]?.value || '',
        username: profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || '',
        fullName: profile.displayName || '',
        profilePicture: profile.photos?.[0]?.value,
        provider: 'google',
        providerId: profile.id
      });
      console.log('Google strategy - New user created:', newUser ? 'Success' : 'Failed', newUser?.id);
      
      return done(null, newUser);
    } catch (error) {
      console.error('Google strategy error:', error);
      return done(error, undefined);
    }
  }));
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.OAUTH_CALLBACK_URL}/facebook/callback`,
    profileFields: ['id', 'emails', 'name', 'photos']
  },
  async (accessToken: string, refreshToken: string, profile: FacebookProfile, done: VerifyCallback) => {
    try {
      // Check if user already exists by OAuth ID first
      let user = await userRepository.findByOAuthId('facebook', profile.id);
      
      if (user) {
        return done(null, user);
      }
      
      // Check if user exists by email
      user = await userRepository.findByEmail(profile.emails?.[0]?.value || '');
      
      if (user) {
        // User exists, update OAuth info
        const updatedUser = await userRepository.updateOAuthId(user.id, 'facebook', profile.id);
        return done(null, updatedUser || user);
      }
      
      // Create new user
      const newUser = await userRepository.createOAuthUser({
        email: profile.emails?.[0]?.value || '',
        username: `${profile.name?.givenName || ''}${profile.name?.familyName || ''}`.toLowerCase() || profile.emails?.[0]?.value?.split('@')[0] || '',
        fullName: `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
        profilePicture: profile.photos?.[0]?.value,
        provider: 'facebook',
        providerId: profile.id
      });
      
      return done(null, newUser);
    } catch (error) {
      return done(error, undefined);
    }
  }));
}

export default passport;
