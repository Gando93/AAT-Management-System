import type { User, Vehicle, Booking, Customer, Tour, Notification } from '../types';
import type { Guide } from '../types/guides';
import type { Addon, AddonCategory } from '../types/addons';
import type { RefundPolicy, DepositPolicy, PaymentTerms, RefundRequest } from '../types/policies';
import type { EmailTemplate, SMSMessage, CommunicationLog, NotificationRule, MarketingCampaign } from '../types/communications';
import type { TourManifest, DailyOperations, VehiclePreparation, CustomerCheckIn, TourDeparture, DailyReport } from '../types/manifests';
import type { QRTicket, CheckInSession, CheckInEvent, QRCodeConfig, CheckInAnalytics, MobileCheckInApp, CustomerSelfService, QRValidationRule, OfflineCheckInData, QRCodeTemplate } from '../types/qrTickets';
import type { Waiver, WaiverSignature, WaiverTemplate, ComplianceReport, WaiverAnalytics, WaiverNotification, WaiverWorkflow, WaiverTranslation, WaiverAuditLog } from '../types/waivers';
import type { Promotion, CustomerSegment, DiscountCode, PromotionUsage, Campaign, PromotionAnalytics, PromotionRule, PromotionTemplate, PromotionBanner, ReferralProgram, Referral, LoyaltyProgram, LoyaltyAccount, LoyaltyTransaction } from '../types/promotions';
import type { Agent, Territory, CommissionStructure, Lead, Commission, AgentReport, AgentTraining, AgentAuditLog } from '../types/agents';
import type { Report, ReportTemplate, Dashboard, Analytics, ExportJob, ReportExecution, ReportData, ReportShare, ReportComment, ReportAuditLog } from '../types/reports';
import type { Integration, WebhookConfig, SyncJob, IntegrationTest, IntegrationMonitor, IntegrationAlert, IntegrationTemplate, IntegrationUsage, IntegrationAuditLog } from '../types/integrations';

// Simple localStorage-based data store
class DataStore<T extends { id: string }> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  getAll(): T[] {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  add(item: T): boolean {
    try {
      const items = this.getAll();
      items.push(item);
      localStorage.setItem(this.key, JSON.stringify(items));
      return true;
    } catch {
      return false;
    }
  }

