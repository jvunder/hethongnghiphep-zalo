import React, { useState } from 'react';
import { getCurrentUser, createLeave, getTodayStr, logout } from '../../state';

interface EmpLeaveProps {
  onSuccess: () => void;
}

const EmpLeave: React.FC<EmpLeaveProps> = ({ onSuccess }) => {
  const user = getCurrentUser();
  const today = getTodayStr();

  const [date, setDate] = useState('');
  const [time, setTime] = useState<'full' | 'morning' | 'afternoon'>('full');
  const [reason, setReason] = useState('');
  const [cancelMeal, setCancelMeal] = useState(false);
  const [isLate, setIsLate] = useState(false);

  const checkLeaveDate = (selectedDate: string) => {
    setDate(selectedDate);
    const selected = new Date(selectedDate);
    const todayDate = new Date(today);
    setIsLate(selected <= todayDate);
  };

  const handleSubmit = async () => {
    if (!date) {
      alert('Vui lòng chọn ngày nghỉ / 请选择请假日期');
      return;
    }

    if (!reason.trim()) {
      alert('Vui lòng nhập lý do / 请输入原因');
      return;
    }

    if (!user) return;

    const shouldCancelMeal = time === 'full' ? true : cancelMeal;

    await createLeave({
      userId: user.id,
      userName: user.name,
      department: user.department,
      date,
      time,
      reason: reason.trim(),
      status: 'approved', // Auto-approve
      cancelMeal: isLate ? false : shouldCancelMeal,
      isLate,
      createdAt: new Date().toISOString()
    });

    alert(isLate
      ? 'Đơn xin nghỉ đã được gửi (Báo nghỉ đột xuất - Không kịp cắt cơm) / 请假申请已提交(临时请假-来不及取消订餐)'
      : 'Đơn xin nghỉ đã được duyệt / 请假申请已批准');

    setDate('');
    setTime('full');
    setReason('');
    setCancelMeal(false);
    onSuccess();
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div style={{ padding: 0 }}>
      <div className="header">
        <span>Xin nghỉ phép / 请假申请</span>
        <button className="header-logout" onClick={handleLogout}>
          Đăng xuất / 退出
        </button>
      </div>
      <div className="content">
        <div className="card">
          <div className="form-group">
            <label className="label">Ngày nghỉ / 请假日期</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={e => checkLeaveDate(e.target.value)}
            />
          </div>

          {isLate && (
            <div className="status-card status-error" style={{ marginBottom: 16 }}>
              🚨 <strong>Báo nghỉ đột xuất! / 临时请假!</strong><br/>
              <small>Phải báo trước đêm hôm trước. Báo hôm nay = KHÔNG KỊP cắt cơm!<br/>必须提前一天晚上申请。当天申请=来不及取消订餐!</small>
            </div>
          )}

          <label className="label">Thời gian / 时间</label>
          <div className="time-options">
            <button
              className={`time-btn ${time === 'full' ? 'active' : ''}`}
              onClick={() => setTime('full')}
            >
              Cả ngày / 全天
            </button>
            <button
              className={`time-btn ${time === 'morning' ? 'active' : ''}`}
              onClick={() => setTime('morning')}
            >
              Buổi sáng / 上午
            </button>
            <button
              className={`time-btn ${time === 'afternoon' ? 'active' : ''}`}
              onClick={() => setTime('afternoon')}
            >
              Buổi chiều / 下午
            </button>
          </div>

          {time !== 'full' && !isLate && (
            <div style={{ marginBottom: 16 }}>
              <label className="label">Cắt cơm? / 取消订餐?</label>
              <div className="time-options">
                <button
                  className={`time-btn ${cancelMeal ? 'active' : ''}`}
                  onClick={() => setCancelMeal(true)}
                >
                  Có, cắt cơm / 是,取消
                </button>
                <button
                  className={`time-btn ${!cancelMeal ? 'active' : ''}`}
                  onClick={() => setCancelMeal(false)}
                >
                  Không, vẫn ăn / 否,保留
                </button>
              </div>
            </div>
          )}

          {time === 'full' && !isLate && (
            <div className="status-card status-warning" style={{ marginBottom: 16 }}>
              ⚠️ Nghỉ cả ngày sẽ <strong>tự động cắt cơm</strong> / 全天请假将<strong>自动取消订餐</strong>
            </div>
          )}

          <div className="form-group">
            <label className="label">Lý do / 原因</label>
            <textarea
              className="textarea"
              placeholder="Nhập lý do nghỉ phép... / 请输入请假原因..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={handleSubmit}>
            Gửi đơn nghỉ phép / 提交申请
          </button>
        </div>

        <div className="info-box">
          <p><strong>Quy định báo nghỉ: / 请假规定:</strong></p>
          <p>• Báo nghỉ <strong>muộn nhất đêm hôm trước</strong> / 最晚<strong>前一天晚上</strong>申请</p>
          <p>• Nghỉ cả ngày → Tự động cắt cơm / 全天请假 → 自动取消订餐</p>
          <p>• Nghỉ nửa ngày → Chọn có cắt cơm hay không / 半天请假 → 选择是否取消订餐</p>
          <p>• Báo nghỉ đột xuất (cùng ngày) → Không kịp cắt cơm / 临时请假(当天) → 来不及取消订餐</p>
        </div>
      </div>
    </div>
  );
};

export default EmpLeave;
