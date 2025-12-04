import React, { useState, useEffect } from 'react';
import { subscribe } from '../../state';
import KitchenHome from './Home';
import KitchenMeals from './Meals';
import KitchenLeaves from './Leaves';
import KitchenPassword from './Password';

const KitchenApp: React.FC = () => {
  const [page, setPage] = useState('home');
  const [, forceUpdate] = useState({});

  useEffect(() => {
    return subscribe(() => forceUpdate({}));
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'home': return <KitchenHome onNavigate={setPage} />;
      case 'meals': return <KitchenMeals />;
      case 'leaves': return <KitchenLeaves />;
      case 'password': return <KitchenPassword />;
      default: return <KitchenHome onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-container">
      {renderPage()}

      <div className="bottom-nav">
        <button
          className={`nav-item kitchen ${page === 'home' ? 'active' : ''}`}
          onClick={() => setPage('home')}
        >
          <div className="nav-icon">🏠</div>
          <div>Trang chủ / 首页</div>
        </button>
        <button
          className={`nav-item kitchen ${page === 'meals' ? 'active' : ''}`}
          onClick={() => setPage('meals')}
        >
          <div className="nav-icon">🍚</div>
          <div>Ăn cơm / 用餐</div>
        </button>
        <button
          className={`nav-item kitchen ${page === 'leaves' ? 'active' : ''}`}
          onClick={() => setPage('leaves')}
        >
          <div className="nav-icon">📅</div>
          <div>Nghỉ phép / 请假</div>
        </button>
      </div>
    </div>
  );
};

export default KitchenApp;
