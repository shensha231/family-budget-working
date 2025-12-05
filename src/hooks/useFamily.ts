import { useState, useCallback } from 'react';
import { useFamily as useFamilyContext } from '../contexts/FamilyContext';

interface UseFamilyReturn {
  family: any;
  loading: boolean;
  inviteMember: (email: string, name: string, role: 'admin' | 'member') => Promise<void>;
  removeMember: (memberId: string) => void;
  updateMemberBudget: (memberId: string, budget: number) => void;
  updateFamilyBudget: (budget: number) => void;
  updateSettings: (settings: any) => void;
  error: string | null;
  clearError: () => void;
}

export const useFamily = (): UseFamilyReturn => {
  const { 
    family, 
    loading, 
    addFamilyMember, 
    removeFamilyMember, 
    updateFamilyBudget: contextUpdateBudget,
    updateFamilySettings 
  } = useFamilyContext();
  
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const inviteMember = useCallback(async (email: string, name: string, role: 'admin' | 'member') => {
    try {
      setError(null);
      
      // Проверяем, не существует ли уже участник с таким email
      if (family?.members.some((member: any) => member.email === email)) {
        throw new Error('Участник с таким email уже существует');
      }

      addFamilyMember({
        name,
        email,
        role,
        avatar: name.charAt(0).toUpperCase(),
        budget: 0
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка приглашения участника');
      throw err;
    }
  }, [family, addFamilyMember]);

  const removeMember = useCallback((memberId: string) => {
    try {
      setError(null);
      removeFamilyMember(memberId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления участника');
    }
  }, [removeFamilyMember]);

  const updateMemberBudget = useCallback((memberId: string, budget: number) => {
    try {
      setError(null);
      // Здесь должна быть логика обновления бюджета участника
      // В реальном приложении это бы делалось через API
      console.log(`Updating member ${memberId} budget to ${budget}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления бюджета');
    }
  }, []);

  const updateFamilyBudget = useCallback((budget: number) => {
    try {
      setError(null);
      contextUpdateBudget(budget);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления бюджета семьи');
    }
  }, [contextUpdateBudget]);

  const updateSettings = useCallback((settings: any) => {
    try {
      setError(null);
      updateFamilySettings(settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления настроек');
    }
  }, [updateFamilySettings]);

  return {
    family,
    loading,
    inviteMember,
    removeMember,
    updateMemberBudget,
    updateFamilyBudget,
    updateSettings,
    error,
    clearError
  };
};