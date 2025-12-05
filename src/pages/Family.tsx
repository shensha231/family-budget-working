import React, { useState } from 'react';
import { useFamily } from '../contexts/FamilyContext';
import { useAuth } from '../contexts/AuthContext';
import './Family.css';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joinDate: string;
  budget: number;
  avatar: string;
}

const Family: React.FC = () => {
  const { family, setFamily } = useFamily();
  const { user } = useAuth();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    name: '',
    role: 'member' as 'admin' | 'member'
  });
  const [editData, setEditData] = useState({
    familyName: family?.name || '',
    budget: family?.budget || 0,
    currency: family?.currency || 'RUB'
  });

  // Моковые данные членов семьи
  const [members, setMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Иван Иванов',
      email: 'ivan@example.com',
      role: 'admin',
      joinDate: '2024-01-15',
      budget: 25000,
      avatar: 'I'
    },
    {
      id: '2',
      name: 'Мария Иванова',
      email: 'maria@example.com',
      role: 'member',
      joinDate: '2024-01-15',
      budget: 15000,
      avatar: 'M'
    },
    {
      id: '3',
      name: 'Алексей Иванов',
      email: 'alex@example.com',
      role: 'member',
      joinDate: '2024-02-20',
      budget: 10000,
      avatar: 'A'
    }
  ]);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: inviteData.name,
      email: inviteData.email,
      role: inviteData.role,
      joinDate: new Date().toISOString().split('T')[0],
      budget: 0,
      avatar: inviteData.name.charAt(0).toUpperCase()
    };

    setMembers(prev => [...prev, newMember]);
    setInviteData({ email: '', name: '', role: 'member' });
    setShowInviteForm(false);
  };

  const handleEditFamily = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (family) {
      setFamily({
        ...family,
        name: editData.familyName,
        budget: editData.budget,
        currency: editData.currency
      });
    }
    setShowEditForm(false);
  };

  const removeMember = (memberId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого участника?')) {
      setMembers(prev => prev.filter(member => member.id !== memberId));
    }
  };

  const updateMemberBudget = (memberId: string, newBudget: number) => {
    setMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, budget: newBudget } : member
    ));
  };

  const updateMemberRole = (memberId: string, newRole: 'admin' | 'member') => {
    setMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    ));
  };

  const totalFamilyBudget = members.reduce((sum, member) => sum + member.budget, 0);
  const adminMembers = members.filter(member => member.role === 'admin');
  const regularMembers = members.filter(member => member.role === 'member');

  const isCurrentUserAdmin = user && members.some(member => 
    member.email === user.email && member.role === 'admin'
  );

  return (
    <div className="family-page">
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1>Семья 👨‍👩‍👧‍👦</h1>
            <p>Управление семейными финансами и участниками</p>
          </div>
          {isCurrentUserAdmin && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowEditForm(true)}
            >
              ⚙️ Настройки семьи
            </button>
          )}
        </div>
      </div>

      {/* Статистика семьи */}
      <div className="family-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{members.length}</h3>
            <p>Участников</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>₽{totalFamilyBudget.toLocaleString()}</h3>
            <p>Общий бюджет</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-info">
            <h3>{adminMembers.length}</h3>
            <p>Администраторов</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>₽{Math.round(totalFamilyBudget / members.length).toLocaleString()}</h3>
            <p>Средний бюджет</p>
          </div>
        </div>
      </div>

      {/* Управление участниками */}
      <div className="family-management">
        <div className="section-header">
          <h2>Участники семьи</h2>
          {isCurrentUserAdmin && (
            <button 
              className="btn btn-secondary"
              onClick={() => setShowInviteForm(true)}
            >
              + Пригласить участника
            </button>
          )}
        </div>

        <div className="members-grid">
          {/* Администраторы */}
          {adminMembers.length > 0 && (
            <div className="member-group">
              <h3 className="group-title">👑 Администраторы</h3>
              <div className="members-list">
                {adminMembers.map(member => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    isCurrentUserAdmin={isCurrentUserAdmin}
                    onRemove={removeMember}
                    onBudgetUpdate={updateMemberBudget}
                    onRoleUpdate={updateMemberRole}
                    currentUserEmail={user?.email}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Участники */}
          {regularMembers.length > 0 && (
            <div className="member-group">
              <h3 className="group-title">👥 Участники</h3>
              <div className="members-list">
                {regularMembers.map(member => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    isCurrentUserAdmin={isCurrentUserAdmin}
                    onRemove={removeMember}
                    onBudgetUpdate={updateMemberBudget}
                    onRoleUpdate={updateMemberRole}
                    currentUserEmail={user?.email}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Форма приглашения */}
      {showInviteForm && (
        <div className="form-overlay">
          <div className="invite-form card">
            <div className="form-header">
              <h2>Пригласить участника</h2>
              <button 
                className="close-btn"
                onClick={() => setShowInviteForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleInviteSubmit}>
              <div className="form-group">
                <label>Имя участника</label>
                <input
                  type="text"
                  value={inviteData.name}
                  onChange={(e) => setInviteData({...inviteData, name: e.target.value})}
                  placeholder="Введите имя"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Роль</label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({...inviteData, role: e.target.value as 'admin' | 'member'})}
                >
                  <option value="member">Участник</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInviteForm(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  Отправить приглашение
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Форма редактирования семьи */}
      {showEditForm && (
        <div className="form-overlay">
          <div className="edit-form card">
            <div className="form-header">
              <h2>Настройки семьи</h2>
              <button 
                className="close-btn"
                onClick={() => setShowEditForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditFamily}>
              <div className="form-group">
                <label>Название семьи</label>
                <input
                  type="text"
                  value={editData.familyName}
                  onChange={(e) => setEditData({...editData, familyName: e.target.value})}
                  placeholder="Введите название семьи"
                  required
                />
              </div>

              <div className="form-group">
                <label>Общий бюджет (₽)</label>
                <input
                  type="number"
                  value={editData.budget}
                  onChange={(e) => setEditData({...editData, budget: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Валюта</label>
                <select
                  value={editData.currency}
                  onChange={(e) => setEditData({...editData, currency: e.target.value})}
                >
                  <option value="RUB">Рубль (₽)</option>
                  <option value="USD">Доллар ($)</option>
                  <option value="EUR">Евро (€)</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditForm(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  Сохранить изменения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Бюджетное распределение */}
      <div className="budget-distribution">
        <h2>Распределение бюджета</h2>
        <div className="distribution-chart">
          {members.map((member, index) => {
            const percentage = totalFamilyBudget > 0 ? (member.budget / totalFamilyBudget) * 100 : 0;
            return (
              <div key={member.id} className="distribution-item">
                <div className="member-budget-info">
                  <div className="member-avatar">{member.avatar}</div>
                  <div className="member-details">
                    <span className="member-name">{member.name}</span>
                    <span className="member-budget">₽{member.budget.toLocaleString()}</span>
                  </div>
                  <span className="budget-percentage">{percentage.toFixed(1)}%</span>
                </div>
                <div className="budget-bar">
                  <div 
                    className="budget-fill"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Компонент карточки участника
interface MemberCardProps {
  member: FamilyMember;
  isCurrentUserAdmin: boolean;
  currentUserEmail?: string;
  onRemove: (id: string) => void;
  onBudgetUpdate: (id: string, budget: number) => void;
  onRoleUpdate: (id: string, role: 'admin' | 'member') => void;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isCurrentUserAdmin,
  currentUserEmail,
  onRemove,
  onBudgetUpdate,
  onRoleUpdate
}) => {
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(member.budget.toString());

  const handleBudgetSave = () => {
    const newBudget = parseFloat(tempBudget) || 0;
    onBudgetUpdate(member.id, newBudget);
    setEditingBudget(false);
  };

  const isCurrentUser = member.email === currentUserEmail;

  return (
    <div className={`member-card ${member.role}`}>
      <div className="member-header">
        <div className="member-avatar">{member.avatar}</div>
        <div className="member-info">
          <h4 className="member-name">
            {member.name}
            {isCurrentUser && <span className="you-badge"> (Вы)</span>}
          </h4>
          <p className="member-email">{member.email}</p>
          <div className="member-meta">
            <span className="member-role">{member.role === 'admin' ? '👑 Админ' : '👥 Участник'}</span>
            <span className="member-join">с {new Date(member.joinDate).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
      </div>

      <div className="member-budget">
        <label>Личный бюджет:</label>
        {editingBudget ? (
          <div className="budget-edit">
            <input
              type="number"
              value={tempBudget}
              onChange={(e) => setTempBudget(e.target.value)}
              onBlur={handleBudgetSave}
              onKeyPress={(e) => e.key === 'Enter' && handleBudgetSave()}
              autoFocus
            />
            <button className="save-btn" onClick={handleBudgetSave}>✓</button>
          </div>
        ) : (
          <div 
            className="budget-display"
            onClick={() => isCurrentUserAdmin && setEditingBudget(true)}
          >
            <span>₽{member.budget.toLocaleString()}</span>
            {isCurrentUserAdmin && <span className="edit-hint">✏️</span>}
          </div>
        )}
      </div>

      {isCurrentUserAdmin && !isCurrentUser && (
        <div className="member-actions">
          <select
            value={member.role}
            onChange={(e) => onRoleUpdate(member.id, e.target.value as 'admin' | 'member')}
            className="role-select"
          >
            <option value="member">Участник</option>
            <option value="admin">Администратор</option>
          </select>
          
          <button 
            className="remove-btn"
            onClick={() => onRemove(member.id)}
            title="Удалить участника"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

export default Family;