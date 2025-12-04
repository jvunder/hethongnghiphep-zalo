import React, { useState } from 'react';
import { getCurrentUser, getMeals, updateMeal, getTodayStr, formatDate, logout } from '../../state';

const EmpMeal: React.FC = () => {
  const user = getCurrentUser();
  const meals = getMeals();
  const today = getTodayStr();

  const [cancelReason, setCancelReason] = useState('');

  const mealKey = user ? `${user.id}_${today}` : '';
  const todayMeal = meals[mealKey];
  const isCancelled = todayMeal?.status === 'cancelled';

  const handleCancel = async () => {
    if (!user) return;

    await updateMeal(today, {
      userId: user.id,
      userName: user.name,
      date: today,
      status: 'cancelled',
      reason: cancelReason || 'Không cần ăn cơm / 不需要订餐'
    });

    alert('Đã hủy cơm hôm nay / 今日订餐已取消');
    setCancelReason('');
  };

  const handleReregister = async () => {
    if (!user) return;

    await updateMeal(today, {
      userId: user.id,
      userName: user.name,
      date: today,
      status: 'eating',
      reason: ''
    });

    alert('Đã đăng ký lại cơm / 已重新订餐');
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div style={{ padding: 0 }}>
      <div className="header">
        <span>Báo cơm / 订餐</span>
        <button className="header-logout" onClick={handleLogout}>
          Đăng xuất / 退出
        </button>
      </div>
      <div className="content">
        <div className="card">
          <div className="section-title" style={{ marginTop: 0 }}>
            Hôm nay / 今天 ({formatDate(today)})
          </div>

          {isCancelled ? (
            <>
              <div className="status-card status-error">
                ❌ <strong>Đã hủy cơm</strong> / 已取消订餐<br/>
                <small>Lý do / 原因: {todayMeal?.reason || 'Không có'}</small>
              </div>
              <button className="btn btn-success" onClick={handleReregister}>
                🍚 Đăng ký lại cơm / 重新订餐
              </button>
            </>
          ) : (
            <>
              <div className="status-card status-success">
                🍚 <strong>Có cơm</strong> / 已订餐
              </div>
              <div className="form-group">
                <label className="label">Lý do hủy cơm / 取消原因</label>
                <input
                  type="text"
                  className="input"
                  placeholder="VD: Ăn ngoài, có việc bận... / 例如:外出就餐,有事..."
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                />
              </div>
              <button className="btn btn-danger" onClick={handleCancel}>
                ❌ Hủy cơm hôm nay / 取消今日订餐
              </button>
            </>
          )}
        </div>

        <div className="info-box">
          <p><strong>Quy định báo cơm: / 订餐规定:</strong></p>
          <p>• Đi làm = Mặc định <strong>có cơm</strong> / 上班 = 默认<strong>订餐</strong></p>
          <p>• Chỉ cần báo khi muốn <strong>hủy cơm</strong> / 只需在<strong>取消订餐</strong>时申报</p>
          <p>• Nghỉ cả ngày = Tự động cắt cơm / 全天请假 = 自动取消订餐</p>
        </div>
      </div>
    </div>
  );
};

export default EmpMeal;
