import type { Booking, User, Vehicle } from '../types';

interface ExtendedBooking extends Booking {
  departureTime?: string;
  addOns?: Array<{
    name: string;
    price: number;
  }>;
  guideId?: string;
}

export interface ExportBooking {
  id: string;
  customerName: string;
  tourName: string;
  tourDate: string;
  departureTime: string;
  adults: number;
  children: number;
  totalPax: number;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  addOns: string;
  vehicle: string;
  guide: string;
  created: string;
  notes: string;
}

export const buildBookingsCSV = (
  bookings: Booking[],
  users: User[] = [],
  vehicles: Vehicle[] = []
): string => {
  const headers = [
    'ID',
    'Customer Name',
    'Tour Name',
    'Tour Date',
    'Departure Time',
    'Adults',
    'Children',
    'Total Pax',
    'Status',
    'Payment Status',
    'Total Amount',
    'Add-ons',
    'Vehicle',
    'Guide',
    'Booking Date',
    'Notes'
  ];

  const userMap = new Map(users.map(user => [user.id, user.name]));
  const vehicleMap = new Map(vehicles.map(vehicle => [vehicle.id, vehicle.name]));

  const csvData = bookings.map(booking => [
    booking.id,
    booking.customerName || '',
    booking.tourName || '',
    booking.tourDate || '',
    (booking as ExtendedBooking).departureTime || 'N/A',
    booking.participants || 0,
    (booking.guests || 0) - (booking.participants || 0),
    booking.guests || 0,
    booking.status || '',
    booking.paymentStatus || 'N/A',
    booking.totalAmount || 0,
    (booking as ExtendedBooking).addOns?.map(addon => addon.name).join(', ') || 'N/A',
    vehicleMap.get(booking.vehicleId || '') || 'N/A',
    userMap.get((booking as ExtendedBooking).guideId || '') || 'N/A',
    booking.bookingDate || '',
    booking.notes || ''
  ]);

  // Escape CSV values and wrap in quotes
  const escapeCsvValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // Escape quotes and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const csvContent = [
    headers.map(escapeCsvValue).join(','),
    ...csvData.map(row => row.map(escapeCsvValue).join(','))
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string = 'bookings.csv'): void => {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download CSV:', error);
    throw new Error('Failed to download CSV file');
  }
};

export const generateBookingReceipt = async (booking: Booking): Promise<void> => {
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Set up the document
    doc.setFontSize(20);
    doc.text('Booking Receipt', 20, 30);
    
    // Add booking details
    doc.setFontSize(12);
    const details = [
      `Booking ID: ${booking.id}`,
      `Customer: ${booking.customerName}`,
      `Tour: ${booking.tourName}`,
      `Date: ${booking.tourDate}`,
      `Time: ${(booking as ExtendedBooking).departureTime || 'N/A'}`,
      `Participants: ${booking.guests || 0}`,
      `Adults: ${booking.participants || 0}`,
      `Children: ${(booking.guests || 0) - (booking.participants || 0)}`,
      `Status: ${booking.status}`,
      `Payment: ${booking.paymentStatus || 'N/A'}`,
      `Total: €${(booking.totalAmount || 0).toFixed(2)}`,
    ];
    
    let yPosition = 50;
    details.forEach(detail => {
      doc.text(detail, 20, yPosition);
      yPosition += 10;
    });
    
    // Add add-ons if any
    if ((booking as ExtendedBooking).addOns && (booking as ExtendedBooking).addOns!.length > 0) {
      yPosition += 10;
      doc.text('Add-ons:', 20, yPosition);
      yPosition += 10;
      (booking as ExtendedBooking).addOns!.forEach(addon => {
        doc.text(`• ${addon.name}: €${addon.price.toFixed(2)}`, 30, yPosition);
        yPosition += 10;
      });
    }
    
    // Add notes if any
    if (booking.notes) {
      yPosition += 10;
      doc.text('Notes:', 20, yPosition);
      yPosition += 10;
      doc.text(booking.notes, 30, yPosition);
    }
    
    // Add footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, pageHeight - 20);
    
    // Save the PDF
    doc.save(`booking-${booking.id}.pdf`);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw new Error('Failed to generate PDF receipt');
  }
};
