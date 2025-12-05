import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar: string;
  joinDate: string;
  budget: number;
}

interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
  budget: number;
  currency: string;
  createdAt: string;
  settings: {
    allowMemberInvites: boolean;
    requireApproval: boolean;
    budgetNotifications: boolean;
  };
}

interface FamilyContextType {
  family: Family | null;
  setFamily: (family: Family) => void;
  loading: boolean;
  updateFamilySettings: (settings: Partial<Family['settings']>) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'joinDate'>) => void;
  removeFamilyMember: (memberId: string) => void;
  updateFamilyBudget: (newBudget: number) => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

interface FamilyProviderProps {
  children: ReactNode;
}

export const FamilyProvider: React.FC<FamilyProviderProps> = ({ children }) => {
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  // Инициализация семьи при загрузке
  React.useEffect(() => {
    const initializeFamily = () => {
      const mockFamily: Family = {
        id: 'family-1',
        name: 'Семья Ивановых',
        budget: 125430,
        currency: 'RUB',
        createdAt: '2024-01-01',
        members: [
          {
            id: '1',
            name: 'Иван Иванов',
            email: 'ivan@example.com',
            role: 'admin',
            avatar: 'I',
            joinDate: '2024-01-01',
            budget: 50000
          },
          {
            id: '2',
            name: 'Мария Иванова',
            email: 'maria@example.com',
            role: 'member',
            avatar: 'M',
            joinDate: '2024-01-01',
            budget: 40000
          },
          {
            id: '3',
            name: 'Алексей Иванов',
            email: 'alex@example.com',
            role: 'member',
            avatar: 'A',
            joinDate: '2024-02-15',
            budget: 35430
          }
        ],
        settings: {
          allowMemberInvites: true,
          requireApproval: false,
          budgetNotifications: true
        }
      };

      setFamily(mockFamily);
      setLoading(false);
    };

    initializeFamily();
  }, []);

  const updateFamilySettings = (settings: Partial<Family['settings']>) => {
    if (family) {
      setFamily({
        ...family,
        settings: { ...family.settings, ...settings }
      });
    }
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id' | 'joinDate'>) => {
    if (family) {
      const newMember: FamilyMember = {
        ...member,
        id: Date.now().toString(),
        joinDate: new Date().toISOString().split('T')[0]
      };

      setFamily({
        ...family,
        members: [...family.members, newMember]
      });
    }
  };

  const removeFamilyMember = (memberId: string) => {
    if (family) {
      setFamily({
        ...family,
        members: family.members.filter(member => member.id !== memberId)
      });
    }
  };

  const updateFamilyBudget = (newBudget: number) => {
    if (family) {
      setFamily({
        ...family,
        budget: newBudget
      });
    }
  };

  const value: FamilyContextType = {
    family,
    setFamily,
    loading,
    updateFamilySettings,
    addFamilyMember,
    removeFamilyMember,
    updateFamilyBudget
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = (): FamilyContextType => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};

export default FamilyContext;