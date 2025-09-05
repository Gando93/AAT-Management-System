import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar as CalendarIcon, MapPin, Truck, Users, Settings as SettingsIcon, Plus, Edit, Trash2, ChevronDown, ChevronUp, FileText, FileSpreadsheet, AlertCircle, CheckCircle, DollarSign, User as UserIcon, LogOut, Package, Shield, Mail, ClipboardList, QrCode, FileText as WaiverIcon, Percent, UserCheck, BarChart3, Plug } from 'lucide-react';
import { dataStore, initializeData } from './lib/storage';
import { UserModal } from './components/UserModal';
import { VehicleModal } from './components/VehicleModal';
import { SimpleBookingModal } from './components/SimpleBookingModal';
import { TourDetailModal } from './components/TourDetailModal';
import { Settings } from './pages/Settings';
import { CustomerModal } from './components/CustomerModal';
import { UserDropdown } from './components/UserDropdown';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import PasswordSetupForm from './components/PasswordSetupForm';
import { DashboardWidget } from './components/DashboardWidget';
import { RecentActivity } from './components/RecentActivity';
import { QuickStats } from './components/QuickStats';
import { Calendar } from './components/Calendar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CurrencyProvider, useCurrency } from './context/CurrencyContext';
import { SidebarVisibilityProvider } from './context/SidebarVisibilityContext';
import { buildBookingsCSV, downloadCSV, generateBookingReceipt } from './lib/exports';
import { ToastContainer } from './components/Toast';
import { evaluateCapacity } from './lib/resourceAvailability';
import { CurrencySelector } from './components/CurrencySelector';
import { CurrencyExchange } from './components/CurrencyExchange';
import { GuidesPage } from './pages/Guides';
import { AddonsPage } from './pages/Addons';
import { PoliciesPage } from './pages/Policies';
import { CommunicationsPage } from './pages/Communications';
import { ManifestsPage } from './pages/Manifests';
import { QRTicketsPage } from './pages/QRTickets';
import { WaiversPage } from './pages/Waivers';
import { PromotionsPage } from './pages/Promotions';
import { AgentsPage } from './pages/Agents';
import { ReportsPage } from './pages/Reports';
import { IntegrationsPage } from './pages/Integrations';
import { isFeatureEnabled, type FeatureFlags } from './config/features';
import { useSidebarVisibility } from './hooks/useSidebarVisibility';
import type { User, Vehicle, Booking, Customer, Tour, Notification } from './types';
import type { Guide } from './types/guides';
import type { Addon, AddonCategory } from './types/addons';
import type { RefundPolicy, DepositPolicy, PaymentTerms, RefundRequest } from './types/policies';
import type { EmailTemplate, SMSMessage, CommunicationLog, NotificationRule, MarketingCampaign } from './types/communications';
import type { TourManifest, DailyOperations, VehiclePreparation, CustomerCheckIn, TourDeparture, DailyReport } from './types/manifests';
import type { QRTicket, CheckInSession, CheckInEvent, QRCodeConfig, CheckInAnalytics, MobileCheckInApp, CustomerSelfService, QRValidationRule, OfflineCheckInData, QRCodeTemplate } from './types/qrTickets';
import type { Waiver, WaiverSignature, WaiverTemplate, ComplianceReport, WaiverAnalytics, WaiverNotification, WaiverWorkflow, WaiverTranslation, WaiverAuditLog } from './types/waivers';
import type { Promotion, CustomerSegment, DiscountCode, PromotionUsage, Campaign, PromotionAnalytics, PromotionRule, PromotionTemplate, PromotionBanner, ReferralProgram, Referral, LoyaltyProgram, LoyaltyAccount, LoyaltyTransaction } from './types/promotions';
import type { Agent, Territory, CommissionStructure, Lead, Commission, AgentReport, AgentTraining, AgentAuditLog } from './types/agents';
import type { Report, ReportTemplate, Dashboard, Analytics, ExportJob, ReportExecution, ReportData, ReportShare, ReportComment, ReportAuditLog } from './types/reports';
import type { Integration, WebhookConfig, SyncJob, IntegrationTest, IntegrationMonitor, IntegrationAlert, IntegrationTemplate, IntegrationUsage, IntegrationAuditLog } from './types/integrations';

// Main App Component with Authentication
function App() {
  return (
    <ErrorBoundary>
      <CurrencyProvider>
        <AuthProvider>
          <SidebarVisibilityProvider>
            <AppContent />
            <ToastContainer toasts={[]} onRemove={() => {}} />
          </SidebarVisibilityProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ErrorBoundary>
  );
}

// Version info for cache busting
const BUILD_ID = `v2.1.0-${Date.now()}`;
console.log('AAT Management System', BUILD_ID);
console.log('Build timestamp:', new Date().toISOString());
console.log('Cache busting enabled - Fresh deployment');

