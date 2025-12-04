import React, { useState } from 'react';
import { getUsers, createUser, editUser, removeUser, logout } from '../../state';
import { User } from '../../types';

const MgrEmployees: React.FC = () => {
  const users = getUsers();
  const employees = users.filter(u => u.role === 'employee');

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setPassword('');
    setDepartment('');
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setUsername(user.username);
    setPassword(user.password);
    setDepartment(user.department);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name || !username || !password || !department) {
      alert('Vui lòng nhập đầy đủ thông tin / 请填写完整信息');
      return;
    }

    if (editingUser) {
      await editUser({
        ...editingUser,
        name,
        username,
        password,
        department
      });
      alert('Cập nhật thành công / 更新成功');
    } else {
      await createUser({
        name,
        username,
        password,
        department,
        role: 'employee'
      });
      alert('Thêm nhân viên thành công / 添加员工成功');
    }
    setShowModal(false);
  };

  const handleDelete = async (user: User) => {
    if (confirm(`Xóa nhân viên ${user.name}? / 删除员工 ${user.name}?`)) {
      await removeUser(user.id);
      alert('Đã xóa nhân viên / 已删除员工');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div style={{ padding: 0 }}>
      <div className="header">
        <span>Quản lý nhân viên / 员工管理</span>
        <button className="header-logout" onClick={handleLogout}>
          Đăng xuất / 退出
        </button>
      </div>
      <div className="content">
        <button className="btn btn-primary" onClick={openAddModal} style={{ marginBottom: 16, marginTop: 0 }}>
          ➕ Thêm nhân viên / 添加员工
        </button>

        {employees.length === 0 ? (
          <div className="empty">
            Chưa có nhân viên / 暂无员工
          </div>
        ) : (
          employees.map((emp, idx) => (
            <div key={idx} className="list-item">
              <div className="list-item-header">
                <span className="list-item-title">{emp.name}</span>
              </div>
              <div className="list-item-subtitle">{emp.department}</div>
              <div className="text-small">@{emp.username}</div>
              <div className="btn-row">
                <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(emp)}>
                  ✏️ Sửa / 编辑
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(emp)}>
                  🗑️ Xóa / 删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">
              {editingUser ? 'Sửa nhân viên / 编辑员工' : 'Thêm nhân viên / 添加员工'}
            </div>
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
          </div>
          <div className="form-group">
            <label className="label">Họ và tên / 姓名</label>
            <input
              type="text"
              className="input"
              placeholder="Nguyễn Văn A / 张三"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label">Tên đăng nhập / 用户名</label>
            <input
              type="text"
              className="input"
              placeholder="nv2"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label">Mật khẩu / 密码</label>
            <input
              type="password"
              className="input"
              placeholder="123456"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label">Phòng ban / 部门</label>
            <input
              type="text"
              className="input"
              placeholder="Kỹ thuật / 技术部"
              value={department}
              onChange={e => setDepartment(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            💾 Lưu / 保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default MgrEmployees;
