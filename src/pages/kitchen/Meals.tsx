import React, { useState, useMemo } from 'react';
import { getUsers, getLeaves, getMeals, getTodayStr, formatDate, logout } from '../../state';

type FilterType = 'today' | 'week' | 'month';
type GroupBy = 'none' | 'department';

const KitchenMeals: React.FC = () => {
  const users = getUsers();
  const leaves = getLeaves();
  const meals = getMeals();
  const today = getTodayStr();

  const [filter, setFilter] = useState<FilterType>('today');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');

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
    const eating: typeof employees = [];
    const cancelled: typeof employees = [];

    employees.forEach(emp => {
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

    return { eating, cancelled, total: employees.length };
  };

  // Get today's meal data
  const todayMealData = getMealDataForDate(today);

  // Calculate statistics for week/month
  const stats = useMemo(() => {
    const dates = getDateRange();
    let totalMeals = 0;
    let totalCancelled = 0;
    const byDepartment: Record<string, { eating: number; cancelled: number }> = {};

    dates.forEach(date => {
      const data = getMealDataForDate(date);
      totalMeals += data.eating.length;
      totalCancelled += data.cancelled.length;

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

    return { totalMeals, totalCancelled, byDepartment, days: dates.length };
  }, [filter, employees, leaves, meals]);

  // Group today's meal list by department
  const groupedMealList = useMemo(() => {
    if (groupBy === 'none') return null;

    const groups: Record<string, typeof employees> = {};
    todayMealData.eating.forEach(emp => {
      if (!groups[emp.department]) groups[emp.department] = [];
      groups[emp.department].push(emp);
    });
    return groups;
  }, [todayMealData.eating, groupBy]);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div style={{ padding: 0 }}>
      <div className="header kitchen">
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

        {/* Today View */}
        {filter === 'today' && (
          <>
            <div className="card" style={{ marginBottom: 16, background: '#ecfdf5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#059669' }}>Hôm nay / 今天</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#047857' }}>{formatDate(today)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 36, fontWeight: 'bold', color: '#059669' }}>
                    {todayMealData.eating.length}
                  </div>
                  <div style={{ fontSize: 14, color: '#059669' }}>suất cơm / 份餐</div>
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

            {/* Group By */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                className={`btn btn-sm ${groupBy === 'none' ? 'btn-success' : 'btn-secondary'}`}
                onClick={() => setGroupBy('none')}
                style={{ background: groupBy === 'none' ? '#059669' : undefined }}
              >
                Danh sách
              </button>
              <button
                className={`btn btn-sm ${groupBy === 'department' ? 'btn-success' : 'btn-secondary'}`}
                onClick={() => setGroupBy('department')}
                style={{ background: groupBy === 'department' ? '#059669' : undefined }}
              >
                Theo phòng ban
              </button>
            </div>

            {/* Meal List */}
            <div className="section-title">Danh sách ăn cơm / 用餐名单</div>

            {todayMealData.eating.length === 0 ? (
              <div className="empty">Không có ai ăn cơm / 无人用餐</div>
            ) : groupBy === 'none' ? (
              todayMealData.eating.map((emp, idx) => (
                <div key={idx} className="list-item">
                  <div className="list-item-header">
                    <span className="list-item-title">{emp.name}</span>
                    <span className="badge badge-approved">🍚</span>
                  </div>
                  <div className="list-item-subtitle">{emp.department}</div>
                </div>
              ))
            ) : (
              Object.entries(groupedMealList || {}).map(([dept, emps]) => (
                <div key={dept}>
                  <div style={{
                    background: '#d1fae5',
                    padding: '8px 12px',
                    borderRadius: 8,
                    marginBottom: 8,
                    fontWeight: 600,
                    color: '#047857'
                  }}>
                    {dept} ({emps.length} người)
                  </div>
                  {emps.map((emp, idx) => (
                    <div key={idx} className="list-item">
                      <div className="list-item-header">
                        <span className="list-item-title">{emp.name}</span>
                        <span className="badge badge-approved">🍚</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}

            {/* Cancelled List */}
            {todayMealData.cancelled.length > 0 && (
              <>
                <div className="section-title" style={{ marginTop: 20 }}>Không ăn cơm / 不用餐</div>
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
                <div className="stat-value" style={{ color: '#059669' }}>
                  {stats.totalMeals > 0 ? Math.round((stats.totalMeals / (stats.totalMeals + stats.totalCancelled)) * 100) : 0}%
                </div>
                <div className="stat-label">Tỷ lệ ăn / 用餐率</div>
              </div>
            </div>

            {/* Summary */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                Tổng hợp {filter === 'week' ? '7 ngày' : '30 ngày'} qua
              </div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>
                <p>• Tổng suất cơm: <strong style={{ color: '#059669' }}>{stats.totalMeals}</strong></p>
                <p>• Tổng hủy: <strong style={{ color: '#ef4444' }}>{stats.totalCancelled}</strong></p>
                <p>• Trung bình/ngày: <strong>{Math.round(stats.totalMeals / stats.days)}</strong> suất</p>
              </div>
            </div>

            {/* By Department */}
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
      </div>
    </div>
  );
};

export default KitchenMeals;
