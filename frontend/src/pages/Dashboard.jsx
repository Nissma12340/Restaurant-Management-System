import React, { useEffect, useState } from 'react';
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  IndianRupee, 
  Clock, 
  ArrowRight, 
  Receipt, 
  AlertCircle 
} from 'lucide-react';
import { DashboardService } from '../services/api';

export default function Dashboard({ setActiveTab, onSelectOrderForBill }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to load dashboard data. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading restaurant dashboard statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Failed to Load Dashboard</h3>
        <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboardStats}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 4 Summary Cards */}
      <div className="stats-grid">
        {/* CARD 1: Total Menu Items */}
        <div className="stat-card">
          <div className="stat-info">
            <p>Total Menu Items</p>
            <h3>{stats?.totalMenuItems ?? 0}</h3>
          </div>
          <div className="stat-icon-wrapper menu">
            <UtensilsCrossed size={26} />
          </div>
        </div>

        {/* CARD 2: Total Orders */}
        <div className="stat-card">
          <div className="stat-info">
            <p>Total Orders</p>
            <h3>{stats?.totalOrders ?? 0}</h3>
          </div>
          <div className="stat-icon-wrapper orders">
            <ShoppingBag size={26} />
          </div>
        </div>

        {/* CARD 3: Today's Revenue */}
        <div className="stat-card">
          <div className="stat-info">
            <p>Today's Revenue</p>
            <h3>₹{Number(stats?.todayRevenue ?? 0).toLocaleString('en-IN')}</h3>
          </div>
          <div className="stat-icon-wrapper revenue">
            <IndianRupee size={26} />
          </div>
        </div>

        {/* CARD 4: Pending Orders */}
        <div className="stat-card">
          <div className="stat-info">
            <p>Pending Orders</p>
            <h3>{stats?.pendingOrders ?? 0}</h3>
          </div>
          <div className="stat-icon-wrapper pending">
            <Clock size={26} />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Recent Orders</h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
              Latest customer orders placed today
            </p>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('orders')}
          >
            <span>View All Orders</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h4>No orders recorded yet</h4>
              <p>Create your first order to view activity here.</p>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: '1rem' }}
                onClick={() => setActiveTab('create-order')}
              >
                Create First Order
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Items</th>
                    <th>Date & Time</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => {
                    const timeFormatted = order.createdAt
                      ? new Date(order.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Just now';

                    const itemsCount = order.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0;
                    const itemsSummary = order.items?.map(i => `${i.name} (${i.quantity})`).join(', ') || 'No items';

                    return (
                      <tr key={order.id}>
                        <td>
                          <strong>#{order.id}</strong>
                        </td>
                        <td style={{ maxWidth: '300px' }}>
                          <span style={{ fontSize: '0.875rem', color: '#334155' }} title={itemsSummary}>
                            {itemsSummary.length > 40 ? `${itemsSummary.slice(0, 40)}...` : itemsSummary}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {timeFormatted}
                        </td>
                        <td>
                          <strong style={{ color: '#0f172a' }}>₹{order.total}</strong>
                        </td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onSelectOrderForBill(order)}
                            title="View customer bill"
                          >
                            <Receipt size={14} />
                            <span>Bill</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
