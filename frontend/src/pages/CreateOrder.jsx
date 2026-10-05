import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  Receipt, 
  CheckCircle, 
  AlertCircle,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { MenuService, OrderService } from '../services/api';

export default function CreateOrder({ showToast, onOrderPlaced, onSelectOrderForBill }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form selection state
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  // Current order items cart
  const [orderItems, setOrderItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Fetch available menu items
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const data = await MenuService.getAll();
        setMenuItems(data);
        if (data.length > 0) {
          setSelectedItemId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Add item from dropdown or quick-picker
  const handleAddItemToOrder = (itemIdToAdd = selectedItemId, qtyToAdd = itemQuantity) => {
    setOrderError('');
    const targetItem = menuItems.find(i => String(i.id) === String(itemIdToAdd));
    if (!targetItem) {
      setOrderError('Please select a valid menu item.');
      return;
    }

    const qty = parseInt(qtyToAdd, 10);
    if (isNaN(qty) || qty <= 0) {
      setOrderError('Quantity must be at least 1.');
      return;
    }

    setOrderItems(prevItems => {
      const existingIndex = prevItems.findIndex(i => String(i.menuItemId) === String(targetItem.id));
      if (existingIndex > -1) {
        // Increment quantity of existing item
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + qty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          subtotal: newQty * updated[existingIndex].price
        };
        return updated;
      } else {
        // Add new line item
        return [
          ...prevItems,
          {
            menuItemId: targetItem.id,
            name: targetItem.name,
            price: Number(targetItem.price),
            quantity: qty,
            subtotal: qty * Number(targetItem.price)
          }
        ];
      }
    });

    // Reset quantity back to 1
    setItemQuantity(1);
  };

  // Adjust quantity of existing order item
  const handleUpdateQuantity = (index, delta) => {
    setOrderItems(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        // Remove if 0
        return updated.filter((_, i) => i !== index);
      }
      updated[index] = {
        ...updated[index],
        quantity: newQty,
        subtotal: newQty * updated[index].price
      };
      return updated;
    });
  };

  // Remove item from order
  const handleRemoveItem = (index) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  // Clear entire cart
  const handleClearOrder = () => {
    setOrderItems([]);
    setOrderError('');
  };

  // Calculate order total
  const orderTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Submit and place order
  const handlePlaceOrder = async () => {
    setOrderError('');

    if (orderItems.length === 0) {
      setOrderError('Please add at least one item to the order.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        items: orderItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal
        })),
        total: orderTotal,
        status: 'Pending'
      };

      const createdOrder = await OrderService.create(payload);

      showToast(`Order #${createdOrder.id} placed successfully!`, 'success');
      
      // Clear cart
      setOrderItems([]);

      // Notify parent to refresh dashboard / badge
      if (onOrderPlaced) onOrderPlaced();

      // Automatically show the generated bill modal
      if (onSelectOrderForBill) {
        onSelectOrderForBill(createdOrder);
      }
    } catch (err) {
      console.error('Failed to place order:', err);
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      setOrderError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Menu Selector */}
        <div className="card">
          <div className="card-header">
            <h3>Select Menu Items</h3>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Choose food & drinks to add
            </span>
          </div>

          <div className="card-body">
            {orderError && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{orderError}</span>
              </div>
            )}

            {/* Standard Dropdown Form as specified */}
            <div style={{ 
              background: '#f8fafc', 
              padding: '1.25rem', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem' 
            }}>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: '#1e293b' }}>
                Add Item Form
              </h4>

              <div className="form-group">
                <label className="form-label" htmlFor="menu-select">
                  Menu Item:
                </label>
                <select
                  id="menu-select"
                  className="form-select"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  disabled={loading || menuItems.length === 0}
                >
                  {menuItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} — ₹{item.price} ({item.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="menu-qty">
                  Quantity:
                </label>
                <input
                  id="menu-qty"
                  type="number"
                  min="1"
                  max="99"
                  className="form-input"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                />
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => handleAddItemToOrder(selectedItemId, itemQuantity)}
                disabled={loading || menuItems.length === 0}
              >
                <Plus size={16} />
                <span>Add to Order</span>
              </button>
            </div>

            {/* Quick 1-click Grid for convenience */}
            <div>
              <h4 style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Quick Add Items
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {menuItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleAddItemToOrder(item.id, 1)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      background: '#ffffff',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#ea580c';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(234,88,12,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.category}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#ea580c', fontSize: '0.9375rem' }}>₹{item.price}</span>
                      <span style={{ 
                        background: '#fff7ed', 
                        color: '#ea580c', 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>+</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Current Order & Bill Calculation */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={20} color="#ea580c" />
              <h3>Current Order</h3>
            </div>
            {orderItems.length > 0 && (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handleClearOrder}
                style={{ color: '#ef4444' }}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="card-body">
            {orderItems.length === 0 ? (
              <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
                <div className="empty-state-icon">🛒</div>
                <h4>Your order is empty</h4>
                <p>Select items from the menu on the left to start building an order.</p>
              </div>
            ) : (
              <div>
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    <span style={{ flex: 2 }}>Item</span>
                    <span style={{ width: '90px', textAlign: 'center' }}>Qty</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>Subtotal</span>
                    <span style={{ width: '32px' }}></span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '340px', overflowY: 'auto' }}>
                  {orderItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '0.5rem 0',
                        borderBottom: '1px dashed #f1f5f9'
                      }}
                    >
                      <div style={{ flex: 2 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          ₹{item.price} each
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div style={{ 
                        width: '90px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '0.35rem' 
                      }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(idx, -1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem'
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontWeight: 600, minWidth: '18px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(idx, 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem'
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div style={{ flex: 1, textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                        ₹{item.subtotal}
                      </div>

                      {/* Remove Button */}
                      <div style={{ width: '32px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'inline-flex'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculation Summary */}
                <div style={{ 
                  marginTop: '1.5rem', 
                  paddingTop: '1rem', 
                  borderTop: '2px dashed #cbd5e1',
                  background: '#fafbfc',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                    <span>Items Count:</span>
                    <span>{orderItems.reduce((acc, i) => acc + i.quantity, 0)} items</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                    <span>Subtotal:</span>
                    <span>₹{orderTotal}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '1.25rem', 
                    fontWeight: 700, 
                    color: '#0f172a',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <span>Total Amount:</span>
                    <span style={{ color: '#ea580c' }}>₹{orderTotal}</span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <div style={{ marginTop: '1.25rem' }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
                    onClick={handlePlaceOrder}
                    disabled={submitting || orderItems.length === 0}
                  >
                    <CheckCircle size={18} />
                    <span>{submitting ? 'Placing Order...' : 'Place Order'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
