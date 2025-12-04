import React, { useState, useMemo } from 'react';
import { getUsers, getLeaves, getMeals, getTodayStr, formatDate, logout } from '../../state';

type FilterType = 'today' | 'week' | 'month';
type GroupBy = 'none' | 'employee' | 'department';

const MgrMeals: React.FC = () => {
  const users = getUsers();
  const leaves = getLeaves();
  const meals = getMeals();
  const today = getTodayStr();

  const [filter, setFilter] = useState<FilterType>('today');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  const employees = users.filter(u => u.role === 'employee');

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(employees.map(u => u.department));
    return Array.from(depts).sort();
  }, [employees]);

  // Get date range based on filter
  const getDateRange = () => {
    const dates: string[] = [];
    const now = new Date();

    if (filter === 'today') {
      dates.push(today);
    } else if (filter === 'week') {
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }
    } else if (filter === 'month') {
      for (let i = 0; i < 30; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  // Calculate meal data for a specific date
  const getMealDataForDate = (date: string) => {
    let filteredEmployees = employees;
    if (selectedDepartment) {
      filteredEmployees = filteredEmployees.filter(e => e.department === selectedDepartment);
    }

    const eating: typeof employees = [];
    const cancelled: typeof employees = [];

    filteredEmployees.forEach(emp => {
      // Check if on approved leave
      const empLeave = leaves.find(l =>
        l.userId === emp.id && l.date === date && l.status === 'approved'
      );

      if (empLeave && (empLeave.time === 'full' || empLeave.cancelMeal)) {
        cancelled.push(emp);
        return;
      }

      // Check meal status
      const mealKey = `${emp.id}_${date}`;
      const meal = meals[mealKey];

      if (meal?.status === 'cancelled') {
        cancelled.push(emp);
      } else {
        eating.push(emp);
      }
    });

    return { eating, cancelled, total: filteredEmployees.length };
  };

  // Get today's meal data
  const todayMealData = getMealDataForDate(today);

  // Calculate statistics for week/month
  const stats = useMemo(() => {
    const dates = getDateRange();
    let totalMeals = 0;
    let totalCancelled = 0;
    const byEmployee: Record<string, { eating: number; cancelled: number; name: string }> = {};
    const byDepartment: Record<string, { eating: number; cancelled: number }> = {};

    dates.forEach(date => {
      const data = getMealDataForDate(date);
      totalMeals += data.eating.length;
      totalCancelled += data.cancelled.length;

      // By employee
      data.eating.forEach(emp => {
        if (!byEmployee[emp.id]) byEmployee[emp.id] = { eating: 0, cancelled: 0, name: emp.name };
        byEmployee[emp.id].eating++;
      });
      data.cancelled.forEach(emp => {
        if (!byEmployee[emp.id]) byEmployee[emp.id] = { eating: 0, cancelled: 0, name: emp.name };
        byEmployee[emp.id].cancelled++;
      });

      // By department
      data.eating.forEach(emp => {
        if (!byDepartment[emp.department]) byDepartment[emp.department] = { eating: 0, cancelled: 0 };
        byDepartment[emp.department].eating++;
      });
      data.cancelled.forEach(emp => {
        if (!byDepartment[emp.department]) byDepartment[emp.department] = { eating: 0, cancelled: 0 };
        byDepartment[emp.department].cancelled++;
      });
    });

    return { totalMeals, totalCancelled, byEmployee, byDepartment, days: dates.length };
  }, [filter, selectedDepartment, employees, leaves, meals]);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div style={{ padding: 0 }}>
      <div className="header">
        <span>Báo cáo cơm / 订餐报告</span>
        <button className="header-logout" onClick={handleLogout}>
          Đăng xuất / 退出
        </button>
      </div>
      <div className="content">
        {/* Time Filter */}
        <div className="tabs" style={{ marginBottom: 12 }}>
          <button className={`tab ${filter === 'today' ? 'active' : ''}`} onClick={() => setFilter('today')}>
            Hôm nay / 今天
          </button>
          <button className={`tab ${filter === 'week' ? 'active' : ''}`} onClick={() => setFilter('week')}>
            Tuần / 周
          </button>
          <button className={`tab ${filter === 'month' ? 'active' : ''}`} onClick={() => setFilter('month')}>
            Tháng / 月
          </button>
        </div>

        {/* Filter by Department */}
        <select
          className="select"
          value={selectedDepartment}
          onChange={e => setSelectedDepartment(e.target.value)}
          style={{ marginBottom: 12 }}
        >
          <option value="">-- Tất cả phòng ban / 所有部门 --</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        {/* Group By (for week/month) */}
        {filter !== 'today' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              className={`btn btn-sm ${groupBy === 'none' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setGroupBy('none')}
            >
              Tổng hợp
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
        )}

        {/* Today View */}
        {filter === 'today' && (
          <>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>Hôm nay / 今天</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{formatDate(today)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 28, fontWeight: 'bold', color: '#059669' }}>
                    {todayMealData.eating.length}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>suất cơm / 份餐</div>
                </div>
              </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: 16 }}>
              <div className="stat-card">
                <div className="stat-value green">{todayMealData.eating.length}</div>
                <div className="stat-label">Ăn cơm / 用餐</div>
              </div>
              <div className="stat-card">
                <div className="stat-value red">{todayMealData.cancelled.length}</div>
                <div className="stat-label">Không ăn / 不用餐</div>
              </div>
            </div>

            <div className="section-title">Danh sách ăn cơm / 用餐名单</div>
            {todayMealData.eating.length === 0 ? (
              <div className="empty">Không có ai ăn cơm / 无人用餐</div>
            ) : (
              todayMealData.eating.map((emp, idx) => (
                <div key={idx} className="list-item">
                  <div className="list-item-header">
                    <span className="list-item-title">{emp.name}</span>
                    <span className="badge badge-approved">🍚</span>
                  </div>
                  <div className="list-item-subtitle">{emp.department}</div>
                </div>
              ))
            )}

            {todayMealData.cancelled.length > 0 && (
              <>
                <div className="section-title">Không ăn cơm / 不用餐</div>
                {todayMealData.cancelled.map((emp, idx) => (
                  <div key={idx} className="list-item">
                    <div className="list-item-header">
                      <span className="list-item-title">{emp.name}</span>
                      <span className="badge badge-rejected">❌</span>
                    </div>
                    <div className="list-item-subtitle">{emp.department}</div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* Week/Month View */}
        {filter !== 'today' && (
          <>
            <div className="stats-grid" style={{ marginBottom: 16 }}>
              <div className="stat-card">
                <div className="stat-value">{stats.days}</div>
                <div className="stat-label">Số ngày / 天数</div>
              </div>
              <div className="stat-card">
                <div className="stat-value green">{stats.totalMeals}</div>
                <div className="stat-label">Tổng suất / 总份</div>
              </div>
              <div className="stat-card">
                <div className="stat-value red">{stats.totalCancelled}</div>
                <div className="stat-label">Đã hủy / 已取消</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#2563eb' }}>
                  {stats.totalMeals > 0 ? Math.round((stats.totalMeals / (stats.totalMeals + stats.totalCancelled)) * 100) : 0}%
                </div>
                <div className="stat-label">Tỷ lệ ăn / 用餐率</div>
              </div>
            </div>

            {/* Summary View */}
            {groupBy === 'none' && (
              <div className="card">
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                  Tổng hợp {filter === 'week' ? '7 ngày' : '30 ngày'} qua
                </div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>
                  <p>• Tổng suất cơm: <strong>{stats.totalMeals}</strong></p>
                  <p>• Tổng hủy: <strong>{stats.totalCancelled}</strong></p>
                  <p>• Trung bình/ngày: <strong>{Math.round(stats.totalMeals / stats.days)}</strong> suất</p>
                </div>
              </div>
            )}

            {/* By Employee */}
            {groupBy === 'employee' && (
              <>
                <div className="section-title">Theo nhân viên / 按员工</div>
                {Object.entries(stats.byEmployee)
                  .sort((a, b) => b[1].eating - a[1].eating)
                  .map(([id, data]) => (
                    <div key={id} className="list-item">
                      <div className="list-item-header">
                        <span className="list-item-title">{data.name}</span>
                        <span style={{ fontSize: 14, color: '#059669', fontWeight: 600 }}>
                          {data.eating} 🍚
                        </span>
                      </div>
                      <div className="text-small">
                        Ăn: {data.eating} ngày | Hủy: {data.cancelled} ngày |
                        Tỷ lệ: {Math.round((data.eating / (data.eating + data.cancelled)) * 100)}%
                      </div>
                    </div>
                  ))}
              </>
            )}

            {/* By Department */}
            {groupBy === 'department' && (
              <>
                <div className="section-title">Theo phòng ban / 按部门</div>
                {Object.entries(stats.byDepartment)
                  .sort((a, b) => b[1].eating - a[1].eating)
                  .map(([dept, data]) => (
                    <div key={dept} className="list-item">
                      <div className="list-item-header">
                        <span className="list-item-title">{dept}</span>
                        <span style={{ fontSize: 14, color: '#059669', fontWeight: 600 }}>
                          {data.eating} 🍚
                        </span>
                      </div>
                      <div className="text-small">
                        Tổng suất: {data.eating} | Hủy: {data.cancelled} |
                        Tỷ lệ: {Math.round((data.eating / (data.eating + data.cancelled)) * 100)}%
                      </div>
                    </div>
                  ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MgrMeals;
