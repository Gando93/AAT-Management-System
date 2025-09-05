# AAT Tour Management System

A comprehensive, enterprise-grade tour management solution built with React, TypeScript, and Tailwind CSS. This system provides complete functionality for managing tours, bookings, customers, fleet, users, and advanced tour operations with a modern, responsive interface.

## 🚀 Live Demo

**Production URL:** https://aat-management-system.vercel.app

## ✨ Features

### 🎯 Core Functionality
- **Complete CRUD Operations** for all entities (Tours, Bookings, Customers, Fleet, Users)
- **Real-time Data Management** with localStorage persistence
- **Professional Receipt Generation** with PDF export for confirmed bookings
- **Advanced Notification System** with latest notifications at the top
- **Responsive Design** that works on all devices
- **Role-Based Access Control (RBAC)** with granular permissions
- **Multi-Currency Support** with real-time exchange rates
- **Mobile-First Design** optimized for all screen sizes

### 🏢 Advanced Tour Operations (Feature Flags)

#### 👥 Guides & Staff Management (FEATURE_GUIDES)
- **Staff CRUD Operations** - Complete guide management
- **Skills & Certifications** - Track qualifications with expiry dates
- **Language Support** - Multi-language guide capabilities
- **Availability Management** - Prevent overlapping assignments
- **Performance Tracking** - Monitor guide performance and ratings
- **Contact Management** - Complete contact information and emergency contacts

#### 🚌 Resource-Aware Availability (FEATURE_RESOURCE_AVAILABILITY)
- **Smart Booking Engine** - Only allow bookings when resources are available
- **Conflict Detection** - Prevent double-booking of vehicles and guides
- **Capacity Management** - Real-time capacity tracking
- **Calendar Integration** - Visual availability with color coding
- **Resource Optimization** - Maximize utilization efficiency

#### 💰 Pricing & Seasons (FEATURE_PRICING_SEASONS)
- **Dynamic Pricing** - Season-based pricing with automatic adjustments
- **Pax Tier Pricing** - Different rates for different group sizes
- **Early Bird & Last Minute** - Time-based pricing strategies
- **Weekend/Weekday Rules** - Flexible pricing schedules
- **Tax Management** - Built-in tax calculations
- **Price Preview Widget** - Real-time pricing calculations

#### 🎁 Add-ons & Extras (FEATURE_ADDONS)
- **Flexible Add-on System** - Per-person, per-booking, per-hour, fixed pricing
- **Category Management** - Organize add-ons by type
- **Quantity Controls** - Min/max quantity limits
- **Booking Integration** - Seamless add-on selection during booking
- **Revenue Tracking** - Track add-on performance and revenue

#### 📋 Policies, Deposits & Refunds (FEATURE_POLICIES_DEPOSITS)
- **Refund Policy Management** - Comprehensive refund policy system
- **Deposit Management** - Flexible deposit requirements and tracking
- **Cancellation Policies** - Automated cancellation handling
- **Payment Terms** - Configurable payment schedules
- **Compliance Tracking** - Ensure policy adherence

#### 📧 Communications (FEATURE_COMMS)
- **Email Templates** - Automated email communications
- **SMS Notifications** - Real-time SMS alerts
- **Marketing Campaigns** - Targeted marketing automation
- **Communication History** - Complete communication audit trail
- **Template Variables** - Dynamic content personalization

#### 📋 Manifests & Daily Operations (FEATURE_MANIFESTS)
- **Daily Tour Manifests** - Complete tour day management
- **Guide Assignments** - Staff scheduling and checklists
- **Vehicle Preparation** - Pre-tour vehicle readiness
- **Customer Check-in** - Digital check-in management
- **Tour Departure** - Real-time departure tracking
- **Daily Reports** - Comprehensive daily operations reporting

#### 📱 QR E-tickets & Check-in (FEATURE_QR_CHECKIN)
- **QR Code Generation** - Secure digital tickets
- **Mobile Check-in** - Contactless check-in system
- **Offline Capabilities** - Works without internet connection
- **Analytics Dashboard** - Check-in performance metrics
- **Customer Self-Service** - Self-service portal for customers

#### 📄 Waivers & Legal Documents (FEATURE_WAIVERS)
- **Digital Waiver Management** - Electronic waiver system
- **Signature Capture** - Digital signature collection
- **Compliance Tracking** - Legal compliance monitoring
- **Multi-language Support** - International waiver support
- **Version Control** - Document versioning and updates

#### 🎯 Promotions & Discounts (FEATURE_PROMOS)
- **Promotional Campaigns** - Targeted marketing campaigns
- **Discount Codes** - Flexible discount system
- **Customer Segmentation** - Advanced customer targeting
- **Dynamic Pricing** - Real-time pricing adjustments
- **Campaign Analytics** - Performance tracking and ROI

#### 🤝 Agents & Resellers (FEATURE_AGENTS)
- **Agent Management** - Complete agent lifecycle management
- **Commission Tracking** - Automated commission calculations
- **Territory Management** - Geographic territory assignments
- **Performance Analytics** - Agent performance metrics
- **Lead Management** - Lead assignment and tracking

