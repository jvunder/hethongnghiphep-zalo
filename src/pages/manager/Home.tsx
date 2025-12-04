import React from 'react';
import { getCurrentUser, getUsers, getLeaves, getMeals, getTodayStr, logout } from '../../state';

interface MgrHomeProps {
  onNavigate: (page: string) => void;
}

const MgrHome: React.FC<MgrHomeProps> = ({ onNavigate }) => {
  const user = getCurrentUser();
  const users = getUsers();
  const leaves = getLeaves();
  const meals = getMeals();
  const today = getTodayStr();

  const totalEmployees = users.filter(u => u.role === 'employee').length;
  const todayLeaves = leaves.filter(l => l.date === today && l.status === 'approved');
  const todayOnLeave = todayLeaves.length;

  // Count meals
  let mealCount = totalEmployees;
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
      <div className="header">
        <span>Xin chào {user?.name} / 你好</span>
        <button className="header-logout" onClick={handleLogout}>
          Đăng xuất / 退出
        </button>
      </div>
      <div className="content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{totalEmployees}</div>
            <div className="stat-label">Nhân viên / 员工</div>
          </div>
          <div className="stat-card">
            <div className="stat-value red">{todayOnLeave}</div>
            <div className="stat-label">Nghỉ hôm nay / 今日请假</div>
          </div>
          <div className="stat-card">
            <div className="stat-value green">{mealCount}</div>
            <div className="stat-label">Suất cơm / 份餐</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalEmployees - todayOnLeave}</div>
            <div className="stat-label">Đi làm / 上班</div>
          </div>
        </div>

        <div className="menu-item" onClick={() => onNavigate('leaves')}>
          <span className="menu-icon">📋</span>
          <span className="menu-text">Theo dõi nghỉ phép / 查看请假</span>
          <span className="menu-arrow">›</span>
        </div>

        <div className="menu-item" onClick={() => onNavigate('meals')}>
          <span className="menu-icon">🍚</span>
          <span className="menu-text">Danh sách cơm / 订餐名单</span>
          <span className="menu-arrow">›</span>
        </div>

        <div className="menu-item" onClick={() => onNavigate('employees')}>
          <span className="menu-icon">👥</span>
          <span className="menu-text">Quản lý nhân viên / 员工管理</span>
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

export default MgrHome;
