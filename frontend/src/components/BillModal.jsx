import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';

export default function BillModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : new Date().toLocaleString('en-IN');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3>Customer Bill / Receipt</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ background: '#f8fafc', padding: '1.5rem 1rem' }}>
          <div className="receipt-wrapper">
            <div className="receipt-header">
              <h2>CHEFDESK RESTAURANT</h2>
              <p>Delicious Food & Friendly Service</p>
              <p style={{ fontSize: '0.75rem', marginTop: '2px' }}>GSTIN: 07AAAAA0000A1Z5</p>
            </div>

            <div className="receipt-meta">
              <div>
                <strong>Order #{order.id}</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formattedDate}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`status-badge ${order.status}`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="receipt-items">
              <div className="receipt-row" style={{ fontWeight: 700, borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.35rem' }}>
                <span style={{ flex: 2 }}>Item</span>
                <span style={{ width: '40px', textAlign: 'center' }}>Qty</span>
                <span style={{ flex: 1, textAlign: 'right' }}>Amount</span>
              </div>

              {order.items && order.items.map((item, index) => (
                <div key={index} className="receipt-row">
                  <span style={{ flex: 2 }}>{item.name}</span>
                  <span style={{ width: '40px', textAlign: 'center' }}>{item.quantity}</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>₹{item.subtotal || (item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-total-row">
              <span>TOTAL AMOUNT</span>
              <span>₹{order.total}</span>
            </div>

            <div className="receipt-footer">
              <p>Thank you for dining with us!</p>
              <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Please visit again soon</p>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={16} />
            Print Receipt
          </button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
