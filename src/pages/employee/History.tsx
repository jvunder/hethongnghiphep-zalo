import React from 'react';
import { getCurrentUser, getLeaves, formatDate, logout } from '../../state';

const timeLabels: Record<string, string> = {
  full: 'Cả ngày / 全天',
  morning: 'Buổi sáng / 上午',
  afternoon: 'Buổi chiều / 下午'
};

const EmpHistory: React.FC = () => {
  const user = getCurrentUser();
  const leaves = getLeaves();

  const myLeaves = leaves.filter(l => l.userId === user?.id);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div style={{ padding: 0 }}>
      <div className="header">
        <span>Lịch sử nghỉ phép / 请假记录</span>
        <button className="header-logout" onClick={handleLogout}>
          Đăng xuất / 退出
        </button>
      </div>
      <div className="content">
        {myLeaves.length === 0 ? (
          <div className="empty">
            Chưa có lịch sử nghỉ phép / 暂无请假记录
          </div>
        ) : (
          myLeaves.map((leave, idx) => (
            <div key={idx} className="list-item">
              <div className="list-item-header">
                <span className="list-item-title">{formatDate(leave.date)}</span>
                <span className={`badge badge-${leave.status}`}>
                  {leave.status === 'approved' ? 'Đã duyệt / 已批准' :
                   leave.status === 'rejected' ? 'Từ chối / 已拒绝' : 'Chờ duyệt / 待审批'}
                </span>
              </div>
              <div className="text-small">{timeLabels[leave.time]}</div>
              <div className="text-small">Lý do / 原因: {leave.reason}</div>
              {leave.isLate && (
                <div className="text-small text-orange">
                  ⚠️ Báo nghỉ đột xuất / 临时请假
                </div>
              )}
              {leave.cancelMeal && !leave.isLate && (
                <div className="text-small">🍚 Đã cắt cơm / 已取消订餐</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmpHistory;
