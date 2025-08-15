import { db } from "./db";
import { decimal } from "drizzle-orm/pg-core";
import { 
  users, 
  services, 
  technicians, 
  installations, 
  complaints, 
  tickets,
  quotations 
} from "@shared/schema";
import { sql } from "drizzle-orm";

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Clear existing data (except the current logged-in user)
    await db.delete(tickets).where(sql`1=1`);
    await db.delete(complaints).where(sql`1=1`);
    await db.delete(installations).where(sql`1=1`);
    await db.delete(quotations).where(sql`1=1`);
    await db.delete(technicians).where(sql`1=1`);
    await db.delete(services).where(sql`1=1`);
    
    // Don't delete current users - only clean up orphaned technician records
    // The getTechnicians() method will create proper technician profiles dynamically
    
    console.log("Cleared existing data");

    // Insert dummy users (keeping the existing admin user)
    const dummyUsers = [
      // Customer users - 25 Pakistani names
      { id: "user-001", email: "ahmed.khan@gmail.com", firstName: "Ahmed", lastName: "Khan", role: "customer" as const },
      { id: "user-002", email: "fatima.ali@gmail.com", firstName: "Fatima", lastName: "Ali", role: "customer" as const },
      { id: "user-003", email: "muhammad.hassan@gmail.com", firstName: "Muhammad", lastName: "Hassan", role: "customer" as const },
      { id: "user-004", email: "ayesha.shah@gmail.com", firstName: "Ayesha", lastName: "Shah", role: "customer" as const },
      { id: "user-005", email: "usman.malik@gmail.com", firstName: "Usman", lastName: "Malik", role: "customer" as const },
      { id: "user-006", email: "zainab.ahmed@gmail.com", firstName: "Zainab", lastName: "Ahmed", role: "customer" as const },
      { id: "user-007", email: "ali.raza@gmail.com", firstName: "Ali", lastName: "Raza", role: "customer" as const },
      { id: "user-008", email: "khadija.iqbal@gmail.com", firstName: "Khadija", lastName: "Iqbal", role: "customer" as const },
      { id: "user-009", email: "hassan.butt@gmail.com", firstName: "Hassan", lastName: "Butt", role: "customer" as const },
      { id: "user-010", email: "maria.siddique@gmail.com", firstName: "Maria", lastName: "Siddique", role: "customer" as const },
      { id: "user-011", email: "omar.farooq@gmail.com", firstName: "Omar", lastName: "Farooq", role: "customer" as const },
      { id: "user-012", email: "sana.nawaz@gmail.com", firstName: "Sana", lastName: "Nawaz", role: "customer" as const },
      { id: "user-013", email: "bilal.tariq@gmail.com", firstName: "Bilal", lastName: "Tariq", role: "customer" as const },
      { id: "user-014", email: "nida.sultan@gmail.com", firstName: "Nida", lastName: "Sultan", role: "customer" as const },
      { id: "user-015", email: "imran.sheikh@gmail.com", firstName: "Imran", lastName: "Sheikh", role: "customer" as const },
      { id: "user-016", email: "rubina.dar@gmail.com", firstName: "Rubina", lastName: "Dar", role: "customer" as const },
      { id: "user-017", email: "adnan.chaudhry@gmail.com", firstName: "Adnan", lastName: "Chaudhry", role: "customer" as const },
      { id: "user-018", email: "farah.baig@gmail.com", firstName: "Farah", lastName: "Baig", role: "customer" as const },
      { id: "user-019", email: "hamza.qureshi@gmail.com", firstName: "Hamza", lastName: "Qureshi", role: "customer" as const },
      { id: "user-020", email: "saima.mirza@gmail.com", firstName: "Saima", lastName: "Mirza", role: "customer" as const },
      { id: "user-021", email: "faisal.ansari@gmail.com", firstName: "Faisal", lastName: "Ansari", role: "customer" as const },
      { id: "user-022", email: "hina.jamil@gmail.com", firstName: "Hina", lastName: "Jamil", role: "customer" as const },
      { id: "user-023", email: "shahzad.bhatti@gmail.com", firstName: "Shahzad", lastName: "Bhatti", role: "customer" as const },
      { id: "user-024", email: "rabia.ahmed@gmail.com", firstName: "Rabia", lastName: "Ahmed", role: "customer" as const },
      { id: "user-025", email: "naveed.akhtar@gmail.com", firstName: "Naveed", lastName: "Akhtar", role: "customer" as const },
      
      // Technician users - 20 Pakistani names
      { id: "tech-001", email: "rashid.mahmood@electrocare.com", firstName: "Rashid", lastName: "Mahmood", role: "technician" as const },
      { id: "tech-002", email: "waqar.azeem@electrocare.com", firstName: "Waqar", lastName: "Azeem", role: "technician" as const },
      { id: "tech-003", email: "tariq.hussain@electrocare.com", firstName: "Tariq", lastName: "Hussain", role: "technician" as const },
      { id: "tech-004", email: "sajjad.haider@electrocare.com", firstName: "Sajjad", lastName: "Haider", role: "technician" as const },
      { id: "tech-005", email: "kamran.asif@electrocare.com", firstName: "Kamran", lastName: "Asif", role: "technician" as const },
      { id: "tech-006", email: "zaheer.ahmad@electrocare.com", firstName: "Zaheer", lastName: "Ahmad", role: "technician" as const },
      { id: "tech-007", email: "nasir.shah@electrocare.com", firstName: "Nasir", lastName: "Shah", role: "technician" as const },
      { id: "tech-008", email: "amjad.khan@electrocare.com", firstName: "Amjad", lastName: "Khan", role: "technician" as const },
      { id: "tech-009", email: "jawad.malik@electrocare.com", firstName: "Jawad", lastName: "Malik", role: "technician" as const },
      { id: "tech-010", email: "shahid.iqbal@electrocare.com", firstName: "Shahid", lastName: "Iqbal", role: "technician" as const },
      { id: "tech-011", email: "asif.raja@electrocare.com", firstName: "Asif", lastName: "Raja", role: "technician" as const },
      { id: "tech-012", email: "munir.ahmed@electrocare.com", firstName: "Munir", lastName: "Ahmed", role: "technician" as const },
      { id: "tech-013", email: "shafiq.butt@electrocare.com", firstName: "Shafiq", lastName: "Butt", role: "technician" as const },
      { id: "tech-014", email: "pervez.ali@electrocare.com", firstName: "Pervez", lastName: "Ali", role: "technician" as const },
      { id: "tech-015", email: "hanif.dar@electrocare.com", firstName: "Hanif", lastName: "Dar", role: "technician" as const },
      { id: "tech-016", email: "rafiq.sheikh@electrocare.com", firstName: "Rafiq", lastName: "Sheikh", role: "technician" as const },
      { id: "tech-017", email: "khalil.chaudhry@electrocare.com", firstName: "Khalil", lastName: "Chaudhry", role: "technician" as const },
      { id: "tech-018", email: "noman.qureshi@electrocare.com", firstName: "Noman", lastName: "Qureshi", role: "technician" as const },
      { id: "tech-019", email: "salman.ansari@electrocare.com", firstName: "Salman", lastName: "Ansari", role: "technician" as const },
      { id: "tech-020", email: "waseem.bhatti@electrocare.com", firstName: "Waseem", lastName: "Bhatti", role: "technician" as const },
    ];

    for (const user of dummyUsers) {
      await db.insert(users).values(user).onConflictDoNothing();
    }
    console.log("Inserted dummy users");

    // Insert services - 20+ comprehensive services
    const dummyServices = [
      { 
        id: "srv-001", 
        name: "Residential Solar Installation", 
        description: "Complete solar panel installation for homes including panels, inverter, and monitoring system",
        category: "installation",
        price: 450000,
        duration: "2-3 days"
      },
      { 
        id: "srv-002", 
        name: "Commercial Solar Setup", 
        description: "Large-scale solar installation for commercial buildings and warehouses",
        category: "installation",
        price: 2250000,
        duration: "1-2 weeks"
      },
      { 
        id: "srv-003", 
        name: "Solar System Maintenance", 
        description: "Annual maintenance package including cleaning, inspection, and performance optimization",
        category: "maintenance",
        price: 15000,
        duration: "4 hours"
      },
      { 
        id: "srv-004", 
        name: "Battery Storage Installation", 
        description: "Add battery backup system to existing solar installation",
        category: "installation",
        price: 240000,
        duration: "1 day"
      },
      { 
        id: "srv-005", 
        name: "Solar Consultation", 
        description: "Professional consultation for solar system sizing and ROI analysis",
        category: "consultation",
        price: 6000,
        duration: "2 hours"
      },
      { 
        id: "srv-006", 
        name: "Rooftop Solar Installation", 
        description: "Specialized rooftop solar panel installation with safety measures",
        category: "installation",
        price: 380000,
        duration: "1-2 days"
      },
      { 
        id: "srv-007", 
        name: "Ground Mount Solar System", 
        description: "Ground-mounted solar panel installation for open spaces",
        category: "installation",
        price: 520000,
        duration: "3-4 days"
      },
      { 
        id: "srv-008", 
        name: "Solar Panel Cleaning Service", 
        description: "Professional cleaning service for solar panels to maintain efficiency",
        category: "maintenance",
        price: 8000,
        duration: "2-3 hours"
      },
      { 
        id: "srv-009", 
        name: "Inverter Replacement", 
        description: "Professional inverter replacement and upgrade service",
        category: "repair",
        price: 85000,
        duration: "4-6 hours"
      },
      { 
        id: "srv-010", 
        name: "Solar System Monitoring Setup", 
        description: "Installation of monitoring systems for real-time performance tracking",
        category: "installation",
        price: 25000,
        duration: "2-3 hours"
      },
      { 
        id: "srv-011", 
        name: "Net Metering Installation", 
        description: "Setup of net metering system with utility company coordination",
        category: "installation",
        price: 35000,
        duration: "1-2 days"
      },
      { 
        id: "srv-012", 
        name: "Solar Water Heater Installation", 
        description: "Solar-powered water heating system installation",
        category: "installation",
        price: 180000,
        duration: "1 day"
      },
      { 
        id: "srv-013", 
        name: "Hybrid Solar System", 
        description: "Grid-tied solar system with battery backup capability",
        category: "installation",
        price: 680000,
        duration: "3-5 days"
      },
      { 
        id: "srv-014", 
        name: "Solar Panel Repair Service", 
        description: "Repair and maintenance of damaged solar panels",
        category: "repair",
        price: 18000,
        duration: "2-4 hours"
      },
      { 
        id: "srv-015", 
        name: "Solar Carport Installation", 
        description: "Solar panels installed over parking areas",
        category: "installation",
        price: 750000,
        duration: "1 week"
      },
      { 
        id: "srv-016", 
        name: "Off-Grid Solar System", 
        description: "Complete off-grid solar solution with battery bank",
        category: "installation",
        price: 850000,
        duration: "4-6 days"
      },
      { 
        id: "srv-017", 
        name: "Solar System Upgrade", 
        description: "Upgrade existing solar installations with newer technology",
        category: "upgrade",
        price: 120000,
        duration: "1-2 days"
      },
      { 
        id: "srv-018", 
        name: "Emergency Solar Repair", 
        description: "24/7 emergency repair service for critical solar system issues",
        category: "repair",
        price: 25000,
        duration: "Same day"
      },
      { 
        id: "srv-019", 
        name: "Solar Permit Processing", 
        description: "Complete permit processing and documentation for solar installations",
        category: "consultation",
        price: 15000,
        duration: "1-2 weeks"
      },
      { 
        id: "srv-020", 
        name: "Solar Energy Audit", 
        description: "Comprehensive energy audit to optimize solar system performance",
        category: "consultation",
        price: 12000,
        duration: "4-6 hours"
      },
    ];

    await db.insert(services).values(dummyServices);
    console.log("Inserted services");

    // Insert technicians
    // Don't insert dummy technicians here anymore - they will be created dynamically
    // based on users with role "technician" by the getTechnicians() method
    console.log("Technician profiles will be created dynamically for users with technician role");

    // Insert quotations first (required for installations)
    const dummyQuotations = [
      { 
        id: "quote-001", 
        customerId: "user-001", 
        customerName: "Ahmed Khan", 
        propertyType: "Residential", 
        systemSize: 5.0, 
        estimatedCost: 750000, 
        installationTimeline: "2-3 weeks", 
        amount: 750000, 
        status: "approved" 
      },
      { 
        id: "quote-002", 
        customerId: "user-002", 
        customerName: "Fatima Ali", 
        propertyType: "Commercial", 
        systemSize: 8.5, 
        estimatedCost: 850000, 
        installationTimeline: "3-4 weeks", 
        amount: 850000, 
        status: "approved" 
      },
      { 
        id: "quote-003", 
        customerId: "user-003", 
        customerName: "Muhammad Hassan", 
        propertyType: "Industrial", 
        systemSize: 4.5, 
        estimatedCost: 550000, 
        installationTimeline: "2 weeks", 
        amount: 550000, 
        status: "approved" 
      },
      { 
        id: "quote-004", 
        customerId: "user-004", 
        customerName: "Ayesha Shah", 
        propertyType: "Residential", 
        systemSize: 3.5, 
        estimatedCost: 450000, 
        installationTimeline: "1-2 weeks", 
        amount: 450000, 
        status: "approved" 
      },
      { 
        id: "quote-005", 
        customerId: "user-005", 
        customerName: "Usman Malik", 
        propertyType: "Commercial", 
        systemSize: 2.5, 
        estimatedCost: 320000, 
        installationTimeline: "2 weeks", 
        amount: 320000, 
        status: "approved" 
      },
      { 
        id: "quote-006", 
        customerId: "user-006", 
        customerName: "Zainab Ahmed", 
        propertyType: "Residential", 
        systemSize: 2.0, 
        estimatedCost: 280000, 
        installationTimeline: "1-2 weeks", 
        amount: 280000, 
        status: "approved" 
      },
      { 
        id: "quote-007", 
        customerId: "user-007", 
        customerName: "Ali Raza", 
        propertyType: "Commercial", 
        systemSize: 6.0, 
        estimatedCost: 650000, 
        installationTimeline: "3 weeks", 
        amount: 650000, 
        status: "approved" 
      },
      { 
        id: "quote-008", 
        customerId: "user-008", 
        customerName: "Khadija Iqbal", 
        propertyType: "Residential", 
        systemSize: 1.5, 
        estimatedCost: 180000, 
        installationTimeline: "1 week", 
        amount: 180000, 
        status: "approved" 
      },
      { 
        id: "quote-009", 
        customerId: "user-009", 
        customerName: "Hassan Butt", 
        propertyType: "Industrial", 
        systemSize: 12.0, 
        estimatedCost: 950000, 
        installationTimeline: "4-5 weeks", 
        amount: 950000, 
        status: "approved" 
      },
      { 
        id: "quote-010", 
        customerId: "user-010", 
        customerName: "Maria Siddique", 
        propertyType: "Residential", 
        systemSize: 2.2, 
        estimatedCost: 220000, 
        installationTimeline: "1-2 weeks", 
        amount: 220000, 
        status: "approved" 
      },
      { 
        id: "quote-011", 
        customerId: "user-011", 
        customerName: "Omar Farooq", 
        propertyType: "Commercial", 
        systemSize: 4.0, 
        estimatedCost: 420000, 
        installationTimeline: "2-3 weeks", 
        amount: 420000, 
        status: "approved" 
      },
      { 
        id: "quote-012", 
        customerId: "user-012", 
        customerName: "Sana Nawaz", 
        propertyType: "Residential", 
        systemSize: 1.8, 
        estimatedCost: 150000, 
        installationTimeline: "1 week", 
        amount: 150000, 
        status: "approved" 
      },
      { 
        id: "quote-013", 
        customerId: "user-013", 
        customerName: "Bilal Tariq", 
        propertyType: "Commercial", 
        systemSize: 3.8, 
        estimatedCost: 380000, 
        installationTimeline: "2 weeks", 
        amount: 380000, 
        status: "approved" 
      },
      { 
        id: "quote-014", 
        customerId: "user-014", 
        customerName: "Nida Sultan", 
        propertyType: "Residential", 
        systemSize: 2.8, 
        estimatedCost: 280000, 
        installationTimeline: "1-2 weeks", 
        amount: 280000, 
        status: "approved" 
      },
      { 
        id: "quote-015", 
        customerId: "user-015", 
        customerName: "Imran Sheikh", 
        propertyType: "Industrial", 
        systemSize: 7.2, 
        estimatedCost: 620000, 
        installationTimeline: "3-4 weeks", 
        amount: 620000, 
        status: "approved" 
      },
      { 
        id: "quote-016", 
        customerId: "user-016", 
        customerName: "Rubina Dar", 
        propertyType: "Commercial", 
        systemSize: 4.8, 
        estimatedCost: 480000, 
        installationTimeline: "2-3 weeks", 
        amount: 480000, 
        status: "approved" 
      },
      { 
        id: "quote-017", 
        customerId: "user-017", 
        customerName: "Adnan Chaudhry", 
        propertyType: "Residential", 
        systemSize: 3.5, 
        estimatedCost: 350000, 
        installationTimeline: "2 weeks", 
        amount: 350000, 
        status: "approved" 
      },
      { 
        id: "quote-018", 
        customerId: "user-018", 
        customerName: "Farah Baig", 
        propertyType: "Commercial", 
        systemSize: 5.8, 
        estimatedCost: 580000, 
        installationTimeline: "3 weeks", 
        amount: 580000, 
        status: "approved" 
      },
      { 
        id: "quote-019", 
        customerId: "user-019", 
        customerName: "Hamza Qureshi", 
        propertyType: "Residential", 
        systemSize: 1.2, 
        estimatedCost: 120000, 
        installationTimeline: "1 week", 
        amount: 120000, 
        status: "approved" 
      },
      { 
        id: "quote-020", 
        customerId: "user-020", 
        customerName: "Faiza Jamil", 
        propertyType: "Residential", 
        systemSize: 1.0, 
        estimatedCost: 90000, 
        installationTimeline: "1 week", 
        amount: 90000, 
        status: "approved" 
      },
    ];

    await db.insert(quotations).values(dummyQuotations);
    console.log("Inserted quotations");

    // Insert installations (linked to quotations)
    const dummyInstallations = [
      {
        id: "inst-001",
        quotationId: "quote-001",
        customerId: "user-001",
        serviceId: "srv-001",
        technicianId: null,
        capacity: 5.0, // From quote-001
        scheduledDate: new Date("2024-01-15"),
        completionDate: new Date("2024-01-17"),
        status: "completed" as const,
        address: "House #45, Street 12, F-10/2, Islamabad",
        notes: "5kW residential system installed successfully"
      },
      {
        id: "inst-002",
        quotationId: "quote-002",
        customerId: "user-002",
        serviceId: "srv-006",
        technicianId: null,
        capacity: 8.5, // From quote-002
        scheduledDate: new Date("2024-01-20"),
        completionDate: null,
        status: "in_progress" as const,
        address: "Flat #302, Al-Hamd Plaza, Blue Area, Islamabad",
        notes: "Installation in progress, awaiting final inspection"
      },
      {
        id: "inst-003",
        quotationId: "quote-003",
        customerId: "user-003",
        serviceId: "srv-002",
        technicianId: null,
        capacity: 4.5, // From quote-003
        scheduledDate: new Date("2024-01-25"),
        completionDate: null,
        status: "pending" as const,
        address: "Industrial Area, GT Road, Gujranwala, Punjab",
        notes: "20kW commercial installation scheduled"
      },
      {
        id: "inst-004",
        quotationId: "quote-004",
        customerId: "user-004",
        serviceId: "srv-004",
        technicianId: null,
        capacity: 3.5, // From quote-004
        scheduledDate: new Date("2024-01-10"),
        completionDate: new Date("2024-01-10"),
        status: "completed" as const,
        address: "House #78, Model Town, Lahore, Punjab",
        notes: "Battery storage installation completed"
      },
      {
        id: "inst-005",
        quotationId: "quote-005",
        customerId: "user-005",
        serviceId: "srv-003",
        technicianId: null,
        capacity: 2.5, // From quote-005
        scheduledDate: new Date("2024-01-30"),
        completionDate: null,
        status: "pending" as const,
        address: "Villa #23, DHA Phase 5, Karachi, Sindh",
        notes: "Annual maintenance scheduled"
      },
      {
        id: "inst-006",
        quotationId: "quote-006",
        customerId: "user-006",
        serviceId: "srv-007",
        technicianId: null,
        capacity: 2.0, // From quote-006
        scheduledDate: new Date("2024-02-01"),
        completionDate: null,
        status: "pending" as const,
        address: "Farm House, Sargodha Road, Faisalabad, Punjab",
        notes: "Ground mount solar system for agriculture"
      },
      {
        id: "inst-007",
        quotationId: "quote-007",
        customerId: "user-007",
        serviceId: "srv-001",
        technicianId: null,
        capacity: 6.0, // From quote-007
        scheduledDate: new Date("2024-01-18"),
        completionDate: new Date("2024-01-20"),
        status: "completed" as const,
        address: "House #156, Satellite Town, Rawalpindi, Punjab",
        notes: "8kW residential installation with net metering"
      },
      {
        id: "inst-008",
        quotationId: "quote-008",
        customerId: "user-008",
        serviceId: "srv-012",
        technicianId: null,
        capacity: 1.5, // From quote-008
        scheduledDate: new Date("2024-02-05"),
        completionDate: null,
        status: "pending" as const,
        address: "Bungalow #34, Gulshan-e-Iqbal, Karachi, Sindh",
        notes: "Solar water heater installation"
      },
      {
        id: "inst-009",
        quotationId: "quote-009",
        customerId: "user-009",
        serviceId: "srv-013",
        technicianId: null,
        capacity: 7.5, // From quote-009
        scheduledDate: new Date("2024-01-28"),
        completionDate: null,
        status: "in_progress" as const,
        address: "Plaza #12, Commercial Area, Peshawar, KPK",
        notes: "Hybrid solar system for office building"
      },
      {
        id: "inst-010",
        quotationId: "quote-010",
        customerId: "user-010",
        serviceId: "srv-016",
        technicianId: null,
        capacity: 3.0, // From quote-010
        scheduledDate: new Date("2024-02-10"),
        completionDate: null,
        status: "pending" as const,
        address: "Remote Location, Chitral, KPK",
        notes: "Off-grid solar system for remote area"
      },
      {
        id: "inst-011",
        quotationId: "quote-011",
        customerId: "user-011",
        serviceId: "srv-015",
        technicianId: null,
        capacity: 9.0, // From quote-011
        scheduledDate: new Date("2024-02-15"),
        completionDate: null,
        status: "pending" as const,
        address: "Shopping Mall, MM Alam Road, Lahore, Punjab",
        notes: "Solar carport installation for parking area"
      },
      {
        id: "inst-012",
        quotationId: "quote-012",
        customerId: "user-012",
        serviceId: "srv-008",
        technicianId: null,
        capacity: 5.5, // From quote-012
        scheduledDate: new Date("2024-01-12"),
        completionDate: new Date("2024-01-12"),
        status: "completed" as const,
        address: "House #89, Wapda Town, Lahore, Punjab",
        notes: "Solar panel cleaning service completed"
      },
      {
        id: "inst-013",
        quotationId: "quote-013",
        customerId: "user-013",
        serviceId: "srv-009",
        technicianId: null,
        scheduledDate: new Date("2024-01-22"),
        completionDate: new Date("2024-01-22"),
        status: "completed" as const,
        address: "Factory #5, Sialkot Industrial Area, Punjab",
        notes: "Inverter replacement and upgrade"
      },
      {
        id: "inst-014",
        quotationId: "quote-014",
        customerId: "user-014",
        serviceId: "srv-010",
        technicianId: null,
        scheduledDate: new Date("2024-02-08"),
        completionDate: null,
        status: "pending" as const,
        address: "Apartment #501, Creek Vista, Karachi, Sindh",
        notes: "Solar monitoring system setup"
      },
      {
        id: "inst-015",
        quotationId: "quote-015",
        customerId: "user-015",
        serviceId: "srv-011",
        technicianId: null,
        scheduledDate: new Date("2024-01-26"),
        completionDate: null,
        status: "in_progress" as const,
        address: "Bungalow #67, Cantt Area, Multan, Punjab",
        notes: "Net metering installation in progress"
      },
      {
        id: "inst-016",
        quotationId: "quote-016",
        customerId: "user-016",
        serviceId: "srv-017",
        technicianId: null,
        scheduledDate: new Date("2024-02-12"),
        completionDate: null,
        status: "pending" as const,
        address: "House #123, Johar Town, Lahore, Punjab",
        notes: "Solar system upgrade to latest technology"
      },
      {
        id: "inst-017",
        quotationId: "quote-017",
        customerId: "user-017",
        serviceId: "srv-014",
        technicianId: null,
        scheduledDate: new Date("2024-01-14"),
        completionDate: new Date("2024-01-14"),
        status: "completed" as const,
        address: "Villa #45, Defence, Karachi, Sindh",
        notes: "Solar panel repair after storm damage"
      },
      {
        id: "inst-018",
        quotationId: "quote-018",
        customerId: "user-018",
        serviceId: "srv-018",
        technicianId: null,
        scheduledDate: new Date("2024-01-19"),
        completionDate: new Date("2024-01-19"),
        status: "completed" as const,
        address: "Hospital Building, Jail Road, Lahore, Punjab",
        notes: "Emergency solar repair completed"
      },
      {
        id: "inst-019",
        quotationId: "quote-019",
        customerId: "user-019",
        serviceId: "srv-019",
        technicianId: null,
        scheduledDate: new Date("2024-02-20"),
        completionDate: null,
        status: "pending" as const,
        address: "Commercial Plot, I.I. Chundrigar Road, Karachi, Sindh",
        notes: "Solar permit processing for commercial building"
      },
      {
        id: "inst-020",
        quotationId: "quote-020",
        customerId: "user-020",
        serviceId: "srv-020",
        technicianId: null,
        scheduledDate: new Date("2024-01-16"),
        completionDate: new Date("2024-01-16"),
        status: "completed" as const,
        address: "Residence #234, Garden Town, Lahore, Punjab",
        notes: "Solar energy audit completed with recommendations"
      },
    ];

    await db.insert(installations).values(dummyInstallations);
    console.log("Inserted installations");

    // Insert complaints
    const dummyComplaints = [
      // 20+ Pakistani customer complaints
      {
        id: "cmp-001",
        customerId: "user-001",
        customerName: "Ahmed Khan",
        installationId: "inst-001",
        title: "System not generating expected power",
        description: "The solar panels are producing only 60% of the promised output. Need immediate inspection.",
        status: "open" as const,
        priority: "high" as const,
        assignedTechnicianId: null,
        resolution: null,
        createdAt: new Date("2024-01-22"),
        resolvedAt: null
      },
      {
        id: "cmp-002",
        quotationId: "quote-002",
        customerId: "user-002",
        customerName: "Fatima Ali",
        installationId: "inst-002",
        title: "Inverter making noise",
        description: "The inverter is making a buzzing sound, especially during peak hours.",
        status: "investigating" as const,
        priority: "medium" as const,
        assignedTechnicianId: null,
        resolution: null,
        createdAt: new Date("2024-01-20"),
        resolvedAt: null
      },
      {
        id: "cmp-003",
        quotationId: "quote-004",
        customerId: "user-004",
        customerName: "Ayesha Shah",
        installationId: "inst-004",
        title: "Panel damage after storm",
        description: "One panel appears to have been damaged during last week's hailstorm.",
        status: "resolved" as const,
        priority: "high" as const,
        assignedTechnicianId: null,
        resolution: "Panel replaced under warranty. System fully operational.",
        createdAt: new Date("2024-01-18"),
        resolvedAt: new Date("2024-01-19")
      },
      {
        id: "cmp-004",
        customerId: "user-001",
        customerName: "Ahmed Khan",
        installationId: "inst-001",
        title: "Monitoring app not working",
        description: "Cannot access the solar monitoring app. Shows connection error.",
        status: "open" as const,
        priority: "low" as const,
        assignedTechnicianId: null,
        resolution: null,
        createdAt: new Date("2024-01-15"),
        resolvedAt: null
      },
      {
        id: "cmp-005",
        quotationId: "quote-003",
        customerId: "user-003",
        customerName: "Muhammad Hassan",
        installationId: "inst-003",
        title: "Installation delay",
        description: "Installation was supposed to start last week but no technician has arrived yet.",
        status: "investigating" as const,
        priority: "high" as const,
        assignedTechnicianId: null,
        resolution: null,
        createdAt: new Date("2024-01-24"),
        resolvedAt: null
      },
      {
        id: "cmp-006",
        quotationId: "quote-005",
        customerId: "user-005",
        customerName: "Usman Malik",
        installationId: "inst-005",
        title: "Poor installation quality",
        description: "Cables are not properly organized and safety standards were not followed.",
        status: "open" as const,
        priority: "high" as const,
        assignedTechnicianId: null,
        resolution: null,
        createdAt: new Date("2024-01-30"),
        resolvedAt: null
      },
      {
        id: "cmp-007",
        quotationId: "quote-006",
        customerId: "user-006",
        customerName: "Zainab Ahmed",
        installationId: "inst-006",
        title: "Battery not charging properly",
        description: "The battery system shows charging issues and doesn't hold charge overnight.",
        status: "investigating" as const,
        priority: "medium" as const,
        assignedTechnicianId: null,
        resolution: null,
        createdAt: new Date("2024-02-01"),
        resolvedAt: null
      },
      {
        id: "cmp-008",
        quotationId: "quote-007",
        customerId: "user-007",
        customerName: "Ali Raza",
        installationId: "inst-007",
        title: "Net metering not working",
        description: "Excess power is not being fed back to the grid as expected.",
        status: "resolved" as const,
        priority: "medium" as const,
        assignedTechnicianId: null,
        resolution: "Net meter configuration corrected. Now functioning properly.",
        createdAt: new Date("2024-01-21"),
        resolvedAt: new Date("2024-01-23")
      },
      {
        id: "cmp-009",
        quotationId: "quote-008",
        customerId: "user-008",
        customerName: "Khadija Iqbal",
        installationId: "inst-008",
        title: "Water heater temperature issues",
        description: "Solar water heater is not heating water to the desired temperature.",
        status: "open" as const,
        priority: "medium" as const,
        assignedTechnicianId: null,
        resolution: null,
        createdAt: new Date("2024-02-06"),
        resolvedAt: null
      },
      {
        id: "cmp-010",
        quotationId: "quote-009",
        customerId: "user-009",
        customerName: "Hassan Butt",
        installationId: "inst-009",
        title: "System performance degradation",
        description: "Power output has decreased by 30% over the past month.",
        status: "investigating" as const,
        priority: "high" as const,
        assignedTechnicianId: null,
        resolution: null,
        createdAt: new Date("2024-01-29"),
        resolvedAt: null
      },
      {
        id: "cmp-011",
        quotationId: "quote-010",
        customerId: "user-010",
        customerName: "Maria Siddique",
        installationId: "inst-010",
        title: "Installation location dispute",
        description: "Panels were installed in suboptimal location without proper consultation.",
        status: "open" as const,
        priority: "high" as const,
        assignedTechnicianId: null,
        resolution: null,
        createdAt: new Date("2024-02-11"),
        resolvedAt: null
      },
      {
        id: "cmp-012",
        quotationId: "quote-011",
        customerId: "user-011",
        customerName: "Omar Farooq",
        installationId: "inst-011",
        title: "Structural damage during installation",
        description: "Roof tiles were damaged during solar panel installation process.",
        status: "resolved" as const,
        priority: "high" as const,
        assignedTechnicianId: null,
        resolution: "Roof tiles replaced and installation corrected. No additional cost.",
        createdAt: new Date("2024-02-16"),
        resolvedAt: new Date("2024-02-18")
      },
      {
        id: "cmp-013",
        quotationId: "quote-012",
        customerId: "user-012",
        customerName: "Sana Nawaz",
        installationId: "inst-012",
        title: "Incomplete cleaning service",
        description: "Some panels were not properly cleaned during maintenance visit.",
        status: "resolved" as const,
        priority: "low" as const,
        assignedTechnicianId: null,
        resolution: "Cleaning service redone at no extra cost. All panels properly maintained.",
        createdAt: new Date("2024-01-13"),
        resolvedAt: new Date("2024-01-14")
      },
      {
        id: "cmp-014",
        quotationId: "quote-013",
        customerId: "user-013",
        customerName: "Bilal Tariq",
        installationId: "inst-013",
        title: "Wrong inverter model installed",
        description: "Different inverter model was installed than what was specified in contract.",
        status: "open" as const,
        priority: "medium" as const,
        assignedTechnicianId: null,
        resolution: null,
        createdAt: new Date("2024-01-23"),
        resolvedAt: null
      },
      {
        id: "cmp-015",
        quotationId: "quote-014",
        customerId: "user-014",
        customerName: "Nida Sultan",
        installationId: "inst-014",
        title: "Monitoring system connectivity issues",
        description: "Unable to connect monitoring system to Wi-Fi network.",
        status: "investigating" as const,
        priority: "low" as const,
        assignedTechnicianId: null,
        resolution: null,
        createdAt: new Date("2024-02-09"),
        resolvedAt: null
      },
      {
        id: "cmp-016",
        quotationId: "quote-015",
        customerId: "user-015",
        customerName: "Imran Sheikh",
        installationId: "inst-015",
        title: "Permit approval delays",
        description: "Net metering permit is taking longer than expected to get approved.",
        status: "investigating" as const,
        priority: "medium" as const,
        assignedTechnicianId: null,
        resolution: null,
        createdAt: new Date("2024-01-27"),
        resolvedAt: null
      },
      {
        id: "cmp-017",
        quotationId: "quote-016",
        customerId: "user-016",
        customerName: "Rubina Dar",
        installationId: "inst-016",
        title: "Upgrade cost discrepancy",
        description: "Final cost for system upgrade is different from initial quote.",
        status: "open" as const,
        priority: "high" as const,
        assignedTechnicianId: null,
        resolution: null,
        createdAt: new Date("2024-02-13"),
        resolvedAt: null
      },
      {
        id: "cmp-018",
        quotationId: "quote-017",
        customerId: "user-017",
        customerName: "Adnan Chaudhry",
        installationId: "inst-017",
        title: "Warranty claim process",
        description: "Facing difficulties in processing warranty claim for damaged panel.",
        status: "resolved" as const,
        priority: "medium" as const,
        assignedTechnicianId: null,
        resolution: "Warranty claim processed successfully. Panel replaced.",
        createdAt: new Date("2024-01-15"),
        resolvedAt: new Date("2024-01-16")
      },
      {
        id: "cmp-019",
        quotationId: "quote-018",
        customerId: "user-018",
        customerName: "Farah Baig",
        installationId: "inst-018",
        title: "Response time for emergency repair",
        description: "Emergency repair took longer than promised response time.",
        status: "closed" as const,
        priority: "medium" as const,
        assignedTechnicianId: null,
        resolution: "Acknowledged delay. Improved response procedures implemented.",
        createdAt: new Date("2024-01-19"),
        resolvedAt: new Date("2024-01-20")
      },
      {
        id: "cmp-020",
        quotationId: "quote-019",
        customerId: "user-019",
        customerName: "Hamza Qureshi",
        installationId: "inst-019",
        title: "Documentation incomplete",
        description: "Permit documentation submitted was incomplete and needs revision.",
        status: "investigating" as const,
        priority: "low" as const,
        assignedTechnicianId: null,
        resolution: null,
        createdAt: new Date("2024-02-21"),
        resolvedAt: null
      },
    ];

    await db.insert(complaints).values(dummyComplaints);
    console.log("Inserted complaints");

    // Insert tickets - 20+ Pakistani customer tickets
    const dummyTickets = [
      {
        id: "tk-001",
        customerId: "user-001",
        customerName: "Ahmed Khan",
        subject: "Installation Schedule Query",
        description: "When can I schedule my solar panel installation? I'm available next month.",
        category: "inquiry" as const,
        status: "open" as const,
        priority: "medium" as const,
        assignedToId: null,
        response: null,
        createdAt: new Date("2024-01-23"),
        resolvedAt: null
      },
      {
        id: "tk-002",
        quotationId: "quote-002",
        customerId: "user-002",
        customerName: "Fatima Ali",
        subject: "Warranty Claim",
        description: "Need to file a warranty claim for defective panel. Please provide the process.",
        category: "support" as const,
        status: "in_progress" as const,
        priority: "high" as const,
        assignedToId: null,
        response: null,
        createdAt: new Date("2024-01-22"),
        resolvedAt: null
      },
      {
        id: "tk-003",
        quotationId: "quote-003",
        customerId: "user-003",
        customerName: "Muhammad Hassan",
        subject: "Technical Query - System Capacity",
        description: "Can I add more panels to my existing system? Currently have 5kW installed.",
        category: "technical" as const,
        status: "resolved" as const,
        priority: "low" as const,
        assignedToId: null,
        response: "Yes, you can expand. Inverter capacity check shows room for 3 more panels.",
        createdAt: new Date("2024-01-21"),
        resolvedAt: new Date("2024-01-22")
      },
      {
        id: "tk-004",
        quotationId: "quote-004",
        customerId: "user-004",
        customerName: "Ayesha Shah",
        subject: "Billing Issue",
        description: "I was charged twice for the maintenance service. Please refund the duplicate charge.",
        category: "billing" as const,
        status: "open" as const,
        priority: "high" as const,
        assignedToId: null,
        response: null,
        createdAt: new Date("2024-01-20"),
        resolvedAt: null
      },
      {
        id: "tk-005",
        quotationId: "quote-005",
        customerId: "user-005",
        customerName: "Usman Malik",
        subject: "Maintenance Request",
        description: "Please schedule annual maintenance for my solar system.",
        category: "support" as const,
        status: "in_progress" as const,
        priority: "medium" as const,
        assignedToId: null,
        response: null,
        createdAt: new Date("2024-01-19"),
        resolvedAt: null
      },
      {
        id: "tk-006",
        quotationId: "quote-006",
        customerId: "user-006",
        customerName: "Zainab Ahmed",
        subject: "Quote Request",
        description: "Need a quote for battery storage addition to existing system.",
        category: "inquiry" as const,
        status: "open" as const,
        priority: "medium" as const,
        assignedToId: null,
        response: null,
        createdAt: new Date("2024-01-18"),
        resolvedAt: null
      },
      {
        id: "tk-007",
        quotationId: "quote-007",
        customerId: "user-007",
        customerName: "Ali Raza",
        subject: "System Performance Report",
        description: "Can you provide a performance report for the last 6 months?",
        category: "inquiry" as const,
        status: "resolved" as const,
        priority: "low" as const,
        assignedToId: null,
        response: "Performance report sent via email. System performing at 94% efficiency.",
        createdAt: new Date("2024-01-17"),
        resolvedAt: new Date("2024-01-18")
      },
      {
        id: "tk-008",
        quotationId: "quote-008",
        customerId: "user-008",
        customerName: "Khadija Iqbal",
        subject: "Emergency Support",
        description: "System completely stopped working after power outage.",
        category: "support" as const,
        status: "open" as const,
        priority: "urgent" as const,
        assignedToId: null,
        response: null,
        createdAt: new Date("2024-01-23"),
        resolvedAt: null
      },
      {
        id: "tk-009",
        quotationId: "quote-009",
        customerId: "user-009",
        customerName: "Hassan Butt",
        subject: "Installation Permit Status",
        description: "What is the current status of my installation permit application?",
        category: "inquiry" as const,
        status: "in_progress" as const,
        priority: "medium" as const,
        assignedToId: null,
        response: null,
        createdAt: new Date("2024-01-25"),
        resolvedAt: null
      },
      {
        id: "tk-010",
        quotationId: "quote-010",
        customerId: "user-010",
        customerName: "Maria Siddique",
        subject: "Remote System Monitoring",
        description: "How can I monitor my off-grid solar system remotely?",
        category: "technical" as const,
        status: "resolved" as const,
        priority: "low" as const,
        assignedToId: null,
        response: "Mobile app installed and configured. You can now monitor remotely.",
        createdAt: new Date("2024-02-11"),
        resolvedAt: new Date("2024-02-12")
      },
      {
        id: "tk-011",
        quotationId: "quote-011",
        customerId: "user-011",
        customerName: "Omar Farooq",
        subject: "Insurance Coverage Query",
        description: "Does my solar installation have insurance coverage against natural disasters?",
        category: "inquiry" as const,
        status: "open" as const,
        priority: "medium" as const,
        assignedToId: null,
        response: null,
        createdAt: new Date("2024-02-17"),
        resolvedAt: null
      },
      {
        id: "tk-012",
        quotationId: "quote-012",
        customerId: "user-012",
        customerName: "Sana Nawaz",
        subject: "Cleaning Schedule Change",
        description: "Need to reschedule my monthly cleaning service to a different date.",
        category: "support" as const,
        status: "resolved" as const,
        priority: "low" as const,
        assignedToId: null,
        response: "Cleaning rescheduled to requested date. Technician notified.",
        createdAt: new Date("2024-01-14"),
        resolvedAt: new Date("2024-01-14")
      },
      {
        id: "tk-013",
        quotationId: "quote-013",
        customerId: "user-013",
        customerName: "Bilal Tariq",
        subject: "System Upgrade Options",
        description: "What are the available upgrade options for my current 3kW system?",
        category: "technical" as const,
        status: "in_progress" as const,
        priority: "medium" as const,
        assignedToId: null,
        response: null,
        createdAt: new Date("2024-01-24"),
        resolvedAt: null
      },
      {
        id: "tk-014",
        quotationId: "quote-014",
        customerId: "user-014",
        customerName: "Nida Sultan",
        subject: "Payment Plan Request",
        description: "Can I switch from annual to monthly payment plan for maintenance?",
        category: "billing" as const,
        status: "open" as const,
        priority: "medium" as const,
        assignedToId: null,
        response: null,
        createdAt: new Date("2024-02-10"),
        resolvedAt: null
      },
      {
        id: "tk-015",
        quotationId: "quote-015",
        customerId: "user-015",
        customerName: "Imran Sheikh",
        subject: "Grid Connection Update",
        description: "When will my net metering connection be activated by the utility company?",
        category: "inquiry" as const,
        status: "in_progress" as const,
        priority: "high" as const,
        assignedToId: null,
        response: null,
        createdAt: new Date("2024-01-28"),
        resolvedAt: null
      },
      {
        id: "tk-016",
        quotationId: "quote-016",
        customerId: "user-016",
        customerName: "Rubina Dar",
        subject: "Environmental Impact Report",
        description: "Can you provide a report on carbon savings from my solar installation?",
        category: "inquiry" as const,
        status: "resolved" as const,
        priority: "low" as const,
        assignedToId: null,
        response: "Environmental impact report emailed. Your system saved 2.5 tons CO2 annually.",
        createdAt: new Date("2024-02-14"),
        resolvedAt: new Date("2024-02-15")
      },
      {
        id: "tk-017",
        quotationId: "quote-017",
        customerId: "user-017",
        customerName: "Adnan Chaudhry",
        subject: "Replacement Part Availability",
        description: "Are replacement parts available for my 5-year-old solar panels?",
        category: "support" as const,
        status: "open" as const,
        priority: "medium" as const,
        assignedToId: null,
        response: null,
        createdAt: new Date("2024-01-16"),
        resolvedAt: null
      },
      {
        id: "tk-018",
        quotationId: "quote-018",
        customerId: "user-018",
        customerName: "Farah Baig",
        subject: "Emergency Contact Update",
        description: "Need to update emergency contact information in your system.",
        category: "support" as const,
        status: "resolved" as const,
        priority: "low" as const,
        assignedToId: null,
        response: "Contact information updated in system. Confirmation email sent.",
        createdAt: new Date("2024-01-21"),
        resolvedAt: new Date("2024-01-21")
      },
      {
        id: "tk-019",
        quotationId: "quote-019",
        customerId: "user-019",
        customerName: "Hamza Qureshi",
        subject: "Document Verification",
        description: "Which additional documents are needed for permit approval?",
        category: "inquiry" as const,
        status: "in_progress" as const,
        priority: "high" as const,
        assignedToId: null,
        response: null,
        createdAt: new Date("2024-02-22"),
        resolvedAt: null
      },
      {
        id: "tk-020",
        quotationId: "quote-020",
        customerId: "user-020",
        customerName: "Faiza Jamil",
        subject: "System Efficiency Optimization",
        description: "How can I optimize my system efficiency based on recent energy audit?",
        category: "technical" as const,
        status: "open" as const,
        priority: "medium" as const,
        assignedToId: null,
        response: null,
        createdAt: new Date("2024-01-17"),
        resolvedAt: null
      },
    ];

    await db.insert(tickets).values(dummyTickets);
    console.log("Inserted tickets");

    console.log("Database seeding completed successfully!");

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log("Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });