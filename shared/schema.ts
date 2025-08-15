import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles
export const userRoleEnum = pgEnum('user_role', ['admin', 'technician', 'customer']);

// User status
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended']);

// Installation status
export const installationStatusEnum = pgEnum('installation_status', ['pending', 'in_progress', 'completed', 'cancelled']);

// Ticket status
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in_progress', 'resolved', 'closed']);

// Ticket priority
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high', 'urgent']);

// Complaint status
export const complaintStatusEnum = pgEnum('complaint_status', ['open', 'investigating', 'resolved', 'closed']);

// Unified users table (supports both Replit Auth and local authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  address: text("address"),
  passwordHash: varchar("password_hash"), // For local authentication
  role: userRoleEnum("role").default('customer').notNull(),
  status: userStatusEnum("status").default('active').notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service categories
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).default('installation'),
  price: decimal("price", { precision: 10, scale: 2 }),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  duration: varchar("duration", { length: 100 }),
  requirements: text("requirements"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Technician profiles
export const technicians = pgTable("technicians", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  status: varchar("status", { length: 20 }).default('active'),
  profileImage: text("profile_image"),
  specializations: text("specializations").array(),
  experienceYears: integer("experience_years"),
  certifications: text("certifications").array(),
  isAvailable: boolean("is_available").default(true),
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }).default('0'),
  rating: decimal("rating", { precision: 3, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Solar installations
export const installations = pgTable("installations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quotationId: varchar("quotation_id").references(() => quotations.id).notNull(),
  customerId: varchar("customer_id").notNull(), // Reference to users.id
  customerName: varchar("customer_name", { length: 100 }),
  technicianId: varchar("technician_id").references(() => technicians.id),
  serviceId: varchar("service_id").references(() => services.id),
  capacity: decimal("capacity", { precision: 8, scale: 2 }), // kW
  location: text("location"),
  address: text("address"),
  status: installationStatusEnum("status").default('pending'),
  installationDate: timestamp("installation_date"),
  completionDate: timestamp("completion_date"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  progress: integer("progress").default(0), // percentage completion
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer complaints
export const complaints = pgTable("complaints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(), // Reference to users.id
  customerName: varchar("customer_name", { length: 100 }),
  installationId: varchar("installation_id").references(() => installations.id),
  assignedTechnicianId: varchar("assigned_technician_id").references(() => technicians.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  status: complaintStatusEnum("status").default('open'),
  priority: ticketPriorityEnum("priority").default('medium'),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Quotations
export const quotations = pgTable("quotations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(), // Reference to users.id
  customerName: varchar("customer_name", { length: 100 }),
  customerEmail: varchar("customer_email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  propertyAddress: text("property_address"),
  city: varchar("city", { length: 100 }),
  society: varchar("society", { length: 200 }),
  propertyType: varchar("property_type", { length: 50 }),
  roofType: varchar("roof_type", { length: 50 }),
  energyConsumption: decimal("energy_consumption", { precision: 10, scale: 2 }), // in kWh
  systemSize: decimal("system_size", { precision: 10, scale: 2 }), // in kW
  estimatedCost: decimal("estimated_cost", { precision: 12, scale: 2 }), // in $
  installationTimeline: varchar("installation_timeline", { length: 100 }),
  notes: text("notes"),
  items: text("items"), // JSON of appliance loads
  amount: decimal("amount", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default('pending'),
  
  // New fields for complete wizard data
  installationType: varchar("installation_type", { length: 50 }),
  houseDimension: varchar("house_dimension", { length: 50 }),
  customDimension: varchar("custom_dimension", { length: 100 }),
  roofLength: varchar("roof_length", { length: 20 }),
  roofWidth: varchar("roof_width", { length: 20 }),
  solarPanel: varchar("solar_panel", { length: 100 }),
  solarPanelOther: varchar("solar_panel_other", { length: 100 }),
  batteryType: varchar("battery_type", { length: 50 }),
  batteryTypeOther: varchar("battery_type_other", { length: 100 }),
  batteryBrand: varchar("battery_brand", { length: 100 }),
  batteryCapacity: varchar("battery_capacity", { length: 50 }), // AH rating from user
  batteryCapacityOther: varchar("battery_capacity_other", { length: 20 }),
  inverterBrand: varchar("inverter_brand", { length: 100 }),
  inverterBrandOther: varchar("inverter_brand_other", { length: 100 }),
  solarStructure: varchar("solar_structure", { length: 100 }),
  numberOfStands: varchar("number_of_stands", { length: 20 }),
  electricalAccessories: text("electrical_accessories"), // JSON
  netMetering: varchar("net_metering", { length: 10 }),
  disco: varchar("disco", { length: 50 }),
  transportation: varchar("transportation", { length: 10 }),
  roofPhotos: text("roof_photos"), // JSON array of file paths
  totalLoad: varchar("total_load", { length: 50 }),
  panelsRequired: varchar("panels_required", { length: 20 }),
  inverterSize: varchar("inverter_size", { length: 50 }),
  batteryCapacityCalc: varchar("battery_capacity_calc", { length: 50 }), // Calculated battery capacity
  
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support tickets
export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(), // Reference to users.id  
  customerName: varchar("customer_name", { length: 100 }),
  assignedToId: varchar("assigned_to_id"), // Reference to users.id
  assignedTechnicianId: varchar("assigned_technician_id").references(() => technicians.id),
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description"),
  status: ticketStatusEnum("status").default('open'),
  priority: ticketPriorityEnum("priority").default('medium'),
  category: varchar("category", { length: 50 }),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Solar calculator results
export const calculatorResults = pgTable("calculator_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  lights: integer("lights").default(0),
  fans: integer("fans").default(0),
  acs: integer("acs").default(0),
  computers: integer("computers").default(0),
  kitchen: integer("kitchen").default(0),
  misc: integer("misc").default(0),
  dailyConsumption: decimal("daily_consumption", { precision: 8, scale: 2 }),
  recommendedCapacity: decimal("recommended_capacity", { precision: 8, scale: 2 }),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quotation edit requests
export const quotationEditRequestsStatusEnum = pgEnum("quotation_edit_request_status", ["pending", "approved", "rejected"]);

export const quotationEditRequests = pgTable("quotation_edit_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quotationId: varchar("quotation_id").references(() => quotations.id).notNull(),
  customerId: varchar("customer_id").notNull(), // Reference to users.id
  requestedChanges: text("requested_changes").notNull(),
  status: quotationEditRequestsStatusEnum("status").default('pending'),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  installations: many(installations),
  complaints: many(complaints),
  tickets: many(tickets),
  calculatorResults: many(calculatorResults),
}));

export const techniciansRelations = relations(technicians, ({ one, many }) => ({
  user: one(users, {
    fields: [technicians.userId],
    references: [users.id],
  }),
  installations: many(installations),
  assignedComplaints: many(complaints),
}));

export const installationsRelations = relations(installations, ({ one, many }) => ({
  quotation: one(quotations, {
    fields: [installations.quotationId],
    references: [quotations.id],
  }),
  customer: one(users, {
    fields: [installations.customerId],
    references: [users.id],
  }),
  technician: one(technicians, {
    fields: [installations.technicianId],
    references: [technicians.id],
  }),
  service: one(services, {
    fields: [installations.serviceId],
    references: [services.id],
  }),
  complaints: many(complaints),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  customer: one(users, {
    fields: [complaints.customerId],
    references: [users.id],
  }),
  installation: one(installations, {
    fields: [complaints.installationId],
    references: [installations.id],
  }),
  assignedTechnician: one(technicians, {
    fields: [complaints.assignedTechnicianId],
    references: [technicians.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  customer: one(users, {
    fields: [tickets.customerId],
    references: [users.id],
  }),
  assignedTo: one(users, {
    fields: [tickets.assignedToId],
    references: [users.id],
  }),
  assignedTechnician: one(technicians, {
    fields: [tickets.assignedTechnicianId],
    references: [technicians.id],
  }),
}));

export const quotationsRelations = relations(quotations, ({ one, many }) => ({
  customer: one(users, {
    fields: [quotations.customerId],
    references: [users.id],
  }),
  installations: many(installations),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTechnicianSchema = createInsertSchema(technicians).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInstallationSchema = createInsertSchema(installations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  date: true,
}).extend({
  // Allow both string and number inputs for numeric fields
  energyConsumption: z.union([z.string(), z.number()]).transform(val => {
    if (typeof val === 'number') return val.toString();
    return val || null;
  }).optional().nullable(),
  systemSize: z.union([z.string(), z.number()]).transform(val => {
    if (typeof val === 'number') return val.toString();
    return val || null;
  }).optional().nullable(),
  estimatedCost: z.union([z.string(), z.number()]).transform(val => {
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'string' && val.trim() === '') return null;
    return val || null;
  }).optional().nullable(),
  amount: z.union([z.string(), z.number()]).transform(val => {
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'string' && val.trim() === '') return null;
    return val || null;
  }).optional().nullable(),
  customerId: z.string().optional(), // Make customerId optional for updates
});

export const insertCalculatorResultSchema = createInsertSchema(calculatorResults).omit({
  id: true,
  createdAt: true,
});

export const insertQuotationEditRequestSchema = createInsertSchema(quotationEditRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Technician = typeof technicians.$inferSelect;
export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;
export type Installation = typeof installations.$inferSelect;
export type InsertInstallation = z.infer<typeof insertInstallationSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type CalculatorResult = typeof calculatorResults.$inferSelect;
export type InsertCalculatorResult = z.infer<typeof insertCalculatorResultSchema>;
export type QuotationEditRequest = typeof quotationEditRequests.$inferSelect;
export type InsertQuotationEditRequest = z.infer<typeof insertQuotationEditRequestSchema>;
