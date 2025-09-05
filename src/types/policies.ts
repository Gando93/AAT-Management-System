export interface RefundPolicy {
  id: string;
  name: string;
  description: string;
  policyType: 'cancellation' | 'no_show' | 'weather' | 'force_majeure' | 'custom';
  refundPercentage: number; // 0-100
  timeRestrictions: {
    hoursBeforeTour: number; // Hours before tour start
    cutoffTime?: string; // Specific time cutoff (HH:MM)
  };
  conditions: string[]; // Additional conditions
  isActive: boolean;
  applicableTours: string[]; // Tour IDs this applies to
  createdAt: string;
  updatedAt: string;
}

export interface DepositPolicy {
  id: string;
  name: string;
  description: string;
  depositType: 'percentage' | 'fixed_amount' | 'tiered';
  depositValue: number; // Percentage or fixed amount
  tiers?: Array<{
    minAmount: number;
    maxAmount?: number;
    depositPercentage: number;
  }>;
  isRequired: boolean;
  dueDate: {
    type: 'immediate' | 'hours_before' | 'days_before' | 'specific_date';
    value: number; // Hours or days
    specificDate?: string; // ISO date if type is specific_date
  };
  refundable: boolean;
  applicableTours: string[]; // Tour IDs this applies to
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTerms {
  id: string;
  name: string;
  description: string;
  paymentMethods: ('cash' | 'card' | 'bank_transfer' | 'mobile_money' | 'crypto')[];
  currency: string;
  exchangeRate?: number; // For multi-currency support
  processingFees: {
    card: number; // Percentage
    bankTransfer: number;
    mobileMoney: number;
    crypto: number;
  };
  installmentOptions: {
    enabled: boolean;
    maxInstallments: number;
    minimumAmount: number;
    interestRate: number; // Annual percentage rate
  };
  latePaymentFees: {
    enabled: boolean;
    gracePeriodDays: number;
    feeAmount: number;
    feeType: 'fixed' | 'percentage';
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RefundRequest {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  tourId: string;
  tourName: string;
  requestedAmount: number;
  refundReason: string;
  policyId: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'cancelled';
  requestedBy: string; // User ID who requested
  processedBy?: string; // User ID who processed
  processedAt?: string;
  notes?: string;
  attachments?: string[]; // File URLs
  createdAt: string;
  updatedAt: string;
}

export interface DepositPayment {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  dueDate: string;
  paidAt?: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  category: 'refund' | 'deposit' | 'payment' | 'cancellation' | 'general';
  content: string; // HTML or markdown content
  variables: string[]; // Placeholder variables like {{company_name}}
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


