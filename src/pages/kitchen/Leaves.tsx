import React from 'react';
import { getLeaves, getTodayStr, formatDate, logout } from '../../state';

const timeLabels: Record<string, string> = {
  full: 'Cả ngày / 全天',
  morning: 'Buổi sáng / 上午',
  afternoon: 'Buổi chiều / 下午'
};

const KitchenLeaves: React.FC = () => {
  const leaves = getLeaves();
  const today = getTodayStr();

  const todayLeaves = leaves.filter(l => l.date === today && l.status === 'approved');

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div style={{ padding: 0 }}>
      <div className="header kitchen">
        <span>Danh sách nghỉ hôm nay / 今日请假名单</span>
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
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ef4444' }}>{todayLeaves.length}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>người nghỉ / 人请假</div>
            </div>
          </div>
        </div>

        <div className="section-title">Danh sách nghỉ phép / 请假名单</div>

        {todayLeaves.length === 0 ? (
          <div className="empty">
            Không có ai nghỉ hôm nay / 今天无人请假
          </div>
        ) : (
          todayLeaves.map((leave, idx) => (
            <div key={idx} className="list-item">
              <div className="list-item-header">
                <span className="list-item-title">{leave.userName}</span>
                <span className="badge badge-rejected">📅</span>
              </div>
              <div className="list-item-subtitle">{leave.department}</div>
              <div className="text-small">{timeLabels[leave.time]}</div>
              {leave.cancelMeal && (
                <div className="text-small">🍚 Cắt cơm / 取消订餐</div>
              )}
              {leave.isLate && (
                <div className="text-small text-orange">
                  ⚠️ Báo nghỉ đột xuất / 临时请假
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KitchenLeaves;
