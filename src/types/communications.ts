export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string; // HTML content
  type: 'booking_confirmation' | 'payment_receipt' | 'cancellation' | 'reminder' | 'marketing' | 'custom';
  variables: string[]; // Available template variables like {{customer_name}}, {{tour_name}}
  isActive: boolean;
  isDefault: boolean;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface SMSMessage {
  id: string;
  recipient: string; // Phone number
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  type: 'booking_confirmation' | 'reminder' | 'cancellation' | 'marketing' | 'custom';
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLog {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  type: 'email' | 'sms' | 'call' | 'in_person';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  relatedBookingId?: string;
  relatedTourId?: string;
  sentBy: string; // User ID
  sentAt: string;
  readAt?: string;
  attachments?: string[]; // File URLs
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  trigger: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'payment_received' | 'tour_reminder' | 'custom';
  conditions: {
    tourIds?: string[];
    customerTypes?: string[];
    timeBeforeTour?: number; // Hours
    paymentAmount?: {
      min?: number;
      max?: number;
    };
  };
  actions: {
    email?: {
      templateId: string;
      recipients: ('customer' | 'admin' | 'guide' | 'custom')[];
      customEmails?: string[];
    };
    sms?: {
      templateId: string;
      recipients: ('customer' | 'admin' | 'guide' | 'custom')[];
      customPhones?: string[];
    };
  };
  isActive: boolean;
  priority: number; // Higher number = higher priority
  createdAt: string;
  updatedAt: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'both';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  targetAudience: {
    customerTypes?: string[];
    tourIds?: string[];
    lastBookingDate?: {
      from?: string;
      to?: string;
    };
    totalSpent?: {
      min?: number;
      max?: number;
    };
  };
  content: {
    subject?: string;
    emailContent?: string;
    smsContent?: string;
  };
  schedule: {
    type: 'immediate' | 'scheduled';
    scheduledAt?: string;
  };
  stats: {
    totalSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
  };
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
}

export interface CommunicationSettings {
  id: string;
  emailProvider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'custom';
  smsProvider: 'twilio' | 'aws_sns' | 'custom';
  settings: {
    smtp?: {
      host: string;
      port: number;
      username: string;
      password: string;
      secure: boolean;
    };
    sendgrid?: {
      apiKey: string;
    };
    twilio?: {
      accountSid: string;
      authToken: string;
      fromNumber: string;
    };
  };
  defaultFromEmail: string;
  defaultFromName: string;
  defaultReplyTo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationPreferences {
  id: string;
  customerId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  bookingReminders: boolean;
  paymentConfirmations: boolean;
  tourUpdates: boolean;
  preferredLanguage: string;
  preferredTime: string; // HH:MM format
  timezone: string;
  createdAt: string;
  updatedAt: string;
}


