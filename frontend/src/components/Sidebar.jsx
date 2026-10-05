import React from 'react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  PlusCircle, 
  ShoppingBag, 
  ReceiptText 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, pendingCount = 0 }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'menu',
      label: 'Menu Management',
      icon: UtensilsCrossed
    },
    {
      id: 'create-order',
      label: 'Create Order',
      icon: PlusCircle
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: pendingCount > 0 ? pendingCount : null
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          🍽️
        </div>
        <div className="brand-info">
          <h2>ChefDesk</h2>
          <span>Restaurant Manager</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  lineHeight: 1
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div>ChefDesk v1.0.0</div>
        <div className="system-status">
          <span className="status-dot"></span>
          <span>System Online • Port 5000</span>
        </div>
      </div>
    </aside>
  );
}
