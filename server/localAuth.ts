import bcrypt from 'bcrypt';
import session from 'express-session';
import type { Express, RequestHandler } from 'express';
import { storage } from './storage';
import type { LocalUser, InsertLocalUser } from '@shared/schema';

// Session configuration for local auth
export function getLocalAuthSession() {
  return session({
    secret: process.env.SESSION_SECRET || 'local-auth-secret-key',
    resave: false,
    saveUninitialized: false,
    name: 'local-auth-session',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  });
}

// Hash password function
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password function
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Middleware to check if user is authenticated via local auth
export const isLocallyAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session.localUserId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await storage.getLocalUser(req.session.localUserId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    req.localUser = user;
    next();
  } catch (error) {
    console.error('Error checking local authentication:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// Setup local authentication routes
export function setupLocalAuth(app: Express) {
  // Register a new user
  app.post('/api/local-auth/register', async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getLocalUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists with this email' });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const newUser = await storage.createLocalUser({
        firstName,
        lastName,
        email,
        passwordHash,
        role: 'customer',
        status: 'active',
      });

      res.status(201).json({ 
        message: 'User created successfully',
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // Login a user
  app.post('/api/local-auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user by email
      const user = await storage.getLocalUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({ message: 'Account is inactive' });
      }

      // Set session
      req.session.localUserId = user.id;

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Get current local user
  app.get('/api/local-auth/user', async (req, res) => {
    try {
      if (!req.session.localUserId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await storage.getLocalUser(req.session.localUserId);
      if (!user) {
        req.session.localUserId = undefined;
        return res.status(401).json({ message: 'User not found' });
      }

      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Logout
  app.get('/api/local-auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('local-auth-session');
      res.redirect('/');
    });
  });
}

declare global {
  namespace Express {
    interface Request {
      localUser?: LocalUser;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    localUserId?: string;
  }
}