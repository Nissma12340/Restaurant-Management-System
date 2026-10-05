import React from 'react';
import { PlusCircle, RefreshCw } from 'lucide-react';

export default function Topbar({ activeTab, setActiveTab, onRefresh, isRefreshing }) {
  const getPageMeta = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Overview',
          subtitle: 'Real-time sales, order statistics, and recent activity'
        };
      case 'menu':
        return {
          title: 'Menu Management',
          subtitle: 'Add, view, and organize restaurant dishes and categories'
        };
      case 'create-order':
        return {
          title: 'Create Customer Order',
          subtitle: 'Select food items, adjust quantities, and generate bills'
        };
      case 'orders':
        return {
          title: 'Order Management',
          subtitle: 'Track order statuses from pending preparation to completed'
        };
      default:
        return {
          title: 'Restaurant Management',
          subtitle: 'Admin and point-of-sale portal'
        };
    }
  };

  const meta = getPageMeta();

  return (
    <header className="topbar">
      <div className="page-title">
        <h1>{meta.title}</h1>
        <p>{meta.subtitle}</p>
      </div>

      <div className="topbar-actions">
        {onRefresh && (
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Data"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        )}

        {activeTab !== 'create-order' && (
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('create-order')}
          >
            <PlusCircle size={16} />
            <span>New Order</span>
          </button>
        )}
      </div>
    </header>
  );
}
