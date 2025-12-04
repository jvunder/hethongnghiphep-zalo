import React, { useState, useEffect } from 'react';
import { subscribe } from '../../state';
import EmpHome from './Home';
import EmpLeave from './Leave';
import EmpMeal from './Meal';
import EmpHistory from './History';
import EmpPassword from './Password';

const EmployeeApp: React.FC = () => {
  const [page, setPage] = useState('home');
  const [, forceUpdate] = useState({});

  useEffect(() => {
    return subscribe(() => forceUpdate({}));
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'home': return <EmpHome onNavigate={setPage} />;
      case 'leave': return <EmpLeave onSuccess={() => setPage('history')} />;
      case 'meal': return <EmpMeal />;
      case 'history': return <EmpHistory />;
      case 'password': return <EmpPassword />;
      default: return <EmpHome onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-container">
      {renderPage()}

      <div className="bottom-nav">
        <button
          className={`nav-item ${page === 'home' ? 'active' : ''}`}
          onClick={() => setPage('home')}
        >
          <div className="nav-icon">🏠</div>
          <div>Trang chủ / 首页</div>
        </button>
        <button
          className={`nav-item ${page === 'leave' ? 'active' : ''}`}
          onClick={() => setPage('leave')}
        >
          <div className="nav-icon">📅</div>
          <div>Nghỉ phép / 请假</div>
        </button>
        <button
          className={`nav-item ${page === 'meal' ? 'active' : ''}`}
          onClick={() => setPage('meal')}
        >
          <div className="nav-icon">🍚</div>
          <div>Báo cơm / 订餐</div>
        </button>
        <button
          className={`nav-item ${page === 'history' ? 'active' : ''}`}
          onClick={() => setPage('history')}
        >
          <div className="nav-icon">📋</div>
          <div>Lịch sử / 记录</div>
        </button>
      </div>
    </div>
  );
};

export default EmployeeApp;
