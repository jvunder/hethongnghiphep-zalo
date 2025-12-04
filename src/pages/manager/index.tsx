import React, { useState, useEffect } from 'react';
import { subscribe } from '../../state';
import MgrHome from './Home';
import MgrLeaves from './Leaves';
import MgrMeals from './Meals';
import MgrEmployees from './Employees';
import MgrPassword from './Password';

const ManagerApp: React.FC = () => {
  const [page, setPage] = useState('home');
  const [, forceUpdate] = useState({});

  useEffect(() => {
    return subscribe(() => forceUpdate({}));
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'home': return <MgrHome onNavigate={setPage} />;
      case 'leaves': return <MgrLeaves />;
      case 'meals': return <MgrMeals />;
      case 'employees': return <MgrEmployees />;
      case 'password': return <MgrPassword />;
      default: return <MgrHome onNavigate={setPage} />;
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
          className={`nav-item ${page === 'leaves' ? 'active' : ''}`}
          onClick={() => setPage('leaves')}
        >
          <div className="nav-icon">📋</div>
          <div>Theo dõi / 查看</div>
        </button>
        <button
          className={`nav-item ${page === 'meals' ? 'active' : ''}`}
          onClick={() => setPage('meals')}
        >
          <div className="nav-icon">🍚</div>
          <div>Báo cơm / 订餐</div>
        </button>
        <button
          className={`nav-item ${page === 'employees' ? 'active' : ''}`}
          onClick={() => setPage('employees')}
        >
          <div className="nav-icon">👥</div>
          <div>Nhân viên / 员工</div>
        </button>
      </div>
    </div>
  );
};

export default ManagerApp;