  update(id: string, updates: Partial<T>): boolean {
    try {
      const items = this.getAll();
      const index = items.findIndex((item: { id: string }) => item.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...updates };
        localStorage.setItem(this.key, JSON.stringify(items));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  delete(id: string): boolean {
    try {
      const items = this.getAll();
      const filtered = items.filter((item: { id: string }) => item.id !== id);
      localStorage.setItem(this.key, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  save(items: T[]): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }
}

// Create data stores
export const dataStore = {
  users: new DataStore<User>('aat_users'),
  vehicles: new DataStore<Vehicle>('aat_vehicles'),
  bookings: new DataStore<Booking>('aat_bookings'),
  customers: new DataStore<Customer>('aat_customers'),
  tours: new DataStore<Tour>('aat_tours'),
  notifications: new DataStore<Notification>('aat_notifications'),
  guides: new DataStore<Guide>('aat_guides'),
  addons: new DataStore<Addon>('aat_addons'),
  addonCategories: new DataStore<AddonCategory>('aat_addon_categories'),
  refundPolicies: new DataStore<RefundPolicy>('aat_refund_policies'),
  depositPolicies: new DataStore<DepositPolicy>('aat_deposit_policies'),
  paymentTerms: new DataStore<PaymentTerms>('aat_payment_terms'),
  refundRequests: new DataStore<RefundRequest>('aat_refund_requests'),
  emailTemplates: new DataStore<EmailTemplate>('aat_email_templates'),
  smsMessages: new DataStore<SMSMessage>('aat_sms_messages'),
  communicationLogs: new DataStore<CommunicationLog>('aat_communication_logs'),
  notificationRules: new DataStore<NotificationRule>('aat_notification_rules'),
  marketingCampaigns: new DataStore<MarketingCampaign>('aat_marketing_campaigns'),
  manifests: new DataStore<TourManifest>('aat_manifests'),
  dailyOperations: new DataStore<DailyOperations>('aat_daily_operations'),
  vehiclePreparations: new DataStore<VehiclePreparation>('aat_vehicle_preparations'),
  customerCheckIns: new DataStore<CustomerCheckIn>('aat_customer_checkins'),
  tourDepartures: new DataStore<TourDeparture>('aat_tour_departures'),
  dailyReports: new DataStore<DailyReport>('aat_daily_reports'),
  qrTickets: new DataStore<QRTicket>('aat_qr_tickets'),
  checkInSessions: new DataStore<CheckInSession>('aat_checkin_sessions'),
  checkInEvents: new DataStore<CheckInEvent>('aat_checkin_events'),
  qrCodeConfigs: new DataStore<QRCodeConfig>('aat_qr_configs'),
  checkInAnalytics: new DataStore<CheckInAnalytics>('aat_checkin_analytics'),
  mobileApps: new DataStore<MobileCheckInApp>('aat_mobile_apps'),
  selfServicePortals: new DataStore<CustomerSelfService>('aat_self_service'),
  validationRules: new DataStore<QRValidationRule>('aat_validation_rules'),
  offlineData: new DataStore<OfflineCheckInData>('aat_offline_data'),
  qrTemplates: new DataStore<QRCodeTemplate>('aat_qr_templates'),
  waivers: new DataStore<Waiver>('aat_waivers'),
  waiverSignatures: new DataStore<WaiverSignature>('aat_waiver_signatures'),
  waiverTemplates: new DataStore<WaiverTemplate>('aat_waiver_templates'),
  complianceReports: new DataStore<ComplianceReport>('aat_compliance_reports'),
  waiverAnalytics: new DataStore<WaiverAnalytics>('aat_waiver_analytics'),
  waiverNotifications: new DataStore<WaiverNotification>('aat_waiver_notifications'),
  waiverWorkflows: new DataStore<WaiverWorkflow>('aat_waiver_workflows'),
  waiverTranslations: new DataStore<WaiverTranslation>('aat_waiver_translations'),
  waiverAuditLogs: new DataStore<WaiverAuditLog>('aat_waiver_audit_logs'),
  promotions: new DataStore<Promotion>('aat_promotions'),
  customerSegments: new DataStore<CustomerSegment>('aat_customer_segments'),
  discountCodes: new DataStore<DiscountCode>('aat_discount_codes'),
  promotionUsages: new DataStore<PromotionUsage>('aat_promotion_usages'),
  campaigns: new DataStore<Campaign>('aat_campaigns'),
  promotionAnalytics: new DataStore<PromotionAnalytics>('aat_promotion_analytics'),
  promotionRules: new DataStore<PromotionRule>('aat_promotion_rules'),
  promotionTemplates: new DataStore<PromotionTemplate>('aat_promotion_templates'),
  promotionBanners: new DataStore<PromotionBanner>('aat_promotion_banners'),
  referralPrograms: new DataStore<ReferralProgram>('aat_referral_programs'),
  referrals: new DataStore<Referral>('aat_referrals'),
  loyaltyPrograms: new DataStore<LoyaltyProgram>('aat_loyalty_programs'),
  loyaltyAccounts: new DataStore<LoyaltyAccount>('aat_loyalty_accounts'),
  loyaltyTransactions: new DataStore<LoyaltyTransaction>('aat_loyalty_transactions'),
  agents: new DataStore<Agent>('aat_agents'),
  territories: new DataStore<Territory>('aat_territories'),
  commissionStructures: new DataStore<CommissionStructure>('aat_commission_structures'),
  leads: new DataStore<Lead>('aat_leads'),
  commissions: new DataStore<Commission>('aat_commissions'),
  agentReports: new DataStore<AgentReport>('aat_agent_reports'),
  agentTrainings: new DataStore<AgentTraining>('aat_agent_trainings'),
  agentAuditLogs: new DataStore<AgentAuditLog>('aat_agent_audit_logs'),
  reports: new DataStore<Report>('aat_reports'),
  reportTemplates: new DataStore<ReportTemplate>('aat_report_templates'),
  dashboards: new DataStore<Dashboard>('aat_dashboards'),
  analytics: new DataStore<Analytics>('aat_analytics'),
  exportJobs: new DataStore<ExportJob>('aat_export_jobs'),
  reportExecutions: new DataStore<ReportExecution>('aat_report_executions'),
  reportData: new DataStore<ReportData>('aat_report_data'),
  reportShares: new DataStore<ReportShare>('aat_report_shares'),
  reportComments: new DataStore<ReportComment>('aat_report_comments'),
  reportAuditLogs: new DataStore<ReportAuditLog>('aat_report_audit_logs'),
  integrations: new DataStore<Integration>('aat_integrations'),
  webhookConfigs: new DataStore<WebhookConfig>('aat_webhook_configs'),
  syncJobs: new DataStore<SyncJob>('aat_sync_jobs'),
  integrationTests: new DataStore<IntegrationTest>('aat_integration_tests'),
  integrationMonitors: new DataStore<IntegrationMonitor>('aat_integration_monitors'),
  integrationAlerts: new DataStore<IntegrationAlert>('aat_integration_alerts'),
  integrationTemplates: new DataStore<IntegrationTemplate>('aat_integration_templates'),
  integrationUsage: new DataStore<IntegrationUsage>('aat_integration_usage'),
  integrationAuditLogs: new DataStore<IntegrationAuditLog>('aat_integration_audit_logs')
};

// Initialize with default data ONLY if storage is completely empty
export const initializeData = () => {
  // Check if users exist - this is critical for authentication
  const users = dataStore.users.getAll();
  const hasUsers = users.length > 0;
  
  // Always ensure we have at least one admin user
  if (!hasUsers) {
    console.log('No users found, initializing default data...');
    
    // Check if this is a completely fresh installation
    const hasAnyData = 
      dataStore.vehicles.getAll().length > 0 ||
      dataStore.customers.getAll().length > 0 ||
      dataStore.tours.getAll().length > 0;

    if (hasAnyData && !hasUsers) {
      console.log('Partial data exists but no users, adding default admin user...');
    } else {
      console.log('Fresh installation, initializing all default data...');
    }

  // Default users
  const defaultUsers: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@aat.com',
      password: btoa('admin123' + 'salt'), // Simple password hash for demo
      role: 'Administrator',
      status: 'active',
      permissions: [
        'users.create', 'users.read', 'users.update', 'users.delete',
        'bookings.create', 'bookings.read', 'bookings.update', 'bookings.delete',
        'tours.create', 'tours.read', 'tours.update', 'tours.delete',
        'customers.create', 'customers.read', 'customers.update', 'customers.delete',
        'vehicles.create', 'vehicles.read', 'vehicles.update', 'vehicles.delete',
        'reports.read', 'settings.read', 'settings.update'
      ],
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      needsPasswordSetup: false
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john@aat.com',
      role: 'Agent',
      status: 'active',
      permissions: [
        'bookings.create', 'bookings.read', 'bookings.update',
        'tours.read',
        'customers.create', 'customers.read', 'customers.update',
        'vehicles.read',
        'reports.read'
      ],
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      needsPasswordSetup: true
    },
    {
      id: '3',
      name: 'Aisha Ceesay',
      email: 'aisha.guide@aat.com',
      role: 'Guide',
      status: 'active',
      permissions: [
        'bookings.read',
        'tours.read',
        'customers.read',
        'vehicles.read'
      ],
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      needsPasswordSetup: false
    },
    {
      id: '4',
      name: 'Modou Njie',
      email: 'modou.guide@aat.com',
      role: 'Guide',
      status: 'active',
      permissions: [
        'bookings.read',
        'tours.read',
        'customers.read',
        'vehicles.read'
      ],
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      needsPasswordSetup: false
    },
    {
      id: '5',
      name: 'Fatou Jallow',
      email: 'fatou.guide@aat.com',
      role: 'Guide',
      status: 'active',
      permissions: [
        'bookings.read',
        'tours.read',
        'customers.read',
        'vehicles.read'
      ],
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      needsPasswordSetup: false
    }
  ];

  // Default vehicles
  const defaultVehicles: Vehicle[] = [
    {
      id: '1',
      name: 'Toyota Hiace',
      type: 'Minibus',
      capacity: 14,
      status: 'available',
      licensePlate: 'GAM-001',
      fuelLevel: 85,
      driver: 'John Doe',
      location: 'Banjul'
    },
    {
      id: '2',
      name: 'Mercedes Sprinter',
      type: 'Bus',
      capacity: 20,
      status: 'available',
      licensePlate: 'GAM-002',
      fuelLevel: 90,
      driver: 'Jane Smith',
      location: 'Kololi'
    }
  ];

  // Default customers
  const defaultCustomers: Customer[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@email.com',
      phone: '+220 123 4567',
      status: 'active',
      address: '123 Main St, Banjul',
      dateOfBirth: '1985-06-15',
      nationality: 'Gambian',
      specialRequests: 'Vegetarian meals',
      totalBookings: 3,
      totalSpent: 150.00
    },
    {
      id: '2',
      name: 'Michael Brown',
      email: 'michael@email.com',
      phone: '+220 987 6543',
      status: 'active',
      address: '456 Beach Rd, Kololi',
      dateOfBirth: '1990-03-22',
      nationality: 'British',
      specialRequests: 'Wheelchair accessible',
      totalBookings: 1,
      totalSpent: 75.00
    },
    {
      id: '3',
      name: 'Aisha Ceesay',
      email: 'aisha@email.com',
      phone: '+220 555 1234',
      status: 'active',
      address: '789 Market St, Serrekunda',
      dateOfBirth: '1988-11-08',
      nationality: 'Gambian',
      specialRequests: 'Halal meals only',
      totalBookings: 5,
      totalSpent: 300.00
    }
  ];

  // Default Gambia tours
  const defaultTours: Tour[] = [
    {
      id: '1',
      name: 'Orientation Tour',
      duration: '6 hours',
      price: 40.00,
      category: 'City Tour',
      status: 'active',
      rating: 4.6,
      bookings: 15,
      description: 'Banjul: Albert Market & National Museum, Serrekunda: Batik workshop, Kololi: Monkey forest. Bring comfortable shoes, water, sunscreen, camera.',
      maxCapacity: 20,
      pickupTime: '08:30',
      dropoffTime: '14:30'
    },
    {
      id: '2',
      name: '2-Day Gambia Adventure',
      duration: '2 days',
      price: 165.00,
      category: 'Adventure',
      status: 'active',
      rating: 4.8,
      bookings: 8,
      description: 'Ferry crossing to the north, Wassu Stone Circles, Boat trip to Baboon Island Hippos & Chimpanzees, Georgetown & overnight at Sillahkunda Lodge. Bring overnight bag, insect repellent, flashlight, comfortable clothes and shoes.',
      maxCapacity: 12,
      pickupTime: '05:30',
      dropoffTime: '16:00'
    },
    {
      id: '3',
      name: '4-Wheel Drive Adventure',
      duration: '9 hours',
      price: 75.00,
      category: 'Adventure',
      status: 'active',
      rating: 4.7,
      bookings: 12,
      description: 'Remote bush villages, local school visit, Halahin River boat trip, secluded beach lunch, Tanji fishing village. Bring hat & sunscreen, water bottle, camera, cash, swimwear.',
      maxCapacity: 8,
      pickupTime: '08:00',
      dropoffTime: '17:00'
    },
    {
      id: '4',
      name: 'Senegal - Fathala Wild Reserve',
      duration: '10.5 hours',
      price: 115.00,
      category: 'Wildlife',
      status: 'active',
      rating: 4.9,
      bookings: 6,
      description: 'Ferry to Barra, cross into Senegal, Safari in Fathala Reserve (4x4 jeep). Bring passport (mandatory), Yellow Fever vaccination book, hat & sunglasses, binoculars, snacks.',
      maxCapacity: 10,
      pickupTime: '05:30',
      dropoffTime: '16:00'
    },
    {
      id: '5',
      name: 'Sita Joyeh (Baobab Island)',
      duration: '8.5 hours',
      price: 55.00,
      category: 'Nature',
      status: 'active',
      rating: 4.5,
      bookings: 18,
      description: 'Jungle walk, boat to Baobab Island, visit local marabout (witch doctor), lunch on the island. Bring walking shoes, curiosity, camera, insect repellent.',
      maxCapacity: 15,
      pickupTime: '08:00',
      dropoffTime: '16:30'
    },
    {
      id: '6',
      name: 'Explore Senegal',
      duration: '12 hours',
      price: 90.00,
      category: 'Cultural',
      status: 'active',
      rating: 4.4,
      bookings: 10,
      description: 'Cross border to Casamance, boat ride past Bird Island, Kailo Island voodoo culture, lunch in Abene. Bring passport, Yellow Fever Vaccination Book, sturdy shoes, sunscreen, sense of adventure!',
      maxCapacity: 12,
      pickupTime: '07:00',
      dropoffTime: '19:00'
    },
    {
      id: '7',
      name: 'River Memories',
      duration: '8 hours',
      price: 65.00,
      category: 'Nature',
      status: 'active',
      rating: 4.6,
      bookings: 14,
      description: 'Pirogue cruise through mangroves, stops for swimming and fishing, full onboard lunch. Bring swimwear & towel, sunscreen, hat, relaxation mode.',
      maxCapacity: 12,
      pickupTime: '09:00',
      dropoffTime: '17:00'
    },
    {
      id: '8',
      name: 'Roots Over Land',
      duration: '10 hours',
      price: 75.00,
      category: 'Historical',
      status: 'active',
      rating: 4.7,
      bookings: 16,
      description: 'Ferry to Barra, Albreda & Juffureh villages, visit St. James Island, "Roots" history tour. Bring camera, sunscreen, walking shoes, curiosity about history.',
      maxCapacity: 18,
      pickupTime: '07:30',
      dropoffTime: '17:30'
    },
    {
      id: '9',
      name: 'Bird Watching (Kayak/Canoe)',
      duration: '5.5 hours',
      price: 50.00,
      category: 'Wildlife',
      status: 'active',
      rating: 4.8,
      bookings: 9,
      description: 'Early morning creek tour, guided bird spotting, picnic breakfast. Bring binoculars, hat & sunglasses, light clothing, water.',
      maxCapacity: 8,
      pickupTime: '06:00',
      dropoffTime: '11:30'
    },
    {
      id: '10',
      name: 'Abuko Nature Reserve',
      duration: '6.5 hours',
      price: 45.00,
      category: 'Nature',
      status: 'active',
      rating: 4.3,
      bookings: 22,
      description: 'Nature walk through the reserve, wildlife rescue center, lunch at Lamin Lodge. Bring sturdy shoes, insect repellent, water bottle, camera.',
      maxCapacity: 15,
      pickupTime: '08:00',
      dropoffTime: '14:30'
    }
  ];

  // Default guides
  const defaultGuides: Guide[] = [
    {
      id: '1',
      name: 'Amadou Jallow',
      email: 'amadou.jallow@aat.com',
      phone: '+220 123 4567',
      languages: ['English', 'Mandinka', 'Wolof'],
      skills: ['First Aid', 'Wildlife', 'History', 'Group Management'],
      certifications: [
        {
          id: '1',
          name: 'Wilderness First Aid',
          issuingBody: 'Red Cross',
          issueDate: '2023-01-15',
          expiryDate: '2025-01-15',
          status: 'valid'
        },
        {
          id: '2',
          name: 'Tour Guide License',
          issuingBody: 'Gambia Tourism Board',
          issueDate: '2022-06-01',
          expiryDate: '2024-06-01',
          status: 'valid'
        }
      ],
      maxDailyHours: 8,
      status: 'active',
      emergencyContact: {
        name: 'Fatou Jallow',
        phone: '+220 987 6543',
        relationship: 'Wife'
      },
      address: '123 Independence Drive, Banjul',
      dateOfBirth: '1985-03-15',
      hireDate: '2022-01-10',
      notes: 'Experienced guide with excellent knowledge of local history and wildlife.',
      createdAt: '2022-01-10T00:00:00.000Z',
      updatedAt: '2022-01-10T00:00:00.000Z'
    },
    {
      id: '2',
      name: 'Mariama Sarr',
      email: 'mariama.sarr@aat.com',
      phone: '+220 234 5678',
      languages: ['English', 'French', 'Fula'],
      skills: ['CPR', 'Photography', 'Cultural Interpretation', 'Safety Protocols'],
      certifications: [
        {
          id: '3',
          name: 'CPR Certification',
          issuingBody: 'American Heart Association',
          issueDate: '2023-03-01',
          expiryDate: '2025-03-01',
          status: 'valid'
        }
      ],
      maxDailyHours: 10,
      status: 'active',
      emergencyContact: {
        name: 'Bakary Sarr',
        phone: '+220 876 5432',
        relationship: 'Brother'
      },
      address: '456 Kairaba Avenue, Serrekunda',
      dateOfBirth: '1990-07-22',
      hireDate: '2022-03-15',
      notes: 'Multilingual guide specializing in cultural tours and photography.',
      createdAt: '2022-03-15T00:00:00.000Z',
      updatedAt: '2022-03-15T00:00:00.000Z'
    },
    {
      id: '3',
      name: 'Lamin Ceesay',
      email: 'lamin.ceesay@aat.com',
      phone: '+220 345 6789',
      languages: ['English', 'Mandinka', 'Jola'],
      skills: ['Wilderness Survival', 'Rock Climbing', 'Kayaking', 'Wildlife'],
      certifications: [
        {
          id: '4',
          name: 'Wilderness Survival',
          issuingBody: 'Outdoor Leadership Institute',
          issueDate: '2022-09-10',
          expiryDate: '2024-09-10',
          status: 'valid'
        }
      ],
      maxDailyHours: 8,
      status: 'on-leave',
      emergencyContact: {
        name: 'Aminata Ceesay',
        phone: '+220 765 4321',
        relationship: 'Sister'
      },
      address: '789 Atlantic Road, Kololi',
      dateOfBirth: '1988-11-08',
      hireDate: '2022-05-20',
      notes: 'Adventure specialist currently on leave for family reasons.',
      createdAt: '2022-05-20T00:00:00.000Z',
      updatedAt: '2022-05-20T00:00:00.000Z'
    }
  ];

  // Default addon categories
  const defaultAddonCategories: AddonCategory[] = [
    {
      id: '1',
      name: 'Equipment',
      description: 'Rental equipment and gear',
      icon: '🛠️',
      sortOrder: 1,
      isActive: true
    },
    {
      id: '2',
      name: 'Services',
      description: 'Additional services and experiences',
      icon: '🎯',
      sortOrder: 2,
      isActive: true
    },
    {
      id: '3',
      name: 'Food & Beverage',
      description: 'Meals, drinks, and refreshments',
      icon: '🍽️',
      sortOrder: 3,
      isActive: true
    },
    {
      id: '4',
      name: 'Transport',
      description: 'Additional transportation options',
      icon: '🚗',
      sortOrder: 4,
      isActive: true
    },
    {
      id: '5',
      name: 'Accommodation',
      description: 'Overnight stays and lodging',
      icon: '🏨',
      sortOrder: 5,
      isActive: true
    }
  ];

  // Default add-ons
  const defaultAddons: Addon[] = [
    {
      id: '1',
      name: 'Professional Photography',
      description: 'Professional photographer to capture your tour memories',
      category: 'service',
      basePrice: 25.00,
      currency: 'EUR',
      pricingType: 'per_booking',
      isActive: true,
      requiresQuantity: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Traditional Lunch',
      description: 'Authentic Gambian lunch with local specialties',
      category: 'food',
      basePrice: 15.00,
      currency: 'EUR',
      pricingType: 'per_person',
      isActive: true,
      requiresQuantity: true,
      minQuantity: 1,
      maxQuantity: 20,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Binoculars Rental',
      description: 'High-quality binoculars for wildlife viewing',
      category: 'equipment',
      basePrice: 5.00,
      currency: 'EUR',
      pricingType: 'per_person',
      isActive: true,
      requiresQuantity: true,
      minQuantity: 1,
      maxQuantity: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Airport Transfer',
      description: 'Private transfer to/from Banjul International Airport',
      category: 'transport',
      basePrice: 30.00,
      currency: 'EUR',
      pricingType: 'per_booking',
      isActive: true,
      requiresQuantity: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Overnight Stay',
      description: 'Additional night accommodation at partner hotels',
      category: 'accommodation',
      basePrice: 45.00,
      currency: 'EUR',
      pricingType: 'per_person',
      isActive: true,
      requiresQuantity: true,
      minQuantity: 1,
      maxQuantity: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Cultural Workshop',
      description: 'Hands-on workshop in traditional crafts or cooking',
      category: 'service',
      basePrice: 20.00,
      currency: 'EUR',
      pricingType: 'per_person',
      isActive: true,
      requiresQuantity: true,
      minQuantity: 2,
      maxQuantity: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default refund policies
  const defaultRefundPolicies: RefundPolicy[] = [
    {
      id: '1',
      name: 'Standard Cancellation Policy',
      description: 'Full refund if cancelled 24+ hours before tour, 50% refund if cancelled 2-24 hours before, no refund if cancelled less than 2 hours before',
      policyType: 'cancellation',
      refundPercentage: 100,
      timeRestrictions: {
        hoursBeforeTour: 24,
        cutoffTime: '18:00'
      },
      conditions: ['Weather-related cancellations are fully refundable', 'No-show bookings are non-refundable'],
      isActive: true,
      applicableTours: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Weather Cancellation Policy',
      description: 'Full refund for weather-related cancellations at any time',
      policyType: 'weather',
      refundPercentage: 100,
      timeRestrictions: {
        hoursBeforeTour: 0
      },
      conditions: ['Only applies to weather conditions that make the tour unsafe', 'Decision made by tour operator'],
      isActive: true,
      applicableTours: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default deposit policies
  const defaultDepositPolicies: DepositPolicy[] = [
    {
      id: '1',
      name: 'Standard Deposit Policy',
      description: '20% deposit required at time of booking, refundable up to 48 hours before tour',
      depositType: 'percentage',
      depositValue: 20,
      isRequired: true,
      dueDate: {
        type: 'immediate',
        value: 0
      },
      refundable: true,
      applicableTours: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'High-Value Tour Deposit',
      description: '50% deposit required for tours over €100, non-refundable',
      depositType: 'percentage',
      depositValue: 50,
      isRequired: true,
      dueDate: {
        type: 'immediate',
        value: 0
      },
      refundable: false,
      applicableTours: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default payment terms
  const defaultPaymentTerms: PaymentTerms[] = [
    {
      id: '1',
      name: 'Standard Payment Terms',
      description: 'Accept cash, card, and bank transfers. 2.5% processing fee for card payments',
      paymentMethods: ['cash', 'card', 'bank_transfer'],
      currency: 'EUR',
      processingFees: {
        card: 2.5,
        bankTransfer: 0,
        mobileMoney: 1.5,
        crypto: 3.0
      },
      installmentOptions: {
        enabled: false,
        maxInstallments: 3,
        minimumAmount: 100,
        interestRate: 0
      },
      latePaymentFees: {
        enabled: false,
        gracePeriodDays: 7,
        feeAmount: 10,
        feeType: 'fixed'
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default email templates
  const defaultEmailTemplates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Booking Confirmation',
      subject: 'Your Tour Booking Confirmation - {{tour_name}}',
      content: `
        <h2>Booking Confirmation</h2>
        <p>Dear {{customer_name}},</p>
        <p>Thank you for booking with us! Your tour has been confirmed.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Tour:</strong> {{tour_name}}</li>
          <li><strong>Date:</strong> {{booking_date}}</li>
          <li><strong>Time:</strong> {{tour_time}}</li>
          <li><strong>Participants:</strong> {{participants}}</li>
          <li><strong>Total Amount:</strong> {{total_amount}}</li>
        </ul>
        <p>We look forward to seeing you on your tour!</p>
        <p>Best regards,<br>AAT Management Team</p>
      `,
      type: 'booking_confirmation',
      variables: ['customer_name', 'tour_name', 'booking_date', 'tour_time', 'participants', 'total_amount'],
      isActive: true,
      isDefault: true,
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Payment Receipt',
      subject: 'Payment Receipt - {{tour_name}}',
      content: `
        <h2>Payment Receipt</h2>
        <p>Dear {{customer_name}},</p>
        <p>This is your payment receipt for the following booking:</p>
        <h3>Payment Details:</h3>
        <ul>
          <li><strong>Tour:</strong> {{tour_name}}</li>
          <li><strong>Amount Paid:</strong> {{total_amount}}</li>
          <li><strong>Payment Method:</strong> {{payment_method}}</li>
          <li><strong>Transaction ID:</strong> {{transaction_id}}</li>
          <li><strong>Date:</strong> {{payment_date}}</li>
        </ul>
        <p>Thank you for your payment!</p>
        <p>Best regards,<br>AAT Management Team</p>
      `,
      type: 'payment_receipt',
      variables: ['customer_name', 'tour_name', 'total_amount', 'payment_method', 'transaction_id', 'payment_date'],
      isActive: true,
      isDefault: true,
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default notification rules
  const defaultNotificationRules: NotificationRule[] = [
    {
      id: '1',
      name: 'Booking Confirmation Email',
      description: 'Send confirmation email when a new booking is created',
      trigger: 'booking_created',
      conditions: {},
      actions: {
        email: {
          templateId: '1',
          recipients: ['customer']
        }
      },
      isActive: true,
      priority: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Payment Receipt Email',
      description: 'Send receipt email when payment is received',
      trigger: 'payment_received',
      conditions: {},
      actions: {
        email: {
          templateId: '2',
          recipients: ['customer']
        }
      },
      isActive: true,
      priority: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default manifests data
  const defaultManifests: TourManifest[] = [
    {
      id: '1',
      tourId: '1',
      tourName: 'City Walking Tour',
      tourDate: new Date().toISOString().split('T')[0],
      departureTime: '10:00',
      returnTime: '12:00',
      status: 'confirmed',
      guideId: '1',
      guideName: 'John Smith',
      vehicleId: '1',
      vehicleName: 'Bus #1',
      driverId: '1',
      driverName: 'Mike Johnson',
      passengers: [],
      totalPassengers: 0,
      maxCapacity: 25,
      specialInstructions: 'Check weather conditions before departure',
      weatherConditions: 'Sunny, 22°C',
      equipment: [
        {
          id: '1',
          name: 'First Aid Kit',
          category: 'safety',
          required: true,
          checked: true,
          checkedBy: '1',
          checkedAt: new Date().toISOString(),
          condition: 'excellent',
          notes: 'Fully stocked'
        },
        {
          id: '2',
          name: 'Microphone',
          category: 'communication',
          required: true,
          checked: true,
          checkedBy: '1',
          checkedAt: new Date().toISOString(),
          condition: 'good',
          notes: 'Battery charged'
        }
      ],
      checklist: [
        {
          id: '1',
          title: 'Check vehicle condition',
          description: 'Inspect exterior and interior',
          category: 'pre_departure',
          required: true,
          completed: true,
          completedBy: '1',
          completedAt: new Date().toISOString(),
          notes: 'All good',
          order: 1
        },
        {
          id: '2',
          title: 'Verify passenger list',
          description: 'Check all passengers are present',
          category: 'pre_departure',
          required: true,
          completed: false,
          order: 2
        }
      ],
      notes: 'Regular city tour with standard route',
      createdBy: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default daily operations
  const defaultDailyOperations: DailyOperations[] = [
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      tours: ['1'],
      totalTours: 1,
      completedTours: 0,
      totalPassengers: 0,
      checkedInPassengers: 0,
      weather: {
        condition: 'sunny',
        temperature: 22,
        windSpeed: 10,
        visibility: 10,
        notes: 'Perfect weather for tours'
      },
      incidents: [],
      notes: 'Normal operations day',
      createdBy: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default QR tickets data
  const defaultQRTickets: QRTicket[] = [
    {
      id: '1',
      bookingId: 'BK001',
      customerId: 'CU001',
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      tourId: '1',
      tourName: 'City Walking Tour',
      tourDate: new Date().toISOString().split('T')[0],
      departureTime: '10:00',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      qrCodeUrl: 'https://example.com/qr/ticket-001.png',
      ticketNumber: 'TK-001234',
      status: 'active',
      seatNumber: 'A1',
      specialInstructions: 'Vegetarian meal required',
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      checkInLocation: 'Main Entrance',
      checkInMethod: 'qr_scan',
      validationAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default QR code configurations
  const defaultQRConfigs: QRCodeConfig[] = [
    {
      id: '1',
      name: 'Standard QR Code',
      size: 200,
      errorCorrectionLevel: 'M',
      margin: 4,
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      logoUrl: '',
      logoSize: 50,
      includeBookingDetails: true,
      includeCustomerInfo: true,
      includeTourInfo: true,
      customText: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default QR templates
  const defaultQRTemplates: QRCodeTemplate[] = [
    {
      id: '1',
      name: 'Standard Ticket Template',
      description: 'Default template for tour tickets',
      templateType: 'standard',
      design: {
        layout: 'vertical',
        qrCodePosition: 'center',
        includeLogo: true,
        includeBorder: true,
        includeWatermark: false,
        colorScheme: 'blue',
        fontFamily: 'Arial',
        fontSize: 12
      },
      content: {
        title: 'Tour Ticket',
        subtitle: 'AAT Management System',
        tourName: true,
        tourDate: true,
        tourTime: true,
        customerName: true,
        seatNumber: true,
        ticketNumber: true,
        qrCode: true,
        specialInstructions: true,
        termsAndConditions: true
      },
      isActive: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default waivers data
  const defaultWaivers: Waiver[] = [
    {
      id: '1',
      name: 'Liability Waiver',
      title: 'Release of Liability and Assumption of Risk',
      description: 'Standard liability waiver for tour participants',
      content: `
        <h2>RELEASE OF LIABILITY AND ASSUMPTION OF RISK</h2>
        <p>I, the undersigned, acknowledge that I have voluntarily applied to participate in the tour operated by AAT Management System.</p>
        <p>I understand and agree that:</p>
        <ul>
          <li>Participation in this tour involves inherent risks and dangers</li>
          <li>I am physically capable of participating in this activity</li>
          <li>I will follow all safety instructions and guidelines</li>
          <li>I assume all risks associated with this activity</li>
        </ul>
        <p>I hereby release AAT Management System, its employees, agents, and representatives from any and all liability for personal injury, property damage, or death that may occur during my participation in this tour.</p>
        <p>This waiver is binding on my heirs, assigns, and legal representatives.</p>
      `,
      version: '1.0',
      type: 'liability',
      category: 'required',
      isActive: true,
      isDefault: true,
      language: 'en',
      applicableTours: [],
      applicableAgeGroups: ['adult'],
      requiredFields: [
        {
          id: '1',
          name: 'fullName',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your full name',
          order: 1
        },
        {
          id: '2',
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          placeholder: 'Enter your email',
          order: 2
        },
        {
          id: '3',
          name: 'phone',
          label: 'Phone Number',
          type: 'phone',
          required: true,
          placeholder: 'Enter your phone number',
          order: 3
        },
        {
          id: '4',
          name: 'emergencyContact',
          label: 'Emergency Contact',
          type: 'text',
          required: true,
          placeholder: 'Emergency contact name and phone',
          order: 4
        }
      ],
      legalRequirements: [
        {
          id: '1',
          jurisdiction: 'US-CA',
          requirement: 'Liability Release',
          description: 'Standard liability release for California',
          isCompliant: true,
          complianceDate: new Date().toISOString(),
          lastReviewed: new Date().toISOString(),
          reviewedBy: '1'
        }
      ],
      validityPeriod: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        duration: 365
      },
      signatureRequired: true,
      witnessRequired: false,
      parentGuardianRequired: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '1'
    }
  ];

  // Default waiver templates
  const defaultWaiverTemplates: WaiverTemplate[] = [
    {
      id: '1',
      name: 'Standard Liability Template',
      description: 'Default template for liability waivers',
      templateType: 'standard',
      category: 'liability',
      language: 'en',
      content: `
        <div class="waiver-template">
          <h1>{{title}}</h1>
          <p><strong>Tour:</strong> {{tour_name}}</p>
          <p><strong>Date:</strong> {{tour_date}}</p>
          <p><strong>Participant:</strong> {{customer_name}}</p>
          <hr>
          {{content}}
          <hr>
          <p><strong>Signature:</strong> _________________________</p>
          <p><strong>Date:</strong> _________________________</p>
        </div>
      `,
      variables: ['title', 'tour_name', 'tour_date', 'customer_name', 'content'],
      styling: {
        fontFamily: 'Arial',
        fontSize: 12,
        colorScheme: 'blue',
        logoUrl: '',
        headerColor: '#2563eb',
        footerColor: '#64748b'
      },
      sections: [
        {
          id: '1',
          title: 'Participant Information',
          content: 'Please provide your contact information',
          order: 1,
          isRequired: true,
          fields: []
        },
        {
          id: '2',
          title: 'Liability Release',
          content: 'I understand and agree to the terms and conditions',
          order: 2,
          isRequired: true,
          fields: []
        }
      ],
      isActive: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '1'
    }
  ];

  // Default promotions data
  const defaultPromotions: Promotion[] = [
    {
      id: '1',
      name: 'Summer Sale 2024',
      description: 'Get 20% off all summer tours',
      code: 'SUMMER2024',
      type: 'percentage',
      value: 20,
      currency: 'USD',
      minOrderValue: 100,
      maxDiscountAmount: 200,
      usageLimit: 1000,
      usageCount: 0,
      perCustomerLimit: 1,
      applicableTours: [],
      applicableAddons: [],
      customerSegments: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      isPublic: true,
      priority: 1,
      conditions: [],
      exclusions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '1'
    }
  ];

  // Default customer segments
  const defaultCustomerSegments: CustomerSegment[] = [
    {
      id: '1',
      name: 'High Value Customers',
      description: 'Customers who have spent over $1000',
      criteria: {
        minSpent: 1000,
        minBookings: 3
      },
      customerCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '1'
    },
    {
      id: '2',
      name: 'New Customers',
      description: 'Customers who joined in the last 30 days',
      criteria: {
        registrationDate: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        }
      },
      customerCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '1'
    }
  ];

  // Default agents data
  const defaultAgents: Agent[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1 (555) 123-4567',
      company: 'Johnson Travel Agency',
      type: 'company',
      status: 'active',
      territory: {
        id: '1',
        name: 'North America',
        type: 'geographic',
        description: 'United States and Canada',
        boundaries: [
          { type: 'country', value: 'US' },
          { type: 'country', value: 'CA' }
        ],
        products: [],
        customers: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      commissionStructure: {
        id: '1',
        name: 'Standard Commission',
        type: 'percentage',
        baseRate: 15,
        tiers: [],
        bonuses: [],
        deductions: [],
        isActive: true,
        validFrom: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      contactInfo: {
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'United States'
        },
        phone: '+1 (555) 123-4567',
        email: 'sarah.johnson@example.com',
        website: 'https://johnsontravel.com'
      },
      taxInfo: {
        taxId: '12-3456789',
        taxType: 'business',
        country: 'US',
        state: 'NY',
        isVerified: true,
        verifiedAt: new Date().toISOString()
      },
      performance: {
        id: '1',
        agentId: '1',
        period: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        },
        metrics: {
          totalBookings: 25,
          totalRevenue: 125000,
          totalCommission: 18750,
          conversionRate: 75,
          averageBookingValue: 5000,
          customerSatisfaction: 4.8,
          retentionRate: 85
        },
        rankings: {
          bookings: 1,
          revenue: 1,
          conversion: 2,
          overall: 1
        },
        goals: {
          bookings: 30,
          revenue: 150000,
          conversion: 80,
          satisfaction: 4.5
        },
        achievements: ['Top Performer Q1', 'Customer Satisfaction Award'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      settings: {
        notifications: {
          email: true,
          sms: false,
          push: true,
          weeklyReport: true,
          monthlyReport: true,
          commissionAlert: true
        },
        dashboard: {
          defaultView: 'overview',
          theme: 'light',
          language: 'en'
        },
        privacy: {
          showContactInfo: true,
          showPerformance: false,
          showTerritory: true
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '1'
    }
  ];

  // Default territories
  const defaultTerritories: Territory[] = [
    {
      id: '1',
      name: 'North America',
      type: 'geographic',
      description: 'United States and Canada',
      boundaries: [
        { type: 'country', value: 'US' },
        { type: 'country', value: 'CA' }
      ],
      products: [],
      customers: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Europe',
      type: 'geographic',
      description: 'European Union countries',
      boundaries: [
        { type: 'country', value: 'DE' },
        { type: 'country', value: 'FR' },
        { type: 'country', value: 'IT' },
        { type: 'country', value: 'ES' }
      ],
      products: [],
      customers: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default commission structures
  const defaultCommissionStructures: CommissionStructure[] = [
    {
      id: '1',
      name: 'Standard Commission',
      type: 'percentage',
      baseRate: 15,
      tiers: [
        {
          id: '1',
          name: 'Tier 1',
          minValue: 0,
          maxValue: 10000,
          rate: 10,
          description: 'Basic rate for small bookings'
        },
        {
          id: '2',
          name: 'Tier 2',
          minValue: 10000,
          maxValue: 50000,
          rate: 15,
          description: 'Standard rate for medium bookings'
        },
        {
          id: '3',
          name: 'Tier 3',
          minValue: 50000,
          rate: 20,
          description: 'Premium rate for large bookings'
        }
      ],
      bonuses: [
        {
          id: '1',
          name: 'Volume Bonus',
          type: 'volume',
          condition: { minBookings: 20, period: 'month' },
          amount: 1000,
          description: 'Monthly volume bonus',
          isActive: true
        }
      ],
      deductions: [],
      isActive: true,
      validFrom: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default reports
  const defaultReports: Report[] = [
    {
      id: '1',
      name: 'Monthly Booking Summary',
      description: 'Comprehensive monthly booking report with revenue and customer insights',
      type: 'booking',
      status: 'completed',
      format: 'pdf',
      filters: [
        {
          id: '1',
          field: 'dateRange',
          label: 'Date Range',
          operator: 'between',
          value: { start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
          dataType: 'date',
          isRequired: true
        }
      ],
      metrics: [
        {
          id: '1',
          name: 'totalBookings',
          label: 'Total Bookings',
          type: 'count',
          field: 'id',
          isVisible: true,
          order: 1
        },
        {
          id: '2',
          name: 'totalRevenue',
          label: 'Total Revenue',
          type: 'sum',
          field: 'totalAmount',
          format: 'currency',
          isVisible: true,
          order: 2
        }
      ],
      charts: [
        {
          id: '1',
          name: 'bookingTrends',
          type: 'line',
          title: 'Booking Trends',
          dataSource: 'bookings',
          xAxis: 'date',
          yAxis: 'count',
          filters: [],
          options: {
            colors: ['#3B82F6'],
            showLegend: true,
            showDataLabels: false,
            smooth: true
          },
          position: { x: 0, y: 0, width: 6, height: 4 },
          isVisible: true
        }
      ],
      recipients: [],
      isPublic: true,
      isTemplate: false,
      tags: ['monthly', 'booking', 'revenue'],
      createdBy: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastGeneratedAt: new Date().toISOString()
    }
  ];

  // Default dashboards
  const defaultDashboards: Dashboard[] = [
    {
      id: '1',
      name: 'Executive Dashboard',
      description: 'High-level overview of business performance and key metrics',
      isPublic: true,
      isDefault: true,
      layout: {
        columns: 3,
        rows: 3,
        breakpoints: {
          mobile: { columns: 1, rows: 3 },
          tablet: { columns: 2, rows: 3 },
          desktop: { columns: 3, rows: 3 }
        }
      },
      widgets: [
        {
          id: '1',
          type: 'metric',
          title: 'Total Bookings',
          dataSource: 'bookings',
          config: {
            metricType: 'count',
            format: 'number',
            threshold: {
              value: 100,
              color: '#10B981',
              operator: 'greater_than'
            }
          },
          position: { x: 0, y: 0, width: 1, height: 1 },
          isVisible: true
        },
        {
          id: '2',
          type: 'chart',
          title: 'Revenue Trend',
          dataSource: 'bookings',
          config: {
            chartType: 'line',
            colors: ['#3B82F6'],
            showLegend: true
          },
          position: { x: 1, y: 0, width: 2, height: 1 },
          isVisible: true
        }
      ],
      filters: [
        {
          id: '1',
          field: 'dateRange',
          label: 'Date Range',
          type: 'date',
          isGlobal: true
        }
      ],
      refreshInterval: 300,
      createdBy: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default analytics
  const defaultAnalytics: Analytics[] = [
    {
      id: '1',
      name: 'Booking Performance Analytics',
      description: 'Real-time analytics for booking performance and trends',
      type: 'kpi',
      dataSource: 'bookings',
      metrics: [
        {
          id: '1',
          name: 'bookingCount',
          field: 'id',
          type: 'count',
          aggregation: 'count',
          isVisible: true,
          order: 1
        },
        {
          id: '2',
          name: 'revenue',
          field: 'totalAmount',
          type: 'sum',
          aggregation: 'sum',
          format: 'currency',
          isVisible: true,
          order: 2
        }
      ],
      dimensions: [
        {
          id: '1',
          name: 'date',
          field: 'createdAt',
          type: 'date',
          isVisible: true,
          order: 1
        },
        {
          id: '2',
          name: 'tour',
          field: 'tourId',
          type: 'string',
          isVisible: true,
          order: 2
        }
      ],
      filters: [],
      timeRange: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        granularity: 'day'
      },
      isRealTime: true,
      refreshInterval: 60,
      createdBy: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default integrations
  const defaultIntegrations: Integration[] = [
    {
      id: '1',
      name: 'Stripe Payment Gateway',
      description: 'Secure payment processing for bookings and transactions',
      type: 'payment_gateway',
      status: 'active',
      provider: 'stripe',
      version: '2023-10-16',
      baseUrl: 'https://api.stripe.com/v1',
      authentication: {
        type: 'api_key',
        credentials: {
          apiKey: 'sk_test_...',
          secret: 'sk_test_...'
        }
      },
      configuration: {
        timeout: 30000,
        retryAttempts: 3,
        retryStrategy: 'exponential_backoff',
        retryDelay: 1000,
        rateLimit: {
          requests: 100,
          period: 60
        },
        dataFormat: 'json',
        encoding: 'utf-8',
        compression: false,
        encryption: true
      },
      webhooks: [
        {
          id: '1',
          name: 'Payment Webhook',
          url: 'https://your-app.com/webhooks/stripe',
          events: ['payment_received', 'booking_created'],
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          isActive: true,
          retryAttempts: 3,
          timeout: 30000,
          filters: [],
          transformations: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      syncRules: [
        {
          id: '1',
          name: 'Customer Sync',
          sourceField: 'customer.email',
          targetField: 'email',
          direction: 'bidirectional',
          isActive: true,
          priority: 1,
          conditions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      isActive: true,
      isTestMode: true,
      lastSyncAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '1'
    },
    {
      id: '2',
      name: 'Booking.com API',
      description: 'Sync bookings and availability with Booking.com platform',
      type: 'booking_platform',
      status: 'active',
      provider: 'booking.com',
      version: '2.0',
      baseUrl: 'https://distribution-xml.booking.com/2.0/json',
      authentication: {
        type: 'api_key',
        credentials: {
          apiKey: 'your_booking_api_key'
        }
      },
      configuration: {
        timeout: 30000,
        retryAttempts: 3,
        retryStrategy: 'exponential_backoff',
        retryDelay: 2000,
        rateLimit: {
          requests: 50,
          period: 60
        },
        dataFormat: 'json',
        encoding: 'utf-8',
        compression: true,
        encryption: false
      },
      webhooks: [],
      syncRules: [
        {
          id: '2',
          name: 'Booking Sync',
          sourceField: 'booking.id',
          targetField: 'externalId',
          direction: 'inbound',
          isActive: true,
          priority: 1,
          conditions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      isActive: true,
      isTestMode: false,
      lastSyncAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '1'
    }
  ];

  // Default webhook configs
  const defaultWebhookConfigs: WebhookConfig[] = [
    {
      id: '1',
      name: 'Booking Created Webhook',
      url: 'https://your-app.com/webhooks/booking-created',
      events: ['booking_created'],
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': 'your_webhook_secret'
      },
      isActive: true,
      retryAttempts: 3,
      timeout: 30000,
      filters: [],
      transformations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default integration tests
  const defaultIntegrationTests: IntegrationTest[] = [
    {
      id: '1',
      integrationId: '1',
      name: 'Stripe Connection Test',
      description: 'Test Stripe API connectivity and authentication',
      testType: 'connection',
      configuration: {
        endpoint: '/charges',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer sk_test_...'
        },
        timeout: 10000
      },
      isActive: true,
      lastRunAt: new Date().toISOString(),
      lastResult: 'passed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Default integration monitors
  const defaultIntegrationMonitors: IntegrationMonitor[] = [
    {
      id: '1',
      integrationId: '1',
      name: 'Stripe Uptime Monitor',
      description: 'Monitor Stripe API uptime and response times',
      metric: 'uptime',
      threshold: {
        value: 99.5,
        operator: 'less_than',
        unit: '%'
      },
      isActive: true,
      alertChannels: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Save all default data
  dataStore.users.save(defaultUsers);
  dataStore.vehicles.save(defaultVehicles);
  dataStore.customers.save(defaultCustomers);
  dataStore.tours.save(defaultTours);
  dataStore.guides.save(defaultGuides);
  dataStore.addonCategories.save(defaultAddonCategories);
  dataStore.addons.save(defaultAddons);
  dataStore.refundPolicies.save(defaultRefundPolicies);
  dataStore.depositPolicies.save(defaultDepositPolicies);
  dataStore.paymentTerms.save(defaultPaymentTerms);
  dataStore.emailTemplates.save(defaultEmailTemplates);
  dataStore.notificationRules.save(defaultNotificationRules);
  dataStore.manifests.save(defaultManifests);
  dataStore.dailyOperations.save(defaultDailyOperations);
  dataStore.qrTickets.save(defaultQRTickets);
  dataStore.qrCodeConfigs.save(defaultQRConfigs);
  dataStore.qrTemplates.save(defaultQRTemplates);
  dataStore.waivers.save(defaultWaivers);
  dataStore.waiverTemplates.save(defaultWaiverTemplates);
  dataStore.promotions.save(defaultPromotions);
  dataStore.customerSegments.save(defaultCustomerSegments);
  dataStore.agents.save(defaultAgents);
  dataStore.territories.save(defaultTerritories);
  dataStore.commissionStructures.save(defaultCommissionStructures);
  dataStore.reports.save(defaultReports);
  dataStore.dashboards.save(defaultDashboards);
  dataStore.analytics.save(defaultAnalytics);
  dataStore.integrations.save(defaultIntegrations);
  dataStore.webhookConfigs.save(defaultWebhookConfigs);
  dataStore.integrationTests.save(defaultIntegrationTests);
  dataStore.integrationMonitors.save(defaultIntegrationMonitors);
  dataStore.bookings.save([]);
  dataStore.notifications.save([]);
  dataStore.refundRequests.save([]);
  dataStore.smsMessages.save([]);
  dataStore.communicationLogs.save([]);
  dataStore.marketingCampaigns.save([]);
  dataStore.vehiclePreparations.save([]);
  dataStore.customerCheckIns.save([]);
  dataStore.tourDepartures.save([]);
  dataStore.dailyReports.save([]);
  dataStore.checkInSessions.save([]);
  dataStore.checkInEvents.save([]);
  dataStore.checkInAnalytics.save([]);
  dataStore.mobileApps.save([]);
  dataStore.selfServicePortals.save([]);
  dataStore.validationRules.save([]);
  dataStore.offlineData.save([]);
  dataStore.waiverSignatures.save([]);
  dataStore.complianceReports.save([]);
  dataStore.waiverAnalytics.save([]);
  dataStore.waiverNotifications.save([]);
  dataStore.waiverWorkflows.save([]);
  dataStore.waiverTranslations.save([]);
  dataStore.waiverAuditLogs.save([]);
  dataStore.discountCodes.save([]);
  dataStore.promotionUsages.save([]);
  dataStore.campaigns.save([]);
  dataStore.promotionAnalytics.save([]);
  dataStore.promotionRules.save([]);
  dataStore.promotionTemplates.save([]);
  dataStore.promotionBanners.save([]);
  dataStore.referralPrograms.save([]);
  dataStore.referrals.save([]);
  dataStore.loyaltyPrograms.save([]);
  dataStore.loyaltyAccounts.save([]);
  dataStore.loyaltyTransactions.save([]);
  dataStore.leads.save([]);
  dataStore.commissions.save([]);
  dataStore.agentReports.save([]);
  dataStore.agentTrainings.save([]);
  dataStore.agentAuditLogs.save([]);
  dataStore.reportTemplates.save([]);
  dataStore.exportJobs.save([]);
  dataStore.reportExecutions.save([]);
  dataStore.reportData.save([]);
  dataStore.reportShares.save([]);
  dataStore.reportComments.save([]);
  dataStore.reportAuditLogs.save([]);
  dataStore.syncJobs.save([]);
  dataStore.integrationAlerts.save([]);
  dataStore.integrationTemplates.save([]);
  dataStore.integrationUsage.save([]);
  dataStore.integrationAuditLogs.save([]);

  console.log('Default data initialized successfully');
  } else {
    console.log('Users already exist, skipping initialization');
  }
};

// Force clear all data and reinitialize (for debugging)
export const clearAndReinitialize = () => {
  localStorage.removeItem('aat_users');
  localStorage.removeItem('aat_vehicles');
  localStorage.removeItem('aat_customers');
  localStorage.removeItem('aat_tours');
  localStorage.removeItem('aat_guides');
  localStorage.removeItem('aat_addons');
  localStorage.removeItem('aat_addon_categories');
  localStorage.removeItem('aat_refund_policies');
  localStorage.removeItem('aat_deposit_policies');
  localStorage.removeItem('aat_payment_terms');
  localStorage.removeItem('aat_refund_requests');
  localStorage.removeItem('aat_email_templates');
  localStorage.removeItem('aat_sms_messages');
  localStorage.removeItem('aat_communication_logs');
  localStorage.removeItem('aat_notification_rules');
  localStorage.removeItem('aat_marketing_campaigns');
  localStorage.removeItem('aat_manifests');
  localStorage.removeItem('aat_daily_operations');
  localStorage.removeItem('aat_vehicle_preparations');
  localStorage.removeItem('aat_customer_checkins');
  localStorage.removeItem('aat_tour_departures');
  localStorage.removeItem('aat_daily_reports');
  localStorage.removeItem('aat_qr_tickets');
  localStorage.removeItem('aat_checkin_sessions');
  localStorage.removeItem('aat_checkin_events');
  localStorage.removeItem('aat_qr_configs');
  localStorage.removeItem('aat_checkin_analytics');
  localStorage.removeItem('aat_mobile_apps');
  localStorage.removeItem('aat_self_service');
  localStorage.removeItem('aat_validation_rules');
  localStorage.removeItem('aat_offline_data');
  localStorage.removeItem('aat_qr_templates');
  localStorage.removeItem('aat_waivers');
  localStorage.removeItem('aat_waiver_signatures');
  localStorage.removeItem('aat_waiver_templates');
  localStorage.removeItem('aat_compliance_reports');
  localStorage.removeItem('aat_waiver_analytics');
  localStorage.removeItem('aat_waiver_notifications');
  localStorage.removeItem('aat_waiver_workflows');
  localStorage.removeItem('aat_waiver_translations');
  localStorage.removeItem('aat_waiver_audit_logs');
  localStorage.removeItem('aat_promotions');
  localStorage.removeItem('aat_customer_segments');
  localStorage.removeItem('aat_discount_codes');
  localStorage.removeItem('aat_promotion_usages');
  localStorage.removeItem('aat_campaigns');
  localStorage.removeItem('aat_promotion_analytics');
  localStorage.removeItem('aat_promotion_rules');
  localStorage.removeItem('aat_promotion_templates');
  localStorage.removeItem('aat_promotion_banners');
  localStorage.removeItem('aat_referral_programs');
  localStorage.removeItem('aat_referrals');
  localStorage.removeItem('aat_loyalty_programs');
  localStorage.removeItem('aat_loyalty_accounts');
  localStorage.removeItem('aat_loyalty_transactions');
  localStorage.removeItem('aat_agents');
  localStorage.removeItem('aat_territories');
  localStorage.removeItem('aat_commission_structures');
  localStorage.removeItem('aat_leads');
  localStorage.removeItem('aat_commissions');
  localStorage.removeItem('aat_agent_reports');
  localStorage.removeItem('aat_agent_trainings');
  localStorage.removeItem('aat_agent_audit_logs');
  localStorage.removeItem('aat_reports');
  localStorage.removeItem('aat_report_templates');
  localStorage.removeItem('aat_dashboards');
  localStorage.removeItem('aat_analytics');
  localStorage.removeItem('aat_export_jobs');
  localStorage.removeItem('aat_report_executions');
  localStorage.removeItem('aat_report_data');
  localStorage.removeItem('aat_report_shares');
  localStorage.removeItem('aat_report_comments');
  localStorage.removeItem('aat_report_audit_logs');
  localStorage.removeItem('aat_integrations');
  localStorage.removeItem('aat_webhook_configs');
  localStorage.removeItem('aat_sync_jobs');
  localStorage.removeItem('aat_integration_tests');
  localStorage.removeItem('aat_integration_monitors');
  localStorage.removeItem('aat_integration_alerts');
  localStorage.removeItem('aat_integration_templates');
  localStorage.removeItem('aat_integration_usage');
  localStorage.removeItem('aat_integration_audit_logs');
  localStorage.removeItem('aat_bookings');
  localStorage.removeItem('aat_notifications');
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUserId');
  
  initializeData();
  console.log('All data cleared and reinitialized');
};