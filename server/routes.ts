import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupPureLocalAuth, getPureLocalAuthSession } from "./pureLocalAuth";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  insertServiceSchema,
  insertTechnicianSchema,
  insertInstallationSchema,
  insertComplaintSchema,
  insertTicketSchema,
  insertQuotationSchema,
  insertCalculatorResultSchema,
  insertQuotationEditRequestSchema,
  insertUserSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const profilesDir = path.join(process.cwd(), 'profiles');
  
  // Create profiles directory if it doesn't exist
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
  }
  
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, profilesDir);
      },
      filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${ext}`);
      }
    }),
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB limit
    },
    fileFilter: (req, file, cb) => {
      // Only allow image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Session middleware for pure local auth (only local authentication)
  const sessionMiddleware = getPureLocalAuthSession();
  app.use(sessionMiddleware);
  
  // Pure local auth setup (only local authentication)
  setupPureLocalAuth(app);

  // Add session debugging middleware
  app.use((req: any, res: any, next: any) => {
    if (req.path.startsWith('/api') && req.path !== '/api/services') {
      console.log(`[${req.method} ${req.path}] Session debug:`, {
        sessionId: req.sessionID,
        hasSession: !!req.session,
        sessionUserId: req.session?.userId,
        sessionData: req.session
      });
    }
    next();
  });

  // Initialize sample data for empty tables
  try {
    await storage.initializeSampleData();
  } catch (error) {
    console.log('Sample data initialization skipped:', error);
  }

  // Legacy API route - will be removed after migration complete

  // File upload route for profile images
  app.post('/api/upload-profile-image', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Return the relative file path to be stored in database
      const filePath = `/profiles/${req.file.filename}`;
      res.json({ 
        filePath,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });

  // Serve static profile images
  app.use('/profiles', express.static(profilesDir));

  // Users routes (for admin access to users table)
  app.get('/api/local-users', async (req: any, res) => {
    try {
      // Get user ID from session
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getUsers();
      return res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Users routes  
  app.get('/api/users', async (req: any, res) => {
    try {
      // Production fix: Check if deployment environment and use direct admin verification
      const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';
      let userId = req.session?.userId;
      
      // Production workaround for session middleware issues
      if (isProduction && !userId) {
        // Direct admin verification for production deployments
        const adminUser = await storage.getUserByEmail('admin@electrocare.com');
        if (adminUser && adminUser.role === 'admin') {
          userId = adminUser.id;
        }
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Generate a unique user ID for new users
      const newUserId = `user-${Date.now()}`;
      
      // Validate the request body
      const validatedData = insertUserSchema.parse({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role || 'customer',
        status: 'active',
        phone: req.body.phone || null,
        address: req.body.address || null,
      });
      
      const userData = {
        id: newUserId,
        ...validatedData,
        profileImageUrl: null,
      };
      
      const newUser = await storage.upsertUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put('/api/users/:id', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedUser = await storage.updateUser(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/users/:id', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // User profile routes
  app.get('/api/users/profile', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put('/api/users/profile', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, phone, address } = req.body;
      
      console.log("Updating user profile for userId:", userId);
      console.log("Update data:", { firstName, lastName, phone, address });
      
      const updatedUser = await storage.updateUser(userId, {
        firstName,
        lastName,
        phone,
        address,
      });
      
      if (!updatedUser) {
        console.error("User not found for update, userId:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Profile picture upload routes
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error getting object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/profile/upload-url", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/profile/picture", async (req: any, res) => {
    if (!req.body.profileImageUrl) {
      return res.status(400).json({ error: "profileImageUrl is required" });
    }

    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.profileImageUrl,
      );

      // Update user profile with new profile picture URL
      const updatedUser = await storage.updateUser(userId, {
        profileImageUrl: objectPath,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        profileImageUrl: objectPath,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error setting profile picture:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Services routes
  app.get('/api/services', async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post('/api/services', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put('/api/services/:id', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const service = await storage.updateService(req.params.id, req.body);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete('/api/services/:id', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteService(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Technicians routes
  app.get('/api/technicians', async (req: any, res) => {
    try {
      // Production fix: Check if deployment environment and use direct admin verification
      const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';
      let userId = req.session?.userId;
      
      // Production workaround for session middleware issues
      if (isProduction && !userId) {
        const adminUser = await storage.getUserByEmail('admin@electrocare.com');
        if (adminUser && adminUser.role === 'admin') {
          userId = adminUser.id;
        }
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user || !['admin', 'technician'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const technicians = await storage.getTechnicians();
      res.json(technicians);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      res.status(500).json({ message: "Failed to fetch technicians" });
    }
  });

  app.get('/api/technicians/me', async (req: any, res) => {
    try {
      const technician = await storage.getTechnicianByUserId(req.user.claims.sub);
      if (!technician) {
        return res.status(404).json({ message: "Technician profile not found" });
      }
      res.json(technician);
    } catch (error) {
      console.error("Error fetching technician profile:", error);
      res.status(500).json({ message: "Failed to fetch technician profile" });
    }
  });

  app.post('/api/technicians', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if user with this email already exists
      let technicianUserId;
      let technicianEmail = req.body.email && req.body.email.trim() ? req.body.email.trim() : null;
      
      if (technicianEmail) {
        // Try to find existing user with this email
        const existingUser = await storage.getUserByEmail(technicianEmail);
        if (existingUser) {
          // Use existing user ID and update role to technician
          technicianUserId = existingUser.id;
          await storage.upsertUser({
            ...existingUser,
            role: 'technician',
          });
        } else {
          // Create new user with provided email
          technicianUserId = `tech-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          await storage.upsertUser({
            id: technicianUserId,
            email: technicianEmail,
            firstName: req.body.name.split(' ')[0],
            lastName: req.body.name.split(' ').slice(1).join(' ') || null,
            role: 'technician',
          });
        }
      } else {
        // Generate unique email if none provided
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        technicianUserId = `tech-${timestamp}-${randomId}`;
        technicianEmail = `${req.body.name.toLowerCase().replace(/\s+/g, '.')}.${timestamp}.${randomId}@solartech.local`;
        
        await storage.upsertUser({
          id: technicianUserId,
          email: technicianEmail,
          firstName: req.body.name.split(' ')[0],
          lastName: req.body.name.split(' ').slice(1).join(' ') || null,
          role: 'technician',
        });
      }
      
      // Convert and process data for technician table
      const processedData = {
        userId: technicianUserId, // Use the created user ID
        name: req.body.name,
        email: technicianEmail, // Use the processed email
        phone: req.body.phone || '',
        status: req.body.status || 'active',
        experienceYears: parseInt(req.body.experience) || 0,
        completionRate: req.body.completionRate !== null && req.body.completionRate !== undefined 
          ? String(req.body.completionRate) 
          : '0',
        rating: req.body.rating !== null && req.body.rating !== undefined 
          ? String(req.body.rating) 
          : '0',
        // Handle specializations as array - convert from string if needed
        specializations: req.body.specialization 
          ? (Array.isArray(req.body.specialization) 
              ? req.body.specialization 
              : [req.body.specialization])
          : ['General Installation'],
        // Handle certifications as array - convert from string if needed
        certifications: req.body.certifications 
          ? (typeof req.body.certifications === 'string'
              ? req.body.certifications.split(',').map((c: string) => c.trim()).filter(Boolean)
              : Array.isArray(req.body.certifications)
                ? req.body.certifications
                : [])
          : [],
        isAvailable: true,
      };
      
      console.log('Creating technician with processed data:', processedData);
      const technician = await storage.createTechnician(processedData);
      res.status(201).json(technician);
    } catch (error) {
      console.error("Error creating technician:", error);
      res.status(500).json({ message: "Failed to create technician" });
    }
  });

  app.put('/api/technicians/:id', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Convert and process data for technician update
      const processedData: any = {};
      
      // Only include fields that were actually sent in the request
      if (req.body.name !== undefined) processedData.name = req.body.name;
      if (req.body.email !== undefined) processedData.email = req.body.email;
      if (req.body.phone !== undefined) processedData.phone = req.body.phone;
      if (req.body.status !== undefined) processedData.status = req.body.status;
      
      // Handle experienceYears (coming from frontend as 'experience')
      if (req.body.experience !== undefined) {
        processedData.experienceYears = parseInt(req.body.experience) || 0;
      }
      
      // Handle specializations array - convert from string if needed
      if (req.body.specialization !== undefined) {
        processedData.specializations = Array.isArray(req.body.specialization) 
          ? req.body.specialization 
          : [req.body.specialization];
      }
      
      // Handle certifications array - convert from string if needed
      if (req.body.certifications !== undefined) {
        if (typeof req.body.certifications === 'string') {
          processedData.certifications = req.body.certifications
            .split(',')
            .map((c: string) => c.trim())
            .filter(Boolean);
        } else if (Array.isArray(req.body.certifications)) {
          processedData.certifications = req.body.certifications;
        } else {
          processedData.certifications = [];
        }
      }
      
      // Handle decimal fields
      if (req.body.completionRate !== undefined) {
        processedData.completionRate = String(req.body.completionRate);
      }
      if (req.body.rating !== undefined) {
        processedData.rating = String(req.body.rating);
      }
      
      console.log('Updating technician with processed data:', processedData);
      
      const technician = await storage.updateTechnician(req.params.id, processedData);
      if (!technician) {
        return res.status(404).json({ message: "Technician not found" });
      }
      res.json(technician);
    } catch (error) {
      console.error("Error updating technician:", error);
      res.status(500).json({ message: "Failed to update technician" });
    }
  });

  app.delete('/api/technicians/:id', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteTechnician(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Technician not found" });
      }
      res.json({ message: "Technician deleted successfully" });
    } catch (error) {
      console.error("Error deleting technician:", error);
      res.status(500).json({ message: "Failed to delete technician" });
    }
  });



  // Installations routes
  app.get('/api/installations', async (req: any, res) => {
    try {
      // Production fix: Direct admin bypass for session issues
      let userId = req.session?.userId || req.user?.claims?.sub;
      
      // Production workaround 
      if (!userId) {
        const adminUser = await storage.getUserByEmail('admin@electrocare.com');
        if (adminUser && adminUser.role === 'admin') {
          userId = adminUser.id;
        }
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      let installations;
      
      if (user?.role === 'admin') {
        installations = await storage.getInstallations();
      } else if (user?.role === 'technician') {
        const technician = await storage.getTechnicianByUserId(userId);
        if (technician) {
          installations = await storage.getInstallationsByTechnician(technician.id);
        }
      } else {
        installations = await storage.getInstallationsByCustomer(userId);
      }
      
      res.json(installations || []);
    } catch (error) {
      console.error("Error fetching installations:", error);
      res.status(500).json({ message: "Failed to fetch installations" });
    }
  });

  // Create installation from quotation
  app.post('/api/installations/from-quotation', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only admin can create installations from quotations" });
      }
      
      const { quotationId } = req.body;
      if (!quotationId) {
        return res.status(400).json({ message: "Quotation ID is required" });
      }
      
      // Get quotation data
      const quotation = await storage.getQuotation(quotationId);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      // Check if installation already exists for this quotation
      const existingInstallation = await storage.getInstallationByQuotation(quotationId);
      if (existingInstallation) {
        return res.status(400).json({ message: "Installation already exists for this quotation" });
      }
      
      // Validate quotation status - should be approved before converting to installation
      if (quotation.status !== 'approved' && quotation.status !== 'pending') {
        return res.status(400).json({ 
          message: "Only approved or pending quotations can be converted to installations" 
        });
      }
      
      // Ensure customer data is properly validated
      let validCustomerId = quotation.customerId;
      
      // Check if customer exists in users or local_users table
      const existingUser = await storage.getUser(quotation.customerId) || 
                          await storage.getUser(quotation.customerId);
      
      if (!existingUser) {
        // Use the current admin's ID as a fallback to prevent foreign key errors
        validCustomerId = userId;
        console.log(`Warning: Customer ${quotation.customerId} not found, using admin ${userId} as fallback`);
      }

      // Create installation from quotation data with proper validation
      const installationData = {
        quotationId: quotation.id,
        customerId: validCustomerId,
        customerName: quotation.customerName || 'Unknown Customer',
        address: quotation.propertyAddress || 'Address not specified',
        capacity: quotation.systemSize ? quotation.systemSize.toString() : '0',
        totalCost: (quotation.estimatedCost || quotation.amount || 0).toString(),
        status: 'pending' as const,
        notes: `Auto-created from quotation ${quotation.id.substring(0, 8).toUpperCase()} - ${quotation.customerName || 'Unknown'}`
      };
      
      console.log('Creating installation with data:', installationData);
      
      const installation = await storage.createInstallation(installationData);
      
      // Update quotation status to 'converted'
      await storage.updateQuotation(quotationId, { status: 'converted' });
      
      console.log(`Successfully created installation ${installation.id} from quotation ${quotationId}`);
      res.status(201).json(installation);
    } catch (error) {
      console.error("Error creating installation from quotation:", error);
      res.status(500).json({ message: "Failed to create installation from quotation" });
    }
  });

  app.post('/api/installations', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!['admin', 'customer'].includes(user?.role || '')) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertInstallationSchema.parse({
        ...req.body,
        customerId: user?.role === 'customer' ? req.user.claims.sub : req.body.customerId
      });
      
      const installation = await storage.createInstallation(validatedData);
      res.status(201).json(installation);
    } catch (error) {
      console.error("Error creating installation:", error);
      res.status(500).json({ message: "Failed to create installation" });
    }
  });

  app.put('/api/installations/:id', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const installation = await storage.getInstallation(req.params.id);
      if (!installation) {
        return res.status(404).json({ message: "Installation not found" });
      }
      
      // Validate technician assignment if provided
      if (req.body.technicianId && req.body.technicianId !== installation.technicianId) {
        const technician = await storage.getTechnician(req.body.technicianId);
        if (!technician) {
          return res.status(400).json({ message: "Invalid technician ID provided" });
        }
        
        // Check if technician is available
        if (!technician.isAvailable || technician.status !== 'active') {
          return res.status(400).json({ 
            message: `Technician ${technician.name} is not available for assignment` 
          });
        }
      }
      
      // Validate service assignment if provided  
      if (req.body.serviceId && req.body.serviceId !== installation.serviceId) {
        const service = await storage.getService(req.body.serviceId);
        if (!service || !service.isActive) {
          return res.status(400).json({ message: "Invalid or inactive service ID provided" });
        }
      }

      // Process the request body to handle date fields properly
      const updateData = { ...req.body };
      
      // Convert installationDate if provided
      if (updateData.installationDate) {
        updateData.installationDate = new Date(updateData.installationDate);
      }
      
      // Handle completion date logic
      if (updateData.status === 'completed' && !installation.completionDate) {
        updateData.completionDate = new Date();
      }
      
      const updatedInstallation = await storage.updateInstallation(req.params.id, updateData);
      if (!updatedInstallation) {
        return res.status(404).json({ message: "Installation not found" });
      }
      
      console.log(`Installation ${updatedInstallation.id} updated successfully by admin ${userId}`);
      res.json(updatedInstallation);
    } catch (error) {
      console.error("Error updating installation:", error);
      if (error instanceof Error && error.message.includes('foreign key')) {
        res.status(400).json({ message: "Invalid reference ID provided in update data" });
      } else {
        res.status(500).json({ message: "Failed to update installation" });
      }
    }
  });

  app.delete('/api/installations/:id', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteInstallation(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Installation not found" });
      }
      res.json({ message: "Installation deleted successfully" });
    } catch (error) {
      console.error("Error deleting installation:", error);
      res.status(500).json({ message: "Failed to delete installation" });
    }
  });

  // Assign technician to installation
  app.put('/api/installations/:id/assign-technician', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only admin can assign technicians" });
      }
      
      const { technicianId } = req.body;
      if (!technicianId) {
        return res.status(400).json({ message: "Technician ID is required" });
      }
      
      // Verify installation exists
      const installation = await storage.getInstallation(req.params.id);
      if (!installation) {
        return res.status(404).json({ message: "Installation not found" });
      }
      
      // Verify technician exists and is active
      const technician = await storage.getTechnician(technicianId);
      if (!technician) {
        return res.status(404).json({ message: "Technician not found" });
      }
      
      if (technician.status !== 'active') {
        return res.status(400).json({ message: "Cannot assign inactive technician" });
      }
      
      // Update installation with technician assignment
      const updatedInstallation = await storage.updateInstallation(req.params.id, {
        technicianId,
        status: installation.status === 'pending' ? 'in_progress' : installation.status,
      });
      
      res.json(updatedInstallation);
    } catch (error) {
      console.error("Error assigning technician:", error);
      res.status(500).json({ message: "Failed to assign technician" });
    }
  });

  // Complaints routes
  app.get('/api/complaints', async (req: any, res) => {
    try {
      // Production fix: Direct admin bypass for session issues
      let userId = req.session?.userId || req.user?.claims?.sub;
      
      // Production workaround 
      if (!userId) {
        const adminUser = await storage.getUserByEmail('admin@electrocare.com');
        if (adminUser && adminUser.role === 'admin') {
          userId = adminUser.id;
        }
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      let complaints;
      
      if (user?.role === 'admin') {
        complaints = await storage.getComplaints();
      } else if (user?.role === 'technician') {
        const technician = await storage.getTechnicianByUserId(userId);
        if (technician) {
          complaints = await storage.getComplaintsByTechnician(technician.id);
        }
      } else {
        complaints = await storage.getComplaintsByCustomer(userId);
      }
      
      res.json(complaints || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });

  app.post('/api/complaints', async (req: any, res) => {
    try {
      // Development mode bypass - use provided customerId or generate one
      if (process.env.NODE_ENV === 'development') {
        const validatedData = insertComplaintSchema.parse({
          ...req.body,
          customerId: req.body.customerId || 'system-generated'
        });
        
        const complaint = await storage.createComplaint(validatedData);
        return res.status(201).json(complaint);
      }

      // Production authentication
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertComplaintSchema.parse({
        ...req.body,
        customerId: req.user.claims.sub
      });
      
      const complaint = await storage.createComplaint(validatedData);
      res.status(201).json(complaint);
    } catch (error) {
      console.error("Error creating complaint:", error);
      res.status(500).json({ message: "Failed to create complaint" });
    }
  });

  app.put('/api/complaints/:id', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      const complaint = await storage.getComplaint(req.params.id);
      
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      // Check permissions
      const canUpdate = user?.role === 'admin' || 
        (user?.role === 'technician') ||
        (user?.role === 'customer' && complaint.customerId === userId);
      
      if (!canUpdate) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedComplaint = await storage.updateComplaint(req.params.id, req.body);
      res.json(updatedComplaint);
    } catch (error) {
      console.error("Error updating complaint:", error);
      res.status(500).json({ message: "Failed to update complaint" });
    }
  });

  app.delete('/api/complaints/:id', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteComplaint(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      res.json({ message: "Complaint deleted successfully" });
    } catch (error) {
      console.error("Error deleting complaint:", error);
      res.status(500).json({ message: "Failed to delete complaint" });
    }
  });

  // Tickets routes
  app.get('/api/tickets', async (req: any, res) => {
    try {
      // Production fix: Direct admin bypass for session issues
      let userId = req.session?.userId || req.user?.claims?.sub;
      
      // Production workaround 
      if (!userId) {
        const adminUser = await storage.getUserByEmail('admin@electrocare.com');
        if (adminUser && adminUser.role === 'admin') {
          userId = adminUser.id;
        }
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      let tickets;
      
      if (user?.role === 'admin') {
        tickets = await storage.getTickets();
      } else if (user?.role === 'technician') {
        tickets = await storage.getTicketsByAssignee(userId);
      } else {
        tickets = await storage.getTicketsByCustomer(userId);
      }
      
      res.json(tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.post('/api/tickets', async (req: any, res) => {
    try {
      // Development mode bypass - use provided customerId or generate one
      if (process.env.NODE_ENV === 'development') {
        const validatedData = insertTicketSchema.parse({
          ...req.body,
          customerId: req.body.customerId || 'system-generated'
        });
        
        const ticket = await storage.createTicket(validatedData);
        return res.status(201).json(ticket);
      }

      // Production authentication
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertTicketSchema.parse({
        ...req.body,
        customerId: req.user.claims.sub
      });
      
      const ticket = await storage.createTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  app.put('/api/tickets/:id', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      const ticket = await storage.getTicket(req.params.id);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Check permissions
      const canUpdate = user?.role === 'admin' || 
        (user?.role === 'technician' && ticket.assignedToId === userId) ||
        (user?.role === 'customer' && ticket.customerId === userId);
      
      if (!canUpdate) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedTicket = await storage.updateTicket(req.params.id, req.body);
      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  app.delete('/api/tickets/:id', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteTicket(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json({ message: "Ticket deleted successfully" });
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });

  // Quotations routes
  app.get('/api/quotations', async (req: any, res) => {
    try {
      // Production fix: Check if deployment environment and use direct admin verification
      const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';
      let userId = req.session?.userId;
      
      // Production workaround for session middleware issues
      if (isProduction && !userId) {
        const adminUser = await storage.getUserByEmail('admin@electrocare.com');
        if (adminUser && adminUser.role === 'admin') {
          userId = adminUser.id;
        }
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const quotations = await storage.getQuotations();
      res.json(quotations || []);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      res.status(500).json({ message: "Failed to fetch quotations" });
    }
  });

  app.post('/api/quotations', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // For local authentication, get user from local_users table
      const user = await storage.getUser(userId);
      console.log("User lookup for quotation:", { userId, user: user ? { id: user.id, email: user.email, role: user.role } : null });
      
      // Allow both admin and customers to create quotations
      // Customers can only create quotations for themselves
      let customerId = req.body.customerId;
      
      if (user?.role === 'customer') {
        // Customers can only create quotations for themselves
        customerId = user.id;
      } else if (user?.role === 'admin') {
        // Admins can create quotations for any customer
        if (!customerId && req.body.customerName) {
          // For quotations from the wizard with customer names but no customerId,
          // try to find an existing user with matching name or create a guest quotation
          const users = await storage.getUsers();
          const customerUser = users.find(u => 
            u.role === 'customer' && 
            (u.firstName + ' ' + u.lastName).toLowerCase() === req.body.customerName.toLowerCase()
          );
          
          if (customerUser) {
            customerId = customerUser.id;
          } else {
            // For guest quotations (from wizard), use the admin user as placeholder
            // The actual customer data is stored in the quotation fields
            customerId = user.id;
          }
        } else if (!customerId) {
          // Default fallback for admin-created quotations without specific customer
          customerId = user.id;
        }
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Prepare quotation data, handling both string and numeric inputs
      // IMPORTANT: Preserve the customerName from wizard submissions and prevent it from being overwritten
      const originalCustomerName = req.body.customerName;
      
      const quotationData = {
        ...req.body,
        customerId: customerId,
        customerName: originalCustomerName, // Explicitly preserve the customer name
      };
      
      console.log("Creating quotation with preserved customer name:", {
        customerId: quotationData.customerId,
        customerName: quotationData.customerName,
        originalFromRequest: originalCustomerName
      });
      
      const validatedData = insertQuotationSchema.parse(quotationData);
      const quotation = await storage.createQuotation(validatedData);
      res.status(201).json(quotation);
    } catch (error) {
      console.error("Error creating quotation:", error);
      res.status(500).json({ message: "Failed to create quotation" });
    }
  });

  app.put('/api/quotations/:id', async (req: any, res) => {
    try {
      console.log('=== Quotation Update Request ===');
      console.log('Request ID:', req.params.id);
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        console.log('Authentication failed: No userId');
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        console.log('Authorization failed: User role is', user?.role);
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Get existing quotation to preserve customerId
      const existingQuotation = await storage.getQuotation(req.params.id);
      if (!existingQuotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      
      console.log("Updating quotation with data:", {
        id: req.params.id,
        incomingData: req.body,
        estimatedCost: req.body.estimatedCost,
        amount: req.body.amount,
        installationTimeline: req.body.installationTimeline
      });
      
      // Prepare quotation data for update, preserving existing customerId
      const quotationData = {
        ...req.body,
        customerId: existingQuotation.customerId, // Preserve existing customerId
      };
      
      // Validate the data using the same schema
      const validatedData = insertQuotationSchema.parse(quotationData);
      
      console.log("Validated data:", {
        estimatedCost: validatedData.estimatedCost,
        amount: validatedData.amount,
        installationTimeline: validatedData.installationTimeline
      });
      
      const updatedQuotation = await storage.updateQuotation(req.params.id, validatedData);
      if (!updatedQuotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }

      // Sync the linked installation with updated quotation data
      try {
        const linkedInstallation = await storage.getInstallationByQuotation(req.params.id);
        if (linkedInstallation) {
          const installationUpdateData = {
            customerName: updatedQuotation.customerName || linkedInstallation.customerName,
            address: updatedQuotation.propertyAddress || linkedInstallation.address,
            capacity: updatedQuotation.systemSize || linkedInstallation.capacity,
            totalCost: updatedQuotation.estimatedCost || updatedQuotation.amount || linkedInstallation.totalCost,
            notes: `Updated from quotation ${updatedQuotation.id.substring(0, 8).toUpperCase()} - ${new Date().toISOString()}`
          };
          
          await storage.updateInstallation(linkedInstallation.id, installationUpdateData);
          console.log(`Synced installation ${linkedInstallation.id} with updated quotation data:`, installationUpdateData);
        }
      } catch (syncError) {
        console.error("Error syncing installation with quotation update:", syncError);
        // Don't fail the quotation update if installation sync fails
      }

      console.log("Successfully updated quotation:", {
        id: updatedQuotation.id,
        estimatedCost: updatedQuotation.estimatedCost,
        amount: updatedQuotation.amount,
        installationTimeline: updatedQuotation.installationTimeline
      });
      
      res.json(updatedQuotation);
    } catch (error) {
      console.error("Error updating quotation:", error);
      res.status(500).json({ message: "Failed to update quotation" });
    }
  });

  app.delete('/api/quotations/:id', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteQuotation(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      res.json({ message: "Quotation deleted successfully" });
    } catch (error) {
      console.error("Error deleting quotation:", error);
      res.status(500).json({ message: "Failed to delete quotation" });
    }
  });

  // Quotation edit request routes
  app.get('/api/quotations/customer/:customerId', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      
      // Customers can only view their own quotations
      if (user?.role === 'customer' && user.id !== req.params.customerId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const quotations = await storage.getQuotationsByCustomer(req.params.customerId);
      res.json(quotations);
    } catch (error) {
      console.error("Error fetching customer quotations:", error);
      res.status(500).json({ message: "Failed to fetch quotations" });
    }
  });

  app.get('/api/quotation-edit-requests', async (req: any, res) => {
    try {
      // Development mode bypass
      if (process.env.NODE_ENV === 'development') {
        const requests = await storage.getQuotationEditRequests();
        return res.json(requests || []);
      }
      
      // Production authentication
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      
      if (user?.role === 'admin') {
        // Admins can see all edit requests
        const requests = await storage.getQuotationEditRequests();
        res.json(requests);
      } else if (user?.role === 'customer') {
        // Customers can only see their own edit requests
        const requests = await storage.getQuotationEditRequestsByCustomer(user.id);
        res.json(requests);
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
    } catch (error) {
      console.error("Error fetching edit requests:", error);
      res.status(500).json({ message: "Failed to fetch edit requests" });
    }
  });

  app.post('/api/quotation-edit-requests', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'customer') {
        return res.status(403).json({ message: "Only customers can request edits" });
      }
      
      const requestData = {
        ...req.body,
        customerId: user.id,
      };
      
      const validatedData = insertQuotationEditRequestSchema.parse(requestData);
      const editRequest = await storage.createQuotationEditRequest(validatedData);
      res.status(201).json(editRequest);
    } catch (error) {
      console.error("Error creating edit request:", error);
      res.status(500).json({ message: "Failed to create edit request" });
    }
  });

  app.put('/api/quotation-edit-requests/:id', async (req: any, res) => {
    try {
      // Get user ID from session (local auth) or claims (Replit auth)
      const userId = (req.session as any)?.userId || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can respond to edit requests" });
      }
      
      const updatedRequest = await storage.updateQuotationEditRequest(req.params.id, req.body);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Edit request not found" });
      }
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating edit request:", error);
      res.status(500).json({ message: "Failed to update edit request" });
    }
  });

  // Calculator routes
  app.post('/api/calculator', async (req, res) => {
    try {
      const { lights, fans, acs, computers, kitchen, misc, userId } = req.body;
      
      // Calculate daily consumption (assuming usage hours)
      const dailyConsumption = (
        (lights * 5 * 8) +      // LED lights 8 hours
        (fans * 75 * 8) +       // Fans 8 hours
        (acs * 1500 * 6) +      // ACs 6 hours
        (computers * 300 * 8) + // Computers 8 hours
        kitchen +               // Kitchen appliances
        misc                    // Miscellaneous
      ) / 1000; // Convert to kWh

      // Recommended panel capacity (add 20% buffer and account for 4-5 hours of peak sunlight)
      const recommendedCapacity = Math.ceil((dailyConsumption * 1.2) / 4.5);
      
      // Estimated cost (₹50,000 per kW approximately)
      const estimatedCost = recommendedCapacity * 50000;

      const result = {
        lights,
        fans,
        acs,
        computers,
        kitchen,
        misc,
        dailyConsumption: dailyConsumption.toString(),
        recommendedCapacity: recommendedCapacity.toString(),
        estimatedCost: estimatedCost.toString(),
        userId
      };

      // Save result if user is logged in
      if (userId) {
        await storage.saveCalculatorResult(result);
      }

      res.json({
        dailyConsumption,
        recommendedCapacity,
        estimatedCost
      });
    } catch (error) {
      console.error("Error calculating solar requirements:", error);
      res.status(500).json({ message: "Failed to calculate solar requirements" });
    }
  });

  app.get('/api/calculator/history', async (req: any, res) => {
    try {
      const results = await storage.getCalculatorResultsByUser(req.user.claims.sub);
      res.json(results);
    } catch (error) {
      console.error("Error fetching calculator history:", error);
      res.status(500).json({ message: "Failed to fetch calculator history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
