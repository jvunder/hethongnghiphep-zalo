import React, { useState, useMemo } from 'react';
import { getLeaves, getUsers, formatDate, logout } from '../../state';

const timeLabels: Record<string, string> = {
  full: 'Cả ngày / 全天',
  morning: 'Buổi sáng / 上午',
  afternoon: 'Buổi chiều / 下午'
};

type FilterType = 'all' | 'approved' | 'today' | 'week' | 'month';
type GroupBy = 'none' | 'employee' | 'department';

const MgrLeaves: React.FC = () => {
  const leaves = getLeaves();
  const users = getUsers();
  const [filter, setFilter] = useState<FilterType>('approved');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(users.map(u => u.department));
    return Array.from(depts).sort();
  }, [users]);

  // Get unique employees
  const employees = useMemo(() => {
    return users.filter(u => u.role === 'employee').sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  // Filter leaves based on time period
  const filteredLeaves = useMemo(() => {
    let result = [...leaves];

    // Filter by time period
    if (filter === 'today') {
      result = result.filter(l => l.date === todayStr);
    } else if (filter === 'approved') {
      result = result.filter(l => l.status === 'approved');
    } else if (filter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter(l => new Date(l.date) >= weekAgo);
    } else if (filter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      result = result.filter(l => new Date(l.date) >= monthAgo);
    }

    // Filter by employee
    if (selectedEmployee) {
      result = result.filter(l => l.userId.toString() === selectedEmployee);
    }

    // Filter by department
    if (selectedDepartment) {
      result = result.filter(l => l.department === selectedDepartment);
    }

    // Sort by date descending
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
  }, [leaves, filter, selectedEmployee, selectedDepartment, todayStr]);

  // Group leaves
  const groupedLeaves = useMemo(() => {
    if (groupBy === 'none') return null;

    const groups: Record<string, typeof filteredLeaves> = {};

    filteredLeaves.forEach(leave => {
      const key = groupBy === 'employee' ? leave.userName : leave.department;
      if (!groups[key]) groups[key] = [];
      groups[key].push(leave);
    });

    return groups;
  }, [filteredLeaves, groupBy]);

  // Statistics
  const stats = useMemo(() => {
    const approved = filteredLeaves.filter(l => l.status === 'approved').length;
    const rejected = filteredLeaves.filter(l => l.status === 'rejected').length;
    const late = filteredLeaves.filter(l => l.isLate).length;
    const cancelMeal = filteredLeaves.filter(l => l.cancelMeal).length;
    return { total: filteredLeaves.length, approved, rejected, late, cancelMeal };
  }, [filteredLeaves]);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const renderLeaveItem = (leave: typeof leaves[0], idx: number) => (
    <div key={idx} className="list-item">
      <div className="list-item-header">
        <span className="list-item-title">{leave.userName}</span>
        <span className={`badge badge-${leave.status}`}>
          {leave.status === 'approved' ? 'Đã duyệt / 已批准' :
           leave.status === 'rejected' ? 'Từ chối / 已拒绝' : 'Chờ duyệt / 待审批'}
        </span>
      </div>
      <div className="list-item-subtitle">{leave.department}</div>
      <div className="text-small">📅 {formatDate(leave.date)} - {timeLabels[leave.time]}</div>
      <div className="text-small">Lý do / 原因: {leave.reason}</div>
      {leave.isLate && (
        <div className="text-small text-orange">
          ⚠️ Báo nghỉ đột xuất / 临时请假
        </div>
      )}
      {leave.cancelMeal && !leave.isLate && (
        <div className="text-small">🍚 Cắt cơm / 取消订餐</div>
      )}
    </div>
  );

  return (
    <div style={{ padding: 0 }}>
      <div className="header">
        <span>Báo cáo nghỉ phép / 请假报告</span>
        <button className="header-logout" onClick={handleLogout}>
          Đăng xuất / 退出
        </button>
      </div>
      <div className="content">
        {/* Time Filter Tabs */}
        <div className="tabs" style={{ marginBottom: 12 }}>
          <button className={`tab ${filter === 'today' ? 'active' : ''}`} onClick={() => setFilter('today')}>
            Hôm nay
          </button>
          <button className={`tab ${filter === 'week' ? 'active' : ''}`} onClick={() => setFilter('week')}>
            Tuần
          </button>
          <button className={`tab ${filter === 'month' ? 'active' : ''}`} onClick={() => setFilter('month')}>
            Tháng
          </button>
          <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            Tất cả
          </button>
        </div>

        {/* Filter by Employee/Department */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <select
            className="select"
            value={selectedEmployee}
            onChange={e => { setSelectedEmployee(e.target.value); setSelectedDepartment(''); }}
            style={{ flex: 1 }}
          >
            <option value="">-- Nhân viên / 员工 --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
          <select
            className="select"
            value={selectedDepartment}
            onChange={e => { setSelectedDepartment(e.target.value); setSelectedEmployee(''); }}
            style={{ flex: 1 }}
          >
            <option value="">-- Phòng ban / 部门 --</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Group By */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className={`btn btn-sm ${groupBy === 'none' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setGroupBy('none')}
          >
            Không nhóm
          </button>
          <button
            className={`btn btn-sm ${groupBy === 'employee' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setGroupBy('employee')}
          >
            Theo NV
          </button>
          <button
            className={`btn btn-sm ${groupBy === 'department' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setGroupBy('department')}
          >
            Theo PB
          </button>
        </div>

        {/* Statistics */}
        <div className="stats-grid" style={{ marginBottom: 16 }}>
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng đơn / 总数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value green">{stats.approved}</div>
            <div className="stat-label">Đã duyệt / 已批准</div>
          </div>
          <div className="stat-card">
            <div className="stat-value red">{stats.rejected}</div>
            <div className="stat-label">Từ chối / 已拒绝</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.late}</div>
            <div className="stat-label">Đột xuất / 临时</div>
          </div>
        </div>

        {/* Leave List */}
        {filteredLeaves.length === 0 ? (
          <div className="empty">
            Không có đơn nghỉ phép / 暂无请假申请
          </div>
        ) : groupBy === 'none' ? (
          filteredLeaves.map(renderLeaveItem)
        ) : (
          Object.entries(groupedLeaves || {}).map(([group, items]) => (
            <div key={group}>
              <div className="section-title" style={{
                background: '#e5e7eb',
                padding: '8px 12px',
                borderRadius: 8,
                marginBottom: 8
              }}>
                {group} ({items.length} đơn)
              </div>
              {items.map(renderLeaveItem)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MgrLeaves;
