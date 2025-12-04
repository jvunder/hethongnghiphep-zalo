import React from 'react';
import { getCurrentUser, getUsers, getLeaves, getMeals, getTodayStr, formatDate, logout } from '../../state';

interface KitchenHomeProps {
  onNavigate: (page: string) => void;
}

const KitchenHome: React.FC<KitchenHomeProps> = ({ onNavigate }) => {
  const user = getCurrentUser();
  const users = getUsers();
  const leaves = getLeaves();
  const meals = getMeals();
  const today = getTodayStr();

  const employees = users.filter(u => u.role === 'employee');
  const todayLeaves = leaves.filter(l => l.date === today && l.status === 'approved');

  // Calculate meal count
  let mealCount = employees.length;
  todayLeaves.forEach(l => {
    if (l.time === 'full' || l.cancelMeal) mealCount--;
  });
  Object.values(meals).forEach(m => {
    if (m.date === today && m.status === 'cancelled') mealCount--;
  });

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div style={{ padding: 0 }}>
      <div className="header kitchen">
        <span>Xin chào {user?.name} / 你好</span>
        <button className="header-logout" onClick={handleLogout}>
          Đăng xuất / 退出
        </button>
      </div>
      <div className="content">
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Hôm nay / 今天</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{formatDate(today)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#059669' }}>{mealCount}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>suất cơm / 份餐</div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value green">{mealCount}</div>
            <div className="stat-label">Ăn cơm / 用餐</div>
          </div>
          <div className="stat-card">
            <div className="stat-value red">{todayLeaves.length}</div>
            <div className="stat-label">Nghỉ phép / 请假</div>
          </div>
        </div>

        <div className="menu-item" onClick={() => onNavigate('meals')}>
          <span className="menu-icon">🍚</span>
          <span className="menu-text">Danh sách ăn cơm / 用餐名单</span>
          <span className="menu-arrow">›</span>
        </div>

        <div className="menu-item" onClick={() => onNavigate('leaves')}>
          <span className="menu-icon">📅</span>
          <span className="menu-text">Danh sách nghỉ hôm nay / 今日请假名单</span>
          <span className="menu-arrow">›</span>
        </div>

        <div className="menu-item" onClick={() => onNavigate('password')}>
          <span className="menu-icon">🔒</span>
          <span className="menu-text">Đổi mật khẩu / 修改密码</span>
          <span className="menu-arrow">›</span>
        </div>
      </div>
    </div>
  );
};

export default KitchenHome;
