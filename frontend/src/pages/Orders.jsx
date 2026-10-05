import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  ChevronDown
} from 'lucide-react';
import { OrderService } from '../services/api';

const STATUS_OPTIONS = ['Pending', 'Preparing', 'Completed'];

export default function Orders({ showToast, onSelectOrderForBill, onOrderUpdated }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await OrderService.getAll();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Unable to load orders. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const updatedOrder = await OrderService.updateStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');

      if (onOrderUpdated) {
        onOrderUpdated();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Failed to update order status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    const matchesSearch = 
      String(order.id).includes(searchQuery) ||
      (order.items && order.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Filter and Search bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem' 
      }}>
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', ...STATUS_OPTIONS].map(status => {
            const count = status === 'All' 
              ? orders.length 
              : orders.filter(o => o.status === status).length;
            const isSelected = selectedStatus === status;

            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '9999px', padding: '0.4rem 1rem' }}
              >
                <span>{status}</span>
                <span style={{ 
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#e2e8f0', 
                  color: isSelected ? '#ffffff' : '#475569',
                  borderRadius: '9999px', 
                  padding: '0.1rem 0.45rem', 
                  fontSize: '0.75rem',
                  fontWeight: 700 
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search by Order ID or Food Item */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search by #ID or food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Failed to Load Orders</h3>
          <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchOrders}>
            Try Again
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3>Orders List ({filteredOrders.length})</h3>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Showing {filteredOrders.length} of {orders.length} total orders
            </span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {filteredOrders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <h4>No orders found</h4>
                <p>
                  {selectedStatus !== 'All' || searchQuery
                    ? 'No orders match your filter criteria.'
                    : 'No customer orders have been placed yet.'}
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '12%' }}>Order #</th>
                      <th style={{ width: '38%' }}>Items Summary</th>
                      <th style={{ width: '15%' }}>Date & Time</th>
                      <th style={{ width: '12%' }}>Total</th>
                      <th style={{ width: '13%' }}>Status</th>
                      <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const totalQty = order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0;
                      const formattedDate = order.createdAt 
                        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Today';

                      return (
                        <tr key={order.id}>
                          <td>
                            <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                              #{order.id}
                            </strong>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>
                                {totalQty} {totalQty === 1 ? 'item' : 'items'}
                              </span>
                              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                                {order.items?.map((item, idx) => (
                                  <span key={idx}>
                                    {item.name} × {item.quantity}
                                    {idx < order.items.length - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                            {formattedDate}
                          </td>
                          <td>
                            <strong style={{ color: '#0f172a', fontSize: '1rem' }}>
                              ₹{order.total}
                            </strong>
                          </td>
                          <td>
                            {/* Status Selector dropdown */}
                            <select
                              value={order.status}
                              disabled={updatingId === order.id}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="form-select"
                              style={{
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                width: '125px',
                                backgroundColor: 
                                  order.status === 'Completed' ? 'var(--status-done-bg)' :
                                  order.status === 'Preparing' ? 'var(--status-prep-bg)' : 
                                  'var(--status-pending-bg)',
                                color: 
                                  order.status === 'Completed' ? 'var(--status-done-text)' :
                                  order.status === 'Preparing' ? 'var(--status-prep-text)' : 
                                  'var(--status-pending-text)',
                                borderColor: 
                                  order.status === 'Completed' ? 'var(--status-done-border)' :
                                  order.status === 'Preparing' ? 'var(--status-prep-border)' : 
                                  'var(--status-pending-border)'
                              }}
                            >
                              {STATUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt} style={{ background: '#fff', color: '#0f172a' }}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onSelectOrderForBill(order)}
                              title="View Bill / Receipt"
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
      )}
    </div>
  );
}