#### 📊 Reporting & Analytics (FEATURE_REPORTS)
- **Advanced Reporting** - Comprehensive business intelligence
- **Real-time Dashboards** - Live performance monitoring
- **Export Capabilities** - PDF, CSV, Excel exports
- **Custom Reports** - Build-your-own report builder
- **Data Visualization** - Charts, graphs, and analytics

#### 🔌 Integrations (FEATURE_INTEGRATIONS)
- **Third-party APIs** - Payment gateways, booking platforms, CRM
- **Webhook Management** - Event-driven integrations
- **Data Synchronization** - Real-time data sync
- **Integration Testing** - Automated integration validation
- **Health Monitoring** - Integration status monitoring

### 🎨 User Interface
- **Modern UI/UX** with gradient backgrounds and smooth animations
- **Intuitive Navigation** with clear visual hierarchy
- **Professional Dashboard** with real-time statistics and KPIs
- **Clean, Streamlined Design** without clutter
- **Interactive Elements** with hover effects and transitions
- **Dark/Light Mode** support (coming soon)

### 🔐 Security & Authentication
- **Role-Based Access Control** - Administrator, Manager, Agent, Viewer roles
- **Permission System** - Granular permissions for all features
- **Secure Authentication** - Password-based login system
- **Session Management** - Secure session handling
- **Data Validation** - Input validation and sanitization

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **PDF Generation:** jsPDF
- **Icons:** Lucide React
- **Build Tool:** Vite
- **Testing:** Vitest, Playwright
- **Deployment:** Vercel
- **State Management:** React Hooks + Context
- **Data Persistence:** localStorage

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gando93/aat-tour-management-system.git
   cd aat-tour-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   # Unit tests
   npm run test
   
   # E2E tests
   npm run test:e2e
   
   # All tests
   npm run test:all
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🚀 Deployment

The application is automatically deployed to Vercel. To deploy manually:

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Feature Flags (optional - defaults to enabled)
VITE_FEATURE_GUIDES=true
VITE_FEATURE_RESOURCE_AVAILABILITY=true
VITE_FEATURE_PRICING_SEASONS=true
VITE_FEATURE_ADDONS=true
VITE_FEATURE_POLICIES_DEPOSITS=true
VITE_FEATURE_COMMS=true
VITE_FEATURE_MANIFESTS=true
VITE_FEATURE_QR_CHECKIN=true
VITE_FEATURE_WAIVERS=true
VITE_FEATURE_PROMOS=true
VITE_FEATURE_AGENTS=true
VITE_FEATURE_REPORTS=true
VITE_FEATURE_INTEGRATIONS=true

# API Keys (for integrations)
VITE_STRIPE_PUBLIC_KEY=your_stripe_key
VITE_BOOKING_COM_API_KEY=your_booking_key
VITE_EXCHANGE_RATE_API_KEY=your_exchange_rate_key

# App Configuration
VITE_APP_NAME="AAT Management System"
VITE_APP_VERSION="2.0.0"
VITE_DEFAULT_CURRENCY="EUR"
```

## 🎛️ Feature Flags

The system uses a comprehensive feature flag system for safe deployments and gradual rollouts:

### Available Feature Flags
- `FEATURE_GUIDES` - Guides & Staff Management
- `FEATURE_RESOURCE_AVAILABILITY` - Resource-aware booking
- `FEATURE_PRICING_SEASONS` - Dynamic pricing system
- `FEATURE_ADDONS` - Add-ons and extras
- `FEATURE_POLICIES_DEPOSITS` - Policies and refunds
- `FEATURE_COMMS` - Communications system
- `FEATURE_MANIFESTS` - Daily operations
- `FEATURE_QR_CHECKIN` - QR tickets and check-in
- `FEATURE_WAIVERS` - Legal documents
- `FEATURE_PROMOS` - Promotions and discounts
- `FEATURE_AGENTS` - Agent management
- `FEATURE_REPORTS` - Reporting and analytics
- `FEATURE_INTEGRATIONS` - Third-party integrations

### Managing Feature Flags

```typescript
// Enable all features (development)
localStorage.setItem('featureFlags', JSON.stringify({
  FEATURE_GUIDES: true,
  FEATURE_RESOURCE_AVAILABILITY: true,
  // ... other flags
}));

// Reset to defaults
localStorage.removeItem('featureFlags');

// URL parameter to enable all features
// ?flags=all
```

## 🧪 Testing

### Unit Tests (Vitest)
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests (Playwright)
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run E2E tests in debug mode
npm run test:e2e:debug
```

### Test Coverage
- **Unit Tests:** 80%+ coverage target
- **E2E Tests:** Critical user journeys
- **Integration Tests:** API and data flow testing

## 📱 Usage

### Dashboard
- View real-time statistics and KPIs
- Quick access to common actions
- Recent bookings overview
- Currency exchange rates
- Interactive calendar for bookings

