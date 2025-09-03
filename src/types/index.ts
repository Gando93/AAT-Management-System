// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'guide';
  avatar?: string;
  permissions: string[];
  phone?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// App State Types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId?: string;
  relatedId?: string;
  relatedType?: 'booking' | 'tour' | 'vehicle' | 'customer';
  read: boolean;
  createdAt: Date;
}

export type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'createdAt' | 'read'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
