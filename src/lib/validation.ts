import type { User, Vehicle, Booking, Customer, Tour } from '../types';

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?\d{6,16}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
};

// User validation
export const validateUser = (user: Partial<User>): string[] => {
  const errors: string[] = [];

  if (!user.name || user.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!user.email || !isValidEmail(user.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!user.role || !['Administrator', 'Manager', 'Agent', 'Viewer'].includes(user.role)) {
    errors.push('Please select a valid role');
  }

  if (!user.status || !['active', 'inactive'].includes(user.status)) {
    errors.push('Please select a valid status');
  }

  return errors;
};

// Vehicle validation
export const validateVehicle = (vehicle: Partial<Vehicle>): string[] => {
  const errors: string[] = [];

  if (!vehicle.name || vehicle.name.trim().length < 2) {
    errors.push('Vehicle name must be at least 2 characters long');
  }

  if (!vehicle.type || vehicle.type.trim().length < 2) {
    errors.push('Vehicle type must be at least 2 characters long');
  }

  if (!vehicle.capacity || vehicle.capacity < 1) {
    errors.push('Capacity must be at least 1');
  }

  if (!vehicle.licensePlate || vehicle.licensePlate.trim().length < 2) {
    errors.push('License plate must be at least 2 characters long');
  }

  if (!vehicle.status || !['available', 'in-use', 'maintenance'].includes(vehicle.status)) {
    errors.push('Please select a valid status');
  }

  return errors;
};

// Booking validation
export const validateBooking = (booking: Partial<Booking>): string[] => {
  const errors: string[] = [];

  if (!booking.customerName || booking.customerName.trim().length < 2) {
    errors.push('Customer name must be at least 2 characters long');
  }

  if (!booking.tourName || booking.tourName.trim().length < 2) {
    errors.push('Tour name must be at least 2 characters long');
  }

  if (!booking.tourDate) {
    errors.push('Tour date is required');
  } else {
    const tourDate = new Date(booking.tourDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tourDate < today) {
      errors.push('Tour date cannot be in the past');
    }
  }

  if (!booking.participants || booking.participants < 1) {
    errors.push('Number of participants must be at least 1');
  }

  if (!booking.totalAmount || booking.totalAmount <= 0) {
    errors.push('Total amount must be greater than 0');
  }

  if (!booking.status || !['pending', 'confirmed', 'cancelled', 'paid'].includes(booking.status)) {
    errors.push('Please select a valid status');
  }

  return errors;
};

// Customer validation
export const validateCustomer = (customer: Partial<Customer>): string[] => {
  const errors: string[] = [];

  if (!customer.name || customer.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!customer.email || !isValidEmail(customer.email)) {
    errors.push('Please enter a valid email address');
  }

  if (customer.phone && !isValidPhone(customer.phone)) {
    errors.push('Please enter a valid phone number');
  }

  return errors;
};

// Tour validation
export const validateTour = (tour: Partial<Tour>): string[] => {
  const errors: string[] = [];

  if (!tour.name || tour.name.trim().length < 2) {
    errors.push('Tour name must be at least 2 characters long');
  }

  if (!tour.description || tour.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (!tour.price || tour.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (!tour.duration || tour.duration.trim().length < 2) {
    errors.push('Duration must be at least 2 characters long');
  }

  if (!tour.maxCapacity || tour.maxCapacity < 1) {
    errors.push('Maximum capacity must be at least 1');
  }

  if (!tour.category || tour.category.trim().length < 2) {
    errors.push('Category must be at least 2 characters long');
  }

  if (!tour.status || !['active', 'inactive'].includes(tour.status)) {
    errors.push('Please select a valid status');
  }

  return errors;
};

// Generic validation helper
export const validateForm = <T>(data: T, validator: (data: T) => string[]): { isValid: boolean; errors: string[] } => {
  const errors = validator(data);
  return {
    isValid: errors.length === 0,
    errors
  };
};
