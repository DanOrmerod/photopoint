import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../database/userRepository';

const router = Router();

// Registration endpoint
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body;
    
    if (!email || !password || !username) {
      res.status(400).json({ error: 'Email, password, and username are required' });
      return;
    }

    // Check if user already exists by email or username
    const existingEmail = await UserRepository.findByEmail(email);
    if (existingEmail) {
      res.status(409).json({ error: 'User already exists with this email' });
      return;
    }

    const existingUsername = await UserRepository.findByUsername(username);
    if (existingUsername) {
      res.status(409).json({ error: 'User already exists with this username' });
      return;
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await UserRepository.createUser({ email, passwordHash, username });
    
    // Issue JWT token for automatic login
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email }, 
      process.env.JWT_SECRET || 'devsecret', 
      { expiresIn: '24h' }
    );
    
    // Return token with user profile information for immediate login
    res.json({ 
      success: true,
      token,
      user: {
        email: newUser.email,
        username: newUser.username,
        fullName: newUser.fullName,
        profilePicture: newUser.profilePicture
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user in database
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.passwordHash) {
      res.status(401).json({ error: 'Please use social login for this account' });
      return;
    }

    // Verify password - passwordHash is guaranteed to be non-null here
    const valid = await bcrypt.compare(password, user.passwordHash as string);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Issue JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'devsecret', 
      { expiresIn: '24h' }
    );
    
    // Return token with user profile information
    res.json({ 
      token,
      user: {
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
