# AAT Tour Management System

A comprehensive tour management solution built with React, TypeScript, and Tailwind CSS. This system provides complete functionality for managing tours, bookings, customers, fleet, and users with a modern, responsive interface.

## 🚀 Live Demo

**Production URL:** https://aat-management-system-2euyjeafa-mohammed-gando-bahs-projects.vercel.app

## ✨ Features

### 🎯 Core Functionality
- **Complete CRUD Operations** for all entities (Tours, Bookings, Customers, Fleet, Users)
- **Real-time Data Management** with localStorage persistence
- **Professional Receipt Generation** with PDF export for confirmed bookings
- **Advanced Notification System** with latest notifications at the top
- **Responsive Design** that works on all devices

### 🎨 User Interface
- **Modern UI/UX** with gradient backgrounds and smooth animations
- **Intuitive Navigation** with clear visual hierarchy
- **Professional Dashboard** with real-time statistics and KPIs
- **Clean, Streamlined Design** without clutter
- **Interactive Elements** with hover effects and transitions

### 📊 Management Features
- **Dashboard** - Overview with key metrics and quick actions
- **Bookings Management** - Complete booking lifecycle management
- **Tours Management** - Tour creation, editing, and capacity tracking
- **Fleet Management** - Vehicle status and driver assignment
- **Customer Management** - Customer profiles and booking history
- **User Management** - System users and permissions

### 🔧 Technical Features
- **TypeScript** for type safety and better development experience
- **React Hooks** for efficient state management
- **Framer Motion** for smooth animations
- **Tailwind CSS** for responsive styling
- **PDF Generation** with jsPDF for receipts
- **Error Handling** with comprehensive try-catch blocks
- **Data Validation** throughout the application

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **PDF Generation:** jsPDF
- **Icons:** Lucide React
- **Build Tool:** Vite
- **Deployment:** Vercel

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

4. **Build for production**
   ```bash
   npm run build
   ```

## 🚀 Deployment

The application is automatically deployed to Vercel. To deploy manually:

```bash
vercel --prod
```

## 📱 Usage

### Dashboard
- View real-time statistics and KPIs
- Quick access to common actions
- Recent bookings overview

### Bookings Management
- Create, edit, and delete bookings
- Confirm bookings and mark as paid
- Generate professional PDF receipts
- Export data to CSV and PDF

### Tours Management
- Manage tour offerings and packages
- Track capacity and availability
- Set pricing and descriptions

### Fleet Management
- Monitor vehicle status and location
- Assign drivers to vehicles
- Track fuel levels and maintenance

### Customer Management
- Maintain customer profiles
- Track booking history and spending
- Manage contact information

## 🎨 UI/UX Improvements

- **User Profile** positioned in top-right for better accessibility
- **Clean Header** without duplicate branding
- **Latest Notifications** displayed at the top
- **Professional Receipts** with enhanced formatting
- **Responsive Design** optimized for all screen sizes
- **Smooth Animations** for better user experience

## 🔒 Data Management

- **LocalStorage** for data persistence
- **Real-time Updates** across all components
- **Data Validation** before saving operations
- **Error Handling** with user-friendly messages
- **Backup and Restore** functionality

## 📄 Receipt Generation

- **Professional PDF Receipts** for confirmed bookings
- **Enhanced Formatting** with proper headers and styling
- **Customer Details** including contact information
- **Tour Information** with pricing and dates
- **Payment Details** with status tracking

## 🎯 Key Improvements Made

1. **Enhanced Receipt Generation** - Professional PDF receipts for confirmed bookings and payments
2. **Improved Notification System** - Latest notifications at the top with better UI
3. **Better UI/UX** - User profile repositioned, removed duplicate headers
4. **Robust Error Handling** - Comprehensive error handling throughout the system
5. **Data Validation** - Proper validation before all operations
6. **Modern Design** - Gradient backgrounds, smooth animations, responsive layout

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BookingModal.tsx
│   ├── CustomerModal.tsx
│   ├── TourModal.tsx
│   ├── UserModal.tsx
│   ├── VehicleModal.tsx
│   └── UserDropdown.tsx
├── lib/                # Utility functions
│   └── storage.ts      # Data management
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mohammed Gando**
- GitHub: [@Gando93](https://github.com/Gando93)

## 🙏 Acknowledgments

- Built with React and TypeScript
- Styled with Tailwind CSS
- Deployed on Vercel
- Icons by Lucide React
