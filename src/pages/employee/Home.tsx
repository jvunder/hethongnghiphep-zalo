import React from 'react';
import { getCurrentUser, getMeals, getTodayStr, logout } from '../../state';

interface EmpHomeProps {
  onNavigate: (page: string) => void;
}

const EmpHome: React.FC<EmpHomeProps> = ({ onNavigate }) => {
  const user = getCurrentUser();
  const meals = getMeals();
  const today = getTodayStr();

  const mealKey = user ? `${user.id}_${today}` : '';
  const todayMeal = meals[mealKey];
  const mealStatus = todayMeal?.status === 'cancelled'
    ? 'Đã hủy cơm / 已取消订餐'
    : 'Có cơm / 已订餐';
  const mealIcon = todayMeal?.status === 'cancelled' ? '❌' : '🍚';

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
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Báo cơm hôm nay / 今日订餐</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{mealStatus}</div>
            </div>
            <div style={{ fontSize: 32 }}>{mealIcon}</div>
          </div>
        </div>

        <div className="menu-item" onClick={() => onNavigate('leave')}>
          <span className="menu-icon">📅</span>
          <span className="menu-text">Xin nghỉ phép / 请假申请</span>
          <span className="menu-arrow">›</span>
        </div>

        <div className="menu-item" onClick={() => onNavigate('meal')}>
          <span className="menu-icon">🍚</span>
          <span className="menu-text">Báo cơm / 订餐</span>
          <span className="menu-arrow">›</span>
        </div>

        <div className="menu-item" onClick={() => onNavigate('history')}>
          <span className="menu-icon">📋</span>
          <span className="menu-text">Lịch sử nghỉ phép / 请假记录</span>
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

export default EmpHome;