### Bookings Management
- Create, edit, and delete bookings
- Confirm bookings and mark as paid
- Generate professional PDF receipts
- Export data to CSV and PDF
- Add-on integration
- Resource conflict checking

### Tours Management
- Manage tour offerings and packages
- Track capacity and availability
- Set pricing and descriptions
- Season-based pricing
- Add-on management

### Fleet Management
- Monitor vehicle status and location
- Assign drivers to vehicles
- Track fuel levels and maintenance
- Resource availability tracking

### Customer Management
- Maintain customer profiles
- Track booking history and spending
- Manage contact information
- Customer segmentation

### User Management
- System users and permissions
- Role-based access control
- Password management
- Permission assignments

## 🎨 UI/UX Features

- **User Profile** positioned in top-right for better accessibility
- **Clean Header** without duplicate branding
- **Latest Notifications** displayed at the top
- **Professional Receipts** with enhanced formatting
- **Responsive Design** optimized for all screen sizes
- **Smooth Animations** for better user experience
- **Mobile-First Design** with touch-friendly interfaces
- **Accessibility Support** with ARIA labels and keyboard navigation

## 🔒 Data Management

- **LocalStorage** for data persistence
- **Real-time Updates** across all components
- **Data Validation** before saving operations
- **Error Handling** with user-friendly messages
- **Backup and Restore** functionality
- **Audit Logging** for compliance
- **Data Export** in multiple formats

## 📄 Receipt Generation

- **Professional PDF Receipts** for confirmed bookings
- **Enhanced Formatting** with proper headers and styling
- **Customer Details** including contact information
- **Tour Information** with pricing and dates
- **Payment Details** with status tracking
- **Multi-currency Support** with proper formatting

## 🎯 Key Improvements Made

1. **Enterprise Features** - 13 major feature modules for complete tour operations
2. **Feature Flag System** - Safe deployments and gradual rollouts
3. **Role-Based Access Control** - Granular permissions and security
4. **Multi-Currency Support** - Real-time exchange rates and formatting
5. **Mobile Optimization** - Touch-friendly, responsive design
6. **Advanced Testing** - Comprehensive test suite with 80%+ coverage
7. **Integration Ready** - Third-party API integration framework
8. **Real-time Monitoring** - Health checks and performance tracking
9. **Compliance Features** - Audit logging and legal document management
10. **Analytics & Reporting** - Business intelligence and performance metrics

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BookingModal.tsx
│   ├── CustomerModal.tsx
│   ├── TourModal.tsx
│   ├── UserModal.tsx
│   ├── VehicleModal.tsx
│   ├── UserDropdown.tsx
│   └── ... (feature-specific modals)
├── pages/              # Feature pages
│   ├── Guides.tsx
│   ├── Pricing.tsx
│   ├── Addons.tsx
│   ├── Policies.tsx
│   ├── Communications.tsx
│   ├── Manifests.tsx
│   ├── QRTickets.tsx
│   ├── Waivers.tsx
│   ├── Promotions.tsx
│   ├── Agents.tsx
│   ├── Reports.tsx
│   └── Integrations.tsx
├── lib/                # Utility functions
│   ├── storage.ts      # Data management
│   ├── resourceAvailability.ts
│   ├── pricingEngine.ts
│   └── validation.ts
├── types/              # TypeScript type definitions
│   ├── index.ts
│   ├── guides.ts
│   ├── pricing.ts
│   ├── addons.ts
│   ├── policies.ts
│   ├── communications.ts
│   ├── manifests.ts
│   ├── qrTickets.ts
│   ├── waivers.ts
│   ├── promotions.ts
│   ├── agents.ts
│   ├── reports.ts
│   └── integrations.ts
├── config/             # Configuration files
│   └── features.ts     # Feature flags
├── tests/              # Test files
│   ├── unit/           # Unit tests
│   └── e2e/            # E2E tests
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🚀 Performance

- **Bundle Size:** Optimized with code splitting
- **Loading Time:** < 3 seconds initial load
- **Runtime Performance:** 60fps animations
- **Memory Usage:** Efficient state management
- **Caching:** Smart localStorage caching

## 🔧 Development

### Code Quality
- **TypeScript:** Strict mode enabled
- **ESLint:** Code linting with strict rules
- **Prettier:** Code formatting
- **Husky:** Git hooks for quality checks

### Development Workflow
1. Create feature branch
2. Implement feature with tests
3. Run quality checks
4. Create pull request
5. Code review
6. Merge to main
7. Deploy to production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Implement your feature with tests
4. Run quality checks (`npm run lint && npm run test`)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mohammed Gando**
- GitHub: [@Gando93](https://github.com/Gando93)
- Email: mohammed.gando@example.com

## 🙏 Acknowledgments

- Built with React and TypeScript
- Styled with Tailwind CSS
- Deployed on Vercel
- Icons by Lucide React
- Testing with Vitest and Playwright
- Animations by Framer Motion

## 📞 Support

For support, email support@aat-management.com or create an issue in the GitHub repository.

---

**Version:** 2.0.0  
**Last Updated:** December 2024  
**Status:** Production Ready ✅