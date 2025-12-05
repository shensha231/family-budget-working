export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  familyId?: string;
  role: 'admin' | 'member';
  preferences: UserPreferences;
  settings: UserSettings;
  statistics: UserStatistics;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isActive: boolean;
  emailVerified: boolean;
}

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  theme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  animations: boolean;
  notifications: boolean;
}

export interface UserSettings {
  security: {
    twoFactorAuth: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    marketingEmails: boolean;
  };
  data: {
    autoBackup: boolean;
    exportFormat: 'json' | 'csv' | 'pdf';
    retentionPeriod: number;
  };
}

export interface UserStatistics {
  totalTransactions: number;
  categoriesUsed: number;
  goalsCreated: number;
  goalsCompleted: number;
  daysActive: number;
  currentStreak: number;
  longestStreak: number;
  moneySaved: number;
  moneyInvested: number;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  action?: {
    label: string;
    url: string;
  };
  category: 'system' | 'family' | 'transaction' | 'goal';
}