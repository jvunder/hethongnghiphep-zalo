import React, { useState } from 'react';
import { getCurrentUser, editUser, logout } from '../../state';

const MgrPassword: React.FC = () => {
  const user = getCurrentUser();

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const handleChange = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      alert('Vui lòng nhập đầy đủ thông tin / 请填写完整信息');
      return;
    }

    if (!user) return;

    if (currentPwd !== user.password) {
      alert('Mật khẩu hiện tại không đúng / 当前密码错误');
      return;
    }

    if (newPwd !== confirmPwd) {
      alert('Mật khẩu mới không khớp / 新密码不匹配');
      return;
    }

    if (newPwd.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự / 新密码至少6位');
      return;
    }

    await editUser({ ...user, password: newPwd });
    alert('Đổi mật khẩu thành công / 密码修改成功');
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div style={{ padding: 0 }}>
      <div className="header">
        <span>Đổi mật khẩu / 修改密码</span>
        <button className="header-logout" onClick={handleLogout}>
          Đăng xuất / 退出
        </button>
      </div>
      <div className="content">
        <div className="card">
          <div className="form-group">
            <label className="label">Mật khẩu hiện tại / 当前密码</label>
            <input
              type="password"
              className="input"
              placeholder="Nhập mật khẩu hiện tại / 请输入当前密码"
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label">Mật khẩu mới / 新密码</label>
            <input
              type="password"
              className="input"
              placeholder="Nhập mật khẩu mới / 请输入新密码"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label">Xác nhận mật khẩu mới / 确认新密码</label>
            <input
              type="password"
              className="input"
              placeholder="Nhập lại mật khẩu mới / 请再次输入新密码"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleChange}>
            Đổi mật khẩu / 修改密码
          </button>
        </div>
      </div>
    </div>
  );
};

export default MgrPassword;
