import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import BillModal from './components/BillModal';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import CreateOrder from './pages/CreateOrder';
import Orders from './pages/Orders';
import { DashboardService } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [selectedOrderForBill, setSelectedOrderForBill] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleCloseToast = () => {
    setToast({ message: '', type: 'success' });
  };

  // Fetch pending orders count for sidebar badge
  const updatePendingCount = useCallback(async () => {
    try {
      const stats = await DashboardService.getStats();
      if (stats && stats.pendingOrders !== undefined) {
        setPendingCount(stats.pendingOrders);
      }
    } catch (err) {
      console.warn('Could not fetch pending count badge:', err.message);
    }
  }, []);

  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount, refreshKey]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    await updatePendingCount();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Data refreshed successfully', 'success');
    }, 400);
  };

  const handleOrderPlaced = () => {
    updatePendingCount();
  };

  const handleOrderUpdated = () => {
    updatePendingCount();
  };

  return (
    <div className="app-container">
      {/* Left Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        pendingCount={pendingCount} 
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Topbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="content-body" key={refreshKey}>
          {activeTab === 'dashboard' && (
            <Dashboard 
              setActiveTab={setActiveTab} 
              onSelectOrderForBill={setSelectedOrderForBill}
            />
          )}

          {activeTab === 'menu' && (
            <Menu 
              showToast={showToast} 
            />
          )}

          {activeTab === 'create-order' && (
            <CreateOrder 
              showToast={showToast}
              onOrderPlaced={handleOrderPlaced}
              onSelectOrderForBill={setSelectedOrderForBill}
            />
          )}

          {activeTab === 'orders' && (
            <Orders 
              showToast={showToast}
              onSelectOrderForBill={setSelectedOrderForBill}
              onOrderUpdated={handleOrderUpdated}
            />
          )}
        </main>
      </div>

      {/* Bill / Thermal Receipt Modal */}
      {selectedOrderForBill && (
        <BillModal 
          order={selectedOrderForBill} 
          onClose={() => setSelectedOrderForBill(null)} 
        />
      )}

      {/* Toast Feedback Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={handleCloseToast} 
      />
    </div>
  );
}
