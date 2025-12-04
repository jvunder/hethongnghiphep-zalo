import React, { useEffect, useState, useRef } from 'react';
import { configAppView } from 'zmp-sdk/apis';
import { getCurrentUser, restoreSession, initData, subscribe } from './state';
import Login from './pages/Login';
import EmployeeApp from './pages/employee';
import ManagerApp from './pages/manager';
import KitchenApp from './pages/kitchen';
import 'zmp-ui/zaui.css';
import './app.css';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const MyApp: React.FC = () => {
  const [, forceUpdate] = useState({});
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Configure Zalo Mini App view
    configAppView({
      hideAndroidBottomNavigationBar: false,
      hideIOSSafeAreaBottom: true,
      actionBar: { hide: true }
    }).catch(() => {});

    // Restore session
    restoreSession().then(() => forceUpdate({})).catch(() => {});

    // Load Firebase data
    initData().then(() => forceUpdate({})).catch(() => {});

    return subscribe(() => forceUpdate({}));
  }, []);

  // Auto logout after 5 minutes of inactivity
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const resetTimer = () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      inactivityTimer.current = setTimeout(() => {
        alert('Phiên đăng nhập hết hạn do không hoạt động / 登录会话因无操作已过期');
        window.location.reload();
      }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });
    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [getCurrentUser()?.id]);

  const user = getCurrentUser();

  if (!user) {
    return <Login onSuccess={() => forceUpdate({})} />;
  }

  switch (user.role) {
    case 'manager':
      return <ManagerApp />;
    case 'kitchen':
      return <KitchenApp />;
    default:
      return <EmployeeApp />;
  }
};

export default MyApp;
