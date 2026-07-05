import { useEffect, useState } from 'react';
import api from '../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return <div className="page"><p>Loading dashboard...</p></div>;

  return (
    <div className="page">
      <h2 style={{ marginBottom: 20, color: '#1e3a5f' }}>Dashboard Overview</h2>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-label">Total Citizens</div>
          <div className="stat-value">{stats.citizens.total}</div>
          <div className="stat-sub">{stats.citizens.active} Active</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Land Records</div>
          <div className="stat-value">{stats.land.total}</div>
          <div className="stat-sub">{stats.land.active} Active</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Business Licences</div>
          <div className="stat-value">{stats.business.total}</div>
          <div className="stat-sub">{stats.business.active} Active</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Expired Licences</div>
          <div className="stat-value">{stats.business.expired}</div>
          <div className="stat-sub">{stats.business.expiring_soon} expiring in 30 days</div>
        </div>
      </div>

      {parseInt(stats.business.expiring_soon) > 0 && (
        <div className="alert alert-warning">
          ⚠️ <strong>{stats.business.expiring_soon}</strong> business licence(s) are expiring within the next 30 days. Please review them.
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 12, color: '#1e3a5f' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="/citizens" className="btn btn-primary">+ Add Citizen</a>
          <a href="/land" className="btn btn-success">+ Add Land Record</a>
          <a href="/business" className="btn btn-outline">+ Add Business Licence</a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
