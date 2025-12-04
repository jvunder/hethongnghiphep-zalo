import React, { useState, useEffect } from 'react';
import { getUserInfo } from 'zmp-sdk/apis';
import { getUsers, login, createUser } from '../state';
import { User } from '../types';

interface LoginProps {
  onSuccess: () => void;
}

interface ZaloUser {
  id: string;
  name: string;
  avatar: string;
}

const DEPARTMENTS = [
  'Ban Giám đốc / 董事会',
  'Phòng Kế toán / 财务部',
  'Phòng Nhân sự / 人事部',
  'Phòng Kinh doanh / 销售部',
  'Phòng Kỹ thuật / 技术部',
  'Phòng Sản xuất / 生产部',
  'Bộ phận Bếp / 厨房',
  'Khác / 其他'
];

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [zaloUser, setZaloUser] = useState<ZaloUser | null>(null);
  const [mode, setMode] = useState<'loading' | 'login' | 'register'>('loading');
  const [existingUser, setExistingUser] = useState<User | null>(null);

  // Login form
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  useEffect(() => {
    // Lấy thông tin từ Zalo
    getUserInfo({})
      .then((result) => {
        const info = result.userInfo;
        const zUser: ZaloUser = {
          id: info.id,
          name: info.name,
          avatar: info.avatar
        };
        setZaloUser(zUser);
        setRegName(info.name); // Auto-fill tên từ Zalo

        // Kiểm tra user đã tồn tại trong hệ thống chưa
        const users = getUsers();
        const found = users.find(u => u.zaloId === info.id);

        if (found) {
          setExistingUser(found);
          setMode('login');
        } else {
          setMode('register');
        }
      })
      .catch(() => {
        // Nếu không lấy được Zalo info, hiện form đăng nhập thủ công
        setMode('login');
      });
  }, []);

  const handleLogin = () => {
    if (!existingUser) {
      setError('Không tìm thấy tài khoản / 未找到账户');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu / 请输入密码');
      return;
    }

    if (existingUser.password !== password) {
      setError('Mật khẩu không đúng / 密码错误');
      return;
    }

    login(existingUser);
    setError('');
    onSuccess();
  };

  const handleRegister = async () => {
    if (!regName.trim()) {
      setError('Vui lòng nhập họ tên / 请输入姓名');
      return;
    }
    if (!regDepartment) {
      setError('Vui lòng chọn phòng ban / 请选择部门');
      return;
    }
    if (!regPassword) {
      setError('Vui lòng nhập mật khẩu / 请输入密码');
      return;
    }
    if (regPassword.length < 4) {
      setError('Mật khẩu tối thiểu 4 ký tự / 密码至少4个字符');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp / 确认密码不匹配');
      return;
    }

    try {
      const newUser = await createUser({
        username: zaloUser?.id || regName.toLowerCase().replace(/\s+/g, ''),
        password: regPassword,
        name: regName,
        department: regDepartment,
        role: 'employee',
        zaloId: zaloUser?.id,
        avatar: zaloUser?.avatar
      });

      login(newUser);
      onSuccess();
    } catch (err) {
      setError('Đăng ký thất bại, thử lại sau / 注册失败，请稍后重试');
    }
  };

  const switchToManualLogin = () => {
    setExistingUser(null);
    setMode('login');
  };

  // Loading state
  if (mode === 'loading') {
    return (
      <div className="login-page">
        <div className="login-logo">
          <div className="login-logo-icon">🏢</div>
          <div className="login-logo-text">Đang tải... / 加载中...</div>
        </div>
      </div>
    );
  }

  // Login form cho user đã có tài khoản
  if (mode === 'login' && existingUser) {
    return (
      <div className="login-page">
        <div className="login-logo">
          <div className="login-logo-icon">
            {zaloUser?.avatar ? (
              <img src={zaloUser.avatar} alt="" style={{ width: 80, height: 80, borderRadius: '50%' }} />
            ) : '🏢'}
          </div>
          <div className="login-logo-text">
            Xin chào, {existingUser.name}!<br/>
            你好, {existingUser.name}!
          </div>
        </div>
        <div className="login-card">
          <div className="login-title">Nhập mật khẩu / 输入密码</div>
          {error && <div className="login-error">{error}</div>}

          <div className="info-box" style={{ background: '#f0f9ff', marginBottom: 16 }}>
            <p style={{ color: '#0369a1', margin: 0 }}>
              👤 {existingUser.name}<br/>
              🏢 {existingUser.department}
            </p>
          </div>

          <div className="form-group">
            <label className="label">Mật khẩu / 密码</label>
            <input
              type="password"
              className="input"
              placeholder="Nhập mật khẩu / 请输入密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <button className="btn btn-primary" onClick={handleLogin}>
            Đăng nhập / 登录
          </button>
          <button
            className="btn btn-secondary"
            onClick={switchToManualLogin}
            style={{ marginTop: 10 }}
          >
            Đăng nhập tài khoản khác / 使用其他账户
          </button>
        </div>
      </div>
    );
  }

  // Register form cho user mới
  if (mode === 'register') {
    return (
      <div className="login-page">
        <div className="login-logo">
          <div className="login-logo-icon">
            {zaloUser?.avatar ? (
              <img src={zaloUser.avatar} alt="" style={{ width: 80, height: 80, borderRadius: '50%' }} />
            ) : '🏢'}
          </div>
          <div className="login-logo-text">
            Chào mừng đến hệ thống!<br/>欢迎使用系统!
          </div>
        </div>
        <div className="login-card">
          <div className="login-title">Đăng ký tài khoản / 注册账户</div>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label className="label">Họ và tên / 姓名</label>
            <input
              type="text"
              className="input"
              placeholder="Nhập họ tên / 请输入姓名"
              value={regName}
              onChange={e => setRegName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="label">Phòng ban / 部门</label>
            <select
              className="select"
              value={regDepartment}
              onChange={e => setRegDepartment(e.target.value)}
            >
              <option value="">-- Chọn phòng ban / 选择部门 --</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Mật khẩu / 密码</label>
            <input
              type="password"
              className="input"
              placeholder="Tối thiểu 4 ký tự / 至少4个字符"
              value={regPassword}
              onChange={e => setRegPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="label">Xác nhận mật khẩu / 确认密码</label>
            <input
              type="password"
              className="input"
              placeholder="Nhập lại mật khẩu / 再次输入密码"
              value={regConfirmPassword}
              onChange={e => setRegConfirmPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={handleRegister}>
            Đăng ký / 注册
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setMode('login')}
            style={{ marginTop: 10 }}
          >
            Đã có tài khoản? Đăng nhập / 已有账户？登录
          </button>
        </div>
      </div>
    );
  }

  // Manual login form (fallback)
  return (
    <div className="login-page">
      <div className="login-logo">
        <div className="login-logo-icon">🏢</div>
        <div className="login-logo-text">
          Hệ thống Quản lý Nghỉ phép<br/>请假管理系统
        </div>
      </div>
      <div className="login-card">
        <div className="login-title">Đăng nhập / 登录</div>
        {error && <div className="login-error">{error}</div>}
        <ManualLoginForm onSuccess={onSuccess} setError={setError} />
        <button
          className="btn btn-secondary"
          onClick={() => setMode('register')}
          style={{ marginTop: 10 }}
        >
          Chưa có tài khoản? Đăng ký / 没有账户？注册
        </button>
      </div>
    </div>
  );
};

// Component đăng nhập thủ công
const ManualLoginForm: React.FC<{ onSuccess: () => void; setError: (err: string) => void }> = ({ onSuccess, setError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin / 请填写完整信息');
      return;
    }

    const users = getUsers();
    const user = users.find(u =>
      u.username.toLowerCase() === username.toLowerCase() &&
      u.password === password
    );

    if (!user) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng / 用户名或密码错误');
      return;
    }

    login(user);
    setError('');
    onSuccess();
  };

  return (
    <>
      <div className="form-group">
        <label className="label">Tên đăng nhập / 用户名</label>
        <input
          type="text"
          className="input"
          placeholder="Nhập tên đăng nhập / 请输入用户名"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="label">Mật khẩu / 密码</label>
        <input
          type="password"
          className="input"
          placeholder="Nhập mật khẩu / 请输入密码"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleLogin()}
        />
      </div>
      <button className="btn btn-primary" onClick={handleLogin}>
        Đăng nhập / 登录
      </button>
    </>
  );
};

export default Login;
