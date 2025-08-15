import express from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import connectPg from "connect-pg-simple";

const PostgresStore = connectPg(session);

// Session configuration for pure local auth
export function getPureLocalAuthSession() {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';
  
  console.log('Session configuration:', {
    isProduction,
    NODE_ENV: process.env.NODE_ENV,
    REPLIT_DEPLOYMENT: process.env.REPLIT_DEPLOYMENT,
    hasDatabase: !!process.env.DATABASE_URL
  });
  
  return session({
    name: 'electrocare_session',
    secret: process.env.SESSION_SECRET || 'electrocare-local-auth-secret-key',
    store: new PostgresStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false, // Use existing sessions table
      tableName: 'sessions' // Use the existing sessions table from schema
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Disable secure for now to test if this is the issue
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax', // Allow cross-site requests for deployment
    },
  });
}

// Setup pure local authentication routes
export function setupPureLocalAuth(app: express.Express) {
  // Login route
  app.post("/api/local-db-auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).send("Email and password are required");
      }

      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).send("Invalid credentials");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).send("Invalid credentials");
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).send("Account is not active");
      }

      // Store user in session
      (req.session as any).userId = user.id;

      // Return user data (without password hash)
      const { passwordHash, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Register route
  app.post("/api/local-db-auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, role = 'customer' } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).send("All fields are required");
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).send("Email already registered");
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const newUser = await storage.createUser({
        email,
        firstName,
        lastName,
        passwordHash,
        role: role as 'admin' | 'technician' | 'customer',
        status: 'active'
      });

      // Store user in session
      (req.session as any).userId = newUser.id;

      // Return user data (without password hash)
      const { passwordHash: _, ...userResponse } = newUser;
      res.json(userResponse);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Get current user route
  app.get("/api/local-db-auth/user", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Return user data (without password hash)
      const { passwordHash, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout route
  app.post("/api/local-db-auth/logout", (req, res) => {
    try {
      const sessionId = req.sessionID;
      console.log("Logout attempt for session:", sessionId);
      
      req.session.destroy((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid');
        res.clearCookie('electrocare_session');
        console.log("Session destroyed successfully");
        res.sendStatus(200);
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}

// Middleware to check if user is authenticated with pure local auth
export function requirePureLocalAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  next();
}

// Middleware to get current user from pure local auth
export async function getCurrentLocalUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userId = (req.session as any)?.userId;
  
  if (userId) {
    try {
      const user = await storage.getUser(userId);
      if (user) {
        (req as any).localUser = user;
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  }
  
  next();
}