// App Content Component
function AppContent() {
  const { isAuthenticated, currentUser, logout, checkPermission } = useAuth();
  const { formatAmount } = useCurrency();
  const { visibility: sidebarVisibility } = useSidebarVisibility();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [addonCategories, setAddonCategories] = useState<AddonCategory[]>([]);
  const [refundPolicies, setRefundPolicies] = useState<RefundPolicy[]>([]);
  const [depositPolicies, setDepositPolicies] = useState<DepositPolicy[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([]);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([]);
  const [marketingCampaigns, setMarketingCampaigns] = useState<MarketingCampaign[]>([]);
  const [manifests, setManifests] = useState<TourManifest[]>([]);
  const [dailyOperations, setDailyOperations] = useState<DailyOperations[]>([]);
  const [vehiclePreparations, setVehiclePreparations] = useState<VehiclePreparation[]>([]);
  const [customerCheckIns, setCustomerCheckIns] = useState<CustomerCheckIn[]>([]);
  const [tourDepartures, setTourDepartures] = useState<TourDeparture[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [qrTickets, setQrTickets] = useState<QRTicket[]>([]);
  const [checkInSessions, setCheckInSessions] = useState<CheckInSession[]>([]);
  const [checkInEvents, setCheckInEvents] = useState<CheckInEvent[]>([]);
  const [qrCodeConfigs, setQrCodeConfigs] = useState<QRCodeConfig[]>([]);
  const [checkInAnalytics, setCheckInAnalytics] = useState<CheckInAnalytics[]>([]);
  const [mobileApps, setMobileApps] = useState<MobileCheckInApp[]>([]);
  const [selfServicePortals, setSelfServicePortals] = useState<CustomerSelfService[]>([]);
  const [validationRules, setValidationRules] = useState<QRValidationRule[]>([]);
  const [offlineData, setOfflineData] = useState<OfflineCheckInData[]>([]);
  const [qrTemplates, setQrTemplates] = useState<QRCodeTemplate[]>([]);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [waiverSignatures, setWaiverSignatures] = useState<WaiverSignature[]>([]);
  const [waiverTemplates, setWaiverTemplates] = useState<WaiverTemplate[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [waiverAnalytics, setWaiverAnalytics] = useState<WaiverAnalytics[]>([]);
  const [waiverNotifications, setWaiverNotifications] = useState<WaiverNotification[]>([]);
  const [waiverWorkflows, setWaiverWorkflows] = useState<WaiverWorkflow[]>([]);
  const [waiverTranslations, setWaiverTranslations] = useState<WaiverTranslation[]>([]);
  const [waiverAuditLogs, setWaiverAuditLogs] = useState<WaiverAuditLog[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [promotionUsages, setPromotionUsages] = useState<PromotionUsage[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [promotionAnalytics, setPromotionAnalytics] = useState<PromotionAnalytics[]>([]);
  const [promotionRules, setPromotionRules] = useState<PromotionRule[]>([]);
  const [promotionTemplates, setPromotionTemplates] = useState<PromotionTemplate[]>([]);
  const [promotionBanners, setPromotionBanners] = useState<PromotionBanner[]>([]);
  const [referralPrograms, setReferralPrograms] = useState<ReferralProgram[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([]);
  const [loyaltyAccounts, setLoyaltyAccounts] = useState<LoyaltyAccount[]>([]);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [commissionStructures, setCommissionStructures] = useState<CommissionStructure[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [agentReports, setAgentReports] = useState<AgentReport[]>([]);
  const [agentTrainings, setAgentTrainings] = useState<AgentTraining[]>([]);
  const [agentAuditLogs, setAgentAuditLogs] = useState<AgentAuditLog[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [reportExecutions, setReportExecutions] = useState<ReportExecution[]>([]);
  const [_reportData, _setReportData] = useState<ReportData[]>([]);
  const [_reportShares, _setReportShares] = useState<ReportShare[]>([]);
  const [_reportComments, _setReportComments] = useState<ReportComment[]>([]);
  const [_reportAuditLogs, _setReportAuditLogs] = useState<ReportAuditLog[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfig[]>([]);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [integrationTests, setIntegrationTests] = useState<IntegrationTest[]>([]);
  const [integrationMonitors, setIntegrationMonitors] = useState<IntegrationMonitor[]>([]);
  const [integrationAlerts, setIntegrationAlerts] = useState<IntegrationAlert[]>([]);
  const [integrationTemplates, setIntegrationTemplates] = useState<IntegrationTemplate[]>([]);
  const [integrationUsage, setIntegrationUsage] = useState<IntegrationUsage[]>([]);
  const [_integrationAuditLogs, _setIntegrationAuditLogs] = useState<IntegrationAuditLog[]>([]);

  const [userModal, setUserModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; user?: User }>({ isOpen: false, mode: 'create' });
  const [vehicleModal, setVehicleModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; vehicle?: Vehicle }>({ isOpen: false, mode: 'create' });
  const [bookingModal, setBookingModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; booking?: Booking }>({ isOpen: false, mode: 'create' });
  const [tourModal, setTourModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; tour?: Tour }>({ isOpen: false, mode: 'create' });
  const [customerModal, setCustomerModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; customer?: Customer }>({ isOpen: false, mode: 'create' });
  const [expandedTours, setExpandedTours] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    initializeData();
    loadAllData();
  }, []);

  const toggleTourExpansion = (tourId: string) => {
    const newExpanded = new Set(expandedTours);
    if (newExpanded.has(tourId)) {
      newExpanded.delete(tourId);
    } else {
      newExpanded.add(tourId);
    }
    setExpandedTours(newExpanded);
  };

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      setUsers(dataStore.users.getAll());
      setVehicles(dataStore.vehicles.getAll());
      setBookings(dataStore.bookings.getAll());
      setCustomers(dataStore.customers.getAll());
      setTours(dataStore.tours.getAll());
      setNotifications(dataStore.notifications.getAll());
      setGuides(dataStore.guides?.getAll() || []);
      setAddons(dataStore.addons?.getAll() || []);
      setAddonCategories(dataStore.addonCategories?.getAll() || []);
      setRefundPolicies(dataStore.refundPolicies?.getAll() || []);
      setDepositPolicies(dataStore.depositPolicies?.getAll() || []);
      setPaymentTerms(dataStore.paymentTerms?.getAll() || []);
      setRefundRequests(dataStore.refundRequests?.getAll() || []);
      setEmailTemplates(dataStore.emailTemplates?.getAll() || []);
      setSmsMessages(dataStore.smsMessages?.getAll() || []);
      setCommunicationLogs(dataStore.communicationLogs?.getAll() || []);
      setNotificationRules(dataStore.notificationRules?.getAll() || []);
      setMarketingCampaigns(dataStore.marketingCampaigns?.getAll() || []);
      setManifests(dataStore.manifests?.getAll() || []);
      setDailyOperations(dataStore.dailyOperations?.getAll() || []);
      setVehiclePreparations(dataStore.vehiclePreparations?.getAll() || []);
      setCustomerCheckIns(dataStore.customerCheckIns?.getAll() || []);
      setTourDepartures(dataStore.tourDepartures?.getAll() || []);
      setDailyReports(dataStore.dailyReports?.getAll() || []);
      setQrTickets(dataStore.qrTickets?.getAll() || []);
      setCheckInSessions(dataStore.checkInSessions?.getAll() || []);
      setCheckInEvents(dataStore.checkInEvents?.getAll() || []);
      setQrCodeConfigs(dataStore.qrCodeConfigs?.getAll() || []);
      setCheckInAnalytics(dataStore.checkInAnalytics?.getAll() || []);
      setMobileApps(dataStore.mobileApps?.getAll() || []);
      setSelfServicePortals(dataStore.selfServicePortals?.getAll() || []);
      setValidationRules(dataStore.validationRules?.getAll() || []);
      setOfflineData(dataStore.offlineData?.getAll() || []);
      setQrTemplates(dataStore.qrTemplates?.getAll() || []);
      setWaivers(dataStore.waivers?.getAll() || []);
      setWaiverSignatures(dataStore.waiverSignatures?.getAll() || []);
      setWaiverTemplates(dataStore.waiverTemplates?.getAll() || []);
      setComplianceReports(dataStore.complianceReports?.getAll() || []);
      setWaiverAnalytics(dataStore.waiverAnalytics?.getAll() || []);
      setWaiverNotifications(dataStore.waiverNotifications?.getAll() || []);
      setWaiverWorkflows(dataStore.waiverWorkflows?.getAll() || []);
      setWaiverTranslations(dataStore.waiverTranslations?.getAll() || []);
      setWaiverAuditLogs(dataStore.waiverAuditLogs?.getAll() || []);
      setPromotions(dataStore.promotions?.getAll() || []);
      setCustomerSegments(dataStore.customerSegments?.getAll() || []);
      setDiscountCodes(dataStore.discountCodes?.getAll() || []);
      setPromotionUsages(dataStore.promotionUsages?.getAll() || []);
      setCampaigns(dataStore.campaigns?.getAll() || []);
      setPromotionAnalytics(dataStore.promotionAnalytics?.getAll() || []);
      setPromotionRules(dataStore.promotionRules?.getAll() || []);
      setPromotionTemplates(dataStore.promotionTemplates?.getAll() || []);
      setPromotionBanners(dataStore.promotionBanners?.getAll() || []);
      setReferralPrograms(dataStore.referralPrograms?.getAll() || []);
      setReferrals(dataStore.referrals?.getAll() || []);
      setLoyaltyPrograms(dataStore.loyaltyPrograms?.getAll() || []);
      setLoyaltyAccounts(dataStore.loyaltyAccounts?.getAll() || []);
      setLoyaltyTransactions(dataStore.loyaltyTransactions?.getAll() || []);
      setAgents(dataStore.agents?.getAll() || []);
      setTerritories(dataStore.territories?.getAll() || []);
      setCommissionStructures(dataStore.commissionStructures?.getAll() || []);
      setLeads(dataStore.leads?.getAll() || []);
      setCommissions(dataStore.commissions?.getAll() || []);
      setAgentReports(dataStore.agentReports?.getAll() || []);
      setAgentTrainings(dataStore.agentTrainings?.getAll() || []);
      setAgentAuditLogs(dataStore.agentAuditLogs?.getAll() || []);
      setReports(dataStore.reports?.getAll() || []);
      setReportTemplates(dataStore.reportTemplates?.getAll() || []);
      setDashboards(dataStore.dashboards?.getAll() || []);
      setAnalytics(dataStore.analytics?.getAll() || []);
      setExportJobs(dataStore.exportJobs?.getAll() || []);
      setReportExecutions(dataStore.reportExecutions?.getAll() || []);
      _setReportData(dataStore.reportData?.getAll() || []);
      _setReportShares(dataStore.reportShares?.getAll() || []);
      _setReportComments(dataStore.reportComments?.getAll() || []);
      _setReportAuditLogs(dataStore.reportAuditLogs?.getAll() || []);
      setIntegrations(dataStore.integrations?.getAll() || []);
      setWebhookConfigs(dataStore.webhookConfigs?.getAll() || []);
      setSyncJobs(dataStore.syncJobs?.getAll() || []);
      setIntegrationTests(dataStore.integrationTests?.getAll() || []);
      setIntegrationMonitors(dataStore.integrationMonitors?.getAll() || []);
      setIntegrationAlerts(dataStore.integrationAlerts?.getAll() || []);
      setIntegrationTemplates(dataStore.integrationTemplates?.getAll() || []);
      setIntegrationUsage(dataStore.integrationUsage?.getAll() || []);
      _setIntegrationAuditLogs(dataStore.integrationAuditLogs?.getAll() || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced notification system with proper ordering
  const addNotification = (type: Notification['type'], message: string) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toLocaleString(),
      read: false,
    };
    if (dataStore.notifications.add(notification)) {
      setNotifications(dataStore.notifications.getAll());
    }
  };

  const markNotificationRead = (id: string) => {
    const notifications = dataStore.notifications.getAll();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    dataStore.notifications.save(updated);
    setNotifications(updated);
  };

  const markAllNotificationsRead = () => {
    const notifications = dataStore.notifications.getAll();
    const updated = notifications.map(n => ({ ...n, read: true }));
    dataStore.notifications.save(updated);
    setNotifications(updated);
  };

  // Handle calendar date click
  const handleDateClick = (date: Date) => {
    setBookingModal({ 
      isOpen: true, 
      mode: 'create',
      booking: {
        id: '',
        customerId: '',
        customerName: '',
        tourId: '',
        tourName: '',
        vehicleId: '',
        bookingDate: new Date().toISOString().split('T')[0],
        tourDate: date.toISOString().split('T')[0],
        participants: 1,
        guests: 1,
        totalAmount: 0,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: '',
        notes: ''
      }
    });
  };

  // Handle create booking from calendar
  const handleCreateBookingFromCalendar = () => {
    setBookingModal({ isOpen: true, mode: 'create' });
  };

  // Enhanced receipt generation - removed, using exportBookingPDF instead

  // Enhanced booking operations with better error handling
  // (Replaced below with availability-aware version)

  // User operations
  const handleUserSave = (userData: Omit<User, 'id'>) => {
    try {
      const newUser: User = { ...userData, id: Date.now().toString() };
      if (dataStore.users.add(newUser)) {
        setUsers(dataStore.users.getAll());
        addNotification('user', `New user "${newUser.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save user');
    } catch (error) {
      console.error('Error saving user:', error);
      addNotification('user', 'Error creating user. Please try again.');
      return false;
    }
  };

  const handleUserUpdate = (userData: Omit<User, 'id'>) => {
    try {
      if (userModal.user && dataStore.users.update(userModal.user.id, userData)) {
        setUsers(dataStore.users.getAll());
        addNotification('user', `User "${userData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update user');
    } catch (error) {
      console.error('Error updating user:', error);
      addNotification('user', 'Error updating user. Please try again.');
      return false;
    }
  };


  // Vehicle operations
  const handleVehicleSave = (vehicleData: Omit<Vehicle, 'id'>) => {
    try {
      const newVehicle: Vehicle = { ...vehicleData, id: 'VEH' + Date.now().toString() };
      if (dataStore.vehicles.add(newVehicle)) {
        setVehicles(dataStore.vehicles.getAll());
        addNotification('vehicle', `New vehicle "${newVehicle.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save vehicle');
    } catch (error) {
      console.error('Error saving vehicle:', error);
      addNotification('vehicle', 'Error creating vehicle. Please try again.');
      return false;
    }
  };

  const handleVehicleUpdate = (vehicleData: Omit<Vehicle, 'id'>) => {
    try {
      if (vehicleModal.vehicle && dataStore.vehicles.update(vehicleModal.vehicle.id, vehicleData)) {
        setVehicles(dataStore.vehicles.getAll());
        addNotification('vehicle', `Vehicle "${vehicleData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update vehicle');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      addNotification('vehicle', 'Error updating vehicle. Please try again.');
      return false;
    }
  };

  const handleVehicleDelete = (vehicleId: string) => {
    try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle && dataStore.vehicles.delete(vehicleId)) {
        setVehicles(dataStore.vehicles.getAll());
        addNotification('vehicle', `Vehicle "${vehicle.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      addNotification('vehicle', 'Error deleting vehicle. Please try again.');
    }
  };

  // Customer operations
  const handleCustomerSave = (customerData: Omit<Customer, 'id'>) => {
    try {
      const newCustomer: Customer = { ...customerData, id: 'CU' + Date.now().toString() };
      if (dataStore.customers.add(newCustomer)) {
        setCustomers(dataStore.customers.getAll());
        addNotification('customer', `New customer "${newCustomer.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save customer');
    } catch (error) {
      console.error('Error saving customer:', error);
      addNotification('customer', 'Error creating customer. Please try again.');
      return false;
    }
  };

  const handleCustomerUpdate = (customerData: Omit<Customer, 'id'>) => {
    try {
      if (customerModal.customer && dataStore.customers.update(customerModal.customer.id, customerData)) {
        setCustomers(dataStore.customers.getAll());
        addNotification('customer', `Customer "${customerData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update customer');
    } catch (error) {
      console.error('Error updating customer:', error);
      addNotification('customer', 'Error updating customer. Please try again.');
      return false;
    }
  };

  const handleCustomerDelete = (customerId: string) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (customer && dataStore.customers.delete(customerId)) {
        setCustomers(dataStore.customers.getAll());
        addNotification('customer', `Customer "${customer.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      addNotification('customer', 'Error deleting customer. Please try again.');
    }
  };

  // Tour operations
  const handleTourSave = (tourData: Omit<Tour, 'id'>) => {
    try {
      const newTour: Tour = { ...tourData, id: 'TOUR' + Date.now().toString() };
      if (dataStore.tours.add(newTour)) {
        setTours(dataStore.tours.getAll());
        addNotification('tour', `New tour "${newTour.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save tour');
    } catch (error) {
      console.error('Error saving tour:', error);
      addNotification('tour', 'Error creating tour. Please try again.');
      return false;
    }
  };

  const handleTourUpdate = (tourData: Omit<Tour, 'id'>) => {
    try {
      if (tourModal.tour && dataStore.tours.update(tourModal.tour.id, tourData)) {
        setTours(dataStore.tours.getAll());
        addNotification('tour', `Tour "${tourData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update tour');
    } catch (error) {
      console.error('Error updating tour:', error);
      addNotification('tour', 'Error updating tour. Please try again.');
      return false;
    }
  };

  const handleTourDelete = (tourId: string) => {
    try {
      const tour = tours.find(t => t.id === tourId);
      if (tour && dataStore.tours.delete(tourId)) {
        setTours(dataStore.tours.getAll());
        addNotification('tour', `Tour "${tour.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      addNotification('tour', 'Error deleting tour. Please try again.');
    }
  };

  // Guide operations
  const handleGuideSave = (guideData: Omit<Guide, 'id'>) => {
    try {
      const newGuide: Guide = { ...guideData, id: 'GUIDE' + Date.now().toString() };
      if (dataStore.guides?.add(newGuide)) {
        setGuides(dataStore.guides.getAll());
        addNotification('user', `New guide "${newGuide.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save guide');
    } catch (error) {
      console.error('Error saving guide:', error);
      addNotification('user', 'Error creating guide. Please try again.');
      return false;
    }
  };

  const handleGuideUpdate = (guideData: Omit<Guide, 'id'>) => {
    try {
      // For now, we'll treat update as create since we don't have update in dataStore
      const updatedGuide: Guide = { ...guideData, id: 'GUIDE' + Date.now().toString() };
      if (dataStore.guides?.add(updatedGuide)) {
        setGuides(dataStore.guides.getAll());
        addNotification('user', `Guide "${guideData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update guide');
    } catch (error) {
      console.error('Error updating guide:', error);
      addNotification('user', 'Error updating guide. Please try again.');
      return false;
    }
  };

  const handleGuideDelete = (guideId: string) => {
    try {
      const guide = guides.find(g => g.id === guideId);
      if (guide && dataStore.guides?.delete(guideId)) {
        setGuides(dataStore.guides.getAll());
        addNotification('user', `Guide "${guide.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting guide:', error);
      addNotification('user', 'Error deleting guide. Please try again.');
    }
  };

  // Add-on operations
  const handleAddonSave = (addonData: Omit<Addon, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newAddon: Addon = { 
        ...addonData, 
        id: 'ADDON' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.addons?.add(newAddon)) {
        setAddons(dataStore.addons.getAll());
        addNotification('booking', `New add-on "${newAddon.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save add-on');
    } catch (error) {
      console.error('Error saving add-on:', error);
      addNotification('booking', 'Error creating add-on. Please try again.');
      return false;
    }
  };

  const handleAddonUpdate = (addonData: Omit<Addon, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // For now, we'll treat update as create since we don't have update in dataStore
      const updatedAddon: Addon = { 
        ...addonData, 
        id: 'ADDON' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.addons?.add(updatedAddon)) {
        setAddons(dataStore.addons.getAll());
        addNotification('booking', `Add-on "${addonData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update add-on');
    } catch (error) {
      console.error('Error updating add-on:', error);
      addNotification('booking', 'Error updating add-on. Please try again.');
      return false;
    }
  };

  const handleAddonDelete = (addonId: string) => {
    try {
      const addon = addons.find(a => a.id === addonId);
      if (addon && dataStore.addons?.delete(addonId)) {
        setAddons(dataStore.addons.getAll());
        addNotification('booking', `Add-on "${addon.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting add-on:', error);
      addNotification('booking', 'Error deleting add-on. Please try again.');
    }
  };

  // Refund Policy operations
  const handleRefundPolicySave = (policyData: Omit<RefundPolicy, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPolicy: RefundPolicy = { 
        ...policyData, 
        id: 'REFUND' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.refundPolicies?.add(newPolicy)) {
        setRefundPolicies(dataStore.refundPolicies.getAll());
        addNotification('booking', `New refund policy "${newPolicy.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save refund policy');
    } catch (error) {
      console.error('Error saving refund policy:', error);
      addNotification('booking', 'Error creating refund policy. Please try again.');
      return false;
    }
  };

  const handleRefundPolicyUpdate = (policyData: Omit<RefundPolicy, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedPolicy: RefundPolicy = { 
        ...policyData, 
        id: 'REFUND' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.refundPolicies?.add(updatedPolicy)) {
        setRefundPolicies(dataStore.refundPolicies.getAll());
        addNotification('booking', `Refund policy "${policyData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update refund policy');
    } catch (error) {
      console.error('Error updating refund policy:', error);
      addNotification('booking', 'Error updating refund policy. Please try again.');
      return false;
    }
  };

  const handleRefundPolicyDelete = (policyId: string) => {
    try {
      const policy = refundPolicies.find(p => p.id === policyId);
      if (policy && dataStore.refundPolicies?.delete(policyId)) {
        setRefundPolicies(dataStore.refundPolicies.getAll());
        addNotification('booking', `Refund policy "${policy.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting refund policy:', error);
      addNotification('booking', 'Error deleting refund policy. Please try again.');
    }
  };

  // Deposit Policy operations
  const handleDepositPolicySave = (policyData: Omit<DepositPolicy, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPolicy: DepositPolicy = { 
        ...policyData, 
        id: 'DEPOSIT' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.depositPolicies?.add(newPolicy)) {
        setDepositPolicies(dataStore.depositPolicies.getAll());
        addNotification('booking', `New deposit policy "${newPolicy.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save deposit policy');
    } catch (error) {
      console.error('Error saving deposit policy:', error);
      addNotification('booking', 'Error creating deposit policy. Please try again.');
      return false;
    }
  };

  const handleDepositPolicyUpdate = (policyData: Omit<DepositPolicy, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedPolicy: DepositPolicy = { 
        ...policyData, 
        id: 'DEPOSIT' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.depositPolicies?.add(updatedPolicy)) {
        setDepositPolicies(dataStore.depositPolicies.getAll());
        addNotification('booking', `Deposit policy "${policyData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update deposit policy');
    } catch (error) {
      console.error('Error updating deposit policy:', error);
      addNotification('booking', 'Error updating deposit policy. Please try again.');
      return false;
    }
  };

  const handleDepositPolicyDelete = (policyId: string) => {
    try {
      const policy = depositPolicies.find(p => p.id === policyId);
      if (policy && dataStore.depositPolicies?.delete(policyId)) {
        setDepositPolicies(dataStore.depositPolicies.getAll());
        addNotification('booking', `Deposit policy "${policy.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting deposit policy:', error);
      addNotification('booking', 'Error deleting deposit policy. Please try again.');
    }
  };

  // Payment Terms operations
  const handlePaymentTermsSave = (termsData: Omit<PaymentTerms, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTerms: PaymentTerms = { 
        ...termsData, 
        id: 'PAYMENT' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.paymentTerms?.add(newTerms)) {
        setPaymentTerms(dataStore.paymentTerms.getAll());
        addNotification('booking', `New payment terms "${newTerms.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save payment terms');
    } catch (error) {
      console.error('Error saving payment terms:', error);
      addNotification('booking', 'Error creating payment terms. Please try again.');
      return false;
    }
  };

  const handlePaymentTermsUpdate = (termsData: Omit<PaymentTerms, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedTerms: PaymentTerms = { 
        ...termsData, 
        id: 'PAYMENT' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.paymentTerms?.add(updatedTerms)) {
        setPaymentTerms(dataStore.paymentTerms.getAll());
        addNotification('booking', `Payment terms "${termsData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update payment terms');
    } catch (error) {
      console.error('Error updating payment terms:', error);
      addNotification('booking', 'Error updating payment terms. Please try again.');
      return false;
    }
  };

  const handlePaymentTermsDelete = (termsId: string) => {
    try {
      const terms = paymentTerms.find(t => t.id === termsId);
      if (terms && dataStore.paymentTerms?.delete(termsId)) {
        setPaymentTerms(dataStore.paymentTerms.getAll());
        addNotification('booking', `Payment terms "${terms.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting payment terms:', error);
      addNotification('booking', 'Error deleting payment terms. Please try again.');
    }
  };

  // Refund Request operations
  const handleProcessRefundRequest = (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const request = refundRequests.find(r => r.id === requestId);
      if (request) {
        const updatedRequest = {
          ...request,
          status: (action === 'approve' ? 'approved' : 'rejected') as 'approved' | 'rejected',
          processedBy: currentUser?.id || 'system',
          processedAt: new Date().toISOString(),
          notes: notes || ''
        };
        
        if (dataStore.refundRequests?.update(requestId, updatedRequest)) {
          setRefundRequests(dataStore.refundRequests.getAll());
          addNotification('booking', `Refund request ${action === 'approve' ? 'approved' : 'rejected'}`);
        }
      }
    } catch (error) {
      console.error('Error processing refund request:', error);
      addNotification('booking', 'Error processing refund request. Please try again.');
    }
  };

  // Email Template operations
  const handleEmailTemplateSave = (templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTemplate: EmailTemplate = { 
        ...templateData, 
        id: 'EMAIL' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.emailTemplates?.add(newTemplate)) {
        setEmailTemplates(dataStore.emailTemplates.getAll());
        addNotification('booking', `New email template "${newTemplate.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save email template');
    } catch (error) {
      console.error('Error saving email template:', error);
      addNotification('booking', 'Error creating email template. Please try again.');
      return false;
    }
  };

  const handleEmailTemplateUpdate = (templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedTemplate: EmailTemplate = { 
        ...templateData, 
        id: 'EMAIL' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.emailTemplates?.add(updatedTemplate)) {
        setEmailTemplates(dataStore.emailTemplates.getAll());
        addNotification('booking', `Email template "${templateData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update email template');
    } catch (error) {
      console.error('Error updating email template:', error);
      addNotification('booking', 'Error updating email template. Please try again.');
      return false;
    }
  };

  const handleEmailTemplateDelete = (templateId: string) => {
    try {
      const template = emailTemplates.find(t => t.id === templateId);
      if (template && dataStore.emailTemplates?.delete(templateId)) {
        setEmailTemplates(dataStore.emailTemplates.getAll());
        addNotification('booking', `Email template "${template.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting email template:', error);
      addNotification('booking', 'Error deleting email template. Please try again.');
    }
  };

  // SMS Message operations
  const handleSendSMS = (messageData: Omit<SMSMessage, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newMessage: SMSMessage = { 
        ...messageData, 
        id: 'SMS' + Date.now().toString(),
        status: 'sent',
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.smsMessages?.add(newMessage)) {
        setSmsMessages(dataStore.smsMessages.getAll());
        addNotification('booking', `SMS sent to ${messageData.recipient}`);
        return true;
      }
      throw new Error('Failed to send SMS');
    } catch (error) {
      console.error('Error sending SMS:', error);
      addNotification('booking', 'Error sending SMS. Please try again.');
      return false;
    }
  };

  // Notification Rule operations
  const handleNotificationRuleSave = (ruleData: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRule: NotificationRule = { 
        ...ruleData, 
        id: 'RULE' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.notificationRules?.add(newRule)) {
        setNotificationRules(dataStore.notificationRules.getAll());
        addNotification('booking', `New notification rule "${newRule.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save notification rule');
    } catch (error) {
      console.error('Error saving notification rule:', error);
      addNotification('booking', 'Error creating notification rule. Please try again.');
      return false;
    }
  };

  const handleNotificationRuleUpdate = (ruleData: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedRule: NotificationRule = { 
        ...ruleData, 
        id: 'RULE' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.notificationRules?.add(updatedRule)) {
        setNotificationRules(dataStore.notificationRules.getAll());
        addNotification('booking', `Notification rule "${ruleData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update notification rule');
    } catch (error) {
      console.error('Error updating notification rule:', error);
      addNotification('booking', 'Error updating notification rule. Please try again.');
      return false;
    }
  };

  const handleNotificationRuleDelete = (ruleId: string) => {
    try {
      const rule = notificationRules.find(r => r.id === ruleId);
      if (rule && dataStore.notificationRules?.delete(ruleId)) {
        setNotificationRules(dataStore.notificationRules.getAll());
        addNotification('booking', `Notification rule "${rule.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting notification rule:', error);
      addNotification('booking', 'Error deleting notification rule. Please try again.');
    }
  };

  // Marketing Campaign operations
  const handleMarketingCampaignSave = (campaignData: Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCampaign: MarketingCampaign = { 
        ...campaignData, 
        id: 'CAMPAIGN' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.marketingCampaigns?.add(newCampaign)) {
        setMarketingCampaigns(dataStore.marketingCampaigns.getAll());
        addNotification('booking', `New marketing campaign "${newCampaign.name}" has been added`);
        return true;
      }
      throw new Error('Failed to save marketing campaign');
    } catch (error) {
      console.error('Error saving marketing campaign:', error);
      addNotification('booking', 'Error creating marketing campaign. Please try again.');
      return false;
    }
  };

  const handleMarketingCampaignUpdate = (campaignData: Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedCampaign: MarketingCampaign = { 
        ...campaignData, 
        id: 'CAMPAIGN' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.marketingCampaigns?.add(updatedCampaign)) {
        setMarketingCampaigns(dataStore.marketingCampaigns.getAll());
        addNotification('booking', `Marketing campaign "${campaignData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update marketing campaign');
    } catch (error) {
      console.error('Error updating marketing campaign:', error);
      addNotification('booking', 'Error updating marketing campaign. Please try again.');
      return false;
    }
  };

  const handleMarketingCampaignDelete = (campaignId: string) => {
    try {
      const campaign = marketingCampaigns.find(c => c.id === campaignId);
      if (campaign && dataStore.marketingCampaigns?.delete(campaignId)) {
        setMarketingCampaigns(dataStore.marketingCampaigns.getAll());
        addNotification('booking', `Marketing campaign "${campaign.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting marketing campaign:', error);
      addNotification('booking', 'Error deleting marketing campaign. Please try again.');
    }
  };

  const handleSendCampaign = (campaignId: string) => {
    try {
      const campaign = marketingCampaigns.find(c => c.id === campaignId);
      if (campaign) {
        const updatedCampaign = {
          ...campaign,
          status: 'sent' as const,
          sentAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        if (dataStore.marketingCampaigns?.update(campaignId, updatedCampaign)) {
          setMarketingCampaigns(dataStore.marketingCampaigns.getAll());
          addNotification('booking', `Marketing campaign "${campaign.name}" has been sent`);
        }
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      addNotification('booking', 'Error sending campaign. Please try again.');
    }
  };

  // Manifest operations
  const handleManifestSave = (manifestData: Omit<TourManifest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newManifest: TourManifest = { 
        ...manifestData, 
        id: 'MANIFEST' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.manifests?.add(newManifest)) {
        setManifests(dataStore.manifests.getAll());
        addNotification('booking', `New manifest for "${newManifest.tourName}" has been created`);
        return true;
      }
      throw new Error('Failed to save manifest');
    } catch (error) {
      console.error('Error saving manifest:', error);
      addNotification('booking', 'Error creating manifest. Please try again.');
      return false;
    }
  };

  const handleManifestUpdate = (manifestData: Omit<TourManifest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedManifest: TourManifest = { 
        ...manifestData, 
        id: 'MANIFEST' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.manifests?.add(updatedManifest)) {
        setManifests(dataStore.manifests.getAll());
        addNotification('booking', `Manifest for "${manifestData.tourName}" has been updated`);
        return true;
      }
      throw new Error('Failed to update manifest');
    } catch (error) {
      console.error('Error updating manifest:', error);
      addNotification('booking', 'Error updating manifest. Please try again.');
      return false;
    }
  };

  const handleManifestDelete = (manifestId: string) => {
    try {
      const manifest = manifests.find(m => m.id === manifestId);
      if (manifest && dataStore.manifests?.delete(manifestId)) {
        setManifests(dataStore.manifests.getAll());
        addNotification('booking', `Manifest for "${manifest.tourName}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting manifest:', error);
      addNotification('booking', 'Error deleting manifest. Please try again.');
    }
  };

  // Daily Operations operations
  const handleDailyOperationsSave = (operationsData: Omit<DailyOperations, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newOperations: DailyOperations = { 
        ...operationsData, 
        id: 'OPS' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.dailyOperations?.add(newOperations)) {
        setDailyOperations(dataStore.dailyOperations.getAll());
        addNotification('booking', `Daily operations for ${newOperations.date} has been created`);
        return true;
      }
      throw new Error('Failed to save daily operations');
    } catch (error) {
      console.error('Error saving daily operations:', error);
      addNotification('booking', 'Error creating daily operations. Please try again.');
      return false;
    }
  };

  const handleDailyOperationsUpdate = (operationsData: Omit<DailyOperations, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedOperations: DailyOperations = { 
        ...operationsData, 
        id: 'OPS' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.dailyOperations?.add(updatedOperations)) {
        setDailyOperations(dataStore.dailyOperations.getAll());
        addNotification('booking', `Daily operations for ${operationsData.date} has been updated`);
        return true;
      }
      throw new Error('Failed to update daily operations');
    } catch (error) {
      console.error('Error updating daily operations:', error);
      addNotification('booking', 'Error updating daily operations. Please try again.');
      return false;
    }
  };

  const handleDailyOperationsDelete = (operationsId: string) => {
    try {
      const operations = dailyOperations.find(o => o.id === operationsId);
      if (operations && dataStore.dailyOperations?.delete(operationsId)) {
        setDailyOperations(dataStore.dailyOperations.getAll());
        addNotification('booking', `Daily operations for ${operations.date} has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting daily operations:', error);
      addNotification('booking', 'Error deleting daily operations. Please try again.');
    }
  };

  // Vehicle Preparation operations
  const handleVehiclePreparationSave = (preparationData: Omit<VehiclePreparation, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPreparation: VehiclePreparation = { 
        ...preparationData, 
        id: 'PREP' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.vehiclePreparations?.add(newPreparation)) {
        setVehiclePreparations(dataStore.vehiclePreparations.getAll());
        addNotification('booking', `Vehicle preparation for "${newPreparation.vehicleName}" has been scheduled`);
        return true;
      }
      throw new Error('Failed to save vehicle preparation');
    } catch (error) {
      console.error('Error saving vehicle preparation:', error);
      addNotification('booking', 'Error creating vehicle preparation. Please try again.');
      return false;
    }
  };

  const handleVehiclePreparationUpdate = (preparationData: Omit<VehiclePreparation, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedPreparation: VehiclePreparation = { 
        ...preparationData, 
        id: 'PREP' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.vehiclePreparations?.add(updatedPreparation)) {
        setVehiclePreparations(dataStore.vehiclePreparations.getAll());
        addNotification('booking', `Vehicle preparation for "${preparationData.vehicleName}" has been updated`);
        return true;
      }
      throw new Error('Failed to update vehicle preparation');
    } catch (error) {
      console.error('Error updating vehicle preparation:', error);
      addNotification('booking', 'Error updating vehicle preparation. Please try again.');
      return false;
    }
  };

  const handleVehiclePreparationDelete = (preparationId: string) => {
    try {
      const preparation = vehiclePreparations.find(p => p.id === preparationId);
      if (preparation && dataStore.vehiclePreparations?.delete(preparationId)) {
        setVehiclePreparations(dataStore.vehiclePreparations.getAll());
        addNotification('booking', `Vehicle preparation for "${preparation.vehicleName}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting vehicle preparation:', error);
      addNotification('booking', 'Error deleting vehicle preparation. Please try again.');
    }
  };

  // Customer Check-in operations
  const handleCheckInCustomer = (checkInData: Omit<CustomerCheckIn, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCheckIn: CustomerCheckIn = { 
        ...checkInData, 
        id: 'CHECKIN' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.customerCheckIns?.add(newCheckIn)) {
        setCustomerCheckIns(dataStore.customerCheckIns.getAll());
        addNotification('booking', `Customer "${newCheckIn.customerName}" has been checked in`);
        return true;
      }
      throw new Error('Failed to check in customer');
    } catch (error) {
      console.error('Error checking in customer:', error);
      addNotification('booking', 'Error checking in customer. Please try again.');
      return false;
    }
  };

  // Tour Departure operations
  const handleUpdateDeparture = (departureData: Omit<TourDeparture, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedDeparture: TourDeparture = { 
        ...departureData, 
        id: 'DEPARTURE' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.tourDepartures?.add(updatedDeparture)) {
        setTourDepartures(dataStore.tourDepartures.getAll());
        addNotification('booking', `Tour departure has been updated`);
        return true;
      }
      throw new Error('Failed to update departure');
    } catch (error) {
      console.error('Error updating departure:', error);
      addNotification('booking', 'Error updating departure. Please try again.');
      return false;
    }
  };

  // Daily Report operations
  const handleSaveDailyReport = (reportData: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newReport: DailyReport = { 
        ...reportData, 
        id: 'REPORT' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.dailyReports?.add(newReport)) {
        setDailyReports(dataStore.dailyReports.getAll());
        addNotification('booking', `Daily report for ${newReport.date} has been created`);
        return true;
      }
      throw new Error('Failed to save daily report');
    } catch (error) {
      console.error('Error saving daily report:', error);
      addNotification('booking', 'Error creating daily report. Please try again.');
      return false;
    }
  };

  // QR Ticket operations
  const handleQRTicketSave = (ticketData: Omit<QRTicket, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTicket: QRTicket = { 
        ...ticketData, 
        id: 'QR' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.qrTickets?.add(newTicket)) {
        setQrTickets(dataStore.qrTickets.getAll());
        addNotification('booking', `New QR ticket for "${newTicket.customerName}" has been created`);
        return true;
      }
      throw new Error('Failed to save QR ticket');
    } catch (error) {
      console.error('Error saving QR ticket:', error);
      addNotification('booking', 'Error creating QR ticket. Please try again.');
      return false;
    }
  };

  const handleQRTicketUpdate = (ticketData: Omit<QRTicket, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedTicket: QRTicket = { 
        ...ticketData, 
        id: 'QR' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.qrTickets?.add(updatedTicket)) {
        setQrTickets(dataStore.qrTickets.getAll());
        addNotification('booking', `QR ticket for "${ticketData.customerName}" has been updated`);
        return true;
      }
      throw new Error('Failed to update QR ticket');
    } catch (error) {
      console.error('Error updating QR ticket:', error);
      addNotification('booking', 'Error updating QR ticket. Please try again.');
      return false;
    }
  };

  const handleQRTicketDelete = (ticketId: string) => {
    try {
      const ticket = qrTickets.find(t => t.id === ticketId);
      if (ticket && dataStore.qrTickets?.delete(ticketId)) {
        setQrTickets(dataStore.qrTickets.getAll());
        addNotification('booking', `QR ticket for "${ticket.customerName}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting QR ticket:', error);
      addNotification('booking', 'Error deleting QR ticket. Please try again.');
    }
  };

  // Check-in Session operations
  const handleCheckInSessionSave = (sessionData: Omit<CheckInSession, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSession: CheckInSession = { 
        ...sessionData, 
        id: 'SESSION' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.checkInSessions?.add(newSession)) {
        setCheckInSessions(dataStore.checkInSessions.getAll());
        addNotification('booking', `New check-in session "${newSession.sessionName}" has been created`);
        return true;
      }
      throw new Error('Failed to save check-in session');
    } catch (error) {
      console.error('Error saving check-in session:', error);
      addNotification('booking', 'Error creating check-in session. Please try again.');
      return false;
    }
  };

  const handleCheckInSessionUpdate = (sessionData: Omit<CheckInSession, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedSession: CheckInSession = { 
        ...sessionData, 
        id: 'SESSION' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.checkInSessions?.add(updatedSession)) {
        setCheckInSessions(dataStore.checkInSessions.getAll());
        addNotification('booking', `Check-in session "${sessionData.sessionName}" has been updated`);
        return true;
      }
      throw new Error('Failed to update check-in session');
    } catch (error) {
      console.error('Error updating check-in session:', error);
      addNotification('booking', 'Error updating check-in session. Please try again.');
      return false;
    }
  };

  const handleCheckInSessionDelete = (sessionId: string) => {
    try {
      const session = checkInSessions.find(s => s.id === sessionId);
      if (session && dataStore.checkInSessions?.delete(sessionId)) {
        setCheckInSessions(dataStore.checkInSessions.getAll());
        addNotification('booking', `Check-in session "${session.sessionName}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting check-in session:', error);
      addNotification('booking', 'Error deleting check-in session. Please try again.');
    }
  };

  // Check-in Event operations
  const handleProcessCheckIn = (eventData: Omit<CheckInEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEvent: CheckInEvent = { 
        ...eventData, 
        id: 'EVENT' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.checkInEvents?.add(newEvent)) {
        setCheckInEvents(dataStore.checkInEvents.getAll());
        addNotification('booking', `Customer "${newEvent.customerName}" has been checked in`);
        return true;
      }
      throw new Error('Failed to process check-in');
    } catch (error) {
      console.error('Error processing check-in:', error);
      addNotification('booking', 'Error processing check-in. Please try again.');
      return false;
    }
  };

  // QR Code Configuration operations
  const handleQRConfigSave = (configData: Omit<QRCodeConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newConfig: QRCodeConfig = { 
        ...configData, 
        id: 'CONFIG' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.qrCodeConfigs?.add(newConfig)) {
        setQrCodeConfigs(dataStore.qrCodeConfigs.getAll());
        addNotification('booking', `New QR configuration "${newConfig.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save QR configuration');
    } catch (error) {
      console.error('Error saving QR configuration:', error);
      addNotification('booking', 'Error creating QR configuration. Please try again.');
      return false;
    }
  };

  const handleQRConfigUpdate = (configData: Omit<QRCodeConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedConfig: QRCodeConfig = { 
        ...configData, 
        id: 'CONFIG' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.qrCodeConfigs?.add(updatedConfig)) {
        setQrCodeConfigs(dataStore.qrCodeConfigs.getAll());
        addNotification('booking', `QR configuration "${configData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update QR configuration');
    } catch (error) {
      console.error('Error updating QR configuration:', error);
      addNotification('booking', 'Error updating QR configuration. Please try again.');
      return false;
    }
  };

  const handleQRConfigDelete = (configId: string) => {
    try {
      const config = qrCodeConfigs.find(c => c.id === configId);
      if (config && dataStore.qrCodeConfigs?.delete(configId)) {
        setQrCodeConfigs(dataStore.qrCodeConfigs.getAll());
        addNotification('booking', `QR configuration "${config.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting QR configuration:', error);
      addNotification('booking', 'Error deleting QR configuration. Please try again.');
    }
  };

  // QR Code operations
  const handleGenerateQRCode = (ticketId: string) => {
    try {
      const ticket = qrTickets.find(t => t.id === ticketId);
      if (ticket) {
        // In a real implementation, this would generate an actual QR code
        addNotification('booking', `QR code generated for ticket ${ticket.ticketNumber}`);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      addNotification('booking', 'Error generating QR code. Please try again.');
    }
  };

  const handleValidateQRCode = async (qrCode: string): Promise<QRTicket | null> => {
    try {
      // In a real implementation, this would validate the QR code and return the ticket
      const ticket = qrTickets.find(t => t.qrCode === qrCode);
      if (ticket) {
        addNotification('booking', `QR code validated for ${ticket.customerName}`);
        return ticket;
      }
      return null;
    } catch (error) {
      console.error('Error validating QR code:', error);
      addNotification('booking', 'Error validating QR code. Please try again.');
      return null;
    }
  };

  const handleSyncOfflineData = () => {
    try {
      // In a real implementation, this would sync offline data
      addNotification('booking', 'Offline data synchronized successfully');
    } catch (error) {
      console.error('Error syncing offline data:', error);
      addNotification('booking', 'Error syncing offline data. Please try again.');
    }
  };

  // Waiver operations
  const handleWaiverSave = (waiverData: Omit<Waiver, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newWaiver: Waiver = { 
        ...waiverData, 
        id: 'WAIVER' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.waivers?.add(newWaiver)) {
        setWaivers(dataStore.waivers.getAll());
        addNotification('booking', `New waiver "${newWaiver.title}" has been created`);
        return true;
      }
      throw new Error('Failed to save waiver');
    } catch (error) {
      console.error('Error saving waiver:', error);
      addNotification('booking', 'Error creating waiver. Please try again.');
      return false;
    }
  };

  const handleWaiverUpdate = (waiverData: Omit<Waiver, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedWaiver: Waiver = { 
        ...waiverData, 
        id: 'WAIVER' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.waivers?.add(updatedWaiver)) {
        setWaivers(dataStore.waivers.getAll());
        addNotification('booking', `Waiver "${waiverData.title}" has been updated`);
        return true;
      }
      throw new Error('Failed to update waiver');
    } catch (error) {
      console.error('Error updating waiver:', error);
      addNotification('booking', 'Error updating waiver. Please try again.');
      return false;
    }
  };

  const handleWaiverDelete = (waiverId: string) => {
    try {
      const waiver = waivers.find(w => w.id === waiverId);
      if (waiver && dataStore.waivers?.delete(waiverId)) {
        setWaivers(dataStore.waivers.getAll());
        addNotification('booking', `Waiver "${waiver.title}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting waiver:', error);
      addNotification('booking', 'Error deleting waiver. Please try again.');
    }
  };

  // Waiver Signature operations
  const handleWaiverSignatureSave = (signatureData: Omit<WaiverSignature, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSignature: WaiverSignature = { 
        ...signatureData, 
        id: 'SIG' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.waiverSignatures?.add(newSignature)) {
        setWaiverSignatures(dataStore.waiverSignatures.getAll());
        addNotification('booking', `Waiver signature for "${newSignature.customerName}" has been recorded`);
        return true;
      }
      throw new Error('Failed to save waiver signature');
    } catch (error) {
      console.error('Error saving waiver signature:', error);
      addNotification('booking', 'Error recording waiver signature. Please try again.');
      return false;
    }
  };

  const handleWaiverSignatureUpdate = (signatureData: Omit<WaiverSignature, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedSignature: WaiverSignature = { 
        ...signatureData, 
        id: 'SIG' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.waiverSignatures?.add(updatedSignature)) {
        setWaiverSignatures(dataStore.waiverSignatures.getAll());
        addNotification('booking', `Waiver signature for "${signatureData.customerName}" has been updated`);
        return true;
      }
      throw new Error('Failed to update waiver signature');
    } catch (error) {
      console.error('Error updating waiver signature:', error);
      addNotification('booking', 'Error updating waiver signature. Please try again.');
      return false;
    }
  };

  const handleWaiverSignatureDelete = (signatureId: string) => {
    try {
      const signature = waiverSignatures.find(s => s.id === signatureId);
      if (signature && dataStore.waiverSignatures?.delete(signatureId)) {
        setWaiverSignatures(dataStore.waiverSignatures.getAll());
        addNotification('booking', `Waiver signature for "${signature.customerName}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting waiver signature:', error);
      addNotification('booking', 'Error deleting waiver signature. Please try again.');
    }
  };

  // Waiver Template operations
  const handleWaiverTemplateSave = (templateData: Omit<WaiverTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTemplate: WaiverTemplate = { 
        ...templateData, 
        id: 'TEMPLATE' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.waiverTemplates?.add(newTemplate)) {
        setWaiverTemplates(dataStore.waiverTemplates.getAll());
        addNotification('booking', `New waiver template "${newTemplate.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save waiver template');
    } catch (error) {
      console.error('Error saving waiver template:', error);
      addNotification('booking', 'Error creating waiver template. Please try again.');
      return false;
    }
  };

  const handleWaiverTemplateUpdate = (templateData: Omit<WaiverTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedTemplate: WaiverTemplate = { 
        ...templateData, 
        id: 'TEMPLATE' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.waiverTemplates?.add(updatedTemplate)) {
        setWaiverTemplates(dataStore.waiverTemplates.getAll());
        addNotification('booking', `Waiver template "${templateData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update waiver template');
    } catch (error) {
      console.error('Error updating waiver template:', error);
      addNotification('booking', 'Error updating waiver template. Please try again.');
      return false;
    }
  };

  const handleWaiverTemplateDelete = (templateId: string) => {
    try {
      const template = waiverTemplates.find(t => t.id === templateId);
      if (template && dataStore.waiverTemplates?.delete(templateId)) {
        setWaiverTemplates(dataStore.waiverTemplates.getAll());
        addNotification('booking', `Waiver template "${template.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting waiver template:', error);
      addNotification('booking', 'Error deleting waiver template. Please try again.');
    }
  };

  // Compliance Report operations
  const handleGenerateComplianceReport = (reportData: Omit<ComplianceReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newReport: ComplianceReport = { 
        ...reportData, 
        id: 'REPORT' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.complianceReports?.add(newReport)) {
        setComplianceReports(dataStore.complianceReports.getAll());
        addNotification('booking', `Compliance report "${newReport.reportName}" has been generated`);
        return true;
      }
      throw new Error('Failed to generate compliance report');
    } catch (error) {
      console.error('Error generating compliance report:', error);
      addNotification('booking', 'Error generating compliance report. Please try again.');
      return false;
    }
  };

  // Waiver Workflow operations
  const handleWaiverWorkflowSave = (workflowData: Omit<WaiverWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newWorkflow: WaiverWorkflow = { 
        ...workflowData, 
        id: 'WORKFLOW' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.waiverWorkflows?.add(newWorkflow)) {
        setWaiverWorkflows(dataStore.waiverWorkflows.getAll());
        addNotification('booking', `New waiver workflow "${newWorkflow.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save waiver workflow');
    } catch (error) {
      console.error('Error saving waiver workflow:', error);
      addNotification('booking', 'Error creating waiver workflow. Please try again.');
      return false;
    }
  };

  const handleWaiverWorkflowUpdate = (workflowData: Omit<WaiverWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedWorkflow: WaiverWorkflow = { 
        ...workflowData, 
        id: 'WORKFLOW' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.waiverWorkflows?.add(updatedWorkflow)) {
        setWaiverWorkflows(dataStore.waiverWorkflows.getAll());
        addNotification('booking', `Waiver workflow "${workflowData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update waiver workflow');
    } catch (error) {
      console.error('Error updating waiver workflow:', error);
      addNotification('booking', 'Error updating waiver workflow. Please try again.');
      return false;
    }
  };

  const handleWaiverWorkflowDelete = (workflowId: string) => {
    try {
      const workflow = waiverWorkflows.find(w => w.id === workflowId);
      if (workflow && dataStore.waiverWorkflows?.delete(workflowId)) {
        setWaiverWorkflows(dataStore.waiverWorkflows.getAll());
        addNotification('booking', `Waiver workflow "${workflow.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting waiver workflow:', error);
      addNotification('booking', 'Error deleting waiver workflow. Please try again.');
    }
  };

  // Waiver Notification operations
  const handleSendWaiverNotification = (notificationData: Omit<WaiverNotification, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newNotification: WaiverNotification = { 
        ...notificationData, 
        id: 'NOTIF' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.waiverNotifications?.add(newNotification)) {
        setWaiverNotifications(dataStore.waiverNotifications.getAll());
        addNotification('booking', `Waiver notification "${newNotification.title}" has been sent`);
        return true;
      }
      throw new Error('Failed to send waiver notification');
    } catch (error) {
      console.error('Error sending waiver notification:', error);
      addNotification('booking', 'Error sending waiver notification. Please try again.');
      return false;
    }
  };

  // Promotion operations
  const handlePromotionSave = (promotionData: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPromotion: Promotion = { 
        ...promotionData, 
        id: 'PROMO' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.promotions?.add(newPromotion)) {
        setPromotions(dataStore.promotions.getAll());
        addNotification('booking', `New promotion "${newPromotion.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save promotion');
    } catch (error) {
      console.error('Error saving promotion:', error);
      addNotification('booking', 'Error creating promotion. Please try again.');
      return false;
    }
  };

  const handlePromotionUpdate = (promotionData: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedPromotion: Promotion = { 
        ...promotionData, 
        id: 'PROMO' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.promotions?.add(updatedPromotion)) {
        setPromotions(dataStore.promotions.getAll());
        addNotification('booking', `Promotion "${promotionData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update promotion');
    } catch (error) {
      console.error('Error updating promotion:', error);
      addNotification('booking', 'Error updating promotion. Please try again.');
      return false;
    }
  };

  const handlePromotionDelete = (promotionId: string) => {
    try {
      const promotion = promotions.find(p => p.id === promotionId);
      if (promotion && dataStore.promotions?.delete(promotionId)) {
        setPromotions(dataStore.promotions.getAll());
        addNotification('booking', `Promotion "${promotion.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
      addNotification('booking', 'Error deleting promotion. Please try again.');
    }
  };

  // Customer Segment operations
  const handleCustomerSegmentSave = (segmentData: Omit<CustomerSegment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSegment: CustomerSegment = { 
        ...segmentData, 
        id: 'SEG' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.customerSegments?.add(newSegment)) {
        setCustomerSegments(dataStore.customerSegments.getAll());
        addNotification('booking', `New customer segment "${newSegment.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save customer segment');
    } catch (error) {
      console.error('Error saving customer segment:', error);
      addNotification('booking', 'Error creating customer segment. Please try again.');
      return false;
    }
  };

  const handleCustomerSegmentUpdate = (segmentData: Omit<CustomerSegment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedSegment: CustomerSegment = { 
        ...segmentData, 
        id: 'SEG' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.customerSegments?.add(updatedSegment)) {
        setCustomerSegments(dataStore.customerSegments.getAll());
        addNotification('booking', `Customer segment "${segmentData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update customer segment');
    } catch (error) {
      console.error('Error updating customer segment:', error);
      addNotification('booking', 'Error updating customer segment. Please try again.');
      return false;
    }
  };

  const handleCustomerSegmentDelete = (segmentId: string) => {
    try {
      const segment = customerSegments.find(s => s.id === segmentId);
      if (segment && dataStore.customerSegments?.delete(segmentId)) {
        setCustomerSegments(dataStore.customerSegments.getAll());
        addNotification('booking', `Customer segment "${segment.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting customer segment:', error);
      addNotification('booking', 'Error deleting customer segment. Please try again.');
    }
  };

  // Campaign operations
  const handleCampaignSave = (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCampaign: Campaign = { 
        ...campaignData, 
        id: 'CAMP' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.campaigns?.add(newCampaign)) {
        setCampaigns(dataStore.campaigns.getAll());
        addNotification('booking', `New campaign "${newCampaign.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save campaign');
    } catch (error) {
      console.error('Error saving campaign:', error);
      addNotification('booking', 'Error creating campaign. Please try again.');
      return false;
    }
  };

  const handleCampaignUpdate = (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedCampaign: Campaign = { 
        ...campaignData, 
        id: 'CAMP' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.campaigns?.add(updatedCampaign)) {
        setCampaigns(dataStore.campaigns.getAll());
        addNotification('booking', `Campaign "${campaignData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update campaign');
    } catch (error) {
      console.error('Error updating campaign:', error);
      addNotification('booking', 'Error updating campaign. Please try again.');
      return false;
    }
  };

  const handleCampaignDelete = (campaignId: string) => {
    try {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (campaign && dataStore.campaigns?.delete(campaignId)) {
        setCampaigns(dataStore.campaigns.getAll());
        addNotification('booking', `Campaign "${campaign.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      addNotification('booking', 'Error deleting campaign. Please try again.');
    }
  };

  // Promotion Rule operations
  const handlePromotionRuleSave = (ruleData: Omit<PromotionRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRule: PromotionRule = { 
        ...ruleData, 
        id: 'RULE' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.promotionRules?.add(newRule)) {
        setPromotionRules(dataStore.promotionRules.getAll());
        addNotification('booking', `New promotion rule "${newRule.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save promotion rule');
    } catch (error) {
      console.error('Error saving promotion rule:', error);
      addNotification('booking', 'Error creating promotion rule. Please try again.');
      return false;
    }
  };

  const handlePromotionRuleUpdate = (ruleData: Omit<PromotionRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedRule: PromotionRule = { 
        ...ruleData, 
        id: 'RULE' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.promotionRules?.add(updatedRule)) {
        setPromotionRules(dataStore.promotionRules.getAll());
        addNotification('booking', `Promotion rule "${ruleData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update promotion rule');
    } catch (error) {
      console.error('Error updating promotion rule:', error);
      addNotification('booking', 'Error updating promotion rule. Please try again.');
      return false;
    }
  };

  const handlePromotionRuleDelete = (ruleId: string) => {
    try {
      const rule = promotionRules.find(r => r.id === ruleId);
      if (rule && dataStore.promotionRules?.delete(ruleId)) {
        setPromotionRules(dataStore.promotionRules.getAll());
        addNotification('booking', `Promotion rule "${rule.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting promotion rule:', error);
      addNotification('booking', 'Error deleting promotion rule. Please try again.');
    }
  };

  // Referral Program operations
  const handleReferralProgramSave = (programData: Omit<ReferralProgram, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProgram: ReferralProgram = { 
        ...programData, 
        id: 'REF' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.referralPrograms?.add(newProgram)) {
        setReferralPrograms(dataStore.referralPrograms.getAll());
        addNotification('booking', `New referral program "${newProgram.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save referral program');
    } catch (error) {
      console.error('Error saving referral program:', error);
      addNotification('booking', 'Error creating referral program. Please try again.');
      return false;
    }
  };

  const handleReferralProgramUpdate = (programData: Omit<ReferralProgram, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedProgram: ReferralProgram = { 
        ...programData, 
        id: 'REF' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.referralPrograms?.add(updatedProgram)) {
        setReferralPrograms(dataStore.referralPrograms.getAll());
        addNotification('booking', `Referral program "${programData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update referral program');
    } catch (error) {
      console.error('Error updating referral program:', error);
      addNotification('booking', 'Error updating referral program. Please try again.');
      return false;
    }
  };

  const handleReferralProgramDelete = (programId: string) => {
    try {
      const program = referralPrograms.find(p => p.id === programId);
      if (program && dataStore.referralPrograms?.delete(programId)) {
        setReferralPrograms(dataStore.referralPrograms.getAll());
        addNotification('booking', `Referral program "${program.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting referral program:', error);
      addNotification('booking', 'Error deleting referral program. Please try again.');
    }
  };

  // Loyalty Program operations
  const handleLoyaltyProgramSave = (programData: Omit<LoyaltyProgram, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProgram: LoyaltyProgram = { 
        ...programData, 
        id: 'LOYAL' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.loyaltyPrograms?.add(newProgram)) {
        setLoyaltyPrograms(dataStore.loyaltyPrograms.getAll());
        addNotification('booking', `New loyalty program "${newProgram.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save loyalty program');
    } catch (error) {
      console.error('Error saving loyalty program:', error);
      addNotification('booking', 'Error creating loyalty program. Please try again.');
      return false;
    }
  };

  const handleLoyaltyProgramUpdate = (programData: Omit<LoyaltyProgram, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedProgram: LoyaltyProgram = { 
        ...programData, 
        id: 'LOYAL' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.loyaltyPrograms?.add(updatedProgram)) {
        setLoyaltyPrograms(dataStore.loyaltyPrograms.getAll());
        addNotification('booking', `Loyalty program "${programData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update loyalty program');
    } catch (error) {
      console.error('Error updating loyalty program:', error);
      addNotification('booking', 'Error updating loyalty program. Please try again.');
      return false;
    }
  };

  const handleLoyaltyProgramDelete = (programId: string) => {
    try {
      const program = loyaltyPrograms.find(p => p.id === programId);
      if (program && dataStore.loyaltyPrograms?.delete(programId)) {
        setLoyaltyPrograms(dataStore.loyaltyPrograms.getAll());
        addNotification('booking', `Loyalty program "${program.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting loyalty program:', error);
      addNotification('booking', 'Error deleting loyalty program. Please try again.');
    }
  };

  // Agent operations
  const handleAgentSave = (agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newAgent: Agent = { 
        ...agentData, 
        id: 'AGENT' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.agents?.add(newAgent)) {
        setAgents(dataStore.agents.getAll());
        addNotification('booking', `New agent "${newAgent.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save agent');
    } catch (error) {
      console.error('Error saving agent:', error);
      addNotification('booking', 'Error creating agent. Please try again.');
      return false;
    }
  };

  const handleAgentUpdate = (agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedAgent: Agent = { 
        ...agentData, 
        id: 'AGENT' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.agents?.add(updatedAgent)) {
        setAgents(dataStore.agents.getAll());
        addNotification('booking', `Agent "${agentData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update agent');
    } catch (error) {
      console.error('Error updating agent:', error);
      addNotification('booking', 'Error updating agent. Please try again.');
      return false;
    }
  };

  const handleAgentDelete = (agentId: string) => {
    try {
      const agent = agents.find(a => a.id === agentId);
      if (agent && dataStore.agents?.delete(agentId)) {
        setAgents(dataStore.agents.getAll());
        addNotification('booking', `Agent "${agent.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      addNotification('booking', 'Error deleting agent. Please try again.');
    }
  };

  // Territory operations
  const handleTerritorySave = (territoryData: Omit<Territory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTerritory: Territory = { 
        ...territoryData, 
        id: 'TERR' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.territories?.add(newTerritory)) {
        setTerritories(dataStore.territories.getAll());
        addNotification('booking', `New territory "${newTerritory.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save territory');
    } catch (error) {
      console.error('Error saving territory:', error);
      addNotification('booking', 'Error creating territory. Please try again.');
      return false;
    }
  };

  const handleTerritoryUpdate = (territoryData: Omit<Territory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedTerritory: Territory = { 
        ...territoryData, 
        id: 'TERR' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.territories?.add(updatedTerritory)) {
        setTerritories(dataStore.territories.getAll());
        addNotification('booking', `Territory "${territoryData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update territory');
    } catch (error) {
      console.error('Error updating territory:', error);
      addNotification('booking', 'Error updating territory. Please try again.');
      return false;
    }
  };

  const handleTerritoryDelete = (territoryId: string) => {
    try {
      const territory = territories.find(t => t.id === territoryId);
      if (territory && dataStore.territories?.delete(territoryId)) {
        setTerritories(dataStore.territories.getAll());
        addNotification('booking', `Territory "${territory.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting territory:', error);
      addNotification('booking', 'Error deleting territory. Please try again.');
    }
  };

  // Commission Structure operations
  const handleCommissionStructureSave = (structureData: Omit<CommissionStructure, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newStructure: CommissionStructure = { 
        ...structureData, 
        id: 'COMM' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.commissionStructures?.add(newStructure)) {
        setCommissionStructures(dataStore.commissionStructures.getAll());
        addNotification('booking', `New commission structure "${newStructure.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save commission structure');
    } catch (error) {
      console.error('Error saving commission structure:', error);
      addNotification('booking', 'Error creating commission structure. Please try again.');
      return false;
    }
  };

  const handleCommissionStructureUpdate = (structureData: Omit<CommissionStructure, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedStructure: CommissionStructure = { 
        ...structureData, 
        id: 'COMM' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.commissionStructures?.add(updatedStructure)) {
        setCommissionStructures(dataStore.commissionStructures.getAll());
        addNotification('booking', `Commission structure "${structureData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update commission structure');
    } catch (error) {
      console.error('Error updating commission structure:', error);
      addNotification('booking', 'Error updating commission structure. Please try again.');
      return false;
    }
  };

  const handleCommissionStructureDelete = (structureId: string) => {
    try {
      const structure = commissionStructures.find(s => s.id === structureId);
      if (structure && dataStore.commissionStructures?.delete(structureId)) {
        setCommissionStructures(dataStore.commissionStructures.getAll());
        addNotification('booking', `Commission structure "${structure.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting commission structure:', error);
      addNotification('booking', 'Error deleting commission structure. Please try again.');
    }
  };

  // Lead operations
  const handleLeadSave = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newLead: Lead = { 
        ...leadData, 
        id: 'LEAD' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.leads?.add(newLead)) {
        setLeads(dataStore.leads.getAll());
        addNotification('booking', `New lead "${newLead.title}" has been created`);
        return true;
      }
      throw new Error('Failed to save lead');
    } catch (error) {
      console.error('Error saving lead:', error);
      addNotification('booking', 'Error creating lead. Please try again.');
      return false;
    }
  };

  const handleLeadUpdate = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedLead: Lead = { 
        ...leadData, 
        id: 'LEAD' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.leads?.add(updatedLead)) {
        setLeads(dataStore.leads.getAll());
        addNotification('booking', `Lead "${leadData.title}" has been updated`);
        return true;
      }
      throw new Error('Failed to update lead');
    } catch (error) {
      console.error('Error updating lead:', error);
      addNotification('booking', 'Error updating lead. Please try again.');
      return false;
    }
  };

  const handleLeadDelete = (leadId: string) => {
    try {
      const lead = leads.find(l => l.id === leadId);
      if (lead && dataStore.leads?.delete(leadId)) {
        setLeads(dataStore.leads.getAll());
        addNotification('booking', `Lead "${lead.title}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      addNotification('booking', 'Error deleting lead. Please try again.');
    }
  };

  // Agent Report operations
  const handleGenerateAgentReport = (reportData: Omit<AgentReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newReport: AgentReport = { 
        ...reportData, 
        id: 'REPORT' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.agentReports?.add(newReport)) {
        setAgentReports(dataStore.agentReports.getAll());
        addNotification('booking', `Agent report has been generated`);
        return true;
      }
      throw new Error('Failed to generate agent report');
    } catch (error) {
      console.error('Error generating agent report:', error);
      addNotification('booking', 'Error generating agent report. Please try again.');
      return false;
    }
  };

  // Agent Training operations
  const handleAgentTrainingSave = (trainingData: Omit<AgentTraining, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTraining: AgentTraining = { 
        ...trainingData, 
        id: 'TRAIN' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.agentTrainings?.add(newTraining)) {
        setAgentTrainings(dataStore.agentTrainings.getAll());
        addNotification('booking', `New training "${newTraining.title}" has been created`);
        return true;
      }
      throw new Error('Failed to save agent training');
    } catch (error) {
      console.error('Error saving agent training:', error);
      addNotification('booking', 'Error creating agent training. Please try again.');
      return false;
    }
  };

  const handleAgentTrainingUpdate = (trainingData: Omit<AgentTraining, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedTraining: AgentTraining = { 
        ...trainingData, 
        id: 'TRAIN' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.agentTrainings?.add(updatedTraining)) {
        setAgentTrainings(dataStore.agentTrainings.getAll());
        addNotification('booking', `Training "${trainingData.title}" has been updated`);
        return true;
      }
      throw new Error('Failed to update agent training');
    } catch (error) {
      console.error('Error updating agent training:', error);
      addNotification('booking', 'Error updating agent training. Please try again.');
      return false;
    }
  };

  const handleAgentTrainingDelete = (trainingId: string) => {
    try {
      const training = agentTrainings.find(t => t.id === trainingId);
      if (training && dataStore.agentTrainings?.delete(trainingId)) {
        setAgentTrainings(dataStore.agentTrainings.getAll());
        addNotification('booking', `Training "${training.title}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting agent training:', error);
      addNotification('booking', 'Error deleting agent training. Please try again.');
    }
  };

  // Reports operations
  const handleReportSave = (reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newReport: Report = { 
        ...reportData, 
        id: 'REPORT' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.reports?.add(newReport)) {
        setReports(dataStore.reports.getAll());
        addNotification('booking', `New report "${newReport.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save report');
    } catch (error) {
      console.error('Error saving report:', error);
      addNotification('booking', 'Error creating report. Please try again.');
      return false;
    }
  };

  const handleReportUpdate = (reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedReport: Report = { 
        ...reportData, 
        id: 'REPORT' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.reports?.add(updatedReport)) {
        setReports(dataStore.reports.getAll());
        addNotification('booking', `Report "${reportData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update report');
    } catch (error) {
      console.error('Error updating report:', error);
      addNotification('booking', 'Error updating report. Please try again.');
      return false;
    }
  };

  const handleReportDelete = (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (report && dataStore.reports?.delete(reportId)) {
        setReports(dataStore.reports.getAll());
        addNotification('booking', `Report "${report.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      addNotification('booking', 'Error deleting report. Please try again.');
    }
  };

  // Report Template operations
  const handleReportTemplateSave = (templateData: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTemplate: ReportTemplate = { 
        ...templateData, 
        id: 'TEMPLATE' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.reportTemplates?.add(newTemplate)) {
        setReportTemplates(dataStore.reportTemplates.getAll());
        addNotification('booking', `New template "${newTemplate.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save report template');
    } catch (error) {
      console.error('Error saving report template:', error);
      addNotification('booking', 'Error creating report template. Please try again.');
      return false;
    }
  };

  const handleReportTemplateUpdate = (templateData: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedTemplate: ReportTemplate = { 
        ...templateData, 
        id: 'TEMPLATE' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.reportTemplates?.add(updatedTemplate)) {
        setReportTemplates(dataStore.reportTemplates.getAll());
        addNotification('booking', `Template "${templateData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update report template');
    } catch (error) {
      console.error('Error updating report template:', error);
      addNotification('booking', 'Error updating report template. Please try again.');
      return false;
    }
  };

  const handleReportTemplateDelete = (templateId: string) => {
    try {
      const template = reportTemplates.find(t => t.id === templateId);
      if (template && dataStore.reportTemplates?.delete(templateId)) {
        setReportTemplates(dataStore.reportTemplates.getAll());
        addNotification('booking', `Template "${template.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting report template:', error);
      addNotification('booking', 'Error deleting report template. Please try again.');
    }
  };

  // Dashboard operations
  const handleDashboardSave = (dashboardData: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newDashboard: Dashboard = { 
        ...dashboardData, 
        id: 'DASH' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.dashboards?.add(newDashboard)) {
        setDashboards(dataStore.dashboards.getAll());
        addNotification('booking', `New dashboard "${newDashboard.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save dashboard');
    } catch (error) {
      console.error('Error saving dashboard:', error);
      addNotification('booking', 'Error creating dashboard. Please try again.');
      return false;
    }
  };

  const handleDashboardUpdate = (dashboardData: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedDashboard: Dashboard = { 
        ...dashboardData, 
        id: 'DASH' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.dashboards?.add(updatedDashboard)) {
        setDashboards(dataStore.dashboards.getAll());
        addNotification('booking', `Dashboard "${dashboardData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update dashboard');
    } catch (error) {
      console.error('Error updating dashboard:', error);
      addNotification('booking', 'Error updating dashboard. Please try again.');
      return false;
    }
  };

  const handleDashboardDelete = (dashboardId: string) => {
    try {
      const dashboard = dashboards.find(d => d.id === dashboardId);
      if (dashboard && dataStore.dashboards?.delete(dashboardId)) {
        setDashboards(dataStore.dashboards.getAll());
        addNotification('booking', `Dashboard "${dashboard.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      addNotification('booking', 'Error deleting dashboard. Please try again.');
    }
  };

  // Analytics operations
  const handleAnalyticsSave = (analyticsData: Omit<Analytics, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newAnalytics: Analytics = { 
        ...analyticsData, 
        id: 'ANALYTICS' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.analytics?.add(newAnalytics)) {
        setAnalytics(dataStore.analytics.getAll());
        addNotification('booking', `New analytics "${newAnalytics.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save analytics');
    } catch (error) {
      console.error('Error saving analytics:', error);
      addNotification('booking', 'Error creating analytics. Please try again.');
      return false;
    }
  };

  const handleAnalyticsUpdate = (analyticsData: Omit<Analytics, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedAnalytics: Analytics = { 
        ...analyticsData, 
        id: 'ANALYTICS' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.analytics?.add(updatedAnalytics)) {
        setAnalytics(dataStore.analytics.getAll());
        addNotification('booking', `Analytics "${analyticsData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update analytics');
    } catch (error) {
      console.error('Error updating analytics:', error);
      addNotification('booking', 'Error updating analytics. Please try again.');
      return false;
    }
  };

  const handleAnalyticsDelete = (analyticsId: string) => {
    try {
      const analyticsItem = analytics.find(a => a.id === analyticsId);
      if (analyticsItem && dataStore.analytics?.delete(analyticsId)) {
        setAnalytics(dataStore.analytics.getAll());
        addNotification('booking', `Analytics "${analyticsItem.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting analytics:', error);
      addNotification('booking', 'Error deleting analytics. Please try again.');
    }
  };

  // Report execution operations
  const handleExecuteReport = (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (report) {
        addNotification('booking', `Report "${report.name}" is being executed`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error executing report:', error);
      addNotification('booking', 'Error executing report. Please try again.');
      return false;
    }
  };

  const handleExportReport = (reportId: string, format: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (report) {
        addNotification('booking', `Report "${report.name}" is being exported as ${format.toUpperCase()}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error exporting report:', error);
      addNotification('booking', 'Error exporting report. Please try again.');
      return false;
    }
  };

  const handleShareReport = (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (report) {
        addNotification('booking', `Report "${report.name}" sharing link has been generated`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sharing report:', error);
      addNotification('booking', 'Error sharing report. Please try again.');
      return false;
    }
  };

  // Integration operations
  const handleIntegrationSave = (integrationData: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newIntegration: Integration = { 
        ...integrationData, 
        id: 'INT' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.integrations?.add(newIntegration)) {
        setIntegrations(dataStore.integrations.getAll());
        addNotification('booking', `New integration "${newIntegration.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save integration');
    } catch (error) {
      console.error('Error saving integration:', error);
      addNotification('booking', 'Error creating integration. Please try again.');
      return false;
    }
  };

  const handleIntegrationUpdate = (integrationData: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedIntegration: Integration = { 
        ...integrationData, 
        id: 'INT' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.integrations?.add(updatedIntegration)) {
        setIntegrations(dataStore.integrations.getAll());
        addNotification('booking', `Integration "${integrationData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update integration');
    } catch (error) {
      console.error('Error updating integration:', error);
      addNotification('booking', 'Error updating integration. Please try again.');
      return false;
    }
  };

  const handleIntegrationDelete = (integrationId: string) => {
    try {
      const integration = integrations.find(i => i.id === integrationId);
      if (integration && dataStore.integrations?.delete(integrationId)) {
        setIntegrations(dataStore.integrations.getAll());
        addNotification('booking', `Integration "${integration.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting integration:', error);
      addNotification('booking', 'Error deleting integration. Please try again.');
    }
  };

  const handleTestIntegration = (integrationId: string) => {
    try {
      const integration = integrations.find(i => i.id === integrationId);
      if (integration) {
        addNotification('booking', `Testing integration "${integration.name}"...`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error testing integration:', error);
      addNotification('booking', 'Error testing integration. Please try again.');
      return false;
    }
  };

  const handleSyncIntegration = (integrationId: string) => {
    try {
      const integration = integrations.find(i => i.id === integrationId);
      if (integration) {
        addNotification('booking', `Syncing integration "${integration.name}"...`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error syncing integration:', error);
      addNotification('booking', 'Error syncing integration. Please try again.');
      return false;
    }
  };

  const handleToggleIntegration = (integrationId: string) => {
    try {
      const integration = integrations.find(i => i.id === integrationId);
      if (integration && dataStore.integrations?.update(integrationId, { isActive: !integration.isActive })) {
        setIntegrations(dataStore.integrations.getAll());
        addNotification('booking', `Integration "${integration.name}" has been ${integration.isActive ? 'deactivated' : 'activated'}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error toggling integration:', error);
      addNotification('booking', 'Error toggling integration. Please try again.');
      return false;
    }
  };

  // Webhook operations
  const handleWebhookSave = (webhookData: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newWebhook: WebhookConfig = { 
        ...webhookData, 
        id: 'WEBHOOK' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.webhookConfigs?.add(newWebhook)) {
        setWebhookConfigs(dataStore.webhookConfigs.getAll());
        addNotification('booking', `New webhook "${newWebhook.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save webhook');
    } catch (error) {
      console.error('Error saving webhook:', error);
      addNotification('booking', 'Error creating webhook. Please try again.');
      return false;
    }
  };

  const handleWebhookUpdate = (webhookData: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedWebhook: WebhookConfig = { 
        ...webhookData, 
        id: 'WEBHOOK' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.webhookConfigs?.add(updatedWebhook)) {
        setWebhookConfigs(dataStore.webhookConfigs.getAll());
        addNotification('booking', `Webhook "${webhookData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update webhook');
    } catch (error) {
      console.error('Error updating webhook:', error);
      addNotification('booking', 'Error updating webhook. Please try again.');
      return false;
    }
  };

  const handleWebhookDelete = (webhookId: string) => {
    try {
      const webhook = webhookConfigs.find(w => w.id === webhookId);
      if (webhook && dataStore.webhookConfigs?.delete(webhookId)) {
        setWebhookConfigs(dataStore.webhookConfigs.getAll());
        addNotification('booking', `Webhook "${webhook.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
      addNotification('booking', 'Error deleting webhook. Please try again.');
    }
  };

  // Integration Test operations
  const handleTestSave = (testData: Omit<IntegrationTest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTest: IntegrationTest = { 
        ...testData, 
        id: 'TEST' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.integrationTests?.add(newTest)) {
        setIntegrationTests(dataStore.integrationTests.getAll());
        addNotification('booking', `New test "${newTest.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save test');
    } catch (error) {
      console.error('Error saving test:', error);
      addNotification('booking', 'Error creating test. Please try again.');
      return false;
    }
  };

  const handleTestUpdate = (testData: Omit<IntegrationTest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedTest: IntegrationTest = { 
        ...testData, 
        id: 'TEST' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.integrationTests?.add(updatedTest)) {
        setIntegrationTests(dataStore.integrationTests.getAll());
        addNotification('booking', `Test "${testData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update test');
    } catch (error) {
      console.error('Error updating test:', error);
      addNotification('booking', 'Error updating test. Please try again.');
      return false;
    }
  };

  const handleTestDelete = (testId: string) => {
    try {
      const test = integrationTests.find(t => t.id === testId);
      if (test && dataStore.integrationTests?.delete(testId)) {
        setIntegrationTests(dataStore.integrationTests.getAll());
        addNotification('booking', `Test "${test.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      addNotification('booking', 'Error deleting test. Please try again.');
    }
  };

  const handleRunTest = (testId: string) => {
    try {
      const test = integrationTests.find(t => t.id === testId);
      if (test) {
        addNotification('booking', `Running test "${test.name}"...`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error running test:', error);
      addNotification('booking', 'Error running test. Please try again.');
      return false;
    }
  };

  // Integration Monitor operations
  const handleMonitorSave = (monitorData: Omit<IntegrationMonitor, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newMonitor: IntegrationMonitor = { 
        ...monitorData, 
        id: 'MONITOR' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.integrationMonitors?.add(newMonitor)) {
        setIntegrationMonitors(dataStore.integrationMonitors.getAll());
        addNotification('booking', `New monitor "${newMonitor.name}" has been created`);
        return true;
      }
      throw new Error('Failed to save monitor');
    } catch (error) {
      console.error('Error saving monitor:', error);
      addNotification('booking', 'Error creating monitor. Please try again.');
      return false;
    }
  };

  const handleMonitorUpdate = (monitorData: Omit<IntegrationMonitor, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const updatedMonitor: IntegrationMonitor = { 
        ...monitorData, 
        id: 'MONITOR' + Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (dataStore.integrationMonitors?.add(updatedMonitor)) {
        setIntegrationMonitors(dataStore.integrationMonitors.getAll());
        addNotification('booking', `Monitor "${monitorData.name}" has been updated`);
        return true;
      }
      throw new Error('Failed to update monitor');
    } catch (error) {
      console.error('Error updating monitor:', error);
      addNotification('booking', 'Error updating monitor. Please try again.');
      return false;
    }
  };

  const handleMonitorDelete = (monitorId: string) => {
    try {
      const monitor = integrationMonitors.find(m => m.id === monitorId);
      if (monitor && dataStore.integrationMonitors?.delete(monitorId)) {
        setIntegrationMonitors(dataStore.integrationMonitors.getAll());
        addNotification('booking', `Monitor "${monitor.name}" has been deleted`);
      }
    } catch (error) {
      console.error('Error deleting monitor:', error);
      addNotification('booking', 'Error deleting monitor. Please try again.');
    }
  };

  // Integration Alert operations
  const handleAcknowledgeAlert = (alertId: string) => {
    try {
      if (dataStore.integrationAlerts?.update(alertId, { status: 'acknowledged', acknowledgedAt: new Date().toISOString() })) {
        setIntegrationAlerts(dataStore.integrationAlerts.getAll());
        addNotification('booking', 'Alert has been acknowledged');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      addNotification('booking', 'Error acknowledging alert. Please try again.');
      return false;
    }
  };

  const handleResolveAlert = (alertId: string) => {
    try {
      if (dataStore.integrationAlerts?.update(alertId, { status: 'resolved', resolvedAt: new Date().toISOString() })) {
        setIntegrationAlerts(dataStore.integrationAlerts.getAll());
        addNotification('booking', 'Alert has been resolved');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resolving alert:', error);
      addNotification('booking', 'Error resolving alert. Please try again.');
      return false;
    }
  };

  // Create customer for booking modal
  const handleCreateCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
    try {
      const newCustomer: Customer = { ...customerData, id: 'CU' + Date.now().toString() };
      if (dataStore.customers.add(newCustomer)) {
        setCustomers(dataStore.customers.getAll());
        addNotification('customer', `New customer "${newCustomer.name}" has been added`);
        return newCustomer;
      }
      throw new Error('Failed to create customer');
    } catch (error) {
      console.error('Error creating customer:', error);
      addNotification('customer', 'Error creating customer. Please try again.');
      throw error;
    }
  };

  const handleBookingUpdate = (bookingData: Omit<Booking, 'id'>) => {
    try {
      if (bookingModal.booking && dataStore.bookings.update(bookingModal.booking.id, bookingData)) {
        setBookings(dataStore.bookings.getAll());
        addNotification('booking', `Booking for "${bookingData.customerName}" has been updated`);
        return true;
      }
      throw new Error('Failed to update booking');
    } catch (error) {
      console.error('Error updating booking:', error);
      addNotification('booking', 'Error updating booking. Please try again.');
      return false;
    }
  };

  // Booking create with feature-flagged availability validation
  const handleBookingSave = (bookingData: Omit<Booking, 'id'>) => {
    try {
      // Availability validation (flagged): soft-block if over capacity
      if (isFeatureEnabled('FEATURE_RESOURCE_AVAILABILITY')) {
        const dateISO = new Date(bookingData.tourDate + 'T10:00:00').toISOString();
        const dateKey = dateISO.split('T')[0];
        const dayBookings = bookings.filter(b => new Date(b.tourDate).toISOString().split('T')[0] === dateKey);
        const allForDay = [...dayBookings, { ...bookingData, id: 'tmp' } as Booking];
        let participants = 0;
        let capacity = 0;
        for (const b of allForDay) {
          participants += b.participants || b.guests || 0;
          const tour = tours.find(t => t.name === b.tourName);
          if (tour?.maxCapacity) capacity += tour.maxCapacity;
        }
        if (capacity > 0) {
          const status = evaluateCapacity({ maxCapacity: capacity, bookedCount: participants });
          if (status === 'sold-out') {
            if (!window.confirm('Capacity looks full for this date. Proceed anyway?')) {
              return false;
            }
          }
        }
      }

      const newBooking: Booking = { ...bookingData, id: 'BK' + Date.now().toString() };
      console.log('Saving booking to dataStore:', newBooking);
      if (dataStore.bookings.add(newBooking)) {
        const updatedBookings = dataStore.bookings.getAll();
        console.log('Updated bookings list:', updatedBookings);
        setBookings(updatedBookings);
        addNotification('booking', `New booking for "${newBooking.customerName}" has been added`);
        return true;
      }
      throw new Error('Failed to save booking');
    } catch (error) {
      console.error('Error saving booking:', error);
      addNotification('booking', 'Error creating booking. Please try again.');
      return false;
    }
  };

  const handleBookingDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        if (dataStore.bookings.delete(id)) {
          setBookings(dataStore.bookings.getAll());
          addNotification('booking', 'Booking deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
        addNotification('booking', 'Error deleting booking. Please try again.');
      }
    }
  };

  // Export functions
  const exportBookingsCSV = () => {
    try {
      const csvContent = buildBookingsCSV(bookings, users, vehicles);
      const filename = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
      addNotification('booking', 'Bookings exported to CSV successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      addNotification('booking', 'Error exporting CSV. Please try again.');
    }
  };

  const exportBookingPDF = async (booking: Booking) => {
    try {
      await generateBookingReceipt(booking);
      addNotification('booking', 'Booking PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      addNotification('booking', 'Error generating PDF. Please try again.');
    }
  };

  // Enhanced booking status management
  const confirmBooking = (bookingId: string) => {
    if (window.confirm('Confirm this booking?')) {
      try {
        const updatedBookings = bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'confirmed' as const }
            : booking
        );
        setBookings(updatedBookings);
        dataStore.bookings.save(updatedBookings);
        addNotification('booking', 'Booking confirmed successfully');
      } catch (error) {
        console.error('Error confirming booking:', error);
        addNotification('booking', 'Error confirming booking. Please try again.');
      }
    }
  };

  const markAsPaid = (bookingId: string) => {
    if (window.confirm('Mark this booking as paid?')) {
      try {
        const updatedBookings = bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'paid' as const, paymentStatus: 'paid' as const }
            : booking
        );
        setBookings(updatedBookings);
        dataStore.bookings.save(updatedBookings);
        addNotification('booking', 'Booking marked as paid');
      } catch (error) {
        console.error('Error marking booking as paid:', error);
        addNotification('booking', 'Error updating payment status. Please try again.');
      }
    }
  };

  // Navigation with permission-based filtering
  const allNavigationItems = [
    // Core modules - always visible based on role
    { name: 'Dashboard', id: 'dashboard', icon: Home, permission: 'dashboard.read', core: true },
    { name: 'Bookings', id: 'bookings', icon: CalendarIcon, permission: 'bookings.read', core: true },
    { name: 'Tours', id: 'tours', icon: MapPin, permission: 'tours.read', core: true },
    { name: 'Fleet', id: 'fleet', icon: Truck, permission: 'vehicles.read', core: true },
    { name: 'Guides', id: 'guides', icon: Users, permission: 'users.read', core: true, featureFlag: 'FEATURE_GUIDES' },
    { name: 'Manifests', id: 'manifests', icon: ClipboardList, permission: 'bookings.read', core: true, featureFlag: 'FEATURE_MANIFESTS' },
    { name: 'Reports', id: 'reports', icon: BarChart3, permission: 'reports.read', core: true, featureFlag: 'FEATURE_REPORTS' },
    { name: 'Settings', id: 'settings', icon: SettingsIcon, permission: 'settings.read', core: true },
    { name: 'Add-ons', id: 'addons', icon: Package, permission: 'bookings.read', core: true },
    
    // Advanced modules - controlled by Settings → Advanced toggles
    { name: 'Policies', id: 'policies', icon: Shield, permission: 'bookings.read', core: false, advanced: true },
    { name: 'Communications', id: 'communications', icon: Mail, permission: 'bookings.read', core: false, advanced: true },
    { name: 'QR Tickets', id: 'qr-tickets', icon: QrCode, permission: 'bookings.read', core: false, advanced: true },
    { name: 'Waivers', id: 'waivers', icon: WaiverIcon, permission: 'bookings.read', core: false, advanced: true },
    { name: 'Promotions', id: 'promotions', icon: Percent, permission: 'bookings.read', core: false, advanced: true },
    { name: 'Agents', id: 'agents', icon: UserCheck, permission: 'users.read', core: false, advanced: true },
    { name: 'Integrations', id: 'integrations', icon: Plug, permission: 'integrations.read', core: false, advanced: true },
    { name: 'Customers', id: 'customers', icon: Users, permission: 'customers.read', core: false, advanced: true },
    { name: 'Inventory', id: 'inventory', icon: Package, permission: 'inventory.read', core: false, advanced: true },
    { name: 'Checklists', id: 'checklists', icon: ClipboardList, permission: 'checklists.read', core: false, advanced: true },
    { name: 'Webhooks', id: 'webhooks', icon: Plug, permission: 'webhooks.read', core: false, advanced: true },
  ];

  // Role-based navigation filtering with sidebar visibility
  const getRoleBasedNavigation = () => {
    if (!currentUser) return [];
    
    const userRole = currentUser.role;
    
    return allNavigationItems.filter(item => {
      const hasPermission = checkPermission(item.permission);
      const featureOk = !item.featureFlag || isFeatureEnabled(item.featureFlag as keyof FeatureFlags);
      
      // Role-based visibility
      let roleVisible = false;
      switch (userRole) {
        case 'Guide':
          // Guides only see Manifests and Check-in
          roleVisible = ['manifests', 'qr-tickets'].includes(item.id);
          break;
        case 'Agent':
          // Ops: Dashboard, Bookings, Manifests, Tours (read), Guides, Fleet
          roleVisible = ['dashboard', 'bookings', 'manifests', 'tours', 'guides', 'fleet'].includes(item.id);
          break;
        case 'Manager':
        case 'Administrator':
          // Manager/Admin: all core modules + Reports + Settings + advanced modules if enabled
          roleVisible = Boolean(item.core || ['reports', 'settings'].includes(item.id) || (item.advanced && (sidebarVisibility[item.id] || false)));
          break;
        default:
          roleVisible = item.core;
      }
      
      // For advanced modules, check sidebar visibility settings
      const isAdvancedVisible = !item.advanced || (sidebarVisibility[item.id] || false);
      
      return hasPermission && featureOk && roleVisible && isAdvancedVisible;
    });
  };

  const navigation = getRoleBasedNavigation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': case 'confirmed': case 'paid': case 'active': return 'bg-green-100 text-green-800';
      case 'in-use': case 'pending': return 'bg-blue-100 text-blue-800';
      case 'maintenance': case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': case 'refunded': case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle authentication states
  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => window.location.reload()} />;
  }

  if (currentUser?.needsPasswordSetup) {
    return (
      <PasswordSetupForm
        email={currentUser.email}
        onSuccess={() => window.location.reload()}
        onBack={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">AAT Management</h1>
              <p className="text-xs text-gray-600">Tour Management System</p>
            </div>
            <div className="flex items-center space-x-2">
              <CurrencySelector />
              <UserDropdown
                notifications={notifications}
                onMarkNotificationRead={markNotificationRead}
                onMarkAllNotificationsRead={markAllNotificationsRead}
                onSettingsClick={() => setCurrentPage('settings')}
              />
            </div>
          </div>
        </div>
        {/* Mobile Navigation */}
        <div className="px-4 pb-3">
          <div className="flex space-x-1 overflow-x-auto">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex-shrink-0 flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentPage === item.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Enhanced Sidebar */}
        <nav className="w-64 bg-white shadow-xl border-r border-gray-200 min-h-screen flex flex-col hidden lg:flex">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700">
            <h1 className="text-xl font-bold text-white">AAT Management</h1>
            <p className="text-sm text-blue-100">Tour Management System</p>
          </div>
          <div className="p-4 flex-1">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.id}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentPage === item.id 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </motion.button>
                </li>
              ))}
            </ul>
            
            {/* User Profile positioned below navigation */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{currentUser?.role || 'User'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <UserDropdown
                    notifications={notifications}
                    onMarkNotificationRead={markNotificationRead}
                    onMarkAllNotificationsRead={markAllNotificationsRead}
                    onSettingsClick={() => setCurrentPage('settings')}
                  />
                  <button
                    onClick={logout}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-800">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-blue-800">Loading data...</p>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* Page Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {currentPage === 'dashboard' && 'Dashboard'}
                  {currentPage === 'bookings' && 'Bookings Management'}
                  {currentPage === 'tours' && 'Tours Management'}
                  {currentPage === 'fleet' && 'Fleet Management'}
                  {currentPage === 'guides' && 'Guides & Staff Management'}
                  {currentPage === 'customers' && 'Customers Management'}
                  {currentPage === 'settings' && 'Settings'}
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  {currentPage === 'dashboard' && 'Welcome back! Here\'s what\'s happening with your tours.'}
                  {currentPage === 'bookings' && 'Manage all tour bookings and reservations'}
                  {currentPage === 'tours' && 'Manage your tour offerings and packages'}
                  {currentPage === 'fleet' && 'Manage your vehicle fleet'}
                  {currentPage === 'guides' && 'Manage your tour guides and staff members'}
                  {currentPage === 'customers' && 'Manage customer information and relationships'}
                  {currentPage === 'settings' && 'Manage users and system settings'}
                </p>
              </div>
              {/* Currency Selector */}
              {currentPage === 'dashboard' && (
                <CurrencySelector />
              )}
              {currentPage === 'fleet' && checkPermission('vehicles.create') && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setVehicleModal({ isOpen: true, mode: 'create' })}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Vehicle</span>
                </motion.button>
              )}
              {currentPage === 'bookings' && checkPermission('bookings.create') && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBookingModal({ isOpen: true, mode: 'create' })}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Booking</span>
                </motion.button>
              )}
              {currentPage === 'tours' && checkPermission('tours.create') && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTourModal({ isOpen: true, mode: 'create' })}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Tour</span>
                </motion.button>
              )}
              {currentPage === 'customers' && checkPermission('customers.create') && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCustomerModal({ isOpen: true, mode: 'create' })}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Customer</span>
                </motion.button>
              )}
              {currentPage === 'settings' && checkPermission('users.create') && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserModal({ isOpen: true, mode: 'create' })}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </motion.button>
              )}
            </motion.div>

            {/* Enhanced Dashboard Content */}
            {currentPage === 'dashboard' && (
              <div className="space-y-8">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <DashboardWidget
                    title="Total Bookings"
                    value={bookings.length}
                    icon={CalendarIcon}
                    color="blue"
                    trend={{ value: 12, isPositive: true }}
                    subtitle="This month"
                    onClick={() => setCurrentPage('bookings')}
                  />
                  <DashboardWidget
                    title="Total Customers"
                    value={customers.length}
                    icon={Users}
                    color="green"
                    trend={{ value: 8, isPositive: true }}
                    subtitle="Active customers"
                    onClick={() => setCurrentPage('customers')}
                  />
                  <DashboardWidget
                    title="Active Tours"
                    value={tours.filter(t => t.status === 'active').length}
                    icon={MapPin}
                    color="purple"
                    subtitle="Available for booking"
                    onClick={() => setCurrentPage('tours')}
                  />
                  <DashboardWidget
                    title="Fleet Vehicles"
                    value={vehicles.length}
                    icon={Truck}
                    color="indigo"
                    subtitle={`${vehicles.filter(v => v.status === 'available').length} available`}
                    onClick={() => setCurrentPage('fleet')}
                  />
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  <QuickStats
                    title="Revenue This Month"
                    currentValue={bookings.reduce((sum, b) => sum + b.totalAmount, 0)}
                    previousValue={bookings.reduce((sum, b) => sum + b.totalAmount, 0) * 0.85}
                    format="currency"
                    color="green"
                  />
                  <QuickStats
                    title="Booking Conversion"
                    currentValue={85}
                    previousValue={78}
                    format="percentage"
                    color="blue"
                  />
                  <QuickStats
                    title="Customer Satisfaction"
                    currentValue={4.6}
                    previousValue={4.3}
                    format="number"
                    color="blue"
                  />
                </div>

                {/* Calendar and Recent Activity */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                  <Calendar
                    bookings={bookings}
                    onDateClick={handleDateClick}
                    onCreateBooking={handleCreateBookingFromCalendar}
                    tours={tours}
                  />
                  <RecentActivity
                    bookings={bookings}
                    customers={customers}
                    notifications={notifications}
                  />
                </div>

                {/* Currency Exchange and Quick Actions */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
                  <div className="xl:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        {checkPermission('bookings.create') && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setBookingModal({ isOpen: true, mode: 'create' })}
                            className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <CalendarIcon className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">New Booking</span>
                          </motion.button>
                        )}
                        {checkPermission('customers.create') && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCustomerModal({ isOpen: true, mode: 'create' })}
                            className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <Users className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-900">Add Customer</span>
                          </motion.button>
                        )}
                        {checkPermission('tours.create') && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setTourModal({ isOpen: true, mode: 'create' })}
                            className="w-full flex items-center space-x-3 p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                          >
                            <MapPin className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-medium text-purple-900">Add Tour</span>
                          </motion.button>
                        )}
                        {checkPermission('vehicles.create') && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setVehicleModal({ isOpen: true, mode: 'create' })}
                            className="w-full flex items-center space-x-3 p-3 text-left bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            <Truck className="w-5 h-5 text-indigo-600" />
                            <span className="text-sm font-medium text-indigo-900">Add Vehicle</span>
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Currency Exchange */}
                    <CurrencyExchange />

                    {/* System Status */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Database</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Online</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">API</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Online</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Storage</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm text-yellow-600">75% Used</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Management */}
            {currentPage === 'bookings' && (
              <div className="space-y-6">
                {/* Export Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Export Bookings</h2>
                    <p className="text-sm text-gray-600">Download your bookings data in various formats</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={exportBookingsCSV}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Export CSV</span>
                    </motion.button>
                  </div>
                </motion.div>

                {/* Bookings List */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200"
                >
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">All Bookings</h3>
                    <p className="text-sm text-gray-600">Manage and view all tour bookings</p>
                  </div>
                  <div className="p-6">
                    {bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                        <p className="text-gray-500 mb-6">Start by creating your first booking</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setBookingModal({ isOpen: true, mode: 'create' })}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Create First Booking
                        </motion.button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map(booking => {
                          const customer = customers.find(c => c.id === booking.customerId);
                          const tour = tours.find(t => t.id === booking.tourId);
                          const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                          
                          return (
                            <div key={booking.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <CalendarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{customer?.name || booking.customerName || 'Unknown Customer'}</h4>
                                  <p className="text-sm text-gray-600">{tour?.name || booking.tourName || 'Unknown Tour'}</p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                    <span>📅 {booking.tourDate ? new Date(booking.tourDate).toLocaleDateString() : 'Not specified'}</span>
                                    <span>👥 {booking.participants || booking.guests || 0} participants</span>
                                    <span>🚗 {vehicle?.name || 'Not assigned'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <p className="text-lg font-semibold text-gray-900">{formatAmount(booking.totalAmount)}</p>
                                  <p className="text-sm text-gray-500">{booking.paymentStatus || 'Not specified'}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                  </span>
                                  
                                  {/* Quick Actions */}
                                  {booking.status === 'pending' && (
                                    <button
                                      onClick={() => confirmBooking(booking.id)}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                      title="Confirm Booking"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                  
                                  {booking.status === 'confirmed' && booking.paymentStatus !== 'paid' && (
                                    <button
                                      onClick={() => markAsPaid(booking.id)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                      title="Mark as Paid"
                                    >
                                      <DollarSign className="w-4 h-4" />
                                    </button>
                                  )}
                                  
                                  {(booking.status === 'confirmed' || booking.status === 'paid') && (
                                    <button
                                      onClick={() => exportBookingPDF(booking)}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                      title="Generate Receipt"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => setBookingModal({ isOpen: true, mode: 'edit', booking })}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Edit Booking"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleBookingDelete(booking.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Delete Booking"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Tours Management */}
            {currentPage === 'tours' && (
              <div className="space-y-4">
                {tours.map(tour => {
                  const isExpanded = expandedTours.has(tour.id);
                  return (
                    <div key={tour.id} className="bg-white rounded-lg shadow">
                      <div 
                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleTourExpansion(tour.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{tour.name}</h3>
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl font-bold text-blue-600">{formatAmount(tour.price)}</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tour.status)}`}>
                                  {tour.status}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <span><span className="font-medium">Duration:</span> {tour.duration}</span>
                              <span><span className="font-medium">Category:</span> {tour.category}</span>
                              <span><span className="font-medium">Capacity:</span> {tour.maxCapacity} people</span>
                              <span><span className="font-medium">Rating:</span> {tour.rating}/5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-6 pb-6 border-t bg-gray-50">
                          <div className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Tour Details</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <p><span className="font-medium">Pickup Time:</span> {tour.pickupTime || 'Not specified'}</p>
                                  <p><span className="font-medium">Dropoff Time:</span> {tour.dropoffTime || 'Not specified'}</p>
                                  <p><span className="font-medium">Current Bookings:</span> {tour.bookings}</p>
                                  <p><span className="font-medium">Available Spots:</span> {(tour.maxCapacity || 0) - tour.bookings}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {tour.description || 'No description available.'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex space-x-3 mt-6">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTourModal({ isOpen: true, mode: 'edit', tour });
                                }}
                                className="flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Tour
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTourDelete(tour.id);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Tour
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fleet Management */}
            {currentPage === 'fleet' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Type:</span> {vehicle.type}</p>
                      <p><span className="font-medium">Capacity:</span> {vehicle.capacity} passengers</p>
                      <p><span className="font-medium">License:</span> {vehicle.licensePlate}</p>
                      <p><span className="font-medium">Driver:</span> {vehicle.driver || 'Unassigned'}</p>
                      <p><span className="font-medium">Location:</span> {vehicle.location || 'Unknown'}</p>
                      {vehicle.fuelLevel && <p><span className="font-medium">Fuel:</span> {vehicle.fuelLevel}%</p>}
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => setVehicleModal({ isOpen: true, mode: 'edit', vehicle })}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleVehicleDelete(vehicle.id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Customers Management */}
            {currentPage === 'customers' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">All Customers</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {customers.map(customer => (
                      <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                          <p className="text-sm text-gray-500">{customer.phone}</p>
                          <p className="text-sm text-gray-500">{customer.totalBookings} bookings • {formatAmount(customer.totalSpent)} spent</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status || 'active')}`}>
                            {customer.status || 'active'}
                          </span>
                          <button
                            onClick={() => setCustomerModal({ isOpen: true, mode: 'edit', customer })}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCustomerDelete(customer.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Guides Management */}
            {currentPage === 'guides' && (
              <GuidesPage
                guides={guides}
                onSave={handleGuideSave}
                onUpdate={handleGuideUpdate}
                onDelete={handleGuideDelete}
              />
            )}

            {/* Add-ons Management */}
            {currentPage === 'addons' && (
              <AddonsPage
                addons={addons}
                categories={addonCategories}
                onSave={handleAddonSave}
                onUpdate={handleAddonUpdate}
                onDelete={handleAddonDelete}
              />
            )}

            {/* Policies Management */}
            {currentPage === 'policies' && (
              <PoliciesPage
                refundPolicies={refundPolicies}
                depositPolicies={depositPolicies}
                paymentTerms={paymentTerms}
                refundRequests={refundRequests}
                onSaveRefundPolicy={handleRefundPolicySave}
                onUpdateRefundPolicy={handleRefundPolicyUpdate}
                onDeleteRefundPolicy={handleRefundPolicyDelete}
                onSaveDepositPolicy={handleDepositPolicySave}
                onUpdateDepositPolicy={handleDepositPolicyUpdate}
                onDeleteDepositPolicy={handleDepositPolicyDelete}
                onSavePaymentTerms={handlePaymentTermsSave}
                onUpdatePaymentTerms={handlePaymentTermsUpdate}
                onDeletePaymentTerms={handlePaymentTermsDelete}
                onProcessRefundRequest={handleProcessRefundRequest}
              />
            )}

            {/* Communications Management */}
            {currentPage === 'communications' && (
              <CommunicationsPage
                emailTemplates={emailTemplates}
                smsMessages={smsMessages}
                communicationLogs={communicationLogs}
                notificationRules={notificationRules}
                marketingCampaigns={marketingCampaigns}
                onSaveEmailTemplate={handleEmailTemplateSave}
                onUpdateEmailTemplate={handleEmailTemplateUpdate}
                onDeleteEmailTemplate={handleEmailTemplateDelete}
                onSendSMS={handleSendSMS}
                onSaveNotificationRule={handleNotificationRuleSave}
                onUpdateNotificationRule={handleNotificationRuleUpdate}
                onDeleteNotificationRule={handleNotificationRuleDelete}
                onSaveMarketingCampaign={handleMarketingCampaignSave}
                onUpdateMarketingCampaign={handleMarketingCampaignUpdate}
                onDeleteMarketingCampaign={handleMarketingCampaignDelete}
                onSendCampaign={handleSendCampaign}
              />
            )}

            {/* Manifests Management */}
            {currentPage === 'manifests' && (
              <ManifestsPage
                manifests={manifests}
                dailyOperations={dailyOperations}
                vehiclePreparations={vehiclePreparations}
                customerCheckIns={customerCheckIns}
                tourDepartures={tourDepartures}
                dailyReports={dailyReports}
                onSaveManifest={handleManifestSave}
                onUpdateManifest={handleManifestUpdate}
                onDeleteManifest={handleManifestDelete}
                onSaveDailyOperations={handleDailyOperationsSave}
                onUpdateDailyOperations={handleDailyOperationsUpdate}
                onDeleteDailyOperations={handleDailyOperationsDelete}
                onSaveVehiclePreparation={handleVehiclePreparationSave}
                onUpdateVehiclePreparation={handleVehiclePreparationUpdate}
                onDeleteVehiclePreparation={handleVehiclePreparationDelete}
                onCheckInCustomer={handleCheckInCustomer}
                onUpdateDeparture={handleUpdateDeparture}
                onSaveDailyReport={handleSaveDailyReport}
              />
            )}

            {/* QR Tickets Management */}
            {currentPage === 'qr-tickets' && (
              <QRTicketsPage
                qrTickets={qrTickets}
                checkInSessions={checkInSessions}
                checkInEvents={checkInEvents}
                qrCodeConfigs={qrCodeConfigs}
                checkInAnalytics={checkInAnalytics}
                mobileApps={mobileApps}
                selfServicePortals={selfServicePortals}
                validationRules={validationRules}
                offlineData={offlineData}
                qrTemplates={qrTemplates}
                onSaveQRTicket={handleQRTicketSave}
                onUpdateQRTicket={handleQRTicketUpdate}
                onDeleteQRTicket={handleQRTicketDelete}
                onSaveCheckInSession={handleCheckInSessionSave}
                onUpdateCheckInSession={handleCheckInSessionUpdate}
                onDeleteCheckInSession={handleCheckInSessionDelete}
                onProcessCheckIn={handleProcessCheckIn}
                onSaveQRConfig={handleQRConfigSave}
                onUpdateQRConfig={handleQRConfigUpdate}
                onDeleteQRConfig={handleQRConfigDelete}
                onGenerateQRCode={handleGenerateQRCode}
                onValidateQRCode={handleValidateQRCode}
                onSyncOfflineData={handleSyncOfflineData}
              />
            )}

            {/* Waivers Management */}
            {currentPage === 'waivers' && (
              <WaiversPage
                waivers={waivers}
                waiverSignatures={waiverSignatures}
                waiverTemplates={waiverTemplates}
                complianceReports={complianceReports}
                waiverAnalytics={waiverAnalytics}
                waiverNotifications={waiverNotifications}
                waiverWorkflows={waiverWorkflows}
                waiverTranslations={waiverTranslations}
                waiverAuditLogs={waiverAuditLogs}
                onSaveWaiver={handleWaiverSave}
                onUpdateWaiver={handleWaiverUpdate}
                onDeleteWaiver={handleWaiverDelete}
                onSaveWaiverSignature={handleWaiverSignatureSave}
                onUpdateWaiverSignature={handleWaiverSignatureUpdate}
                onDeleteWaiverSignature={handleWaiverSignatureDelete}
                onSaveWaiverTemplate={handleWaiverTemplateSave}
                onUpdateWaiverTemplate={handleWaiverTemplateUpdate}
                onDeleteWaiverTemplate={handleWaiverTemplateDelete}
                onGenerateComplianceReport={handleGenerateComplianceReport}
                onSaveWaiverWorkflow={handleWaiverWorkflowSave}
                onUpdateWaiverWorkflow={handleWaiverWorkflowUpdate}
                onDeleteWaiverWorkflow={handleWaiverWorkflowDelete}
                onSendWaiverNotification={handleSendWaiverNotification}
              />
            )}

            {/* Promotions Management */}
            {currentPage === 'promotions' && (
              <PromotionsPage
                promotions={promotions}
                customerSegments={customerSegments}
                discountCodes={discountCodes}
                promotionUsages={promotionUsages}
                campaigns={campaigns}
                promotionAnalytics={promotionAnalytics}
                promotionRules={promotionRules}
                promotionTemplates={promotionTemplates}
                promotionBanners={promotionBanners}
                referralPrograms={referralPrograms}
                referrals={referrals}
                loyaltyPrograms={loyaltyPrograms}
                loyaltyAccounts={loyaltyAccounts}
                loyaltyTransactions={loyaltyTransactions}
                onSavePromotion={handlePromotionSave}
                onUpdatePromotion={handlePromotionUpdate}
                onDeletePromotion={handlePromotionDelete}
                onSaveCustomerSegment={handleCustomerSegmentSave}
                onUpdateCustomerSegment={handleCustomerSegmentUpdate}
                onDeleteCustomerSegment={handleCustomerSegmentDelete}
                onSaveCampaign={handleCampaignSave}
                onUpdateCampaign={handleCampaignUpdate}
                onDeleteCampaign={handleCampaignDelete}
                onSavePromotionRule={handlePromotionRuleSave}
                onUpdatePromotionRule={handlePromotionRuleUpdate}
                onDeletePromotionRule={handlePromotionRuleDelete}
                onSaveReferralProgram={handleReferralProgramSave}
                onUpdateReferralProgram={handleReferralProgramUpdate}
                onDeleteReferralProgram={handleReferralProgramDelete}
                onSaveLoyaltyProgram={handleLoyaltyProgramSave}
                onUpdateLoyaltyProgram={handleLoyaltyProgramUpdate}
                onDeleteLoyaltyProgram={handleLoyaltyProgramDelete}
              />
            )}

            {/* Agents Management */}
            {currentPage === 'agents' && (
              <AgentsPage
                agents={agents}
                territories={territories}
                commissionStructures={commissionStructures}
                leads={leads}
                commissions={commissions}
                agentReports={agentReports}
                agentTrainings={agentTrainings}
                agentAuditLogs={agentAuditLogs}
                onSaveAgent={handleAgentSave}
                onUpdateAgent={handleAgentUpdate}
                onDeleteAgent={handleAgentDelete}
                onSaveTerritory={handleTerritorySave}
                onUpdateTerritory={handleTerritoryUpdate}
                onDeleteTerritory={handleTerritoryDelete}
                onSaveCommissionStructure={handleCommissionStructureSave}
                onUpdateCommissionStructure={handleCommissionStructureUpdate}
                onDeleteCommissionStructure={handleCommissionStructureDelete}
                onSaveLead={handleLeadSave}
                onUpdateLead={handleLeadUpdate}
                onDeleteLead={handleLeadDelete}
                onGenerateAgentReport={handleGenerateAgentReport}
                onSaveAgentTraining={handleAgentTrainingSave}
                onUpdateAgentTraining={handleAgentTrainingUpdate}
                onDeleteAgentTraining={handleAgentTrainingDelete}
              />
            )}

            {/* Reports Management */}
            {currentPage === 'reports' && (
              <ReportsPage
                reports={reports}
                reportTemplates={reportTemplates}
                dashboards={dashboards}
                analytics={analytics}
                exportJobs={exportJobs}
                reportExecutions={reportExecutions}
                bookings={bookings}
                tours={tours}
                vehicles={vehicles}
                guides={users.filter(u => u.role === 'Guide')}
                onSaveReport={handleReportSave}
                onUpdateReport={handleReportUpdate}
                onDeleteReport={handleReportDelete}
                onSaveTemplate={handleReportTemplateSave}
                onUpdateTemplate={handleReportTemplateUpdate}
                onDeleteTemplate={handleReportTemplateDelete}
                onSaveDashboard={handleDashboardSave}
                onUpdateDashboard={handleDashboardUpdate}
                onDeleteDashboard={handleDashboardDelete}
                onSaveAnalytics={handleAnalyticsSave}
                onUpdateAnalytics={handleAnalyticsUpdate}
                onDeleteAnalytics={handleAnalyticsDelete}
                onExecuteReport={handleExecuteReport}
                onExportReport={handleExportReport}
                onShareReport={handleShareReport}
              />
            )}

            {/* Integrations Management */}
            {currentPage === 'integrations' && (
              <IntegrationsPage
                integrations={integrations}
                webhookConfigs={webhookConfigs}
                syncJobs={syncJobs}
                integrationTests={integrationTests}
                integrationMonitors={integrationMonitors}
                integrationAlerts={integrationAlerts}
                integrationTemplates={integrationTemplates}
                integrationUsage={integrationUsage}
                onSaveIntegration={handleIntegrationSave}
                onUpdateIntegration={handleIntegrationUpdate}
                onDeleteIntegration={handleIntegrationDelete}
                onTestIntegration={handleTestIntegration}
                onSyncIntegration={handleSyncIntegration}
                onToggleIntegration={handleToggleIntegration}
                onSaveWebhook={handleWebhookSave}
                onUpdateWebhook={handleWebhookUpdate}
                onDeleteWebhook={handleWebhookDelete}
                onSaveTest={handleTestSave}
                onUpdateTest={handleTestUpdate}
                onDeleteTest={handleTestDelete}
                onRunTest={handleRunTest}
                onSaveMonitor={handleMonitorSave}
                onUpdateMonitor={handleMonitorUpdate}
                onDeleteMonitor={handleMonitorDelete}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onResolveAlert={handleResolveAlert}
              />
            )}

            {/* Settings Management */}
            {currentPage === 'settings' && <Settings />}
          </div>
        </main>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={userModal.isOpen}
        onClose={() => setUserModal({ isOpen: false, mode: 'create' })}
        onSave={userModal.mode === 'create' ? handleUserSave : handleUserUpdate}
        user={userModal.user}
        mode={userModal.mode}
      />

      <VehicleModal
        isOpen={vehicleModal.isOpen}
        onClose={() => setVehicleModal({ isOpen: false, mode: 'create' })}
        onSave={vehicleModal.mode === 'create' ? handleVehicleSave : handleVehicleUpdate}
        vehicle={vehicleModal.vehicle}
        mode={vehicleModal.mode}
      />

      <SimpleBookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ isOpen: false, mode: 'create' })}
        onSave={bookingModal.mode === 'create' ? handleBookingSave : handleBookingUpdate}
        customers={customers}
        tours={tours}
        vehicles={vehicles}
        guides={users.filter(u => u.role === 'Guide')}
        onCreateCustomer={handleCreateCustomer}
      />

      <TourDetailModal
        isOpen={tourModal.isOpen}
        onClose={() => setTourModal({ isOpen: false, mode: 'create' })}
        onSave={tourModal.mode === 'create' ? handleTourSave : handleTourUpdate}
        tour={tourModal.tour}
        mode={tourModal.mode}
      />

      <CustomerModal
        isOpen={customerModal.isOpen}
        onClose={() => setCustomerModal({ isOpen: false, mode: 'create' })}
        onSave={customerModal.mode === 'create' ? handleCustomerSave : handleCustomerUpdate}
        customer={customerModal.customer}
        mode={customerModal.mode}
      />
    </div>
  );
}

export default App;
