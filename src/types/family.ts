export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar: string;
  joinDate: string;
  budget: number;
  isActive: boolean;
  lastActive?: string;
  permissions: FamilyMemberPermissions;
  settings: FamilyMemberSettings;
}

export interface FamilyMemberPermissions {
  canInvite: boolean;
  canEditBudget: boolean;
  canDeleteTransactions: boolean;
  canManageCategories: boolean;
  canViewAllTransactions: boolean;
  canExportData: boolean;
}

export interface FamilyMemberSettings {
  notifications: {
    transaction: boolean;
    budget: boolean;
    report: boolean;
    family: boolean;
  };
  privacy: {
    showBalance: boolean;
    showTransactions: boolean;
    showBudget: boolean;
  };
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  currency: string;
  budget: number;
  members: FamilyMember[];
  settings: FamilySettings;
  createdAt: string;
  updatedAt: string;
  inviteCode?: string;
  isActive: boolean;
}

export interface FamilySettings {
  security: {
    allowMemberInvites: boolean;
    requireApproval: boolean;
    maxMembers: number;
    allowGuestAccess: boolean;
  };
  notifications: {
    budgetAlerts: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
    familyActivity: boolean;
  };
  features: {
    allowDebts: boolean;
    allowGoals: boolean;
    allowRecurring: boolean;
    allowCategories: boolean;
  };
  privacy: {
    showFamilyBalance: boolean;
    showMemberBalances: boolean;
    showTransactionDetails: boolean;
  };
}

export interface FamilyInvite {
  id: string;
  email: string;
  role: 'admin' | 'member';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  code: string;
}

export interface FamilyStats {
  totalMembers: number;
  activeMembers: number;
  totalBudget: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  transactionsThisMonth: number;
  goalsCompleted: number;
  goalsTotal: number;
}

export interface FamilyActivity {
  id: string;
  type: 'transaction' | 'member' | 'settings' | 'goal';
  action: string;
  memberId: string;
  memberName: string;
  timestamp: string;
  details?: any;
}