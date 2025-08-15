import {
  users,
  services,
  technicians,
  installations,
  complaints,
  tickets,
  quotations,
  calculatorResults,
  quotationEditRequests,
  type User,
  type UpsertUser,
  type InsertUser,
  type Service,
  type InsertService,
  type Technician,
  type InsertTechnician,
  type Installation,
  type InsertInstallation,
  type Complaint,
  type InsertComplaint,
  type Ticket,
  type InsertTicket,
  type Quotation,
  type InsertQuotation,
  type CalculatorResult,
  type InsertCalculatorResult,
  type QuotationEditRequest,
  type InsertQuotationEditRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (unified table for both Replit Auth and local authentication)
  getUser(id: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Service operations
  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;
  
  // Technician operations
  getTechnicians(): Promise<Technician[]>;
  getTechnician(id: string): Promise<Technician | undefined>;
  getTechnicianByUserId(userId: string): Promise<Technician | undefined>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(id: string, technician: Partial<InsertTechnician>): Promise<Technician | undefined>;
  deleteTechnician(id: string): Promise<boolean>;
  
  // Installation operations
  getInstallations(): Promise<Installation[]>;
  getInstallation(id: string): Promise<Installation | undefined>;
  getInstallationsByCustomer(customerId: string): Promise<Installation[]>;
  getInstallationsByTechnician(technicianId: string): Promise<Installation[]>;
  getInstallationByQuotation(quotationId: string): Promise<Installation | undefined>;
  createInstallation(installation: InsertInstallation): Promise<Installation>;
  updateInstallation(id: string, installation: Partial<InsertInstallation>): Promise<Installation | undefined>;
  deleteInstallation(id: string): Promise<boolean>;
  
  // Complaint operations
  getComplaints(): Promise<Complaint[]>;
  getComplaint(id: string): Promise<Complaint | undefined>;
  getComplaintsByCustomer(customerId: string): Promise<Complaint[]>;
  getComplaintsByTechnician(technicianId: string): Promise<Complaint[]>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaint(id: string, complaint: Partial<InsertComplaint>): Promise<Complaint | undefined>;
  deleteComplaint(id: string): Promise<boolean>;
  
  // Ticket operations
  getTickets(): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  getTicketsByCustomer(customerId: string): Promise<Ticket[]>;
  getTicketsByAssignee(assigneeId: string): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, ticket: Partial<InsertTicket>): Promise<Ticket | undefined>;
  deleteTicket(id: string): Promise<boolean>;
  
  // Quotation operations
  getQuotations(): Promise<Quotation[]>;
  getQuotation(id: string): Promise<Quotation | undefined>;
  getQuotationsByCustomer(customerId: string): Promise<Quotation[]>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  updateQuotation(id: string, quotation: Partial<InsertQuotation>): Promise<Quotation | undefined>;
  deleteQuotation(id: string): Promise<boolean>;
  
  // Quotation edit request operations
  getQuotationEditRequests(): Promise<QuotationEditRequest[]>;
  getQuotationEditRequestsByQuotation(quotationId: string): Promise<QuotationEditRequest[]>;
  getQuotationEditRequestsByCustomer(customerId: string): Promise<QuotationEditRequest[]>;
  createQuotationEditRequest(request: InsertQuotationEditRequest): Promise<QuotationEditRequest>;
  updateQuotationEditRequest(id: string, request: Partial<InsertQuotationEditRequest>): Promise<QuotationEditRequest | undefined>;
  
  // Calculator operations
  saveCalculatorResult(result: InsertCalculatorResult): Promise<CalculatorResult>;
  getCalculatorResultsByUser(userId: string): Promise<CalculatorResult[]>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    totalInstallations: number;
    activeTechnicians: number;
    openTickets: number;
    openComplaints: number;
    monthlyInstallations: { month: string; count: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Set default role as admin for all new users
    const userWithRole = {
      ...userData,
      role: 'admin' as const
    };
    
    const [user] = await db
      .insert(users)
      .values(userWithRole)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          role: 'admin' as const,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, user: Partial<UpsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
      
    // If user role changed to technician, ensure they have a technician profile
    if (updatedUser && user.role === 'technician') {
      const existingTech = await this.getTechnicianByUserId(id);
      if (!existingTech) {
        const newTechData: InsertTechnician = {
          userId: id,
          name: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim() || updatedUser.email?.split('@')[0] || `Tech ${id}`,
          specializations: ['General Installation'],
          experienceYears: 1,
          certifications: [],
          isAvailable: true,
          completionRate: '0',
          rating: '0'
        };
        await db.insert(technicians).values(newTechData);
      }
    }
    
    // If user role changed from technician to something else, optionally remove technician profile
    if (updatedUser && user.role && user.role !== 'technician') {
      await db.delete(technicians).where(eq(technicians.userId, id));
    }
    
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    // First, get the technician ID if this user is a technician
    const [technician] = await db.select().from(technicians).where(eq(technicians.userId, id));
    
    if (technician) {
      // Delete installations assigned to this technician
      await db.delete(installations).where(eq(installations.technicianId, technician.id));
      // Delete the technician record
      await db.delete(technicians).where(eq(technicians.id, technician.id));
    }
    
    // Delete all other related records
    await db.delete(installations).where(eq(installations.customerId, id));
    await db.delete(complaints).where(eq(complaints.customerId, id));
    await db.delete(tickets).where(eq(tickets.customerId, id));
    await db.delete(tickets).where(eq(tickets.assignedToId, id));
    
    // Finally delete the user
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount! > 0;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.isActive, true)).orderBy(services.name);
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set({ ...service, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.update(services).set({ isActive: false }).where(eq(services.id, id));
    return result.rowCount! > 0;
  }

  // Technician operations
  async getTechnicians(): Promise<Technician[]> {
    // PERMANENT FIX: Get ALL technicians from technicians table directly
    // This ensures we return all technician records regardless of user table state
    const allTechnicians = await db.select().from(technicians);
    
    // Sort by name in ascending order as requested by user
    return allTechnicians.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  async getTechnician(id: string): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.id, id));
    return technician;
  }

  async getTechnicianByUserId(userId: string): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.userId, userId));
    return technician;
  }

  async createTechnician(technician: InsertTechnician): Promise<Technician> {
    const [newTechnician] = await db.insert(technicians).values(technician).returning();
    return newTechnician;
  }

  async updateTechnician(id: string, technician: Partial<InsertTechnician>): Promise<Technician | undefined> {
    const [updatedTechnician] = await db
      .update(technicians)
      .set({ ...technician, updatedAt: new Date() })
      .where(eq(technicians.id, id))
      .returning();
    return updatedTechnician;
  }

  async deleteTechnician(id: string): Promise<boolean> {
    const result = await db.delete(technicians).where(eq(technicians.id, id));
    return result.rowCount! > 0;
  }

  // Installation operations
  async getInstallations(): Promise<Installation[]> {
    const installationsData = await db.select().from(installations).orderBy(desc(installations.createdAt));
    
    // Enrich with customer names, but preserve existing customerName if it's valid
    const enrichedInstallations = await Promise.all(
      installationsData.map(async (installation) => {
        // If customerName is already set and is not a user ID (numeric pattern), use it as-is
        if (installation.customerName && 
            !installation.customerName.match(/^[0-9]+$/) && // Not just numbers (user ID)
            !installation.customerName.match(/^[a-f0-9-]{8,}$/)) { // Not UUID pattern
          return installation;
        }
        
        // If customerName is missing or looks like a user ID, try to get name from user record
        const customer = await this.getUser(installation.customerId);
        const customerName = customer 
          ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() 
          : installation.customerName || installation.customerId;
        
        return {
          ...installation,
          customerName: customerName || installation.customerId
        };
      })
    );
    
    return enrichedInstallations;
  }

  async getInstallation(id: string): Promise<Installation | undefined> {
    const [installation] = await db.select().from(installations).where(eq(installations.id, id));
    return installation;
  }

  async getInstallationsByCustomer(customerId: string): Promise<Installation[]> {
    return await db
      .select()
      .from(installations)
      .where(eq(installations.customerId, customerId))
      .orderBy(desc(installations.createdAt));
  }

  async getInstallationsByTechnician(technicianId: string): Promise<Installation[]> {
    return await db
      .select()
      .from(installations)
      .where(eq(installations.technicianId, technicianId))
      .orderBy(desc(installations.createdAt));
  }

  async getInstallationByQuotation(quotationId: string): Promise<Installation | undefined> {
    const [installation] = await db.select().from(installations).where(eq(installations.quotationId, quotationId));
    return installation;
  }

  async createInstallation(installation: InsertInstallation): Promise<Installation> {
    const [newInstallation] = await db.insert(installations).values(installation).returning();
    return newInstallation;
  }

  async updateInstallation(id: string, installation: Partial<InsertInstallation>): Promise<Installation | undefined> {
    const [updatedInstallation] = await db
      .update(installations)
      .set({ ...installation, updatedAt: new Date() })
      .where(eq(installations.id, id))
      .returning();
    return updatedInstallation;
  }

  async deleteInstallation(id: string): Promise<boolean> {
    // First, delete any complaints related to this installation
    await db.delete(complaints).where(eq(complaints.installationId, id));
    
    // Then delete the installation itself
    const result = await db.delete(installations).where(eq(installations.id, id));
    return result.rowCount! > 0;
  }

  // Complaint operations
  async getComplaints(): Promise<Complaint[]> {
    const complaintsData = await db.select().from(complaints).orderBy(desc(complaints.createdAt));
    
    // Enrich with customer names, but preserve existing customerName if it's valid
    const enrichedComplaints = await Promise.all(
      complaintsData.map(async (complaint) => {
        // If customerName is already set and is not a user ID (numeric pattern), use it as-is
        if (complaint.customerName && 
            !complaint.customerName.match(/^[0-9]+$/) && // Not just numbers (user ID)
            !complaint.customerName.match(/^[a-f0-9-]{8,}$/)) { // Not UUID pattern
          return complaint;
        }
        
        // If customerName is missing or looks like a user ID, try to get name from user record
        const customer = await this.getUser(complaint.customerId);
        const customerName = customer 
          ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() 
          : complaint.customerName || complaint.customerId;
        
        return {
          ...complaint,
          customerName: customerName || complaint.customerId
        };
      })
    );
    
    return enrichedComplaints;
  }

  async getComplaint(id: string): Promise<Complaint | undefined> {
    const [complaint] = await db.select().from(complaints).where(eq(complaints.id, id));
    return complaint;
  }

  async getComplaintsByCustomer(customerId: string): Promise<Complaint[]> {
    return await db
      .select()
      .from(complaints)
      .where(eq(complaints.customerId, customerId))
      .orderBy(desc(complaints.createdAt));
  }

  async getComplaintsByTechnician(technicianId: string): Promise<Complaint[]> {
    return await db
      .select()
      .from(complaints)
      .where(eq(complaints.assignedTechnicianId, technicianId))
      .orderBy(desc(complaints.createdAt));
  }

  async createComplaint(complaint: InsertComplaint): Promise<Complaint> {
    const [newComplaint] = await db.insert(complaints).values(complaint).returning();
    return newComplaint;
  }

  async updateComplaint(id: string, complaint: Partial<InsertComplaint>): Promise<Complaint | undefined> {
    const [updatedComplaint] = await db
      .update(complaints)
      .set({ 
        ...complaint, 
        updatedAt: new Date(),
        ...(complaint.status === 'resolved' && { resolvedAt: new Date() })
      })
      .where(eq(complaints.id, id))
      .returning();
    return updatedComplaint;
  }

  async deleteComplaint(id: string): Promise<boolean> {
    const result = await db.delete(complaints).where(eq(complaints.id, id));
    return result.rowCount! > 0;
  }

  // Ticket operations
  async getTickets(): Promise<Ticket[]> {
    const ticketsData = await db.select().from(tickets).orderBy(desc(tickets.createdAt));
    
    // Enrich with customer names
    const enrichedTickets = await Promise.all(
      ticketsData.map(async (ticket) => {
        const customer = await this.getUser(ticket.customerId);
        const customerName = customer 
          ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() 
          : ticket.customerId;
        
        return {
          ...ticket,
          customerName: customerName || ticket.customerId
        };
      })
    );
    
    return enrichedTickets;
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async getTicketsByCustomer(customerId: string): Promise<Ticket[]> {
    return await db
      .select()
      .from(tickets)
      .where(eq(tickets.customerId, customerId))
      .orderBy(desc(tickets.createdAt));
  }

  async getTicketsByAssignee(assigneeId: string): Promise<Ticket[]> {
    return await db
      .select()
      .from(tickets)
      .where(eq(tickets.assignedToId, assigneeId))
      .orderBy(desc(tickets.createdAt));
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [newTicket] = await db.insert(tickets).values(ticket).returning();
    return newTicket;
  }

  async updateTicket(id: string, ticket: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const [updatedTicket] = await db
      .update(tickets)
      .set({ 
        ...ticket, 
        updatedAt: new Date(),
        ...(ticket.status === 'resolved' && { resolvedAt: new Date() })
      })
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket;
  }

  async deleteTicket(id: string): Promise<boolean> {
    const result = await db.delete(tickets).where(eq(tickets.id, id));
    return result.rowCount! > 0;
  }

  // Quotation operations
  async getQuotations(): Promise<Quotation[]> {
    const quotationsData = await db.select().from(quotations).orderBy(desc(quotations.createdAt));
    
    // Enrich with customer names, but preserve existing customerName if it's valid
    const enrichedQuotations = await Promise.all(
      quotationsData.map(async (quotation) => {
        // If customerName is already set and is not a user ID (numeric or UUID pattern), use it as-is
        if (quotation.customerName && 
            !quotation.customerName.match(/^[0-9]+$/) && // Not just numbers (user ID)
            !quotation.customerName.match(/^[a-f0-9-]{8,}$/)) { // Not UUID pattern
          return quotation;
        }
        
        // If customerName is missing or looks like a user ID, try to get name from users record
        const customer = await this.getUser(quotation.customerId);
        const customerName = customer 
          ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() 
          : quotation.customerName || quotation.customerId;
        
        return {
          ...quotation,
          customerName: customerName || quotation.customerId
        };
      })
    );
    
    return enrichedQuotations;
  }

  async getQuotation(id: string): Promise<Quotation | undefined> {
    const [quotation] = await db.select().from(quotations).where(eq(quotations.id, id));
    return quotation;
  }

  async createQuotation(quotation: InsertQuotation): Promise<Quotation> {
    const [newQuotation] = await db.insert(quotations).values(quotation as any).returning();
    return newQuotation;
  }

  async updateQuotation(id: string, quotation: Partial<InsertQuotation>): Promise<Quotation | undefined> {
    const [updatedQuotation] = await db
      .update(quotations)
      .set({ ...quotation, updatedAt: new Date() })
      .where(eq(quotations.id, id))
      .returning();
    return updatedQuotation;
  }

  async deleteQuotation(id: string): Promise<boolean> {
    // First, find and delete any installations related to this quotation
    const relatedInstallations = await db.select().from(installations).where(eq(installations.quotationId, id));
    
    // For each related installation, delete its complaints first, then the installation
    for (const installation of relatedInstallations) {
      await db.delete(complaints).where(eq(complaints.installationId, installation.id));
      await db.delete(installations).where(eq(installations.id, installation.id));
    }
    
    // Then delete the quotation itself
    const result = await db.delete(quotations).where(eq(quotations.id, id));
    return result.rowCount! > 0;
  }

  async getQuotationsByCustomer(customerId: string): Promise<Quotation[]> {
    return await db
      .select()
      .from(quotations)
      .where(eq(quotations.customerId, customerId))
      .orderBy(desc(quotations.createdAt));
  }

  // Quotation edit request operations
  async getQuotationEditRequests(): Promise<QuotationEditRequest[]> {
    return await db
      .select()
      .from(quotationEditRequests)
      .orderBy(desc(quotationEditRequests.createdAt));
  }

  async getQuotationEditRequestsByQuotation(quotationId: string): Promise<QuotationEditRequest[]> {
    return await db
      .select()
      .from(quotationEditRequests)
      .where(eq(quotationEditRequests.quotationId, quotationId))
      .orderBy(desc(quotationEditRequests.createdAt));
  }

  async getQuotationEditRequestsByCustomer(customerId: string): Promise<QuotationEditRequest[]> {
    return await db
      .select()
      .from(quotationEditRequests)
      .where(eq(quotationEditRequests.customerId, customerId))
      .orderBy(desc(quotationEditRequests.createdAt));
  }

  async createQuotationEditRequest(request: InsertQuotationEditRequest): Promise<QuotationEditRequest> {
    const [newRequest] = await db.insert(quotationEditRequests).values(request).returning();
    return newRequest;
  }

  async updateQuotationEditRequest(id: string, request: Partial<InsertQuotationEditRequest>): Promise<QuotationEditRequest | undefined> {
    const [updatedRequest] = await db
      .update(quotationEditRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(quotationEditRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Calculator operations
  async saveCalculatorResult(result: InsertCalculatorResult): Promise<CalculatorResult> {
    const [newResult] = await db.insert(calculatorResults).values(result).returning();
    return newResult;
  }

  async getCalculatorResultsByUser(userId: string): Promise<CalculatorResult[]> {
    return await db
      .select()
      .from(calculatorResults)
      .where(eq(calculatorResults.userId, userId))
      .orderBy(desc(calculatorResults.createdAt));
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    totalInstallations: number;
    activeTechnicians: number;
    openTickets: number;
    openComplaints: number;
    monthlyInstallations: { month: string; count: number }[];
  }> {
    const [totalInstallations] = await db
      .select({ count: count() })
      .from(installations);

    const [activeTechnicians] = await db
      .select({ count: count() })
      .from(technicians)
      .where(eq(technicians.isAvailable, true));

    const [openTickets] = await db
      .select({ count: count() })
      .from(tickets)
      .where(sql`status IN ('open', 'in_progress')`);

    const [openComplaints] = await db
      .select({ count: count() })
      .from(complaints)
      .where(sql`status IN ('open', 'investigating')`);

    const monthlyInstallations = await db
      .select({
        month: sql<string>`to_char(created_at, 'Mon YYYY')`,
        count: count(),
      })
      .from(installations)
      .where(sql`created_at >= now() - interval '6 months'`)
      .groupBy(sql`to_char(created_at, 'Mon YYYY'), extract(year from created_at), extract(month from created_at)`)
      .orderBy(sql`extract(year from created_at), extract(month from created_at)`);

    return {
      totalInstallations: totalInstallations.count,
      activeTechnicians: activeTechnicians.count,
      openTickets: openTickets.count,
      openComplaints: openComplaints.count,
      monthlyInstallations,
    };
  }

  // Initialize sample data if tables are empty
  async initializeSampleData(): Promise<void> {
    // Check if data already exists
    const [installationCount] = await db.select({ count: count() }).from(installations);
    const [complaintCount] = await db.select({ count: count() }).from(complaints);
    
    if (installationCount.count === 0) {
      // Get the first quotation to create sample installations
      const quotationsList = await this.getQuotations();
      const sampleQuotation = quotationsList[0];
      
      if (sampleQuotation) {
        // Create sample installations
        await db.insert(installations).values([
          {
            quotationId: sampleQuotation.id,
            customerId: sampleQuotation.customerId,
            customerName: sampleQuotation.customerName || 'Sample Customer',
            address: sampleQuotation.propertyAddress || 'Lahore, Punjab',
            capacity: sampleQuotation.systemSize || '5.5',
            totalCost: sampleQuotation.estimatedCost || '275000',
            status: 'in_progress',
            progress: 65,
            installationDate: new Date('2024-01-15'),
            notes: 'Installation in progress, panels mounted successfully'
          },
          {
            quotationId: sampleQuotation.id,
            customerId: sampleQuotation.customerId,
            customerName: 'Green Energy Solutions',
            address: 'Karachi, Sindh',
            capacity: '10.0',
            totalCost: '500000',
            status: 'completed',
            progress: 100,
            installationDate: new Date('2024-01-10'),
            completionDate: new Date('2024-01-12'),
            notes: 'Successfully completed 10kW residential installation'
          }
        ]);
      }
    }
    
    if (complaintCount.count === 0) {
      // Get an installation to create sample complaints
      const installationsList = await this.getInstallations();
      const sampleInstallation = installationsList[0];
      
      if (sampleInstallation) {
        await db.insert(complaints).values([
          {
            customerId: sampleInstallation.customerId,
            customerName: 'Ahmed Hassan', // Set proper customer name instead of user ID
            installationId: sampleInstallation.id,
            title: 'Panel efficiency lower than expected',
            description: 'The solar panels are not generating the expected amount of electricity as mentioned in the quotation.',
            status: 'investigating',
            priority: 'medium'
          }
        ]);
      }
    }
  }
}

export const storage = new DatabaseStorage();
